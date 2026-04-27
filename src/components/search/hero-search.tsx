"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import SearchBar from "./search-bar";

/**
 * 히어로 인라인 검색창.
 * - 데스크탑: 포커스 시 그 자리에 드롭다운이 펼쳐지며 추천/인기/바로탐색 노출 (richMode)
 * - 모바일(< 640px): 탭하면 GNB와 동일한 전역 SearchOverlay 풀레이아웃 호출
 */
export default function HeroSearch() {
  const { open: openOverlay } = useSearchOverlay();
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div
      ref={containerRef}
      onPointerDown={isMobile ? handleMobileTap : undefined}
    >
      {isMobile ? (
        /* 모바일: 장식용 검색창 — 탭하면 전역 오버레이 호출 */
        <SearchBar
          size="large"
          placeholder="지역, 작물, 교육, 비용 검색..."
          readOnlyDisplay
        />
      ) : (
        /* 데스크탑: 인라인 검색 + 드롭다운 */
        <SearchBar
          size="large"
          placeholder="지역, 작물, 교육, 비용 검색..."
          richMode
        />
      )}
    </div>
  );
}
