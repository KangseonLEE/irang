/**
 * 10/6 전체 QA 2차 — 통합 검색(FE-S) 회귀 가드
 *
 *  - R2-Q4 W-c  품종·산지 복합어: "꽈리고추"는 0건 화면(앞말 '꽈리' 미등록), "청양고추"는 청양군 카드 하나만 남아
 *               고추 정보가 빠졌다 → 작물별 품종 앞말 + 다른 결과가 있으면 그 작물 카드를 직답으로 함께
 *  - R2-Q4 ⚪1  관측소 카드는 지역 비교(관측소 선택)로 — 시·도 카드와 목적지가 겹치지 않게
 *  - 점검 중 발견 FAQ "고추 재배 정보" 링크 `/crops/pepper` 가 운영에서도 404 (작물 id 는 chili-pepper)
 */
import { describe, it, expect } from "vitest";

import {
  searchAll,
  searchAllGrouped,
  getNoResultSuggestions,
  buildCropPanel,
  buildRelatedSearches,
} from "@/lib/data/search-index";
import { SEARCH_FAQS } from "@/lib/data/search-faq";
import { CROPS } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";
import { NEGATIVE } from "./fixtures/search-adversarial-corpus";

const pinnedTitles = (q: string) => searchAllGrouped(q).pinned.map((p) => `${p.type}:${p.title}`);

describe("품종 복합어 — 결과가 없으면 자동 대체, 있으면 그 작물 카드를 함께 (R2 W-c)", () => {
  it.each([
    ["꽈리고추", "고추"],
    ["아삭이고추", "고추"],
    ["오이고추", "고추"],
    ["오이맛고추", "고추"],
    ["녹광고추", "고추"],
    ["대봉감", "감"],
    ["설향딸기", "딸기"],
    ["미니사과", "사과"],
  ])("'%s' — 원 검색 0건, 자동 대체 후보 '%s' (결과 화면이 그 작물 결과 전체 + 안내로 받는다)", (q, crop) => {
    expect(searchAll(q)).toEqual([]);
    expect(getNoResultSuggestions(q)[0]).toBe(crop);
  });

  it.each([
    ["청양고추", "고추", "청양군"],
    ["청송사과", "사과", "청송군"],
    ["의성마늘", "마늘", "의성군"],
  ])("'%s' — 지역 카드가 있어도 '%s' 작물 카드가 직답으로 함께 선다", (q, crop, region) => {
    const all = searchAll(q).map((r) => `${r.type}:${r.title}`);
    expect(pinnedTitles(q)).toContain(`crop:${crop}`);
    expect(all).toContain(`region:${region}`);
    // 같은 작물 카드가 두 번 서지 않는다
    expect(all.filter((t) => t === `crop:${crop}`)).toHaveLength(1);
  });

  it("'오이고추'는 오이가 아니라 고추 — 작물 접두 분리(오이 + 고추)보다 품종 복합어가 먼저", () => {
    expect(searchAll("오이고추").some((r) => r.type === "crop" && r.title === "오이")).toBe(false);
    expect(getNoResultSuggestions("오이고추")).not.toContain("오이");
  });

  it("여러 단어 검색은 첫 단어의 작물을 세운다 — '꽈리고추 재배' → 고추", () => {
    expect(pinnedTitles("꽈리고추 재배")[0]).toBe("crop:고추");
  });

  it("연관 검색어도 그 작물로 잇는다 — '청양고추' → 고추 소득·재배지·난이도", () => {
    expect(buildRelatedSearches("청양고추").slice(0, 3)).toEqual(["고추 소득", "고추 재배지", "고추 난이도"]);
  });

  it("작물 카드 자신만 걸리는 복합어는 비워서 자동 대체로 — '대추토마토'", () => {
    expect(searchAll("대추토마토")).toEqual([]);
    expect(getNoResultSuggestions("대추토마토")[0]).toBe("토마토");
  });

  it("작물명 그 자체는 그대로 — '샤인머스캣'·'방울토마토' 작물 패널", () => {
    expect(buildCropPanel("샤인머스캣")?.cropName).toBe("샤인머스캣");
    expect(buildCropPanel("방울토마토")?.cropName).toBe("방울토마토");
    expect(pinnedTitles("방울토마토")[0]).toBe("crop:방울토마토");
  });

  it("고추 전용 앞말이 다른 작물·일반어로 새지 않는다 — 꽈리·오이 단독, 오이피클, 고추장", () => {
    for (const q of ["꽈리", "오이", "오이피클", "고추장", "꽈리버섯"]) {
      expect(getNoResultSuggestions(q), q).not.toContain("고추");
    }
    const leaked = NEGATIVE.filter((q) => getNoResultSuggestions(q).length > 0);
    expect(leaked).toEqual([]);
  });
});

describe("FAQ 링크는 실제 작물·지역 상세로 간다 (점검 중 발견)", () => {
  it("/crops/{id}·/regions/{id} FAQ 링크의 id 가 데이터에 있다", () => {
    const cropIds = new Set(CROPS.map((c) => c.id));
    const provinceIds = new Set(PROVINCES.map((p) => p.id));
    const bad: string[] = [];
    for (const f of SEARCH_FAQS) {
      const path = f.href.split(/[?#]/)[0];
      const crop = path.match(/^\/crops\/([^/]+)$/)?.[1];
      const region = path.match(/^\/regions\/([^/]+)$/)?.[1];
      if (crop && crop !== "compare" && !cropIds.has(crop)) bad.push(`${f.title} → ${f.href}`);
      if (region && !["compare", "centers", "ranking"].includes(region) && !provinceIds.has(region)) {
        bad.push(`${f.title} → ${f.href}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("'고추 재배 정보'는 /crops/chili-pepper", () => {
    expect(SEARCH_FAQS.find((f) => f.title === "고추 재배 정보")?.href).toBe("/crops/chili-pepper");
  });
});
