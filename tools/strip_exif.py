#!/usr/bin/env python3
"""JPG 파일에서 EXIF(촬영 정보)와 GPS(위치 정보)를 지웁니다.

파이썬 기본 기능만 쓰므로 따로 설치할 것이 없습니다.
JPEG 파일 안의 APPn 구역(EXIF, GPS, XMP, 썸네일 등이 들어 있는 곳)을 통째로
빼고 다시 저장합니다. 사진의 픽셀(보이는 그림)은 전혀 건드리지 않습니다.

쓰는 법:  python3 strip_exif.py 파일.jpg [파일2.jpg ...]
"""
import sys

SOI = b"\xff\xd8"          # 파일 시작
SOS = b"\xff\xda"          # 그림 데이터 시작 (여기부터는 손대지 않음)


def strip(path):
    with open(path, "rb") as f:
        data = f.read()

    if not data.startswith(SOI):
        return False, "JPEG 파일이 아닙니다"

    out = bytearray(SOI)
    i = 2
    removed = 0

    while i < len(data) - 1:
        if data[i] != 0xFF:
            # 예상과 다른 구조 — 안전하게 남은 부분을 그대로 붙입니다
            out += data[i:]
            break

        marker = data[i + 1]

        # 그림 데이터 시작 → 여기부터 끝까지 그대로
        if marker == 0xDA:
            out += data[i:]
            break

        # 길이가 없는 표시들
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            out += data[i:i + 2]
            i += 2
            continue

        if i + 4 > len(data):
            out += data[i:]
            break

        seg_len = (data[i + 2] << 8) | data[i + 3]
        seg_end = i + 2 + seg_len

        # APP0 ~ APP15 (0xE0~0xEF): EXIF·GPS·XMP·IPTC 가 들어 있는 곳 → 버립니다
        # COM (0xFE): 주석 → 버립니다
        if 0xE0 <= marker <= 0xEF or marker == 0xFE:
            removed += 1
        else:
            out += data[i:seg_end]

        i = seg_end

    with open(path, "wb") as f:
        f.write(bytes(out))

    return True, "구역 %d개 제거" % removed


def has_metadata(path):
    """EXIF/GPS 구역이 아직 남아 있는지 확인합니다."""
    with open(path, "rb") as f:
        data = f.read()
    i = 2
    while i < len(data) - 1:
        if data[i] != 0xFF:
            return False
        marker = data[i + 1]
        if marker == 0xDA:
            return False
        if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
            i += 2
            continue
        if i + 4 > len(data):
            return False
        if 0xE0 <= marker <= 0xEF or marker == 0xFE:
            return True
        i += 2 + ((data[i + 2] << 8) | data[i + 3])
    return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    fail = 0
    for p in sys.argv[1:]:
        try:
            ok, msg = strip(p)
        except Exception as exc:                      # noqa: BLE001
            ok, msg = False, str(exc)
        if ok and has_metadata(p):
            ok, msg = False, "지운 뒤에도 메타데이터가 남아 있습니다"
        print(("  OK   " if ok else "  실패 ") + p + " — " + msg)
        if not ok:
            fail += 1
    sys.exit(1 if fail else 0)
