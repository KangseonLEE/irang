/**
 * 구 상세 페이지 — API 의존 데이터 섹션 (async Server Component)
 *
 * sigungu-data.tsx와 동일한 패턴.
 * Phase 1: 구 수준 API 호출 (구 고유 sgisCode / hiraSgguCd 사용)
 * Phase 2: 실패 시 시/도 폴백
 */

import type { Province } from "@/lib/data/regions";
import type { Sigungu } from "@/lib/data/sigungus";
import type { GuDistrict } from "@/lib/data/gus";
import {
  fetchSigunguPopulationData,
  fetchPopulationData,
} from "@/lib/api/sgis";
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
import { SigunguStats } from "../sigungu-stats";

interface GuDataProps {
  province: Province;
  sigungu: Sigungu;
  gu: GuDistrict;
}

export async function GuData({ province, sigungu, gu }: GuDataProps) {
  // -- Phase 1: 구 수준 API 호출 --
  // 귀농·귀촌은 구 단위 데이터가 없으므로 상위 시군구(admCode) 기준 조회
  const [guPopResult, guMedicalResult, guSchoolResult, climateResult, returnFarmResult] =
    await Promise.allSettled([
      fetchSigunguPopulationData(gu.sgisCode),
      fetchSigunguMedicalFacilities(province.hiraSidoCd, gu.hiraSgguCd),
      // NEIS는 구 이름으로 검색 (예: "장안구")
      fetchSigunguSchoolCounts(province.eduCode, gu.name),
      fetchMultipleClimateData(province.stationIds),
      fetchReturnFarmStats(sigungu.admCode),
    ]);

  const guPop =
    guPopResult.status === "fulfilled" ? guPopResult.value : null;
  const guMedical =
    guMedicalResult.status === "fulfilled" ? guMedicalResult.value : null;
  const guSchool =
    guSchoolResult.status === "fulfilled" ? guSchoolResult.value : null;

  // -- Phase 2: 실패 시 시/도 폴백 --
  const needsPopFallback = !guPop;
  const needsMedicalFallback = !guMedical;
  const needsSchoolFallback = !guSchool;

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

  // -- 최종 데이터 --
  const population = guPop ?? sidoPop;
  const isPopulationFallback = !guPop && !!sidoPop;

  const medical = guMedical ?? sidoMedical;
  const isMedicalFallback = !guMedical && !!sidoMedical;

  const school = guSchool ?? sidoSchool;
  const isSchoolFallback = !guSchool && !!sidoSchool;

  const climateData =
    climateResult.status === "fulfilled" ? climateResult.value : [];
  const mainClimate =
    climateData.find((d) => d.stnId === province.representativeStationId) ??
    climateData[0] ??
    null;

  // 귀농·귀촌 데이터 (KOSIS — 상위 시군구 기준)
  const returnFarmAll =
    returnFarmResult.status === "fulfilled" ? returnFarmResult.value : [];
  const returnFarm = returnFarmAll.length > 0 ? returnFarmAll[0] : null;

  const hasFallback = isPopulationFallback || isMedicalFallback || isSchoolFallback;

  return (
    <SigunguStats
      provinceShortName={province.shortName}
      provinceName={province.name}
      sigunguName={gu.name}
      area={gu.area}
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
      sgisCode={gu.sgisCode}
      hiraSidoCd={province.hiraSidoCd}
      hiraSgguCd={gu.hiraSgguCd}
      eduCode={province.eduCode}
      sigunguNameForNeis={gu.name}
      admCode={sigungu.admCode}
    />
  );
}
