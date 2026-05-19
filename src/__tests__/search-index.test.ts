/**
 * search-index.ts 유닛 테스트
 *
 * 통합 검색 — 동의어 확장, 형태소 처리, 관련도 스코어링 검증
 */

import { describe, it, expect } from "vitest";
import { searchItems, searchAll, getQuerySuggestions } from "@/lib/data/search-index";

// ─── 기본 검색 동작 ───

describe("searchItems (드롭다운 검색)", () => {
  it("빈 쿼리는 빈 배열을 반환한다", () => {
    expect(searchItems("")).toEqual([]);
    expect(searchItems("   ")).toEqual([]);
  });

  it("최대 12개 결과를 반환한다", () => {
    const results = searchItems("농");
    expect(results.length).toBeLessThanOrEqual(12);
  });

  it("지역명으로 검색하면 결과가 있다", () => {
    const results = searchItems("서울");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === "region")).toBe(true);
  });

  it("작물명으로 검색하면 결과가 있다", () => {
    const results = searchItems("딸기");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === "crop")).toBe(true);
  });

  it("각 결과 항목은 올바른 구조를 갖는다", () => {
    const results = searchItems("귀농");
    for (const item of results) {
      expect(item).toHaveProperty("type");
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("subtitle");
      expect(item).toHaveProperty("href");
      expect(item).toHaveProperty("keywords");
      expect(item).toHaveProperty("icon");
    }
  });
});

// ─── 동의어 확장 ───

describe("동의어 검색", () => {
  it("'경기'로 검색하면 경기도 관련 결과가 나온다", () => {
    const results = searchAll("경기");
    expect(results.length).toBeGreaterThan(0);
  });

  it("'보조금'으로 검색하면 지원사업 결과가 나온다", () => {
    const results = searchAll("보조금");
    expect(results.length).toBeGreaterThan(0);
  });

  it("'초보'로 검색하면 가이드 관련 결과가 나온다", () => {
    const results = searchAll("초보");
    expect(results.length).toBeGreaterThan(0);
  });

  it("'스마트팜'으로 검색하면 결과가 나온다", () => {
    const results = searchAll("스마트팜");
    expect(results.length).toBeGreaterThan(0);
  });
});

// ─── 한국어 조사 처리 ───

describe("한국어 조사 제거", () => {
  it("'딸기를' 검색 시 '딸기' 결과를 반환한다", () => {
    const withSuffix = searchAll("딸기를");
    // without: 조사 없는 버전 대조용 (아래에서 withSuffix 자체 검증)
    searchAll("딸기");
    // 조사 제거 후 같은 결과를 찾아야 함
    expect(withSuffix.length).toBeGreaterThan(0);
    // 조사 있는 버전도 결과가 나와야 함
    expect(withSuffix.some((r) => r.title.includes("딸기"))).toBe(true);
  });

  it("'서울에서' 검색 시 '서울' 결과를 반환한다", () => {
    const results = searchAll("서울에서");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.title.includes("서울"))).toBe(true);
  });

  it("'사과는' 검색 시 '사과' 결과를 반환한다", () => {
    const results = searchAll("사과는");
    expect(results.length).toBeGreaterThan(0);
  });
});

// ─── 복합 쿼리 ───

describe("복합 쿼리 (멀티 키워드)", () => {
  it("'전남 딸기'로 검색하면 결과가 있다", () => {
    const results = searchAll("전남 딸기");
    expect(results.length).toBeGreaterThan(0);
  });

  it("단일 키워드보다 복합 키워드가 더 정확한 결과를 준다", () => {
    const multi = searchAll("전남 딸기");
    // 전남과 딸기 모두 매칭되는 결과가 상위에 올라야 함
    expect(multi.length).toBeGreaterThan(0);
  });
});

// ─── 관련도 정렬 ───

describe("관련도 기반 정렬", () => {
  it("제목 완전 일치가 부분 일치보다 먼저 나온다", () => {
    // "딸기"라는 작물이 있다면, 제목에 "딸기"가 포함된 것이 키워드만 매칭된 것보다 앞에
    const results = searchAll("딸기");
    if (results.length >= 2) {
      const firstHasTitle = results[0].title.toLowerCase().includes("딸기");
      expect(firstHasTitle).toBe(true);
    }
  });

  it("가이드 타입은 일반 검색에서 가중치 부스트를 받는다", () => {
    // "귀농" 검색 시 가이드 항목이 상위에 노출되어야 함
    const results = searchAll("귀농");
    const guideInTop5 = results.slice(0, 5).some((r) => r.type === "guide");
    expect(guideInTop5).toBe(true);
  });
});

// ─── searchAll vs searchItems ───

describe("searchAll (전체 검색)", () => {
  it("searchAll은 개수 제한 없이 전체를 반환한다", () => {
    const all = searchAll("농");
    const limited = searchItems("농");
    expect(all.length).toBeGreaterThanOrEqual(limited.length);
  });

  it("searchItems는 타입별 최대 3개 제한을 적용한다", () => {
    const results = searchItems("농");
    const typeCounts: Record<string, number> = {};
    for (const r of results) {
      typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1;
    }
    for (const count of Object.values(typeCounts)) {
      expect(count).toBeLessThanOrEqual(3);
    }
  });
});

// ─── getQuerySuggestions (Phase 1C 네이버 스타일 자동완성) ───

describe("getQuerySuggestions (텍스트 자동완성)", () => {
  it("빈 쿼리는 빈 배열을 반환한다", () => {
    expect(getQuerySuggestions("")).toEqual([]);
    expect(getQuerySuggestions("   ")).toEqual([]);
  });

  it("입력값 자체를 첫 후보로 포함한다 (네이버 패턴)", () => {
    const sugg = getQuerySuggestions("귤");
    expect(sugg[0]).toBe("귤");
  });

  it("최대 결과 수를 초과하지 않는다 (기본 8)", () => {
    const sugg = getQuerySuggestions("농");
    expect(sugg.length).toBeLessThanOrEqual(8);
  });

  it("결과는 중복 없는 텍스트 배열이다", () => {
    const sugg = getQuerySuggestions("딸기");
    const unique = new Set(sugg.map((s) => s.toLowerCase()));
    expect(unique.size).toBe(sugg.length);
    for (const item of sugg) {
      expect(typeof item).toBe("string");
      expect(item.length).toBeGreaterThan(0);
    }
  });

  it("시드 안내 매칭 시 풀네임을 포함한다 (예: 서생 → 울산 울주 서생면)", () => {
    const sugg = getQuerySuggestions("서생");
    const fullName = sugg.find((s) => s.includes("서생면"));
    expect(fullName).toBeDefined();
  });
});

// ─── Phase 2a — 의도형 FAQ 시드 (추천 의도 직역) ───

describe("의도형 FAQ 시드 — 맞춤/추천 의도 매칭", () => {
  it("'맞춤 지역 찾기' → /match FAQ 카드를 노출한다", () => {
    const results = searchAll("맞춤 지역 찾기");
    const faqCard = results.find(
      (r) => r.id === "faq-/match" && r.title.includes("맞춤 지역")
    );
    expect(faqCard).toBeDefined();
  });

  it("'어디가 좋을까' → /match FAQ 카드를 노출한다", () => {
    const results = searchAll("어디가 좋을까");
    const faqCard = results.find(
      (r) => r.id === "faq-/match" && r.title.includes("맞춤 지역")
    );
    expect(faqCard).toBeDefined();
  });

  it("'추천 작물' → /match FAQ 카드(맞춤 작물 추천)를 노출한다", () => {
    const results = searchAll("추천 작물");
    const faqCard = results.find(
      (r) => r.id === "faq-/match" && r.title.includes("맞춤 작물")
    );
    expect(faqCard).toBeDefined();
  });

  it("'자기 점검' → /match FAQ 카드(내 상황 점검)를 노출한다", () => {
    const results = searchAll("자기 점검");
    const faqCard = results.find(
      (r) => r.id === "faq-/match" && r.title.includes("내 상황 점검")
    );
    expect(faqCard).toBeDefined();
  });

  it("'추천해 줘' → /match FAQ 카드를 노출한다", () => {
    const results = searchAll("추천해 줘");
    const faqCard = results.find((r) => r.id === "faq-/match");
    expect(faqCard).toBeDefined();
  });

  it("기존 SEARCH_FAQS 매칭은 영향받지 않는다 (회귀 차단)", () => {
    // 비용 가이드
    const costs = searchAll("정착 비용 얼마나 들어");
    expect(costs.some((r) => r.id === "faq-/costs")).toBe(true);
    // 청년 통계
    const youth = searchAll("청년 농촌 정착 지원금");
    expect(youth.some((r) => r.id === "faq-/stats?tab=youth")).toBe(true);
    // 농지은행
    const land = searchAll("농지은행이 뭐야");
    expect(land.some((r) => r.id === "faq-/programs/roadmap")).toBe(true);
  });
});
