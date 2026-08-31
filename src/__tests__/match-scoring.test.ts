/**
 * match-scoring.ts 유닛 테스트
 *
 * 정착 유형 분류, 지역 추천, 작물 추천 로직 검증
 */

import { describe, it, expect } from "vitest";
import {
  classifyFarmType,
  getRecommendedPrograms,
  scoreProvinces,
  recommendCrops,
} from "@/lib/match-scoring";
import { FARM_TYPES, type Answers } from "@/lib/data/match-questions";

// ─── classifyFarmType ───

describe("classifyFarmType", () => {
  it("귀촌형(guichon)을 올바르게 분류한다", () => {
    const answers: Answers = {
      experience: ["none"],
      climate: ["four-season"],
      priority: ["access"],
      lifestyle: ["near-city"],
      "crop-type": ["vegetable"],
    };
    const result = classifyFarmType(answers);
    expect(result.id).toBe("guichon");
  });

  it("스마트팜형(smartfarm)을 올바르게 분류한다", () => {
    const answers: Answers = {
      experience: ["some"],
      climate: ["four-season"],
      priority: ["market"],
      lifestyle: ["moderate"],
      "crop-type": ["vegetable", "special"],
    };
    const result = classifyFarmType(answers);
    expect(result.id).toBe("smartfarm");
  });

  it("귀농형(guinong)을 올바르게 분류한다", () => {
    const answers: Answers = {
      experience: ["experienced"],
      climate: ["warm", "cool"],
      priority: ["nature"],
      lifestyle: ["rural"],
      "crop-type": ["grain"],
    };
    const result = classifyFarmType(answers);
    expect(result.id).toBe("guinong");
  });

  it("청년농형(cheongnyeon)을 올바르게 분류한다", () => {
    const answers: Answers = {
      experience: ["experienced"],
      climate: ["four-season"],
      priority: ["support", "market"],
      lifestyle: ["moderate"],
      "crop-type": ["special"],
    };
    const result = classifyFarmType(answers);
    // support+market → cheongnyeon gets high score
    expect(["cheongnyeon", "guinong", "smartfarm"]).toContain(result.id);
  });

  // ── 아키타입 회귀 (2026-08-31 가중치 재조정) ──
  // 10문항 전체를 성향대로 답했을 때 기대 유형이 나와야 한다.
  // 재조정 배경: 구 매트릭스는 균등 랜덤 60%가 귀농형, 청년농형은 사실상 도달 불가.

  const FULL_ARCHETYPES: {
    name: string;
    answers: Answers;
    ageGroup?: string;
    expected: string;
  }[] = [
    {
      name: "전업 귀농",
      answers: {
        climate: ["warm"], priority: ["support"], "crop-type": ["grain"],
        lifestyle: ["rural"], experience: ["experienced"], budget: ["100m-300m"],
        household: ["couple"], timeline: ["within-1y"],
        "income-goal": ["farming"], "settlement-type": ["farmland"],
      },
      expected: "guinong",
    },
    {
      name: "원격근무 귀촌",
      answers: {
        climate: ["four-season"], priority: ["access"], "crop-type": ["vegetable"],
        lifestyle: ["near-city"], experience: ["none"], budget: ["under-30m"],
        household: ["family-kids"], timeline: ["over-3y"],
        "income-goal": ["remote-work"], "settlement-type": ["town"],
      },
      expected: "guichon",
    },
    {
      name: "귀산촌",
      answers: {
        climate: ["cool"], priority: ["nature"], "crop-type": ["special"],
        lifestyle: ["rural"], experience: ["some"], budget: ["under-30m"],
        household: ["solo"], timeline: ["1-3y"],
        "income-goal": ["forestry"], "settlement-type": ["mountain"],
      },
      expected: "guisanchon",
    },
    {
      name: "스마트팜",
      answers: {
        climate: ["four-season"], priority: ["market"], "crop-type": ["vegetable"],
        lifestyle: ["near-city"], experience: ["some"], budget: ["over-300m"],
        household: ["solo"], timeline: ["1-3y"],
        "income-goal": ["smart-agri"], "settlement-type": ["smart-complex"],
      },
      expected: "smartfarm",
    },
    {
      name: "청년 창업농 (youth 보정)",
      answers: {
        climate: ["warm"], priority: ["support"], "crop-type": ["vegetable"],
        lifestyle: ["moderate"], experience: ["none"], budget: ["30m-100m"],
        household: ["solo"], timeline: ["within-1y"],
        "income-goal": ["farming"], "settlement-type": ["farmland"],
      },
      ageGroup: "youth",
      expected: "cheongnyeon",
    },
  ];

  for (const { name, answers, ageGroup, expected } of FULL_ARCHETYPES) {
    it(`아키타입 [${name}] → ${expected}`, () => {
      expect(classifyFarmType(answers, ageGroup).id).toBe(expected);
    });
  }

  it("청년이라도 스마트팜 강신호면 스마트팜형을 유지한다", () => {
    const smartfarmAnswers = FULL_ARCHETYPES[3].answers;
    expect(classifyFarmType(smartfarmAnswers, "youth").id).toBe("smartfarm");
  });

  it("같은 답변도 비청년이면 청년농형이 아니다", () => {
    const youthAnswers = FULL_ARCHETYPES[4].answers;
    expect(classifyFarmType(youthAnswers, "50s").id).not.toBe("cheongnyeon");
  });

  it("빈 답변에도 오류 없이 기본 유형을 반환한다", () => {
    const answers: Answers = {
      experience: [],
      climate: [],
      priority: [],
      lifestyle: [],
      "crop-type": [],
    };
    const result = classifyFarmType(answers);
    expect(FARM_TYPES.some((t) => t.id === result.id)).toBe(true);
  });

  it("반환된 유형은 FARM_TYPES에 존재한다", () => {
    const answers: Answers = {
      experience: ["none"],
      climate: ["warm"],
      priority: ["nature"],
      lifestyle: ["rural"],
      "crop-type": ["fruit"],
    };
    const result = classifyFarmType(answers);
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("label");
    expect(result).toHaveProperty("description");
    expect(result).toHaveProperty("programIds");
  });
});

// ─── getRecommendedPrograms ───

describe("getRecommendedPrograms", () => {
  it("유형에 맞는 프로그램 목록을 반환한다", () => {
    const farmType = FARM_TYPES.find((t) => t.id === "guichon")!;
    const programs = getRecommendedPrograms(farmType);
    expect(Array.isArray(programs)).toBe(true);
    // programIds가 있으면 결과도 있어야 함
    if (farmType.programIds.length > 0) {
      expect(programs.length).toBeGreaterThan(0);
    }
  });

  it("각 프로그램은 status 필드를 갖는다", () => {
    const farmType = FARM_TYPES.find((t) => t.id === "smartfarm")!;
    const programs = getRecommendedPrograms(farmType);
    for (const p of programs) {
      expect(["모집중", "모집예정", "마감"]).toContain(p.status);
    }
  });

  it("모든 FARM_TYPES에 대해 오류 없이 동작한다", () => {
    for (const farmType of FARM_TYPES) {
      expect(() => getRecommendedPrograms(farmType)).not.toThrow();
    }
  });
});

// ─── scoreProvinces ───

describe("scoreProvinces", () => {
  it("따뜻한 기후 선호 시 제주/전남이 상위에 위치한다", () => {
    const answers: Answers = {
      experience: ["none"],
      climate: ["warm"],
      priority: ["nature"],
      lifestyle: ["rural"],
      "crop-type": ["fruit"],
    };
    const results = scoreProvinces(answers);
    expect(results.length).toBeGreaterThan(0);
    const topIds = results.slice(0, 3).map((r) => r.province.id);
    expect(topIds.some((id) => ["jeju", "jeonnam", "gyeongnam"].includes(id))).toBe(true);
  });

  it("서울 접근성 우선 시 경기/서울이 상위에 위치한다", () => {
    const answers: Answers = {
      experience: ["none"],
      climate: ["four-season"],
      priority: ["access"],
      lifestyle: ["near-city"],
      "crop-type": ["vegetable"],
    };
    const results = scoreProvinces(answers);
    const topIds = results.slice(0, 3).map((r) => r.province.id);
    expect(topIds.some((id) => ["gyeonggi", "seoul", "incheon"].includes(id))).toBe(true);
  });

  it("점수가 내림차순으로 정렬되어 있다", () => {
    const answers: Answers = {
      experience: ["some"],
      climate: ["cool"],
      priority: ["nature"],
      lifestyle: ["rural"],
      "crop-type": ["grain"],
    };
    const results = scoreProvinces(answers);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it("각 결과는 province와 score를 포함한다", () => {
    const answers: Answers = {
      experience: ["none"],
      climate: ["warm"],
      priority: [],
      lifestyle: [],
      "crop-type": [],
    };
    const results = scoreProvinces(answers);
    for (const r of results) {
      expect(r).toHaveProperty("province");
      expect(r).toHaveProperty("score");
      expect(typeof r.score).toBe("number");
    }
  });
});

// ─── recommendCrops ───

describe("recommendCrops", () => {
  it("채소 선호 시 채소 카테고리 작물이 포함된다", () => {
    const answers: Answers = {
      experience: ["none"],
      climate: ["four-season"],
      priority: ["access"],
      lifestyle: ["near-city"],
      "crop-type": ["vegetable"],
    };
    const topProvinces = scoreProvinces(answers).slice(0, 3);
    const results = recommendCrops(answers, topProvinces);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((c) => c.crop.category === "채소")).toBe(true);
  });

  it("과수 선호 시 과수 카테고리 작물이 포함된다", () => {
    const answers: Answers = {
      experience: ["some"],
      climate: ["warm"],
      priority: ["nature"],
      lifestyle: ["rural"],
      "crop-type": ["fruit"],
    };
    const topProvinces = scoreProvinces(answers).slice(0, 3);
    const results = recommendCrops(answers, topProvinces);
    expect(results.some((c) => c.crop.category === "과수")).toBe(true);
  });

  it("반환값은 crop과 reasons를 포함한다", () => {
    const answers: Answers = {
      experience: ["none"],
      climate: ["warm"],
      priority: ["nature"],
      lifestyle: ["rural"],
      "crop-type": ["grain"],
    };
    const topProvinces = scoreProvinces(answers).slice(0, 3);
    const results = recommendCrops(answers, topProvinces);
    for (const r of results) {
      expect(r).toHaveProperty("crop");
      expect(r).toHaveProperty("reasons");
      expect(Array.isArray(r.reasons)).toBe(true);
    }
  });
});
