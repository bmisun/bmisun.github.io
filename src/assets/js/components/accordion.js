// 아코디언

// single / multiple을 기본·예외 구분 없이 이름으로 나란히 둠 (Radix UI 등의 표기 따름)

function collectEntries(containerEl) {
  const entries = new Map();
  containerEl.querySelectorAll(".accordion__item").forEach((item) => {
    const trigger = item.querySelector(".accordion__trigger");
    const panel = item.querySelector(".accordion__panel");
    if (trigger && panel) entries.set(trigger, { item, panel });
  });
  return entries;
}

function setExpanded(trigger, panel, expanded) {
  panel.classList.toggle("is-collapsed", !expanded);
  trigger.setAttribute("aria-expanded", String(expanded));
}

export function setupAccordionSingle(selector) {
  document.querySelectorAll(selector).forEach((containerEl) => {
    const entries = collectEntries(containerEl);
    let activeTrigger = null;

    entries.forEach(({ item, panel }, trigger) => {
      const isOpen = item.hasAttribute("data-default-open");
      setExpanded(trigger, panel, isOpen);
      if (isOpen) activeTrigger = trigger;
    });

    containerEl.addEventListener("click", (e) => {
      const trigger = e.target.closest(".accordion__trigger");
      if (!trigger || !entries.has(trigger)) return;
      const { panel } = entries.get(trigger);
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      if (activeTrigger && activeTrigger !== trigger) {
        const prev = entries.get(activeTrigger);
        setExpanded(activeTrigger, prev.panel, false);
      }
      setExpanded(trigger, panel, !isOpen);
      activeTrigger = isOpen ? null : trigger;
    });
  });
}

export function setupAccordionMultiple(selector) {
  document.querySelectorAll(selector).forEach((containerEl) => {
    const entries = collectEntries(containerEl);

    entries.forEach(({ item, panel }, trigger) => {
      setExpanded(trigger, panel, item.hasAttribute("data-default-open"));
    });

    containerEl.addEventListener("click", (e) => {
      const trigger = e.target.closest(".accordion__trigger");
      if (!trigger || !entries.has(trigger)) return;
      const { panel } = entries.get(trigger);
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      setExpanded(trigger, panel, !isOpen);
    });
  });
}
