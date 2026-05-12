import { Lightbulb } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { fetchMultipleClimateData, type ClimateData } from "@/lib/api/weather";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { LazyClimateRadar } from "./charts-lazy";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { SwipeHint } from "@/components/ui/swipe-hint";
import type { RegionItem } from "./region-item";
import s from "./page.module.css";

interface Props {
  regions: RegionItem[];
  year: number;
}

/**
 * 기후 탭 — weather API만 fetch.
 * 첫 페인트 시 infra/suitability 데이터 의존 제거. 3 API 호출만으로 화면 완성.
 */
export async function ClimateView({ regions, year }: Props) {
  const stationIds = regions.map((r) => r.station.stnId);
  const climateData = await fetchMultipleClimateData(stationIds);

  if (climateData.length === 0) {
    return (
      <div className={s.viewEmptyState}>
        <p className={s.viewEmptyText}>
          기상 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const climateByStation = new Map(climateData.map((c) => [c.stnId, c]));

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
            if (!climate) {
              return <ClimateCardPlaceholder key={region.id} region={region} />;
            }
            return (
              <ClimateCard key={region.id} region={region} climate={climate} />
            );
          })}
        </div>
      </section>

      {/* 기후 비교 + 인사이트 (데스크탑 2단 grid) */}
      {regions.length >= 2 && (
        <div className={s.climateCompareGrid}>
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

          <div className={s.climateInsightCol}>
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
            <ClimateInsights
              regions={regions}
              climateByStation={climateByStation}
            />
          </div>
        </div>
      )}

      {/* 상세 비교 — 기후 항목만 */}
      <section aria-labelledby="climate-detail-heading">
        <div className={s.tableCard}>
          <div className={s.tableCardHeader}>
            <h2 id="climate-detail-heading" className={s.tableCardTitle}>
              기후 상세
            </h2>
            <p className={s.tableCardDesc}>
              {year}년 {climateData[0]?.period} 기준 관측 데이터
            </p>
          </div>
          <SwipeHint />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className={s.srOnly}>지역별 기후 상세 비교</caption>
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
                    (r) =>
                      climateByStation.get(r.station.stnId)?.avgHumidity ?? null,
                  )}
                  highlight="none"
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ReferenceNotice text="비교 데이터는 기상청 ASOS 관측소 일자료를 가공한 참고 자료예요. 시·군·구 선택 시 기상은 시·도 대표 관측소 데이터예요." />
      <DataSource source="기상청 종관기상관측(ASOS) · 공공데이터포털 (data.go.kr) · 공공누리 제1유형" />
    </>
  );
}

function ClimateCardPlaceholder({ region }: { region: RegionItem }) {
  return (
    <article className={`${s.climateCard} ${s.climateCardPlaceholder}`}>
      <div className={s.cardBody}>
        <span className={s.cardOverline}>
          {region.province.name}
          {region.sigungu && ` · ${region.sigungu.name}`}
        </span>
        <h3 className={s.cardTitle}>
          {region.sigungu ? region.sigungu.shortName : region.station.name}
        </h3>
        <hr className={s.cardDivider} />
        <p className={s.placeholderText}>
          기상 데이터를 일시적으로 불러오지 못했어요.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
      </div>
    </article>
  );
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

function ClimateInsights({
  regions,
  climateByStation,
}: {
  regions: RegionItem[];
  climateByStation: Map<string, ClimateData>;
}) {
  const withClimate = regions
    .map((r) => ({ region: r, climate: climateByStation.get(r.station.stnId) }))
    .filter(
      (e): e is { region: RegionItem; climate: ClimateData } => !!e.climate,
    );

  if (withClimate.length < 2) return null;

  const warmest = withClimate.reduce((a, b) =>
    a.climate.avgTemp > b.climate.avgTemp ? a : b,
  );
  const coolest = withClimate.reduce((a, b) =>
    a.climate.avgTemp < b.climate.avgTemp ? a : b,
  );
  const wettest = withClimate.reduce((a, b) =>
    a.climate.totalPrecipitation > b.climate.totalPrecipitation ? a : b,
  );
  const sunniest = withClimate.reduce((a, b) =>
    a.climate.totalSunshine > b.climate.totalSunshine ? a : b,
  );

  const insights = [
    {
      label: "가장 따뜻한 곳",
      region: warmest.region.label,
      value: `평균 ${warmest.climate.avgTemp}℃`,
    },
    {
      label: "가장 서늘한 곳",
      region: coolest.region.label,
      value: `평균 ${coolest.climate.avgTemp}℃`,
    },
    {
      label: "강수량 많은 곳",
      region: wettest.region.label,
      value: `${wettest.climate.totalPrecipitation.toLocaleString()}mm`,
    },
    {
      label: "일조 풍부한 곳",
      region: sunniest.region.label,
      value: `${sunniest.climate.totalSunshine.toLocaleString()}hr`,
    },
  ];

  return (
    <section
      aria-labelledby="climate-insights-heading"
      className={s.insightsCard}
    >
      <h3 id="climate-insights-heading" className={s.insightsTitle}>
        한눈에 보는 비교
      </h3>
      <ul className={s.insightsList}>
        {insights.map((item) => (
          <li key={item.label} className={s.insightItem}>
            <span className={s.insightLabel}>{item.label}</span>
            <span className={s.insightRegion}>{item.region}</span>
            <span className={s.insightValue}>{item.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function buildRegionSummary(
  regions: RegionItem[],
  climateByStation: Map<string, ClimateData>,
): string {
  if (regions.length < 2) return "";

  const parts: string[] = [];
  const withClimate = regions
    .map((r) => ({ region: r, climate: climateByStation.get(r.station.stnId) }))
    .filter(
      (e): e is { region: RegionItem; climate: ClimateData } => !!e.climate,
    );

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
