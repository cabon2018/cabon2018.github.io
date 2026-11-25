#!/bin/bash
# ============================================================
#  사진 넣기 — 라이트룸에서 내보낸 JPG 를 웹용으로 줄여 사이트에 넣습니다.
#
#  쓰는 법 (터미널에서):
#     cd "/Users/beom/Desktop/Claude Project/portfolio-site"
#     ./사진넣기.sh ~/사진폴더경로 portrait
#
#  두 번째 값(분류)은 portrait(인물) / couple(커플) / street(거리) 중 하나입니다.
#
#  하는 일:
#    1) 긴 변 2000px 짜리 큰 사진을 images/ 에 넣습니다
#    2) 긴 변 800px 짜리 미리보기 사진을 images/thumbs/ 에 넣습니다
#    3) 두 사진 모두에서 위치정보(GPS)와 촬영정보(EXIF)를 지웁니다
#    4) photos.json 에 사진 목록을 자동으로 추가합니다
#
#  ※ 원본 사진은 읽기만 합니다. 절대 고치거나 지우지 않습니다.
# ============================================================
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
SRC="${1:-}"
CAT="${2:-}"

if [ -z "$SRC" ] || [ -z "$CAT" ]; then
  echo "쓰는 법: ./사진넣기.sh <사진이_있는_폴더> <분류>"
  echo "분류는 portrait, couple, street 중 하나입니다."
  exit 1
fi

if [ ! -d "$SRC" ]; then
  echo "폴더를 찾을 수 없습니다: $SRC"
  exit 1
fi

case "$CAT" in
  portrait|couple|street) ;;
  *) echo "분류는 portrait, couple, street 중 하나여야 합니다. (받은 값: $CAT)"; exit 1 ;;
esac

SRGB="/System/Library/ColorSync/Profiles/sRGB Profile.icc"
mkdir -p "$HERE/images/thumbs"

# 이미 들어 있는 사진 중 가장 큰 번호를 찾아 그 다음 번호부터 매깁니다
NEXT=1
for f in "$HERE"/images/[0-9][0-9].jpg; do
  [ -e "$f" ] || continue
  n=$(basename "$f" .jpg)
  n=$((10#$n))
  [ "$n" -ge "$NEXT" ] && NEXT=$((n + 1))
done

ADDED=()
echo "원본 폴더: $SRC"
echo "분류: $CAT"
echo "----------------------------------------"

shopt -s nullglob nocaseglob
for src in "$SRC"/*.jpg "$SRC"/*.jpeg; do
  NAME=$(printf "%02d.jpg" "$NEXT")
  BIG="$HERE/images/$NAME"
  THUMB="$HERE/images/thumbs/$NAME"

  # 1) 큰 사진: 긴 변 2000px
  sips -Z 2000 -s format jpeg -s formatOptions 76 --matchTo "$SRGB" "$src" --out "$BIG" >/dev/null
  # 2) 미리보기: 긴 변 800px
  sips -Z 800  -s format jpeg -s formatOptions 68 --matchTo "$SRGB" "$src" --out "$THUMB" >/dev/null
  # 3) 위치정보·촬영정보 지우기
  python3 "$HERE/tools/strip_exif.py" "$BIG" "$THUMB" >/dev/null

  SIZE=$(du -h "$BIG" | cut -f1 | tr -d ' ')
  echo "  $NAME  <- $(basename "$src")   (큰 사진 $SIZE)"
  ADDED+=("$NAME")
  NEXT=$((NEXT + 1))
done
shopt -u nullglob nocaseglob

if [ ${#ADDED[@]} -eq 0 ]; then
  echo "그 폴더에 JPG 파일이 없습니다."
  exit 1
fi

# 4) photos.json 에 추가
python3 "$HERE/tools/photos_add.py" "$CAT" "${ADDED[@]}"

echo "----------------------------------------"
echo "사진 ${#ADDED[@]}장을 넣었습니다."
echo "확인: 터미널에서 아래를 실행하고 http://localhost:8000 을 여세요."
echo "  cd \"$HERE\" && python3 -m http.server 8000"
