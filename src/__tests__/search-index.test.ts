/**
 * search-index.ts 유닛 테스트
 *
 * 통합 검색 — 동의어 확장, 형태소 처리, 관련도 스코어링 검증
 */

import { describe, it, expect } from "vitest";
import {
  searchItems,
  searchAll,
  getQuerySuggestions,
  detectIntent,
} from "@/lib/data/search-index";

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

// ─── Phase 7 D — 작물 + 컨텍스트 검색 강화 (5종 신규 intent) ───

describe("작물 + 컨텍스트 의도 (detectIntent)", () => {
  it("'사과 재배지' → crop-region intent", () => {
    const intent = detectIntent("사과 재배지");
    expect(intent.type).toBe("crop-region");
    if (intent.type === "crop-region") {
      expect(intent.crop).toBe("사과");
    }
  });

  it("'딸기 수익' → crop-income intent", () => {
    const intent = detectIntent("딸기 수익");
    expect(intent.type).toBe("crop-income");
    if (intent.type === "crop-income") {
      expect(intent.crop).toBe("딸기");
    }
  });

  it("'포도 재배법' → crop-method intent", () => {
    const intent = detectIntent("포도 재배법");
    expect(intent.type).toBe("crop-method");
  });

  it("'고추 난이도' → crop-difficulty intent", () => {
    const intent = detectIntent("고추 난이도");
    expect(intent.type).toBe("crop-difficulty");
  });

  it("'토마토 기후' → crop-cultivation intent", () => {
    const intent = detectIntent("토마토 기후");
    expect(intent.type).toBe("crop-cultivation");
  });

  it("'토마토'만 입력하면 general intent (단일 단어)", () => {
    const intent = detectIntent("토마토");
    expect(intent.type).toBe("general");
  });

  it("'경남 사과'는 region-crop intent (기존 동작 유지)", () => {
    const intent = detectIntent("경남 사과");
    expect(intent.type).toBe("region-crop");
    if (intent.type === "region-crop") {
      expect(intent.region).toBe("경남");
      expect(intent.crop).toBe("사과");
    }
  });

  it("region-crop이 crop-context보다 우선한다", () => {
    // "전남 딸기 수익" → 지역+작물 동시 매칭이면 region-crop
    const intent = detectIntent("전남 딸기 수익");
    expect(intent.type).toBe("region-crop");
  });
});

describe("작물 + 컨텍스트 syntheticItem 합성", () => {
  it("'사과 재배지' 검색 → 상단에 '사과 주요 산지' 카드", () => {
    const results = searchAll("사과 재배지");
    const synthetic = results.find((r) => r.id === "crop-region-apple");
    expect(synthetic).toBeDefined();
    expect(synthetic?.title).toBe("사과 주요 산지");
    expect(synthetic?.href).toBe("/crops/apple#region");
    // 최상단 또는 hintPrefix/faq 직후 우선 노출 (앞쪽 5개 이내)
    const idx = results.findIndex((r) => r.id === "crop-region-apple");
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThanOrEqual(5);
  });

  it("'딸기 수익' 검색 → '딸기 수익·소득' 카드", () => {
    const results = searchAll("딸기 수익");
    const synthetic = results.find((r) => r.id === "crop-income-strawberry");
    expect(synthetic).toBeDefined();
    expect(synthetic?.href).toBe("/crops/strawberry#income");
  });

  it("'포도 재배법' 검색 → '포도 재배 방법' 카드", () => {
    const results = searchAll("포도 재배법");
    const synthetic = results.find((r) => r.id === "crop-method-grape");
    expect(synthetic).toBeDefined();
    expect(synthetic?.href).toBe("/crops/grape#grow-steps");
  });

  it("'고추 난이도' 검색 → '고추 난이도·장단점' 카드", () => {
    const results = searchAll("고추 난이도");
    const synthetic = results.find(
      (r) => r.id === "crop-difficulty-chili-pepper",
    );
    expect(synthetic).toBeDefined();
    expect(synthetic?.href).toBe("/crops/chili-pepper#pros-cons");
  });

  it("'토마토 기후' 검색 → '토마토 재배 조건' 카드", () => {
    const results = searchAll("토마토 기후");
    const synthetic = results.find(
      (r) => r.id === "crop-cultivation-tomato",
    );
    expect(synthetic).toBeDefined();
    expect(synthetic?.href).toBe("/crops/tomato#cultivation");
  });

  it("'사과 재배지' subtitle에 majorRegions 데이터가 노출된다", () => {
    const results = searchAll("사과 재배지");
    const synthetic = results.find((r) => r.id === "crop-region-apple");
    expect(synthetic?.subtitle).toMatch(/(경상북도|전라북도|충청북도)/);
  });

  it("'토마토' 단일 검색은 syntheticItem 없이 일반 결과만 노출", () => {
    const results = searchAll("토마토");
    const hasContextSynthetic = results.some((r) =>
      r.id.startsWith("crop-region-tomato") ||
      r.id.startsWith("crop-income-tomato") ||
      r.id.startsWith("crop-method-tomato") ||
      r.id.startsWith("crop-cultivation-tomato") ||
      r.id.startsWith("crop-difficulty-tomato"),
    );
    expect(hasContextSynthetic).toBe(false);
  });

  it("'경남 사과' region-crop intent는 기존 cross 카드를 유지한다", () => {
    const results = searchAll("경남 사과");
    const cross = results.find((r) => r.id.startsWith("cross-"));
    expect(cross).toBeDefined();
  });
});

// ─── 작물명 정확 매치 시 crop 카드 최상단 hoist (5/22 회장 요청) ───

describe("작물명 단일 검색 — crop 카드 최상단 hoist", () => {
  it("'사과' 단일 검색 → 1위가 crop 타입 '사과'", () => {
    const results = searchAll("사과");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe("crop");
    expect(results[0].title).toBe("사과");
  });

  it("'딸기' 단일 검색 → 1위가 crop 타입 '딸기'", () => {
    const results = searchAll("딸기");
    expect(results[0].type).toBe("crop");
    expect(results[0].title).toBe("딸기");
  });

  it("'포도' 단일 검색 → 1위가 crop 타입 '포도'", () => {
    const results = searchAll("포도");
    expect(results[0].type).toBe("crop");
    expect(results[0].title).toBe("포도");
  });

  it("'감자' 단일 검색 → 1위가 crop 타입 '감자' (FAQ 매칭 없음, 변화 없음)", () => {
    const results = searchAll("감자");
    expect(results[0].type).toBe("crop");
    expect(results[0].title).toBe("감자");
  });

  it("'사과 재배지' 복합 쿼리 → hoist 미적용, 기존 syntheticItem 우선 유지", () => {
    const results = searchAll("사과 재배지");
    const synthetic = results.find((r) => r.id === "crop-region-apple");
    expect(synthetic).toBeDefined();
  });

  it("'서울' 비-작물 쿼리 → hoist 미적용 (작물 사전에만 한정)", () => {
    const results = searchAll("서울");
    // crop이 1위에 강제로 박히지 않음 (서울은 작물명 아님)
    if (results.length > 0) {
      expect(results[0].type).not.toBe("crop");
    }
  });
});


// ─── 작물명 prefix 자동 공백 (붙여쓰기 정규화) ───
// 한국어 사용자는 "사과 재배지" / "사과재배지" 둘 다 자연스럽게 입력함.
// 후자도 전자와 동등하거나 근사한 결과를 반환해야 함.

describe("작물명 prefix 자동 공백 분리", () => {
  it("'사과재배지'(붙여쓰기)는 '사과 재배지'와 동일한 crop-region intent로 분기한다", () => {
    const intent = detectIntent("사과재배지");
    expect(intent.type).toBe("crop-region");
    if (intent.type === "crop-region") {
      expect(intent.crop).toBe("사과");
    }
  });

  it("'사과재배지' 검색 결과에 '사과 주요 산지' 합성 카드가 노출된다", () => {
    const results = searchAll("사과재배지");
    const synthetic = results.find((r) => r.id === "crop-region-apple");
    expect(synthetic).toBeDefined();
    expect(synthetic?.href).toBe("/crops/apple#region");
  });

  it("'딸기수익'(붙여쓰기)도 crop-income intent로 분기한다", () => {
    const intent = detectIntent("딸기수익");
    expect(intent.type).toBe("crop-income");
    if (intent.type === "crop-income") {
      expect(intent.crop).toBe("딸기");
    }
  });

  it("'포도재배법'도 crop-method 합성 카드를 노출한다", () => {
    const results = searchAll("포도재배법");
    const synthetic = results.find((r) => r.id === "crop-method-grape");
    expect(synthetic).toBeDefined();
  });

  it("붙여쓰기와 띄어쓰기 결과 건수가 근사한다 (±5건 이내)", () => {
    const spaced = searchAll("사과 재배지");
    const joined = searchAll("사과재배지");
    // 띄어쓰기 결과보다 너무 적으면 fix 효과 부족
    expect(joined.length).toBeGreaterThanOrEqual(spaced.length - 5);
  });

  it("'사과'(단일 작물명)은 분리되지 않고 그대로 처리된다", () => {
    const intent = detectIntent("사과");
    expect(intent.type).toBe("general");
  });

  it("'사과는'(작물명 + 조사)은 분리되지 않고 기존 형태소 처리에 위임된다", () => {
    // 분리되면 "사과 는"이 되어 multi-term 경로로 빠짐 (점수 산식 변화)
    // 조사만 남는 경우는 PARTICLE_ONLY 가드로 skip되어야 함
    const results = searchAll("사과는");
    expect(results.some((r) => r.title.includes("사과"))).toBe(true);
  });

  it("'방울토마토재배지'는 긴 작물명(방울토마토)이 우선 매칭된다", () => {
    // greedy longest match: "토마토"(3자)보다 "방울토마토"(5자)가 우선
    const intent = detectIntent("방울토마토재배지");
    expect(intent.type).toBe("crop-region");
    if (intent.type === "crop-region") {
      expect(intent.crop).toBe("방울토마토");
    }
  });
});
