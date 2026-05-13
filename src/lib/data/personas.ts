/**
 * 귀농 페르소나 + 차원별 가중치 (Phase 5)
 *
 * 5개 페르소나 × 5차원 가중치 매트릭스 (각 행 합 = 100%).
 * 회장 결재 (2026-05-04, A안):
 *   - 직관 가중치 (회귀 분석 X)
 *   - 도시 자치구 처리: 농가+귀농 가중치 합 ≥ 50%인 페르소나는 도시 자치구에서 점수 hide.
 *     미만이면 가용 차원만 합산하고 가중치 재정규화.
 *
 * 가중치 변경은 회장 결재 사항 (Phase 3 사고 방지).
 */

/**
 * 점수 계산은 sgisCode/name 없이 5차원 값만으로 가능 — 호환성 위해 별도 입력 타입.
 * dimension-scores.ts 의 DimensionScores 도 이 형태에 호환됨 (구조적 타이핑).
 */
export interface DimensionScoresInput {
  populationTrend: number | null;
  farmActivity: number | null;
  medical: number | null;
  school: number | null;
  returnFarm: number | null;
}

export type PersonaId =
  | "family"
  | "farmYouth"
  | "elderRural"
  | "commuter"
  | "balanced";

export interface PersonaWeights {
  populationTrend: number;
  farmActivity: number;
  medical: number;
  school: number;
  returnFarm: number;
}

export interface Persona {
  id: PersonaId;
  /** UI 라벨 */
  label: string;
  /** 짧은 설명 (UI 부제) */
  desc: string;
  /** 어울리는 사람 (methodology 페이지용) */
  audience: string;
  /** 5차원 가중치 (합 = 100) */
  weights: PersonaWeights;
}

/** 페르소나 5종 */
export const PERSONAS: Persona[] = [
  {
    id: "family",
    label: "자녀 양육 가구",
    desc: "어린 자녀와 함께 귀농",
    audience: "30~40대 + 자녀 있음",
    weights: {
      populationTrend: 20,
      farmActivity: 15,
      medical: 15,
      school: 35,
      returnFarm: 15,
    },
  },
  {
    id: "farmYouth",
    label: "청년 영농",
    desc: "농업을 본업으로 시작",
    audience: "35세 이하 + 농업 전업",
    weights: {
      populationTrend: 20,
      farmActivity: 40,
      medical: 5,
      school: 5,
      returnFarm: 30,
    },
  },
  {
    id: "elderRural",
    label: "노년 귀촌",
    desc: "은퇴 후 한적한 귀촌",
    audience: "55세 이상 + 농업 부업/취미",
    weights: {
      populationTrend: 25,
      farmActivity: 15,
      medical: 40,
      school: 5,
      returnFarm: 15,
    },
  },
  {
    id: "commuter",
    label: "귀촌 직장인",
    desc: "도시 통근하며 시골 거주",
    audience: "도시 통근 + 농업 안 함",
    weights: {
      populationTrend: 35,
      farmActivity: 5,
      medical: 25,
      school: 15,
      returnFarm: 20,
    },
  },
  {
    id: "balanced",
    label: "기본 균등",
    desc: "5차원을 똑같이 보고 싶을 때",
    audience: "스타일 정하지 않음",
    weights: {
      populationTrend: 20,
      farmActivity: 20,
      medical: 20,
      school: 20,
      returnFarm: 20,
    },
  },
];

export const PERSONA_INDEX = new Map(PERSONAS.map((p) => [p.id, p]));

export function getPersona(id: string): Persona | null {
  return PERSONA_INDEX.get(id as PersonaId) ?? null;
}

/**
 * 페르소나별 가중 점수 계산.
 *
 * @returns 0~100 점수 또는 null
 *   - null: 도시 자치구·군위 같이 페르소나가 의존하는 차원 데이터가 부재할 때
 *
 * 도시 자치구 hide 정책:
 *   - 농가+귀농 가중치 합 ≥ 50%인 페르소나(농업 본업·자녀 양육·기본 균등)
 *     → 두 차원 모두 null이면 점수 자체 null
 *   - 미만(노년 귀촌·귀촌 직장인) → 가용 차원만 가중 평균 (재정규화)
 */
export function computePersonaScore(
  scores: DimensionScoresInput | null,
  persona: Persona,
): number | null {
  if (!scores) return null;

  const w = persona.weights;
  const farmReturnWeight = w.farmActivity + w.returnFarm;
  const isFarmHeavy = farmReturnWeight >= 50;

  // 가용 차원 (null 아닌 것)
  const dims: Array<{ value: number; weight: number }> = [];
  if (scores.populationTrend !== null) {
    dims.push({ value: scores.populationTrend, weight: w.populationTrend });
  }
  if (scores.farmActivity !== null) {
    dims.push({ value: scores.farmActivity, weight: w.farmActivity });
  }
  if (scores.medical !== null) {
    dims.push({ value: scores.medical, weight: w.medical });
  }
  if (scores.school !== null) {
    dims.push({ value: scores.school, weight: w.school });
  }
  if (scores.returnFarm !== null) {
    dims.push({ value: scores.returnFarm, weight: w.returnFarm });
  }

  if (dims.length === 0) return null;

  // 농가·귀농 의존 페르소나에서 둘 다 null이면 hide
  if (
    isFarmHeavy &&
    scores.farmActivity === null &&
    scores.returnFarm === null
  ) {
    return null;
  }

  const totalWeight = dims.reduce((sum, d) => sum + d.weight, 0);
  if (totalWeight === 0) return null;

  const weightedSum = dims.reduce((sum, d) => sum + d.value * d.weight, 0);
  return Math.round(weightedSum / totalWeight);
}

/** 페르소나 점수 + 어떤 차원이 빠졌는지 메타 정보 */
export interface PersonaScoreResult {
  /** 0~100 점수 또는 null (페르소나 미적용) */
  score: number | null;
  /** 가중 합산에 포함된 차원 개수 (0~5) */
  usedDimensions: number;
  /** 빠진 차원이 있으면 그 라벨 (UI 안내용) */
  missingLabels: string[];
}

const DIMENSION_LABEL_MAP = {
  populationTrend: "인구 추세",
  farmActivity: "농가 활성도",
  medical: "의료 인프라",
  school: "학교 인프라",
  returnFarm: "귀농 활성도",
} as const;

/**
 * 진단 demographic 답변(ageGroup) 기반 추천 페르소나 매핑.
 *
 * 매핑 로직 (단순 1차):
 *   - youth (39세 이하)   → farmYouth  (청년 농업 본업 가정)
 *   - 40s                  → family     (자녀 양육 가구 가정)
 *   - 50s                  → commuter   (귀촌 직장인 가정)
 *   - 60plus               → elderRural (노년 귀촌)
 *   - 답변 없음/매칭 실패  → balanced   (5차원 균등)
 *
 * 한계: ageGroup만으로 가족 유무·직업 형태를 정확히 알 수 없음. 향후 track answers
 * (가족 dimension 점수)와 결합해 더 정교한 매핑 가능 (Phase 6 후보).
 */
export function mapDemographicToPersona(ageGroup: string | undefined): Persona {
  switch (ageGroup) {
    case "youth":
      return PERSONA_INDEX.get("farmYouth")!;
    case "40s":
      return PERSONA_INDEX.get("family")!;
    case "50s":
      return PERSONA_INDEX.get("commuter")!;
    case "60plus":
      return PERSONA_INDEX.get("elderRural")!;
    default:
      return PERSONA_INDEX.get("balanced")!;
  }
}

export function computePersonaScoreDetailed(
  scores: DimensionScoresInput | null,
  persona: Persona,
): PersonaScoreResult {
  if (!scores) {
    return { score: null, usedDimensions: 0, missingLabels: [] };
  }

  const dimKeys = [
    "populationTrend",
    "farmActivity",
    "medical",
    "school",
    "returnFarm",
  ] as const;

  const missing: string[] = [];
  for (const k of dimKeys) {
    if (scores[k] === null) {
      missing.push(DIMENSION_LABEL_MAP[k]);
    }
  }

  const score = computePersonaScore(scores, persona);
  return {
    score,
    usedDimensions: 5 - missing.length,
    missingLabels: missing,
  };
}
