/**
 * /stats 통합 페이지의 5탭 정의.
 * server component(page.tsx)와 client component(stats-client.tsx) 모두에서 사용.
 *
 * ⚠️ Next.js 16: client component 파일에서 export한 일반 변수를 server component가
 * import하면 RSC 직렬화 reference로 들어와 배열 메서드가 동작하지 않음. 그래서
 * 공유 상수는 별도 파일(`"use client"` 디렉티브 없는 파일)로 분리해야 함.
 */
export const STATS_TABS = [
  { id: "farming", label: "귀농" },
  { id: "village", label: "귀촌" },
  { id: "youth", label: "청년농" },
  { id: "mountain", label: "귀산촌" },
  { id: "smartfarm", label: "스마트팜" },
] as const;

export type StatsTabId = (typeof STATS_TABS)[number]["id"];
