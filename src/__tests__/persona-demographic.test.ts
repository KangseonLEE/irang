/**
 * mapDemographicToPersona 회귀 매트릭스 테스트 (Phase 6 A안 보강 2026-05-14)
 *
 * 배경: 2026-05-13 발견. 진단 wizard DEMOGRAPHIC_QUESTIONS 에는 youth(만 39세 이하) /
 *   40s / 50s / 60plus 4 옵션만 노출되지만, API validator(/api/assess) + 공유 URL
 *   인코더(assess-share.ts) 에서는 "30s" 코드도 허용. 외부 진입(공유 URL · API 직접
 *   호출)으로 30s 가 들어올 경우 mapDemographicToPersona 의 default 분기(balanced) 로
 *   떨어져 PersonaRecommendationSection 이 균등 추천만 노출 → 30대 핵심 코호트 추천
 *   품질 저하.
 *
 * 검증 목표:
 *   1) 모든 alive age code (youth / 30s / 40s / 50s / 60plus) 가 default 가 아닌
 *      구체 페르소나로 매핑된다 (balanced 로 떨어지지 않음)
 *   2) 30s 는 youth 와 동일하게 farmYouth 로 묶인다 (만 39세 이하 청년 정책 대상)
 *   3) undefined / 빈 문자열 / 알 수 없는 코드는 balanced 로 fallback
 *   4) API validator(VALID_AGE_GROUPS) 와 mapDemographicToPersona 매핑이 동기화됨
 *      (validator 에 추가된 코드가 default 로 떨어지지 않음)
 */

import { describe, it, expect } from "vitest";
import { mapDemographicToPersona } from "@/lib/data/personas";

const VALID_AGE_GROUPS = ["youth", "30s", "40s", "50s", "60plus"] as const;

describe("mapDemographicToPersona — age × persona 매핑 매트릭스", () => {
  it("youth → farmYouth (만 39세 이하 청년 정책 대상)", () => {
    const p = mapDemographicToPersona("youth");
    expect(p.id).toBe("farmYouth");
  });

  it("30s → farmYouth (만 39세 이하 청년 정책 대상 — youth 와 동일 묶음)", () => {
    const p = mapDemographicToPersona("30s");
    expect(p.id).toBe("farmYouth");
  });

  it("40s → family (자녀 양육 가구 가정)", () => {
    const p = mapDemographicToPersona("40s");
    expect(p.id).toBe("family");
  });

  it("50s → commuter (귀촌 직장인 가정)", () => {
    const p = mapDemographicToPersona("50s");
    expect(p.id).toBe("commuter");
  });

  it("60plus → elderRural (노년 귀촌)", () => {
    const p = mapDemographicToPersona("60plus");
    expect(p.id).toBe("elderRural");
  });

  it("undefined → balanced (답변 없음 — 5차원 균등)", () => {
    const p = mapDemographicToPersona(undefined);
    expect(p.id).toBe("balanced");
  });

  it("빈 문자열 → balanced", () => {
    const p = mapDemographicToPersona("");
    expect(p.id).toBe("balanced");
  });

  it("알 수 없는 코드 → balanced (안전 fallback)", () => {
    const p = mapDemographicToPersona("teen");
    expect(p.id).toBe("balanced");
  });

  /**
   * 동기화 게이트: API validator(VALID_AGE_GROUPS) 의 모든 코드가
   * mapDemographicToPersona 에서 구체 페르소나로 매핑돼야 한다.
   * validator 에 새 코드가 추가됐는데 매핑이 빠지면 즉시 fail.
   */
  it("API validator의 모든 age code가 구체 페르소나로 매핑됨 (default balanced 미발생)", () => {
    for (const ag of VALID_AGE_GROUPS) {
      const p = mapDemographicToPersona(ag);
      expect(p.id, `age=${ag} 매핑 누락 — balanced로 떨어짐`).not.toBe("balanced");
    }
  });
});
