/**
 * 시도별 인구 통계 Fallback 데이터
 * - SGIS API 장애 시 사용 + /regions 전국 인구밀도 지도 색(API 없이 이 값만 쓴다)
 * - 10/10: 손으로 옮긴 16행(연도 미상·세종 없음, '주민등록인구현황'이라고만 적힘)을 걷고
 *   population-trend.ts(SGIS 인구통계 생성본, scripts/collect-population-trend.ts)의 시·도 최신 연도 값으로 바꿨다.
 *   이름·순서는 PROVINCES(행정구역명 SSOT)를 따른다.
 */

import { PROVINCES } from "./regions";
import { getPopulationTrend, POPULATION_TREND_YEARS } from "./population-trend";

export interface PopulationFallback {
  sgisCode: string;
  name: string;
  population: number;
  householdCount: number;
  agingRate: number; // 65세 이상 비율 (%)
  /** 통계 연도 (SGIS 인구통계) */
  year: number;
}

/** 폴백 값의 연도 — 생성본의 최신 연도 */
export const POPULATION_FALLBACK_YEAR: number = Math.max(...POPULATION_TREND_YEARS);

export const POPULATION_FALLBACK: PopulationFallback[] = PROVINCES.flatMap((p) => {
  const point = getPopulationTrend(p.sgisCode).find((t) => t.year === POPULATION_FALLBACK_YEAR);
  return point
    ? [{
        sgisCode: p.sgisCode,
        name: p.name,
        population: point.population,
        householdCount: point.householdCount,
        agingRate: point.agingRate,
        year: point.year,
      }]
    : [];
});

/**
 * SGIS 지역코드로 fallback 인구 데이터 조회
 */
export function getPopulationFallback(sgisCode: string): PopulationFallback | undefined {
  return POPULATION_FALLBACK.find((p) => p.sgisCode === sgisCode);
}
