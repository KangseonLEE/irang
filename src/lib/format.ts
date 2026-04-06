/**
 * 공용 포맷 유틸리티
 * - 지역 통계, 모달 등에서 공통으로 사용하는 포맷 함수
 */

/** 인구수를 "N만명" 또는 "N명" 형식으로 포맷 */
export function formatPopulation(pop: number): string {
  if (pop >= 10000) {
    return `${Math.round(pop / 10000)}만명`;
  }
  return `${pop.toLocaleString()}명`;
}

/** 서울 면적 기준 상수 (km²) */
export const SEOUL_AREA_KM2 = 605;
