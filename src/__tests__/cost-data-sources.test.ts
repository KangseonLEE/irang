import { describe, expect, it } from "vitest";
import { COST_TYPE_PROFILES, costByAge, youthSettlementTotalManwon } from "@/lib/data/landing";
import { CROP_COSTS_BY_TYPE, STRATEGIES_BY_TYPE } from "@/lib/data/cost-by-type";
import { investmentByAge, settlementSurvey } from "@/lib/data/stats";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { YOUTH_SETTLEMENT } from "@/lib/data/policy-facts";
import { GLOSSARY_ENTRIES } from "@/lib/data/glossary";

/**
 * 비용·통계 화면 숫자의 출처 계약 (10/10 데이터 신뢰도 정정 트랙 D).
 * 원문이 없던 값(84.6%·생활 정착비·KB부동산 추정·규모 계수·작물 비용 범위·'50%↓' 등)이 다시 들어오지 않게 막는다.
 */
describe("비용 화면 — 실태조사·정책 사실에서 계산", () => {
  it("연령별 투자액은 실태조사 배열 그대로(70대 이상 포함)", () => {
    expect(costByAge.map((d) => d.raw)).toEqual(investmentByAge.map((d) => d.amount));
    expect(costByAge).toHaveLength(5);
  });

  it("귀농·귀촌·청년 요약 금액은 실태조사 투자액이다", () => {
    expect(COST_TYPE_PROFILES.farming.snapshot.totalRaw).toBe(settlementSurvey.investment);
    expect(COST_TYPE_PROFILES.village.snapshot.totalRaw).toBe(settlementSurvey.ruralInvestment);
    expect(COST_TYPE_PROFILES.youth.snapshot.totalRaw).toBe(investmentByAge[0].amount);
  });

  it("영농정착지원금 합계는 월 지원금 × 12개월 × 연차에서 계산된다", () => {
    const expected = YOUTH_SETTLEMENT.monthlyManwonByYear.value.reduce((s, m) => s + m * 12, 0);
    expect(youthSettlementTotalManwon).toBe(expected);
  });

  it("원문이 없던 값이 비용 데이터에 다시 들어오지 않는다", () => {
    const blob = JSON.stringify({ COST_TYPE_PROFILES, STRATEGIES_BY_TYPE, CROP_COSTS_BY_TYPE });
    for (const banned of ["84.6", "5,26", "6,567", "KB부동산", "2,800", "50%↓", "70%↓", "1.5억~2.5억", "식물공장"]) {
      expect(blob, banned).not.toContain(banned);
    }
  });

  it("귀촌 탭은 주택구입 융자를 안내하지 않는다 (귀촌만으로는 대상 아님, 10/6 정정)", () => {
    expect(JSON.stringify(COST_TYPE_PROFILES.village)).not.toContain("주택구입");
  });
});

describe("작물 행 — 작물 상세 값만 쓴다", () => {
  const crops = new Map(CROPS.map((c) => [c.id, c]));
  const details = new Map(CROP_DETAILS.map((d) => [d.id, d]));

  it("모든 행이 실재 작물이고, 소득은 작물 상세 공식 통계 문자열에서 나온다", () => {
    for (const [type, rows] of Object.entries(CROP_COSTS_BY_TYPE)) {
      for (const r of rows) {
        const crop = crops.get(r.cropPageId);
        const detail = details.get(r.cropPageId);
        expect(crop, `${type} ${r.id}`).toBeDefined();
        expect(r.name).toBe(crop!.name);
        expect(r.difficulty).toBe(crop!.difficulty);
        if (r.income === "자료 없음") {
          expect(r.incomeManwon10a).toBeNull();
        } else {
          expect(detail!.income.revenueRange).toContain(r.income.replace(/^약 /, ""));
          expect(r.source).toBe(detail!.income.source);
        }
      }
    }
  });
});

describe("용어 사전 — 숫자는 원천 상수에서", () => {
  const byTerm = (t: string) => GLOSSARY_ENTRIES.find((g) => g.term === t)!;

  it("농가소득은 실태조사 보도자료의 평균 농가(2024) 값이다 — 낡은 4,600만 원 아님", () => {
    const desc = byTerm("농가소득").longDesc;
    expect(desc).toContain(`${settlementSurvey.avgFarmHouseholdIncome.toLocaleString("ko-KR")}만 원`);
    expect(desc).not.toContain("4,600");
  });

  it("농촌돌봄농장에 원문 미확인 지원액(5,500만 원)을 적지 않는다", () => {
    expect(byTerm("농촌돌봄농장").longDesc).not.toMatch(/5,500/);
  });
});
