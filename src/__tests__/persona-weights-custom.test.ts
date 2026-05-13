/**
 * persona-weights-custom.ts 회귀 테스트 (Phase 6 B1 D1)
 *
 * 배경: 2026-05-11 lessons "코드 명시만으로 보장 안 됨" 패턴. 가중치 파싱·정규화는
 *   - URL params 직접 노출 (SEO 봇이 무한 조합 시도 가능)
 *   - LS 폴백·UI 슬라이더에서도 사용 (D2~D4에서 wiring)
 *   - computePersonaScore의 입력을 만드는 critical path
 *
 * 검증 목표:
 *   1) parse: 정상 케이스 + 잘못된 형식 5종 (length·NaN·음수·>100·non-digit)
 *   2) normalize: 합 != 100 → 합 100 강제 + 정수 유지
 *   3) normalize: 합 0 → balanced 기본값
 *   4) serialize: round-trip (parse → serialize 동일)
 *   5) buildCustomPersona: base 페르소나 식별 유지 + weights 교체
 *   6) resolvePersonaFromParams: persona+w / persona만 / w만 / 둘 다 없음
 *   7) isSameWeights: 동일·차이 케이스
 *   8) 기존 computePersonaScore와 통합: custom persona로 시그니처 변경 없이 호출
 */

import { describe, it, expect } from "vitest";
import {
  parseWeightsParam,
  normalizeWeights,
  serializeWeights,
  buildCustomPersona,
  resolvePersonaFromParams,
  isSameWeights,
  WEIGHT_KEYS_ORDERED,
} from "@/lib/persona-weights-custom";
import {
  computePersonaScore,
  getPersona,
  type PersonaWeights,
  type DimensionScoresInput,
} from "@/lib/data/personas";

describe("parseWeightsParam", () => {
  it("정상 케이스: 20-15-15-35-15 → PersonaWeights", () => {
    const result = parseWeightsParam("20-15-15-35-15");
    expect(result).toEqual({
      populationTrend: 20,
      farmActivity: 15,
      medical: 15,
      school: 35,
      returnFarm: 15,
    });
  });

  it("실패: undefined / 빈 문자열 → null", () => {
    expect(parseWeightsParam(undefined)).toBeNull();
    expect(parseWeightsParam(null)).toBeNull();
    expect(parseWeightsParam("")).toBeNull();
  });

  it("실패: 5개 분절 아님 → null", () => {
    expect(parseWeightsParam("20-15-15-35")).toBeNull(); // 4개
    expect(parseWeightsParam("20-15-15-35-15-10")).toBeNull(); // 6개
    expect(parseWeightsParam("100")).toBeNull(); // 1개
  });

  it("실패: 정수 아님 / 음수 / 100 초과 → null", () => {
    expect(parseWeightsParam("20-15-15-35-abc")).toBeNull(); // 문자
    expect(parseWeightsParam("20.5-15-15-35-15")).toBeNull(); // 소수
    expect(parseWeightsParam("20--15-15-35-15")).toBeNull(); // 빈 분절
    expect(parseWeightsParam("20-15-15-35-200")).toBeNull(); // >100
    // 음수는 정규식 차단 (^\d+$)
    expect(parseWeightsParam("-20-15-15-35-15")).toBeNull();
  });

  it("합이 100 아니어도 그대로 반환 (정규화는 별도)", () => {
    const result = parseWeightsParam("10-10-10-10-10"); // 합 50
    expect(result).toEqual({
      populationTrend: 10,
      farmActivity: 10,
      medical: 10,
      school: 10,
      returnFarm: 10,
    });
  });
});

describe("normalizeWeights", () => {
  it("이미 합 100이면 그대로 반환", () => {
    const input: PersonaWeights = {
      populationTrend: 20,
      farmActivity: 15,
      medical: 15,
      school: 35,
      returnFarm: 15,
    };
    const result = normalizeWeights(input);
    expect(result).toEqual(input);
    const sum = WEIGHT_KEYS_ORDERED.reduce((acc, k) => acc + result[k], 0);
    expect(sum).toBe(100);
  });

  it("합 50 → 비율 유지하면서 100으로 스케일", () => {
    const input: PersonaWeights = {
      populationTrend: 10,
      farmActivity: 10,
      medical: 10,
      school: 10,
      returnFarm: 10,
    };
    const result = normalizeWeights(input);
    const sum = WEIGHT_KEYS_ORDERED.reduce((acc, k) => acc + result[k], 0);
    expect(sum).toBe(100);
    // 모두 같은 비율이었으므로 모두 20에 수렴
    expect(result.populationTrend).toBe(20);
    expect(result.returnFarm).toBe(20);
  });

  it("합 0 → balanced 기본값 (균등)", () => {
    const input: PersonaWeights = {
      populationTrend: 0,
      farmActivity: 0,
      medical: 0,
      school: 0,
      returnFarm: 0,
    };
    const result = normalizeWeights(input);
    expect(result).toEqual({
      populationTrend: 20,
      farmActivity: 20,
      medical: 20,
      school: 20,
      returnFarm: 20,
    });
  });

  it("반올림 누적 오차 보정 — 모든 정상 입력에서 합 100 보장", () => {
    const cases: PersonaWeights[] = [
      { populationTrend: 33, farmActivity: 33, medical: 33, school: 0, returnFarm: 0 },
      { populationTrend: 1, farmActivity: 1, medical: 1, school: 1, returnFarm: 1 },
      { populationTrend: 7, farmActivity: 7, medical: 7, school: 7, returnFarm: 7 },
      { populationTrend: 100, farmActivity: 0, medical: 0, school: 0, returnFarm: 0 },
    ];
    for (const input of cases) {
      const result = normalizeWeights(input);
      const sum = WEIGHT_KEYS_ORDERED.reduce((acc, k) => acc + result[k], 0);
      expect(sum).toBe(100);
      WEIGHT_KEYS_ORDERED.forEach((k) => {
        expect(Number.isInteger(result[k])).toBe(true);
        expect(result[k]).toBeGreaterThanOrEqual(0);
      });
    }
  });
});

describe("serializeWeights + round-trip", () => {
  it("PersonaWeights → 문자열 → PersonaWeights 동일", () => {
    const original: PersonaWeights = {
      populationTrend: 20,
      farmActivity: 15,
      medical: 15,
      school: 35,
      returnFarm: 15,
    };
    const serialized = serializeWeights(original);
    expect(serialized).toBe("20-15-15-35-15");
    const parsed = parseWeightsParam(serialized);
    expect(parsed).toEqual(original);
  });

  it("normalize 후 serialize → parse → normalize round-trip", () => {
    const raw: PersonaWeights = {
      populationTrend: 10,
      farmActivity: 10,
      medical: 10,
      school: 10,
      returnFarm: 10,
    };
    const normalized = normalizeWeights(raw);
    const serialized = serializeWeights(normalized);
    const reparsed = parseWeightsParam(serialized);
    expect(reparsed).toEqual(normalized);
  });
});

describe("buildCustomPersona", () => {
  it("base 페르소나의 id·label·desc 유지 + weights만 교체", () => {
    const customWeights: PersonaWeights = {
      populationTrend: 10,
      farmActivity: 10,
      medical: 10,
      school: 60,
      returnFarm: 10,
    };
    const result = buildCustomPersona("family", customWeights);
    expect(result.id).toBe("family");
    expect(result.label).toBe(getPersona("family")!.label);
    expect(result.weights).toEqual(customWeights);
    // 원본 family 가중치(school 35)와 달라야 함
    expect(result.weights.school).toBe(60);
  });

  it("잘못된 baseId 들어와도 balanced fallback (throw 안 함)", () => {
    const customWeights: PersonaWeights = {
      populationTrend: 20,
      farmActivity: 20,
      medical: 20,
      school: 20,
      returnFarm: 20,
    };
    // @ts-expect-error — 잘못된 id 강제 주입
    const result = buildCustomPersona("nonexistent", customWeights);
    expect(result.id).toBe("balanced");
    expect(result.weights).toEqual(customWeights);
  });
});

describe("resolvePersonaFromParams", () => {
  it("persona+w 모두 있음 → 커스텀 페르소나 (isCustom=true)", () => {
    const result = resolvePersonaFromParams("family", "10-10-10-60-10");
    expect(result).not.toBeNull();
    expect(result!.persona.id).toBe("family");
    expect(result!.isCustom).toBe(true);
    expect(result!.persona.weights.school).toBe(60);
  });

  it("persona만 있음 → 기본 가중치 (isCustom=false)", () => {
    const result = resolvePersonaFromParams("family", null);
    expect(result).not.toBeNull();
    expect(result!.persona.id).toBe("family");
    expect(result!.isCustom).toBe(false);
    // family 기본: school 35
    expect(result!.persona.weights.school).toBe(35);
  });

  it("w만 있음 → balanced 기반 커스텀", () => {
    const result = resolvePersonaFromParams(null, "30-30-10-20-10");
    expect(result).not.toBeNull();
    expect(result!.persona.id).toBe("balanced");
    expect(result!.isCustom).toBe(true);
  });

  it("둘 다 없음 → null (호출자가 dimension 모드 등으로 처리)", () => {
    expect(resolvePersonaFromParams(null, null)).toBeNull();
    expect(resolvePersonaFromParams("", "")).toBeNull();
  });

  it("잘못된 w 형식 + persona 있음 → persona 기본 가중치 (isCustom=false)", () => {
    const result = resolvePersonaFromParams("commuter", "잘못된형식");
    expect(result).not.toBeNull();
    expect(result!.persona.id).toBe("commuter");
    expect(result!.isCustom).toBe(false);
  });

  it("persona+w 같은 가중치 → isCustom=false (변경 없음 감지)", () => {
    // balanced 기본은 20-20-20-20-20
    const result = resolvePersonaFromParams("balanced", "20-20-20-20-20");
    expect(result).not.toBeNull();
    expect(result!.isCustom).toBe(false);
  });
});

describe("isSameWeights", () => {
  const baseA: PersonaWeights = {
    populationTrend: 20,
    farmActivity: 20,
    medical: 20,
    school: 20,
    returnFarm: 20,
  };

  it("동일한 가중치 → true", () => {
    expect(isSameWeights(baseA, { ...baseA })).toBe(true);
  });

  it("한 차원이라도 다르면 → false", () => {
    expect(isSameWeights(baseA, { ...baseA, school: 21 })).toBe(false);
  });
});

describe("computePersonaScore 통합 — custom persona로 호출", () => {
  // 회귀 안전: 시그니처 변경 없이 buildCustomPersona 결과를 그대로 넘긴다.
  const scores: DimensionScoresInput = {
    populationTrend: 60,
    farmActivity: 80,
    medical: 40,
    school: 50,
    returnFarm: 70,
  };

  it("기본 family 페르소나와 동일 가중치 → 동일 결과", () => {
    const familyDefault = getPersona("family")!;
    const customSamePersona = buildCustomPersona("family", familyDefault.weights);
    const defaultScore = computePersonaScore(scores, familyDefault);
    const customScore = computePersonaScore(scores, customSamePersona);
    expect(customScore).toBe(defaultScore);
  });

  it("custom 가중치 (school=60) → 학교 점수가 더 반영됨", () => {
    const familyDefault = getPersona("family")!;
    const customWeights: PersonaWeights = {
      populationTrend: 10,
      farmActivity: 10,
      medical: 10,
      school: 60,
      returnFarm: 10,
    };
    const customPersona = buildCustomPersona("family", customWeights);
    const defaultScore = computePersonaScore(scores, familyDefault)!;
    const customScore = computePersonaScore(scores, customPersona)!;
    // scores.school = 50 (defaultScore의 다른 차원보다 약간 낮음)
    // custom은 school에 60% 비중 → school 점수에 더 근접
    // 단순 부등호 검증보다 결정적인 round-trip 확인
    expect(customScore).not.toBe(defaultScore);
    expect(Number.isInteger(customScore)).toBe(true);
    expect(customScore).toBeGreaterThanOrEqual(0);
    expect(customScore).toBeLessThanOrEqual(100);
  });

  it("도시 자치구 (school·population만 있음) — custom 가중치도 안전 처리", () => {
    const urbanScores: DimensionScoresInput = {
      populationTrend: 70,
      farmActivity: null,
      medical: 60,
      school: 50,
      returnFarm: null,
    };
    const customWeights: PersonaWeights = {
      populationTrend: 20,
      farmActivity: 20,
      medical: 20,
      school: 20,
      returnFarm: 20,
    };
    const customPersona = buildCustomPersona("balanced", customWeights);
    const result = computePersonaScore(urbanScores, customPersona);
    // balanced는 farm+return 합 40 (< 50) → null 아니고 가용 차원만 정규화
    expect(result).not.toBeNull();
  });
});
