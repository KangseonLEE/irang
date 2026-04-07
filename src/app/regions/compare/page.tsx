import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { fetchMultipleClimateData, type ClimateData } from "@/lib/api/weather";
import { fetchPopulationData, type PopulationData } from "@/lib/api/sgis";
import { fetchMedicalFacilities, type MedicalFacilityData } from "@/lib/api/hira";
import { fetchSchoolCounts, type SchoolData } from "@/lib/api/education";
import { fetchRegionPhotos, type UnsplashPhoto } from "@/lib/api/unsplash";
import { STATIONS, DEFAULT_STATION_IDS } from "@/lib/data/stations";
import { PROGRAMS } from "@/lib/data/programs";
import { RegionSelector } from "./region-selector";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "지역 비교",
  description:
    "귀농 후보 지역의 기후, 인구, 의료 인프라, 교육 환경을 한눈에 비교하세요.",
};

interface PageProps {
  searchParams: Promise<{ stations?: string }>;
}

export default async function RegionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedIds = params.stations
    ? params.stations.split(",").slice(0, 3)
    : DEFAULT_STATION_IDS;

  // 선택된 관측소 메타데이터 추출 (동기 — 즉시 완료)
  const selectedStations = selectedIds
    .map((id) => STATIONS.find((st) => st.stnId === id))
    .filter((st): st is NonNullable<typeof st> => st != null);

  const uniqueSgisCodes = [...new Set(selectedStations.map((st) => st.sgisCode))];
  const uniqueHiraCodes = [...new Set(selectedStations.map((st) => st.hiraSidoCd))];
  const uniqueEduCodes = [...new Set(selectedStations.map((st) => st.eduCode))];

  // 5개 API를 병렬 호출 (순차→병렬: 로딩 시간 ~60-70% 단축)
  const [climateResult, populationResult, medicalResult, schoolResult, photoResult] =
    await Promise.allSettled([
      fetchMultipleClimateData(selectedIds),
      fetchPopulationData(uniqueSgisCodes),
      fetchMedicalFacilities(uniqueHiraCodes),
      fetchSchoolCounts(uniqueEduCodes),
      fetchRegionPhotos(selectedIds),
    ]);

  const climateData =
    climateResult.status === "fulfilled" ? climateResult.value : [];

  const photoMap: Map<string, UnsplashPhoto> =
    photoResult.status === "fulfilled" ? photoResult.value : new Map();

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

  const year = new Date().getFullYear();

  return (
    <div className={s.page}>
      {/* 로드맵 단계 컨텍스트 */}
      <Suspense>
        <RoadmapBanner />
      </Suspense>

      {/* Back Link */}
      <Link href="/regions" className={s.backLink}>
        ← 지역 목록으로
      </Link>

      {/* Page Header */}
      <header className={s.pageHeader}>
        <span className={s.headerOverline}>
          <MapPin size={16} aria-hidden="true" />
          Region Compare
        </span>
        <h1 className={s.headerTitle}>지역 비교</h1>
        <p className={s.headerDesc}>
          {year}년 기상 관측 데이터 기반으로 지역별 기후를 비교합니다.
        </p>
      </header>

      {/* Region Selector */}
      <Suspense
        fallback={
          <div
            className={s.selectorSkeleton}
            aria-busy="true"
            aria-label="지역 선택 로딩 중"
          />
        }
      >
        <RegionSelector stations={STATIONS} selectedIds={selectedIds} />
      </Suspense>

      {/* Climate Comparison Cards */}
      {climateData.length > 0 ? (
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
                  photo={photoMap.get(data.stnId)}
                />
              ))}
            </div>
          </section>

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
                    {/* 기후 데이터 */}
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
                    {/* 인구 데이터 */}
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
                    {/* 생활 인프라 데이터 */}
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
                    {/* 귀농 지원 */}
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

          {/* Data Source Notice */}
          <p className={s.sourceNotice}>
            출처: 기상청 종관기상관측(ASOS) | 공공데이터포털 (data.go.kr) |
            통계지리정보서비스(SGIS) | 건강보험심사평가원 | 교육부 NEIS |
            공공누리 제1유형
          </p>

        </>
      ) : (
        <div className={s.emptyState}>
          <p className={s.emptyStateText}>
            기상 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </p>
        </div>
      )}
    </div>
  );
}

// --- 서브 컴포넌트 ---

function ClimateCard({
  data,
  photo,
}: {
  data: ClimateData;
  photo?: UnsplashPhoto;
}) {
  const station = STATIONS.find((st) => st.stnId === data.stnId);

  return (
    <article className={s.climateCard}>
      {photo && (
        <div className={s.cardImageWrap}>
          <Image
            src={photo.smallUrl}
            alt={photo.alt}
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
        <p className={s.cardDescription}>{station?.description}</p>
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
    <tr>
      <td colSpan={colSpan} className={s.sectionDivider}>
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
      <td className={s.td}>{label}</td>
      {values.map((val, i) => {
        if (val === null) {
          return (
            <td key={i} className={s.td}>
              <span className={s.tdNoData}>—</span>
            </td>
          );
        }

        const isHighlighted =
          (highlight === "max" && val === maxVal) ||
          (highlight === "min" && val === minVal);

        return (
          <td key={i} className={s.td}>
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

