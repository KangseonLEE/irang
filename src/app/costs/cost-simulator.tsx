"use client";

import { useState, useEffect, useRef } from "react";
import { PiggyBank } from "lucide-react";
import { CROPS } from "@/lib/data/crops";
import {
  SelectCombobox,
  type SelectComboboxOption,
} from "@/components/ui/select-combobox";
import { youthSettlementTotalManwon, type CostTypeId } from "@/lib/data/landing";
import { investmentByAge, settlementSurvey } from "@/lib/data/stats";
import { cropCostRow, type CropCost } from "@/lib/data/cost-by-type";
import {
  RETURN_FARM_LOAN,
  YOUTH_SETTLEMENT,
  POLICY_TEXT,
  formatManwon,
} from "@/lib/data/policy-facts";
import s from "./cost-simulator.module.css";

/* ────────────────────────────────────────────────────────────────
   계산 근거 (10/10 전면 정정)
   - 투자액: 농식품부 2025 귀농귀촌 실태조사 연령별 투자액(농지·가축·시설, stats.ts investmentByAge)
   - 초기·추가 투자 비율: 같은 조사 귀농 가구 전체 "초기 투자 89.6%, 추가 투자 10.4%"
   - 소득: 작물 상세(crops.ts)의 공식 통계 10a당 소득(경영비 차감) × 고른 면적
   - 지원: policy-facts.ts (영농정착지원금·농업창업자금)

   지운 것 — 원문이 없었다: 규모 계수 12개(소·중·대 0.6·1.0·1.8, 스마트팜 0.5·2.5·6.0 등), 영농 준비비 5,263만·
   생활 정착비 956만 원 분할, 청년 영농비 6,567만 원(= 8,209 × 근거 없는 80%), 작물 월 소득 손 입력표 34종과
   표에 없는 작물 26종의 월 100만 원(청년 200만 원) 기본값, 임산물·스마트팜 작물 월 소득·예시 보조금(1,500·4,000만 원).
   공식 소득 통계가 없는 작물은 고를 수 없게 했다.
   ──────────────────────────────────────────────────────────────── */

/** 1,000평 = 3,305.8㎡ = 10a(1,000㎡) × 3.3058 */
const PYEONG_TO_10A = 3.3058 / 1000;

const AREA_OPTIONS = [1000, 3000, 5000] as const;
type AreaPyeong = (typeof AREA_OPTIONS)[number];

/** 연 소득으로 바로 곱할 수 없는 기준(여러 해 한 번 수확한 합계·1기작)은 계산에서 뺀다 */
const NOT_ANNUAL_BASIS = /기작|합계/;

/** 공식 통계 10a당 소득이 있는 작물만 — 작물 상세가 갱신되면 따라 바뀐다 */
const SIMULATOR_CROPS: CropCost[] = CROPS.map((c) => cropCostRow(c.id))
  .filter((r): r is CropCost => r !== null)
  .filter((r) => r.incomeManwon10a !== null && !NOT_ANNUAL_BASIS.test(r.basis ?? ""));

const CROP_SELECT_OPTIONS: SelectComboboxOption[] = SIMULATOR_CROPS.map((crop) => {
  const emoji = CROPS.find((c) => c.id === crop.cropPageId)?.emoji ?? "";
  return { value: crop.cropPageId, label: `${emoji} ${crop.name}`.trim(), hint: crop.basis };
});

const DEFAULT_CROP: Record<"farming" | "youth", string> = {
  farming: "sweet-potato",
  youth: "strawberry",
};

const youthAgeLabel = investmentByAge[0].age;

const man = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}만 원`;

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
  /** 비용 가이드 카테고리 — 시뮬레이터는 귀농·청년농에서만 보인다(실태조사 투자액이 있는 유형) */
  type?: CostTypeId;
}

export default function CostSimulator({ type = "farming" }: Props) {
  const safeType: "farming" | "youth" = type === "youth" ? "youth" : "farming";

  const [age, setAge] = useState(safeType === "youth" ? youthAgeLabel : "40대");
  const [cropId, setCropId] = useState(
    SIMULATOR_CROPS.some((c) => c.cropPageId === DEFAULT_CROP[safeType])
      ? DEFAULT_CROP[safeType]
      : (SIMULATOR_CROPS[0]?.cropPageId ?? ""),
  );
  const [area, setArea] = useState<AreaPyeong>(3000);

  const ageRow = investmentByAge.find((d) => d.age === age) ?? investmentByAge[0];
  const totalCost = ageRow.amount;
  const initialPct = settlementSurvey.initialInvestmentShare;
  const laterPct = Number((100 - initialPct).toFixed(1));
  const initialCost = (totalCost * initialPct) / 100;
  const laterCost = totalCost - initialCost;

  const crop = SIMULATOR_CROPS.find((c) => c.cropPageId === cropId) ?? SIMULATOR_CROPS[0];
  const units = area * PYEONG_TO_10A;
  const [lo, hi] = crop?.incomeManwon10a ?? [0, 0];
  const incomeLo = lo * units;
  const incomeHi = hi * units;
  const incomeLabel =
    Math.round(incomeLo) === Math.round(incomeHi)
      ? `약 ${man(incomeLo)}`
      : `약 ${Math.round(incomeLo).toLocaleString("ko-KR")}~${man(incomeHi)}`;

  const isYouthAge = age === youthAgeLabel;
  const [youthMin, youthMax] = YOUTH_SETTLEMENT.ageRange.value;

  const animatedTotal = useCountUp(totalCost);

  return (
    <div className={s.wrapper}>
      {/* 입력 패널 */}
      <div className={s.inputPanel}>
        <div className={s.inputGroup}>
          <label className={s.inputLabel}>연령대</label>
          <div className={s.pillGroup}>
            {investmentByAge.map((opt) => (
              <button
                key={opt.age}
                className={`${s.pill} ${age === opt.age ? s.pillActive : ""}`}
                onClick={() => setAge(opt.age)}
                type="button"
                aria-pressed={age === opt.age}
              >
                {opt.age}
              </button>
            ))}
          </div>
        </div>

        <div className={s.inputGroup}>
          <label className={s.inputLabel} id="crop-select-label">
            작물 선택
          </label>
          <SelectCombobox
            className={s.cropSelect}
            value={cropId}
            onChange={setCropId}
            options={CROP_SELECT_OPTIONS}
            labelledBy="crop-select-label"
          />
        </div>

        <div className={s.inputGroup}>
          <label className={s.inputLabel}>재배 면적</label>
          <div className={s.pillGroup}>
            {AREA_OPTIONS.map((opt) => (
              <button
                key={opt}
                className={`${s.pill} ${area === opt ? s.pillActive : ""}`}
                onClick={() => setArea(opt)}
                type="button"
                aria-pressed={area === opt}
              >
                {opt.toLocaleString("ko-KR")}평
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className={s.divider} />

      {/* 결과 패널 */}
      <div className={s.resultPanel}>
        <div className={s.heroNumber}>
          <span className={s.heroLabel}>{ageRow.age} 귀농 가구 평균 투자액</span>
          <span className={s.heroValue}>
            {animatedTotal.toLocaleString("ko-KR")}
            <span className={s.heroUnit}>만 원</span>
          </span>
        </div>

        <div className={s.stackBarWrap}>
          <div
            className={s.stackBar}
            role="img"
            aria-label={`정착 초기 투자 ${initialPct}%, 추가 투자 ${laterPct}%`}
          >
            <div className={s.stackBarFarming} style={{ width: `${initialPct}%` }} />
            <div className={s.stackBarLiving} style={{ width: `${laterPct}%` }} />
          </div>
          <div className={s.stackBarLegend}>
            <span className={s.legendItem}>
              <span className={`${s.legendDot} ${s.legendDotFarming}`} aria-hidden="true" />
              정착 초기 {initialPct}%
            </span>
            <span className={s.legendItem}>
              <span className={`${s.legendDot} ${s.legendDotLiving}`} aria-hidden="true" />
              추가 투자 {laterPct}%
            </span>
          </div>
        </div>

        <div className={s.resultCards}>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>정착 초기 투자</span>
            <span className={s.resultCardValue}>약 {man(initialCost)}</span>
            <span className={s.resultCardSub}>농지·가축·시설</span>
          </div>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>추가 투자</span>
            <span className={s.resultCardValue}>약 {man(laterCost)}</span>
            <span className={s.resultCardSub}>정착 이후</span>
          </div>
          <div className={s.resultCard}>
            <span className={s.resultCardLabel}>연 예상 소득</span>
            <span className={s.resultCardValue}>{incomeLabel}</span>
            <span className={s.resultCardSub}>
              {crop?.name} {area.toLocaleString("ko-KR")}평 · 10a당 {crop?.income}
            </span>
          </div>
        </div>

        {/* 지원 안내 — 보조금을 투자액에서 빼 '실질 부담'을 만들지 않는다(조건부 지원이라 10/10 정정) */}
        <div className={s.supportSection}>
          <span className={s.supportTitle}>
            <PiggyBank size={16} aria-hidden="true" />
            {isYouthAge ? "영농정착지원금 활용 시" : "농업창업자금 융자 활용 가능"}
          </span>
          <p className={s.supportDesc}>
            {isYouthAge
              ? `만 ${youthMin}~${youthMax}세 청년 창업농으로 선발되면 ${POLICY_TEXT.youthMonthly}을 받아요 (매년 감액)`
              : `농지·시설·장비 구입에 최대 ${formatManwon(RETURN_FARM_LOAN.startupMaxManwon.value)}을 ${RETURN_FARM_LOAN.interestRate.value} 금리로 융자받을 수 있어요 (${RETURN_FARM_LOAN.repayment.value})`}
          </p>
          <span className={s.supportSaved}>
            {isYouthAge
              ? `3년간 최대 ${formatManwon(youthSettlementTotalManwon)} 보조금`
              : "융자라 갚아야 하는 돈이에요"}
          </span>
        </div>

        <p className={s.disclaimer}>
          * 투자액은 농림축산식품부 {settlementSurvey.year} 귀농귀촌 실태조사의 연령대별 평균이라 면적과 작물에 따라 달라지지
          않아요. 소득은 {crop?.source}의 10a당 소득(경영비를 뺀 값)에 면적을 곱한 값이에요. 처음부터 이만큼 버는 건
          아니고, 지역·시설·경험에 따라 달라요.
        </p>
      </div>
    </div>
  );
}
