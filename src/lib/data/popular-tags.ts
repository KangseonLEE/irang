/**
 * 귀농인기 라벨 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-popular-tags.ts
 * 데이터 소스: src/lib/data/return-farm-rate.ts (KOSIS 귀농 인구 비율)
 * 마지막 갱신: 2026-05-03
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/compute-popular-tags.ts`
 *
 * 기존 sigungus.ts의 hand-curated "귀농인기" 라벨을 객관 데이터로 교체.
 * 기준: 전국 시군구 중 귀농 인구 비율 상위 25%.
 * 컷라인: 15.60% (총 33개 시군구)
 *
 * Phase 4 — 회장 작업철학 #1 (데이터 근거) 직접 부합.
 */

/** 귀농인기 시군구 SGIS 코드 (전국 상위 25%) */
export const POPULAR_RETURN_FARM_CODES: ReadonlySet<string> = new Set([
  "35560",
  "36520",
  "37530",
  "36680",
  "36630",
  "35530",
  "36560",
  "37560",
  "35520",
  "38570",
  "37540",
  "34550",
  "38600",
  "35550",
  "37520",
  "35540",
  "37610",
  "33560",
  "33580",
  "36530",
  "36590",
  "34540",
  "36550",
  "36600",
  "38580",
  "36650",
  "37580",
  "36610",
  "38560",
  "35570",
  "33590",
  "36510",
  "32520",
]);

/** 귀농인기 시군구인지 여부 (sgisCode 기준) */
export function isPopularReturnFarm(sgisCode: string): boolean {
  return POPULAR_RETURN_FARM_CODES.has(sgisCode);
}

/**
 * sigungus.ts의 hand-curated highlights를 정제한다.
 * - 기존 "귀농인기" 라벨 제거 (객관 근거 없음)
 * - 객관 기준으로 "귀농인기" 동적 추가 (KOSIS 상위 25%)
 */
export function getEnrichedHighlights(
  sgisCode: string,
  highlights: readonly string[],
): string[] {
  const cleaned = highlights.filter((h) => h !== "귀농인기");
  if (isPopularReturnFarm(sgisCode)) {
    return ["귀농인기", ...cleaned];
  }
  return cleaned;
}
