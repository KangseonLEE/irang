/**
 * '활발한 지역' 귀농·귀촌 상위 5 — KOSIS 귀농어·귀촌인 통계 2025 (scripts/collect-active-regions-stats.ts 가 생성, 손으로 고치지 않는다)
 *
 * 귀농인: DT_1A02002(T02) · 귀촌인: DT_1A02015(T01). 응답 지역명이 우리 시·군·구 이름과 같은 행만 썼다.
 * 수집일: 2026-10-10 · 다음 공표: 매년 6월 말(전년 통계)
 */

export interface ActiveRegionStat {
  sigunguId: string;
  /** 사람 수 (명) */
  count: number;
  /** 전국 시·군 순위 (같은 수면 같은 순위) */
  rank: number;
}

export const ACTIVE_RETURN_YEAR = 2025;

/** 귀농인 많은 시·군 상위 5 */
export const RETURN_FARM_TOP: ActiveRegionStat[] = [
  {
    "sigunguId": "goheung",
    "count": 153,
    "rank": 1
  },
  {
    "sigunguId": "sinan",
    "count": 138,
    "rank": 2
  },
  {
    "sigunguId": "uiseong",
    "count": 138,
    "rank": 2
  },
  {
    "sigunguId": "sangju",
    "count": 125,
    "rank": 4
  },
  {
    "sigunguId": "naju",
    "count": 121,
    "rank": 5
  }
];

/** 귀촌인 많은 시·군 상위 5 */
export const RETURN_RURAL_TOP: ActiveRegionStat[] = [
  {
    "sigunguId": "hwaseong",
    "count": 23790,
    "rank": 1
  },
  {
    "sigunguId": "namyangju",
    "count": 14980,
    "rank": 2
  },
  {
    "sigunguId": "yongin",
    "count": 14623,
    "rank": 3
  },
  {
    "sigunguId": "asan",
    "count": 13896,
    "rank": 4
  },
  {
    "sigunguId": "cheongju",
    "count": 13790,
    "rank": 5
  }
];
