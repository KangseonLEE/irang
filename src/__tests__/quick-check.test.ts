/**
 * Quick Check (Phase 2c 2026-05-15) — 4문항 → 페르소나 매핑 회귀 테스트
 *
 * 검증 목표:
 *   1) 4문항 단일 선택 답변 조합 → 페르소나 5종 중 1개로 매핑됨 (balanced fallback 포함)
 *   2) 매핑 우선순위:
 *        farming=main > farming=none > family=children > age=60plus > balanced
 *   3) 4문항 답변 누락 시도 balanced로 안전 fallback
 *   4) buildRecommendations 가 항상 /regions/ranking?persona=... · /crops?persona=... ·
 *      /programs?persona=... 3종 URL을 생성 (Phase 6 A안 deep link 시스템 호환)
 *   5) QUICK_QUESTIONS 데이터 모듈 무결성:
 *        - 4문항 모두 존재
 *        - 각 질문의 option id 중복 없음
 *        - 모든 option label 비어있지 않음
 */

import { describe, it, expect } from "vitest";
import {
  QUICK_QUESTIONS,
  mapToPersona,
  buildRecommendations,
  getResultMessage,
  type QuickAnswers,
} from "@/lib/data/quick-check";
import { PERSONA_INDEX } from "@/lib/data/personas";

describe("Quick Check — 4문항 페르소나 매핑", () => {
  describe("mapToPersona 우선순위", () => {
    it("farming=main → farmYouth (자본·연령 무관)", () => {
      const cases: QuickAnswers[] = [
        { ageGroup: "youth", family: "alone", farming: "main", capital: "low" },
        { ageGroup: "60plus", family: "children", farming: "main", capital: "high" },
        { ageGroup: "40s", family: "couple", farming: "main", capital: "mid" },
      ];
      for (const c of cases) {
        expect(mapToPersona(c)).toBe("farmYouth");
      }
    });

    it("farming=none → commuter (도시 통근 명확)", () => {
      const cases: QuickAnswers[] = [
        { ageGroup: "30s", family: "couple", farming: "none", capital: "low" },
        { ageGroup: "60plus", family: "children", farming: "none", capital: "high" },
      ];
      for (const c of cases) {
        expect(mapToPersona(c)).toBe("commuter");
      }
    });

    it("farming=side + family=children → family (자녀 양육 우선)", () => {
      expect(
        mapToPersona({
          ageGroup: "30s",
          family: "children",
          farming: "side",
          capital: "mid",
        }),
      ).toBe("family");
    });

    it("farming=side + ageGroup=60plus → elderRural (자녀 없을 때 은퇴 귀촌)", () => {
      expect(
        mapToPersona({
          ageGroup: "60plus",
          family: "couple",
          farming: "side",
          capital: "mid",
        }),
      ).toBe("elderRural");
    });

    it("나머지 → balanced (기본 균등)", () => {
      expect(
        mapToPersona({
          ageGroup: "40s",
          family: "couple",
          farming: "side",
          capital: "mid",
        }),
      ).toBe("balanced");
    });

    it("답변 전체 누락 → balanced fallback", () => {
      expect(mapToPersona({})).toBe("balanced");
    });

    it("일부 답변만 있어도 안전하게 매핑됨", () => {
      // farming만 있어도 우선 매핑
      expect(mapToPersona({ farming: "main" })).toBe("farmYouth");
      // family만 있을 때 (farming 미응답)
      expect(mapToPersona({ family: "children" })).toBe("family");
      // ageGroup만 있을 때 (farming/family 미응답)
      expect(mapToPersona({ ageGroup: "60plus" })).toBe("elderRural");
    });
  });

  describe("buildRecommendations Phase 6 A안 deep link 호환", () => {
    it("페르소나 5종 모두 3개 deep link URL 생성됨", () => {
      const personas = ["family", "farmYouth", "elderRural", "commuter", "balanced"] as const;
      for (const p of personas) {
        const r = buildRecommendations(p);
        expect(r.rankingUrl).toBe(`/regions/ranking?persona=${p}`);
        expect(r.cropsUrl).toBe(`/crops?persona=${p}`);
        expect(r.programsUrl).toBe(`/programs?persona=${p}`);
      }
    });
  });

  describe("getResultMessage 메시지 무결성", () => {
    it("페르소나 5종 모두 결과 메시지 정의됨", () => {
      const personas = ["family", "farmYouth", "elderRural", "commuter", "balanced"] as const;
      for (const p of personas) {
        const msg = getResultMessage(p);
        expect(msg.eyebrow).toBeTruthy();
        expect(msg.title).toBeTruthy();
        expect(msg.description).toBeTruthy();
        // 카피 톤 검증 — "~합니다" 금지
        expect(msg.title).not.toMatch(/합니다|입니다/);
        expect(msg.description).not.toMatch(/합니다|입니다/);
      }
    });

    it("getResultMessage 결과는 PERSONAS 시스템과 동기화", () => {
      // 5종 페르소나 모두 PERSONA_INDEX에 존재
      const personas = ["family", "farmYouth", "elderRural", "commuter", "balanced"] as const;
      for (const p of personas) {
        expect(PERSONA_INDEX.get(p)).toBeDefined();
      }
    });
  });

  describe("QUICK_QUESTIONS 데이터 무결성", () => {
    it("4문항 정확히 존재", () => {
      expect(QUICK_QUESTIONS).toHaveLength(4);
    });

    it("질문 ID 중복 없음", () => {
      const ids = QUICK_QUESTIONS.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("질문 ID는 ageGroup/family/farming/capital 4종으로 한정", () => {
      const ids = QUICK_QUESTIONS.map((q) => q.id).sort();
      expect(ids).toEqual(["ageGroup", "capital", "family", "farming"]);
    });

    it("각 질문의 option id 중복 없음 + label 비어있지 않음", () => {
      for (const q of QUICK_QUESTIONS) {
        const optionIds = q.options.map((o) => o.id);
        expect(new Set(optionIds).size).toBe(optionIds.length);
        for (const o of q.options) {
          expect(o.label).toBeTruthy();
        }
      }
    });

    it("질문 카피 톤 — ~합니다/입니다 금지", () => {
      for (const q of QUICK_QUESTIONS) {
        expect(q.title).not.toMatch(/합니다|입니다/);
        expect(q.subtitle).not.toMatch(/합니다|입니다/);
        for (const o of q.options) {
          if (o.description) {
            expect(o.description).not.toMatch(/합니다|입니다/);
          }
        }
      }
    });
  });
});
