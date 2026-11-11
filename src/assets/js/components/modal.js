// 모달
export function setupModal() {
  let activeModal = null;
  let latestFocus = null;
  const focusAbles =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let focusList = [];

  document.addEventListener("click", (e) => {
    const el = e.target;
    const openBtn = e.target.closest("[data-modal-target]");
    const closeBtn = e.target.closest("[data-modal-close]");

    if (openBtn) {
      openModal(el);
    }
    if (closeBtn) {
      closeModal();
    }
    if (activeModal && e.target === activeModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!activeModal) return;

    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
    if (e.key === "Tab") {
      focusTrap(e);
    }
  });

  function focusTrap(e) {
    if (!focusList.length) return;

    const first = focusList[0];
    const last = focusList[focusList.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal(el) {
    const target = document.getElementById(el.getAttribute("data-modal-target"));
    if (!target) return;
    const modal = target.querySelector(".modal__dialog");

    activeModal = target;
    latestFocus = el;

    target.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    target.style.display = "flex";

    gsap.set(target, { opacity: 0 });
    gsap.set(modal, { opacity: 0, y: 20, scale: 0.95 });

    const tl = gsap.timeline();
    tl.to(target, { opacity: 1, duration: 0.2 }).to(
      modal,
      { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.4)" },
      "-=0.1"
    );

    target.focus();

    focusList = Array.from(activeModal.querySelectorAll(focusAbles));
    const realFocus = focusList.find((el) => ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
    if (realFocus) {
      realFocus.focus();
    } else {
      const title = activeModal.querySelector(".modal__title");
      if (title) title.focus();
    }
  }

  function closeModal() {
    if (!activeModal) return;

    const modalOverlay = activeModal;
    const modal = activeModal.querySelector(".modal__dialog");

    activeModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    const tl = gsap.timeline({
      onComplete: () => {
        modalOverlay.style.display = "none";
      },
    });
    tl.to(modal, { opacity: 0, y: 20, scale: 0.95, duration: 0.2, ease: "power1.in" }).to(
      modalOverlay,
      { opacity: 0, duration: 0.2 },
      "-=0.1"
    );

    if (latestFocus) {
      latestFocus.focus();
    }

    activeModal = null;
    latestFocus = null;
    focusList = [];
  }
}
