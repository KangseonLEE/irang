"use client";

import { Thermometer, Droplets, Sun } from "lucide-react";
import {
  getTemperatureTip,
  getPrecipitationTip,
  getSunshineTip,
} from "@/lib/climate-tips";
import s from "./climate-section.module.css";

// ── 공용 인터페이스 ──

export interface ClimateInfo {
  stnName: string;
  period: string;
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  totalPrecipitation: number;
  totalSunshine: number;
}

// ── Props ──

interface ClimateSectionProps {
  /** 기후 데이터 */
  climate: ClimateInfo;
  /** 관측소 소속 시/도 약칭 (예: "강원") */
  provinceShortName: string;
  /** 섹션 하단 안내 문구 (관측소 목록, 상속 안내 등) */
  notice?: React.ReactNode;
}

/**
 * 기후 정보 섹션 — 시/도, 시군구 상세 페이지에서 공용.
 *
 * - 3단 카드 (기온 / 강수량 / 일조시간)
 * - 각 카드에 farming tip 포함
 * - 하단 notice 영역 자유 커스터마이징
 */
export function ClimateSection({
  climate,
  provinceShortName,
  notice,
}: ClimateSectionProps) {
  return (
    <section className={s.section} aria-label="기후 정보">
      <div className={s.sectionHeader}>
        <Thermometer size={20} className={s.sectionIcon} />
        <div>
          <h2 className={s.sectionTitle}>기후 정보</h2>
          <p className={s.sectionDesc}>
            {provinceShortName} {climate.stnName} 관측소 기준 ({climate.period})
          </p>
        </div>
      </div>

      <div className={s.climateGrid}>
        {/* 평균기온 */}
        <div className={s.climateCard}>
          <div className={s.climateCardIcon}>
            <Thermometer size={16} />
          </div>
          <span className={s.climateCardLabel}>평균기온</span>
          <span className={s.climateCardValue}>{climate.avgTemp}°C</span>
          <span className={s.climateCardDetail}>
            최고 {climate.maxTemp}°C / 최저 {climate.minTemp}°C
          </span>
          <span className={s.climateCardTip}>
            {getTemperatureTip(climate.avgTemp)}
          </span>
        </div>

        {/* 누적 강수량 */}
        <div className={s.climateCard}>
          <div className={s.climateCardIcon}>
            <Droplets size={16} />
          </div>
          <span className={s.climateCardLabel}>누적 강수량</span>
          <span className={s.climateCardValue}>
            {climate.totalPrecipitation}mm
          </span>
          <span className={s.climateCardTip}>
            {getPrecipitationTip(climate.totalPrecipitation)}
          </span>
        </div>

        {/* 일조시간 */}
        <div className={s.climateCard}>
          <div className={s.climateCardIcon}>
            <Sun size={16} />
          </div>
          <span className={s.climateCardLabel}>일조시간</span>
          <span className={s.climateCardValue}>{climate.totalSunshine}hr</span>
          <span className={s.climateCardTip}>
            {getSunshineTip(climate.totalSunshine)}
          </span>
        </div>
      </div>

      {notice && <div className={s.notice}>{notice}</div>}
    </section>
  );
}
