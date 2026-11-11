// 탭
export function setupTabs(selector = ".tabs") {
  function setupTab(tabEl) {
    const tabs = Array.from(tabEl.querySelectorAll(".tabs__tab"));
    const panels = new Map();
    tabs.forEach((tab) => {
      const panelId = tab.getAttribute("aria-controls");
      const panel = document.getElementById(panelId);
      panels.set(tab, panel);
    });

    let activeTab = tabEl.querySelector('[aria-selected="true"]');
    let activePanel = panels.get(activeTab);

    const tabList = tabEl.querySelector(".tabs__list");
    const indicator = document.createElement("div");
    indicator.className = "tabs__indicator";
    indicator.setAttribute("aria-hidden", "true");
    tabList.appendChild(indicator);

    function moveIndicator(tab) {
      gsap.to(indicator, {
        x: tab.offsetLeft,
        width: tab.offsetWidth,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    gsap.set(indicator, { x: activeTab.offsetLeft, width: activeTab.offsetWidth });

    tabEl.addEventListener("click", (e) => {
      const tab = e.target.closest(".tabs__tab");
      if (!tab) return;
      if (tab.getAttribute("aria-selected") !== "true") {
        activeTab.setAttribute("aria-selected", "false");
        activePanel.hidden = true;
        activeTab = tab;
        tab.setAttribute("aria-selected", "true");
        activePanel = panels.get(activeTab);
        activePanel.hidden = false;
        moveIndicator(tab);
      }
    });

    tabEl.addEventListener("keydown", (e) => {
      const tab = e.target.closest(".tabs__tab");
      if (!tab) return;
      const idx = tabs.indexOf(tab);
      const nextIdx = (idx + 1) % tabs.length;
      const prevIdx = (idx - 1 + tabs.length) % tabs.length;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        tabs[nextIdx].focus();
        tabs[nextIdx].click();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        tabs[prevIdx].focus();
        tabs[prevIdx].click();
      }
    });
  }

  document.querySelectorAll(selector).forEach(setupTab);
}
