import { describe, expect, it } from "vitest";
import {
  buildAssessmentStats,
  buildWeeklyTrend,
  deviceOf,
  filterAssessmentRows,
  kstWeekStart,
  modeOf,
  referrerGroupOf,
} from "@/lib/admin/assessment-stats";
import type { AssessmentRow } from "@/lib/admin/types";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/155.0.0.0 Safari/537.36";

function row(over: Partial<AssessmentRow>): AssessmentRow {
  return {
    id: "aaaaaaaaaaaa",
    farm_type_id: "guinong",
    answers: {},
    top_regions: [],
    top_crops: [],
    referrer: null,
    user_agent: WINDOWS,
    age_group: null,
    source: "full",
    persona: null,
    created_at: "2026-10-19T02:00:00Z",
    ...over,
  };
}

describe("modeOf", () => {
  it("source=quick 이면 빠른 점검, 준비 단계가 있으면 준비도 진단, 나머지는 매칭", () => {
    expect(modeOf(row({ source: "quick", farm_type_id: null }))).toBe("quick");
    expect(modeOf(row({ answers: { q1: 3, __assess_tier: "sprout" } }))).toBe("assess");
    expect(modeOf(row({ answers: { q1: 3 }, top_regions: ["jeonnam"] }))).toBe("match");
  });
});

describe("referrerGroupOf", () => {
  it("검색엔진 하위 도메인·국가 도메인을 묶는다", () => {
    expect(referrerGroupOf("https://m.search.naver.com/")).toBe("naver");
    expect(referrerGroupOf("https://www.google.co.kr/")).toBe("google");
    expect(referrerGroupOf("https://irangfarm.com/crops")).toBe("internal");
    expect(referrerGroupOf(null)).toBe("direct");
  });

  it("이름에 검색엔진이 들어간 다른 도메인은 기타로 둔다", () => {
    expect(referrerGroupOf("https://notgoogle.com/")).toBe("other");
    expect(referrerGroupOf("https://naver.com.evil.example/")).toBe("other");
    expect(referrerGroupOf("not a url")).toBe("other");
  });
});

describe("deviceOf", () => {
  it("모바일 UA 를 가른다", () => {
    expect(deviceOf(IPHONE)).toBe("mobile");
    expect(deviceOf(WINDOWS)).toBe("desktop");
    expect(deviceOf(null)).toBe("desktop");
  });
});

describe("buildAssessmentStats", () => {
  const rows = [
    row({ answers: { q1: 4, q2: 1, __assess_tier: "seedling" }, age_group: "50s", user_agent: IPHONE }),
    row({ answers: { q1: 4, __assess_tier: "starter" }, age_group: null, farm_type_id: "cheongnyeon" }),
    row({ source: "quick", farm_type_id: null, persona: "farmYouth", age_group: "youth" }),
    row({ farm_type_id: "weekend", age_group: "40s", top_regions: ["jeonnam"], referrer: "https://www.google.com/" }),
  ];
  const stats = buildAssessmentStats(rows, 1, ["q1", "q2"]);

  it("진단 종류·기기·유입을 센다", () => {
    expect(stats.total).toBe(4);
    expect(stats.byMode).toEqual({ assess: 2, match: 1, quick: 1 });
    expect(stats.byDevice).toEqual({ mobile: 1, desktop: 3 });
    expect(stats.byReferrer.google).toBe(1);
    expect(stats.byReferrer.direct).toBe(3);
    expect(stats.withRecommendations).toBe(1);
  });

  it("옛 유형 id 는 새 id 로 합산한다", () => {
    expect(stats.byType.weekend).toBeUndefined();
    expect(Object.values(stats.byType).reduce((a, b) => a + b, 0)).toBe(3);
  });

  it("연령×유형은 연령·유형이 둘 다 있는 행만 — 미응답은 제외 건수로", () => {
    expect(stats.ageByTypeTotal).toBe(2);
    expect(stats.ageByTypeExcluded).toBe(1);
    expect(stats.ageByType.youth).toBeUndefined(); // 빠른 점검은 유형이 없다
  });

  it("문항 분포와 준비 단계는 준비도 진단 행만 센다", () => {
    expect(stats.tierTotal).toBe(2);
    expect(stats.byTier.seedling).toBe(1);
    expect(stats.questions[0]).toEqual({ questionId: "q1", answered: 2, byScore: { 4: 2 } });
    expect(stats.questions[1]).toEqual({ questionId: "q2", answered: 1, byScore: { 1: 1 } });
  });
});

describe("주별 추이", () => {
  it("KST 기준 월요일로 묶는다 — UTC 일요일 밤은 KST 월요일", () => {
    // 2026-10-18(일) 23:30 UTC = 2026-10-19(월) 08:30 KST
    expect(kstWeekStart("2026-10-18T23:30:00Z")).toBe("2026-10-19");
    expect(kstWeekStart("2026-10-18T14:00:00Z")).toBe("2026-10-12");
  });

  it("빈 주도 0 으로 채우고 범위 밖 행은 버린다", () => {
    const weeks = buildWeeklyTrend(
      [row({ created_at: "2026-10-19T02:00:00Z" }), row({ created_at: "2025-01-01T00:00:00Z" })],
      new Date("2026-10-20T03:00:00Z"),
      3,
    );
    expect(weeks.map((w) => w.weekStart)).toEqual(["2026-10-05", "2026-10-12", "2026-10-19"]);
    expect(weeks[2].counts.match).toBe(1);
    expect(weeks.reduce((a, w) => a + w.counts.match, 0)).toBe(1);
  });
});

describe("filterAssessmentRows", () => {
  it("종류·기기·유입 조건을 함께 건다", () => {
    const rows = [
      row({ source: "quick", farm_type_id: null, user_agent: IPHONE, referrer: "https://search.naver.com/" }),
      row({ source: "quick", farm_type_id: null, user_agent: WINDOWS, referrer: "https://search.naver.com/" }),
      row({ user_agent: IPHONE, referrer: "https://search.naver.com/" }),
    ];
    expect(filterAssessmentRows(rows, { mode: "quick", device: "mobile", referrer: "naver" })).toHaveLength(1);
    expect(filterAssessmentRows(rows, {})).toHaveLength(3);
  });
});
