/**
 * 신설 구 행정동 합산 회귀 테스트 — 인천 신설 4개 구(2026-10-07 A안) · 화성 신설 4개 구(10/7)
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
  compositePopulationRows,
  compositeRows,
  compositesInCity,
  compositesInProvince,
  getSgisComposite,
  resolveSplitGu,
} from "@/lib/data/region-composites";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";
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
/** 검암경서동(23080510) 집계구 중 경인아라뱃길 북쪽 25곳 SGIS 2024 [코드, 인구, 세대] — 10/8 조사(합 12,681명·4,847세대) */
const BAEKSEOK_OA_2024: [string, number, number][] = [
  ["23080510040001", 491, 57], ["23080510040101", 407, 167], ["23080510040102", 601, 228], ["23080510040103", 540, 239],
  ["23080510040104", 410, 175], ["23080510040105", 480, 191], ["23080510040106", 414, 186], ["23080510040107", 469, 205],
  ["23080510040108", 490, 223], ["23080510040109", 574, 228], ["23080510040110", 507, 195], ["23080510040111", 432, 149],
  ["23080510040112", 413, 186], ["23080510040201", 525, 179], ["23080510040202", 561, 207], ["23080510040203", 551, 193],
  ["23080510040204", 657, 232], ["23080510040205", 451, 190], ["23080510040206", 387, 170], ["23080510040207", 486, 201],
  ["23080510040208", 633, 229], ["23080510040209", 652, 230], ["23080510040210", 429, 142], ["23080510040211", 552, 208],
  ["23080510040212", 569, 237],
];
/** 검암경서동의 나머지(아라뱃길 남쪽) — 동 합 54,558 에서 북쪽을 뺀 값을 한 행으로 */
const GEOMAM_SOUTH_2024 = 54558 - 12681;
const codes = (rows: [string, number][]) => rows.map(([c]) => c);

describe("정의 — sigungus.ts 와 맞물림", () => {
  it("시·군·구 자리 신설 구마다 같은 id·임시 코드·이름의 인천 시·군·구가 있다", () => {
    const own = SGIS_COMPOSITES.filter((c) => !c.parentSigunguId);
    for (const c of own) {
      const sg = SIGUNGUS.find((s) => s.id === c.sigunguId);
      expect(sg, c.sigunguId).toBeDefined();
      expect([sg!.sgisCode, sg!.name, sg!.sidoId]).toEqual([c.sgisCode, c.name, "incheon"]);
      expect(c.sgisCode.startsWith(PROVINCES.find((p) => p.id === "incheon")!.sgisCode)).toBe(true);
      expect(getSgisComposite(c.sgisCode)).toBe(c);
    }
    expect(own.map((c) => c.sigunguId).sort()).toEqual(["geomdan", "jemulpo", "seohae", "yeongjong"]);
  });

  it("시 아래 신설 구(화성 2026)는 같은 id·코드·이름의 구(gus.ts)가 있고, 시는 그대로 시·군·구로 남는다", () => {
    const sub = SGIS_COMPOSITES.filter((c) => c.parentSigunguId);
    expect(sub.map((c) => c.sigunguId).sort()).toEqual(["byeongjeom-gu", "dongtan-gu", "hyohaeng-gu", "manse-gu"]);
    for (const c of sub) {
      const g = GUS.find((x) => x.id === c.sigunguId);
      expect(g, c.sigunguId).toBeDefined();
      expect([g!.sgisCode, g!.name, g!.parentSigunguId]).toEqual([c.sgisCode, c.name, c.parentSigunguId]);
      expect(SIGUNGUS.find((s) => s.id === c.sigunguId), c.sigunguId).toBeUndefined();
    }
    expect(SIGUNGUS.find((s) => s.id === "hwaseong")?.sgisCode).toBe("31240");
    // 시·도 단위 집계(시·도 지도·인구 추이·읍면동 안내)엔 넣지 않는다 — 화성시 자리가 사라지면 안 된다
    expect(compositesInProvince("31")).toEqual([]);
    expect(compositesInCity("hwaseong").map((c) => c.sgisCode).sort()).toEqual(["31241", "31242", "31243", "31244"]);
    expect(REPLACED_SGIS_GU.has("31240")).toBe(false);
  });

  it("옛 중구·동구·서구 코드는 더는 우리 지역 단위가 아니다", () => {
    expect([...REPLACED_SGIS_GU].sort()).toEqual(["23010", "23020", "23080"]);
    for (const code of REPLACED_SGIS_GU) expect(SIGUNGUS.find((s) => s.sgisCode === code), code).toBeUndefined();
  });

  it("코드는 국가데이터처 한국행정구역분류 2026.7.10판 — 제물포 23100·영종 23110·서해 23120·검단 23130·만세~동탄 31241~31244", () => {
    const byId = Object.fromEntries(SGIS_COMPOSITES.map((c) => [c.sigunguId, c.sgisCode]));
    expect(byId).toEqual({
      jemulpo: "23100", yeongjong: "23110", seohae: "23120", geomdan: "23130",
      // 화성 2026-02-01 — 같은 분류 2026.7.10판
      "manse-gu": "31241", "hyohaeng-gu": "31242", "byeongjeom-gu": "31243", "dongtan-gu": "31244",
    });
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

// 화성시 SGIS 2024 행정동 29개 인구 (10/7 실측) — [코드, 인구]. 동 합 = 31240 단건 1,004,079
const HWASEONG_2024: [string, number][] = [
  ["31240130", 21019], ["31240140", 99417], ["31240150", 64940], ["31240350", 9966], ["31240360", 11838],
  ["31240370", 8586], ["31240380", 15525], ["31240390", 15128], ["31240420", 6895], ["31240670", 26584],
  ["31240120", 108945], ["31240310", 6442], ["31240330", 8137], ["31240430", 14010], ["31240560", 16010],
  ["31240520", 50399], ["31240530", 36195], ["31240540", 22194], ["31240550", 36407], ["31240570", 28218],
  ["31240610", 48860], ["31240600", 33250], ["31240620", 39587], ["31240640", 51283], ["31240650", 45594],
  ["31240700", 43164], ["31240691", 55004], ["31240710", 36295], ["31240720", 44187],
];

describe("화성 신설 4개 구 (2026-02-01) — 행정동 29개를 조례 별표1 대로", () => {
  it("만세 10 · 효행 5 · 병점 5 · 동탄 9, 인구 합 = 화성시", () => {
    const r = resolveSplitGu("31240", codes(HWASEONG_2024))!;
    expect(["31241", "31242", "31243", "31244"].map((c) => r.get(c)!.length)).toEqual([10, 5, 5, 9]);
    const pop = new Map(HWASEONG_2024);
    const sums = ["31241", "31242", "31243", "31244"].map((c) => r.get(c)!.reduce((a, d) => a + pop.get(d)!, 0));
    expect(sums).toEqual([279898, 153544, 173413, 397224]);
    expect(sums.reduce((a, b) => a + b, 0)).toBe(1004079);
  });

  it("'나머지' 구가 없다 — 모르는 동(분동·신설)이 나오면 합을 내지 않는다", () => {
    expect(resolveSplitGu("31240", [...codes(HWASEONG_2024), "31240730"])).toBeNull();
    expect(resolveSplitGu("31240", codes(HWASEONG_2024).filter((c) => c !== "31240670"))).toBeNull(); // 새솔동 빠짐
  });

  it("compositeRows — 동탄구 = 동탄1~9동 9행 (시 아래 구라 시·도 행은 쓰지 않는다)", () => {
    const dongtan = getSgisComposite("31244")!;
    const dongRows = new Map([["31240", codes(HWASEONG_2024).map((adm_cd) => ({ adm_cd }))]]);
    expect(compositeRows(dongtan, [], dongRows)).toHaveLength(9);
  });
});

/** SGIS 흉내 — adm_cd(+low_search) 별 응답 */
function stubSgis(opts: { failDong?: string; farmNA?: string; oa?: "moved" | "partial" | "none" } = {}) {
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
      // 검암경서동 집계구 — 기본은 SGIS 2024 그대로(북쪽 25곳이 아직 검암경서동). moved = SGIS 가 연계를 고쳐 북쪽이 빠진 해,
      // partial = 북쪽 일부만(집계구 코드가 바뀐 해), none = 응답 없음
      if (adm === "23080510" && opts.oa !== "none") {
        const north = BAEKSEOK_OA_2024.slice(0, opts.oa === "partial" ? 10 : 25).map(([c, p, h]) => ({ ...row(c, p), tot_family: String(h) }));
        rows = [...(opts.oa === "moved" ? [] : north), row("23080510050001", GEOMAM_SOUTH_2024)];
      }
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
    // 서해·검단은 백석동 일대 집계구 25곳(12,681명)을 서해에서 빼 검단에 더한 값 — 행정동 합만이면 405,829·228,237
    expect([je?.population, yj?.population, sh?.population, gd?.population]).toEqual([101960, 120921, 393148, 240918]);
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
    expect(map["23120"]?.population).toBe(393148);
    expect(map["23130"]?.population).toBe(240918);
  });

  it("백석동 집계구 이동 — 세대도 같이 옮기고, 넷의 합은 그대로", async () => {
    stubSgis();
    const [sh, gd] = await Promise.all(["23120", "23130"].map(fetchSigunguPopulationData));
    stubSgis({ oa: "moved" });
    const [sh0, gd0] = await Promise.all(["23120", "23130"].map(fetchSigunguPopulationData));
    // moved = SGIS 가 연계를 고친 해 → 이미 당하동에 들어가 있으니 옮기지 않는다(두 번 옮기지 않게)
    expect([sh0?.population, gd0?.population]).toEqual([405829, 228237]);
    expect(sh!.householdCount - sh0!.householdCount).toBe(-4847);
    expect(gd!.householdCount - gd0!.householdCount).toBe(4847);
  });

  it("옮길 집계구가 일부만 있거나 집계구 응답이 없으면 합을 내지 않는다(덜 옮긴 값을 내보내지 않는다)", async () => {
    for (const oa of ["partial", "none"] as const) {
      stubSgis({ oa });
      const sh = await fetchSigunguPopulationData("23120");
      const latest = POPULATION_TREND_YEARS[POPULATION_TREND_YEARS.length - 1];
      const fallback = POPULATION_TREND_SIGUNGU.find((p) => p.sgisCode === "23120" && p.year === latest);
      expect(sh?.population ?? null, oa).toBe(fallback?.population ?? null);
    }
  });
});

describe("compositePopulationRows — 집계구 이동 단위 규칙", () => {
  const seohae = getSgisComposite("23120")!;
  const geomdan = getSgisComposite("23130")!;
  const dongRows = new Map([["23080", SEO_2024.map(([adm_cd, p]) => ({ adm_cd, tot_ppltn: String(p), tot_family: "0" }))]]);
  const oaRows = (rows: { adm_cd: string; tot_ppltn: string; tot_family: string }[]) => new Map([["23080510", rows]]);
  const north = BAEKSEOK_OA_2024.map(([adm_cd, p, h]) => ({ adm_cd, tot_ppltn: String(p), tot_family: String(h) }));
  const sum = (rows: { tot_ppltn: string }[] | null) => rows?.reduce((a, r) => a + (parseInt(r.tot_ppltn, 10) || 0), 0) ?? null;

  it("서해는 빼고 검단은 더한다", () => {
    expect(sum(compositePopulationRows(seohae, [], dongRows, oaRows(north)))! - sum(compositeRows(seohae, [], dongRows))!).toBe(-12681);
    expect(sum(compositePopulationRows(geomdan, [], dongRows, oaRows(north)))! - sum(compositeRows(geomdan, [], dongRows))!).toBe(12681);
  });

  it("비공개(N/A) 집계구는 양쪽 모두 옮기지 않는다", () => {
    const withNa = north.map((r, i) => (i === 0 ? { ...r, tot_ppltn: "N/A" } : r));
    const moved = 12681 - 491;
    expect(sum(compositePopulationRows(seohae, [], dongRows, oaRows(withNa)))! - sum(compositeRows(seohae, [], dongRows))!).toBe(-moved);
    expect(sum(compositePopulationRows(geomdan, [], dongRows, oaRows(withNa)))! - sum(compositeRows(geomdan, [], dongRows))!).toBe(moved);
  });

  it("이동이 없는 신설 구(제물포·화성)는 compositeRows 와 같다", () => {
    const jemulpo = getSgisComposite("23100")!;
    const guRows = [{ adm_cd: "23020", tot_ppltn: "57944", tot_family: "0" }];
    const jungRows = new Map([["23010", JUNG_2024.map(([adm_cd, p]) => ({ adm_cd, tot_ppltn: String(p), tot_family: "0" }))]]);
    expect(compositePopulationRows(jemulpo, guRows, jungRows, new Map())).toEqual(compositeRows(jemulpo, guRows, jungRows));
  });
});

describe("농가 — 2025 총조사 정적 값만, 신설 구는 표에 없음 (10/8)", () => {
  it("인천 신설 4구는 2025 표에 없어 null — 실행 중 SGIS 를 부르지 않는다", async () => {
    const calls = stubSgis();
    for (const code of ["23100", "23110", "23120", "23130"]) {
      await expect(fetchFarmHousehold(code)).resolves.toBeNull();
    }
    expect(calls).toEqual([]);
  });

  it("화성 신설 4구도 null(구 화면은 화성시 값을 범위를 밝혀 쓴다), 화성시는 2025 값", async () => {
    const calls = stubSgis();
    for (const code of ["31241", "31242", "31243", "31244"]) {
      await expect(fetchFarmHousehold(code)).resolves.toBeNull();
    }
    await expect(fetchFarmHousehold("31240")).resolves.toMatchObject({ farmCount: 12994, farmPopulation: 29477, avgPopulation: 2.3, isFallback: false });
    expect(calls).toEqual([]);
  });
});
