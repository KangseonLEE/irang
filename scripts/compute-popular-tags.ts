/**
 * "귀농인기" 라벨 자동 산출 스크립트 (Phase 4)
 *
 * 기존 sigungus.ts의 hand-curated "귀농인기" 라벨을 객관 데이터로 교체.
 *
 * 기준: KOSIS 귀농 인구 비율(returnFarmRate) 전국 상위 25%.
 * 도시 자치구는 KOSIS 귀농 데이터 자체가 없어 자동 제외.
 *
 * 출력: src/lib/data/popular-tags.ts
 *
 * 실행:
 *   npx tsx scripts/compute-popular-tags.ts
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { RETURN_FARM_RATE_SIGUNGU } from "../src/lib/data/return-farm-rate";

const TOP_QUARTILE = 0.25;

function main() {
  const valid = RETURN_FARM_RATE_SIGUNGU.filter(
    (r) => r.returnFarmRate !== null && r.returnFarmRate > 0,
  ).sort((a, b) => (b.returnFarmRate ?? 0) - (a.returnFarmRate ?? 0));

  const cutoff = Math.ceil(valid.length * TOP_QUARTILE);
  const popular = valid.slice(0, cutoff);
  const codes = popular.map((r) => r.sgisCode);
  const threshold = popular[popular.length - 1]?.returnFarmRate ?? 0;

  console.log(`전국 KOSIS 귀농 데이터: ${valid.length}개`);
  console.log(`상위 25%: ${cutoff}개 (귀농 비율 ${(threshold * 100).toFixed(2)}% 이상)`);
  console.log(`상위 10개:`, popular.slice(0, 10).map((r) => r.name).join(", "));

  const today = new Date().toISOString().split("T")[0];
  const output = `/**
 * 귀농인기 라벨 (자동 생성)
 *
 * 생성 스크립트: scripts/compute-popular-tags.ts
 * 데이터 소스: src/lib/data/return-farm-rate.ts (KOSIS 귀농 인구 비율)
 * 마지막 갱신: ${today}
 *
 * ⚠ 절대 수동 편집 금지. 갱신은 \`npx tsx scripts/compute-popular-tags.ts\`
 *
 * 기존 sigungus.ts의 hand-curated "귀농인기" 라벨을 객관 데이터로 교체.
 * 기준: 전국 시군구 중 귀농 인구 비율 상위 25%.
 * 컷라인: ${(threshold * 100).toFixed(2)}% (총 ${cutoff}개 시군구)
 *
 * Phase 4 — 회장 작업철학 #1 (데이터 근거) 직접 부합.
 */

/** 귀농인기 시군구 SGIS 코드 (전국 상위 25%) */
export const POPULAR_RETURN_FARM_CODES: ReadonlySet<string> = new Set([
${codes.map((c) => `  "${c}",`).join("\n")}
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
`;

  const outPath = resolve(__dirname, "../src/lib/data/popular-tags.ts");
  writeFileSync(outPath, output);
  console.log(`[wrote] ${outPath}`);
}

main();
