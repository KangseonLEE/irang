"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import { useTapGesture } from "@/lib/hooks/use-tap-gesture";
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

  // 탭(눌렀다 뗌)만 오버레이 — 검색창을 잡고 스크롤하는 제스처는 무시 (9/7 회장 리포트)
  const tapHandlers = useTapGesture(openOverlay, isMobile);

  return (
    <div
      ref={containerRef}
      {...tapHandlers}
      role={isMobile ? "button" : undefined}
      tabIndex={isMobile ? 0 : undefined}
      aria-label={isMobile ? "통합 검색 열기" : undefined}
    >
      {isMobile ? (
        /* 모바일: 장식용 검색창 — 탭하면 전역 오버레이 호출 */
        <SearchBar
          size="large"
          placeholder="궁금한 키워드를 검색해 보세요"
          readOnlyDisplay
        />
      ) : (
        /* 데스크탑: 인라인 검색 + 드롭다운 */
        <SearchBar
          size="large"
          placeholder="궁금한 키워드를 검색해 보세요"
          richMode
        />
      )}
    </div>
  );
}
