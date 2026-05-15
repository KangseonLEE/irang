/**
 * region-persona-explain.tsx 회귀 테스트
 * Phase B Sprint 1 (2026-05-15) — B-3 옵션 β 강점·약점 그룹화
 *
 * 배경: 2026-05-11 lessons "CLAUDE.md 명시만으로 코드 보장 안 됨 → 회귀 테스트 필수".
 *   RegionPersonaExplain은 /regions/ranking 페르소나 모드의 핵심 UI.
 *   강·약점 분류 로직이 흔들리면 매 시군구 카드에서 잘못된 정보가 노출된다.
 *
 * 검증 목표:
 *   1) 점수 60 이상 = 강점, 40 미만 = 약점, 그 사이 = 보통 (미노출)
 *   2) 각 그룹 최대 2개 (top by 가중 기여 contribution = value × weight)
 *   3) 가중치 0 차원은 강·약점 후보에서 제외 (페르소나가 무시한 차원)
 *   4) null 점수 차원(예: farmActivity는 도시 자치구에서 null)은 후보 제외
 *   5) 임계값 상수가 60/40으로 유지 (변경 시 UX 영향 큼)
 */

import { describe, it, expect } from "vitest";
import {
  splitStrengthsWeaknesses,
  STRENGTH_THRESHOLD,
  WEAKNESS_THRESHOLD,
} from "@/components/persona/region-persona-explain";
import type { DimensionScoresInput, Persona } from "@/lib/data/personas";

// 테스트용 페르소나 (가중치 합 100, 모든 차원 사용)
const testPersona: Persona = {
  id: "balanced",
  label: "테스트",
  audience: "테스트",
  desc: "테스트",
  weights: {
    populationTrend: 20,
    farmActivity: 20,
    medical: 20,
    school: 20,
    returnFarm: 20,
  },
} as Persona;

// farmActivity 가중치 0인 페르소나 (도시 자치구 친화 케이스)
const noFarmPersona: Persona = {
  id: "commuter",
  label: "통근",
  audience: "통근",
  desc: "통근",
  weights: {
    populationTrend: 25,
    farmActivity: 0,
    medical: 25,
    school: 25,
    returnFarm: 25,
  },
} as Persona;

describe("splitStrengthsWeaknesses (Phase B Sprint 1 B-3 옵션 β)", () => {
  it("임계값 상수가 60/40으로 유지된다", () => {
    expect(STRENGTH_THRESHOLD).toBe(60);
    expect(WEAKNESS_THRESHOLD).toBe(40);
  });

  it("점수 60 이상은 강점, 40 미만은 약점, 그 사이는 미분류", () => {
    const scores: DimensionScoresInput = {
      populationTrend: 85,  // 강점
      farmActivity: 70,     // 강점
      medical: 50,          // 보통 (분류 X)
      school: 30,           // 약점
      returnFarm: 10,       // 약점
    };
    const { strengths, weaknesses } = splitStrengthsWeaknesses(scores, testPersona);

    // 강점 2개 — 모두 ≥ 60
    expect(strengths).toHaveLength(2);
    strengths.forEach((e) => expect(e.value).toBeGreaterThanOrEqual(60));
    const strengthKeys = strengths.map((e) => e.key);
    expect(strengthKeys).toContain("populationTrend");
    expect(strengthKeys).toContain("farmActivity");

    // 약점 2개 — 모두 < 40
    expect(weaknesses).toHaveLength(2);
    weaknesses.forEach((e) => expect(e.value).toBeLessThan(40));
    const weaknessKeys = weaknesses.map((e) => e.key);
    expect(weaknessKeys).toContain("school");
    expect(weaknessKeys).toContain("returnFarm");

    // 점수 50인 medical은 둘 다 미포함
    expect(strengthKeys).not.toContain("medical");
    expect(weaknessKeys).not.toContain("medical");
  });

  it("강점·약점 각 최대 2개 (가중 기여 내림차순 top)", () => {
    // 5차원 모두 강점 점수 (60 이상)인 케이스 → 가중 기여 top 2만
    const scores: DimensionScoresInput = {
      populationTrend: 90,  // contribution = 90 × 20 = 1800
      farmActivity: 95,     // contribution = 95 × 20 = 1900
      medical: 60,          // contribution = 60 × 20 = 1200
      school: 70,           // contribution = 70 × 20 = 1400
      returnFarm: 80,       // contribution = 80 × 20 = 1600
    };
    const { strengths } = splitStrengthsWeaknesses(scores, testPersona);
    expect(strengths).toHaveLength(2);
    // top1 = farmActivity (1900), top2 = populationTrend (1800)
    expect(strengths[0].key).toBe("farmActivity");
    expect(strengths[1].key).toBe("populationTrend");
  });

  it("약점도 가중 기여 내림차순 top 2 (낮은 점수일수록 contribution도 낮으므로 가중치 큰 약점이 우선)", () => {
    const scores: DimensionScoresInput = {
      populationTrend: 35,  // contribution = 35 × 20 = 700
      farmActivity: 5,      // contribution = 5 × 20 = 100
      medical: 30,          // contribution = 30 × 20 = 600
      school: 20,           // contribution = 20 × 20 = 400
      returnFarm: 10,       // contribution = 10 × 20 = 200
    };
    const { weaknesses } = splitStrengthsWeaknesses(scores, testPersona);
    expect(weaknesses).toHaveLength(2);
    // top1 = populationTrend (700), top2 = medical (600)
    expect(weaknesses[0].key).toBe("populationTrend");
    expect(weaknesses[1].key).toBe("medical");
  });

  it("가중치 0인 차원은 강·약점 후보에서 제외 (commuter 페르소나 farmActivity)", () => {
    const scores: DimensionScoresInput = {
      populationTrend: 50,
      farmActivity: 95,  // 점수 높지만 weight=0 → 제외
      medical: 80,       // 강점
      school: 75,        // 강점
      returnFarm: 20,    // 약점
    };
    const { strengths, weaknesses } = splitStrengthsWeaknesses(scores, noFarmPersona);
    const allKeys = [...strengths, ...weaknesses].map((e) => e.key);
    expect(allKeys).not.toContain("farmActivity");
    expect(strengths.map((e) => e.key)).toEqual(
      expect.arrayContaining(["medical", "school"]),
    );
    expect(weaknesses.map((e) => e.key)).toContain("returnFarm");
  });

  it("null 점수 차원은 후보 제외 (도시 자치구 farmActivity = null 패턴)", () => {
    const scores: DimensionScoresInput = {
      populationTrend: 80,
      farmActivity: null,  // 도시 자치구 — 강·약점 분류 대상 아님
      medical: 85,
      school: 70,
      returnFarm: null,
    };
    const { strengths, weaknesses } = splitStrengthsWeaknesses(scores, testPersona);
    const allKeys = [...strengths, ...weaknesses].map((e) => e.key);
    expect(allKeys).not.toContain("farmActivity");
    expect(allKeys).not.toContain("returnFarm");
  });

  it("모든 점수가 보통(40~59)이면 강·약점 0건 (UI에서 row 미노출)", () => {
    const scores: DimensionScoresInput = {
      populationTrend: 50,
      farmActivity: 45,
      medical: 55,
      school: 48,
      returnFarm: 52,
    };
    const { strengths, weaknesses } = splitStrengthsWeaknesses(scores, testPersona);
    expect(strengths).toHaveLength(0);
    expect(weaknesses).toHaveLength(0);
  });

  it("경계값: 60은 강점에 포함, 40은 약점에 포함되지 않음 (≥60 / <40 규칙)", () => {
    const scores: DimensionScoresInput = {
      populationTrend: 60,  // 강점 경계 ✓
      farmActivity: 40,     // 약점 경계 — 미포함 (< 40 규칙)
      medical: 39,          // 약점 ✓
      school: 59,           // 보통 (< 60)
      returnFarm: 0,        // 약점
    };
    const { strengths, weaknesses } = splitStrengthsWeaknesses(scores, testPersona);
    const strengthKeys = strengths.map((e) => e.key);
    const weaknessKeys = weaknesses.map((e) => e.key);
    expect(strengthKeys).toContain("populationTrend");
    expect(strengthKeys).not.toContain("school");
    expect(weaknessKeys).toContain("medical");
    expect(weaknessKeys).toContain("returnFarm");
    expect(weaknessKeys).not.toContain("farmActivity");
  });
});
