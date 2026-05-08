/**
 * 귀농 적합도 진단 결과 — URL 인코딩/디코딩
 *
 * DB 저장 없이 결과 데이터를 URL 경로에 직접 인코딩하여
 * 공유 링크로 활용합니다.
 *
 * 포맷 v1 (legacy, 7 tokens):
 *   {tierNum}-{totalScore}-{dim1}-{dim2}-{dim3}-{dim4}-{dim5}
 *   예: 2-22-50-38-75-63-25
 *
 * 포맷 v2 (Phase 6 옵션 A, 8 tokens, ageGroup 추가):
 *   {tierNum}-{totalScore}-{dim1}-{dim2}-{dim3}-{dim4}-{dim5}-{ageCode}
 *   예: 2-22-50-38-75-63-25-2
 *
 * ageCode: 0=balanced/none, 1=youth, 2=30s, 3=40s, 4=50s, 5=60plus
 * (mapDemographicToPersona 와 동일 도메인)
 *
 * 차원 순서: motivation, finance, family, experience, adaptability
 *
 * Backward compatibility: 7 tokens legacy URL 진입 시 ageGroup=undefined.
 *   페르소나 섹션은 자동 미노출 (mapDemographicToPersona → balanced).
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

/* ── ageGroup 인덱스 매핑 (URL 압축용) ── */
const AGE_GROUP_BY_CODE: Record<number, string | undefined> = {
  0: undefined, // 미지정
  1: "youth",
  2: "30s",
  3: "40s",
  4: "50s",
  5: "60plus",
};

const AGE_GROUP_TO_CODE: Record<string, number> = {
  youth: 1,
  "30s": 2,
  "40s": 3,
  "50s": 4,
  "60plus": 5,
};

export interface DecodedAssessScore {
  tier: ResultTier;
  totalScore: number;
  dimensions: DimensionScore[];
  /** v2 포맷에서만 존재. legacy 7 토큰 URL 은 undefined */
  ageGroup?: string;
}

/* ── 인코딩 ── */

/**
 * 진단 결과를 URL-safe 문자열로 인코딩.
 * ageGroup 전달 시 v2 포맷 (8 tokens), 미전달 시 v1 포맷 (7 tokens).
 */
export function encodeAssessScore(
  tierId: string,
  totalScore: number,
  dimensions: DimensionScore[],
  ageGroup?: string,
): string {
  const tierIdx = TIER_IDS.indexOf(tierId as (typeof TIER_IDS)[number]) + 1;
  if (tierIdx === 0) throw new Error(`Invalid tier: ${tierId}`);

  const dimPercents = DIMENSIONS.map((d) => {
    const found = dimensions.find((dim) => dim.id === d.id);
    return found?.percent ?? 0;
  });

  const baseParts = [tierIdx, totalScore, ...dimPercents];

  if (ageGroup === undefined) {
    return baseParts.join("-");
  }

  const ageCode = AGE_GROUP_TO_CODE[ageGroup] ?? 0;
  return [...baseParts, ageCode].join("-");
}

/* ── 디코딩 ── */

/**
 * URL 경로 세그먼트에서 진단 결과 복원.
 * 7 tokens(legacy) 와 8 tokens(v2 with ageGroup) 모두 지원.
 * @returns 복원된 결과 or null (잘못된 데이터)
 */
export function decodeAssessScore(data: string): DecodedAssessScore | null {
  const parts = data.split("-").map(Number);

  // 7 tokens (legacy v1) 또는 8 tokens (v2 with ageGroup)
  if (parts.length !== 7 && parts.length !== 8) return null;
  if (parts.some((n) => isNaN(n))) return null;

  const [tierIdx, totalScore, ...rest] = parts;
  const dimPercents = rest.slice(0, 5);
  const ageCodeRaw = parts.length === 8 ? rest[5] : undefined;

  // 유효성 검증
  if (tierIdx < 1 || tierIdx > 4) return null;
  if (totalScore < 10 || totalScore > 40) return null;
  if (dimPercents.some((p) => p < 0 || p > 100)) return null;
  if (ageCodeRaw !== undefined && (ageCodeRaw < 0 || ageCodeRaw > 5)) return null;

  const tierId = TIER_IDS[tierIdx - 1];
  const tier = RESULT_TIERS.find((t) => t.id === tierId);
  if (!tier) return null;

  const dimensions: DimensionScore[] = DIMENSIONS.map((d, i) => ({
    id: d.id as DimensionId,
    label: d.label,
    score: Math.round((dimPercents[i] / 100) * 8), // percent → raw score 복원
    percent: dimPercents[i],
  }));

  const ageGroup = ageCodeRaw !== undefined ? AGE_GROUP_BY_CODE[ageCodeRaw] : undefined;

  return { tier, totalScore, dimensions, ageGroup };
}

/**
 * data 문자열이 유효한 인코딩 포맷인지 검증
 */
export function isValidAssessShareData(data: string): boolean {
  return decodeAssessScore(data) !== null;
}
