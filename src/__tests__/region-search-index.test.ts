import { describe, expect, it } from "vitest";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";
import {
  REGION_SEARCH_INDEX,
  normalizeRegionQuery,
  searchRegions,
} from "@/lib/region-search-index";

describe("region search index (공용, 9/2)", () => {
  it("시·도 + 시·군·구 전건이 1:1로 들어간다", () => {
    expect(REGION_SEARCH_INDEX.filter((r) => r.type === "sido")).toHaveLength(PROVINCES.length);
    expect(REGION_SEARCH_INDEX.filter((r) => r.type === "sigungu")).toHaveLength(SIGUNGUS.length);
    expect(new Set(REGION_SEARCH_INDEX.map((r) => r.id)).size).toBe(REGION_SEARCH_INDEX.length);
    expect(new Set(REGION_SEARCH_INDEX.map((r) => r.href)).size).toBe(REGION_SEARCH_INDEX.length);
  });

  it("compare id 형식과 상세 href 형식을 함께 제공한다", () => {
    const yeongju = REGION_SEARCH_INDEX.find((r) => r.sigunguId === "yeongju");
    expect(yeongju).toMatchObject({
      id: "gyeongbuk:yeongju",
      href: "/regions/gyeongbuk/yeongju",
      label: "경북 영주시",
      provinceShortName: "경북",
    });
  });

  it("이름·약칭·정식명·공백·대소문자 무시로 매칭된다", () => {
    expect(searchRegions(normalizeRegionQuery("영주")).map((r) => r.label)).toContain("경북 영주시");
    expect(searchRegions(normalizeRegionQuery("경북 영주")).map((r) => r.label)).toContain("경북 영주시");
    expect(searchRegions(normalizeRegionQuery(" 순 천 ")).map((r) => r.label)).toContain("전남 순천시");
    expect(searchRegions(normalizeRegionQuery("강원"))[0]).toMatchObject({ type: "sido", label: "강원" });
  });

  it("빈 검색어는 빈 배열, 결과는 30건 상한", () => {
    expect(searchRegions("")).toEqual([]);
    expect(searchRegions(normalizeRegionQuery("군")).length).toBeLessThanOrEqual(30);
  });
});
