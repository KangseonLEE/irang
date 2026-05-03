"use client";

import { Info, Tractor } from "lucide-react";
import { DataSource } from "@/components/ui/data-source";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./modals.module.css";

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
        <AutoGlossary
          text={`농가는 영농·축산을 주업으로 하는 가구를 뜻해요. 가구원수가 많을수록 가족농 비중이 높고, 적을수록 1~2인 고령 농가 비중이 높은 편이에요.`}
          maxHighlights={2}
        />
      </div>

      {farm.isFallback && (
        <p className={s.summary}>
          최신 데이터 호출에 실패해 정적 폴백 값으로 표시했어요.
        </p>
      )}

      <DataSource source="통계청 SGIS · 농림어업총조사 2020 (5년 주기)" />
    </div>
  );
}
