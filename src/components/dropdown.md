---
title: 드롭다운
summary: aria-haspopup/listbox, roving 포커스, 방향키 순환, 커밋/취소 구조
tags: [접근성, GSAP]
layout: layouts/components.njk
---

## 의도

네이티브 `<select>`의 스타일링 제약을 벗어나기 위한 커스텀 드롭다운 제작, WAI-ARIA "Collapsible Dropdown Listbox" 패턴 적용.

### 구현 과제

1. `aria-haspopup`/`role="listbox"`/`"option"` 등 정확한 ARIA 구조
2. 클릭으로 열고 닫기, 바깥 클릭 시 자동 닫힘
3. 방향키로 옵션 순환 이동(roving tabindex)
4. Enter/Space로 확정, ESC로 취소(열기 전 선택 상태로 복원)
5. 트리거 라벨에 선택값 반영

## 구현 과정

### 이벤트 판별과 대상 참조

트리거 버튼 안에 아이콘 등 자식 요소가 있어도 정확히 인식되도록, 클릭 판별은 `e.target.closest('[aria-haspopup="listbox"]')`로 조상까지 탐색하는 방식을 택했다. `closest()`로 찾은 결과는 반드시 변수에 담아 이후 로직 전체가 그 변수만 참조하도록 일관되게 설계했다.

```js
const trigger = e.target.closest('[aria-haspopup="listbox"]');
if (!trigger) return;
const state = trigger.getAttribute('aria-expanded'); // trigger로만 참조
```

같은 원칙을 함수 경계에도 적용했다. `dropdownClose(trigger)`처럼 매개변수를 받는 함수는 함수 바깥의 전역 변수 대신 매개변수(및 그로부터 파생된 값 — `trigger`의 `aria-controls`로 다시 찾은 리스트, `getList(trigger)`)만 참조하도록 해서, 호출 순서가 바뀌어도 깨지지 않는 독립적인 함수로 만들었다.

### roving tabindex와 초기 포커스

roving tabindex의 첫 포커스는 `focusables[0]`이 아니라, 열릴 때 "이전에 선택된 옵션 또는 첫 옵션"을 찾아 지정하도록 설계했다 — 모달과 같은 이유로, DOM 순서상 우연히 정해지는 대상이 아니라 의미 있는 시작점이어야 하기 때문이다. 방향키 순환 이동은 나머지 연산에 `+ items.length`를 더해 음수 인덱스를 방지했고, Shift+화살표처럼 조합 키가 섞이는 경우까지 `e.shiftKey`로 구분해 처리했다.

### 확정과 취소를 분리한 상태 구조

Enter/Space(확정)와 ESC(취소)는 서로 다른 동작이므로 명확히 구분했다. `openedWithIndex`(열었을 때의 원래 선택)를 기억해두고, `dropdownClose(el, { commit })`의 `commit` 플래그로 "확정 시엔 지금 상태 유지, 취소 시엔 원래 선택으로 복원"을 분기하는 구조로 설계했다. 이 되돌리기 로직은 `dropdownClose` 자체의 책임으로 둬서, ESC뿐 아니라 배경 클릭이나 다른 트리거 클릭으로 닫히는 모든 경로에 일관되게 적용되도록 했다.

### 역할 분리

`getListItems`가 `target`과 `items`를 함께 반환하다 보니 이름이 하는 일과 맞지 않아, `getList`/`getListItems` 두 함수로 역할을 나눴다. `selectItem`과 목록 순회 로직에서 "형제 끄고 자신 켜기"가 중복되던 부분도 하나가 다른 하나를 재사용하도록 정리했다.

지금 규모(옵션 수십 개 이내)에서는 매번 전체를 순회하는 방식과 단일 `openedWithIndex` 변수로 충분하지만, 옵션이 수백 개로 늘어나는 실무 규모에서는 가상 스크롤이나 인덱스 기반 상태 관리로 재검토가 필요한 지점으로 남겨둔다.

## 결과

- WAI-ARIA 리스트박스 패턴에 맞는 접근성 구조 완성
- 키보드만으로 완전 조작 가능(방향키 순환, Enter/Space 확정, ESC 취소)
- "확정 vs 취소"를 하나의 `commit` 플래그로 모든 닫힘 경로에서 일관되게 처리
- `getList`/`getListItems` 분리, 중복 로직 통합으로 유지보수성 확보
