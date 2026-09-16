"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

/**
 * 진단 진입 CTA 계측 (2026-09-16) — 사이트 전역 클릭 위임.
 *
 * `data-assess-entry="<지면>"` 만 붙이면 여기서 한 번에 잡는다. 링크마다 onClick 을 달려고
 * Server Component 를 Client 로 바꾸지 않기 위해서 (LandingClickTracker 와 같은 패턴).
 * 랜딩 전용인 LandingClickTracker(`data-track`)와 속성이 달라 이중 발화하지 않는다.
 *
 * 리스너는 document 에 1개, 언마운트 시 해제. GA 미로드 환경에서는 trackEvent 가 조용히 no-op.
 */
export function AssessEntryTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>("[data-assess-entry]");
      const from = el?.dataset.assessEntry;
      if (from) analytics.assessEntryClick(from);
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
