/**
 * 시도별 인구 통계 Fallback 데이터
 * - SGIS API 장애 시 사용
 * - 출처: 통계청 주민등록인구현황
 * - SGIS 지역코드(시도 단위) 기준
 */

/** Fallback 데이터의 기준연도. 갱신 시 이 값과 아래 배열을 함께 업데이트 */
export const POPULATION_DATA_YEAR = 2025;

export interface PopulationFallback {
  sgisCode: string;
  name: string;
  population: number;
  householdCount: number;
  agingRate: number; // 65세 이상 비율 (%)
}

export const POPULATION_FALLBACK: PopulationFallback[] = [
  { sgisCode: "11", name: "서울특별시", population: 9411284, householdCount: 4284790, agingRate: 18.7 },
  { sgisCode: "21", name: "부산광역시", population: 3293718, householdCount: 1478283, agingRate: 22.1 },
  { sgisCode: "22", name: "대구광역시", population: 2367724, householdCount: 1032455, agingRate: 19.8 },
  { sgisCode: "23", name: "인천광역시", population: 2989489, householdCount: 1264830, agingRate: 16.3 },
  { sgisCode: "24", name: "광주광역시", population: 1422130, householdCount: 630987, agingRate: 16.5 },
  { sgisCode: "25", name: "대전광역시", population: 1441672, householdCount: 645298, agingRate: 17.2 },
  { sgisCode: "26", name: "울산광역시", population: 1100157, householdCount: 462188, agingRate: 15.4 },
  { sgisCode: "31", name: "경기도", population: 13607019, householdCount: 5632847, agingRate: 14.9 },
  { sgisCode: "32", name: "강원도", population: 1530785, householdCount: 720318, agingRate: 23.5 },
  { sgisCode: "33", name: "충청북도", population: 1591513, householdCount: 723190, agingRate: 20.8 },
  { sgisCode: "34", name: "충청남도", population: 2118183, householdCount: 960512, agingRate: 21.3 },
  { sgisCode: "35", name: "전라북도", population: 1752845, householdCount: 806741, agingRate: 23.1 },
  { sgisCode: "36", name: "전라남도", population: 1792452, householdCount: 838196, agingRate: 25.8 },
  { sgisCode: "37", name: "경상북도", population: 2573832, householdCount: 1194826, agingRate: 23.7 },
  { sgisCode: "38", name: "경상남도", population: 3240195, householdCount: 1394217, agingRate: 20.5 },
  { sgisCode: "39", name: "제주특별자치도", population: 676759, householdCount: 298376, agingRate: 16.8 },
];

/**
 * SGIS 지역코드로 fallback 인구 데이터 조회
 */
export function getPopulationFallback(sgisCode: string): PopulationFallback | undefined {
  return POPULATION_FALLBACK.find((p) => p.sgisCode === sgisCode);
}
