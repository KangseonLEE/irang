"use client";

import { useState, useEffect, useRef } from "react";
import { PiggyBank } from "lucide-react";
import { CROPS } from "@/lib/data/crops";
import type { CostTypeId } from "@/lib/data/landing";
import s from "./cost-simulator.module.css";

/* ────────────────────────────────────────────────────────────────
   계산 상수 — 카테고리별 (출처: 농진청 표준소득자료집·실태조사)

   - farming: 귀농실태조사 2023 평균 (만원)
   - youth: 30대 이하 귀농인 평균 + 청년 우대금리 융자
   - forestry: 산림청 임업경영실태조사 + 임산물 표준소득
   - smartfarm: 농진청 ICT 시설 단가 (1,000㎡ 기준)
   ──────────────────────────────────────────────────────────────── */

interface BaseCost {
  farming: number; // 영농 준비비 (만원)
  living: number; // 생활 정착비 (만원)
}

const BASE_COSTS_BY_TYPE: Record<Exclude<CostTypeId, "village">, BaseCost> = {
  farming: { farming: 5263, living: 956 }, // 귀농 평균 6,219
  youth: { farming: 6567, living: 1642 }, // 30대 이하 평균 8,209 (영농 80% 비중)
  forestry: { farming: 4000, living: 1000 }, // 임산물 시설 + 정착
  smartfarm: { farming: 8000, living: 1000 }, // 비닐+ICT 1,000㎡ 평균
};

type AgeGroup = "30대" | "40대" | "50대";
type ScaleKey = "small" | "medium" | "large";

const AGE_OPTIONS: AgeGroup[] = ["30대", "40대", "50대"];

/* ── 카테고리별 규모 옵션 ── */
interface ScaleOption {
  key: ScaleKey;
  label: string;
  detail: string;
}

const SCALE_OPTIONS_BY_TYPE: Record<
  Exclude<CostTypeId, "village">,
  ScaleOption[]
> = {
  farming: [
    { key: "small", label: "소규모", detail: "1,000평" },
    { key: "medium", label: "중규모", detail: "3,000평" },
    { key: "large", label: "대규모", detail: "5,000평" },
  ],
  youth: [
    { key: "small", label: "소규모", detail: "1,000평" },
    { key: "medium", label: "중규모", detail: "3,000평" },
    { key: "large", label: "대규모", detail: "5,000평" },
  ],
  forestry: [
    { key: "small", label: "소규모 임야", detail: "1ha" },
    { key: "medium", label: "중규모 임야", detail: "3ha" },
    { key: "large", label: "대규모 임야", detail: "5ha" },
  ],
  smartfarm: [
    { key: "small", label: "비닐하우스", detail: "1,000㎡" },
    { key: "medium", label: "유리온실", detail: "1,000㎡" },
    { key: "large", label: "식물공장", detail: "1,000㎡" },
  ],
};

/* ── 카테고리·규모별 계수 ── */
const SCALE_FACTOR_BY_TYPE: Record<
  Exclude<CostTypeId, "village">,
  Record<ScaleKey, number>
> = {
  farming: { small: 0.6, medium: 1.0, large: 1.8 },
  youth: { small: 0.6, medium: 1.0, large: 1.8 },
  forestry: { small: 0.5, medium: 1.0, large: 2.0 },
  smartfarm: { small: 0.5, medium: 2.5, large: 6.0 }, // 비닐 → 유리 → 식물공장
};

/* ── 연령별 지원금 ──
   kind 구분:
   - "grant": 정부 보조금 (상환 의무 없음 → 실질 부담 차감)
   - "loan_info": 저금리 융자 안내 (상환 의무 있음 → 절감액 아님, 안내만) */
const SUPPORT_BY_AGE: Record<
  AgeGroup,
  { label: string; amount: number; desc: string; kind: "grant" | "loan_info" }
> = {
  "30대": {
    label: "청년창업농",
    amount: 3600,
    kind: "grant",
    desc: "월 110·100·90만 원 × 3년 (매년 감액)",
  },
  "40대": {
    label: "농업창업자금 융자",
    amount: 0,
    kind: "loan_info",
    desc: "최대 3억 원을 연 2% 저금리로 융자 활용 가능 (상환 의무 있음)",
  },
  "50대": {
    label: "농업창업자금 융자",
    amount: 0,
    kind: "loan_info",
    desc: "최대 3억 원을 연 2% 저금리로 융자 활용 가능 (상환 의무 있음)",
  },
};

/* ── 카테고리별 추가 지원금 (영농정착·시설보조 등) ──
   주의: youth는 SUPPORT_BY_AGE["30대"]가 이미 청년창업농 영농정착지원금(3,960만)을
   포함하므로 별도 EXTRA를 두지 않아 중복 계산을 방지. */
const EXTRA_SUPPORT_BY_TYPE: Record<
  Exclude<CostTypeId, "village">,
  { label: string; amount: number; desc: string } | null
> = {
  farming: null,
  youth: null,
  forestry: {
    label: "임산물 시설 보조",
    amount: 1500,
    desc: "산림청 시설 보조 50%",
  },
  smartfarm: {
    label: "스마트팜 시설 보조",
    amount: 4000,
    desc: "농진청 시설비 50% 보조",
  },
};

/* ────────────────────────────────────────────────────────────────
   작물 옵션 (카테고리별)
   소득은 농진청 표준소득자료집 기반 추정 — 만원/월
   ──────────────────────────────────────────────────────────────── */

interface CropOption {
  id: string;
  name: string;
  emoji: string;
  /** 월 평균 소득 (만원) */
  monthlyIncome: number;
}

const CROP_INCOME_ESTIMATE: Record<string, number> = {
  rice: 48,
  soybean: 36,
  "sweet-potato": 83,
  potato: 79,
  corn: 43,
  "chili-pepper": 246,
  "napa-cabbage": 142,
  garlic: 95,
  onion: 125,
  lettuce: 105,
  apple: 427,
  pear: 360,
  grape: 393,
  peach: 220,
  persimmon: 131,
  citrus: 188,
  strawberry: 426,
  tomato: 325,
  cucumber: 450,
  pepper: 280,
  watermelon: 250,
  melon: 280,
  ginseng: 480,
  mushroom: 350,
  sesame: 55,
  perilla: 65,
  blueberry: 380,
  cherry: 300,
  plum: 160,
  fig: 210,
  mango: 400,
  arugula: 150,
  jujube: 180,
  chestnut: 120,
};

/** 임산물 추정 월 소득 (산림청 임산물 표준소득 기반) */
const FOREST_CROP_OPTIONS: CropOption[] = [
  { id: "shiitake-log", name: "표고 (원목)", emoji: "🍄", monthlyIncome: 80 },
  { id: "wild-ginseng", name: "산양삼", emoji: "🌿", monthlyIncome: 50 },
  { id: "bellflower", name: "도라지", emoji: "🌱", monthlyIncome: 35 },
  { id: "chestnut", name: "밤", emoji: "🌰", monthlyIncome: 60 },
  { id: "omija", name: "오미자", emoji: "🍒", monthlyIncome: 70 },
  { id: "walnut", name: "호두", emoji: "🥜", monthlyIncome: 55 },
];

/** 스마트팜 작물 (ICT 시설 기준, 월 소득 ↑) */
const SMARTFARM_CROP_OPTIONS: CropOption[] = [
  { id: "strawberry", name: "딸기 (ICT)", emoji: "🍓", monthlyIncome: 600 },
  { id: "tomato", name: "토마토 (ICT)", emoji: "🍅", monthlyIncome: 450 },
  { id: "paprika", name: "파프리카 (유리온실)", emoji: "🫑", monthlyIncome: 700 },
  { id: "rose", name: "장미 (화훼)", emoji: "🌹", monthlyIncome: 500 },
  { id: "lettuce-hydro", name: "엽채 (수경)", emoji: "🥬", monthlyIncome: 350 },
];

/** 청년농 인기 작물 (시설 위주) */
const YOUTH_CROP_IDS = [
  "strawberry",
  "tomato",
  "blueberry",
  "ginseng",
  "chili-pepper",
  "cucumber",
  "apple",
  "grape",
];

function buildFarmingCropOptions(): CropOption[] {
  return CROPS.map((crop) => ({
    id: crop.id,
    name: crop.name,
    emoji: crop.emoji,
    monthlyIncome: CROP_INCOME_ESTIMATE[crop.id] ?? 100,
  }));
}

function buildYouthCropOptions(): CropOption[] {
  return CROPS.filter((c) => YOUTH_CROP_IDS.includes(c.id)).map((crop) => ({
    id: crop.id,
    name: crop.name,
    emoji: crop.emoji,
    monthlyIncome: CROP_INCOME_ESTIMATE[crop.id] ?? 200,
  }));
}

const CROP_OPTIONS_BY_TYPE: Record<
  Exclude<CostTypeId, "village">,
  CropOption[]
> = {
  farming: buildFarmingCropOptions(),
  youth: buildYouthCropOptions(),
  forestry: FOREST_CROP_OPTIONS,
  smartfarm: SMARTFARM_CROP_OPTIONS,
};

/* ────────────────────────────────────────────────────────────────
   카운트업 훅
   ──────────────────────────────────────────────────────────────── */

function useCountUp(target: number, duration = 600): number {
  const [current, setCurrent] = useState(target);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const fromRef = useRef<number>(target);

  useEffect(() => {
    fromRef.current = current;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(
        fromRef.current + (target - fromRef.current) * eased,
      );
      setCurrent(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return current;
}

/* ────────────────────────────────────────────────────────────────
   컴포넌트
   ──────────────────────────────────────────────────────────────── */

interface Props {
  /** 비용 가이드 카테고리 */
  type?: CostTypeId;
}

export default function CostSimulator({ type = "farming" }: Props) {
  // village는 simulator 미노출 — 안전 fallback으로 farming 사용
  const safeType: Exclude<CostTypeId, "village"> =
    type === "village" ? "farming" : type;

  const baseCosts = BASE_COSTS_BY_TYPE[safeType];
  const scaleOptions = SCALE_OPTIONS_BY_TYPE[safeType];
  const scaleFactors = SCALE_FACTOR_BY_TYPE[safeType];
  const cropOptions = CROP_OPTIONS_BY_TYPE[safeType];
  const extraSupport = EXTRA_SUPPORT_BY_TYPE[safeType];

  const [age, setAge] = useState<AgeGroup>(safeType === "youth" ? "30대" : "40대");
  const [cropId, setCropId] = useState(cropOptions[0]?.id ?? "rice");
  const [scale, setScale] = useState<ScaleKey>("medium");

  const factor = scaleFactors[scale];
  const farmingCost = Math.round(baseCosts.farming * factor);
  const livingCost = Math.round(baseCosts.living * factor);
  const totalCost = farmingCost + livingCost;

  const support = SUPPORT_BY_AGE[age];
  // 청년농(30대)이면 영농정착 추가 적용
  const applyExtra =
    extraSupport && (safeType !== "youth" || age === "30대");
  const extraAmount = applyExtra ? extraSupport.amount : 0;
  // 보조금만 절감액으로 차감 (융자는 상환 의무가 있어 절감 아님)
  const grantAmount = support.kind === "grant" ? support.amount : 0;
  const totalSupport = grantAmount + extraAmount;
  const netCost = Math.max(0, totalCost - totalSupport);
  const isLoanOnly = support.kind === "loan_info" && !applyExtra;

  const selectedCrop = cropOptions.find((c) => c.id === cropId) ?? cropOptions[0];
  const monthlyIncome = selectedCrop?.monthlyIncome ?? 100;
  const scaledMonthlyIncome = Math.round(monthlyIncome * factor);

  const farmingPct = Math.round((farmingCost / totalCost) * 100);
  const livingPct = 100 - farmingPct;

  const animatedTotal = useCountUp(totalCost);

  /* 라벨 */
  const farmingLabel =
    safeType === "smartfarm"
      ? "시설·ICT 비용"
      : safeType === "forestry"
        ? "임야·시설 비용"
        : "영농 준비비";
  const farmingSub =
    safeType === "smartfarm"
      ? "하우스 + 환경제어 + 양액"
      : safeType === "forestry"
        ? "차광망 + 재배사 + 종묘"
        : "농지 + 시설 + 장비";
  const livingLabel = "생활 정착비";
  const livingSub = "주거 + 이사 + 생활";

  return (
    <div className={s.wrapper}>
      {/* 입력 패널 */}
      <div className={s.inputPanel}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>연령대</label>
          <div className={s.pillGroup}>
            {AGE_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`${s.pill} ${age === opt ? s.pillActive : ""}`}
                onClick={() => setAge(opt)}
                type="button"
                aria-pressed={age === opt}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className={s.inputGroup}>
          <label className={s.inputLabel} htmlFor="crop-select">
            {safeType === "smartfarm"
              ? "재배 작물"
              : safeType === "forestry"
                ? "임산물 선택"
                : "작물 선택"}
          </label>
          <select
            id="crop-select"
            className={s.select}
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
          >
            {cropOptions.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.emoji} {crop.name}
              </option>
            ))}
          </select>
        </div>

        <div className={s.inputGroup}>
          <label className={s.inputLabel}>
            {safeType === "smartfarm"
              ? "시설 종류"
              : safeType === "forestry"
                ? "임야 면적"
                : "재배 규모"}
          </label>
          <div className={s.pillGroup}>
            {scaleOptions.map((opt) => (
              <button
                key={opt.key}
                className={`${s.pill} ${scale === opt.key ? s.pillActive : ""}`}
                onClick={() => setScale(opt.key)}
                type="button"
                aria-pressed={scale === opt.key}
              >
                {opt.label} ({opt.detail})
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className={s.divider} />

      {/* 결과 패널 */}
      <div className={s.resultPanel}>
        <div className={s.heroNumber}>
          <span className={s.heroLabel}>예상 총 비용</span>
          <span className={s.heroValue}>
            {animatedTotal.toLocaleString()}
            <span className={s.heroUnit}>만 원</span>
          </span>
        </div>

        <div className={s.stackBarWrap}>
          <div
            className={s.stackBar}
            role="img"
            aria-label={`${farmingLabel} ${farmingPct}%, ${livingLabel} ${livingPct}%`}
          >
            <div
              className={s.stackBarFarming}
              style={{ width: `${farmingPct}%` }}
            />
            <div
              className={s.stackBarLiving}
              style={{ width: `${livingPct}%` }}
            />
          </div>
          <div className={s.stackBarLegend}>
            <span className={s.legendItem}>
              <span
                className={`${s.legendDot} ${s.legendDotFarming}`}
                aria-hidden="true"
              />
              {farmingLabel} {farmingPct}%
            </span>
            <span className={s.legendItem}>
              <span
                className={`${s.legendDot} ${s.legendDotLiving}`}
                aria-hidden="true"
              />
              {livingLabel} {livingPct}%
            </span>
          </div>
        </div>

        <div className={s.resultCards}>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>{farmingLabel}</span>
            <span className={s.resultCardValue}>
              {farmingCost.toLocaleString()}만 원
            </span>
            <span className={s.resultCardSub}>{farmingSub}</span>
          </div>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>{livingLabel}</span>
            <span className={s.resultCardValue}>
              {livingCost.toLocaleString()}만 원
            </span>
            <span className={s.resultCardSub}>{livingSub}</span>
          </div>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>월 예상 수입</span>
            <span className={s.resultCardValue}>
              ~{scaledMonthlyIncome.toLocaleString()}만 원
            </span>
            <span className={s.resultCardSub}>
              {selectedCrop?.emoji} {selectedCrop?.name} 기준
            </span>
          </div>
        </div>

        {/* 지원금 차감 — 보조금(grant)이 있을 때만 "절감" 표시. 융자만 있으면 안내만. */}
        <div className={s.supportSection}>
          <span className={s.supportTitle}>
            <PiggyBank size={16} aria-hidden="true" />
            {age} {support.label}
            {applyExtra && ` + ${extraSupport.label}`}
            {isLoanOnly ? " 활용 가능" : " 활용 시"}
          </span>
          <p className={s.supportDesc}>
            {support.desc}
            {applyExtra && ` · ${extraSupport.desc}`}
          </p>
          {isLoanOnly ? (
            <span className={s.supportSaved}>
              저금리 융자로 자기자본 부담 감소 (별도 상환)
            </span>
          ) : (
            <>
              <span className={s.supportSaved}>
                보조금 최대 {totalSupport.toLocaleString()}만 원 절감
              </span>
              <div className={s.supportNet}>
                <span className={s.supportNetLabel}>실질 부담</span>
                <span className={s.supportNetValue}>
                  {netCost.toLocaleString()}만 원
                </span>
              </div>
            </>
          )}
        </div>

        <p className={s.disclaimer}>
          * {safeType === "smartfarm"
            ? "농진청 ICT 시설 단가(1,000㎡)와 농식품부 혁신밸리 자료 기반 추정이에요."
            : safeType === "forestry"
              ? "산림청 임업경영실태조사·임산물 표준소득 기반 추정이에요."
              : "귀농실태조사 2023 평균과 농진청 표준소득자료집 기반 추정이에요."}
          {" "}실제 비용은 지역·시설·작물에 따라 달라요.
        </p>
      </div>
    </div>
  );
}
