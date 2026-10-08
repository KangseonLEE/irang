"use client";

import { Info, Tractor } from "lucide-react";
import { DataSource } from "@/components/ui/data-source";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./modals.module.css";

/** 농가 통계 기준 연도 — 농림어업총조사(5년 주기). scripts/collect-farms.ts YEAR 와 같은 값 */
const FARM_CENSUS_YEAR = 2025;

interface FarmHouseholdModalProps {
  sigunguName: string;
  provinceShortName: string;
  farm: {
    farmCount: number;
    farmPopulation: number;
    avgPopulation: number;
    isFallback: boolean;
  };
  /** 시도 합산 가구당 평균 농가인구 */
  sidoAvgPopulation: number | null;
  /** 시도 평균 대비 차이(%, 양수=많음) */
  ratioVsSido: number | null;
}

export function FarmHouseholdModal({
  sigunguName,
  provinceShortName,
  farm,
  sidoAvgPopulation,
  ratioVsSido,
}: FarmHouseholdModalProps) {
  const isAboveAverage = ratioVsSido !== null && ratioVsSido > 0;
  const sigunguBarPct = sidoAvgPopulation
    ? Math.min(100, (farm.avgPopulation / Math.max(sidoAvgPopulation, farm.avgPopulation)) * 100)
    : 100;
  const sidoBarPct = sidoAvgPopulation
    ? Math.min(100, (sidoAvgPopulation / Math.max(sidoAvgPopulation, farm.avgPopulation)) * 100)
    : 100;

  return (
    <div className={s.modalContent}>
      {/* 핵심 지표 그리드 */}
      <div className={s.statGrid}>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>농가 수</span>
          <span className={s.statItemValue}>
            {farm.farmCount.toLocaleString()}호
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>농가 인구</span>
          <span className={s.statItemValue}>
            {farm.farmPopulation.toLocaleString()}명
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>가구당 평균</span>
          <span className={s.statItemValue}>
            {farm.avgPopulation.toFixed(1)}명
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>{provinceShortName} 평균</span>
          <span className={s.statItemValue}>
            {sidoAvgPopulation
              ? `${sidoAvgPopulation.toFixed(1)}명`
              : "—"}
          </span>
        </div>
      </div>

      {/* 시도 평균 대비 — 인라인 비교 바 */}
      {sidoAvgPopulation !== null && ratioVsSido !== null && (
        <div className={s.compareBox}>
          <div className={s.compareHeader}>
            <span className={s.compareTitle}>
              <Tractor size={14} aria-hidden="true" />
              가구당 농가인구 비교
            </span>
            <span
              className={`${s.compareDelta} ${isAboveAverage ? s.deltaUp : s.deltaDown}`}
            >
              {provinceShortName} 평균 대비 {ratioVsSido > 0 ? "+" : ""}
              {ratioVsSido}%
            </span>
          </div>
          <div className={s.compareRow}>
            <span className={s.compareLabel}>{sigunguName}</span>
            <div className={s.compareTrack}>
              <div
                className={`${s.compareBar} ${s.compareBarPrimary}`}
                style={{ width: `${sigunguBarPct}%` }}
              />
            </div>
            <span className={s.compareValue}>
              {farm.avgPopulation.toFixed(1)}명
            </span>
          </div>
          <div className={s.compareRow}>
            <span className={s.compareLabel}>
              {provinceShortName} 평균
            </span>
            <div className={s.compareTrack}>
              <div
                className={`${s.compareBar} ${s.compareBarMuted}`}
                style={{ width: `${sidoBarPct}%` }}
              />
            </div>
            <span className={s.compareValue}>
              {sidoAvgPopulation.toFixed(1)}명
            </span>
          </div>
        </div>
      )}

      {/* 해석 안내 */}
      <div className={s.notice}>
        <Info size={16} className={s.noticeIcon} aria-hidden="true" />
        {/* .notice 가 flex 라 AutoGlossary 가 쪼갠 [글자, '10a' 툴팁, 글자]가 각각 칸이 돼 문장이 세 칸으로 갈라졌다 — 문단으로 감싼다 (10/8 QA) */}
        <p className={s.noticeText}>
          <AutoGlossary
            text={`농가는 경지를 10a(약 300평) 이상 짓거나, 지난 1년 동안 농축산물을 120만 원어치 이상 팔았거나, 120만 원어치 이상의 가축을 기르는 가구예요. 가구원 수가 많을수록 가족농 비중이 높고, 적을수록 1~2인 고령 농가 비중이 높은 편이에요.`}
            maxHighlights={2}
          />
        </p>
      </div>

      {/* 기준 시점 안내 — 2025 총조사(2025-12-01 기준, 2026-09-29 확정 공표)는 조사 명부에 농지대장 같은 행정자료를
          더해 2020 값과 바로 비교하면 안 된다(공표 일러두기). 화면에 2020→2025 증감은 보이지 않는다 (10/8) */}
      <p className={s.summary}>
        {FARM_CENSUS_YEAR}년 농림어업총조사 값이에요(2025년 12월 1일 기준). 5년마다 조사하는 통계라 지금과 다를 수 있어요. 2025년 조사부터 농지대장 같은 행정자료로 조사 대상이 넓어져 2020년 값과 바로 비교하기는 어려워요.
      </p>

      <DataSource source={`국가데이터처 KOSIS · 농림어업총조사 ${FARM_CENSUS_YEAR} 확정 (5년 주기)`} />
    </div>
  );
}
