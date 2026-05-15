/**
 * 시군구 보조 통계 (정적 계산)
 *
 * 회장 결재 2026-05-15 — /regions/ranking 카드 chip 3종 보강 sprint.
 * 추가 API 0, 기존 정적 데이터 조합만으로 산출:
 *   1) 인구밀도 (명/km²) — POPULATION_TREND_SIGUNGU 최신 연도 ÷ SIGUNGUS.area
 *   2) 활성 지원사업 수 — PROGRAMS 중 region 매칭 + deriveStatus !== "마감"
 *   3) D-7 마감 임박 수 — 활성 사업 중 daysUntilDeadline ≤ 7
 *
 * 시군구 단위 호출은 server prep(page.tsx)에서 1회만 — Client 컴포넌트로는
 * RankItem 부착 형태로 직렬화 전달한다.
 */

import { POPULATION_TREND_SIGUNGU, POPULATION_TREND_YEARS } from "./population-trend";
import { PROGRAMS } from "./programs";
import { daysUntilDeadline, deriveStatus } from "@/lib/program-status";
import type { Sigungu } from "./sigungus";
import type { Province } from "./regions";

/** 시군구 카드 chip 3종 보조 정보 */
export interface RegionStats {
  /** 인구밀도 (명/km²). 데이터 없으면 null */
  populationDensity: number | null;
  /** 활성 지원사업 수 (전국 + 시도 매칭, 마감 제외) */
  activeProgramsCount: number;
  /** D-7 마감 임박 활성 지원사업 수 (활성 중 daysUntilDeadline ≤ 7) */
  urgentDeadlineCount: number;
}

/** 시군구별 최신 연도 인구 인덱스 (build 1회) */
const LATEST_YEAR = Math.max(...POPULATION_TREND_YEARS);
const SIGUNGU_LATEST_POPULATION = new Map<string, number>();
for (const point of POPULATION_TREND_SIGUNGU) {
  if (point.year === LATEST_YEAR && point.population > 0) {
    SIGUNGU_LATEST_POPULATION.set(point.sgisCode, point.population);
  }
}

/**
 * 시군구 chip 3종 통계 산출 (server 시점 호출 가정).
 * sgisCode·area·province.name 을 받아 정적 데이터만으로 동기 계산.
 */
export function getRegionStats(sg: Sigungu, province: Province): RegionStats {
  // 1) 인구밀도 = 최신 연도 인구 / area
  const population = SIGUNGU_LATEST_POPULATION.get(sg.sgisCode) ?? null;
  const populationDensity =
    population !== null && sg.area > 0 ? Math.round(population / sg.area) : null;

  // 2/3) PROGRAMS 매칭: region이 "전국" 또는 province.name 과 일치
  //      programs.region 형식 = "전국" / "경기도" / "서울특별시" 등 시도 단위
  const provinceName = province.name;
  let activeCount = 0;
  let urgentCount = 0;
  for (const program of PROGRAMS) {
    if (program.region !== "전국" && program.region !== provinceName) continue;
    const status = deriveStatus(
      program.applicationStart ?? null,
      program.applicationEnd ?? null,
    );
    if (status === "마감") continue;
    activeCount += 1;
    const days = daysUntilDeadline(program.applicationEnd ?? null);
    // 모집예정(시작 전)은 D-7 임박이 아니므로 제외 — 모집중 상태만 카운트
    if (status === "모집중" && days >= 0 && days <= 7) {
      urgentCount += 1;
    }
  }

  return {
    populationDensity,
    activeProgramsCount: activeCount,
    urgentDeadlineCount: urgentCount,
  };
}
