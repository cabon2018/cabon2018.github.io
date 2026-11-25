# 김영범 Photography — 사이트 설명서

사이트 주소: **https://cabon2018.github.io**  (깃허브에 올린 뒤부터 열립니다)

---

## 1. 폴더에 뭐가 들어 있나

| 파일·폴더 | 하는 일 |
|---|---|
| `index.html` | 메인 페이지. 글 내용(소개, 촬영 안내 문구)을 고치는 곳 |
| `privacy.html` | 개인정보처리방침 페이지 |
| `photos.json` | **사진 목록.** 사진을 추가할 때 고치는 파일 |
| `css/style.css` | 색·글꼴·여백 등 보이는 모양 |
| `js/main.js` | 분류 버튼, 사진 크게 보기, 전환 이벤트 |
| `images/` | 웹용 큰 사진 (긴 변 2000px) |
| `images/thumbs/` | 갤러리 미리보기용 작은 사진 (긴 변 800px) |
| `사진넣기.sh` | 사진을 자동으로 줄이고 넣어 주는 도구 |
| `tools/` | 위 도구가 쓰는 보조 프로그램 (직접 쓸 일 없음) |
| `sitemap.xml`, `robots.txt` | 검색 엔진에게 페이지 위치를 알려 주는 파일 |
| `.nojekyll` | 깃허브가 파일을 그대로 올리게 하는 표시 (지우지 마세요) |

---

## 2. 사진 추가하는 법 (가장 자주 쓰게 될 것)

### 방법 A — 자동 (추천)

터미널에 아래 두 줄을 차례로 붙여넣으세요. 두 번째 줄 끝의 `portrait` 자리에
`portrait`(인물) / `couple`(커플) / `street`(거리) 중 하나를 쓰면 됩니다.

```
cd "/Users/beom/Desktop/Claude Project/portfolio-site"
./사진넣기.sh ~/Desktop/내보낸사진 portrait
```

이 명령이 알아서 해 주는 일:

1. 긴 변 2000px 짜리 웹용 사진을 `images/` 에 넣습니다
2. 긴 변 800px 짜리 미리보기 사진을 `images/thumbs/` 에 넣습니다
3. **위치정보(GPS)와 촬영정보(EXIF)를 지웁니다**
4. `photos.json` 에 목록을 추가합니다

> 원본 사진은 읽기만 합니다. 고치거나 지우지 않습니다.

끝나면 `photos.json` 을 열어 `alt` (사진 설명)을 사진 내용에 맞게 고치면 좋습니다.
검색 엔진과 눈이 불편한 분에게 읽히는 글이라 검색에도 도움이 됩니다.

### 방법 B — 손으로

1. 사진을 직접 줄여서 `images/01.jpg`, `images/thumbs/01.jpg` 처럼 넣습니다
2. `photos.json` 의 `photos` 목록에 한 묶음을 추가합니다

```json
{ "file": "01.jpg", "category": "portrait", "alt": "한강에서 찍은 인물 스냅" }
```

- 묶음과 묶음 사이에는 쉼표(,)가 필요합니다
- 맨 마지막 묶음 뒤에는 쉼표를 붙이지 마세요 (붙이면 갤러리가 안 나옵니다)

---

## 3. 내 컴퓨터에서 미리 보는 법

```
cd "/Users/beom/Desktop/Claude Project/portfolio-site"
python3 -m http.server 8000
```

그 다음 브라우저에서 **http://localhost:8000** 을 엽니다.
그만 볼 때는 터미널에서 `Control + C` 를 누릅니다.

> 주의: `index.html` 파일을 더블클릭해서 열면 갤러리가 안 나옵니다.
> 브라우저가 보안상 `photos.json` 을 읽지 못하기 때문입니다. 꼭 위 방법으로 보세요.

---

## 4. GA4 (구글 애널리틱스) 켜는 법

1. https://analytics.google.com 에서 속성을 만들고 **측정 ID** 를 받습니다 (`G-` 로 시작)
2. `index.html` 을 열어 맨 위쪽 **② GA4** 라고 적힌 부분을 찾습니다
3. 그 아래 블록을 감싼 주석 표시를 지웁니다
   - 블록 맨 앞의 `<!--` 한 줄과
   - 블록 맨 끝의 `-->` 한 줄을 지우면 됩니다
4. 안에 있는 `G-XXXXXXXXXX` **두 곳**을 내 측정 ID 로 바꿉니다
5. `privacy.html` 은 이미 GA4 를 쓴다고 적혀 있어서 따로 고칠 것이 없습니다

### 전환(문의) 추적

GA4 를 켜면 아래 버튼을 누를 때 `generate_lead` 이벤트가 자동으로 갑니다.
`method` 값으로 어떤 버튼인지 구분됩니다.

| 버튼 | method 값 |
|---|---|
| 첫 화면 "촬영 문의하기" | `hero_email` |
| 문의 영역 "이메일로 문의하기" | `contact_email` |
| 문의 영역 "인스타그램 보기" | `contact_instagram` |

GA4 에서 **관리 > 이벤트 > 주요 이벤트로 표시** 를 켜면 전환으로 집계됩니다.

---

## 5. 네이버 쪽 설정

### 서치어드바이저 (검색 노출)

1. https://searchadvisor.naver.com 에서 사이트를 등록합니다
2. 인증 방법 중 **HTML 태그** 를 고르면 `content="..."` 값을 줍니다
3. `index.html` 맨 위 **① 네이버 서치어드바이저** 부분의 주석 표시를 지우고 값을 넣습니다
4. 사이트맵으로 `https://cabon2018.github.io/sitemap.xml` 을 제출합니다

### 전환 추적 스크립트

1. https://searchad.naver.com > 도구 > 전환추적 에서 **공통 스크립트** 를 받습니다
2. `index.html` **맨 아래** ③ 부분의 주석 표시를 지우고 받은 코드를 붙여넣습니다
3. 버튼 클릭까지 전환으로 보내려면 `js/main.js` 안의 "네이버 검색광고 전환 추적" 주석도 함께 풉니다

### 비즈채널 등록 (파워링크 연습용)

네이버 광고 관리자 > **정보 관리 > 비즈채널 관리 > 채널 추가 > 웹사이트**
→ 주소 칸에 `https://cabon2018.github.io` 입력 → 검토 요청

---

## 6. 고친 내용을 다시 올리는 법

터미널에서 아래 세 줄을 차례로 실행합니다.

```
cd "/Users/beom/Desktop/Claude Project/portfolio-site"
git add -A
git commit -m "사진 추가" && git push
```

`"사진 추가"` 자리에는 무엇을 바꿨는지 짧게 적으면 됩니다.
올리고 나서 실제 주소에 반영되기까지 **1~2분** 걸립니다.

---

## 7. 자주 고치게 될 곳

| 바꾸고 싶은 것 | 고칠 파일 | 찾을 글자 |
|---|---|---|
| 사진 추가·삭제 | `photos.json` | — |
| 촬영 시간·보정본·가격 | `index.html` | `촬영 안내` 주석 |
| 소개 글 | `index.html` | `소개` 주석 |
| 이메일 주소 | `index.html` | `dudqja0218@gmail.com` |
| 인스타그램 주소 | `index.html` | `instagram.com/ob2om` |
| 색깔 | `css/style.css` | 맨 위 `:root` |
