/**
 * 페르소나 추천 매핑 (Phase 6 A안)
 *
 * 작물(CropInfo)과 지원사업(SupportProgram)을 페르소나 5종에 매핑.
 * 점수 1~5: 5(매우 적합) → 4(적합) → 3(중립) → 2(덜 적합) → 1(부적합).
 *
 * 산식 + override 패턴:
 *   1. 카테고리·난이도·연령요건 등 객관적 속성으로 default 점수 산출
 *   2. 명시적 override로 산식이 잡지 못하는 예외 보정
 */

import type { CropInfo } from "./crops";
import type { SupportProgram } from "./programs";
import type { PersonaId } from "./personas";

export type FitScore = 1 | 2 | 3 | 4 | 5;
export type PersonaFit = Record<PersonaId, FitScore>;

const clamp = (n: number): FitScore => {
  if (n <= 1) return 1;
  if (n >= 5) return 5;
  return Math.round(n) as FitScore;
};

// ──────────────────────────────────────────────────────────────
// 작물 페르소나 산식
// ──────────────────────────────────────────────────────────────

/**
 * 카테고리·난이도 기반 default 점수.
 * - family(자녀 양육): 안정 수익 + 단기 수확. 저난이도 채소·식량 우대
 * - farmYouth(농업 본업): 고부가가치 + 본업 강도. 특용·시설·고난이도 과수 우대
 * - elderRural(노년 귀촌): 저강도 + 자가소비. 쉬운 채소·식량 우대
 * - commuter(귀촌 직장인): 자동화 + 주말 농업. 관리 적은 과수 우대
 * - balanced: 항상 3
 */
function calcCropDefaultFit(crop: CropInfo): PersonaFit {
  const easy = crop.difficulty === "쉬움";
  const hard = crop.difficulty === "어려움";

  let family = 3;
  let farmYouth = 3;
  let elderRural = 3;
  let commuter = 3;

  switch (crop.category) {
    case "채소":
      family += easy ? 2 : hard ? 0 : 1;
      farmYouth += hard ? 1 : easy ? -1 : 0;
      elderRural += easy ? 2 : hard ? -1 : 1;
      commuter += easy ? 0 : hard ? -1 : 0;
      break;
    case "식량":
      family += easy ? 1 : 0;
      farmYouth += hard ? 1 : 0;
      elderRural += easy ? 1 : 0;
      commuter += -1;
      break;
    case "과수":
      family += easy ? 1 : 0;
      farmYouth += hard ? 2 : 1;
      elderRural += hard ? -1 : 0;
      commuter += easy ? 2 : hard ? 0 : 1;
      break;
    case "특용":
      family += -1;
      farmYouth += 2;
      elderRural += -2;
      commuter += -2;
      break;
  }

  return {
    family: clamp(family),
    farmYouth: clamp(farmYouth),
    elderRural: clamp(elderRural),
    commuter: clamp(commuter),
    balanced: 3,
  };
}

/** 산식이 잡지 못하는 예외 (작물 ID 단위 override). */
const CROP_FIT_OVERRIDES: Record<string, Partial<PersonaFit>> = {
  "shine-muscat": { farmYouth: 5, family: 4, elderRural: 1 },
  ginseng: { farmYouth: 5, family: 1, elderRural: 1, commuter: 1 },
  bellflower: { farmYouth: 4, elderRural: 2 },
  shiitake: { farmYouth: 4, family: 3, commuter: 3 },
  "oyster-mushroom": { farmYouth: 4, family: 3, commuter: 3 },
  strawberry: { family: 5, farmYouth: 5, elderRural: 2 },
  blueberry: { family: 4, commuter: 4, farmYouth: 4 },
  cherry: { commuter: 4, family: 3 },
  mango: { farmYouth: 5, family: 2, elderRural: 1, commuter: 1 },
  "perilla-leaf": { family: 5, elderRural: 5 },
  lettuce: { family: 5, elderRural: 5, commuter: 3 },
  arugula: { family: 4, elderRural: 4 },
  spinach: { family: 4, elderRural: 5 },
  "green-onion": { elderRural: 5, family: 4 },
  apple: { commuter: 5, family: 4 },
  pear: { commuter: 4, family: 4 },
  citrus: { commuter: 4, farmYouth: 4 },
  persimmon: { commuter: 5, elderRural: 4 },
  plum: { commuter: 4, elderRural: 3 },
  peach: { commuter: 4, family: 3 },
  rice: { farmYouth: 4, elderRural: 3, commuter: 1 },
  "sweet-potato": { family: 4, elderRural: 5 },
  potato: { family: 4, elderRural: 5 },
};

export function getCropPersonaFit(crop: CropInfo): PersonaFit {
  const base = calcCropDefaultFit(crop);
  const override = CROP_FIT_OVERRIDES[crop.id] ?? {};
  return { ...base, ...override };
}

// ──────────────────────────────────────────────────────────────
// 지원사업 페르소나 산식
// ──────────────────────────────────────────────────────────────

/**
 * 연령 요건 + 지원유형 기반 default 점수.
 * - family: 정착 자금형(보조금/융자) + 연령 30~45 매칭
 * - farmYouth: 청년(40세 이하) + 영농 본업 지원
 * - elderRural: 50세 이상 가능 + 정착 지원형
 * - commuter: 도시민 귀촌 + 체류형 + 통근 가능
 * - balanced: 3 default
 */
function calcProgramDefaultFit(program: SupportProgram): PersonaFit {
  const ageMin = program.eligibilityAgeMin;
  const ageMax = program.eligibilityAgeMax;
  const isYouthOnly = ageMax > 0 && ageMax <= 40;
  const isElderFriendly = ageMax === 0 || ageMax >= 60;
  const type = program.supportType;

  let family = 3;
  let farmYouth = 3;
  let elderRural = 3;
  let commuter = 3;

  // 청년 한정 사업
  if (isYouthOnly) {
    farmYouth = 5;
    family = ageMin <= 30 ? 4 : 3;
    elderRural = 1;
    commuter = 2;
  }

  // 노년 가능 사업 (연령 무제한 또는 60+ 가능)
  if (isElderFriendly && !isYouthOnly) {
    elderRural = 4;
  }

  // 지원유형별 보정
  switch (type) {
    case "보조금":
      // 직접 자금 지원 — 정착비 부담 큰 페르소나에 가산
      family += 1;
      farmYouth += 1;
      break;
    case "융자":
      // 대출 — 본업·자녀양육에 적합
      family += 1;
      farmYouth += 1;
      commuter += -1;
      break;
    case "교육":
      // 교육 — 입문 페르소나에 가산
      family += 1;
      commuter += 1;
      elderRural += 1;
      break;
    case "현물":
      // 체류형 주거 — 도시민 귀촌·노년에 적합
      commuter += 2;
      elderRural += 2;
      family += -1;
      break;
    case "컨설팅":
      farmYouth += 1;
      break;
  }

  return {
    family: clamp(family),
    farmYouth: clamp(farmYouth),
    elderRural: clamp(elderRural),
    commuter: clamp(commuter),
    balanced: 3,
  };
}

/** 사업 ID 단위 override. */
const PROGRAM_FIT_OVERRIDES: Record<string, Partial<PersonaFit>> = {
  // 청년농업인 영농정착지원사업 (40세 이하)
  "SP-002": { farmYouth: 5, family: 3, elderRural: 1, commuter: 1 },
  // 후계농업경영인 융자 (3억 + 주택 7500)
  "SP-001": { family: 5, farmYouth: 5, elderRural: 2, commuter: 2 },
  // 충남 청년창업농 교육
  "SP-003": { farmYouth: 5, family: 3, elderRural: 1, commuter: 2 },
  // 완주 스마트팜 (시설 132백만+)
  "SP-004": { farmYouth: 5, family: 2, elderRural: 1, commuter: 1 },
  // 함평 체류형 (귀농어귀촌)
  "SP-005": { commuter: 5, elderRural: 5, family: 4, farmYouth: 3 },
  // 금산 귀농교육센터 체류형
  "SP-006": { commuter: 5, elderRural: 5, family: 4, farmYouth: 3 },
  // 무안 체류형
  "SP-007": { commuter: 5, elderRural: 5, family: 4, farmYouth: 3 },
  // 연천 영농학습 (월 80만)
  "SP-008": { farmYouth: 4, family: 3, commuter: 3, elderRural: 3 },
  // 영월 요선농촌 체험
  "SP-009": { commuter: 4, elderRural: 4, family: 4 },
  // 영암 체류
  "SP-010": { commuter: 4, elderRural: 4, family: 4 },
  // 한국농업기술진흥원 교육 (실습비 월 70 + 재료 연 360)
  "SP-011": { farmYouth: 4, family: 4, elderRural: 3, commuter: 3 },
  // 후계농 단계별 융자
  "SP-012": { family: 5, farmYouth: 5, elderRural: 2, commuter: 2 },
  // 삼척 임대형 스마트팜 (40세 미만 청년)
  "SP-015": { farmYouth: 5, family: 3, elderRural: 1, commuter: 1 },
  // 영광 살아보기 (체류형, 도시민 대상)
  "SP-016": { commuter: 5, elderRural: 5, family: 4, farmYouth: 3 },
  // 그린대로 살아보기 hub (체류형, 모든 페르소나)
  "SP-017": { commuter: 5, elderRural: 4, family: 4, farmYouth: 4 },
  // 농지은행 임대수탁 (가족·고령농 자본부담 완화 효과 큼)
  "SP-018": { family: 5, elderRural: 5, commuter: 4, farmYouth: 4 },
  // 스마트팜 9기 (39세 이하 장기 창업교육)
  "SP-019": { farmYouth: 5, family: 3, elderRural: 1, commuter: 2 },
  // 청년농 영농정착 2차 (40세 미만 핵심)
  "SP-020": { farmYouth: 5, family: 3, elderRural: 1, commuter: 1 },
};

export function getProgramPersonaFit(program: SupportProgram): PersonaFit {
  const base = calcProgramDefaultFit(program);
  const override = PROGRAM_FIT_OVERRIDES[program.id] ?? {};
  return { ...base, ...override };
}

// ──────────────────────────────────────────────────────────────
// 추천 함수 (D2에서 활용)
// ──────────────────────────────────────────────────────────────

/** 페르소나 점수를 기준으로 작물 정렬 (내림차순). 동점은 입력 순서 보존. */
export function rankCropsForPersona(
  crops: CropInfo[],
  personaId: PersonaId,
): Array<{ crop: CropInfo; score: FitScore }> {
  return crops
    .map((crop) => ({ crop, score: getCropPersonaFit(crop)[personaId] }))
    .sort((a, b) => b.score - a.score);
}

/** 페르소나 점수를 기준으로 지원사업 정렬 (내림차순). */
export function rankProgramsForPersona(
  programs: SupportProgram[],
  personaId: PersonaId,
): Array<{ program: SupportProgram; score: FitScore }> {
  return programs
    .map((program) => ({
      program,
      score: getProgramPersonaFit(program)[personaId],
    }))
    .sort((a, b) => b.score - a.score);
}
