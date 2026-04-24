/**
 * 맞춤 추천 위저드 — 스코어링 / 추천 엔진
 *
 * match-wizard.tsx에서 분리한 순수 로직 모듈.
 * UI 의존성 없이 답변 → 지역/작물/유형 스코어링만 처리합니다.
 */

import { PROVINCES, type Province } from "@/lib/data/regions";
import { CROPS, CROP_DETAILS, type CropInfo } from "@/lib/data/crops";
import { PROGRAMS, type SupportProgram } from "@/lib/data/programs";
import { deriveStatus } from "@/lib/program-status";
import {
  FARM_TYPES,
  type Answers,
  type FarmType,
  type FarmTypeId,
} from "@/lib/data/match-questions";

/* ══════════════════════════════════════════════
   1. 귀농 유형 분류
   ══════════════════════════════════════════════ */

/** 답변 조합으로 귀농 유형(정부 트랙) 점수 산출 */
export function classifyFarmType(
  answers: Answers,
  ageGroup?: string,
): FarmType {
  const scores: Record<FarmTypeId, number> = {
    guinong: 0,
    guichon: 0,
    guisanchon: 0,
    smartfarm: 0,
    cheongnyeon: 0,
  };

  // 기후
  for (const ans of answers.climate || []) {
    if (ans === "warm") { scores.guinong += 2; scores.guichon += 1; }
    if (ans === "four-season") { scores.smartfarm += 2; scores.guichon += 1; scores.guinong += 1; }
    if (ans === "cool") { scores.guisanchon += 3; scores.guinong += 1; }
  }

  // 우선순위 (복수 선택)
  for (const ans of answers.priority || []) {
    if (ans === "nature") { scores.guisanchon += 3; scores.guinong += 1; }
    if (ans === "access") { scores.guichon += 3; scores.smartfarm += 1; }
    if (ans === "support") { scores.cheongnyeon += 2; scores.guinong += 2; }
    if (ans === "market") { scores.smartfarm += 3; scores.cheongnyeon += 2; }
  }

  // 작물 유형 (복수 선택)
  for (const ans of answers["crop-type"] || []) {
    if (ans === "grain") { scores.guinong += 3; }
    if (ans === "vegetable") { scores.smartfarm += 2; scores.guinong += 1; }
    if (ans === "fruit") { scores.guinong += 2; scores.smartfarm += 1; }
    if (ans === "special") { scores.guisanchon += 2; scores.smartfarm += 1; }
  }

  // 생활환경
  for (const ans of answers.lifestyle || []) {
    if (ans === "near-city") { scores.guichon += 4; scores.smartfarm += 1; }
    if (ans === "moderate") { scores.guinong += 2; scores.cheongnyeon += 2; }
    if (ans === "rural") { scores.guinong += 3; scores.guisanchon += 2; }
  }

  // 경험
  for (const ans of answers.experience || []) {
    if (ans === "none") { scores.guichon += 2; scores.cheongnyeon += 1; }
    if (ans === "some") { scores.guinong += 2; scores.smartfarm += 1; }
    if (ans === "experienced") { scores.guinong += 3; scores.cheongnyeon += 2; }
  }

  // 예산
  for (const ans of answers.budget || []) {
    if (ans === "under-30m") { scores.guichon += 2; scores.guisanchon += 1; }
    if (ans === "30m-100m") { scores.guinong += 2; scores.cheongnyeon += 1; }
    if (ans === "100m-300m") { scores.guinong += 3; scores.smartfarm += 1; }
    if (ans === "over-300m") { scores.smartfarm += 4; scores.guinong += 1; }
  }

  // 가족 구성
  for (const ans of answers.household || []) {
    if (ans === "solo") { scores.cheongnyeon += 2; scores.guisanchon += 1; }
    if (ans === "couple") { scores.guinong += 2; scores.guichon += 1; }
    if (ans === "family-kids") { scores.guichon += 3; scores.guinong += 1; }
    if (ans === "family-parents") { scores.guichon += 2; scores.guinong += 1; }
  }

  // 타임라인
  for (const ans of answers.timeline || []) {
    if (ans === "within-1y") { scores.guinong += 2; scores.cheongnyeon += 1; }
    if (ans === "1-3y") { scores.smartfarm += 1; scores.guinong += 1; }
    if (ans === "over-3y") { scores.guichon += 2; }
  }

  // 주된 소득원 (핵심 분류 기준)
  for (const ans of answers["income-goal"] || []) {
    if (ans === "farming") { scores.guinong += 5; scores.cheongnyeon += 2; }
    if (ans === "remote-work") { scores.guichon += 6; }
    if (ans === "forestry") { scores.guisanchon += 6; }
    if (ans === "smart-agri") { scores.smartfarm += 6; scores.cheongnyeon += 2; }
  }

  // ── 신규 질문: 정착 환경 ──
  for (const ans of answers["settlement-type"] || []) {
    if (ans === "farmland") { scores.guinong += 4; }
    if (ans === "town") { scores.guichon += 4; }
    if (ans === "mountain") { scores.guisanchon += 5; }
    if (ans === "smart-complex") { scores.smartfarm += 5; }
  }

  // 연령 보정: 청년(≤39)이면 청년농 가산
  if (ageGroup === "youth") {
    scores.cheongnyeon += 6;
  }

  // 최고 점수 유형 반환
  const sorted = (Object.entries(scores) as [FarmTypeId, number][])
    .sort((a, b) => b[1] - a[1]);

  return FARM_TYPES.find((t) => t.id === sorted[0][0]) ?? FARM_TYPES[0];
}

/* ══════════════════════════════════════════════
   2. 추천 지원사업
   ══════════════════════════════════════════════ */

/** 상태 우선순위 (모집중 > 모집예정 > 마감) */
const STATUS_PRIORITY: Record<SupportProgram["status"], number> = {
  "모집중": 0,
  "모집예정": 1,
  "마감": 2,
};

/** 유형별 추천 지원사업 조회 — 날짜 기반 상태 자동 갱신 + 모집중 우선 정렬 */
export function getRecommendedPrograms(farmType: FarmType): SupportProgram[] {
  return farmType.programIds
    .map((id) => PROGRAMS.find((p) => p.id === id))
    .filter((p): p is SupportProgram => p != null)
    .map((p) => ({
      ...p,
      status: deriveStatus(p.applicationStart, p.applicationEnd),
    }))
    .sort((a, b) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9));
}

/* ══════════════════════════════════════════════
   3. 지역 추천 스코어링
   ══════════════════════════════════════════════ */

/** 카테고리 → CropInfo.category 매핑 */
const CROP_TYPE_MAP: Record<string, CropInfo["category"]> = {
  grain: "식량",
  vegetable: "채소",
  fruit: "과수",
  special: "특용",
};

/** 기후 선호 → 도 점수 */
const CLIMATE_SCORES: Record<string, Record<string, number>> = {
  warm: {
    jeju: 10,
    jeonnam: 9,
    gyeongnam: 8,
    gwangju: 7,
    jeonbuk: 6,
    daegu: 5,
  },
  "four-season": {
    gyeonggi: 9,
    chungnam: 9,
    chungbuk: 8,
    seoul: 8,
    daejeon: 8,
    jeonbuk: 7,
    gyeongbuk: 7,
  },
  cool: {
    gangwon: 10,
    chungbuk: 7,
    gyeongbuk: 6,
  },
};

/** 우선순위 → 도 점수 */
const PRIORITY_SCORES: Record<string, Record<string, number>> = {
  nature: {
    gangwon: 10,
    jeju: 9,
    jeonnam: 8,
    gyeongnam: 8,
    gyeongbuk: 7,
    chungbuk: 7,
  },
  access: {
    seoul: 10,
    gyeonggi: 9,
    daejeon: 8,
    daegu: 7,
    gwangju: 7,
    chungnam: 6,
    chungbuk: 6,
  },
  support: {
    jeonnam: 10,
    jeonbuk: 9,
    chungnam: 8,
    gangwon: 8,
    gyeongbuk: 7,
    gyeongnam: 7,
  },
  market: {
    gyeonggi: 10,
    seoul: 9,
    gwangju: 7,
    daegu: 7,
    daejeon: 6,
    jeju: 6,
  },
};

/** 생활환경 → 도 점수 */
const LIFESTYLE_SCORES: Record<string, Record<string, number>> = {
  "near-city": {
    seoul: 10,
    gyeonggi: 9,
    daejeon: 8,
    daegu: 8,
    gwangju: 7,
  },
  moderate: {
    chungnam: 9,
    chungbuk: 8,
    jeonbuk: 8,
    gyeongnam: 8,
    gyeongbuk: 7,
    jeonnam: 7,
  },
  rural: {
    gangwon: 10,
    jeonnam: 9,
    gyeongbuk: 8,
    gyeongnam: 8,
    jeju: 7,
    chungbuk: 7,
  },
};

/** 작물 유형 → 주산지 가산 점수 */
const CROP_REGION_SCORES: Record<string, Record<string, number>> = {
  grain: {
    chungnam: 8, jeonbuk: 8, jeonnam: 7, gyeongbuk: 7, chungbuk: 6,
  },
  vegetable: {
    gyeonggi: 7, chungnam: 7, jeonnam: 7, gangwon: 6, gyeongbuk: 6,
  },
  fruit: {
    jeonnam: 8, gyeongbuk: 8, gyeongnam: 7, jeju: 9, chungbuk: 6,
  },
  special: {
    jeonnam: 8, gangwon: 7, jeju: 7, gyeongnam: 6, chungbuk: 6,
  },
};

/** 경험 수준 → 귀농 지원 풍부 지역 가산 */
const EXPERIENCE_REGION_SCORES: Record<string, Record<string, number>> = {
  none: {
    jeonnam: 6, jeonbuk: 6, chungnam: 5, gangwon: 5, gyeongnam: 4,
  },
  some: {
    chungnam: 4, gyeongnam: 4, jeonbuk: 4, gyeongbuk: 3,
  },
};

/** 답변 선택지 → 사용자 친화적 라벨 */
const ANSWER_LABELS: Record<string, Record<string, string>> = {
  climate: {
    warm: "온화한 기후 선호",
    "four-season": "뚜렷한 사계절 선호",
    cool: "서늘한 기후 선호",
  },
  priority: {
    nature: "자연환경 우선",
    access: "교통 접근성 우선",
    support: "귀농 지원 혜택 우선",
    market: "소비 시장 접근 우선",
  },
  lifestyle: {
    "near-city": "도시 근교 생활",
    moderate: "읍·면 단위 생활",
    rural: "조용한 농촌 생활",
  },
};

/** 적합도 진단 차원 점수 (0~100) — 선택적으로 전달 */
export interface DimensionScores {
  motivation?: number;
  finance?: number;
  family?: number;
  experience?: number;
  adaptability?: number;
}

export interface ScoredProvince {
  province: Province;
  score: number;
  matchReasons: string[];
}

export function scoreProvinces(
  answers: Answers,
  dimensionScores?: DimensionScores,
): ScoredProvince[] {
  const scores: Record<string, { score: number; reasons: Set<string> }> = {};

  // 초기화
  for (const p of PROVINCES) {
    scores[p.id] = { score: 0, reasons: new Set() };
  }

  // 기후 점수
  const climateAnswers = answers.climate || [];
  for (const ans of climateAnswers) {
    const map = CLIMATE_SCORES[ans];
    if (!map) continue;
    for (const [pid, pts] of Object.entries(map)) {
      if (scores[pid]) {
        scores[pid].score += pts;
        if (pts >= 7) {
          scores[pid].reasons.add(
            ANSWER_LABELS.climate[ans] || ans
          );
        }
      }
    }
  }

  // 우선순위 점수
  const priorityAnswers = answers.priority || [];
  for (const ans of priorityAnswers) {
    const map = PRIORITY_SCORES[ans];
    if (!map) continue;
    for (const [pid, pts] of Object.entries(map)) {
      if (scores[pid]) {
        scores[pid].score += pts;
        if (pts >= 7) {
          scores[pid].reasons.add(
            ANSWER_LABELS.priority[ans] || ans
          );
        }
      }
    }
  }

  // 생활환경 점수 + 이유 추가
  const lifestyleAnswers = answers.lifestyle || [];
  for (const ans of lifestyleAnswers) {
    const map = LIFESTYLE_SCORES[ans];
    if (!map) continue;
    for (const [pid, pts] of Object.entries(map)) {
      if (scores[pid]) {
        scores[pid].score += pts;
        if (pts >= 8) {
          scores[pid].reasons.add(
            ANSWER_LABELS.lifestyle[ans] || ans
          );
        }
      }
    }
  }

  // 작물 유형 → 주산지 가산
  const cropTypeAnswers = answers["crop-type"] || [];
  for (const ans of cropTypeAnswers) {
    const map = CROP_REGION_SCORES[ans];
    if (!map) continue;
    for (const [pid, pts] of Object.entries(map)) {
      if (scores[pid]) {
        scores[pid].score += pts;
        if (pts >= 8) {
          const catLabel = CROP_TYPE_MAP[ans] ?? ans;
          scores[pid].reasons.add(`${catLabel} 주산지`);
        }
      }
    }
  }

  // 경험 수준 → 지원 풍부 지역 가산
  const experienceAnswers = answers.experience || [];
  const experience = experienceAnswers[0];
  if (experience && EXPERIENCE_REGION_SCORES[experience]) {
    const map = EXPERIENCE_REGION_SCORES[experience];
    for (const [pid, pts] of Object.entries(map)) {
      if (scores[pid]) {
        scores[pid].score += pts;
        if (experience === "none" && pts >= 5) {
          scores[pid].reasons.add("귀농 지원 체계 우수");
        }
      }
    }
  }

  // 가족 구성 → 지역 인프라 가산
  const householdAnswers = answers.household || [];
  for (const ans of householdAnswers) {
    if (ans === "family-kids") {
      // 교육 인프라 우수 지역 가산
      const eduRegions: Record<string, number> = {
        gyeonggi: 5, chungnam: 4, gyeongnam: 4, jeonbuk: 3, chungbuk: 3,
      };
      for (const [pid, pts] of Object.entries(eduRegions)) {
        if (scores[pid]) {
          scores[pid].score += pts;
          if (pts >= 4) scores[pid].reasons.add("교육 인프라 우수");
        }
      }
    }
    if (ans === "family-parents") {
      // 의료 인프라 우수 지역 가산
      const medRegions: Record<string, number> = {
        gyeonggi: 5, gyeongnam: 4, chungnam: 4, jeonnam: 3, gyeongbuk: 3,
      };
      for (const [pid, pts] of Object.entries(medRegions)) {
        if (scores[pid]) {
          scores[pid].score += pts;
          if (pts >= 4) scores[pid].reasons.add("의료 접근성 양호");
        }
      }
    }
  }

  // 적합도 진단 차원 점수 반영 (선택)
  if (dimensionScores) {
    // 재정 점수 낮으면 → 지원 혜택 풍부 지역 가산
    if (dimensionScores.finance != null && dimensionScores.finance < 50) {
      const supportRegions: Record<string, number> = {
        jeonnam: 5, jeonbuk: 5, chungnam: 4, gangwon: 4, gyeongnam: 3,
      };
      for (const [pid, pts] of Object.entries(supportRegions)) {
        if (scores[pid]) {
          scores[pid].score += pts;
          scores[pid].reasons.add("귀농 지원금 혜택 풍부");
        }
      }
    }
    // 적응력 낮으면 → 도시 근교 가산
    if (dimensionScores.adaptability != null && dimensionScores.adaptability < 40) {
      const nearCityRegions: Record<string, number> = {
        gyeonggi: 4, seoul: 3, daejeon: 3, daegu: 3,
      };
      for (const [pid, pts] of Object.entries(nearCityRegions)) {
        if (scores[pid]) {
          scores[pid].score += pts;
        }
      }
    }
  }

  // Province 객체 매핑 + 정렬
  return PROVINCES.map((p) => ({
    province: p,
    score: scores[p.id]?.score ?? 0,
    matchReasons: Array.from(scores[p.id]?.reasons ?? []),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/* ══════════════════════════════════════════════
   4. 작물 추천
   ══════════════════════════════════════════════ */

export interface RecommendedCrop {
  crop: CropInfo;
  reasons: string[];
}

export function recommendCrops(
  answers: Answers,
  topProvinces: ScoredProvince[]
): RecommendedCrop[] {
  const cropTypeAnswers = answers["crop-type"] || [];
  const experienceAnswers = answers.experience || [];
  const experience = experienceAnswers[0] || "none";

  // 선호 카테고리
  const preferredCategories = cropTypeAnswers
    .map((a) => CROP_TYPE_MAP[a])
    .filter(Boolean);

  // 추천 지역 이름
  const topRegionNames = topProvinces.map((sp) => sp.province.name);

  // 해당 지역에서 재배 가능한 작물 필터링
  const regionCropIds = new Set<string>();
  for (const detail of CROP_DETAILS) {
    const isInRegion = detail.majorRegions.some((r) =>
      topRegionNames.some((name) => r.includes(name.replace(/특별자치도|광역시|특별시|도/, "")))
    );
    if (isInRegion) {
      regionCropIds.add(detail.id);
    }
  }

  // 점수화
  const scored = CROPS.map((crop) => {
    let score = 0;
    const reasons: string[] = [];

    // 카테고리 매치
    if (preferredCategories.length > 0 && preferredCategories.includes(crop.category)) {
      score += 5;
      reasons.push(`선호 카테고리(${crop.category})`);
    } else if (preferredCategories.length === 0) {
      score += 2; // 선호 미지정이면 약간의 기본 점수
    }

    // 지역 매치
    if (regionCropIds.has(crop.id)) {
      score += 4;
      reasons.push("추천 지역에서 재배 적합");
    }

    // 난이도 매치
    if (experience === "none" && crop.difficulty === "쉬움") {
      score += 3;
      reasons.push("초보자 적합 난이도");
    } else if (experience === "some" && crop.difficulty !== "어려움") {
      score += 2;
      reasons.push(`난이도 ${crop.difficulty}`);
    } else if (experience === "experienced") {
      score += 1;
    }

    return { crop, score, reasons };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return scored.map((s) => ({ crop: s.crop, reasons: s.reasons }));
}
