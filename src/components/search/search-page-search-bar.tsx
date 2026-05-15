"use client";

import { useCallback, useEffect, useState } from "react";
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

  const handleMobileTap = useCallback(() => {
    if (isMobile) openOverlay();
  }, [isMobile, openOverlay]);

  return (
    <div onPointerDown={isMobile ? handleMobileTap : undefined}>
      {isMobile ? (
        <SearchBar
          size="default"
          placeholder="지역, 작물, 교육, 비용 검색"
          readOnlyDisplay
        />
      ) : (
        <SearchBar
          size="default"
          placeholder="지역, 작물, 교육, 비용 검색"
        />
      )}
    </div>
  );
}
