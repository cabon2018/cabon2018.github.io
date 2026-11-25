#!/usr/bin/env python3
"""photos.json 에 사진 목록을 추가합니다. (사진넣기.sh 가 자동으로 부릅니다)

쓰는 법: python3 photos_add.py <분류> <파일이름...>
"""
import json
import os
import sys

LABEL = {"portrait": "인물", "couple": "커플", "street": "거리"}

here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path = os.path.join(here, "photos.json")

if len(sys.argv) < 3:
    print(__doc__)
    sys.exit(1)

category = sys.argv[1]
files = sys.argv[2:]

with open(path, encoding="utf-8") as f:
    data = json.load(f)

photos = data.setdefault("photos", [])
existing = {p.get("file") for p in photos}

added = 0
for name in files:
    if name in existing:
        continue
    photos.append({
        "file": name,
        "category": category,
        "alt": LABEL.get(category, category) + " 촬영 사진",
    })
    added += 1

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")

print("  photos.json 에 %d장 추가 (전체 %d장)" % (added, len(photos)))
print("  ※ photos.json 을 열어 alt(사진 설명)을 사진 내용에 맞게 고치면 더 좋습니다.")
