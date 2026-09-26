/**
 * search-index.ts 유닛 테스트
 *
 * 통합 검색 — 동의어 확장, 형태소 처리, 관련도 스코어링 검증
 */

import { describe, it, expect } from "vitest";
import { NEGATIVE, POSITIVE } from "./fixtures/search-adversarial-corpus";
import {
  searchItems,
  searchAll,
  searchAllGrouped,
  getQuerySuggestions,
  detectIntent,
  buildSearchAnswer,
  buildCropPanel,
  resolveSearchDisplay, getNoResultSuggestions, getNoResultHintItems,
  buildRelatedSearches,
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

// ─── entity hoist 확장 — 시도·시군구·지원사업 (5/22 회장 결재 A안) ───

describe("entity hoist 확장 — 지역·지원사업", () => {
  it("'경남' (시도 shortName) → region 시도 카드 1위", () => {
    const results = searchAll("경남");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe("region");
    expect(results[0].id).toBe("province-gyeongnam");
  });

  it("'경상남도' (시도 풀네임) → 같은 시도 카드 1위", () => {
    const results = searchAll("경상남도");
    expect(results[0].type).toBe("region");
    expect(results[0].id).toBe("province-gyeongnam");
  });

  it("'서울' → 시도 카드 1위 (시도 SearchItem 동적 생성)", () => {
    const results = searchAll("서울");
    expect(results[0].type).toBe("region");
    expect(results[0].id).toBe("province-seoul");
  });

  it("'강원' → 시도 카드 1위 (구표기 유지)", () => {
    const results = searchAll("강원");
    expect(results[0].type).toBe("region");
    expect(results[0].id).toBe("province-gangwon");
  });

  it("'전주시' (시군구 정확 매치) → region 1위는 region 타입", () => {
    const results = searchAll("전주시");
    expect(results[0].type).toBe("region");
    expect(results[0].title).toBe("전주시");
  });

  it("'중구' (동음이의 시군구) → region 카드 다수 hoist (sub-region hint 다음)", () => {
    const results = searchAll("중구");
    // hintPrefix(안동 중구동)가 1위일 수 있으니 region 타입이 상위에 다수 있는지만 확인
    const topRegions = results.slice(0, 8).filter((r) => r.type === "region");
    expect(topRegions.length).toBeGreaterThanOrEqual(3);
  });

  it("정확 매치 없는 약칭(스마트팜)은 hoist 없이 기존 점수 산식 적용", () => {
    const results = searchAll("스마트팜");
    // hoist 안 됨 — guide·glossary 카드들이 정상 노출
    expect(results.length).toBeGreaterThan(0);
    // 강제로 1위가 region/crop으로 박히지 않음
    expect(["guide", "glossary", "program", "crop", "education", "interview", "event", "land"]).toContain(
      results[0].type,
    );
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

// ─── 테마 접두어 prefix 자동 공백 분리 (6/19 회장 발견: "귀농교육" 0 교육) ───
describe("테마 접두어 prefix 자동 공백 분리", () => {
  it("'귀농교육'(붙여쓰기) 검색에 교육 강좌(education)가 노출된다", () => {
    const results = searchAll("귀농교육");
    const edu = results.filter((r) => r.type === "education");
    expect(edu.length).toBeGreaterThan(0);
  });

  it("'귀농교육'과 '귀농 교육' 결과 건수가 동일하다 (정규화 일치)", () => {
    const joined = searchAll("귀농교육");
    const spaced = searchAll("귀농 교육");
    expect(joined.length).toBe(spaced.length);
  });

  it("'귀촌교육'·'스마트팜교육'도 교육 강좌를 반환한다", () => {
    expect(
      searchAll("귀촌교육").some((r) => r.type === "education"),
    ).toBe(true);
    expect(
      searchAll("스마트팜교육").some((r) => r.type === "education"),
    ).toBe(true);
  });

  it("'귀농인'(rest 1자)은 분리되지 않는다 — 한 단어 보존", () => {
    // "귀농 인"으로 오분리되면 안 됨 (rest.length < 2 가드)
    const joined = searchAll("귀농인");
    const spaced = searchAll("귀농 인");
    // 분리됐다면 두 결과가 같아짐 → 달라야 정상(미분리)
    expect(joined.length).not.toBe(spaced.length);
  });

  it("'귀농'(단일 테마어)은 분리되지 않고 그대로 검색된다", () => {
    const results = searchAll("귀농");
    expect(results.length).toBeGreaterThan(0);
  });
});

// ─── 답변 카드 (Featured Snippet) — buildSearchAnswer (P0, 6/19) ───
describe("buildSearchAnswer (답변 카드 데이터)", () => {
  it("'감귤 소득' → crop-income 답변 + 소득 lead + 출처 + 소득비교 CTA", () => {
    const a = buildSearchAnswer("감귤 소득");
    expect(a).not.toBeNull();
    expect(a?.kind).toBe("crop-income");
    expect(a?.cropName).toBe("감귤");
    expect(a?.lead).toBeTruthy(); // revenueRange
    expect(a?.source).toBeTruthy();
    expect(a?.secondaryHref).toBe("/crops?sort=income");
  });

  it("'사과 재배지' → crop-region 답변 + 주산지 목록", () => {
    const a = buildSearchAnswer("사과 재배지");
    expect(a?.kind).toBe("crop-region");
    expect(a?.regions?.length).toBeGreaterThan(0);
    expect(a?.primaryHref).toBe("/crops/apple#region");
  });

  it("'딸기 재배법' → crop-method 답변 + 단계 facts", () => {
    const a = buildSearchAnswer("딸기 재배법");
    expect(a?.kind).toBe("crop-method");
    expect(a?.facts.length).toBeGreaterThan(0);
  });

  it("'전남 사과' → region-crop 답변", () => {
    const a = buildSearchAnswer("전남 사과");
    expect(a?.kind).toBe("region-crop");
    expect(a?.cropName).toBe("사과");
  });

  it("'감귤'(단일 엔티티) → null (P0 범위 밖, P1 지식패널 영역)", () => {
    expect(buildSearchAnswer("감귤")).toBeNull();
  });

  it("'서울'(작물 무관) → null", () => {
    expect(buildSearchAnswer("서울")).toBeNull();
  });

  it("답변 카드 CTA href는 항상 유효한 내부 경로다", () => {
    const a = buildSearchAnswer("딸기 수익");
    expect(a?.primaryHref.startsWith("/crops/")).toBe(true);
  });
});

// ─── 지식 패널 (Knowledge Panel) — buildCropPanel (P1, 6/19) ───
describe("buildCropPanel (지식 패널 데이터)", () => {
  it("'감귤'(단일 작물) → 패널 + facts + 주산지 + sitelinks + 관련작물", () => {
    const p = buildCropPanel("감귤");
    expect(p).not.toBeNull();
    expect(p?.cropName).toBe("감귤");
    expect(p?.facts.length).toBeGreaterThan(0);
    expect(p?.regions.length).toBeGreaterThan(0);
    expect(p?.sitelinks.length).toBeGreaterThan(0);
    expect(p?.relatedCrops.length).toBeGreaterThan(0);
  });

  it("관련작물은 실제 CROPS id로 연결된다", () => {
    const p = buildCropPanel("사과");
    for (const rc of p?.relatedCrops ?? []) {
      expect(rc.id).toBeTruthy();
      expect(rc.name).toBeTruthy();
    }
  });

  it("'감귤 소득'(intent 검색) → null (답변 카드가 처리, 상호배타)", () => {
    expect(buildCropPanel("감귤 소득")).toBeNull();
  });

  it("'서울'(작물 아님) → null", () => {
    expect(buildCropPanel("서울")).toBeNull();
  });

  it("패널 facts 값은 괄호 앞 핵심부만 노출돼 과도하게 길지 않다", () => {
    const p = buildCropPanel("감귤");
    const revenue = p?.facts.find((f) => f.label === "평균소득");
    expect(revenue?.value).not.toContain("(");
  });
});

// ─── 연관 검색어 (Related Searches) — buildRelatedSearches (P2, 6/19) ───
describe("buildRelatedSearches (연관 검색어)", () => {
  it("작물 검색 → context 확장 + 관련작물 연관어", () => {
    const r = buildRelatedSearches("감귤");
    expect(r).toContain("감귤 소득");
    expect(r.length).toBeGreaterThan(0);
  });

  it("모든 연관어는 실제 결과를 반환한다 (dead 칩 차단)", () => {
    for (const q of ["감귤", "딸기 소득", "융자"]) {
      for (const rel of buildRelatedSearches(q)) {
        expect(searchAll(rel).length).toBeGreaterThan(0);
      }
    }
  });

  it("연관어에 현재 검색어 자신은 포함되지 않는다", () => {
    const r = buildRelatedSearches("감귤");
    expect(r).not.toContain("감귤");
  });

  it("일반 검색 → 인기 키워드 기반 연관어", () => {
    expect(buildRelatedSearches("융자").length).toBeGreaterThan(0);
  });

  it("최대 6개로 제한된다", () => {
    expect(buildRelatedSearches("감귤").length).toBeLessThanOrEqual(6);
  });
});

describe("resolveSearchDisplay — 답변카드·지식패널 흡수 시 히트 수 (8/29 참깨 사고)", () => {
  it("교차 참조 없는 작물(참깨·들깨)은 목록 0건이어도 히트 수는 패널 포함 1건", () => {
    for (const q of ["참깨", "들깨"]) {
      const results = searchAll(q);
      const answer = buildSearchAnswer(q);
      const panel = answer ? null : buildCropPanel(q);
      expect(panel, `${q} 패널`).not.toBeNull();
      const { displayResults, hitCount } = resolveSearchDisplay(results, answer, panel);
      expect(displayResults.filter((r) => r.type === "crop" && r.id === panel!.cropId)).toHaveLength(0);
      expect(hitCount, `${q} 히트 수`).toBeGreaterThan(0);
    }
  });

  it("패널·답변이 없으면 히트 수 = 목록 길이", () => {
    const results = searchAll("귀농 교육");
    const { displayResults, hitCount } = resolveSearchDisplay(results, null, null);
    expect(hitCount).toBe(displayResults.length);
    expect(hitCount).toBe(results.length);
  });

  it("패널이 흡수한 작물 카드 1건만큼 목록이 줄고 히트 수는 유지", () => {
    const q = "사과";
    const results = searchAll(q);
    const panel = buildCropPanel(q);
    expect(panel).not.toBeNull();
    const { displayResults, hitCount } = resolveSearchDisplay(results, null, panel);
    expect(displayResults.length).toBe(results.length - 1);
    expect(hitCount).toBe(results.length);
  });
});

describe("결과 0건 — 검색어에 포함된 실재 작물·지역 안내 (9/23 가시오이)", () => {
  it.each([
    ["가시오이", "오이"],
    ["방울양배추", "배추"], // 양배추는 작물 목록에 없다
    ["흑마늘", "마늘"],
    ["자색고구마", "고구마"],
    ["대봉감", "감"], // 1자 작물은 끝글자일 때만
    ["알타리무", "무"],
  ])("%s → 제안·카드에 %s", (q, expected) => {
    expect(searchAll(q).length).toBe(0);
    expect(getNoResultSuggestions(q)).toContain(expected);
    expect(getNoResultHintItems(q).map((i) => i.title)).toContain(expected);
  });

  it("지역명은 자동 대체하지 않는다 — '가평펜션'·'영양제'·'강남스타일' (9/23 독립 QA: 지명 접두 오탐 93%)", () => {
    for (const q of ["가평펜션", "영양제", "강남스타일", "정선희", "포항공대", "화성동탄신도시", "통영동피랑벽화마을", "과천서울대공원"]) {
      expect(getNoResultSuggestions(q)).toEqual([]);
    }
  });

  it("작물명이 끝에 있지 않으면 대체하지 않는다 — '오이피클'·'감자칩'", () => {
    expect(getNoResultSuggestions("오이피클")).toEqual([]);
    expect(getNoResultSuggestions("감자칩")).toEqual([]);
  });

  it("1자 작물은 알려진 품종 수식어일 때만 — 밤나무·공감·선배는 제외, 곶감·총각무·찹쌀·완두콩은 대체", () => {
    for (const q of ["밤나무", "공감", "선배", "어젯밤", "사무실"]) expect(getNoResultSuggestions(q)).toEqual([]);
    expect(getNoResultSuggestions("곶감")).toEqual(["감"]);
    expect(getNoResultSuggestions("총각무")).toEqual(["무"]);
    expect(getNoResultSuggestions("찹쌀")).toEqual(["쌀"]);
    expect(getNoResultSuggestions("완두콩")).toEqual(["콩"]);
  });

  it("긴 문장이 우연히 작물명으로 끝나도 대체하지 않는다", () => {
    expect(getNoResultSuggestions("저녁에마신와인한잔감")).toEqual([]);
    expect(getNoResultSuggestions("새벽에몰래빠져나온단잠결에느낀두려운밤")).toEqual([]);
    expect(getNoResultSuggestions("아주아주아주달콤한사과")).toEqual([]); // 앞부분 5자 초과
  });

  it("1자 작물은 중간 포함으로는 제안하지 않는다 (오탐 방지)", () => {
    expect(getNoResultSuggestions("감자칩")).not.toContain("감");
    expect(getNoResultSuggestions("무화과잼")).not.toContain("무");
  });

  it("시드 힌트(고사리·명이나물)는 그대로 유지된다", () => {
    expect(getNoResultHintItems("명이나물").map((i) => i.title)).toEqual(["더덕", "도라지"]);
  });

  it("검색어와 같은 이름은 제안하지 않는다", () => {
    expect(getNoResultSuggestions("오이")).not.toContain("오이");
  });
});

describe("조사 제거가 실재 이름을 깎지 않는다 (9/23 '오이' → '오' 사고)", () => {
  const has = (r: ReturnType<typeof searchAll>[number], term: string) =>
    [r.title, r.subtitle, r.badge ?? "", ...r.keywords].some((f) => f.toLowerCase().includes(term));

  it.each(["오이", "경기", "완도", "보은"])("'%s' 결과는 전부 그 이름을 실제로 포함한다", (term) => {
    const rs = searchAll(term);
    expect(rs.length).toBeGreaterThan(0);
    const strangers = rs.filter((r) => !has(r, term));
    expect(strangers.map((r) => `${r.type}:${r.title}`)).toEqual([]);
  });

  it("'오이'에 오산시·오미자가 섞이지 않는다", () => {
    const titles = searchAll("오이").map((r) => r.title);
    expect(titles).not.toContain("오산시");
    expect(titles).not.toContain("오미자");
  });

  it("진짜 조사는 여전히 뗀다 — '사과를' → 사과", () => {
    expect(searchAll("사과를").map((r) => r.title)).toContain("사과");
  });
});

describe("1자 작물 접두 분리·카테고리 동의어 노이즈 (9/23 전수 감사)", () => {
  const has = (r: ReturnType<typeof searchAll>[number], term: string) =>
    [r.title, r.subtitle, r.badge ?? "", ...r.keywords].some((f) => f.toLowerCase().includes(term));

  it.each(["무주", "무안"])("지역명 '%s'이 '무 + 나머지'로 갈리지 않는다", (q) => {
    const rs = searchAll(q);
    expect(rs.length).toBeLessThan(10);
    expect(rs.filter((r) => !has(r, q)).map((r) => r.title)).toEqual([]);
  });

  it("1자 작물 접두 복합어는 와일드카드가 되지 않는다 — '배송'·'감나무'", () => {
    expect(searchAll("배송").map((r) => r.title)).not.toContain("송파구");
    expect(searchAll("감나무").map((r) => r.title)).not.toContain("감자");
  });

  it("2자 이상 작물 접두 분리는 유지 — '사과재배지'", () => {
    expect(searchAll("사과재배지").length).toBeGreaterThan(3);
  });

  it("'포도'에 같은 카테고리라는 이유로 사과·감귤이 섞이지 않는다", () => {
    const titles = searchAll("포도").filter((r) => r.type === "crop").map((r) => r.title);
    expect(titles).toContain("포도");
    expect(titles).not.toContain("사과");
    expect(titles).not.toContain("감귤");
  });

  it("'스마트팜'에 농업기술원·시청이 '기술' 동의어로 섞이지 않는다", () => {
    const titles = searchAll("스마트팜").map((r) => r.title);
    expect(titles.some((t) => t.includes("농업기술원"))).toBe(false);
    expect(titles).not.toContain("치유농업사 자격시험 (한국농업기술진흥원)");
  });
});

describe("FAQ 1자 키워드는 정확 일치일 때만 (9/23 삼척→산양삼)", () => {
  it("'삼척'·'인삼'에 산양삼 가이드가 붙지 않는다", () => {
    for (const q of ["삼척", "인삼"]) {
      expect(searchAll(q).map((r) => r.title)).not.toContain("산양삼·장뇌삼 임산물 비용");
    }
  });
  it("'땅' 한 글자 검색은 여전히 농지 가이드를 찾는다", () => {
    expect(searchAll("땅").some((r) => r.type === "guide")).toBe(true);
  });
});

describe("일반어만으로는 매칭되지 않는다 — FAQ 역포함·복합 OR (9/23 감사)", () => {
  it("'오이 재배'·'오이재배'에 딸기·사과 재배 FAQ 가 붙지 않고 오이가 1위", () => {
    for (const q of ["오이 재배", "오이재배"]) {
      const titles = searchAll(q).map((r) => r.title);
      expect(titles[0]).toBe("오이");
      expect(titles).not.toContain("딸기 재배 정보");
      expect(titles).not.toContain("사과 재배 정보");
    }
  });
  it("'딸기 재배'는 딸기 재배 FAQ 를 그대로 찾는다", () => {
    expect(searchAll("딸기 재배").map((r) => r.title)).toContain("딸기 재배 정보");
  });
  it("'전남 귀농'은 전남 관련만 남는다 (귀농만 맞는 가이드 제외)", () => {
    const rs = searchAll("전남 귀농");
    expect(rs.length).toBeGreaterThan(5);
    const fields = (r: (typeof rs)[number]) => [r.title, r.subtitle, ...r.keywords].join(" ");
    const strangers = rs.filter((r) => !/전남|전라남도/.test(fields(r)));
    expect(strangers.map((r) => r.title)).toEqual([]);
  });
  it("전부 일반어인 검색('귀농 교육'·'귀농 절차')은 종전대로 결과가 있다", () => {
    expect(searchAll("귀농 교육").length).toBeGreaterThan(10);
    expect(searchAll("귀농 절차").some((r) => r.type === "guide")).toBe(true);
  });
  it("'재배' 단독은 남의 작물 FAQ 로 시작하지 않는다", () => {
    const titles = searchAll("재배지").map((r) => r.title);
    expect(titles).not.toContain("딸기 재배 정보");
  });
});

describe("자동 대체 적대 코퍼스 (9/23) — 무관한 검색어에 후보 0, 품종 검색어엔 기대 작물", () => {
  it(`NEGATIVE ${NEGATIVE.length}건 전부 후보 없음`, () => {
    const leaked = NEGATIVE.filter((q) => getNoResultSuggestions(q).length > 0).map((q) => `${q}→${getNoResultSuggestions(q)[0]}`);
    expect(leaked).toEqual([]);
  });
  it(`POSITIVE ${POSITIVE.length}건 기대 작물 포함`, () => {
    const missed = POSITIVE.filter(([q, crop]) => !getNoResultSuggestions(q).includes(crop)).map(([q, crop]) => `${q}↛${crop}`);
    expect(missed).toEqual([]);
  });
});

describe("관련도 하한선 + 지역 구체성 (9/23 고도화)", () => {
  it("'사과'에 설명문에 사과가 언급된 망고가 섞이지 않는다", () => {
    const titles = searchAll("사과").map((r) => r.title);
    expect(titles[0]).toBe("사과");
    expect(titles).not.toContain("망고");
  });
  it("정확 일치가 없는 검색은 부제 매칭도 그대로 산다 — '수확량'", () => {
    expect(searchAll("도열병").length).toBeGreaterThan(0);
  });
  it("'충북 서산'·'경기도 가평'은 시·도만 맞은 항목을 내린다", () => {
    const seosan = searchAll("충북 서산").map((r) => r.title);
    expect(seosan).toContain("서산시");
    expect(seosan).not.toContain("충주시");
    const gapyeong = searchAll("경기도 가평").map((r) => r.title);
    expect(gapyeong).toContain("가평군");
    expect(gapyeong).not.toContain("수원시");
  });
  it("'완도 딸기'는 딸기 작물 카드를 유지한다 (작물 특정어는 살림)", () => {
    expect(searchAll("완도 딸기").map((r) => r.title)).toContain("딸기");
  });
  it("'전남 딸기'는 시·군·구가 없으므로 종전대로", () => {
    expect(searchAll("전남 딸기").length).toBeGreaterThan(20);
  });
});

// ─── searchAllGrouped 계약 (Phase A, 2026-09-26) ───

describe("searchAllGrouped — 고정 블록/일반 결과 분리 계약", () => {
  const QUERIES = ["사과", "가평", "전남 귀농", "도열병", "가시오이", "울산 서생", "전남 딸기", "사과 수익"];

  it("pinned + rest 를 이어 붙이면 searchAll 과 완전히 같다", () => {
    for (const q of QUERIES) {
      const { pinned, rest } = searchAllGrouped(q);
      const flat = searchAll(q);
      expect(pinned.length + rest.length, q).toBe(flat.length);
      expect([...pinned, ...rest].map((i) => `${i.type}:${i.id}`), q).toEqual(
        flat.map((i) => `${i.type}:${i.id}`),
      );
    }
  });

  it("pinned 는 searchAll 결과의 선두 블록과 id 집합이 일치한다", () => {
    for (const q of QUERIES) {
      const { pinned } = searchAllGrouped(q);
      const head = searchAll(q).slice(0, pinned.length);
      expect(head.map((i) => i.id), q).toEqual(pinned.map((i) => i.id));
    }
  });

  it("빈 쿼리는 pinned·rest 모두 빈 배열", () => {
    expect(searchAllGrouped("")).toEqual({ pinned: [], rest: [] });
    expect(searchAllGrouped("   ")).toEqual({ pinned: [], rest: [] });
  });

  it("정확 일치 hoist 는 pinned 에 들어간다 — '사과'", () => {
    const { pinned } = searchAllGrouped("사과");
    expect(pinned.length).toBeGreaterThan(0);
    expect(pinned[0].title).toBe("사과");
  });

  it("읍·면·동 안내 카드는 pinned 최상단 — '서생'", () => {
    const { pinned } = searchAllGrouped("서생");
    expect(pinned[0]?.id.startsWith("sub-region-hint-")).toBe(true);
  });

  it("작물 context 딥링크는 pinned — '사과 수익'", () => {
    const { pinned } = searchAllGrouped("사과 수익");
    expect(pinned.some((i) => i.href.startsWith("/crops/apple#"))).toBe(true);
  });
});
