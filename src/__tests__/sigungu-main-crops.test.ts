/**
 * 지역 데이터 신뢰도 정정 (2026-10-10, 트랙 B) — 손 입력값을 원천 생성본으로 바꾼 것들의 계약.
 *  - SIGUNGUS·GUS.mainCrops = 2025 농림어업총조사 재배면적 상위 3(sigungu-main-crops.ts)
 *  - '정착 인기' = popular-tags.ts(KOSIS 귀농 비율 상위 25%)만 — 손 라벨 없음
 *  - 활발한 지역 귀농·귀촌 = KOSIS 상위 5(active-regions-stats.ts)
 *  - POPULATION_FALLBACK = population-trend.ts 시·도 최신 연도(세종 포함 17)
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  SIGUNGUS,
  getMainCropEntries,
  getMajorSigungusForCrop,
  mainCropsEmptyReason,
} from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";
import { CROPS } from "@/lib/data/crops";
import {
  GU_MAIN_CROPS,
  MAIN_CROP_RULE,
  MAIN_CROPS_RESIDENCE_SKEW,
  MAIN_CROPS_SKEWED_PROVINCES,
  SIGUNGU_MAIN_CROPS,
} from "@/lib/data/sigungu-main-crops";
import { POPULAR_RETURN_FARM_CODES } from "@/lib/data/popular-tags";
import { getCropFit } from "@/lib/data/crop-fit";
import { ACTIVE_CATEGORIES } from "@/lib/data/active-regions";
import { RETURN_FARM_TOP, RETURN_RURAL_TOP } from "@/lib/data/active-regions-stats";
import { POPULATION_FALLBACK } from "@/lib/data/population";
import { PROVINCES } from "@/lib/data/regions";
import { getSgisComposite } from "@/lib/data/region-composites";

const cropNames = new Set(CROPS.map((c) => c.name));

describe("주요 작물 — 2025 농림어업총조사 생성본", () => {
  it("모든 값이 CROPS 이름이고, 최대 3개, 면적 큰 순, 기준 면적 이상", () => {
    for (const [id, entries] of [...Object.entries(SIGUNGU_MAIN_CROPS), ...Object.entries(GU_MAIN_CROPS)]) {
      expect(entries.length, id).toBeLessThanOrEqual(MAIN_CROP_RULE.maxCrops);
      entries.forEach((e, i) => {
        expect(cropNames.has(e.crop), `${id} ${e.crop}`).toBe(true);
        expect(e.areaHa).toBeGreaterThanOrEqual(MAIN_CROP_RULE.minAreaHa);
        if (i > 0) expect(entries[i - 1].areaHa).toBeGreaterThanOrEqual(e.areaHa);
      });
    }
  });

  it("SIGUNGUS·GUS.mainCrops 는 생성본 그대로(순서 포함)", () => {
    for (const sg of SIGUNGUS) expect(sg.mainCrops).toEqual(getMainCropEntries(sg.id).map((e) => e.crop));
    for (const g of GUS) expect(g.mainCrops).toEqual(getMainCropEntries(g.id).map((e) => e.crop));
  });

  it("원천에 없는 신설 구(인천·화성 2026)는 키 자체가 없고, 주소지 쏠림 시·도(서울)는 빈 배열", () => {
    for (const u of [...SIGUNGUS, ...GUS]) {
      if (getSgisComposite(u.sgisCode)) {
        expect(mainCropsEmptyReason(u.id, u.sidoId)).toBe("not-in-census");
      }
    }
    expect(MAIN_CROPS_SKEWED_PROVINCES).toContain("seoul");
    for (const sg of SIGUNGUS.filter((s) => s.sidoId === "seoul")) {
      expect(sg.mainCrops).toEqual([]);
      expect(mainCropsEmptyReason(sg.id, sg.sidoId)).toBe("residence-skew");
    }
  });

  it("주소지 쏠림(시·군·구 단위, 10/10 QA) — 실제 경지보다 크게 넓은 단위는 결과에 없다", () => {
    // 전체 쏠림: 총조사 37개 작물 합이 실제 경지(DT_1EB002 2025)의 1.3배 초과 → 주요 작물 없음
    for (const id of ["anyang", "seongnam", "mokpo", "suwon", "jangan-gu", "bundang-gu", "manan-gu"]) {
      expect(MAIN_CROPS_RESIDENCE_SKEW[id]?.all, id).toBe(true);
      expect(getMainCropEntries(id), id).toEqual([]);
      expect(mainCropsEmptyReason(id, "gyeonggi"), id).toBe("residence-skew");
    }
    // 벼만 쏠림: 총조사 벼가 실제 논의 1.6배 초과 → 쌀만 빠지고 다른 작물은 남는다
    for (const id of ["uiwang", "dongducheon", "hanam"]) {
      expect(MAIN_CROPS_RESIDENCE_SKEW[id], id).toMatchObject({ rice: true, all: false });
      const crops = getMainCropEntries(id).map((e) => e.cropId);
      expect(crops, id).not.toContain("rice");
      expect(crops.length, id).toBeGreaterThan(0);
    }
    // 계약: 판정이 있으면 결과에 반영돼 있다
    const all = { ...SIGUNGU_MAIN_CROPS, ...GU_MAIN_CROPS };
    for (const [id, j] of Object.entries(MAIN_CROPS_RESIDENCE_SKEW)) {
      expect(id in all, id).toBe(true);
      if (j.all) expect(all[id], id).toEqual([]);
      if (j.rice) expect(all[id].some((e) => e.cropId === "rice"), id).toBe(false);
      if (j.rice && j.riceRatio !== null) expect(j.riceRatio).toBeGreaterThan(MAIN_CROP_RULE.riceSkewMax);
      if (j.all && j.allRatio !== null) expect(j.allRatio).toBeGreaterThan(MAIN_CROP_RULE.allSkewMax);
    }
    // 시 아래 구는 부모 시 판정을 따른다(경지면적 표에 구 행이 없다)
    for (const g of GUS) {
      if (getSgisComposite(g.sgisCode)) continue;
      expect(MAIN_CROPS_RESIDENCE_SKEW[g.id], g.id).toEqual(MAIN_CROPS_RESIDENCE_SKEW[g.parentSigunguId]);
    }
    // 정상 농촌은 걸리지 않는다
    for (const id of ["haenam", "dangjin", "iksan", "cheongsong", "gimje"]) expect(MAIN_CROPS_RESIDENCE_SKEW[id], id).toBeUndefined();
  });

  it("손 입력 재유입 차단 — 원본 표에 mainCrops·'정착 인기' 리터럴이 없다", () => {
    for (const f of ["src/lib/data/sigungus.ts", "src/lib/data/gus.ts"]) {
      const src = readFileSync(resolve(process.cwd(), f), "utf8");
      expect(src, f).not.toMatch(/mainCrops: \[/);
      expect(src, f).not.toMatch(/"정착 인기"/);
    }
  });

  it("작물 → 주요 산지 시·군·구는 그 작물 재배면적 큰 순", () => {
    const list = getMajorSigungusForCrop("사과", [], 20);
    const area = (short: string) => {
      const sg = SIGUNGUS.find((s) => s.shortName === short && s.mainCrops.includes("사과"))!;
      return getMainCropEntries(sg.id).find((e) => e.crop === "사과")!.areaHa;
    };
    for (let i = 1; i < list.length; i++) expect(area(list[i - 1])).toBeGreaterThanOrEqual(area(list[i]));
    expect(list[0]).toBe("청송");
  });

  it("시·도 작물 적합도 문구는 주요 작물 기준", () => {
    const gb = SIGUNGUS.filter((s) => s.sidoId === "gyeongbuk");
    expect(getCropFit("경북", "사과", gb)).toMatchObject({ level: "high" });
    expect(getCropFit("경북", "사과", gb).reason).toMatch(/^경북 \d+곳의 주요 작물이에요$/);
    expect(getCropFit("경북", "감귤", gb)).toEqual({ level: "mid", reason: "경북 시·군·구 주요 작물엔 없어요" });
  });
});

describe("'정착 인기' — KOSIS 귀농 비율 상위 25% 만", () => {
  it("SIGUNGUS 는 popular-tags 와 정확히 같고, 구에는 없다", () => {
    for (const sg of SIGUNGUS) {
      expect(sg.highlights.includes("정착 인기"), sg.name).toBe(POPULAR_RETURN_FARM_CODES.has(sg.sgisCode));
    }
    for (const g of GUS) expect(g.highlights).not.toContain("정착 인기");
  });
});

describe("활발한 지역 — 귀농·귀촌은 KOSIS 생성본", () => {
  it("귀농·귀촌 탭의 지역·수치가 active-regions-stats 와 같다", () => {
    const jeonin = ACTIVE_CATEGORIES.find((c) => c.id === "jeonin")!;
    const gwichon = ACTIVE_CATEGORIES.find((c) => c.id === "gwichon")!;
    expect(jeonin.regions.map((r) => r.sigunguId)).toEqual(RETURN_FARM_TOP.map((t) => t.sigunguId));
    expect(gwichon.regions.map((r) => r.sigunguId)).toEqual(RETURN_RURAL_TOP.map((t) => t.sigunguId));
    for (const r of [...jeonin.regions, ...gwichon.regions]) expect(r.metric).toMatch(/^[\d,]+명$/);
  });
});

describe("시·도 인구 폴백", () => {
  it("PROVINCES 17곳 전부(세종 포함), 연도 표기", () => {
    expect(POPULATION_FALLBACK.map((p) => p.sgisCode)).toEqual(PROVINCES.map((p) => p.sgisCode));
    for (const p of POPULATION_FALLBACK) {
      expect(p.population).toBeGreaterThan(0);
      expect(p.year).toBeGreaterThanOrEqual(2022);
    }
  });
});
