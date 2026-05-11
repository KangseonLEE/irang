import Image from "next/image";
import { Lightbulb } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { fetchMultipleClimateData, type ClimateData } from "@/lib/api/weather";
import {
  fetchPopulationData,
  fetchSigunguPopulationData,
} from "@/lib/api/sgis";
import {
  fetchMedicalFacilities,
  fetchSigunguMedicalFacilities,
} from "@/lib/api/hira";
import {
  fetchSchoolCounts,
  fetchSigunguSchoolCounts,
} from "@/lib/api/education";
import { PROGRAMS } from "@/lib/data/programs";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { CropSuitabilitySection } from "./crop-suitability-section";
import { LazyClimateRadar, LazyPopulationBars } from "./charts-lazy";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { SwipeHint } from "@/components/ui/swipe-hint";
import type { RegionItem } from "./region-item";
import s from "./page.module.css";

/**
 * Streaming SSR — 4 API await + 데이터 의존 JSX 전체.
 *
 * 2026-05-11 Phase C: 시군구 단위 선택 지원. RegionItem 객체로 시도 또는 시군구
 * 분기 처리. 기상은 시도 대표 station 유지(시군구 ASOS 없음). 인구·의료·학교는
 * 시군구 있으면 시군구 단위, 없으면 시도 단위 API.
 */

interface CompareDataSectionProps {
  regions: RegionItem[];
  selectedCropId: string | null;
  year: number;
}

interface RegionInfraData {
  region: RegionItem;
  population: number | null;
  householdCount: number | null;
  agingRate: number | null;
  medicalCount: number | null;
  schoolCount: number | null;
}

export async function CompareDataSection({
  regions,
  selectedCropId,
  year,
}: CompareDataSectionProps) {
  const stationIds = regions.map((r) => r.station.stnId);

  // ---- 기상 (시도 station 단위) ----
  const climatePromise = fetchMultipleClimateData(stationIds);

  // ---- 인프라 (시군구 있으면 시군구 단위, 없으면 시도 단위) ----
  const infraPromise = fetchInfraForRegions(regions);

  const [climateResult, infraResult] = await Promise.allSettled([
    climatePromise,
    infraPromise,
  ]);

  const climateData =
    climateResult.status === "fulfilled" ? climateResult.value : [];
  const infraData: RegionInfraData[] =
    infraResult.status === "fulfilled" ? infraResult.value : [];

  // 기상 데이터 없으면 빈 상태
  if (climateData.length === 0) {
    return (
      <div className={s.emptyState}>
        <p className={s.emptyStateText}>
          기상 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  // Region별 climate 매핑 (station.stnId 기반)
  const climateByStation = new Map(climateData.map((c) => [c.stnId, c]));
  // infra 매핑 (region.id 기반)
  const infraByRegion = new Map(infraData.map((i) => [i.region.id, i]));

  return (
    <>
      {/* Climate Summary Cards */}
      <section aria-labelledby="climate-heading">
        <h2 id="climate-heading" className={s.srOnly}>
          기후 요약
        </h2>
        <div className={s.climateGrid}>
          {regions.map((region) => {
            const climate = climateByStation.get(region.station.stnId);
            if (!climate) return null;
            return (
              <ClimateCard
                key={region.id}
                region={region}
                climate={climate}
              />
            );
          })}
        </div>
      </section>

      {/* 기후 레이더 차트 */}
      {regions.length >= 2 && (
        <section
          className={s.chartSection}
          aria-labelledby="climate-chart-heading"
        >
          <h2 id="climate-chart-heading" className={s.chartSectionTitle}>
            기후 비교
          </h2>
          <LazyClimateRadar
            data={regions
              .map((region) => {
                const climate = climateByStation.get(region.station.stnId);
                if (!climate) return null;
                return {
                  stationName: climate.stnName,
                  provinceName: region.sigungu
                    ? `${region.province.shortName} ${region.sigungu.shortName}`
                    : region.province.shortName,
                  avgTemp: climate.avgTemp,
                  maxTemp: climate.maxTemp,
                  minTemp: climate.minTemp,
                  totalPrecipitation: climate.totalPrecipitation,
                  totalSunshine: climate.totalSunshine,
                  avgHumidity: climate.avgHumidity,
                };
              })
              .filter((d): d is NonNullable<typeof d> => d !== null)}
          />
        </section>
      )}

      {/* 한줄 요약 */}
      {regions.length >= 2 && (
        <section
          aria-labelledby="onesummary-heading"
          className={s.oneSummaryCard}
        >
          <h2 id="onesummary-heading" className={s.oneSummaryTitle}>
            <Icon icon={Lightbulb} size="md" />
            한줄 요약
          </h2>
          <p className={s.oneSummaryText}>
            {buildRegionSummary(regions, climateByStation)}
          </p>
        </section>
      )}

      {/* 생활 인프라 차트 */}
      {regions.length >= 2 && infraData.length > 0 && (
        <section
          className={s.chartSection}
          aria-labelledby="infra-chart-heading"
        >
          <h2 id="infra-chart-heading" className={s.chartSectionTitle}>
            생활 인프라 비교
          </h2>
          <LazyPopulationBars
            data={regions.map((region) => {
              const infra = infraByRegion.get(region.id);
              return {
                provinceName: region.label,
                population: infra?.population ?? null,
                medicalCount: infra?.medicalCount ?? null,
                schoolCount: infra?.schoolCount ?? null,
              };
            })}
          />
        </section>
      )}

      {/* Detailed Comparison Table */}
      <section aria-labelledby="detail-heading">
        <div className={s.tableCard}>
          <div className={s.tableCardHeader}>
            <h2 id="detail-heading" className={s.tableCardTitle}>
              상세 비교
            </h2>
            <p className={s.tableCardDesc}>
              {year}년 {climateData[0]?.period} 기준 관측 데이터
            </p>
          </div>
          <SwipeHint />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className={s.srOnly}>
                지역별 기후/인구/인프라 상세 비교
              </caption>
              <thead>
                <tr>
                  <th className={s.th} scope="col">
                    항목
                  </th>
                  {regions.map((r) => (
                    <th key={r.id} className={s.th} scope="col">
                      {r.sigungu ? r.sigungu.shortName : r.station.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="평균기온"
                  unit="℃"
                  values={regions.map(
                    (r) => climateByStation.get(r.station.stnId)?.avgTemp ?? null,
                  )}
                  highlight="none"
                />
                <ComparisonRow
                  label="최고기온"
                  unit="℃"
                  values={regions.map(
                    (r) => climateByStation.get(r.station.stnId)?.maxTemp ?? null,
                  )}
                  highlight="max"
                />
                <ComparisonRow
                  label="최저기온"
                  unit="℃"
                  values={regions.map(
                    (r) => climateByStation.get(r.station.stnId)?.minTemp ?? null,
                  )}
                  highlight="min"
                />
                <ComparisonRow
                  label="누적 강수량"
                  unit="mm"
                  values={regions.map(
                    (r) =>
                      climateByStation.get(r.station.stnId)?.totalPrecipitation ??
                      null,
                  )}
                  highlight="none"
                />
                <ComparisonRow
                  label="누적 일조시간"
                  unit="hr"
                  values={regions.map(
                    (r) =>
                      climateByStation.get(r.station.stnId)?.totalSunshine ?? null,
                  )}
                  highlight="max"
                />
                <ComparisonRow
                  label="평균 습도"
                  unit="%"
                  values={regions.map(
                    (r) => climateByStation.get(r.station.stnId)?.avgHumidity ?? null,
                  )}
                  highlight="none"
                />
                {infraData.length > 0 && (
                  <>
                    <SectionDividerRow
                      label="인구 현황"
                      colSpan={regions.length + 1}
                    />
                    <ComparisonRow
                      label="인구수"
                      unit="명"
                      values={regions.map(
                        (r) => infraByRegion.get(r.id)?.population ?? null,
                      )}
                      highlight="max"
                    />
                    <ComparisonRow
                      label="가구수"
                      unit="가구"
                      values={regions.map(
                        (r) => infraByRegion.get(r.id)?.householdCount ?? null,
                      )}
                      highlight="max"
                    />
                    <ComparisonRow
                      label="고령화율"
                      unit="%"
                      values={regions.map(
                        (r) => infraByRegion.get(r.id)?.agingRate ?? null,
                      )}
                      highlight="none"
                    />
                    <SectionDividerRow
                      label="생활 인프라"
                      colSpan={regions.length + 1}
                    />
                    <ComparisonRow
                      label="의료기관 수"
                      unit="개소"
                      values={regions.map(
                        (r) => infraByRegion.get(r.id)?.medicalCount ?? null,
                      )}
                      highlight="max"
                    />
                    <ComparisonRow
                      label="학교 수"
                      unit="개교"
                      values={regions.map(
                        (r) => infraByRegion.get(r.id)?.schoolCount ?? null,
                      )}
                      highlight="max"
                    />
                  </>
                )}
                <SectionDividerRow
                  label="귀농 지원"
                  colSpan={regions.length + 1}
                />
                <ComparisonRow
                  label="지원사업 수"
                  unit="건"
                  values={regions.map(
                    (r) =>
                      PROGRAMS.filter(
                        (p) =>
                          p.linkStatus !== "broken" &&
                          (p.region === "전국" || p.region === r.province.name),
                      ).length,
                  )}
                  highlight="max"
                />
                <ComparisonRow
                  label="모집중 사업"
                  unit="건"
                  values={regions.map(
                    (r) =>
                      PROGRAMS.filter(
                        (p) =>
                          p.linkStatus !== "broken" &&
                          p.status === "모집중" &&
                          (p.region === "전국" || p.region === r.province.name),
                      ).length,
                  )}
                  highlight="max"
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CropSuitabilitySection
        cropId={selectedCropId}
        climateData={climateData}
        selectedStations={regions.map((r) => r.station)}
      />

      <ReferenceNotice text="비교 데이터는 기상청·통계청·심평원 공공데이터를 가공한 참고 자료예요. 시·군·구 선택 시 인구·의료·학교는 해당 시·군·구 단위, 기상은 시·도 대표 관측소 데이터예요." />

      <DataSource source="기상청 종관기상관측(ASOS) · 공공데이터포털 (data.go.kr) · 통계지리정보서비스(SGIS) · 건강보험심사평가원 · 교육부 NEIS · 공공누리 제1유형" />
    </>
  );
}

/**
 * 각 region에 대해 적절한 인프라 API 호출.
 * - sigungu 있으면 시군구 단위 (3개 API 병렬)
 * - sigungu 없으면 시도 단위 (3개 API 병렬)
 *
 * 각 region마다 3 API 동시 호출 후 합산. region 간에도 병렬.
 */
async function fetchInfraForRegions(
  regions: RegionItem[],
): Promise<RegionInfraData[]> {
  const promises = regions.map(async (region) => {
    if (region.sigungu) {
      // 시군구 단위 — 3 API 병렬 (각 API는 SigunguData | null 반환)
      const [popResult, medResult, schResult] = await Promise.allSettled([
        fetchSigunguPopulationData(region.sigungu.sgisCode),
        fetchSigunguMedicalFacilities(
          region.station.hiraSidoCd,
          region.sigungu.hiraSgguCd,
        ),
        fetchSigunguSchoolCounts(region.station.eduCode, region.sigungu.name),
      ]);

      const pop = popResult.status === "fulfilled" ? popResult.value : null;
      const med = medResult.status === "fulfilled" ? medResult.value : null;
      const sch = schResult.status === "fulfilled" ? schResult.value : null;

      return {
        region,
        population: pop?.population ?? null,
        householdCount: pop?.householdCount ?? null,
        agingRate: pop?.agingRate ?? null,
        medicalCount: med?.totalCount ?? null,
        schoolCount: sch?.totalCount ?? null,
      };
    } else {
      // 시도 단위
      const [popResult, medResult, schResult] = await Promise.allSettled([
        fetchPopulationData([region.station.sgisCode]),
        fetchMedicalFacilities([region.station.hiraSidoCd]),
        fetchSchoolCounts([region.station.eduCode]),
      ]);

      const pop =
        popResult.status === "fulfilled" ? popResult.value[0] ?? null : null;
      const med =
        medResult.status === "fulfilled" ? medResult.value[0] ?? null : null;
      const sch =
        schResult.status === "fulfilled" ? schResult.value[0] ?? null : null;

      return {
        region,
        population: pop?.population ?? null,
        householdCount: pop?.householdCount ?? null,
        agingRate: pop?.agingRate ?? null,
        medicalCount: med?.totalCount ?? null,
        schoolCount: sch?.totalCount ?? null,
      };
    }
  });

  return Promise.all(promises);
}

function buildRegionSummary(
  regions: RegionItem[],
  climateByStation: Map<string, ClimateData>,
): string {
  if (regions.length < 2) return "";

  const parts: string[] = [];
  const withClimate = regions
    .map((r) => ({ region: r, climate: climateByStation.get(r.station.stnId) }))
    .filter((e): e is { region: RegionItem; climate: ClimateData } => !!e.climate);

  if (withClimate.length < 2) return "";

  const sorted = [...withClimate].sort(
    (a, b) => a.climate.avgTemp - b.climate.avgTemp,
  );
  const coldest = sorted[0];
  const warmest = sorted[sorted.length - 1];

  if (warmest.climate.avgTemp - coldest.climate.avgTemp > 1) {
    parts.push(
      `따뜻한 기후를 선호한다면 ${warmest.region.label}(평균 ${warmest.climate.avgTemp}℃)이 유리하고, 서늘한 환경을 원한다면 ${coldest.region.label}(평균 ${coldest.climate.avgTemp}℃)이 적합해요.`,
    );
  } else {
    parts.push(
      `${withClimate.map((e) => e.region.label).join(", ")} 모두 비슷한 기온대(평균 ${withClimate[0].climate.avgTemp}℃)예요.`,
    );
  }

  const precips = withClimate.map((e) => e.climate.totalPrecipitation);
  const maxPrecip = Math.max(...precips);
  const minPrecip = Math.min(...precips);
  if (maxPrecip > 0 && (maxPrecip - minPrecip) / maxPrecip > 0.2) {
    const wettest = withClimate.reduce((a, b) =>
      a.climate.totalPrecipitation > b.climate.totalPrecipitation ? a : b,
    );
    parts.push(`강수량은 ${wettest.region.label}이 가장 많아요.`);
  }

  return parts.join(" ");
}

function ClimateCard({
  region,
  climate,
}: {
  region: RegionItem;
  climate: ClimateData;
}) {
  return (
    <article className={s.climateCard}>
      <div className={s.cardImageWrap}>
        <Image
          src={`/images/regions/${region.province.id}.png`}
          alt={`${region.province.name} 풍경 일러스트`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className={s.cardBody}>
        <span className={s.cardOverline}>
          {region.province.name}
          {region.sigungu && ` · ${region.sigungu.name}`}
        </span>
        <h3 className={s.cardTitle}>
          {region.sigungu ? region.sigungu.shortName : climate.stnName}
        </h3>
        <hr className={s.cardDivider} />
        <div className={s.cardDataList}>
          <DataRow label="평균기온" value={`${climate.avgTemp}℃`} />
          <DataRow label="누적 강수" value={`${climate.totalPrecipitation}mm`} />
          <DataRow label="누적 일조" value={`${climate.totalSunshine}hr`} />
          <DataRow label="평균 습도" value={`${climate.avgHumidity}%`} />
        </div>
        <p className={s.cardDescription}>
          {region.sigungu?.description ? (
            <AutoGlossary text={region.sigungu.description} />
          ) : region.station.description ? (
            <AutoGlossary text={region.station.description} />
          ) : null}
        </p>
      </div>
    </article>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={s.dataRow}>
      <span className={s.dataRowLabel}>{label}</span>
      <span className={s.dataRowValue}>{value}</span>
    </div>
  );
}

function SectionDividerRow({
  label,
  colSpan,
}: {
  label: string;
  colSpan: number;
}) {
  return (
    <tr className={s.dividerRow}>
      <td colSpan={colSpan} className={s.dividerCell}>
        {label}
      </td>
    </tr>
  );
}

function ComparisonRow({
  label,
  unit,
  values,
  highlight,
}: {
  label: string;
  unit: string;
  values: (number | null)[];
  highlight: "max" | "min" | "none";
}) {
  const numericValues = values.filter((v): v is number => v !== null);
  const maxVal = numericValues.length > 0 ? Math.max(...numericValues) : 0;
  const minVal = numericValues.length > 0 ? Math.min(...numericValues) : 0;
  return (
    <tr>
      <td className={s.tdLabel}>{label}</td>
      {values.map((val, i) => {
        if (val === null) {
          return (
            <td key={i} className={s.tdValue}>
              <span className={s.tdNoData}>—</span>
            </td>
          );
        }
        const isHighlighted =
          (highlight === "max" && val === maxVal) ||
          (highlight === "min" && val === minVal);
        return (
          <td key={i} className={s.tdValue}>
            <span className={isHighlighted ? s.tdHighlight : undefined}>
              {val.toLocaleString()}
            </span>
            <span className={s.tdUnit}>{unit}</span>
          </td>
        );
      })}
    </tr>
  );
}
