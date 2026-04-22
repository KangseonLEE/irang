"use client";

import { useState, useEffect, useRef } from "react";
import { PiggyBank } from "lucide-react";
import { CROPS } from "@/lib/data/crops";
import s from "./cost-simulator.module.css";

/* ── 계산 상수 (귀농실태조사 2023 기준, 만원) ── */

const BASE_COSTS = {
  farming: 5263, // 영농 준비비 (84.6%)
  living: 956, // 생활 정착비 (15.4%)
};

type AgeGroup = "30대" | "40대" | "50대";
type ScaleKey = "small" | "medium" | "large";

const AGE_OPTIONS: AgeGroup[] = ["30대", "40대", "50대"];
const SCALE_OPTIONS: { key: ScaleKey; label: string; pyeong: string }[] = [
  { key: "small", label: "소규모", pyeong: "1,000평" },
  { key: "medium", label: "중규모", pyeong: "3,000평" },
  { key: "large", label: "대규모", pyeong: "5,000평" },
];

const SCALE_FACTOR: Record<ScaleKey, number> = {
  small: 0.6,
  medium: 1.0,
  large: 1.8,
};

const SUPPORT_BY_AGE: Record<
  AgeGroup,
  { label: string; amount: number; desc: string }
> = {
  "30대": { label: "청년창업농", amount: 3960, desc: "월 110만 원 x 3년" },
  "40대": { label: "귀농창업자금", amount: 3000, desc: "최대 3억 융자" },
  "50대": { label: "귀농창업자금", amount: 3000, desc: "최대 3억 융자" },
};

/* ── 작물 소득 파싱 ── */

interface CropOption {
  id: string;
  name: string;
  emoji: string;
  monthlyIncome: number; // 만원/월 (추정)
}

function buildCropOptions(): CropOption[] {
  // CROP_DETAILS의 income.revenueRange 필요 — 정적 import 대신 CROPS 기본 정보만 사용
  // 여기선 CROPS 기본 정보 + 추정 소득 사용
  return CROPS.map((crop) => ({
    id: crop.id,
    name: crop.name,
    emoji: crop.emoji,
    monthlyIncome: 200, // 기본값, 선택 시 조정
  }));
}

// 작물별 월 소득 추정 (주요 작물 기준, 만원)
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

const CROP_OPTIONS = buildCropOptions();

/* ── 카운트업 훅 ── */

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
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(
        fromRef.current + (target - fromRef.current) * eased
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

/* ── 컴포넌트 ── */

export default function CostSimulator() {
  const [age, setAge] = useState<AgeGroup>("40대");
  const [cropId, setCropId] = useState("rice");
  const [scale, setScale] = useState<ScaleKey>("medium");

  const factor = SCALE_FACTOR[scale];
  const farmingCost = Math.round(BASE_COSTS.farming * factor);
  const livingCost = Math.round(BASE_COSTS.living * factor);
  const totalCost = farmingCost + livingCost;

  const support = SUPPORT_BY_AGE[age];
  const netCost = Math.max(0, totalCost - support.amount);

  const monthlyIncome = CROP_INCOME_ESTIMATE[cropId] ?? 200;
  // 규모에 따라 소득 조정
  const scaledMonthlyIncome = Math.round(monthlyIncome * factor);

  const farmingPct = Math.round((farmingCost / totalCost) * 100);
  const livingPct = 100 - farmingPct;

  const animatedTotal = useCountUp(totalCost);

  const selectedCrop = CROP_OPTIONS.find((c) => c.id === cropId);

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
            작물 선택
          </label>
          <select
            id="crop-select"
            className={s.select}
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
          >
            {CROP_OPTIONS.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.emoji} {crop.name}
              </option>
            ))}
          </select>
        </div>

        <div className={s.inputGroup}>
          <label className={s.inputLabel}>재배 규모</label>
          <div className={s.pillGroup}>
            {SCALE_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={`${s.pill} ${scale === opt.key ? s.pillActive : ""}`}
                onClick={() => setScale(opt.key)}
                type="button"
                aria-pressed={scale === opt.key}
              >
                {opt.label} ({opt.pyeong})
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className={s.divider} />

      {/* 결과 패널 */}
      <div className={s.resultPanel}>
        {/* 히어로 넘버 */}
        <div className={s.heroNumber}>
          <span className={s.heroLabel}>예상 총 비용</span>
          <span className={s.heroValue}>
            {animatedTotal.toLocaleString()}
            <span className={s.heroUnit}>만 원</span>
          </span>
        </div>

        {/* 스택바 */}
        <div className={s.stackBarWrap}>
          <div className={s.stackBar} role="img" aria-label={`영농비 ${farmingPct}%, 생활비 ${livingPct}%`}>
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
              <span className={`${s.legendDot} ${s.legendDotFarming}`} aria-hidden="true" />
              영농 준비비 {farmingPct}%
            </span>
            <span className={s.legendItem}>
              <span className={`${s.legendDot} ${s.legendDotLiving}`} aria-hidden="true" />
              생활 정착비 {livingPct}%
            </span>
          </div>
        </div>

        {/* 3칸 카드 */}
        <div className={s.resultCards}>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>영농 준비비</span>
            <span className={s.resultCardValue}>
              {farmingCost.toLocaleString()}만 원
            </span>
            <span className={s.resultCardSub}>농지 + 시설 + 장비</span>
          </div>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>생활 정착비</span>
            <span className={s.resultCardValue}>
              {livingCost.toLocaleString()}만 원
            </span>
            <span className={s.resultCardSub}>주거 + 이사 + 생활</span>
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

        {/* 지원금 차감 */}
        <div className={s.supportSection}>
          <span className={s.supportTitle}>
            <PiggyBank size={16} aria-hidden="true" />
            {age} {support.label} 활용 시
          </span>
          <p className={s.supportDesc}>{support.desc}</p>
          <span className={s.supportSaved}>
            최대 {support.amount.toLocaleString()}만 원 절감
          </span>
          <div className={s.supportNet}>
            <span className={s.supportNetLabel}>실질 부담</span>
            <span className={s.supportNetValue}>
              {netCost.toLocaleString()}만 원
            </span>
          </div>
        </div>

        <p className={s.disclaimer}>
          * 귀농실태조사 2023 기준 평균치로, 실제 비용은 지역·작물·시설에 따라 달라요.
          수입은 농촌진흥청 농업소득자료집 기반 추정이에요.
        </p>
      </div>
    </div>
  );
}
