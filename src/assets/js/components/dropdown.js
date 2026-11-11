// 드롭다운
export function setupDropdown() {
  let current = null;
  let openedWithIndex = null;

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest('[aria-haspopup="listbox"]');
    const items = e.target.closest(".dropdown__item");

    if (items) {
      selectItem(items);
      dropdownClose(current, { commit: true });
    }

    if (current && current !== trigger) {
      dropdownClose(current);
    }

    if (trigger) {
      const state = trigger.getAttribute("aria-expanded");
      if (state === "false") {
        dropdownOpen(trigger);
      } else {
        dropdownClose(trigger);
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!current) return;

    if (e.key === "Escape") {
      e.preventDefault();
      dropdownClose(current);
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dropdownClose(current, { commit: true });
    }
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      itemTour(-1);
    }
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      itemTour(1);
    }
  });

  function getList(trigger) {
    return document.getElementById(trigger.getAttribute("aria-controls"));
  }

  function getListItems(list) {
    return Array.from(list.querySelectorAll("li"));
  }

  function selectItem(item) {
    const list = item.closest(".dropdown__list");
    const items = getListItems(list);

    items.forEach((el) => el.setAttribute("aria-selected", el === item ? "true" : "false"));
  }

  function itemTour(dir) {
    const target = getList(current);
    const items = getListItems(target);
    const idx = items.indexOf(document.activeElement);
    const nextIdx = (idx + dir + items.length) % items.length;
    items[nextIdx].focus();
    selectItem(items[nextIdx]);
  }

  function dropdownOpen(el) {
    const target = getList(el);
    const items = getListItems(target);
    el.setAttribute("aria-expanded", "true");
    target.removeAttribute("aria-hidden");
    current = el;
    target.style.display = "block";

    gsap.set(target, { opacity: 0, y: -8 });
    gsap.set(items, { opacity: 0, y: -4 });
    const tl = gsap.timeline();
    tl.to(target, { opacity: 1, y: 0, duration: 0.15 }).to(
      items,
      {
        opacity: 1,
        y: 0,
        duration: 0.15,
        stagger: 0.03,
      },
      "-=0.1"
    );

    openedWithIndex = items.findIndex((item) => item.getAttribute("aria-selected") === "true");
    if (openedWithIndex === -1) openedWithIndex = 0;
    items[openedWithIndex].focus();
  }

  function dropdownClose(el, { commit = false } = {}) {
    const target = getList(el);
    const items = getListItems(target);

    gsap.to(target, {
      opacity: 0,
      y: -8,
      duration: 0.12,
      onComplete: () => {
        target.style.display = "none";
      },
    });

    // 확정 없이 닫히면 방향키로 바뀐 aria-selected를 열기 전 상태로 되돌림
    if (!commit) {
      items.forEach((item, idx) => {
        item.setAttribute("aria-selected", idx === openedWithIndex ? "true" : "false");
      });
    } else {
      const selected = items.find((item) => item.getAttribute("aria-selected") === "true");
      if (selected) {
        current.querySelector(".dropdown__label").innerText = selected.innerText;
      }
    }

    el.setAttribute("aria-expanded", "false");
    target.setAttribute("aria-hidden", "true");
    current = null;
    el.focus();
  }
}
