// 폼 검증
export function setupFormValidation(formSelector, fieldRules = {}) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  function setupFieldValidation({ input, errorEl, validate, errorMessage, successMessage, rect, perimeterRef }) {
    let isValid = null;
    let hasBeenValidated = false;

    function inputCheck(v) {
      const wasEmpty = errorEl.innerText === "";
      if (!v) {
        input.setAttribute("aria-invalid", "true");
        errorEl.innerText = errorMessage;
        errorEl.classList.remove("form__error--success");
        errorEl.classList.add("form__error--fail");
      } else {
        input.setAttribute("aria-invalid", "false");
        errorEl.innerText = successMessage;
        errorEl.classList.add("form__error--success");
        errorEl.classList.remove("form__error--fail");
      }
      if (wasEmpty) {
        gsap.fromTo(
          rect,
          { strokeDashoffset: perimeterRef.value },
          { strokeDashoffset: 0, duration: 0.6, ease: "power1.inOut" }
        );
      }
    }

    input.addEventListener("blur", () => {
      isValid = validate(input);
      hasBeenValidated = true;
      inputCheck(isValid);
    });

    input.addEventListener("input", () => {
      if (hasBeenValidated) {
        isValid = validate(input);
        inputCheck(isValid);
      }
    });

    function forceValidate() {
      isValid = validate(input);
      hasBeenValidated = true;
      inputCheck(isValid);
      return isValid;
    }

    return { forceValidate, input };
  }

  // perimeter를 객체로 전달: 리사이즈 때 갱신한 값이 기존 클로저에도 반영되도록
  function syncBorderSize(input, svg, rect, perimeterRef) {
    const w = input.offsetWidth;
    const h = input.offsetHeight;

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    rect.setAttribute("width", w - 2);
    rect.setAttribute("height", h - 2);
    rect.setAttribute("x", 1);
    rect.setAttribute("y", 1);

    const perimeter = rect.getTotalLength();
    rect.style.strokeDasharray = perimeter;
    rect.style.strokeDashoffset = perimeter;
    if (perimeterRef) perimeterRef.value = perimeter;

    return perimeter;
  }

  function wrapWithBorderSVG(input) {
    const wrap = document.createElement("div");
    wrap.className = "form__input-wrap";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "form__input-border");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("rx", 4);
    svg.appendChild(rect);
    wrap.appendChild(svg);

    const perimeterRef = { value: 0 };
    syncBorderSize(input, svg, rect, perimeterRef);
    return { svg, rect, perimeterRef };
  }

  const fields = form.querySelectorAll("input, textarea");
  const validators = [];
  const borderEntries = [];
  const defaultRule = {
    validate: (input) => input.checkValidity(),
    errorMessage: "입력값을 확인해주세요.",
    successMessage: "입력값이 확인되었습니다.",
  };

  fields.forEach((field) => {
    const rule = fieldRules[field.id];
    const errorEl = document.getElementById(field.getAttribute("aria-describedby"));

    const { svg, rect, perimeterRef } = wrapWithBorderSVG(field);

    const validator = setupFieldValidation({
      input: field,
      errorEl: errorEl,
      ...defaultRule,
      ...(rule || {}),
      rect,
      perimeterRef,
    });

    validators.push(validator);
    borderEntries.push({ input: field, svg, rect, perimeterRef });
  });

  // display:none 조상(모달) 안의 폼은 셋업 시 크기가 0이라,
  // ResizeObserver로 실제 크기가 잡힐 때 SVG 테두리를 한 번 다시 맞춤
  if (typeof ResizeObserver !== "undefined") {
    const ro = new ResizeObserver(() => {
      if (form.offsetWidth === 0) return;
      borderEntries.forEach(({ input, svg, rect, perimeterRef }) => {
        syncBorderSize(input, svg, rect, perimeterRef);
      });
      ro.disconnect();
    });
    ro.observe(form);
  }

  form.addEventListener("submit", (e) => {
    const results = validators.map((v) => v.forceValidate());
    const okIndex = results.indexOf(false);

    if (okIndex !== -1) {
      validators[okIndex].input.focus();
      e.preventDefault();
    }
  });
}
