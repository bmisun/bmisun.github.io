# portfolio-site

11ty(Eleventy) 기반 포트폴리오 사이트. 반응형 마크업, 웹 접근성, GSAP 마이크로 인터랙션을 중심으로 직접 만든 컴포넌트 6개(아코디언/탭/모달/드롭다운/폼 검증/슬라이더)를 라이브러리 형태로 모아두고, 경력 소개와 프로젝트 단위 케이스 스터디(이 포트폴리오 사이트 자체)도 함께 담고 있습니다.

## 시작하기

```bash
npm install
npm run dev
```

`npm run dev`로 로컬 서버를 띄우고 `http://localhost:8080`에서 확인. 배포용 정적 파일은 `npm run build`로 `_site/`에 생성됩니다.

스타일은 Sass(`src/assets/scss/*.scss`)로 작성하고, `npm run dev`/`npm run build` 둘 다 내부적으로
`sass`가 `src/assets/css/*.css`로 컴파일한 뒤 그 결과물을 11ty가 그대로 복사합니다. 즉
`src/assets/css/*.css`는 자동 생성 파일이라 직접 수정하면 다음 빌드 때 덮어써집니다 — 스타일을
고치려면 항상 `.scss` 쪽을 수정하세요.

## 폴더 구조

```
portfolio-site/
├── .eleventy.js              # 11ty 설정 (입출력 폴더, 템플릿 엔진, syntax highlight 플러그인)
├── package.json
└── src/
    ├── _data/
    │   ├── site.js            # 이름/직함/이메일 등 전역 정보
    │   ├── career.js          # 경력 아코디언 데이터 (프리랜서/정규직/강의)
    │   ├── contact.js         # 소개 문단 + 연락 채널
    │   ├── components.js     # 컴포넌트 6개 메타데이터 (제목/슬러그/요약/태그)
    │   └── caseStudies.js    # 케이스 스터디 메타데이터 (프로젝트 단위, 지금은 포트폴리오 사이트 1개)
    ├── _includes/
    │   ├── layouts/
    │   │   ├── base.njk          # 공통 뼈대 (헤더/네비/푸터, 다크모드 FOUC 방지, 메타 태그)
    │   │   ├── components.njk    # 컴포넌트 상세 페이지 템플릿 (레이아웃 체이닝으로 base 상속)
    │   │   └── case-study.njk    # 케이스 스터디 상세 페이지 템플릿 (라이브 데모 없이 본문 위주)
    │   ├── demos/                 # 각 컴포넌트 데모 마크업(스크립트 제외) — 상세 페이지 + 홈 미리보기 공용
    │   ├── demo-scripts/          # 각 컴포넌트 데모 스크립트(DOMContentLoaded로 감쌈) — 상세 페이지 전용
    │   └── partials/
    │       ├── header.njk
    │       ├── nav.njk
    │       └── footer.njk
    ├── assets/
    │   ├── scss/
    │   │   ├── style.scss              # 전역 스타일 원본 (라이트/다크 디자인 토큰, BEM)
    │   │   └── demo-components.scss    # 컴포넌트 데모 전용 스타일 원본
    │   ├── css/                # ↑ scss를 컴파일한 결과물(자동 생성, 직접 수정 금지)
    │   ├── js/main.js         # 다크모드 토글, GSAP 스크롤 인터랙션, 헤더 높이 보정
    │   └── images/            # 파비콘 등 (스크린샷은 추후 추가 예정)
    ├── components/          # 컴포넌트 원고 (마크다운, components.njk 레이아웃 사용)
    │   │                       # 디렉터리 데이터 파일(components.11tydata.js)로 URL을
    │   │                       # /components/<slug>/ 로 통일한다.
    │   ├── accordion.md
    │   ├── tabs.md
    │   ├── modal.md
    │   ├── dropdown.md
    │   ├── form-validation.md
    │   └── slider.md
    ├── case-studies/         # 케이스 스터디 원고 (프로젝트 단위, case-study.njk 레이아웃 사용)
    │   │                       # index.njk가 목록 페이지(/case-studies/), 나머지 .md가 각 상세 페이지
    │   └── portfolio-site.md  # 이 포트폴리오 사이트 자체에 대한 케이스 스터디 (다음 항목: 미니프로젝트)
    └── index.njk              # 홈 (히어로 + 컴포넌트 라이브러리 카드 목록 + 경력 + 소개)
```

## 배포

GitHub Pages로 배포합니다. `main` 브랜치에 푸시하면 GitHub Actions가 자동으로 빌드해 배포합니다.

## 이후 계획

- 미니프로젝트(관리자 대시보드)는 사이트 마무리 후 케이스 스터디 목록(`/case-studies/`)에 두 번째 항목으로 추가 예정
- 컴포넌트에 실제 스크린샷/데모 GIF 추가
