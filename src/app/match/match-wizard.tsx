"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MapPin,
  Sprout,
  Sun,
  Snowflake,
  CloudSun,
  Building2,
  Trees,
  Truck,
  Heart,
  ShoppingBag,
  Leaf,
  Apple,
  Wheat,
  Flower2,
  Home,
  Users,
  Mountain,
  RotateCcw,
} from "lucide-react";
import { PROVINCES, type Province } from "@/lib/data/regions";
import { CROPS, CROP_DETAILS, type CropInfo } from "@/lib/data/crops";
import s from "./match-wizard.module.css";

/* ── 질문 정의 ── */

interface Option {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  description?: string;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: Option[];
  multiple?: boolean; // 복수 선택 허용
}

const QUESTIONS: Question[] = [
  {
    id: "climate",
    title: "어떤 기후를 선호하시나요?",
    subtitle: "귀농 후 생활할 지역의 기후 조건",
    options: [
      {
        id: "warm",
        label: "온화한 기후",
        icon: Sun,
        description: "겨울이 짧고 따뜻한 남해안·제주 지역",
      },
      {
        id: "four-season",
        label: "사계절 뚜렷",
        icon: CloudSun,
        description: "봄·여름·가을·겨울이 확실한 중부 지역",
      },
      {
        id: "cool",
        label: "서늘한 기후",
        icon: Snowflake,
        description: "여름이 시원하고 겨울이 긴 산간·고랭지",
      },
    ],
  },
  {
    id: "priority",
    title: "가장 중요하게 생각하는 것은?",
    subtitle: "우선순위에 따라 추천 지역이 달라집니다",
    multiple: true,
    options: [
      {
        id: "nature",
        label: "자연환경",
        icon: Trees,
        description: "깨끗한 공기와 아름다운 자연",
      },
      {
        id: "access",
        label: "교통 접근성",
        icon: Truck,
        description: "도시와의 거리, 교통 편리성",
      },
      {
        id: "support",
        label: "지원 혜택",
        icon: Heart,
        description: "귀농 보조금, 주택·교육 지원",
      },
      {
        id: "market",
        label: "소비 시장",
        icon: ShoppingBag,
        description: "농산물 판로와 직거래 기회",
      },
    ],
  },
  {
    id: "crop-type",
    title: "관심 있는 작물 유형은?",
    subtitle: "재배하고 싶은 작물 카테고리를 골라주세요",
    multiple: true,
    options: [
      {
        id: "grain",
        label: "식량작물",
        icon: Wheat,
        description: "쌀, 콩, 감자 등 기본 식량",
      },
      {
        id: "vegetable",
        label: "채소",
        icon: Leaf,
        description: "고추, 마늘, 배추, 양파 등",
      },
      {
        id: "fruit",
        label: "과수",
        icon: Apple,
        description: "사과, 딸기, 포도, 감귤 등",
      },
      {
        id: "special",
        label: "특용작물",
        icon: Flower2,
        description: "인삼, 약용작물, 녹차 등",
      },
    ],
  },
  {
    id: "lifestyle",
    title: "선호하는 생활 환경은?",
    subtitle: "귀농 후의 일상을 떠올려 보세요",
    options: [
      {
        id: "near-city",
        label: "도시 근교",
        icon: Building2,
        description: "도시 인프라를 유지하며 주말 농업",
      },
      {
        id: "moderate",
        label: "적당한 거리",
        icon: Home,
        description: "읍·면 단위, 생활 인프라 기본 보유",
      },
      {
        id: "rural",
        label: "완전한 농촌",
        icon: Mountain,
        description: "인구 밀도 낮은 조용한 산촌·어촌",
      },
    ],
  },
  {
    id: "experience",
    title: "농업 경험이 있으신가요?",
    subtitle: "경험 수준에 따라 적합한 작물 난이도가 달라집니다",
    options: [
      {
        id: "none",
        label: "경험 없음",
        icon: Users,
        description: "농업은 처음이에요",
      },
      {
        id: "some",
        label: "조금 있음",
        icon: Sprout,
        description: "텃밭·주말농장 경험이 있어요",
      },
      {
        id: "experienced",
        label: "경험 많음",
        icon: Trees,
        description: "본격적인 영농 경험이 있어요",
      },
    ],
  },
];

/* ── 스코어링 로직 ── */

type Answers = Record<string, string[]>;

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

interface ScoredProvince {
  province: Province;
  score: number;
  matchReasons: string[];
}

interface RecommendedCrop {
  crop: CropInfo;
  reasons: string[];
}

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

function scoreProvinces(answers: Answers): ScoredProvince[] {
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

  // Province 객체 매핑 + 정렬
  return PROVINCES.map((p) => ({
    province: p,
    score: scores[p.id]?.score ?? 0,
    matchReasons: Array.from(scores[p.id]?.reasons ?? []),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function recommendCrops(
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

/* ── 컴포넌트 ── */

export function MatchWizard() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const totalSteps = QUESTIONS.length;
  const progress = showResult
    ? 100
    : ((step + 1) / totalSteps) * 100;

  const handleSelect = useCallback(
    (optionId: string) => {
      const qId = currentQuestion.id;
      setAnswers((prev) => {
        const current = prev[qId] || [];
        if (currentQuestion.multiple) {
          // 토글
          const next = current.includes(optionId)
            ? current.filter((id) => id !== optionId)
            : [...current, optionId];
          return { ...prev, [qId]: next };
        }
        // 단일 선택 → 자동 다음
        return { ...prev, [qId]: [optionId] };
      });

      // 단일 선택: 자동으로 다음 단계
      if (!currentQuestion.multiple) {
        setTimeout(() => {
          if (step < totalSteps - 1) {
            setStep((s) => s + 1);
          } else {
            setShowResult(true);
          }
        }, 250);
      }
    },
    [currentQuestion, step, totalSteps]
  );

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      setShowResult(true);
    }
  }, [step, totalSteps]);

  const handleBack = useCallback(() => {
    if (showResult) {
      setShowResult(false);
    } else if (step > 0) {
      setStep((s) => s - 1);
    }
  }, [step, showResult]);

  const handleReset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  }, []);

  // 결과 계산
  const topProvinces = useMemo(
    () => (showResult ? scoreProvinces(answers) : []),
    [showResult, answers]
  );

  const recommendedCrops = useMemo(
    () => (showResult ? recommendCrops(answers, topProvinces) : []),
    [showResult, answers, topProvinces]
  );

  const selectedForCurrent = answers[currentQuestion?.id] || [];

  /* ── 결과 화면 ── */
  if (showResult) {
    return (
      <div className={s.page}>
        <div className={s.resultHeader}>
          <span className={s.resultOverline}>추천 결과</span>
          <h1 className={s.resultTitle}>
            당신에게 맞는 귀농 지역을 찾았습니다
          </h1>
          <p className={s.resultDesc}>
            답변을 기반으로 가장 적합한 지역과 작물을 추천해 드립니다.
          </p>
        </div>

        {/* 추천 지역 */}
        <section className={s.resultSection}>
          <h2 className={s.resultSectionTitle}>
            <MapPin size={18} />
            추천 지역 Top 3
          </h2>
          <div className={s.resultCards}>
            {topProvinces.map((sp, i) => (
              <Link
                key={sp.province.id}
                href={`/regions/${sp.province.id}`}
                className={s.resultCard}
              >
                <div className={s.resultCardRank}>
                  {i + 1}
                </div>
                <div className={s.resultCardBody}>
                  <h3 className={s.resultCardTitle}>{sp.province.shortName}</h3>
                  <p className={s.resultCardDesc}>
                    {sp.province.description}
                  </p>
                  {sp.matchReasons.length > 0 && (
                    <div className={s.resultCardTags}>
                      {sp.matchReasons.slice(0, 4).map((r) => (
                        <span key={r} className={s.resultCardTag}>
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className={s.resultCardLink}>
                    상세 보기 <ChevronRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 추천 작물 */}
        <section className={s.resultSection}>
          <h2 className={s.resultSectionTitle}>
            <Sprout size={18} />
            추천 작물
          </h2>
          <div className={s.cropCards}>
            {recommendedCrops.map((rc) => (
              <Link
                key={rc.crop.id}
                href={`/crops/${rc.crop.id}`}
                className={s.cropCard}
              >
                <span className={s.cropEmoji}>{rc.crop.emoji}</span>
                <div className={s.cropCardBody}>
                  <span className={s.cropName}>{rc.crop.name}</span>
                  <span className={s.cropMeta}>
                    {rc.crop.category} · 난이도 {rc.crop.difficulty}
                  </span>
                  {rc.reasons.length > 0 && (
                    <span className={s.cropReason}>
                      {rc.reasons.join(" · ")}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className={s.cropArrow} />
              </Link>
            ))}
          </div>
        </section>

        {/* 액션 버튼 */}
        <div className={s.resultActions}>
          <button onClick={handleReset} className={s.resetBtn}>
            <RotateCcw size={16} />
            다시 시작하기
          </button>
          <Link href="/regions" className={s.exploreBtn}>
            전체 지역 탐색
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  /* ── 질문 화면 ── */
  return (
    <div className={s.page}>
      {/* 진행 바 */}
      <div className={s.progressWrap}>
        <div className={s.progressBar}>
          <div
            className={s.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={s.progressLabel}>
          {step + 1} / {totalSteps}
        </span>
      </div>

      {/* 질문 */}
      <div className={s.questionWrap}>
        <h1 className={s.questionTitle}>{currentQuestion.title}</h1>
        <p className={s.questionSubtitle}>{currentQuestion.subtitle}</p>

        <div className={s.optionsGrid}>
          {currentQuestion.options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedForCurrent.includes(opt.id);
            return (
              <button
                key={opt.id}
                className={`${s.optionCard} ${isSelected ? s.optionSelected : ""}`}
                onClick={() => handleSelect(opt.id)}
                type="button"
              >
                <div className={s.optionIcon}>
                  <Icon size={24} />
                </div>
                <span className={s.optionLabel}>{opt.label}</span>
                {opt.description && (
                  <span className={s.optionDesc}>{opt.description}</span>
                )}
                {currentQuestion.multiple && (
                  <div
                    className={`${s.optionCheck} ${isSelected ? s.optionCheckActive : ""}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className={s.navBar}>
        <button
          onClick={handleBack}
          disabled={step === 0}
          className={s.navBtnBack}
          type="button"
        >
          <ArrowLeft size={16} />
          이전
        </button>

        {currentQuestion.multiple && (
          <button
            onClick={handleNext}
            disabled={selectedForCurrent.length === 0}
            className={s.navBtnNext}
            type="button"
          >
            {step < totalSteps - 1 ? "다음" : "결과 보기"}
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
