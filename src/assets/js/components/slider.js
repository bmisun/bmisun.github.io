// 슬라이더/캐러셀

// 3가지 타입 (data-align × data-loop)
// ① start + infinite  ② start + pingpong(페이지 단위 이동, 끝은 클램프)  ③ center + infinite
// center + pingpong은 지원하지 않음
export function setupSlider(selector = ".slider") {
  function setupSliderInstance(sliderEl) {
    const track = sliderEl.querySelector(".slider__track");
    const realSlides = Array.from(sliderEl.querySelectorAll(".slider__slide"));
    const dotContainer = sliderEl.querySelector(".slider__dots");
    const prevBtn = sliderEl.querySelector(".slider__btn--prev");
    const nextBtn = sliderEl.querySelector(".slider__btn--next");

    const align = sliderEl.dataset.align || "start";
    const loopType = sliderEl.dataset.loop || "infinite";

    // 점(dot)은 실제 슬라이드 수만큼만 생성 (복제본 제외)
    if (dotContainer) {
      realSlides.forEach((el, i) => {
        dotContainer.innerHTML += `<button role="tab" aria-selected="${
          i === 0 ? "true" : "false"
        }" aria-label="${el.dataset.title} 슬라이드로 이동"></button>`;
      });
    }
    const dots = dotContainer ? Array.from(dotContainer.querySelectorAll("button")) : [];

    const realCount = realSlides.length;

    // 클론: start+infinite는 뒤쪽만, center+infinite는 앞뒤 양쪽, pingpong은 클론 없이 스크롤량을 클램프
    function makeCloneSet() {
      const fragment = document.createDocumentFragment();
      realSlides.forEach((el) => {
        const clone = el.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.setAttribute("data-clone", "true");
        clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
        fragment.appendChild(clone);
      });
      return fragment;
    }

    const isCenterInfinite = loopType === "infinite" && align === "center";

    if (isCenterInfinite) {
      track.insertBefore(makeCloneSet(), track.firstChild);
      track.appendChild(makeCloneSet());
    } else if (loopType === "infinite") {
      track.appendChild(makeCloneSet());
    }

    const slides = Array.from(track.querySelectorAll(".slider__slide"));
    const slideWidths = slides.map((s) => s.offsetWidth);
    const containerWidth = sliderEl.clientWidth;

    let autoPlay = null;
    let isAuto = sliderEl.dataset.autoplay === "true";
    let interval = Number(sliderEl.dataset.interval);
    let currentIndex = 0;
    let isAnimating = false;
    let pingDir = 1;

    function getOffset(trackIdx) {
      const leftEdge = slideWidths.slice(0, trackIdx).reduce((sum, w) => sum + w, 0);
      if (align === "center") {
        return leftEdge - (containerWidth - slideWidths[trackIdx]) / 2;
      }
      return leftEdge;
    }

    function applyOffset(offset, animate = true, onDone) {
      if (animate) {
        isAnimating = true;
        gsap.to(track, {
          x: -offset,
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            isAnimating = false;
            if (onDone) onDone();
          },
        });
      } else {
        gsap.set(track, { x: -offset });
      }
    }

    function setTrackPosition(trackIdx, animate = true, onDone) {
      applyOffset(getOffset(trackIdx), animate, onDone);
    }

    function updateDots(idx) {
      dots.forEach((dot, i) => dot.setAttribute("aria-selected", i === idx ? "true" : "false"));
    }

    function updateEdgeButtons() {
      if (loopType !== "pingpong") return;
      if (prevBtn) prevBtn.disabled = currentOffset <= 0;
      if (nextBtn) nextBtn.disabled = currentOffset >= maxOffset;
    }

    // pingpong은 슬라이드 폭이 제각각이라 인덱스 대신 픽셀 오프셋으로 관리 (마지막 페이지 클램프용)
    let currentOffset = 0;
    const totalRealWidth = slideWidths.reduce((sum, w) => sum + w, 0);
    const maxOffset = Math.max(0, totalRealWidth - containerWidth);

    function clampOffset(v) {
      return Math.min(Math.max(v, 0), maxOffset);
    }

    function indexAtOffset(offset) {
      let idx = 0;
      let acc = 0;
      for (let i = 0; i < realCount; i++) {
        if (acc > offset + 0.5) break;
        idx = i;
        acc += slideWidths[i];
      }
      return idx;
    }

    function pagedMove(dir) {
      if (isAnimating) return;
      const next = clampOffset(currentOffset + dir * containerWidth);
      if (next === currentOffset) {
        pingDir = -pingDir;
        return;
      }
      pingDir = dir;
      currentOffset = next;
      updateDots(indexAtOffset(currentOffset));
      applyOffset(currentOffset);
      updateEdgeButtons();
    }

    function step(dir) {
      if (isAnimating) return;
      const last = realCount - 1;

      if (isCenterInfinite) {
        if (currentIndex === last && dir === 1) {
          currentIndex = 0;
          updateDots(0);
          setTrackPosition(realCount * 2, true, () => setTrackPosition(realCount, false));
          return;
        }
        if (currentIndex === 0 && dir === -1) {
          currentIndex = last;
          updateDots(last);
          setTrackPosition(realCount - 1, true, () => setTrackPosition(realCount + last, false));
          return;
        }
        currentIndex += dir;
        updateDots(currentIndex);
        setTrackPosition(realCount + currentIndex);
        return;
      }

      // start+infinite는 뒤쪽 복제만 있어 정방향 순환만 지원
      if (currentIndex === last && dir === 1) {
        currentIndex = 0;
        updateDots(0);
        setTrackPosition(realCount, true, () => setTrackPosition(0, false));
        return;
      }
      if (currentIndex === 0 && dir === -1) {
        return;
      }
      currentIndex += dir;
      updateDots(currentIndex);
      setTrackPosition(currentIndex);
    }

    function handleStep(dir) {
      if (loopType === "pingpong") {
        pagedMove(dir);
      } else {
        step(dir);
      }
    }

    function moveSlide(idx) {
      if (isAnimating) return;

      if (loopType === "pingpong") {
        const targetOffset = clampOffset(getOffset(idx));
        if (targetOffset === currentOffset) return;
        pingDir = targetOffset > currentOffset ? 1 : -1;
        currentOffset = targetOffset;
        updateDots(indexAtOffset(currentOffset));
        applyOffset(currentOffset);
        updateEdgeButtons();
        return;
      }

      if (idx === currentIndex) return;
      currentIndex = idx;
      updateDots(idx);
      setTrackPosition(isCenterInfinite ? realCount + idx : idx);
    }

    sliderEl.addEventListener("click", (e) => {
      const el = e.target;
      if (el.closest(".slider__btn")) {
        if (el.closest(".slider__btn--prev")) {
          handleStep(-1);
        } else if (el.closest(".slider__btn--next")) {
          handleStep(1);
        } else if (el.closest(".slider__btn--control")) {
          if (isAuto) {
            sliderStop();
            isAuto = false;
            updateControl();
          } else {
            sliderPlay();
            isAuto = true;
            updateControl();
          }
        }
      } else if (el.closest(".slider__dots")) {
        const items = Array.from(el.closest(".slider__dots").querySelectorAll("button"));
        moveSlide(items.indexOf(el));
      }
    });
    sliderEl.addEventListener("mouseenter", () => {
      sliderStop();
    });
    sliderEl.addEventListener("mouseleave", () => {
      if (isAuto) sliderPlay();
    });
    sliderEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleStep(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleStep(1);
      }
    });

    function sliderPlay() {
      if (autoPlay !== null) clearInterval(autoPlay);
      autoPlay = setInterval(() => {
        if (loopType === "pingpong") {
          pagedMove(pingDir);
        } else {
          step(1);
        }
      }, interval);
    }
    function sliderStop() {
      clearInterval(autoPlay);
      autoPlay = null;
    }

    const slideControl = sliderEl.querySelector(".slider__btn--control");

    function updateControl() {
      slideControl.setAttribute("aria-label", isAuto ? "일시정지" : "재생");
      slideControl.setAttribute("data-state", isAuto ? "paused" : "playing");
    }

    if (loopType === "pingpong") {
      applyOffset(0, false);
      updateEdgeButtons();
    } else if (isCenterInfinite) {
      setTrackPosition(realCount, false);
    } else {
      setTrackPosition(0, false);
    }
    updateDots(0);

    if (isAuto) sliderPlay();
    updateControl();
  }

  document.querySelectorAll(selector).forEach(setupSliderInstance);
}
