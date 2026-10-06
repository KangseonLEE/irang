"use client";

import { useCallback, useEffect, useState, type KeyboardEvent } from "react";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import SearchBar from "./search-bar";

/**
 * /search 페이지 전용 검색창.
 * - 모바일(< 640px): 탭하면 GNB·히어로와 동일한 전역 SearchOverlay 풀레이아웃 호출
 * - 데스크탑: 인라인 검색바 (자동 포커스·자동 드롭다운 노출 X)
 *
 * Phase A-3 (2026-05-15): 회장 요청 — /search 페이지 진입 시 검색바에 query가
 * 채워져 있으면 자동 포커스/자동 드롭다운 노출이 결과 페이지 시야를 가려서 거슬림.
 * autoFocus·richMode 제거 → 사용자가 명시적으로 검색바를 클릭/입력할 때만 드롭다운.
 *
 * 모바일 열기는 **click** 에서 (10/2 QA C-Y5). 예전 pointerup 판정(useTapGesture)은 손을 떼는 순간 오버레이를
 * 열어, 뒤따라 오는 click 이 새로 뜬 오버레이 안 '작물 정보' 같은 링크에 떨어졌다(고스트 클릭 → /crops 이동).
 * click 은 탭 이벤트 열의 마지막이라 뒤따르는 click 이 없고, 손가락이 움직여 스크롤이 되면 브라우저가 click 을
 * 보내지 않는다 — 9/7 "검색창을 잡고 스크롤만 해도 열림" 사고도 그대로 막힌다.
 */
export default function SearchPageSearchBar() {
  const { open: openOverlay } = useSearchOverlay();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const open = useCallback(() => openOverlay("search_page_bar"), [openOverlay]);
  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    },
    [open],
  );

  // 결과 화면 검색창에는 지금 검색어를 채워 둔다 (10/6 QA Q4) — 비어 있으면 무엇을 검색했는지 다시 읽어야 하고,
  // 고쳐 검색하려면 처음부터 다시 쳐야 했다. 모바일은 읽기 전용 표시에 검색어를 보이고, 누르면 같은 검색어로 오버레이가 열린다.
  if (!isMobile) {
    return (
      <div>
        <SearchBar size="default" placeholder="지역, 작물, 교육, 비용 검색" syncQueryFromUrl />
      </div>
    );
  }

  return (
    <div role="button" tabIndex={0} aria-label="통합 검색 열기" onClick={open} onKeyDown={onKeyDown}>
      <SearchBar size="default" placeholder="지역, 작물, 교육, 비용 검색" readOnlyDisplay syncQueryFromUrl />
    </div>
  );
}
