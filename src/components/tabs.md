---
title: 탭
summary: role=tablist 등 ARIA, 키보드 화살표 순환, 슬라이딩 인디케이터
tags: [접근성, GSAP]
layout: layouts/components.njk
---

## 의도

상품 상세 페이지의 "상품설명/리뷰/Q&A"처럼 콘텐츠를 전환하는 탭 컴포넌트 제작.

### 구현 과제

1. `role="tablist"`/`"tab"`/`"tabpanel"` 등 WAI-ARIA 탭 패턴에 맞는 마크업
2. 방향키(←/→)로 탭 간 순환 이동
3. 페이지에 탭 그룹이 여러 개 있을 수 있는 다중 인스턴스 대비
4. 선택된 탭을 따라다니는 슬라이딩 인디케이터(GSAP)
5. 이후 미니프로젝트에서 "패널 전환"뿐 아니라 "카테고리 필터"용으로도 재사용 가능한 구조

## 구현 과정

### 상태 추적과 이벤트 처리

탭마다 리스너를 따로 걸고 클릭할 때마다 전체를 순회하며 선택을 해제하는 구조는, 탭 개수가 늘어날수록 리스너 수와 순회 비용이 함께 늘어난다는 한계가 있다. 대신 `activeTab`/`activePanel` 두 변수로 "지금 선택된 것"을 직접 추적하는 방식을 택해, 전환 시 이 둘만 갱신하면 되도록 설계했다.

```js
let activeTab = document.querySelector('[aria-selected="true"]');
let activePanel = document.getElementById(activeTab.getAttribute('aria-controls'));

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab === activeTab) return;
    activeTab.setAttribute('aria-selected', 'false');
    activePanel.hidden = true;
    activeTab = tab;
    activeTab.setAttribute('aria-selected', 'true');
    activePanel = document.getElementById(activeTab.getAttribute('aria-controls'));
    activePanel.hidden = false;
  });
});
```

클릭 이벤트는 탭마다 걸지 않고 `tablist` 컨테이너 하나에 위임했다(`closest('.tab')`로 판별해, 아이콘 등 자식 요소를 클릭해도 탭을 정확히 찾도록). 탭→패널 관계는 `Map`으로 캐싱해 매번 `getElementById`를 다시 호출하지 않게 했고, 방향키 리스너도 같은 방식으로 `tabList` 하나에 위임하면서 `e.preventDefault()`를 추가해 화살표 키가 페이지 스크롤을 일으키지 않도록 막았다.

```js
tabList.addEventListener('keydown', (e) => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  const idx = tabs.indexOf(tab);
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    tabs[(idx + 1) % tabs.length].focus();
    tabs[(idx + 1) % tabs.length].click();
  }
  // ...
});
```

### 순환 이동

방향키 이동은 배열 인덱스와 나머지 연산으로 구현했다.

```js
const nextIdx = (idx + 1) % tabsArr.length;
const prevIdx = (idx - 1 + tabsArr.length) % tabsArr.length;
```

`nextElementSibling` 같은 DOM 형제 탐색은 마지막 탭에서 다음 형제가 `null`이 되어버려 순환(마지막→처음, 처음→마지막)이라는 요구사항과 맞지 않는다고 판단해 처음부터 배열 기반으로 설계했다. `idx - 1`이 음수가 될 수 있어 `+ tabsArr.length`로 보정하는 것도 함께 반영했다. 이 순환 인덱스 패턴은 이후 드롭다운의 옵션 이동에도 동일하게 적용했다.

### 다중 인스턴스 대응

전체 로직을 `setupTab(tabEl)` 함수로 감싸, 탭 그룹마다 독립된 `activeTab`/`activePanel`을 클로저로 갖도록 설계했다. 페이지에 탭 그룹 두 개를 나란히 둬도 서로 간섭 없이 동작한다.

### GSAP 슬라이딩 인디케이터

선택된 탭을 따라 움직이는 밑줄 인디케이터를 GSAP으로 구현했다. 인디케이터 엘리먼트는 마크업에 미리 넣지 않고 JS로 동적 생성했으며(`aria-hidden="true"`로 스크린리더에서 제외), 초기 위치는 `gsap.set`으로 애니메이션 없이 즉시 배치하고 탭 전환 시에만 `gsap.to`로 `x`/`width`를 탭의 `offsetLeft`/`offsetWidth`에 맞춰 이동시켰다. 페이지가 처음 로드될 때 인디케이터가 왼쪽 끝에서 슬라이드해 들어오는 어색한 움직임을 피하기 위한 구분이다.

```js
const indicator = document.createElement('div');
indicator.className = 'tab-indicator';
indicator.setAttribute('aria-hidden', 'true');
tabList.appendChild(indicator);

gsap.set(indicator, { x: activeTab.offsetLeft, width: activeTab.offsetWidth }); // 초기 위치는 애니메이션 없이

function moveIndicator(tab) {
  gsap.to(indicator, { x: tab.offsetLeft, width: tab.offsetWidth, duration: 0.3, ease: 'power2.out' });
}
```

### 재사용 가능한 구조로 확장

미니프로젝트에서는 탭을 "패널 전환"(검색 결과: 전체/공지/임직원)뿐 아니라 "카테고리 필터"(공지 목록: 전체/부서공지/행사안내 → 아코디언 목록 필터링)에도 써야 했다. 탭 자체의 선택 로직(`selectTab`)과 "선택됐을 때 무엇을 할지"를 분리해, `setupTab(tabEl, onSelect)`가 콜백을 받는 구조로 정리했다.

```js
function selectTab(tab) {
  if (tab.getAttribute('aria-selected') === 'true') return;
  activeTab.setAttribute('aria-selected', 'false');
  tab.setAttribute('aria-selected', 'true');
  activeTab = tab;
  onSelect(tab); // 패널을 바꿀지, 목록을 필터링할지는 호출하는 쪽이 결정
}

export function setupTabs(selector) {
  document.querySelectorAll(selector).forEach(tabEl => {
    if (tabEl.dataset.tabMode === 'filter') {
      setupTab(tabEl, (tab) => { /* 카테고리에 맞게 아코디언 항목 hidden 토글 */ });
    } else {
      setupTab(tabEl, (tab) => { /* 패널 hidden 전환 */ });
    }
  });
}
```

`data-tab-mode` 속성으로 같은 탭 컴포넌트를 마크업 레벨에서 두 가지 용도로 구분해 쓸 수 있게 됐다. 탭 컴포넌트는 처음부터 범용으로 설계하지 않고, 실제 두 번째 사용처가 생겼을 때 콜백 구조로 리팩토링했다 — 필요해지기 전에 미리 일반화하지 않는다는 원칙을 지킨 결과다.

## 결과

- WAI-ARIA 탭 패턴에 맞는 접근성 구조(방향키 순환, `role="tablist"` 등)
- 이벤트 위임 + `Map` 캐싱 + `setupTab()` 클로저로 다중 인스턴스 대비
- GSAP 슬라이딩 인디케이터로 선택 상태를 시각적으로 강화
- 콜백(`onSelect`) 기반 구조로 "패널 전환"과 "카테고리 필터"라는 서로 다른 용도에 같은 탭 컴포넌트를 재사용
