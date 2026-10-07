"use client";

import { DataSource } from "@/components/ui/data-source";
import { NATIONAL_AREA_KM2, NATIONAL_POP_DENSITY, seoulAreaCompare, withJosa } from "@/lib/format";
import s from "./modals.module.css";

interface AreaModalProps {
  provinceName: string;
  provinceShortName: string;
  area: number;
  population: number | null;
}

export function AreaModal({
  provinceShortName,
  area,
  population,
}: AreaModalProps) {
  const seoulRatio = seoulAreaCompare(area).ratio;
  const nationalPercent = ((area / NATIONAL_AREA_KM2) * 100).toFixed(1);
  const density = population ? Math.round(population / area) : null;

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
          <span className={s.statItemValue}>{seoulRatio}</span>
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
          <h4 className={s.insightTitle}>정착 관점</h4>
          <p className={s.insightText}>
            {density < 200
              ? `${withJosa(provinceShortName, "은")} 인구밀도가 전국 평균(${NATIONAL_POP_DENSITY}명/km²)보다 낮아 여유로운 농촌 환경을 기대할 수 있어요.`
              : density < 500
                ? `${withJosa(provinceShortName, "은")} 인구밀도가 적당한 편으로, 도시 인프라와 농촌 환경을 함께 누릴 수 있어요.`
                : `${withJosa(provinceShortName, "은")} 인구밀도가 높은 편이지만, 외곽 지역에서 귀농 기회를 찾을 수 있어요.`}
          </p>
        </div>
      )}

      <DataSource source="국토교통부 지적통계 · 통계청 SGIS 인구" />
    </div>
  );
}
