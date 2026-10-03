"use client";

import { useSyncExternalStore, type ComponentProps } from "react";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { kstToday } from "@/lib/program-status";

/** 날짜는 구독할 바깥 변화가 없다 — 스냅샷만 읽는다 */
const subscribeNoop = () => () => {};
const clientToday = () => kstToday();
const serverToday = () => null;

/**
 * 검색 결과 카드의 마감 D-N 배지 (10/3 QA — FE-C 보고).
 *
 * 결과 카드는 클라이언트 트리라 서버가 "오늘"을 넘길 자리가 없다(search/page.tsx 가 "use client").
 * 서버 HTML(그날 날짜)과 브라우저(오늘)의 D-N 이 갈리면 React #418 — dev SSR 에서 브라우저 시계 +22일로 재현했다
 * ("마감 D-5" 가 브라우저에만 있어 하이드레이션 실패).
 *
 * 그래서 **하이드레이션 중에는 배지를 그리지 않고** 끝난 직후 오늘 기준으로 그린다(서버 스냅샷 null).
 * - 운영 빌드의 /search 는 정적 프리렌더 + Suspense CSR 전환이라 결과 카드가 처음부터 클라이언트에서 그려진다
 *   (하이드레이션 아님) → 첫 렌더에 바로 배지가 있다. 자리 이동 없음.
 * - 하이드레이션되는 경우(dev SSR 등)에만 배지가 한 박자 늦게 붙는다.
 */
export function SearchDeadlineBadge(props: Omit<ComponentProps<typeof DeadlineBadge>, "today">) {
  const today = useSyncExternalStore(subscribeNoop, clientToday, serverToday);
  if (today === null) return null;
  return <DeadlineBadge {...props} today={today} />;
}
