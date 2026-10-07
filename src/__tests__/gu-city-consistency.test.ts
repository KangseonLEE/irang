/**
 * 시와 그 아래 구가 같은 것을 셀 때 서로 맞는가 — 10/7 독립 QA 후속
 *
 * 보호 대상:
 *   1) 시 면적 = 구 면적 합 (화성 688.28 ≠ 4구 합 706.50 이었다 — 시 값이 옛 자료). 성남은 원래 있던 1.52㎢ 차이
 *      (출처 대조 전) — 아래 표에 사유와 함께 둔다. 새 차이가 생기면 실패
 *   2) 인구 추이 '시·도 평균'은 그 시·도의 시·군·구 단위만 — 구 행·시 합산 행이 겹쳐 들어가 경기 평균이 −14% 였다
 *   3) 화성 312500(구 미배정 심평원 코드) 기관 → 구 판정: 읍·면·동 이름 우선, 없으면 주소 법정동, 두 구면 null
 */

import { describe, expect, it } from "vitest";

import { GUS, getGusOfCity } from "@/lib/data/gus";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { POPULATION_TREND_SIGUNGU } from "@/lib/data/population-trend";
import { sidoSigunguAverageByYear } from "@/lib/data/population-trend-average";
import { residualItemGuId } from "@/lib/api/hira";

/** 원래 있던 시 면적 ↔ 구 면적 합 차이 — 출처를 대조하기 전까지 사유와 함께 둔다 */
const KNOWN_AREA_GAP: Record<string, string> = {
  seongnam: "시 141.74 vs 구 합 140.22 — 10/7 이전부터. 성남시 공식 면적 출처 대조 전",
};

describe("시 면적 = 구 면적 합", () => {
  const cities = [...new Set(GUS.map((g) => g.parentSigunguId))];
  it.each(cities)("%s", (cityId) => {
    const city = SIGUNGUS.find((s) => s.id === cityId)!;
    const sum = GUS.filter((g) => g.parentSigunguId === cityId).reduce((a, g) => a + g.area, 0);
    if (KNOWN_AREA_GAP[cityId]) return;
    expect(Math.abs(sum - city.area), `${cityId} 시 ${city.area} vs 구 합 ${sum.toFixed(2)}`).toBeLessThanOrEqual(0.05);
  });

  it("화성시 = 화성특례시 '화성시 전체면적' 2026.4.30 기준 706.50㎢", () => {
    expect(SIGUNGUS.find((s) => s.id === "hwaseong")!.area).toBe(706.5);
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
