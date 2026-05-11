import Image from "next/image";
import { Lightbulb } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { fetchMultipleClimateData, type ClimateData } from "@/lib/api/weather";
import { fetchPopulationData, type PopulationData } from "@/lib/api/sgis";
import { fetchMedicalFacilities, type MedicalFacilityData } from "@/lib/api/hira";
import { fetchSchoolCounts, type SchoolData } from "@/lib/api/education";
import { STATIONS, type Station } from "@/lib/data/stations";
import { PROVINCES } from "@/lib/data/regions";
import { PROGRAMS } from "@/lib/data/programs";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { CropSuitabilitySection } from "./crop-suitability-section";
import { LazyClimateRadar, LazyPopulationBars } from "./charts-lazy";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { SwipeHint } from "@/components/ui/swipe-hint";
import s from "./page.module.css";

/**
 * Streaming SSR — 4 API await + 데이터 의존 JSX 전체.
 *
 * 2026-05-11 분리: page.tsx에서 await Promise.allSettled([4 API])가 페이지 SSR
 * 전체를 5s까지 지연시키던 사고. 데이터 의존 JSX 전체를 async server component로
 * 분리해서 page.tsx는 header·selector를 즉시 렌더하고 차트·테이블은 Suspense로
 * streaming 채워지도록 변경.
 *
 * 사용자 체감 효과:
 * - 첫 페인트: <0.5s (header·selector만, API 응답 안 기다림)
 * - 차트·테이블: API 응답 도착 시 점진 렌더 (streaming)
 * - 최악 응답 5s → 첫 페인트 영향 0
 */

interface CompareDataSectionProps {
  selectedIds: string[];
  selectedStations: Station[];
  selectedCropId: string | null;
  year: number;
}

export async function CompareDataSection({
  selectedIds,
  selectedStations,
  selectedCropId,
  year,
}: CompareDataSectionProps) {
  const uniqueSgisCodes = [...new Set(selectedStations.map((st) => st.sgisCode))];
  const uniqueHiraCodes = [...new Set(selectedStations.map((st) => st.hiraSidoCd))];
  const uniqueEduCodes = [...new Set(selectedStations.map((st) => st.eduCode))];

  // 4개 API 병렬 호출 (page.tsx에서 분리되어 Suspense streaming 가능)
  const [climateResult, populationResult, medicalResult, schoolResult] =
    await Promise.allSettled([
      fetchMultipleClimateData(selectedIds),
      fetchPopulationData(uniqueSgisCodes),
      fetchMedicalFacilities(uniqueHiraCodes),
      fetchSchoolCounts(uniqueEduCodes),
    ]);

  const climateData =
    climateResult.status === "fulfilled" ? climateResult.value : [];

  const populationMap: Map<string, PopulationData> = new Map();
  if (populationResult.status === "fulfilled") {
    for (const p of populationResult.value) populationMap.set(p.regionCode, p);
  }

  const medicalMap: Map<string, MedicalFacilityData> = new Map();
  if (medicalResult.status === "fulfilled") {
    for (const m of medicalResult.value) medicalMap.set(m.sidoCd, m);
  }

  const schoolMap: Map<string, SchoolData> = new Map();
  if (schoolResult.status === "fulfilled") {
    for (const sc of schoolResult.value) schoolMap.set(sc.eduCode, sc);
  }

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

  return (
    <>
      {/* Climate Summary Cards */}
      <section aria-labelledby="climate-heading">
        <h2 id="climate-heading" className={s.srOnly}>
          기후 요약
        </h2>
        <div className={s.climateGrid}>
          {climateData.map((data) => (
            <ClimateCard
              key={data.stnId}
              data={data}
              provinceId={getProvinceIdByStation(data.stnId)}
            />
          ))}
        </div>
      </section>

      {/* 기후 레이더 차트 */}
      {climateData.length >= 2 && (
        <section className={s.chartSection} aria-labelledby="climate-chart-heading">
          <h2 id="climate-chart-heading" className={s.chartSectionTitle}>
            기후 비교
          </h2>
          <LazyClimateRadar
            data={climateData.map((d) => ({
              stationName: d.stnName,
              provinceName:
                STATIONS.find((st) => st.stnId === d.stnId)?.province ?? "",
              avgTemp: d.avgTemp,
              maxTemp: d.maxTemp,
              minTemp: d.minTemp,
              totalPrecipitation: d.totalPrecipitation,
              totalSunshine: d.totalSunshine,
              avgHumidity: d.avgHumidity,
            }))}
          />
        </section>
      )}

      {/* 한줄 요약 */}
      {climateData.length >= 2 && (
        <section
          aria-labelledby="onesummary-heading"
          className={s.oneSummaryCard}
        >
          <h2 id="onesummary-heading" className={s.oneSummaryTitle}>
            <Icon icon={Lightbulb} size="md" />
            한줄 요약
          </h2>
          <p className={s.oneSummaryText}>{buildRegionSummary(climateData)}</p>
        </section>
      )}

      {/* 생활 인프라 바 차트 */}
      {climateData.length >= 2 &&
        (populationMap.size > 0 ||
          medicalMap.size > 0 ||
          schoolMap.size > 0) && (
          <section
            className={s.chartSection}
            aria-labelledby="infra-chart-heading"
          >
            <h2 id="infra-chart-heading" className={s.chartSectionTitle}>
              생활 인프라 비교
            </h2>
            <LazyPopulationBars
              data={selectedStations.map((st) => {
                const pop = populationMap.get(st.sgisCode);
                const med = medicalMap.get(st.hiraSidoCd);
                const sch = schoolMap.get(st.eduCode);
                return {
                  provinceName: st.province,
                  population: pop?.population ?? null,
                  medicalCount: med?.totalCount ?? null,
                  schoolCount: sch?.totalCount ?? null,
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
                  {climateData.map((d) => (
                    <th key={d.stnId} className={s.th} scope="col">
                      {d.stnName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  label="평균기온"
                  unit="℃"
                  values={climateData.map((d) => d.avgTemp)}
                  highlight="none"
                />
                <ComparisonRow
                  label="최고기온"
                  unit="℃"
                  values={climateData.map((d) => d.maxTemp)}
                  highlight="max"
                />
                <ComparisonRow
                  label="최저기온"
                  unit="℃"
                  values={climateData.map((d) => d.minTemp)}
                  highlight="min"
                />
                <ComparisonRow
                  label="누적 강수량"
                  unit="mm"
                  values={climateData.map((d) => d.totalPrecipitation)}
                  highlight="none"
                />
                <ComparisonRow
                  label="누적 일조시간"
                  unit="hr"
                  values={climateData.map((d) => d.totalSunshine)}
                  highlight="max"
                />
                <ComparisonRow
                  label="평균 습도"
                  unit="%"
                  values={climateData.map((d) => d.avgHumidity)}
                  highlight="none"
                />
                <ComparisonRow
                  label="데이터 수"
                  unit="일"
                  values={climateData.map((d) => d.dataCount)}
                  highlight="none"
                />
                {populationMap.size > 0 && (
                  <>
                    <SectionDividerRow
                      label="인구 현황"
                      colSpan={climateData.length + 1}
                    />
                    <ComparisonRow
                      label="인구수"
                      unit="명"
                      values={selectedStations.map((st) => {
                        const p = populationMap.get(st.sgisCode);
                        return p ? p.population : null;
                      })}
                      highlight="max"
                    />
                    <ComparisonRow
                      label="가구수"
                      unit="가구"
                      values={selectedStations.map((st) => {
                        const p = populationMap.get(st.sgisCode);
                        return p ? p.householdCount : null;
                      })}
                      highlight="max"
                    />
                    <ComparisonRow
                      label="고령화율"
                      unit="%"
                      values={selectedStations.map((st) => {
                        const p = populationMap.get(st.sgisCode);
                        return p ? p.agingRate : null;
                      })}
                      highlight="none"
                    />
                  </>
                )}
                {(medicalMap.size > 0 || schoolMap.size > 0) && (
                  <>
                    <SectionDividerRow
                      label="생활 인프라"
                      colSpan={climateData.length + 1}
                    />
                    {medicalMap.size > 0 && (
                      <ComparisonRow
                        label="의료기관 수"
                        unit="개소"
                        values={selectedStations.map((st) => {
                          const m = medicalMap.get(st.hiraSidoCd);
                          return m ? m.totalCount : null;
                        })}
                        highlight="max"
                      />
                    )}
                    {schoolMap.size > 0 && (
                      <ComparisonRow
                        label="학교 수"
                        unit="개교"
                        values={selectedStations.map((st) => {
                          const sc = schoolMap.get(st.eduCode);
                          return sc ? sc.totalCount : null;
                        })}
                        highlight="max"
                      />
                    )}
                  </>
                )}
                <SectionDividerRow
                  label="귀농 지원"
                  colSpan={climateData.length + 1}
                />
                <ComparisonRow
                  label="지원사업 수"
                  unit="건"
                  values={selectedStations.map((st) => {
                    return PROGRAMS.filter(
                      (p) =>
                        p.linkStatus !== "broken" &&
                        (p.region === "전국" || p.region === st.province),
                    ).length;
                  })}
                  highlight="max"
                />
                <ComparisonRow
                  label="모집중 사업"
                  unit="건"
                  values={selectedStations.map((st) => {
                    return PROGRAMS.filter(
                      (p) =>
                        p.linkStatus !== "broken" &&
                        p.status === "모집중" &&
                        (p.region === "전국" || p.region === st.province),
                    ).length;
                  })}
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
        selectedStations={selectedStations}
      />

      <ReferenceNotice text="비교 데이터는 기상청·통계청·심평원 공공데이터를 가공한 참고 자료예요." />

      <DataSource source="기상청 종관기상관측(ASOS) · 공공데이터포털 (data.go.kr) · 통계지리정보서비스(SGIS) · 건강보험심사평가원 · 교육부 NEIS · 공공누리 제1유형" />
    </>
  );
}

function buildRegionSummary(climateData: ClimateData[]): string {
  if (climateData.length < 2) return "";
  const parts: string[] = [];
  const sorted = [...climateData].sort((a, b) => a.avgTemp - b.avgTemp);
  const coldest = sorted[0];
  const warmest = sorted[sorted.length - 1];
  if (warmest.avgTemp - coldest.avgTemp > 1) {
    parts.push(
      `따뜻한 기후를 선호한다면 ${warmest.stnName}(평균 ${warmest.avgTemp}℃)이 유리하고, 서늘한 환경을 원한다면 ${coldest.stnName}(평균 ${coldest.avgTemp}℃)이 적합해요.`,
    );
  } else {
    parts.push(
      `${climateData.map((d) => d.stnName).join(", ")} 모두 비슷한 기온대(평균 ${climateData[0].avgTemp}℃)예요.`,
    );
  }
  const maxPrecip = Math.max(...climateData.map((d) => d.totalPrecipitation));
  const minPrecip = Math.min(...climateData.map((d) => d.totalPrecipitation));
  if (maxPrecip > 0 && (maxPrecip - minPrecip) / maxPrecip > 0.2) {
    const wettest = climateData.reduce((a, b) =>
      a.totalPrecipitation > b.totalPrecipitation ? a : b,
    );
    parts.push(`강수량은 ${wettest.stnName}이 가장 많아요.`);
  }
  return parts.join(" ");
}

function getProvinceIdByStation(stnId: string): string | null {
  const province = PROVINCES.find((p) => p.stationIds.includes(stnId));
  return province?.id ?? null;
}

function ClimateCard({
  data,
  provinceId,
}: {
  data: ClimateData;
  provinceId: string | null;
}) {
  const station = STATIONS.find((st) => st.stnId === data.stnId);
  return (
    <article className={s.climateCard}>
      {provinceId && (
        <div className={s.cardImageWrap}>
          <Image
            src={`/images/regions/${provinceId}.png`}
            alt={`${station?.province ?? data.stnName} 풍경 일러스트`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
          />
        </div>
      )}
      <div className={s.cardBody}>
        <span className={s.cardOverline}>{station?.province}</span>
        <h3 className={s.cardTitle}>{data.stnName}</h3>
        <hr className={s.cardDivider} />
        <div className={s.cardDataList}>
          <DataRow label="평균기온" value={`${data.avgTemp}℃`} />
          <DataRow label="누적 강수" value={`${data.totalPrecipitation}mm`} />
          <DataRow label="누적 일조" value={`${data.totalSunshine}hr`} />
          <DataRow label="평균 습도" value={`${data.avgHumidity}%`} />
        </div>
        <p className={s.cardDescription}>
          {station?.description ? (
            <AutoGlossary text={station.description} />
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
