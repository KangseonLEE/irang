/**
 * 귀농 적합도 진단 결과 — URL 인코딩/디코딩
 *
 * DB 저장 없이 결과 데이터를 URL 경로에 직접 인코딩하여
 * 공유 링크로 활용합니다.
 *
 * 포맷: {tierNum}-{totalScore}-{dim1}-{dim2}-{dim3}-{dim4}-{dim5}
 * 예시: 2-22-50-38-75-63-25
 *       → tier=sprout, score=22, dims=[50,38,75,63,25]
 *
 * 차원 순서: motivation, finance, family, experience, adaptability
 */

import {
  RESULT_TIERS,
  DIMENSIONS,
  type DimensionId,
  type DimensionScore,
  type ResultTier,
} from "@/lib/data/assessment";

/* ── 티어 인덱스 매핑 ── */

const TIER_IDS = ["starter", "sprout", "seedling", "ready"] as const;

export interface DecodedAssessScore {
  tier: ResultTier;
  totalScore: number;
  dimensions: DimensionScore[];
}

/* ── 인코딩 ── */

/**
 * 진단 결과를 URL-safe 문자열로 인코딩
 */
export function encodeAssessScore(
  tierId: string,
  totalScore: number,
  dimensions: DimensionScore[],
): string {
  const tierIdx = TIER_IDS.indexOf(tierId as (typeof TIER_IDS)[number]) + 1;
  if (tierIdx === 0) throw new Error(`Invalid tier: ${tierId}`);

  const dimPercents = DIMENSIONS.map((d) => {
    const found = dimensions.find((dim) => dim.id === d.id);
    return found?.percent ?? 0;
  });

  return [tierIdx, totalScore, ...dimPercents].join("-");
}

/* ── 디코딩 ── */

/**
 * URL 경로 세그먼트에서 진단 결과 복원
 * @returns 복원된 결과 or null (잘못된 데이터)
 */
export function decodeAssessScore(data: string): DecodedAssessScore | null {
  const parts = data.split("-").map(Number);

  // 7개 세그먼트: tier + score + 5 dims
  if (parts.length !== 7) return null;
  if (parts.some((n) => isNaN(n))) return null;

  const [tierIdx, totalScore, ...dimPercents] = parts;

  // 유효성 검증
  if (tierIdx < 1 || tierIdx > 4) return null;
  if (totalScore < 10 || totalScore > 40) return null;
  if (dimPercents.some((p) => p < 0 || p > 100)) return null;

  const tierId = TIER_IDS[tierIdx - 1];
  const tier = RESULT_TIERS.find((t) => t.id === tierId);
  if (!tier) return null;

  const dimensions: DimensionScore[] = DIMENSIONS.map((d, i) => ({
    id: d.id as DimensionId,
    label: d.label,
    score: Math.round((dimPercents[i] / 100) * 8), // percent → raw score 복원
    percent: dimPercents[i],
  }));

  return { tier, totalScore, dimensions };
}

/**
 * data 문자열이 유효한 인코딩 포맷인지 검증
 */
export function isValidAssessShareData(data: string): boolean {
  return decodeAssessScore(data) !== null;
}
