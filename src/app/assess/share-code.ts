/**
 * 적합도 진단(14문항) 결과 공유 코드 — `/a/{code}`(= /assess/r/{code}) 가 이 코드로 결과를 다시 그린다 (2026-10-06 QA Q4-W11).
 *
 * 디코더는 src/lib/assess-share.ts `decodeAssessScore` — 이 파일은 그 짝인 인코더다. 4/18 공유 버튼이 진단 첫 화면(/assess)
 * 링크로 바뀌며 호출처가 사라졌고, 9/4 knip 정리 때 인코더가 함께 지워졌다. 포맷(v2, 8 토큰):
 *   {tierNum}-{totalScore}-{motivation}-{finance}-{family}-{experience}-{adaptability}-{ageCode}
 * 왕복(encode → decode)은 src/__tests__/qa1006-fed2-assess-share.test.ts 가 지킨다.
 */
import { DIMENSIONS, type DimensionScore } from "@/lib/data/assessment";

/** decodeAssessScore 의 TIER_IDS 와 같은 순서(1부터) */
const TIER_IDS = ["starter", "sprout", "seedling", "ready"] as const;

/** decodeAssessScore 의 AGE_GROUP_BY_CODE 역방향 — 모르는 연령대는 0(미지정) */
const AGE_CODE: Record<string, number> = {
  youth: 1,
  "30s": 2,
  "40s": 3,
  "50s": 4,
  "60plus": 5,
};

/** 결과 → 공유 코드. 등급을 모르면 null (공유 버튼이 현재 주소로 물러난다) */
export function encodeAssessScore(
  tierId: string,
  totalScore: number,
  dimensions: readonly DimensionScore[],
  ageGroup?: string,
): string | null {
  const tierNum = TIER_IDS.indexOf(tierId as (typeof TIER_IDS)[number]) + 1;
  if (tierNum === 0) return null;
  const percents = DIMENSIONS.map((d) => dimensions.find((dim) => dim.id === d.id)?.percent ?? 0);
  const ageCode = ageGroup ? (AGE_CODE[ageGroup] ?? 0) : 0;
  return [tierNum, totalScore, ...percents, ageCode].join("-");
}

/** 공유 단축 주소 — next.config 리라이트 `/a/:data` → `/assess/r/:data` */
export function assessSharePath(code: string): string {
  return `/a/${code}`;
}
