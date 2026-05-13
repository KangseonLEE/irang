/**
 * persona-weights-custom 통합 시나리오 회귀 테스트 (Phase 6 B1 D3)
 *
 * 배경:
 *   D1은 단위 함수 회귀(parse·normalize·resolvePersonaFromParams·computePersonaScore 통합)
 *   D2는 슬라이더 UI (useState + useRef + router.replace debounce)
 *   D3는 두 층이 함께 깨지지 않도록 묶는다.
 *
 * D3 목표: 사용자 시나리오 5종을 SSR ↔ 라이브러리 ↔ URL round-trip으로 검증.
 *   1) URL `?w=` 파싱 → buildCustomPersona → computePersonaScore round-trip
 *   2) LS 복원 시나리오 (mocked localStorage)
 *   3) isCustom 가드 (balanced 기본 가중치 포함)
 *   4) 자동 조정 합계 100 보장 (모든 rebalance 결과)
 *   5) default 가중치 복원 (URL `?w=` 제거 = persona 기본으로 복귀)
 *
 * 다음 sprint에서 가중치 라이브러리 또는 페르소나 기본값이 바뀌면 본 테스트가
 * 즉시 fail 해서 D2 슬라이더 UI ↔ D1 라이브러리 lock-step을 보장한다.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  parseWeightsParam,
  normalizeWeights,
  serializeWeights,
  resolvePersonaFromParams,
  isSameWeights,
  WEIGHT_KEYS_ORDERED,
  WEIGHT_PARAM_KEY,
} from "@/lib/persona-weights-custom";
import {
  computePersonaScore,
  getPersona,
  PERSONAS,
  type PersonaWeights,
  type DimensionScoresInput,
} from "@/lib/data/personas";

const STORAGE_KEY_PREFIX = "irang:ranking:weights:";

describe("시나리오 1: URL `?w=` deep link → 페르소나 객체 → 점수 round-trip", () => {
  // 사용자가 라이브에서 카드 공유 → 친구가 같은 URL 열기 → 같은 점수
  it("?persona=family&w=10-10-10-60-10 → SSR → 점수 deterministic", () => {
    const resolved = resolvePersonaFromParams("family", "10-10-10-60-10");
    expect(resolved).not.toBeNull();
    expect(resolved!.persona.id).toBe("family");
    expect(resolved!.isCustom).toBe(true);

    const scores: DimensionScoresInput = {
      populationTrend: 60,
      farmActivity: 70,
      medical: 55,
      school: 90, // school 가중치 60% 이므로 영향 큼
      returnFarm: 40,
    };
    const score1 = computePersonaScore(scores, resolved!.persona);

    // 같은 URL로 다시 들어와도 결과 동일
    const resolvedAgain = resolvePersonaFromParams("family", "10-10-10-60-10");
    const score2 = computePersonaScore(scores, resolvedAgain!.persona);
    expect(score1).toBe(score2);
    expect(score1).toBeGreaterThan(0);
    expect(score1).toBeLessThanOrEqual(100);
  });

  it("URL ↔ 직렬화 round-trip — 슬라이더 조정 후 다시 파싱해도 동일", () => {
    // 사용자가 슬라이더로 변경
    const userWeights: PersonaWeights = {
      populationTrend: 30,
      farmActivity: 25,
      medical: 15,
      school: 20,
      returnFarm: 10,
    };
    const normalized = normalizeWeights(userWeights);
    const serialized = serializeWeights(normalized);
    expect(serialized).toBe("30-25-15-20-10");

    // 그 URL을 새 탭에서 열기
    const resolved = resolvePersonaFromParams("balanced", serialized);
    expect(resolved).not.toBeNull();
    expect(resolved!.persona.weights).toEqual(normalized);
  });

  it("잘못 조작된 URL ?w=999-999-999-999-999 → null parse → 기본 가중치 폴백", () => {
    // 봇이나 잘못된 공유로 깨진 URL — 안전하게 폴백
    const resolved = resolvePersonaFromParams("family", "999-999-999-999-999");
    expect(resolved).not.toBeNull();
    expect(resolved!.persona.id).toBe("family");
    // parseWeightsParam이 null 반환 → resolvePersonaFromParams가 family 기본 가중치로 폴백
    expect(resolved!.isCustom).toBe(false);
    expect(resolved!.persona.weights).toEqual(getPersona("family")!.weights);
  });
});

describe("시나리오 2: localStorage 복원 (D2 슬라이더 wiring 패턴 재현)", () => {
  beforeEach(() => {
    // jsdom localStorage 초기화
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  it("LS에 저장된 가중치 → parseWeightsParam → 동일 객체 복원", () => {
    const stored: PersonaWeights = {
      populationTrend: 10,
      farmActivity: 10,
      medical: 10,
      school: 60,
      returnFarm: 10,
    };
    const serialized = serializeWeights(stored);
    window.localStorage.setItem(STORAGE_KEY_PREFIX + "family", serialized);

    // D2 슬라이더 useEffect와 동일한 복원 경로
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + "family");
    expect(raw).toBe(serialized);

    const parsed = parseWeightsParam(raw);
    expect(parsed).not.toBeNull();
    const normalized = normalizeWeights(parsed!);
    expect(normalized).toEqual(stored);
  });

  it("LS 값이 base 기본 가중치와 같으면 복원 의미 없음 (isCustom=false 분기)", () => {
    const familyDefault = getPersona("family")!.weights;
    const serialized = serializeWeights(familyDefault);
    window.localStorage.setItem(STORAGE_KEY_PREFIX + "family", serialized);

    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + "family");
    const parsed = parseWeightsParam(raw);
    const normalized = normalizeWeights(parsed!);
    // 기본값과 같음을 감지 → D2 코드 isSameWeights 분기
    expect(isSameWeights(normalized, familyDefault)).toBe(true);
  });

  it("LS에 잘못된 값 → parse null → 폴백 (앱 크래시 없음)", () => {
    window.localStorage.setItem(STORAGE_KEY_PREFIX + "family", "broken-data");
    const raw = window.localStorage.getItem(STORAGE_KEY_PREFIX + "family");
    const parsed = parseWeightsParam(raw);
    expect(parsed).toBeNull();
    // D2 패턴: parsed null이면 early return — 앱은 base persona로 동작 계속
  });

  it("LS 키 이름 일관성 — STORAGE_KEY_PREFIX + persona.id 5종 모두 동작", () => {
    for (const p of PERSONAS) {
      const sample: PersonaWeights = {
        populationTrend: 20,
        farmActivity: 20,
        medical: 20,
        school: 20,
        returnFarm: 20,
      };
      const key = STORAGE_KEY_PREFIX + p.id;
      window.localStorage.setItem(key, serializeWeights(sample));
      const read = window.localStorage.getItem(key);
      expect(read).toBe("20-20-20-20-20");
    }
  });
});

describe("시나리오 3: isCustom 가드 (balanced 포함 모든 페르소나)", () => {
  it.each(PERSONAS.map((p) => [p.id, p.label, p.weights] as const))(
    "%s (%s) 기본 가중치 → isCustom=false",
    (id, _label, baseWeights) => {
      const serialized = serializeWeights(baseWeights);
      const resolved = resolvePersonaFromParams(id, serialized);
      expect(resolved).not.toBeNull();
      expect(resolved!.persona.id).toBe(id);
      // 동일 가중치를 URL로 전달해도 isCustom=false (D2 reset 비활성화 분기)
      expect(resolved!.isCustom).toBe(false);
    },
  );

  it.each(PERSONAS.map((p) => [p.id, p.label, p.weights] as const))(
    "%s (%s) 학교 가중치 +5 → isCustom=true",
    (id, _label, baseWeights) => {
      const modified: PersonaWeights = {
        ...baseWeights,
        school: Math.min(100, baseWeights.school + 5),
        returnFarm: Math.max(0, baseWeights.returnFarm - 5),
      };
      const normalized = normalizeWeights(modified);
      const serialized = serializeWeights(normalized);
      const resolved = resolvePersonaFromParams(id, serialized);
      expect(resolved).not.toBeNull();
      expect(resolved!.isCustom).toBe(true);
    },
  );

  it("balanced 기본 (20-20-20-20-20) 직접 입력도 isCustom=false", () => {
    // 5/13 D2 회장 가드: balanced 가중치 직접 손대지 않은 케이스 식별
    const resolved = resolvePersonaFromParams("balanced", "20-20-20-20-20");
    expect(resolved!.isCustom).toBe(false);
  });
});

describe("시나리오 4: 자동 조정 합계 100 보장 (D2 rebalance 출력 sanity)", () => {
  // D2 슬라이더 rebalance는 컴포넌트 내부이지만, 그 결과를 다시 serialize→parse 했을 때
  // 라이브러리가 받는 입력은 항상 합 100 정수여야 한다.
  it("normalizeWeights 결과는 모든 입력에 대해 합 100 + 정수", () => {
    const cases: PersonaWeights[] = [
      { populationTrend: 1, farmActivity: 1, medical: 1, school: 1, returnFarm: 1 },
      { populationTrend: 33, farmActivity: 33, medical: 33, school: 0, returnFarm: 0 },
      { populationTrend: 7, farmActivity: 13, medical: 19, school: 23, returnFarm: 29 },
      { populationTrend: 100, farmActivity: 0, medical: 0, school: 0, returnFarm: 0 },
      { populationTrend: 99, farmActivity: 1, medical: 0, school: 0, returnFarm: 0 },
      { populationTrend: 50, farmActivity: 50, medical: 50, school: 50, returnFarm: 50 },
    ];
    for (const raw of cases) {
      const result = normalizeWeights(raw);
      const sum = WEIGHT_KEYS_ORDERED.reduce((acc, k) => acc + result[k], 0);
      expect(sum).toBe(100);
      WEIGHT_KEYS_ORDERED.forEach((k) => {
        expect(Number.isInteger(result[k])).toBe(true);
        expect(result[k]).toBeGreaterThanOrEqual(0);
        expect(result[k]).toBeLessThanOrEqual(100);
      });
    }
  });

  it("normalize → serialize → parse → normalize 결과는 동일 (idempotent)", () => {
    const messy: PersonaWeights = {
      populationTrend: 7,
      farmActivity: 13,
      medical: 19,
      school: 23,
      returnFarm: 29,
    };
    const once = normalizeWeights(messy);
    const twice = normalizeWeights(parseWeightsParam(serializeWeights(once))!);
    expect(twice).toEqual(once);
  });
});

describe("시나리오 5: 기본값 복원 (URL `?w=` 제거 → 페르소나 기본 가중치)", () => {
  it("`?w=` 제거 시 페르소나 기본 가중치로 복귀", () => {
    // 사용자가 reset 버튼을 누르면 D2가 URL에서 ?w= 제거
    // 그 결과 SSR이 받는 sp는 persona만 있는 상태
    const withCustom = resolvePersonaFromParams("family", "10-10-10-60-10");
    expect(withCustom!.isCustom).toBe(true);

    // 다음 navigation으로 ?w= 제거된 상태
    const afterReset = resolvePersonaFromParams("family", null);
    expect(afterReset!.isCustom).toBe(false);
    expect(afterReset!.persona.weights).toEqual(getPersona("family")!.weights);
  });

  it("URL `?w=` 없는 5종 페르소나 모두 isCustom=false + 기본 가중치", () => {
    for (const p of PERSONAS) {
      const resolved = resolvePersonaFromParams(p.id, null);
      expect(resolved).not.toBeNull();
      expect(resolved!.isCustom).toBe(false);
      expect(resolved!.persona.weights).toEqual(p.weights);
    }
  });

  it("페르소나 + 페르소나 기본과 동일한 ?w= → reset 후와 같은 결과", () => {
    // family 기본은 인구20·농가20·의료20·학교30·귀농10 정도 (실제 값은 personas.ts)
    const familyBase = getPersona("family")!.weights;
    const explicit = resolvePersonaFromParams(
      "family",
      serializeWeights(familyBase),
    );
    const cleared = resolvePersonaFromParams("family", null);

    expect(explicit!.isCustom).toBe(false);
    expect(cleared!.isCustom).toBe(false);
    expect(explicit!.persona.weights).toEqual(cleared!.persona.weights);
  });
});

describe("시나리오 보조: WEIGHT_PARAM_KEY 상수 export — D1/D2 lock-step", () => {
  // D2 슬라이더가 직접 'w' 문자열을 박지 않도록 export된 상수를 쓰는지 회귀로 묶음
  it("WEIGHT_PARAM_KEY === 'w' (URL 안정성)", () => {
    expect(WEIGHT_PARAM_KEY).toBe("w");
  });
});
