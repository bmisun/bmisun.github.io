// slug는 src/components/<slug>.md 파일명과 일치해야 함
// 파일명은 옛 이름(components) 그대로 두고, 화면에는 "컴포넌트"로 노출
module.exports = [
  {
    slug: "accordion",
    title: "아코디언",
    summary: "버튼 + ARIA, max-height 트랜지션, 이벤트 위임/Map 캐싱 최적화",
    tags: ["접근성", "성능 최적화", "GSAP"],
  },
  {
    slug: "tabs",
    title: "탭",
    summary: "role=tablist 등 ARIA, 키보드 화살표 순환, 슬라이딩 인디케이터",
    tags: ["접근성", "GSAP"],
  },
  {
    slug: "modal",
    title: "모달",
    summary: "포커스 트랩, ESC/배경 클릭 닫기, 트리거로 포커스 복귀",
    tags: ["접근성", "GSAP"],
  },
  {
    slug: "dropdown",
    title: "드롭다운",
    summary: "aria-haspopup/listbox, roving 포커스, 방향키 순환, 커밋/취소 구조",
    tags: ["접근성", "GSAP"],
  },
  {
    slug: "form-validation",
    title: "폼 검증",
    summary: "HTML5 내장 검증 + 커스텀 규칙 하이브리드, 필드 자동 수집, 크로스필드 검증",
    tags: ["폼", "접근성"],
  },
  {
    slug: "slider",
    title: "슬라이더 / 캐러셀",
    summary: "순환 이동, 다중 인스턴스 대비, 자동재생+hover 일시정지, 키보드 지원",
    tags: ["성능 최적화", "GSAP"],
  },
];
