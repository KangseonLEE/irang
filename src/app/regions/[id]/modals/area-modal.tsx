"use client";

import { DataSource } from "@/components/ui/data-source";
import s from "./modals.module.css";

interface AreaModalProps {
  provinceName: string;
  provinceShortName: string;
  area: number;
  population: number | null;
}

const SEOUL_AREA = 605;
const NATIONAL_AREA = 100_401; // 대한민국 총 면적 (km²)

export function AreaModal({
  provinceShortName,
  area,
  population,
}: AreaModalProps) {
  const seoulRatio = (area / SEOUL_AREA).toFixed(1);
  const nationalPercent = ((area / NATIONAL_AREA) * 100).toFixed(1);
  const density = population ? Math.round(population / area) : null;
  const nationalDensity = 515; // 전국 평균 인구밀도 (명/km²)

  return (
    <div className={s.modalContent}>
      <div className={s.statGrid}>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>총 면적</span>
          <span className={s.statItemValue}>
            {area.toLocaleString()} km²
          </span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>서울 대비</span>
          <span className={s.statItemValue}>약 {seoulRatio}배</span>
        </div>
        <div className={s.statItem}>
          <span className={s.statItemLabel}>전국 면적 비율</span>
          <span className={s.statItemValue}>{nationalPercent}%</span>
        </div>
        {density !== null && (
          <div className={s.statItem}>
            <span className={s.statItemLabel}>인구밀도</span>
            <span className={s.statItemValue}>
              {density.toLocaleString()}명/km²
            </span>
          </div>
        )}
      </div>

      {density !== null && (
        <div className={s.insight}>
          <h4 className={s.insightTitle}>귀농 관점</h4>
          <p className={s.insightText}>
            {density < 200
              ? `${provinceShortName}은(는) 인구밀도가 전국 평균(${nationalDensity}명/km²)보다 낮아 여유로운 농촌 환경을 기대할 수 있습니다.`
              : density < 500
                ? `${provinceShortName}은(는) 인구밀도가 적당한 편으로, 도시 인프라와 농촌 환경을 함께 누릴 수 있습니다.`
                : `${provinceShortName}은(는) 인구밀도가 높은 편이지만, 외곽 지역에서 귀농 기회를 찾을 수 있습니다.`}
          </p>
        </div>
      )}

      <DataSource source="국토교통부 토지이용현황 · 통계청 주민등록인구현황" />
    </div>
  );
}
