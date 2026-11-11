// 다크모드 토글, GSAP 스크롤 인터랙션, 헤더 높이 보정
import { setupAccordionSingle, setupAccordionMultiple } from "./components/accordion.js";
import { setupTabs } from "./components/tabs.js";
import { setupModal } from "./components/modal.js";
import { setupDropdown } from "./components/dropdown.js";
import { setupSlider } from "./components/slider.js";
import { setupFormValidation } from "./components/form-validation.js";

(function () {
  // 즉시실행함수로 감쌈: 개발 서버 라이브 리로드가 스크립트를 재주입하면
  // const 중복 선언과 ScrollTrigger 리셋 문제가 생김
  if (window.__portfolioMainLoaded) return;
  window.__portfolioMainLoaded = true;

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupHeaderOffset();
  setupHeroIntro();
  setupHeroGlow();

  setupAccordionMultiple(".career");
  setupAccordionSingle(".component-demo__group--single");
  setupAccordionMultiple(".component-demo__group--multiple");
  setupTabs();
  setupModal();
  setupDropdown();
  setupSlider();
  setupFormValidation("#signup-form", {
    userID: {
      validate: (input) => /^[a-zA-Z][a-zA-Z0-9]{3,11}$/.test(input.value),
      errorMessage: "올바른 아이디 형식이 아닙니다.",
      successMessage: "올바른 아이디 형식입니다.",
    },
    userPW: {
      validate: (input) =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(input.value),
      errorMessage: "올바른 비밀번호 형식이 아닙니다.",
      successMessage: "올바른 비밀번호 형식입니다.",
    },
    name: {
      validate: (input) => /^[가-힣]{2,10}$/.test(input.value),
      errorMessage: "올바른 이름 형식이 아닙니다.",
      successMessage: "올바른 이름 형식입니다.",
    },
    userPWconfirm: {
      validate: (input) =>
        input.value.length > 0 && input.value === document.getElementById("userPW").value,
      errorMessage: "비밀번호가 일치하지 않습니다.",
      successMessage: "비밀번호가 일치합니다.",
    },
  });
  // 모달 안 폼은 id에 -modal 접미사가 붙으므로 규칙 키도 접미사로 다시 전달
  // (호출부가 둘뿐이라 공통 객체로 추상화하지 않음)
  setupFormValidation("#signup-form-modal", {
    "userID-modal": {
      validate: (input) => /^[a-zA-Z][a-zA-Z0-9]{3,11}$/.test(input.value),
      errorMessage: "올바른 아이디 형식이 아닙니다.",
      successMessage: "올바른 아이디 형식입니다.",
    },
    "userPW-modal": {
      validate: (input) =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(input.value),
      errorMessage: "올바른 비밀번호 형식이 아닙니다.",
      successMessage: "올바른 비밀번호 형식입니다.",
    },
    "name-modal": {
      validate: (input) => /^[가-힣]{2,10}$/.test(input.value),
      errorMessage: "올바른 이름 형식이 아닙니다.",
      successMessage: "올바른 이름 형식입니다.",
    },
    "userPWconfirm-modal": {
      validate: (input) =>
        input.value.length > 0 &&
        input.value === document.getElementById("userPW-modal").value,
      errorMessage: "비밀번호가 일치하지 않습니다.",
      successMessage: "비밀번호가 일치합니다.",
    },
  });

  setupScrollReveal();
  setupHashScrollFix();
  setupContentToc();
});

// sticky 헤더 실측 높이를 --header-height로 전달 (모바일/데스크톱 패딩이 달라 고정값 불가)
function setupHeaderOffset() {
  const header = document.querySelector(".app-header");
  if (!header) return;
  const sync = () => {
    document.documentElement.style.setProperty("--header-height", header.offsetHeight + "px");
  };
  sync();
  window.addEventListener("resize", sync);
}

// 다른 페이지에서 #앵커로 진입하면 ScrollTrigger 초기화가 스크롤을 맨 위로 되돌려서,
// load 이후 해시로 한 번 더 이동
function setupHashScrollFix() {
  if (!location.hash) return;
  window.addEventListener("load", () => {
    const target = document.querySelector(location.hash);
    if (target) target.scrollIntoView();
  });
}

// 색상 전환은 GSAP 대신 CSS transition. JS는 data-theme 결정과 localStorage 저장만
function setupThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  // 아이콘은 현재 테마, aria-label은 누르면 일어날 동작을 안내
  const syncLabel = () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    toggle.setAttribute("aria-label", isDark ? "라이트 모드로 전환" : "다크 모드로 전환");
  };
  syncLabel();

  toggle.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch (e) {
    }
    syncLabel();
  });
}

const HERO_HIGHLIGHT_WORDS = ["다양한", "깊은"];

function setupHeroIntro() {
  const titleEl = document.querySelector("[data-hero-title]");
  const subtitleEl = document.querySelector("[data-hero-subtitle]");
  if (!titleEl) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 글로우 오버레이(background-clip: text)는 브라우저 렌더링 문제로 제외, 글자 정착 효과만 사용
  const words = titleEl.textContent.trim().split(/\s+/);
  titleEl.innerHTML = words
    .map((w) => {
      if (!HERO_HIGHLIGHT_WORDS.includes(w)) {
        return `<span class="word"><span>${w}</span></span>`;
      }
      const letters = [...w].map((ch) => `<span class="hero__hl-letter">${ch}</span>`).join("");
      return `<span class="word"><span>${letters}</span></span>`;
    })
    .join(" ");

  if (typeof gsap === "undefined" || prefersReducedMotion) return;

  const inners = titleEl.querySelectorAll(".word > span");
  const highlightLetters = titleEl.querySelectorAll(".hero__hl-letter");
  gsap.set(inners, { yPercent: 110 });
  gsap.set(highlightLetters, {
    rotate: () => gsap.utils.random(-10, 10),
    x: () => gsap.utils.random(-4, 4),
    y: () => gsap.utils.random(-2, 6),
    filter: "blur(3px)",
  });
  if (subtitleEl) gsap.set(subtitleEl, { opacity: 0, y: 12 });

  const tl = gsap.timeline({ delay: 0.15 });
  tl.to(inners, {
    yPercent: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.06,
  });
  tl.to(
    highlightLetters,
    {
      rotate: 0,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.03,
    },
    "-=0.15"
  );
  if (subtitleEl) {
    tl.to(
      subtitleEl,
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "opacity,transform" },
      "-=0.3"
    );
  }
}

function setupHeroGlow() {
  if (typeof gsap === "undefined") return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const hero = document.querySelector(".hero");
  const glow = document.querySelector(".hero__glow");
  if (!hero || !glow) return;

  const setX = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3.out" });
  const setY = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3.out" });

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    // y축 배율(0.3)을 x축(0.5)보다 줄임: 히어로가 가로보다 세로가 좁아 위아래 경계에서 글로우가 잘려 보임
    const x = (e.clientX - rect.left - rect.width / 2) * 0.5;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setX(x);
    setY(y);
  });
}

function setupScrollReveal() {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";

  // 시작 지점을 "top 100%"로: 문서 끝 근처 요소(마지막 줄 카드 등)가 최대 스크롤을 넘어
  // 트리거가 영영 발동하지 않는 문제 방지
  const cards = document.querySelectorAll(".component-card");
  cards.forEach((card, i) => {
    gsap.set(card, { opacity: 0, y: 20 });
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      delay: i * 0.05,
      clearProps: "opacity,transform",
      scrollTrigger: hasScrollTrigger
        ? { trigger: card, start: "top 100%", once: true }
        : undefined,
    });
  });

  // 경력 항목은 제목 포함 stagger로 한 흐름처럼 등장
  // (개별 delay 누적은 로딩 실패처럼 보이고, 한 번에 표시는 어색해서)
  const REVEAL_START = "top 100%";

  const groups = document.querySelectorAll(".career__group");
  groups.forEach((group) => {
    const heading = group.querySelector(".career__group-title");
    const items = group.querySelectorAll(".accordion__item");
    const targets = heading ? [heading, ...items] : [...items];
    if (!targets.length) return;
    gsap.set(targets, { opacity: 0, y: 20 });
    gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.08,
      clearProps: "opacity,transform",
      scrollTrigger: hasScrollTrigger
        ? { trigger: heading || group, start: REVEAL_START, once: true }
        : undefined,
    });
  });

  // 폰트·리소스 로드 후 트리거 위치 재계산 (줄바꿈 변화로 위치가 어긋나는 것 방지)
  if (hasScrollTrigger) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    window.addEventListener("load", () => ScrollTrigger.refresh());

    // body 높이 변화(FOUT 등)를 감지해 트리거 위치를 디바운스로 재계산
    if (typeof ResizeObserver !== "undefined") {
      let resizeTimer;
      const ro = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      ro.observe(document.body);
    }
  }
}

// 목차는 markdown-it 플러그인 없이 클라이언트에서 h2/h3로 생성 (의존성을 늘리지 않으려는 선택)
function setupContentToc() {
  const toc = document.querySelector(".content-view__toc");
  const body = document.querySelector(".content-view__body");
  if (!toc || !body) return;

  const headings = [...body.querySelectorAll("h2, h3")];
  // 섹션이 하나면 목차 생략
  if (headings.length < 2) return;

  const usedIds = new Set(
    [...document.querySelectorAll("[id]")].map((el) => el.id)
  );

  const list = document.createElement("ol");
  list.className = "content-view__toc-list";

  headings.forEach((heading) => {
    if (!heading.id) {
      heading.id = slugify(heading.textContent, usedIds);
      usedIds.add(heading.id);
    }

    const item = document.createElement("li");
    item.className =
      heading.tagName === "H3"
        ? "content-view__toc-item content-view__toc-item--sub"
        : "content-view__toc-item";

    const link = document.createElement("a");
    link.className = "content-view__toc-link";
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent;

    item.appendChild(link);
    list.appendChild(item);
  });

  const label = document.createElement("p");
  label.className = "content-view__toc-heading";
  label.textContent = "이 페이지 목차";

  toc.append(label, list);
  // JS 비활성 환경에서 빈 nav가 보이지 않게 hidden으로 두다가 채운 뒤 표시
  toc.hidden = false;

  setupTocScrollSpy(headings, list);
}

function slugify(text, usedIds) {
  const base =
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "section";

  let slug = base;
  let i = 2;
  while (usedIds.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

function setupTocScrollSpy(headings, list) {
  if (typeof IntersectionObserver === "undefined") return;

  // --header-height 읽기 전 폴백. style.scss의 scroll-padding-top(80px)과 값을 맞춤
  const headerHeight =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
      10
    ) || 80;

  const linkById = new Map(
    [...list.querySelectorAll(".content-view__toc-link")].map((link) => [
      link.getAttribute("href").slice(1),
      link,
    ])
  );

  const setActive = (id) => {
    linkById.forEach((link, linkId) => {
      link.classList.toggle("is-active", linkId === id);
    });
  };

  const visibleIds = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleIds.add(entry.target.id);
        } else {
          visibleIds.delete(entry.target.id);
        }
      });
      const current = headings.find((h) => visibleIds.has(h.id));
      if (current) setActive(current.id);
    },
    { rootMargin: `-${headerHeight}px 0px -70% 0px`, threshold: 0 }
  );

  headings.forEach((heading) => observer.observe(heading));
}

})();
