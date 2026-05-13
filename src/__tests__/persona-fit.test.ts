/**
 * persona-fit.ts 회귀 테스트 (Phase 6 A안 D5)
 *
 * 배경: 2026-05-11 lessons "loadPrograms 5/10 fix 5/11 재발" 패턴 차용.
 *   CLAUDE.md 명시만으로 코드 보장 안 됨 → critical-path 동작은 회귀 테스트 필수.
 *   페르소나 추천이 흔들리면 /match·/crops·/programs·/regions/ranking/methodology
 *   4곳에서 동시에 사용자 신뢰가 깨진다.
 *
 * 검증 목표:
 *   1) 모든 페르소나에 대해 rank 함수가 입력 길이를 보존한다 (drop 0)
 *   2) 점수가 내림차순으로 정렬된다
 *   3) 각 페르소나가 의도한 카테고리·속성이 top에 노출된다
 *      (페르소나 산식이 약화되면 즉시 fail)
 *   4) baseline top1 (5/13 산출 기준) — data drift 시 의도된 변경인지 검토 게이트
 *   5) balanced 페르소나는 모든 작물·사업이 동점 3 (균등)
 *   6) 각 페르소나에 score >= 4인 추천 후보가 최소 1개 이상 (UI 빈 섹션 방지)
 */

import { describe, it, expect } from "vitest";
import { CROPS } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { PERSONAS, type PersonaId } from "@/lib/data/personas";
import {
  rankCropsForPersona,
  rankProgramsForPersona,
  getCropPersonaFit,
  getProgramPersonaFit,
} from "@/lib/data/persona-fit";

const PERSONA_IDS: PersonaId[] = [
  "family",
  "farmYouth",
  "elderRural",
  "commuter",
  "balanced",
];

// ─── 1) 길이 보존 ───
describe("rankCropsForPersona / rankProgramsForPersona — 길이 보존", () => {
  it.each(PERSONA_IDS)("%s 페르소나는 입력 작물을 모두 반환한다", (id) => {
    const result = rankCropsForPersona(CROPS, id);
    expect(result.length).toBe(CROPS.length);
  });

  it.each(PERSONA_IDS)("%s 페르소나는 입력 사업을 모두 반환한다", (id) => {
    const result = rankProgramsForPersona(PROGRAMS, id);
    expect(result.length).toBe(PROGRAMS.length);
  });
});

// ─── 2) 점수 내림차순 ───
describe("rank 함수는 점수 내림차순 정렬을 보장한다", () => {
  it.each(PERSONA_IDS)("%s 작물 정렬", (id) => {
    const result = rankCropsForPersona(CROPS, id);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });

  it.each(PERSONA_IDS)("%s 사업 정렬", (id) => {
    const result = rankProgramsForPersona(PROGRAMS, id);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });
});

// ─── 3) 페르소나 의도 일치 ───
describe("페르소나 의도가 top 결과에 반영된다", () => {
  it("family(자녀 양육): top10 작물에 채소·과수가 절반 이상 포함된다", () => {
    const top10 = rankCropsForPersona(CROPS, "family").slice(0, 10);
    const veggieFruitCount = top10.filter(
      (r) => r.crop.category === "채소" || r.crop.category === "과수",
    ).length;
    expect(veggieFruitCount).toBeGreaterThanOrEqual(5);
  });

  it("farmYouth(농업 본업): top5 작물에 특용·과수 또는 시설 작물이 포함된다", () => {
    const top5 = rankCropsForPersona(CROPS, "farmYouth").slice(0, 5);
    const hasHighValue = top5.some(
      (r) =>
        r.crop.category === "특용" ||
        r.crop.category === "과수" ||
        r.crop.id === "strawberry" || // 딸기 (시설)
        r.crop.id === "ginseng",
    );
    expect(hasHighValue).toBe(true);
  });

  it("elderRural(노년 귀촌): top5 작물에 어려움 난이도는 노출되지 않는다", () => {
    const top5 = rankCropsForPersona(CROPS, "elderRural").slice(0, 5);
    const hardCount = top5.filter((r) => r.crop.difficulty === "어려움").length;
    expect(hardCount).toBe(0);
  });

  it("commuter(귀촌 직장인): top5 작물에 과수가 포함된다 (관리 적은 작물 우대)", () => {
    const top5 = rankCropsForPersona(CROPS, "commuter").slice(0, 5);
    const fruitCount = top5.filter((r) => r.crop.category === "과수").length;
    expect(fruitCount).toBeGreaterThanOrEqual(2);
  });

  it("farmYouth(농업 본업): top5 사업에 청년 한정 또는 SP-001/SP-012(후계농)가 포함된다", () => {
    const top5 = rankProgramsForPersona(PROGRAMS, "farmYouth").slice(0, 5);
    const youthOrSuccessor = top5.some((r) => {
      const p = r.program;
      const isYouthOnly = p.eligibilityAgeMax > 0 && p.eligibilityAgeMax <= 40;
      const isSuccessor = p.id === "SP-001" || p.id === "SP-012";
      return isYouthOnly || isSuccessor;
    });
    expect(youthOrSuccessor).toBe(true);
  });

  it("elderRural(노년 귀촌): top5 사업에 청년 한정(40세 이하)은 노출되지 않는다", () => {
    const top5 = rankProgramsForPersona(PROGRAMS, "elderRural").slice(0, 5);
    const youthOnlyCount = top5.filter(
      (r) =>
        r.program.eligibilityAgeMax > 0 && r.program.eligibilityAgeMax <= 40,
    ).length;
    expect(youthOnlyCount).toBe(0);
  });

  it("commuter(귀촌 직장인): top5 사업에 체류형(SP-005/006/007/016/017) 우대", () => {
    const top5 = rankProgramsForPersona(PROGRAMS, "commuter").slice(0, 5);
    const stayProgramIds = ["SP-005", "SP-006", "SP-007", "SP-016", "SP-017"];
    const stayCount = top5.filter((r) =>
      stayProgramIds.includes(r.program.id),
    ).length;
    expect(stayCount).toBeGreaterThanOrEqual(3);
  });
});

// ─── 4) Baseline (data drift 감지) ───
describe("baseline top score (5/13 산출 — data drift 감지 게이트)", () => {
  // 각 페르소나의 top1 score는 baseline 시점 기준값.
  // 산식·override·데이터 변경으로 흔들리면 fail → 의도된 변경인지 검토.
  const TOP_CROP_SCORE_BASELINE: Record<PersonaId, number> = {
    family: 5,
    farmYouth: 5,
    elderRural: 5,
    commuter: 5,
    balanced: 3,
  };

  const TOP_PROGRAM_SCORE_BASELINE: Record<PersonaId, number> = {
    family: 5,
    farmYouth: 5,
    elderRural: 5,
    commuter: 5,
    balanced: 3,
  };

  it.each(PERSONA_IDS)("%s top1 작물 점수 baseline 일치", (id) => {
    const top = rankCropsForPersona(CROPS, id)[0];
    expect(top.score).toBe(TOP_CROP_SCORE_BASELINE[id]);
  });

  it.each(PERSONA_IDS)("%s top1 사업 점수 baseline 일치", (id) => {
    const top = rankProgramsForPersona(PROGRAMS, id)[0];
    expect(top.score).toBe(TOP_PROGRAM_SCORE_BASELINE[id]);
  });
});

// ─── 5) balanced 균등 ───
describe("balanced 페르소나는 모든 항목이 동점 3", () => {
  it("모든 작물의 balanced 점수가 3이다", () => {
    for (const crop of CROPS) {
      expect(getCropPersonaFit(crop).balanced).toBe(3);
    }
  });

  it("모든 사업의 balanced 점수가 3이다", () => {
    for (const program of PROGRAMS) {
      expect(getProgramPersonaFit(program).balanced).toBe(3);
    }
  });
});

// ─── 6) 추천 가능 후보 보장 (UI 빈 섹션 방지) ───
describe("각 페르소나에 score >= 4 추천 후보가 최소 1개 (UI 빈 섹션 방지)", () => {
  it.each(PERSONA_IDS.filter((id) => id !== "balanced"))(
    "%s 페르소나는 score >= 4 작물이 1개 이상",
    (id) => {
      const high = rankCropsForPersona(CROPS, id).filter((r) => r.score >= 4);
      expect(high.length).toBeGreaterThan(0);
    },
  );

  it.each(PERSONA_IDS.filter((id) => id !== "balanced"))(
    "%s 페르소나는 score >= 4 사업이 1개 이상",
    (id) => {
      const high = rankProgramsForPersona(PROGRAMS, id).filter(
        (r) => r.score >= 4,
      );
      expect(high.length).toBeGreaterThan(0);
    },
  );
});

// ─── 7) 점수 범위 ───
describe("페르소나 점수는 1~5 범위", () => {
  it("모든 작물 점수가 1~5", () => {
    for (const crop of CROPS) {
      const fit = getCropPersonaFit(crop);
      for (const id of PERSONA_IDS) {
        expect(fit[id]).toBeGreaterThanOrEqual(1);
        expect(fit[id]).toBeLessThanOrEqual(5);
      }
    }
  });

  it("모든 사업 점수가 1~5", () => {
    for (const program of PROGRAMS) {
      const fit = getProgramPersonaFit(program);
      for (const id of PERSONA_IDS) {
        expect(fit[id]).toBeGreaterThanOrEqual(1);
        expect(fit[id]).toBeLessThanOrEqual(5);
      }
    }
  });
});

// ─── 8) 페르소나 enum 완전성 ───
describe("페르소나 enum 완전성", () => {
  it("PERSONAS의 모든 id가 fit 함수에서 valid", () => {
    for (const persona of PERSONAS) {
      const cropFit = getCropPersonaFit(CROPS[0]);
      const programFit = getProgramPersonaFit(PROGRAMS[0]);
      expect(cropFit).toHaveProperty(persona.id);
      expect(programFit).toHaveProperty(persona.id);
    }
  });

  it("rank 함수는 5종 페르소나 모두 throw 없이 동작", () => {
    for (const persona of PERSONAS) {
      expect(() => rankCropsForPersona(CROPS, persona.id)).not.toThrow();
      expect(() => rankProgramsForPersona(PROGRAMS, persona.id)).not.toThrow();
    }
  });
});
