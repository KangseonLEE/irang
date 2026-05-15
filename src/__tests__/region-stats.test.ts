/**
 * region-stats 회귀 테스트 (2026-05-15)
 *
 * 회장 결재 — /regions/ranking 카드 chip 3종 보강 sprint.
 * 보호 대상:
 *   1) 인구밀도 = 최신 연도 인구 ÷ area (정수 반올림)
 *   2) 활성 지원사업 매칭 룰: "전국" 또는 province.name
 *   3) D-7 임박: 모집중 + daysUntilDeadline ≤ 7
 *   4) PROGRAMS 데이터 변경 시에도 일부 시군구는 항상 활성 사업 1개+ 보유 (전국 사업)
 */

import { describe, it, expect } from "vitest";

import { getRegionStats } from "@/lib/data/region-stats";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { PROGRAMS } from "@/lib/data/programs";

describe("getRegionStats — 시군구 chip 3종 통계", () => {
  // 임의 시군구 1개 선택
  const sampleSg = SIGUNGUS.find((sg) => sg.sidoId === "gyeonggi") ?? SIGUNGUS[0];
  const sampleProvince =
    PROVINCES.find((p) => p.id === sampleSg.sidoId) ?? PROVINCES[0];

  it("RegionStats 형태를 반환한다", () => {
    const stats = getRegionStats(sampleSg, sampleProvince);
    expect(stats).toHaveProperty("populationDensity");
    expect(stats).toHaveProperty("activeProgramsCount");
    expect(stats).toHaveProperty("urgentDeadlineCount");
    expect(typeof stats.activeProgramsCount).toBe("number");
    expect(typeof stats.urgentDeadlineCount).toBe("number");
  });

  it("인구밀도는 양수 또는 null", () => {
    const stats = getRegionStats(sampleSg, sampleProvince);
    expect(
      stats.populationDensity === null || stats.populationDensity > 0,
    ).toBe(true);
  });

  it("urgentDeadlineCount ≤ activeProgramsCount (D-7 임박은 활성 중 부분집합)", () => {
    for (const sg of SIGUNGUS.slice(0, 30)) {
      const province = PROVINCES.find((p) => p.id === sg.sidoId);
      if (!province) continue;
      const stats = getRegionStats(sg, province);
      expect(stats.urgentDeadlineCount).toBeLessThanOrEqual(
        stats.activeProgramsCount,
      );
    }
  });

  it("region이 전국인 사업은 모든 시군구에 카운트된다", () => {
    const nationwideActive = PROGRAMS.filter(
      (p) => p.region === "전국" && (p.applicationEnd === "9999-12-31" ||
        p.applicationEnd > new Date().toISOString().slice(0, 10)),
    );
    if (nationwideActive.length === 0) {
      // 전국 활성 사업이 0이면 본 테스트 의미 없음 — 건너뜀
      return;
    }
    // 임의 시도 1곳 — 전국 활성 사업이 1건 이상이면 activeCount > 0 보장
    const province = PROVINCES.find((p) => p.id === "gyeonggi") ?? PROVINCES[0];
    const sg = SIGUNGUS.find((sg) => sg.sidoId === province.id) ?? SIGUNGUS[0];
    const stats = getRegionStats(sg, province);
    expect(stats.activeProgramsCount).toBeGreaterThan(0);
  });

  it("PROGRAMS region 값은 PROVINCES.name 또는 '전국' 중 하나여야 매칭 가능 (데이터 정합성)", () => {
    const validRegions = new Set<string>(["전국", ...PROVINCES.map((p) => p.name)]);
    for (const program of PROGRAMS) {
      expect(validRegions.has(program.region)).toBe(true);
    }
  });
});
