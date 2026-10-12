/**
 * 인구 연도 SSOT 계약 (2026-10-12, 정합성 대조 #173).
 * 화면이 SGIS 에 묻는 해와 정적 인구 추이의 마지막 해가 따로 움직이면, 조회가 실패한 순간 다른 해 값이 연도 표기 없이 나온다.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { POPULATION_TREND_SIGUNGU, POPULATION_TREND_YEARS } from "@/lib/data/population-trend";
import { SGIS_POPULATION_YEAR } from "@/lib/data/population-year";

const ROOT = resolve(__dirname, "../..");

describe("인구 연도 SSOT", () => {
  it("화면 조회 연도 = 정적 추이 마지막 해", () => {
    expect(SGIS_POPULATION_YEAR).toBe(POPULATION_TREND_YEARS[POPULATION_TREND_YEARS.length - 1]);
  });

  it("정적 추이는 연속 5년이고 모든 지역이 그 5년을 한 번씩 갖는다", () => {
    expect(POPULATION_TREND_YEARS).toHaveLength(5);
    POPULATION_TREND_YEARS.forEach((y, i) => i && expect(y - POPULATION_TREND_YEARS[i - 1]).toBe(1));
    const byCode = new Map<string, number[]>();
    for (const p of POPULATION_TREND_SIGUNGU) byCode.set(p.sgisCode, [...(byCode.get(p.sgisCode) ?? []), p.year]);
    const bad = [...byCode].filter(([, ys]) => [...ys].sort().join() !== POPULATION_TREND_YEARS.join());
    expect(bad).toEqual([]);
  });

  it("인구 조회 경로가 연도를 따로 계산하지 않는다 (올해 − 2 금지)", () => {
    const files = [
      "src/lib/api/sgis.ts",
      "src/app/api/population-trend/route.ts",
      "src/lib/data/region-reorganizations.ts",
      "scripts/check-region-stats-integrity.ts",
    ];
    for (const f of files) {
      expect(readFileSync(resolve(ROOT, f), "utf8"), f).not.toMatch(/getFullYear\(\)\s*-\s*2/);
    }
  });
});
