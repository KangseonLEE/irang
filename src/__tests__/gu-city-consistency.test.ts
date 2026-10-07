/**
 * 시와 그 아래 구가 같은 것을 셀 때 서로 맞는가 — 10/7 독립 QA 후속
 *
 * 보호 대상:
 *   1) 시 면적 = 구 면적 합 — 화성 688.28 ≠ 4구 합 706.50, 성남 141.74 ≠ 140.22 였다(옛 값이 해마다 섞임).
 *      10/7 지적통계 2025 로 일괄 갱신(scripts/collect-areas.ts) 뒤 13개 시 전부 일치
 *   2) 인구 추이 '시·도 평균'은 그 시·도의 시·군·구 단위만 — 구 행·시 합산 행이 겹쳐 들어가 경기 평균이 −14% 였다
 *   3) 화성 312500(구 미배정 심평원 코드) 기관 → 구 판정: 읍·면·동 이름 우선, 없으면 주소 법정동, 두 구면 null
 */

import { describe, expect, it } from "vitest";

import { GUS, getGusOfCity } from "@/lib/data/gus";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { PROVINCES } from "@/lib/data/regions";
import { POPULATION_TREND_SIGUNGU } from "@/lib/data/population-trend";
import { sidoSigunguAverageByYear } from "@/lib/data/population-trend-average";
import { residualItemGuId } from "@/lib/api/hira";

describe("시 면적 = 구 면적 합", () => {
  const cities = [...new Set(GUS.map((g) => g.parentSigunguId))];
  it.each(cities)("%s", (cityId) => {
    const city = SIGUNGUS.find((s) => s.id === cityId)!;
    const sum = GUS.filter((g) => g.parentSigunguId === cityId).reduce((a, g) => a + g.area, 0);
    expect(Math.abs(sum - city.area), `${cityId} 시 ${city.area} vs 구 합 ${sum.toFixed(2)}`).toBeLessThanOrEqual(0.05);
  });

  it("화성시 = 지적통계 2025 = 화성특례시 '화성시 전체면적' 2026.4.30 = 706.50㎢, 성남시 = 141.63㎢(수정 45.45·중원 26.42·분당 69.76)", () => {
    expect(SIGUNGUS.find((s) => s.id === "hwaseong")!.area).toBe(706.5);
    expect(SIGUNGUS.find((s) => s.id === "seongnam")!.area).toBe(141.63);
  });

  it("대구 면적에 군위(2023 편입)가 들어 있다 — 883 → 1,499.68㎢, 경북에선 빠졌다", () => {
    expect(PROVINCES.find((p) => p.id === "daegu")!.area).toBe(1499.68);
    expect(PROVINCES.find((p) => p.id === "gyeongbuk")!.area).toBeLessThan(19000);
  });
});

describe("인구 추이 '시·도 평균' — 시·군·구 단위만", () => {
  it("경기 평균은 경기 시·군 31곳의 값만 더해 나눈다 (구 행·화성 신설 구 제외)", () => {
    const codes = new Set(SIGUNGUS.filter((s) => s.sidoId === "gyeonggi").map((s) => s.sgisCode));
    const year = 2022;
    const pts = POPULATION_TREND_SIGUNGU.filter((p) => p.year === year && codes.has(p.sgisCode));
    expect(pts.length).toBe(codes.size);
    const expected = Math.round(pts.reduce((a, p) => a + p.population, 0) / pts.length);
    expect(sidoSigunguAverageByYear("gyeonggi").get(year)).toBe(expected);
    // 예전 방식(시·도 코드로 시작하는 행 전부)은 구 행이 겹쳐 더 작았다
    const naive = POPULATION_TREND_SIGUNGU.filter((p) => p.year === year && p.sgisCode.startsWith("31"));
    expect(naive.length).toBeGreaterThan(pts.length);
  });
});

describe("화성 312500 기관 → 구 (residualItemGuId)", () => {
  const hs = getGusOfCity("gyeonggi", "hwaseong");
  it("읍·면·동 이름이 먼저 — 송산면·남양읍은 만세구", () => {
    expect(residualItemGuId({ emdongNm: "송산면", addr: "경기도 화성시 송산면 사강로 1" }, hs)).toBe("manse-gu");
    expect(residualItemGuId({ emdongNm: "남양읍", addr: "경기도 화성시 남양읍 안석길 1 (안석동)" }, hs)).toBe("manse-gu");
  });
  it("읍·면·동 이름이 없으면 주소의 법정동 — 반송동은 동탄구", () => {
    expect(residualItemGuId({ emdongNm: "", addr: "경기도 화성시 동탄대로 1 (반송동)" }, hs)).toBe("dongtan-gu");
  });
  it("두 구에 걸친 능동·법정 구역이 없는 주소는 어느 구에도 넣지 않는다", () => {
    expect(residualItemGuId({ emdongNm: "능동", addr: "경기도 화성시 동탄원천로 1 (능동)" }, hs)).toBeNull();
    expect(residualItemGuId({ addr: "경기도 화성시 시청로 159" }, hs)).toBeNull();
  });
});
