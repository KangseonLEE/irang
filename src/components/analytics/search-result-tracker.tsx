"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

/**
 * 검색 결과 카드 클릭 계측 — /search 안에서만 도는 클릭 위임 (2026-09-26).
 *
 * 카드에 `data-search-result="<type>:<순위>"` 만 붙이면 여기서 한 번에 잡는다.
 * `LandingClickTracker`(`data-track`)·`AssessEntryTracker`(`data-assess-entry`)와
 * 속성이 달라 이중 발화하지 않는다.
 *
 * 리스너는 document 에 1개, 언마운트 시 해제. GA 미로드 환경에서는 trackEvent 가 조용히 no-op.
 */
export function SearchResultTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>("[data-search-result]");
      const label = card?.dataset.searchResult;
      if (label) analytics.searchResultClick(label);
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
