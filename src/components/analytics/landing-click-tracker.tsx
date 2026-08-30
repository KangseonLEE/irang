"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

/**
 * 랜딩 IA 계측 (2026-08-30) — 클릭 위임.
 * 랜딩의 Server Component 링크에 `data-track="section:target"`만 붙이면 여기서 한 번에 잡는다
 * (링크마다 onClick을 달려고 Client Component로 바꾸지 않기 위해).
 * 리스너는 document에 1개, 언마운트 시 해제. GA 미로드 환경에서는 trackEvent가 조용히 no-op.
 */
export function LandingClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest<HTMLElement>("[data-track]");
      if (!el) return;
      const track = el.dataset.track;
      if (track) analytics.landingCtaClick(track);
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
