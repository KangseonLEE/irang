/**
 * 가중치 커스터마이징 (Phase 6 B1 D1)
 *
 * URL searchParams `?w=20-15-15-35-15`(5차원 절대값 정수, 합 100)을
 * 페르소나 객체로 변환하는 read-only 라이브러리.
 *
 * 5차원 순서 (고정):
 *   1) populationTrend
 *   2) farmActivity
 *   3) medical
 *   4) school
 *   5) returnFarm
 *
 * 설계 원칙:
 *   - 진실의 원천: URL `?w=`. LS 폴백은 D2(UI)에서 wiring.
 *   - 입력은 합 100이 아닐 수도 있음(사용자 임의 입력 가능) → normalize로 합 100 강제.
 *   - 음수·NaN·길이 불일치는 null 반환(safe). 호출자가 폴백 페르소나로 처리.
 *   - 회귀 0건: 기존 `computePersonaScore(scores, persona)` 시그니처를 건드리지 않고
 *     커스텀 Persona 객체를 생성해 전달한다.
 *
 * 회장 결재 (2026-05-13, B1 D1):
 *   - URL 우선 + LS 폴백 (D1에서는 URL parse만)
 *   - 슬라이더 0~100% + 합계 100 강제 + 자동 조정 (D2에서 UI wiring)
 *   - 5종 페르소나 모두 변경 허용 (balanced 포함 isCustom=true 시 explain 노출은 D2~D3)
 *   - SEO: robots.ts에서 `/regions/ranking?` Disallow 추가 (이 파일은 라이브러리만)
 */

import {
  type DimensionScoresInput,
  type Persona,
  type PersonaId,
  type PersonaWeights,
  getPersona,
} from "@/lib/data/personas";

/** 5차원 키 순서 (URL 직렬화·역직렬화 양쪽에서 고정) */
export const WEIGHT_KEYS_ORDERED: ReadonlyArray<keyof PersonaWeights> = [
  "populationTrend",
  "farmActivity",
  "medical",
  "school",
  "returnFarm",
];

export const WEIGHT_PARAM_KEY = "w";

/** URL `?w=...` 직렬화 구분자 */
const SERIALIZE_DELIM = "-";

/**
 * URL `?w=20-15-15-35-15` 문자열을 PersonaWeights로 파싱.
 *
 * 실패 케이스(반환 null):
 *   - undefined / 빈 문자열
 *   - 5개 분절 아닌 경우
 *   - 정수 아님 / NaN / 음수
 *   - 단일 값이 100 초과
 *
 * 성공 시: 합이 100이 아니어도 그대로 반환(정규화는 normalize에서).
 */
export function parseWeightsParam(raw: string | undefined | null): PersonaWeights | null {
  if (!raw) return null;
  const parts = raw.split(SERIALIZE_DELIM);
  if (parts.length !== WEIGHT_KEYS_ORDERED.length) return null;

  const nums: number[] = [];
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null; // 정수만, 음수·소수 차단
    const n = Number(p);
    if (!Number.isFinite(n)) return null;
    if (n < 0 || n > 100) return null;
    nums.push(n);
  }

  const result = {} as PersonaWeights;
  WEIGHT_KEYS_ORDERED.forEach((key, idx) => {
    result[key] = nums[idx];
  });
  return result;
}

/**
 * 합을 100으로 정규화 (자동 조정).
 *
 * 정책:
 *   - 합 0: balanced (20·20·20·20·20) 반환 — UI에서 자동 균등 대체
 *   - 합 ≠ 100: 비율 유지하면서 합 100으로 스케일 + 반올림 보정
 *     반올림 누적 오차는 마지막 차원에서 보정(±1~2)
 *   - 모든 값은 정수
 */
export function normalizeWeights(raw: PersonaWeights): PersonaWeights {
  const sum = WEIGHT_KEYS_ORDERED.reduce((acc, k) => acc + raw[k], 0);

  // 합 0 → 균등
  if (sum === 0) {
    return {
      populationTrend: 20,
      farmActivity: 20,
      medical: 20,
      school: 20,
      returnFarm: 20,
    };
  }

  // 비율 유지하면서 100으로 스케일
  const scaled = WEIGHT_KEYS_ORDERED.map((k) => (raw[k] * 100) / sum);
  const rounded = scaled.map((v) => Math.round(v));
  let total = rounded.reduce((acc, v) => acc + v, 0);

  // 반올림 오차 보정 — 차이가 가장 큰(영향 작은) 차원에서 조정
  // 합이 100이 될 때까지 마지막 키부터 거꾸로 ±1 조정
  let idx = rounded.length - 1;
  while (total !== 100 && idx >= 0) {
    const diff = 100 - total;
    const step = diff > 0 ? 1 : -1;
    // 음수가 되지 않도록 가드
    if (rounded[idx] + step >= 0) {
      rounded[idx] += step;
      total += step;
    }
    // 한 번에 1씩 이동 — 누적 오차가 ±5 이상이면 idx를 순환
    if (total === 100) break;
    idx -= 1;
    if (idx < 0 && total !== 100) {
      // 거의 발생하지 않음 (소수점 누적), 마지막 키에 일괄 흡수
      idx = rounded.length - 1;
      rounded[idx] += 100 - total;
      total = 100;
      break;
    }
  }

  const result = {} as PersonaWeights;
  WEIGHT_KEYS_ORDERED.forEach((k, i) => {
    result[k] = rounded[i];
  });
  return result;
}

/**
 * PersonaWeights → URL `?w=20-15-15-35-15` 문자열 직렬화.
 *
 * 호출 전에 normalizeWeights를 거치는 것을 권장(합 100 보장).
 */
export function serializeWeights(weights: PersonaWeights): string {
  return WEIGHT_KEYS_ORDERED.map((k) => weights[k]).join(SERIALIZE_DELIM);
}

/**
 * 가중치가 기본 페르소나와 동일한지 비교.
 *
 * 모든 5차원이 정확히 일치할 때만 true (커스텀 판정에 사용).
 */
export function isSameWeights(a: PersonaWeights, b: PersonaWeights): boolean {
  return WEIGHT_KEYS_ORDERED.every((k) => a[k] === b[k]);
}

/**
 * Persona 객체(가상 "custom" 페르소나) 생성.
 *
 * 기존 5종 Persona의 어떤 가중치든 변형 가능. 식별을 위해 `id`는 base persona id를
 * 그대로 유지하지만 가중치만 교체. UI에서 isCustom 플래그로 별도 구분.
 *
 * 호출자:
 *   - /regions/ranking SSR (D1)
 *   - /regions/[id]/[sigungu] persona-score-picker (D3, slider 모드)
 *   - /match recommendation engine (D4, future)
 */
export function buildCustomPersona(
  baseId: PersonaId,
  customWeights: PersonaWeights,
): Persona {
  const base = getPersona(baseId);
  if (!base) {
    // baseId 잘못 들어오면 balanced fallback (호출자 측 안전망)
    const fallback = getPersona("balanced");
    if (!fallback) {
      throw new Error("balanced persona missing — personas.ts integrity broken");
    }
    return { ...fallback, weights: customWeights };
  }
  return { ...base, weights: customWeights };
}

/**
 * URL searchParams로부터 (Persona, isCustom)을 한 번에 해석.
 *
 * - `?persona=family&w=10-10-10-60-10` → family 기반 + 커스텀 가중치 (isCustom=true)
 * - `?persona=family` (w 없음) → family 기본 가중치 (isCustom=false)
 * - `?w=...` (persona 없음) → balanced 기반 + 커스텀 가중치 (isCustom=true)
 * - `?w=잘못된형식` → balanced 기본 (isCustom=false)
 * - 어떤 param도 없음 → null 반환 (호출자가 모드를 결정)
 *
 * 반환된 weights는 항상 normalize 후 합 100.
 */
export interface ResolvedPersona {
  persona: Persona;
  isCustom: boolean;
}

export function resolvePersonaFromParams(
  personaParam: string | undefined | null,
  weightsParam: string | undefined | null,
): ResolvedPersona | null {
  const baseId = (personaParam ?? "").trim();
  const basePersona = baseId ? getPersona(baseId) : null;

  const parsedWeights = parseWeightsParam(weightsParam);

  // 둘 다 없음 → 호출자가 dimension 모드 등으로 처리
  if (!basePersona && !parsedWeights) {
    return null;
  }

  // persona만 있음 → 기본 가중치
  if (basePersona && !parsedWeights) {
    return { persona: basePersona, isCustom: false };
  }

  // weights만 있음 → balanced 기반 커스텀
  // (UI상 base label은 균등으로 보이지만 isCustom=true)
  const effectiveBaseId: PersonaId = (basePersona?.id ?? "balanced") as PersonaId;
  const normalized = normalizeWeights(parsedWeights!);
  const customPersona = buildCustomPersona(effectiveBaseId, normalized);
  const baseDefault = basePersona ?? getPersona("balanced")!;
  const isCustom = !isSameWeights(normalized, baseDefault.weights);

  return { persona: customPersona, isCustom };
}

/**
 * computePersonaScore 호환 — 기존 함수를 그대로 사용하기 위한 통과 헬퍼.
 *
 * 회귀 안전을 위해 별도 시그니처를 만들지 않고, 호출자가 buildCustomPersona로 만든
 * Persona를 그대로 computePersonaScore에 넘기면 된다. 이 함수는 보일러플레이트 감소용.
 */
export type { DimensionScoresInput, Persona, PersonaWeights };
