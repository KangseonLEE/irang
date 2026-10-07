/**
 * 정착 인기 라벨 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-popular-tags.ts
 * 데이터 소스: src/lib/data/return-farm-rate.ts (KOSIS 농촌 정착 인구 비율)
 * 마지막 갱신: 2026-10-07
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 `npx tsx scripts/compute-popular-tags.ts`
 *
 * 기존 sigungus.ts의 hand-curated "정착 인기" 라벨을 객관 데이터로 교체.
 * 기준: 전국 시군구 중 농촌 정착 인구 비율 상위 25%.
 * 컷라인: 0.17% (총 35개 시군구)
 * 화면 문구는 '정착 인기'(5/19 본문 표기 결정) — 이 템플릿이 SSOT 다. 생성 파일만 고치면 다음 실행에 되돌아간다.
 *
 * Phase 4 — 회장 작업철학 #1 (데이터 근거) 직접 부합.
 */

/** 정착 인기 시군구 SGIS 코드 (전국 상위 25%) */
export const POPULAR_RETURN_FARM_CODES: ReadonlySet<string> = new Set([
  "36680",
  "35560",
  "37530",
  "22520",
  "35540",
  "36630",
  "36520",
  "35520",
  "37520",
  "37540",
  "36550",
  "34550",
  "37560",
  "38560",
  "33560",
  "36560",
  "35570",
  "33520",
  "36580",
  "36590",
  "38570",
  "37610",
  "36650",
  "32530",
  "35550",
  "38510",
  "38600",
  "38580",
  "36610",
  "38550",
  "34530",
  "35580",
  "35530",
  "36670",
  "36600",
]);

/** 정착 인기 시군구인지 여부 (sgisCode 기준) */
function isPopularReturnFarm(sgisCode: string): boolean {
  return POPULAR_RETURN_FARM_CODES.has(sgisCode);
}

/**
 * sigungus.ts의 hand-curated highlights를 정제한다.
 * - 기존 "정착 인기" 라벨 제거 (객관 근거 없음)
 * - 객관 기준으로 "정착 인기" 동적 추가 (KOSIS 상위 25%)
 */
export function getEnrichedHighlights(
  sgisCode: string,
  highlights: readonly string[],
): string[] {
  const cleaned = highlights.filter((h) => h !== "정착 인기");
  if (isPopularReturnFarm(sgisCode)) {
    return ["정착 인기", ...cleaned];
  }
  return cleaned;
}
