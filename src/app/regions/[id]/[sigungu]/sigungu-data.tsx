/**
 * 시군구 상세 페이지 — API 의존 데이터 섹션 (async Server Component)
 *
 * 라우트 전환 시 loading.tsx(GlobalLoading)가 전체 페이지 로딩을 표시하고,
 * 이 컴포넌트의 API 호출이 완료된 뒤 전체 페이지가 한 번에 렌더됩니다.
 *
 * 최적화:
 * - Phase 1: 시군구 수준 API 3개 + 기후 1개 병렬 호출 (4개)
 * - Phase 2: 실패한 항목만 시/도 폴백 호출 (lazy fallback)
 * - 성공 시 총 4개, 전부 실패해도 최대 7개 (기존: 항상 7개)
 *
 * 렌더링은 SigunguStats 클라이언트 컴포넌트에 위임합니다.
 */

import type { Province } from "@/lib/data/regions";
import type { Sigungu } from "@/lib/data/sigungus";
import {
  fetchSigunguPopulationData,
  fetchPopulationData,
  fetchFarmHousehold,
} from "@/lib/api/sgis";
import { getFarmFallback } from "@/lib/data/farms";
import {
  getPopulationTrend,
  POPULATION_TREND_YEARS,
  POPULATION_TREND_SIGUNGU,
  type PopulationTrendPoint,
} from "@/lib/data/population-trend";
import {
  getSettlementScore,
  getSettlementScoresBySido,
  getScorePercentile,
} from "@/lib/data/settlement-score";
import {
  fetchSigunguMedicalFacilities,
  fetchMedicalFacilities,
} from "@/lib/api/hira";
import {
  fetchSigunguSchoolCounts,
  fetchSchoolCounts,
} from "@/lib/api/education";
import { fetchMultipleClimateData } from "@/lib/api/weather";
import { fetchReturnFarmStats } from "@/lib/api/kosis";
import { SigunguStats } from "./sigungu-stats";

interface SigunguDataProps {
  province: Province;
  sigungu: Sigungu;
}

export async function SigunguData({ province, sigungu }: SigunguDataProps) {
  const hiraSgguCd = sigungu.hiraSgguCd;

  // ── Phase 1: 시군구 수준 + 기후 + 귀농귀촌 + 농가 (6개 병렬) ──
  const [
    sigunguPopResult,
    sigunguMedicalResult,
    sigunguSchoolResult,
    climateResult,
    returnFarmResult,
    farmResult,
  ] = await Promise.allSettled([
    fetchSigunguPopulationData(sigungu.sgisCode),
    hiraSgguCd
      ? fetchSigunguMedicalFacilities(province.hiraSidoCd, hiraSgguCd)
      : Promise.resolve(null),
    fetchSigunguSchoolCounts(province.eduCode, sigungu.name),
    fetchMultipleClimateData(province.stationIds),
    fetchReturnFarmStats(sigungu.admCode),
    fetchFarmHousehold(sigungu.sgisCode),
  ]);

  const sigunguPop =
    sigunguPopResult.status === "fulfilled" ? sigunguPopResult.value : null;
  const sigunguMedical =
    sigunguMedicalResult.status === "fulfilled" ? sigunguMedicalResult.value : null;
  const sigunguSchool =
    sigunguSchoolResult.status === "fulfilled" ? sigunguSchoolResult.value : null;

  // ── Phase 2: 실패 항목만 시/도 폴백 (lazy fallback) ──
  const needsPopFallback = !sigunguPop;
  const needsMedicalFallback = !sigunguMedical;
  const needsSchoolFallback = !sigunguSchool;

  let sidoPop = null;
  let sidoMedical = null;
  let sidoSchool = null;

  if (needsPopFallback || needsMedicalFallback || needsSchoolFallback) {
    const fallbackPromises: Promise<unknown>[] = [];
    const fallbackKeys: ("pop" | "medical" | "school")[] = [];

    if (needsPopFallback) {
      fallbackPromises.push(fetchPopulationData([province.sgisCode]));
      fallbackKeys.push("pop");
    }
    if (needsMedicalFallback) {
      fallbackPromises.push(fetchMedicalFacilities([province.hiraSidoCd]));
      fallbackKeys.push("medical");
    }
    if (needsSchoolFallback) {
      fallbackPromises.push(fetchSchoolCounts([province.eduCode]));
      fallbackKeys.push("school");
    }

    const fallbackResults = await Promise.allSettled(fallbackPromises);

    for (let i = 0; i < fallbackResults.length; i++) {
      const result = fallbackResults[i];
      if (result.status !== "fulfilled") continue;

      const key = fallbackKeys[i];
      const value = result.value;
      const first = Array.isArray(value) ? value[0] ?? null : value;

      if (key === "pop") sidoPop = first;
      else if (key === "medical") sidoMedical = first;
      else if (key === "school") sidoSchool = first;
    }
  }

  // ── 최종 데이터 ──
  const population = sigunguPop ?? sidoPop;
  const isPopulationFallback = !sigunguPop && !!sidoPop;

  const medical = sigunguMedical ?? sidoMedical;
  const isMedicalFallback = !sigunguMedical && !!sidoMedical;

  const school = sigunguSchool ?? sidoSchool;
  const isSchoolFallback = !sigunguSchool && !!sidoSchool;

  const climateData =
    climateResult.status === "fulfilled" ? climateResult.value : [];
  const mainClimate =
    climateData.find((d) => d.stnId === province.representativeStationId) ??
    climateData[0] ??
    null;

  // 귀농·귀촌 데이터 (KOSIS)
  const returnFarmAll =
    returnFarmResult.status === "fulfilled" ? returnFarmResult.value : [];
  const returnFarm = returnFarmAll.length > 0 ? returnFarmAll[0] : null;

  const hasFallback = isPopulationFallback || isMedicalFallback || isSchoolFallback;

  // ── 농가 데이터 + 시도 평균 비교 (정적 폴백 기반) ──
  const farm = farmResult.status === "fulfilled" ? farmResult.value : null;
  const sidoFarm = getFarmFallback(province.sgisCode); // 시도 합산
  let farmRatioVsSido: number | null = null;
  if (farm && sidoFarm && sidoFarm.avgPopulation > 0 && farm.avgPopulation > 0) {
    farmRatioVsSido = Math.round(
      ((farm.avgPopulation - sidoFarm.avgPopulation) / sidoFarm.avgPopulation) * 100,
    );
  }

  // ── 인구 5년 추이 (정적 폴백 기반 — 빌드 안정성) ──
  const sigunguTrend: PopulationTrendPoint[] = getPopulationTrend(sigungu.sgisCode);
  // 시도 시군구 평균 = 같은 시도의 모든 시군구 평균 (연도별)
  const sidoSigunguAvgByYear = (() => {
    const map = new Map<number, { sum: number; count: number }>();
    for (const p of POPULATION_TREND_SIGUNGU) {
      if (!p.sgisCode.startsWith(province.sgisCode)) continue;
      const t = map.get(p.year) ?? { sum: 0, count: 0 };
      t.sum += p.population;
      t.count += 1;
      map.set(p.year, t);
    }
    const avgMap = new Map<number, number>();
    for (const [year, { sum, count }] of map.entries()) {
      avgMap.set(year, count > 0 ? Math.round(sum / count) : 0);
    }
    return avgMap;
  })();

  // 차트용 데이터 합성: 시군구 + 시도평균
  const populationTrendData = sigunguTrend.map((p) => ({
    year: p.year,
    population: p.population,
    sidoAvg: sidoSigunguAvgByYear.get(p.year) ?? undefined,
  }));

  // 5년 변화율 (트렌드 배지용)
  let populationChangePct: number | null = null;
  if (sigunguTrend.length >= 2) {
    const earliest = sigunguTrend[0].population;
    const latest = sigunguTrend[sigunguTrend.length - 1].population;
    if (earliest > 0) {
      populationChangePct = Math.round(((latest - earliest) / earliest) * 1000) / 10;
    }
  }

  // ── 정착 점수 (정적 모델 — Phase 3) ──
  const settlementScore = getSettlementScore(sigungu.sgisCode);
  const settlementPercentile =
    settlementScore !== null
      ? getScorePercentile(settlementScore.totalScore)
      : null;
  // 같은 시도 평균 차원 점수 (레이더 비교용)
  const sidoScores = getSettlementScoresBySido(province.sgisCode);
  const sidoAvgDimensions = (() => {
    if (sidoScores.length === 0) return null;
    const sum = { farm: 0, populationTrend: 0, youth: 0, density: 0 };
    for (const s of sidoScores) {
      sum.farm += s.dimensions.farm;
      sum.populationTrend += s.dimensions.populationTrend;
      sum.youth += s.dimensions.youth;
      sum.density += s.dimensions.density;
    }
    const n = sidoScores.length;
    return {
      farm: Math.round(sum.farm / n),
      populationTrend: Math.round(sum.populationTrend / n),
      youth: Math.round(sum.youth / n),
      density: Math.round(sum.density / n),
    };
  })();
  const sidoAvgTotalScore =
    sidoScores.length > 0
      ? Math.round(
          (sidoScores.reduce((a, b) => a + b.totalScore, 0) /
            sidoScores.length) *
            10,
        ) / 10
      : null;

  return (
    <SigunguStats
      provinceShortName={province.shortName}
      provinceName={province.name}
      sigunguName={sigungu.name}
      area={sigungu.area}
      population={population}
      isPopulationFallback={isPopulationFallback}
      medical={medical}
      isMedicalFallback={isMedicalFallback}
      school={school}
      isSchoolFallback={isSchoolFallback}
      climate={
        mainClimate
          ? {
              stnName: mainClimate.stnName,
              period: mainClimate.period,
              avgTemp: mainClimate.avgTemp,
              maxTemp: mainClimate.maxTemp,
              minTemp: mainClimate.minTemp,
              totalPrecipitation: mainClimate.totalPrecipitation,
              totalSunshine: mainClimate.totalSunshine,
            }
          : null
      }
      returnFarm={
        returnFarm
          ? {
              returnFarmPerson: returnFarm.returnFarmPerson,
              returnFarmHousehold: returnFarm.returnFarmHousehold,
              returnRuralPerson: returnFarm.returnRuralPerson,
              year: returnFarm.year,
            }
          : null
      }
      hasFallback={hasFallback}
      farm={
        farm
          ? {
              farmCount: farm.farmCount,
              farmPopulation: farm.farmPopulation,
              avgPopulation: farm.avgPopulation,
              isFallback: !!farm.isFallback,
            }
          : null
      }
      sidoFarmAvgPopulation={sidoFarm?.avgPopulation ?? null}
      farmRatioVsSido={farmRatioVsSido}
      populationTrend={populationTrendData}
      populationTrendYears={[...POPULATION_TREND_YEARS]}
      populationChangePct={populationChangePct}
      // Phase 4·5 재설계 중 — 단일 종합 점수는 추정 가중치 의존성으로 임시 비표시.
      // 차원별 점수(인구·농가·의료·학교·귀농비율)로 곧 전환.
      settlementScore={null
      }
      sgisCode={sigungu.sgisCode}
      hiraSidoCd={province.hiraSidoCd}
      hiraSgguCd={hiraSgguCd}
      eduCode={province.eduCode}
      sigunguNameForNeis={sigungu.name}
      admCode={sigungu.admCode}
    />
  );
}
