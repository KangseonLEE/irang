/**
 * 차원 메타데이터 — 라벨·ID 목록 (경량).
 *
 * 번들 다이어트(2026-07-27): client 컴포넌트(ranking-wizard-hero·sigungu-detail-modal)가
 * 거대 배열 DIMENSION_SCORES(약 8,800줄)를 끌어오지 않고 라벨/ID만 쓰도록 분리했다.
 * dimension-scores.ts는 이 파일을 re-export하므로 서버 코드 import 경로는 무변경.
 * client 컴포넌트는 반드시 이 파일(`@/lib/data/dimension-meta`)에서 import할 것 —
 * `dimension-scores.ts`에서 라벨만 import해도 Turbopack이 DIMENSION_SCORES를 함께
 * 번들에 포함(tree-shaking 실패)하므로 217KB가 client 청크로 유입된다.
 */

/** 차원별 라벨 (UI/methodology 공용) */
export const DIMENSION_LABELS = {
  populationTrend: "인구 추세",
  farmActivity: "농가 활성도",
  medical: "의료 인프라",
  school: "학교 인프라",
  returnFarm: "농촌 정착 활성도",
} as const;

export type DimensionId = keyof typeof DIMENSION_LABELS;

export const DIMENSION_IDS: DimensionId[] = [
  "populationTrend",
  "farmActivity",
  "medical",
  "school",
  "returnFarm",
];
