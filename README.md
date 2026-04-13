# 주보라 (Jubora) – 현수막·배너 온라인 제작 사이트

현수막·배너·X배너·실사출력을 온라인으로 주문할 수 있는 정적 웹사이트입니다.

---

## 📁 프로젝트 구조

```
banner-site/
├── index.html          # 메인 홈페이지
├── templates.html      # 디자인 템플릿 갤러리
├── editor.html         # 온라인 편집기
├── order.html          # 견적·주문 페이지
├── 404.html            # 에러 페이지
│
├── css/
│   ├── style.css       # 공통 스타일 (헤더·푸터·컴포넌트)
│   ├── index.css       # 홈 전용 스타일
│   ├── templates.css   # 템플릿 페이지 스타일
│   ├── editor.css      # 편집기 스타일
│   └── order.css       # 주문 페이지 스타일
│
├── js/
│   ├── script.js            # 공통 JS (헤더·네비게이션)
│   └── cloudinary-config.js # Cloudinary 이미지 설정 + 디자인 데이터
│
├── assets/
│   └── logo.svg        # 브랜드 로고 SVG
│
├── favicon.svg         # 파비콘
├── netlify.toml        # Netlify 배포 설정
└── _redirects          # Netlify 리다이렉트 규칙
```

---

## 🚀 Netlify 배포 방법

### 방법 1 — 드래그 앤 드롭 (가장 쉬움)

1. [netlify.com](https://netlify.com) 접속 → 무료 계정 가입
2. 대시보드에서 **"Add new site"** → **"Deploy manually"** 클릭
3. `banner-site` 폴더 전체를 화면으로 **드래그 앤 드롭**
4. 잠시 기다리면 `랜덤이름.netlify.app` 주소로 즉시 배포 완료

> 💡 파일이 바뀌면 같은 방법으로 폴더를 다시 드래그하면 됩니다.

---

### 방법 2 — GitHub 연동 (자동 배포 추천)

```bash
# 1. Git 초기화
cd banner-site
git init
git add .
git commit -m "첫 배포"

# 2. GitHub에서 새 저장소 만들기 (예: jubora-site)
git remote add origin https://github.com/YOUR_ID/jubora-site.git
git push -u origin main
```

3. Netlify → **"Add new site"** → **"Import an existing project"**
4. GitHub 연결 → 저장소 선택
5. 설정:
   - Build command: *(비워두기)*
   - Publish directory: `.`
6. **"Deploy site"** 클릭

이후 `main` 브랜치에 push할 때마다 자동으로 재배포됩니다.

---

## 🌐 커스텀 도메인 연결

1. Netlify 사이트 대시보드 → **"Domain settings"**
2. **"Add custom domain"** → `jubora.kr` 입력
3. 도메인 등록 업체(가비아, 후이즈 등)에서 DNS 설정:

| 타입 | 이름 | 값 |
|------|------|----|
| A    | @    | `75.2.60.5` |
| CNAME | www | `랜덤이름.netlify.app` |

4. DNS 전파 대기 (보통 10분 ~ 48시간)

---

## 🔒 SSL(HTTPS) 자동 적용

커스텀 도메인 연결 후 Netlify가 **Let's Encrypt** 인증서를 자동으로 발급·갱신합니다.

- 별도 설정 불필요
- 인증서 만료 전 자동 갱신
- Netlify 대시보드 → **"HTTPS"** 탭에서 상태 확인 가능

---

## ⚙️ 주요 설정 파일

### `netlify.toml`
- 빌드 없는 정적 배포 설정
- CSS/JS: **1년** 브라우저 캐시
- HTML: **캐시 없음** (항상 최신 버전 제공)
- 보안 헤더 자동 적용 (XSS 방지, 클릭재킹 방지)

### `_redirects`
- 없는 URL → `404.html` 리다이렉트

---

## 🛠 Google Forms 연동 마무리

`order.html` 내 인라인 스크립트에서 아래 두 항목을 채워야 주문 접수가 됩니다:

```js
// 1. 구글 폼 URL (viewform → formResponse)
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/[FORM_ID]/formResponse';

// 2. 각 항목 entry ID (폼 소스에서 entry.숫자 확인)
const FORM_ENTRIES = {
  name:       'entry.실제ID',
  phone:      'entry.실제ID',
  // ...
};
```

entry ID 확인: 구글 폼 미리보기 → 브라우저 소스 보기(Ctrl+U) → `entry.` 검색

---

## 📊 Cloudinary 이미지 설정

`js/cloudinary-config.js` 파일 상단의 Cloud Name을 확인하세요:

```js
const CLOUDINARY = {
  cloudName: 'dquicfvbk',  // ← Cloudinary 대시보드 Cloud Name
  ...
};
```

실제 상품 이미지는 Cloudinary 대시보드에 업로드한 후 `designs` 배열의 `image` 필드에 public ID를 입력합니다.

---

## 📞 문의

- 카카오톡: [주보라 채널](https://pf.kakao.com/jubora)
- 이메일: mm1895@naver.com
- 전화: 010-7737-1895
# 2026-jubora
