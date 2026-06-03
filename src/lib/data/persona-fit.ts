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
  // Phase 7 B D4 — 신규 10건 (2026-05-21)
  "cherry-tomato": { family: 5, farmYouth: 5, elderRural: 2 },
  eggplant: { farmYouth: 4, family: 4 },
  asparagus: { farmYouth: 5, elderRural: 2, family: 3 },
  broccoli: { family: 5, elderRural: 4 },
  paprika: { farmYouth: 5, family: 2, elderRural: 1, commuter: 1 },
  carrot: { family: 4, elderRural: 4 },
  "king-oyster-mushroom": { farmYouth: 4, family: 3, commuter: 3 },
  maesil: { commuter: 4, family: 4 },
  deodeok: { farmYouth: 4, elderRural: 2 },
  buckwheat: { elderRural: 4, family: 3, commuter: 2 },
};

export function getCropPersonaFit(crop: CropInfo): PersonaFit {
  const base = calcCropDefaultFit(crop);
  const override = CROP_FIT_OVERRIDES[crop.id] ?? {};
  return { ...base, ...override };
}

/** 작물 override 사유 카피 (Phase 6 B3 D1) — 사용자 노출 톤(~예요/세요). */
const CROP_OVERRIDE_REASONS: Record<string, string> = {
  "shine-muscat": "고부가가치 시설 포도예요. 본업 농가에 잘 맞아요",
  ginseng: "장기 재배(4~6년)라 본업 농가가 아니면 어려워요",
  bellflower: "약용 특용작물이라 본업 농가에 어울려요",
  shiitake: "버섯 재배는 본업 농가에 적합해요",
  "oyster-mushroom": "버섯 재배는 본업 농가에 적합해요",
  strawberry: "시설 딸기는 가족·본업 농가 모두에 인기 작물이에요",
  blueberry: "관리 부담이 적어 가족·통근 농가에 어울려요",
  cherry: "관리 부담이 적은 과수예요",
  mango: "아열대 시설 작물이라 본업 농가에 한정돼요",
  "perilla-leaf": "쉬운 채소라 가족·노년에 잘 맞아요",
  lettuce: "쉬운 채소라 가족·노년에 잘 맞아요",
  arugula: "쉬운 채소라 가족·노년에 잘 맞아요",
  spinach: "쉬운 채소라 가족·노년에 잘 맞아요",
  "green-onion": "노년 자가소비에 적합한 작물이에요",
  apple: "관리 사이클이 정해진 과수라 통근 농가에 잘 맞아요",
  pear: "관리 사이클이 정해진 과수라 통근 농가에 잘 맞아요",
  citrus: "남부 지역 통근·본업 농가에 적합해요",
  persimmon: "저관리 과수라 통근·노년에 어울려요",
  plum: "저관리 과수예요",
  peach: "저관리 과수예요",
  rice: "면적 규모 농사라 통근 농가에는 어려워요",
  "sweet-potato": "노년 자가소비·가족 식량에 적합해요",
  potato: "노년 자가소비·가족 식량에 적합해요",
  // Phase 7 B D4 — 신규 10건 (2026-05-21)
  "cherry-tomato": "시설 방울토마토는 가족·본업 농가 모두에 인기 작목이에요",
  eggplant: "시설 가지는 시설채소 상위권 소득이라 본업 농가에 어울려요",
  asparagus: "다년생 신소득 작목이라 본업 농가에 잘 맞아요",
  broccoli: "겨울 노지 채소라 가족·노년 농가에 어울려요",
  paprika: "수출 시설 작물이라 본업 농가에 한정돼요",
  carrot: "기본 근채류라 가족·노년 자가소비에 잘 맞아요",
  "king-oyster-mushroom": "버섯 시설재배는 본업 농가에 적합해요",
  maesil: "관리 사이클이 정해진 과수라 통근·가족 농가에 어울려요",
  deodeok: "약용 특용작물이라 본업 농가에 어울려요",
  buckwheat: "척박지에서도 잘 자라 노년 자가소비에 적합해요",
};

// ──────────────────────────────────────────────────────────────
// Trace 함수 (Phase 6 B3 D1)
// ──────────────────────────────────────────────────────────────

/**
 * 추천 점수 산출 근거 1건.
 *
 * UI 렌더링 단위로 그대로 칩/리스트에 노출 가능하도록 평탄화.
 */
export interface TraceReason {
  /**
   * 사유 분류 (UI 스타일 차별화 용도)
   * - "category": 카테고리/지원유형 기반
   * - "difficulty": 난이도 기반
   * - "age": 연령 요건 기반
   * - "override": 명시적 override
   * - "balanced": balanced 페르소나 안내
   */
  kind: "category" | "difficulty" | "age" | "override" | "balanced";
  /** UI 라벨 (사용자 노출 카피, ~예요/세요 톤) */
  label: string;
}

export interface FitTrace {
  /** 최종 점수 (override 적용 후) */
  score: FitScore;
  /** override 적용 전 default 점수 (UI 비교용) */
  baseScore: FitScore;
  /** 점수 산출 근거 (UI 칩 렌더) */
  reasons: TraceReason[];
}

/**
 * 작물 페르소나 fit 점수 산출 근거 trace.
 *
 * balanced 페르소나는 reasons에 안내 1건만 반환 (UI에서 explain 미노출 처리 가능).
 */
export function getCropPersonaFitTrace(
  crop: CropInfo,
  personaId: PersonaId,
): FitTrace {
  const base = calcCropDefaultFit(crop);
  const override = CROP_FIT_OVERRIDES[crop.id] ?? {};
  const baseScore = base[personaId];
  const finalScore: FitScore = override[personaId] ?? baseScore;

  // balanced: 모든 작물 동점 3 — explain 무의미
  if (personaId === "balanced") {
    return {
      score: finalScore,
      baseScore,
      reasons: [
        {
          kind: "balanced",
          label: "균등 페르소나라 작물별 차이를 매기지 않아요",
        },
      ],
    };
  }

  const reasons: TraceReason[] = [];

  // 1. 카테고리 사유
  reasons.push({
    kind: "category",
    label: `${crop.category} 작물이에요`,
  });

  // 2. 난이도 사유
  reasons.push({
    kind: "difficulty",
    label: `재배 난이도 ${crop.difficulty}이에요`,
  });

  // 3. override 사유 (override 적용된 경우만)
  if (override[personaId] !== undefined) {
    const reasonCopy = CROP_OVERRIDE_REASONS[crop.id];
    if (reasonCopy) {
      reasons.push({ kind: "override", label: reasonCopy });
    }
  }

  return { score: finalScore, baseScore, reasons };
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
  // 2026-05-11: SP-019(스마트팜 9기)는 SP-012와 동일 사업이라 중복 제거. SP-012 항목 활용.
  // 청년농 영농정착 2차 (40세 미만 핵심)
  "SP-020": { farmYouth: 5, family: 3, elderRural: 1, commuter: 1 },
  // 2026-05-14: 6/15 큐레이션 sprint 당김 (7월 모집 시즌 대비)
  // 예산군 임대형 스마트팜 (40세 미만 청년)
  "SP-021": { farmYouth: 5, family: 3, elderRural: 1, commuter: 1 },
  // 청년농 R&D 아이디어 사업화 공모 (40세 이하 청년)
  "SP-022": { farmYouth: 5, family: 2, elderRural: 1, commuter: 2 },
  // 후계농업경영인 일반 선발 (만 18~49세, 가족·청년 핵심)
  "SP-023": { family: 5, farmYouth: 5, elderRural: 2, commuter: 2 },
  // 고성 귀농인의 집 (체류형, 가족·노년)
  "SP-024": { family: 5, elderRural: 4, commuter: 4, farmYouth: 3 },
  // 논산 귀농인의 집 (체류형, 가족·반귀농)
  "SP-025": { family: 5, commuter: 4, elderRural: 4, farmYouth: 3 },
  // 제주 신규농업인 현장실습 (1:1 매칭 교육, 청년·균형형)
  "SP-026": { farmYouth: 5, family: 4, elderRural: 3, commuter: 3 },
  // 홍천 귀농인의 집 (체류형, 가족·노년)
  "SP-032": { family: 5, elderRural: 4, commuter: 4, farmYouth: 3 },
};

export function getProgramPersonaFit(program: SupportProgram): PersonaFit {
  const base = calcProgramDefaultFit(program);
  const override = PROGRAM_FIT_OVERRIDES[program.id] ?? {};
  return { ...base, ...override };
}

/** 사업 override 사유 카피 (Phase 6 B3 D1) — 사용자 노출 톤(~예요/세요). */
const PROGRAM_OVERRIDE_REASONS: Record<string, string> = {
  "SP-001": "후계농 융자(주택 포함)라 가족·본업 농가에 가장 맞아요",
  "SP-002": "40세 이하 청년농 정착지원이라 본업 농가 전용이에요",
  "SP-003": "충남 청년창업농 교육이라 청년 본업 농가에 맞아요",
  "SP-004": "스마트팜 시설 사업이라 본업 농가 중심이에요",
  "SP-005": "체류형 살아보기라 통근·노년 귀촌에 잘 맞아요",
  "SP-006": "체류형 살아보기라 통근·노년 귀촌에 잘 맞아요",
  "SP-007": "체류형 살아보기라 통근·노년 귀촌에 잘 맞아요",
  "SP-008": "월 80만원 영농학습 지원이라 청년·가족에 적합해요",
  "SP-009": "체험형 농촌 프로그램이라 통근·노년·가족 모두 무난해요",
  "SP-010": "체류형 프로그램이라 통근·노년·가족 모두 무난해요",
  "SP-011": "농기원 실습 교육이라 청년·가족 입문자에게 맞아요",
  "SP-012": "후계농 단계별 융자라 가족·본업 농가에 강점이에요",
  "SP-015": "40세 미만 청년 대상 스마트팜 임대형이에요",
  "SP-016": "체류형 살아보기(도시민 대상)라 통근·노년에 어울려요",
  "SP-017": "전국 체류 허브라 모든 페르소나에 폭넓게 맞아요",
  "SP-018": "농지 임대수탁이라 자본 부담이 큰 가족·노년에 강점이에요",
  "SP-020": "40세 미만 청년농 정착지원 2차 모집이에요",
  "SP-021": "40세 미만 청년 대상 임대형 스마트팜 입주(예산)이에요",
  "SP-022": "청년농 R&D 아이디어 사업화 공모라 본업 농가에 맞아요",
  "SP-023": "만 49세 이하 후계농 융자(최대 5억원)라 가족·본업 농가 핵심이에요",
  "SP-024": "체류형 귀농인의 집(고성)이라 가족·노년에 잘 맞아요",
  "SP-025": "체류형 귀농인의 집(논산)이라 가족·반귀농에 잘 맞아요",
  "SP-026": "1:1 매칭 현장실습이라 청년·입문 농가에 적합해요",
  "SP-032": "체류형 귀농인의 집(홍천)이라 가족·노년에 잘 맞아요",
};

/**
 * 사업 페르소나 fit 점수 산출 근거 trace.
 *
 * balanced 페르소나는 reasons에 안내 1건만 반환.
 */
export function getProgramPersonaFitTrace(
  program: SupportProgram,
  personaId: PersonaId,
): FitTrace {
  const base = calcProgramDefaultFit(program);
  const override = PROGRAM_FIT_OVERRIDES[program.id] ?? {};
  const baseScore = base[personaId];
  const finalScore: FitScore = override[personaId] ?? baseScore;

  if (personaId === "balanced") {
    return {
      score: finalScore,
      baseScore,
      reasons: [
        {
          kind: "balanced",
          label: "균등 페르소나라 사업별 차이를 매기지 않아요",
        },
      ],
    };
  }

  const reasons: TraceReason[] = [];

  // 1. 연령 요건 사유
  const ageMin = program.eligibilityAgeMin;
  const ageMax = program.eligibilityAgeMax;
  if (ageMax > 0 && ageMax <= 40) {
    reasons.push({
      kind: "age",
      label: `${ageMax}세 이하 청년 대상이에요`,
    });
  } else if (ageMax === 0) {
    reasons.push({
      kind: "age",
      label: ageMin > 0 ? `${ageMin}세 이상 신청 가능해요` : "연령 제한이 없어요",
    });
  } else if (ageMax >= 60) {
    reasons.push({
      kind: "age",
      label: `${ageMax}세 이하 신청 가능해요 (노년 친화)`,
    });
  } else {
    reasons.push({
      kind: "age",
      label: `${ageMin}~${ageMax}세 대상이에요`,
    });
  }

  // 2. 지원유형 사유
  reasons.push({
    kind: "category",
    label: `${program.supportType} 지원이에요`,
  });

  // 3. override 사유 (override 적용된 경우만)
  if (override[personaId] !== undefined) {
    const reasonCopy = PROGRAM_OVERRIDE_REASONS[program.id];
    if (reasonCopy) {
      reasons.push({ kind: "override", label: reasonCopy });
    }
  }

  return { score: finalScore, baseScore, reasons };
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
