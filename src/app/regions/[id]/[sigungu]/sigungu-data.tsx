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
import { SigunguStats } from "./sigungu-stats";

interface SigunguDataProps {
  province: Province;
  sigungu: Sigungu;
}

export async function SigunguData({ province, sigungu }: SigunguDataProps) {
  const hiraSgguCd = sigungu.admCode + "0";

  // ── Phase 1: 시군구 수준 + 기후 (4개 병렬) ──
  const [sigunguPopResult, sigunguMedicalResult, sigunguSchoolResult, climateResult] =
    await Promise.allSettled([
      fetchSigunguPopulationData(sigungu.sgisCode),
      fetchSigunguMedicalFacilities(province.hiraSidoCd, hiraSgguCd),
      fetchSigunguSchoolCounts(province.eduCode, sigungu.name),
      fetchMultipleClimateData(province.stationIds),
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

  const hasFallback = isPopulationFallback || isMedicalFallback || isSchoolFallback;

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
      hasFallback={hasFallback}
      sgisCode={sigungu.sgisCode}
      hiraSidoCd={province.hiraSidoCd}
      hiraSgguCd={hiraSgguCd}
      eduCode={province.eduCode}
      sigunguNameForNeis={sigungu.name}
    />
  );
}
