import { useEffect, type RefObject } from "react";

/**
 * 키보드로 listbox 하이라이트를 옮길 때 활성 옵션을 스크롤 시야 안으로 유지.
 * (2026-09-02 회장 리포트 — 검색 드롭다운에서 ↓ 이동 시 스크롤이 안 따라오던 현상)
 *
 * 활성 옵션은 `[role="option"][aria-selected="true"]`로 찾는다 — 인덱스 ↔ DOM 순서
 * 매핑에 의존하지 않아 그룹 헤더·다중 섹션 리스트(search-bar)에서도 동작.
 * `block: "nearest"`라 이미 보이는 항목(마우스 hover 하이라이트)에는 no-op.
 * SelectCombobox의 자체 구현(data-active 기반)과 동일 패턴.
 *
 * @param listRef     스크롤 컨테이너(listbox 또는 그 상위) ref
 * @param activeIndex 하이라이트 인덱스 — 변경 감지용 dep
 * @param open        드롭다운 열림 여부 — 열릴 때도 1회 스크롤
 */
export function useActiveOptionScroll(
  listRef: RefObject<HTMLElement | null>,
  activeIndex: number,
  open: boolean,
) {
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [listRef, activeIndex, open]);
}
