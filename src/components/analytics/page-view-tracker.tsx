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
 *
 * 제목은 채워질 때까지 기다렸다 보낸다 (2026-10-30). 클라이언트 이동에서 경로가 바뀐 순간
 * `document.title` 이 5~20ms 동안 빈 문자열이다 — Next 가 새 화면의 메타데이터를 스트리밍하므로
 * 옛 <title> 은 빠졌는데 새 <title> 은 아직 안 왔다(10/30 운영 실측: /crops/eggplant·/regions/gyeonggi,
 * 정적 /programs/SP-022 는 바로 옴). 10/26 미리 받기(prefetch)를 끄면서 메타데이터가 클릭 뒤에 오게 돼
 * GA pageTitle "(not set)" 이 하루 1~2건 → 32·37·65건으로 뛰었다. 비어 있으면 <title> 변화를 지켜보다
 * 채워지는 순간 보내고, 2초가 지나거나 그 전에 또 이동하면 그때 값으로 보낸다(조회수는 잃지 않는다).
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { captureLandingTags, noteVisitedPath } from "@/lib/assess-entry";

/** 제목이 비어 있을 때 기다리는 최대 시간 — 실측 공백은 5~20ms, 느린 회선 여유 */
export const PAGE_TITLE_WAIT_MS = 2000;

export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    noteVisitedPath(pathname); // 진단 진입 직전 경로 — 결과 저장 때 entry_path (10/20)
    if (lastSent.current === null) {
      captureLandingTags(window.location.search); // 첫 방문 utm — 결과 저장 때 함께 (10/20)
      lastSent.current = pathname; // 최초 로드 — gtag('config')가 page_view를 보냈다
      return;
    }
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    const send = (title: string) => {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: title,
      });
    };
    if (document.title) {
      send(document.title);
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      observer.disconnect();
      window.clearTimeout(timer);
      send(document.title);
    };
    const observer = new MutationObserver(() => {
      if (document.title) finish();
    });
    // 새 <title> 은 React 가 <head> 로 올리지만, 스트리밍 중엔 본문에 먼저 올 수 있어 문서 전체를 본다
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
    const timer = window.setTimeout(finish, PAGE_TITLE_WAIT_MS);
    return finish;
  }, [pathname]);

  return null;
}
