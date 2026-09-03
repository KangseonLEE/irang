"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics";

/** 우리 도메인 — 여기로 가는 링크는 외부 이탈이 아니다 */
const INTERNAL_HOSTS = new Set(["irangfarm.com", "www.irangfarm.com", "localhost"]);

/**
 * 외부 링크 이탈 계측 (2026-09-03, 회장 지시) — 클릭 위임.
 * 지원사업 원문·출처·기사·기관 사이트 등 사이트 전역의 `<a href="http…">` 외부 이동을 document 리스너 1개로 잡는다
 * (LandingClickTracker와 같은 패턴 — 링크마다 onClick을 달지 않는다). 라벨은 `host/path`(GA4 파라미터 100자 한도),
 * 어느 페이지에서 나갔는지는 GA4가 모든 이벤트에 붙이는 page_location으로 본다.
 * 가운데 버튼(auxclick)·⌘/Ctrl 클릭도 새 탭 이동이므로 함께 집계. GA 미로드 환경에서는 trackEvent가 조용히 no-op.
 */
export function OutboundClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.type === "auxclick" && e.button !== 1) return;
      const target = e.target;
      if (!(target instanceof Element)) return;
      const a = target.closest<HTMLAnchorElement>("a[href]");
      if (!a) return;
      let url: URL;
      try {
        url = new URL(a.href, window.location.href);
      } catch {
        return;
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") return;
      if (INTERNAL_HOSTS.has(url.hostname) || url.hostname === window.location.hostname) return;
      analytics.externalClick(`${url.hostname}${url.pathname}`.slice(0, 100));
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    document.addEventListener("auxclick", onClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);
  return null;
}
