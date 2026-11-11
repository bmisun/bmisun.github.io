---
title: 아코디언
summary: 버튼 + ARIA, grid-template-rows 트랜지션, single/multiple 오픈 모드, 이벤트 위임/Map 캐싱 최적화
tags: [접근성, 성능 최적화]
layout: layouts/components.njk
---

## 의도

FAQ 목록처럼 여러 항목을 여닫는 아코디언 제작. 항목이 여러 개 있는 그룹에서 "한 번에 하나만 열림"과 "각 항목이 독립적으로 열림"이 실무에서 둘 다 흔히 쓰이는 방식이라, 둘 중 하나를 기본으로 정하기보다 처음부터 나란히 지원하는 구조로 설계했다.

### 구현 과제

1. `aria-expanded`/`aria-controls`/`role="region"` 등 정확한 ARIA 구조
2. 그룹 안에서 하나만 열리는 방식(single)과 항목마다 독립적으로 열리는 방식(multiple) 둘 다 지원
3. 패널 여닫힘 시 콘텐츠 길이에 유연하게 대응하는 부드러운 높이 트랜지션
4. JS가 로드되기 전에도 콘텐츠 자체는 보이는 프로그레시브 인핸스먼트
5. 아코디언 그룹이 여러 개 있을 수 있는 다중 인스턴스 대비

## 구현 과정

### 상태 표현과 높이 애니메이션

패널 여닫힘을 처음엔 GSAP으로 `panel-inner`의 실제 높이(`scrollHeight`)를 측정해 `height`를 직접 애니메이션하는 방식으로 만들었는데, 이 방식은 콘텐츠가 동적으로 바뀌거나 폰트 로딩 등으로 높이가 달라지는 경우 측정 시점에 따라 값이 어긋날 여지가 있었다. 최종적으로는 JS가 높이를 계산하지 않고, `display: grid; grid-template-rows: 1fr`(열림)과 `grid-template-rows: 0fr`(닫힘, `.is-collapsed`) 사이를 CSS 트랜지션만으로 오가는 방식으로 바꿨다. JS(`setExpanded`)는 이 `is-collapsed` 클래스와 `aria-expanded`만 토글하고, 실제 애니메이션은 전부 CSS가 담당한다.

```css
.accordion__panel {
  display: grid;
  grid-template-rows: 1fr;
  transition: grid-template-rows 0.3s ease;

  &.is-collapsed {
    grid-template-rows: 0fr;
  }
}
```

이 방식에서는 grid item의 기본 `min-height: auto` 때문에 콘텐츠가 있으면 트랙이 `0fr`이어도 완전히 줄어들지 못해 접힌 상태에서 내용이 살짝 잘려 보이는 문제가 있었다. `panel-inner`에 `min-height: 0`을 명시해 해결했다. 패널 하단 여백도 `panel-inner` 자신에 `padding-bottom`을 주면 접혀도 grid item 자신의 padding은 항상 그만큼 남아버리는 문제가 있어, 마지막 자식 요소(`& > *:last-child`) 쪽으로 옮겨서 접힌 상태에서는 여백까지 완전히 사라지도록 정리했다.

### 두 가지 오픈 모드 — single과 multiple

`collectEntries`/`setExpanded`라는 공통 로직 위에 `setupAccordionSingle`(그룹 안에서 하나를 열면 기존 항목이 자동으로 닫힘)과 `setupAccordionMultiple`(항목마다 독립적으로 열리고 닫힘) 두 함수를 나란히 뒀다. 두 함수는 "다른 패널을 닫을지 말지"만 다르고 나머지(트리거↔패널 매핑, 이벤트 위임, 클래스 토글)는 완전히 동일해, 이 공통 부분을 먼저 함수로 뽑아낸 뒤 그 위에 두 진입점을 얹는 구조로 정리했다. 어느 한쪽을 "기본"으로 두고 다른 쪽을 예외로 취급하지 않고, Radix UI·Syncfusion 등이 쓰는 single/multiple 표기를 그대로 이름에 반영했다.

### 프로그레시브 인핸스먼트 — 초기 상태를 마크업에 먼저 확정

각 항목의 초기 열림 상태는 JS 실행 결과가 아니라 `.accordion__item`의 `data-default-open` 속성으로 마크업 단계에서 이미 결정되도록 설계했다 — `.accordion__panel`의 CSS 기본값 자체가 "열림"이라, JS가 아직 로드되지 않았거나 실패해도 모든 내용이 화면에 그대로 보인다. JS가 로드되면 `data-default-open`이 없는 항목만 `is-collapsed`를 붙여 접는다.

```js
const isOpen = item.hasAttribute("data-default-open");
setExpanded(trigger, panel, isOpen);
```

### 이벤트 처리와 확장성

트리거마다 리스너를 따로 걸면 트리거 개수만큼 리스너가 늘어나고, 클릭할 때마다 나머지 트리거를 순회해서 닫아야 하는 구조가 된다. 대신 컨테이너 하나에 클릭 이벤트를 위임하고(`closest`로 트리거 판별), single 모드에서는 `activeTrigger` 변수 하나로 "지금 열려있는 것"만 직접 추적하도록 설계해 트리거 수와 무관하게 확장 가능하게 했다. 트리거↔패널 매핑도 매 클릭마다 `getElementById`를 다시 호출하는 대신, 초기화 시점에 `Map`(`collectEntries`)에 한 번만 저장해두고 이후에는 캐싱된 값만 참조한다.

```js
function collectEntries(containerEl) {
  const entries = new Map(); // trigger -> { item, panel }
  containerEl.querySelectorAll(".accordion__item").forEach((item) => {
    const trigger = item.querySelector(".accordion__trigger");
    const panel = item.querySelector(".accordion__panel");
    if (trigger && panel) entries.set(trigger, { item, panel });
  });
  return entries;
}
```

single 모드의 토글 로직은 "지금 클릭한 트리거가 이미 열려있던 것과 같은가"부터 먼저 판단하고, 그다음에만 "다른 게 열려있으면 닫는다" 로직이 실행되도록 순서를 잡았다. 이 순서를 지켜야 방금 연 항목을 다시 클릭해 닫는 케이스에서 상태가 꼬이지 않는다.

### 다중 인스턴스 대응

페이지에 아코디언 그룹이 여러 개 동시에 있을 수 있다는 전제 아래, single/multiple 로직 모두 `document.querySelectorAll(selector).forEach(containerEl => { ... })` 구조로 감싸 그룹마다 독립된 `entries` Map과 `activeTrigger`(single 모드) 클로저를 갖도록 설계했다. 클래스 네이밍은 처음부터 `.accordion__item`, `.accordion__trigger`, `.accordion__panel`, `.accordion__panel-inner`처럼 엄격한 BEM으로 작성했다.

이벤트 위임 → `Map` 캐싱 → `setup*` 함수로 인스턴스 격리하는 이 패턴은 이후 탭·드롭다운·슬라이더를 만들 때도 그대로 가져다 쓴 원형이 됐다.

## 결과

- ARIA 구조를 갖춘 아코디언(버튼+`aria-expanded`+`role="region"`)을 single(단일 오픈)/multiple(독립 오픈) 두 모드로 지원
- JS 없이 `height` 계산 없는 `grid-template-rows` CSS 트랜지션만으로 여닫히는 구조로, 콘텐츠 높이가 달라져도 항상 정확하게 애니메이션
- `data-default-open` 기반으로 JS 로드 이전에도 콘텐츠가 보이는 프로그레시브 인핸스먼트 확보
- 이벤트 위임 + `Map` 캐싱으로 트리거 개수와 무관하게 확장 가능한 구조, 다중 인스턴스 대비까지 완료
