/**
 * 인천 신설 4개 구 — 행정동 합산 회귀 테스트 (2026-10-07 A안)
 *
 * 보호 대상:
 *   1) 신설 구 정의(region-composites.ts)가 sigungus.ts 와 맞는다 — 국가데이터처 분류 코드·이름·시·도
 *   2) 나뉜 옛 구의 행정동이 빠짐없이, 겹치지 않게 신설 구로 나뉜다 (SGIS 2024 실제 코드)
 *   3) 정의한 동이 응답에 없거나 모르는 동이 나오면 합을 내지 않는다 — 덜 센 합 금지
 *   4) 인구 = 옛 구 + 행정동 합 (SGIS 2024 실측값으로 고정: 네 구 합 = 옛 중구+동구+서구)
 *   5) 농가는 비공개(N/A) 동이 있으면 합을 내지 않는다, 2020 조사엔 없던 아라동도 검단(나머지)으로 맞는다
 *   6) 영종·검단은 '나머지' — 옛 구 쪽 행정동이 더 나뉘어도(운서1·2동, 아라1·2동) 합이 맞는다
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  REPLACED_SGIS_GU,
  SGIS_COMPOSITES,
  compositeRows,
  getSgisComposite,
  resolveSplitGu,
} from "@/lib/data/region-composites";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { PROVINCES } from "@/lib/data/regions";
import { fetchFarmHousehold, fetchSigunguPopulationData, fetchSubRegionPopulations } from "@/lib/api/sgis";
import { POPULATION_TREND_SIGUNGU, POPULATION_TREND_YEARS } from "@/lib/data/population-trend";

// SGIS 2024 인구 (10/7 실측) — [코드, 인구]
const JUNG_2024: [string, number][] = [
  ["23010520", 5366], ["23010530", 4817], ["23010540", 14592], ["23010560", 3548], ["23010570", 2916], ["23010580", 5548],
  ["23010630", 3245], ["23010640", 38404], ["23010650", 21389], ["23010670", 7229], ["23010681", 32784], ["23010691", 25099],
];
const SEO_2024: [string, number][] = [
  ["23080510", 54558], ["23080531", 37088], ["23080541", 41399], ["23080550", 16839], ["23080560", 8527], ["23080580", 20369],
  ["23080590", 12940], ["23080600", 12436], ["23080620", 14299], ["23080630", 17874], ["23080640", 15304], ["23080650", 12325],
  ["23080730", 29597], ["23080740", 29926], ["23080780", 46731], ["23080790", 35617], ["23080800", 33908], ["23080810", 22957],
  ["23080840", 26769], ["23080850", 28110], ["23080860", 20968], ["23080870", 24476], ["23080880", 71049],
];
const DONG_GU_2024 = 57944;
const codes = (rows: [string, number][]) => rows.map(([c]) => c);

describe("정의 — sigungus.ts 와 맞물림", () => {
  it("신설 구마다 같은 id·임시 코드·이름의 인천 시·군·구가 있다", () => {
    for (const c of SGIS_COMPOSITES) {
      const sg = SIGUNGUS.find((s) => s.id === c.sigunguId);
      expect(sg, c.sigunguId).toBeDefined();
      expect([sg!.sgisCode, sg!.name, sg!.sidoId]).toEqual([c.sgisCode, c.name, "incheon"]);
      expect(c.sgisCode.startsWith(PROVINCES.find((p) => p.id === "incheon")!.sgisCode)).toBe(true);
      expect(getSgisComposite(c.sgisCode)).toBe(c);
    }
    expect(SGIS_COMPOSITES.map((c) => c.sigunguId).sort()).toEqual(["geomdan", "jemulpo", "seohae", "yeongjong"]);
  });

  it("옛 중구·동구·서구 코드는 더는 우리 지역 단위가 아니다", () => {
    expect([...REPLACED_SGIS_GU].sort()).toEqual(["23010", "23020", "23080"]);
    for (const code of REPLACED_SGIS_GU) expect(SIGUNGUS.find((s) => s.sgisCode === code), code).toBeUndefined();
  });

  it("코드는 국가데이터처 한국행정구역분류 2026.7.10판 — 제물포 23100·영종 23110·서해 23120·검단 23130", () => {
    const byId = Object.fromEntries(SGIS_COMPOSITES.map((c) => [c.sigunguId, c.sgisCode]));
    expect(byId).toEqual({ jemulpo: "23100", yeongjong: "23110", seohae: "23120", geomdan: "23130" });
  });
});

describe("resolveSplitGu — 나뉜 옛 구의 행정동 배정", () => {
  it("옛 중구 12개 동 → 제물포 7 · 영종 5, 옛 서구 23개 동 → 서해 16 · 검단 7", () => {
    const jung = resolveSplitGu("23010", codes(JUNG_2024))!;
    expect(jung.get("23100")).toHaveLength(7);
    expect(jung.get("23110")!.sort()).toEqual(["23010630", "23010640", "23010650", "23010681", "23010691"]);
    const seo = resolveSplitGu("23080", codes(SEO_2024))!;
    expect(seo.get("23120")).toHaveLength(16);
    expect(seo.get("23130")!.sort()).toEqual(["23080800", "23080810", "23080840", "23080850", "23080860", "23080870", "23080880"]);
  });

  it("2020 농림어업총조사(아라동 없음)도 검단을 나머지로 둬 맞는다 — 서해 16 · 검단 6", () => {
    const seo2020 = codes(SEO_2024).filter((c) => c !== "23080880");
    const r = resolveSplitGu("23080", seo2020)!;
    expect(r.get("23120")).toHaveLength(16);
    expect(r.get("23130")).toHaveLength(6);
  });

  it("목록으로 정한 동이 하나라도 빠지면 null — 덜 센 합 금지", () => {
    expect(resolveSplitGu("23010", codes(JUNG_2024).filter((c) => c !== "23010520"))).toBeNull(); // 제물포 연안동
    expect(resolveSplitGu("23080", codes(SEO_2024).filter((c) => c !== "23080510"))).toBeNull(); // 서해 검암경서동
  });

  it("나머지 구(영종·검단)는 옛 구 쪽 행정동이 더 나뉘어도 받는다 — 운서1·2동, 아라1·2동", () => {
    const jung2026 = [...codes(JUNG_2024).filter((c) => c !== "23010640"), "23010641", "23010642"];
    expect(resolveSplitGu("23010", jung2026)!.get("23110")).toHaveLength(6);
    const seo2026 = [...codes(SEO_2024).filter((c) => c !== "23080880"), "23080881", "23080882"];
    expect(resolveSplitGu("23080", seo2026)!.get("23130")).toHaveLength(8);
  });

  it("compositeRows — 제물포 = 옛 동구 1행 + 옛 중구 내륙 7개 동", () => {
    const jemulpo = getSgisComposite("23100")!;
    const guRows = [{ adm_cd: "23020" }, { adm_cd: "23040" }];
    const dongRows = new Map([["23010", codes(JUNG_2024).map((adm_cd) => ({ adm_cd }))]]);
    expect(compositeRows(jemulpo, guRows, dongRows)).toHaveLength(8);
    expect(compositeRows(jemulpo, [{ adm_cd: "23040" }], dongRows)).toBeNull(); // 옛 동구 행이 없으면 null
  });
});

/** SGIS 흉내 — adm_cd(+low_search) 별 응답 */
function stubSgis(opts: { failDong?: string; farmNA?: string } = {}) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const url = new URL(input);
      calls.push(url.pathname + "?" + url.searchParams.get("adm_cd"));
      if (url.pathname.endsWith("/authentication.json")) {
        return new Response(JSON.stringify({ errCd: 0, result: { accessToken: "T" } }));
      }
      const adm = url.searchParams.get("adm_cd")!;
      const farm = url.pathname.endsWith("/farmhousehold.json");
      const row = (c: string, pop: number) =>
        farm
          ? { adm_cd: c, adm_nm: c, farm_cnt: c === opts.farmNA ? "N/A" : "10", population: "25", avg_population: "3" }
          : { adm_cd: c, adm_nm: c, tot_ppltn: String(pop), tot_family: String(Math.round(pop / 2)), oldage_suprt_per: "20", juv_suprt_per: "20" };
      let rows: unknown[] = [];
      if (adm === "23") rows = [row("23020", DONG_GU_2024), row("23040", 417391)];
      if (adm === "23010") rows = JUNG_2024.filter(([c]) => c !== opts.failDong).map(([c, p]) => row(c, p));
      if (adm === "23080") rows = SEO_2024.filter(([c]) => c !== opts.failDong).map(([c, p]) => row(c, p));
      return new Response(JSON.stringify({ errCd: 0, result: rows }));
    }),
  );
  return calls;
}

beforeEach(() => {
  vi.stubEnv("SGIS_KEY", "K");
  vi.stubEnv("SGIS_SECRET", "S");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("SGIS 인구 — 신설 구 합산", () => {
  it("네 구 인구 = SGIS 2024 행정동 합, 넷을 더하면 옛 중구+동구+서구", async () => {
    stubSgis();
    const [je, yj, sh, gd] = await Promise.all(["23100", "23110", "23120", "23130"].map(fetchSigunguPopulationData));
    expect([je?.population, yj?.population, sh?.population, gd?.population]).toEqual([101960, 120921, 405829, 228237]);
    const oldTotal = JUNG_2024.reduce((s, [, p]) => s + p, 0) + DONG_GU_2024 + SEO_2024.reduce((s, [, p]) => s + p, 0);
    expect(je!.population + yj!.population + sh!.population + gd!.population).toBe(oldTotal);
    expect(je?.regionName).toBe("제물포구");
    // 부양비 20·20 → 고령화율 20/140 = 14.3%
    expect(je?.agingRate).toBe(14.3);
  });

  it("목록으로 정한 동 하나가 응답에 없으면 합을 내지 않는다 — 직접 조회도 없으면 정적 값(없으면 null)", async () => {
    stubSgis({ failDong: "23010520" }); // 제물포 연안동
    const je = await fetchSigunguPopulationData("23100");
    const latest = POPULATION_TREND_YEARS[POPULATION_TREND_YEARS.length - 1];
    const fallback = POPULATION_TREND_SIGUNGU.find((p) => p.sgisCode === "23100" && p.year === latest);
    expect(je?.population ?? null).toBe(fallback?.population ?? null);
  });

  it("시·도 인구밀도 지도에도 신설 구가 들어간다", async () => {
    stubSgis();
    const map = await fetchSubRegionPopulations("23");
    expect(map["23100"]?.population).toBe(101960);
    expect(map["23130"]?.population).toBe(228237);
  });
});

describe("SGIS 농가 — 신설 구 합산", () => {
  it("행정동 농가를 더하고, 평균 가구원은 두 수로 다시 계산한다", async () => {
    stubSgis();
    const yj = await fetchFarmHousehold("23110");
    expect(yj).toMatchObject({ farmCount: 50, farmPopulation: 125, avgPopulation: 2.5, isFallback: false });
  });

  it("비공개(N/A) 동이 하나라도 있으면 그 구는 합을 내지 않는다", async () => {
    stubSgis({ farmNA: "23010560" }); // 도원동 — 제물포
    await expect(fetchFarmHousehold("23100")).resolves.toBeNull();
    await expect(fetchFarmHousehold("23110")).resolves.not.toBeNull(); // 영종엔 영향 없음
  });
});
