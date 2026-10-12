/**
 * 인구 연도 SSOT — 화면이 통계청 SGIS 에 실시간으로 묻는 해 = 정적 인구 추이(population-trend.ts)의 마지막 해.
 *
 * 2026-10-12: 화면은 `올해 − 2` 를, 정적 자료는 2018~2022 를 따로 들고 있어, SGIS 조회가 실패한 순간
 * 2022년 값이 연도 표기 없이 2024년 자리에 나왔다(청주 상당구 191,510 vs 195,499, 정합성 대조 #173).
 * 두 값을 이 상수 하나로 묶는다. 새 해 자료는 scripts/collect-population-trend.ts 가 받는 순간에만
 * 화면 연도가 함께 움직이고, 아직 공표 전이면 수집기가 실패해 data-sources.yml 이 알린다 —
 * 공표 전 해를 화면이 먼저 묻다 실패해 대체값으로 떨어지는 구간이 없다.
 */
import { POPULATION_TREND_YEARS } from "./population-trend";

export const SGIS_POPULATION_YEAR: number = POPULATION_TREND_YEARS[POPULATION_TREND_YEARS.length - 1];
