"use client";

/**
 * SPA 경로 변경 page_view (2026-09-08)
 *
 * gtag('config')는 최초 로드에서만 page_view를 보낸다. Next.js App Router의 클라이언트 이동(Link)은
 * 아무도 page_view를 보내지 않아, 랜딩에서 이동해 들어가는 /assess·/match 같은 페이지의 조회수가
 * GA4에서 0건이었다(9/8 볼트 세션 Data API 실측: /assess page_view 0, assess_start 11명).
 * "도달 → 시작" 전환율을 재려면 도달(page_view)이 먼저 있어야 한다 — M7 기준선 #2 계측.
 *
 * - 최초 렌더는 건너뛴다(config가 이미 보냄). 경로·쿼리가 바뀔 때만 전송.
 * - GA4 스트림의 "향상된 측정 → 브라우저 기록 이벤트에 따른 페이지 변경"이 켜져 있으면 중복이므로
 *   그 옵션은 꺼 둔다(실측상 꺼져 있었음 — 켜져 있었다면 /assess가 0일 수 없다).
 * - useSearchParams 사용 → 반드시 <Suspense>로 감싸 bailout을 이 자리에 격리한다(6/1 사고).
 */

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const path = query ? `${pathname}?${query}` : pathname;
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (lastSent.current === null) {
      // 최초 로드 — gtag('config')가 page_view를 보냈다
      lastSent.current = path;
      return;
    }
    if (lastSent.current === path) return;
    lastSent.current = path;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [path]);

  return null;
}
