"use client";

/**
 * SPA 경로 변경 page_view (2026-09-08)
 *
 * gtag('config')는 최초 로드에서만 page_view를 보낸다. Next.js App Router의 클라이언트 이동(Link)은
 * 아무도 page_view를 보내지 않아, 랜딩에서 이동해 들어가는 /assess·/match 같은 페이지의 조회수가
 * GA4에서 0건이었다(9/8 Data API 실측: /assess page_view 0, assess_start 11명). "도달 → 시작"
 * 전환을 재려면 도달(page_view)이 먼저 있어야 한다 — M7 기준선 계측.
 *
 * usePathname 만 쓴다(useSearchParams ✗): searchParams 를 읽으면 CSR bailout 마커가 방출돼
 * 6/1 사고 방지용 Suspense 가 필요하고 §13 SSR 감시에 걸린다. reach 지표는 경로 단위면 충분하고,
 * 같은 페이지의 쿼리 토글(?tab=·필터)까지 새 page_view 로 세면 오히려 조회수가 부풀려진다.
 * - 최초 렌더는 건너뛴다(config 가 이미 보냄). 경로가 바뀔 때만 전송.
 * - GA4 스트림 "향상된 측정 → 브라우저 기록 이벤트"는 꺼진 채 유지(켜면 이중 집계).
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (lastSent.current === null) {
      lastSent.current = pathname; // 최초 로드 — gtag('config')가 page_view를 보냈다
      return;
    }
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
