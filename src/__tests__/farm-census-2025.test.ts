/**
 * 농가 통계 = 2025 농림어업총조사 확정(KOSIS 101/DT_1AG25104) 계약 (2026-10-08)
 *
 * scripts/collect-farms.ts 가 생성한 lib/data/farms.ts 가
 * 1) 확정 보도자료의 전국 합(1,241,730호·2,506,639명)과 같고
 * 2) 행정동 묶음 신설 구(인천·화성 2026)를 뺀 모든 시·군·구·구에 값이 있으며
 * 3) 신설 구에는 값이 없고(조사 기준일 2025-12-01 경계 — 지어내지 않는다)
 * 4) 통합시는 구 합이다(원천에서 시 = 구 합 확인)
 * 재수집으로 연도·원천이 바뀌면 여기서 먼저 깨진다.
 */
import { describe, it, expect } from "vitest";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";
import { getFarmFallback } from "@/lib/data/farms";
import { getSgisComposite } from "@/lib/data/region-composites";
import { INTEGRATED_CITY_GU_CODES } from "@/lib/data/integrated-cities";

describe("농가 통계 2025 총조사", () => {
  it("시·도 17곳 합 = 확정 보도자료 전국 값", () => {
    const farm = PROVINCES.reduce((a, p) => a + (getFarmFallback(p.sgisCode)?.farmCount ?? NaN), 0);
    const pop = PROVINCES.reduce((a, p) => a + (getFarmFallback(p.sgisCode)?.farmPopulation ?? NaN), 0);
    expect(farm).toBe(1_241_730);
    expect(pop).toBe(2_506_639);
  });

  it("신설 구를 뺀 모든 단위에 값이 있고, 신설 구엔 없다", () => {
    const missing: string[] = [];
    const unexpected: string[] = [];
    for (const u of [...SIGUNGUS, ...GUS]) {
      const has = getFarmFallback(u.sgisCode) !== null;
      if (getSgisComposite(u.sgisCode)) {
        if (has) unexpected.push(u.name);
      } else if (!has) {
        missing.push(u.name);
      }
    }
    expect(missing).toEqual([]);
    expect(unexpected).toEqual([]);
  });

  it("통합시 = 구 합", () => {
    for (const [city, guCodes] of Object.entries(INTEGRATED_CITY_GU_CODES)) {
      const c = getFarmFallback(city)!;
      const sum = guCodes.reduce((a, g) => a + getFarmFallback(g)!.farmCount, 0);
      expect(c.farmCount, city).toBe(sum);
    }
  });

  it("확정 보도자료 표본 — 화성시 12,994호·제주시 23,221호·청주시 22,099호", () => {
    const by = (name: string) => getFarmFallback(SIGUNGUS.find((s) => s.name === name)!.sgisCode)!.farmCount;
    expect(by("화성시")).toBe(12_994);
    expect(by("제주시")).toBe(23_221);
    expect(by("청주시")).toBe(22_099);
  });
});
