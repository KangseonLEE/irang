import { Lightbulb, Thermometer, CloudRain, Sun, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { fetchMultipleClimateData, type ClimateData } from "@/lib/api/weather";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { LazyClimateRadar } from "./charts-lazy";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import { SwipeHint } from "@/components/ui/swipe-hint";
import type { RegionItem } from "./region-item";
import s from "./climate-view.module.css";
import shared from "./page.module.css";

interface Props {
  regions: RegionItem[];
  year: number;
}

/**
 * 기후 탭 — 토스 스타일 통합 비교.
 * - 상단: Region headline strip + 4 metric stat card
 * - 가운데: Radar + 한줄 요약 + 인사이트
 * - 하단: Region description + 정확한 수치 detail table
 */
export async function ClimateView({ regions, year }: Props) {
  const stationIds = regions.map((r) => r.station.stnId);
  const climateData = await fetchMultipleClimateData(stationIds);

  if (climateData.length === 0) {
    return (
      <div className={shared.viewEmptyState}>
        <p className={shared.viewEmptyText}>
          기상 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const climateByStation = new Map(climateData.map((c) => [c.stnId, c]));

  // metric별 region 값 추출 (placeholder region은 null)
  const metrics = buildMetricRows(regions, climateByStation);

  return (
    <>
      {/* Hero Metric Cards — 토스 스타일 */}
      <div className={s.metricGrid}>
        {metrics.map((m) => (
          <MetricStatCard key={m.id} metric={m} />
        ))}
      </div>

      {/* 기후 비교 차트 + 인사이트 (데스크탑 2단) */}
      {regions.length >= 2 && (
        <div className={shared.climateCompareGrid}>
          <section
            className={shared.chartSection}
            aria-labelledby="climate-chart-heading"
          >
            <h2 id="climate-chart-heading" className={shared.chartSectionTitle}>
              기후 종합 비교
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

          <div className={shared.climateInsightCol}>
            <section
              aria-labelledby="onesummary-heading"
              className={shared.oneSummaryCard}
            >
              <h2 id="onesummary-heading" className={shared.oneSummaryTitle}>
                <Icon icon={Lightbulb} size="md" />
                한줄 요약
              </h2>
              <p className={shared.oneSummaryText}>
                {buildRegionSummary(regions, climateByStation)}
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Region 컨텍스트 — description (있는 경우만) */}
      <RegionContextStrip regions={regions} />

      {/* 상세 비교 — 더 정확한 수치 (최고/최저 기온 포함) */}
      <section aria-labelledby="climate-detail-heading">
        <div className={shared.tableCard}>
          <div className={shared.tableCardHeader}>
            <h2 id="climate-detail-heading" className={shared.tableCardTitle}>
              정확한 수치 비교
            </h2>
            <p className={shared.tableCardDesc}>
              {year}년 {climateData[0]?.period} 기준 관측 데이터
            </p>
          </div>
          <SwipeHint />
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <caption className={shared.srOnly}>지역별 기후 상세 비교</caption>
              <thead>
                <tr>
                  <th className={shared.th} scope="col">
                    항목
                  </th>
                  {regions.map((r) => (
                    <th key={r.id} className={shared.th} scope="col">
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

// ============================================================================
// Metric Stat Card — 토스 스타일 region 비교 막대
// ============================================================================

interface MetricRow {
  id: string;
  title: string;
  unit: string;
  icon: LucideIcon;
  /** "highest"는 가장 큰 값을 강조, "lowest"는 가장 작은 값을 강조. */
  emphasis: "highest" | "lowest";
  emphasisLabelHighest: string; // e.g. "가장 따뜻해요"
  emphasisLabelLowest: string; // e.g. "가장 서늘해요"
  rows: { regionId: string; regionLabel: string; value: number | null }[];
}

function MetricStatCard({ metric }: { metric: MetricRow }) {
  const validValues = metric.rows
    .filter((r): r is { regionId: string; regionLabel: string; value: number } =>
      r.value !== null,
    );

  if (validValues.length === 0) {
    return (
      <article className={s.metricCard}>
        <header className={s.metricCardHeader}>
          <span className={s.metricCardIcon}>
            <Icon icon={metric.icon} size="sm" />
          </span>
          <h3 className={s.metricCardTitle}>{metric.title}</h3>
          <span className={s.metricCardUnit}>{metric.unit}</span>
        </header>
        <p className={s.metricCardEmpty}>측정값을 불러오지 못했어요</p>
      </article>
    );
  }

  const maxVal = Math.max(...validValues.map((r) => r.value));
  const minVal = Math.min(...validValues.map((r) => r.value));
  const range = maxVal - minVal;
  // 막대 시각화 — 막대 길이는 0~100%. range가 0이면 100% 통일.
  const barPercent = (v: number) =>
    range === 0 ? 100 : 35 + ((v - minVal) / range) * 65;

  const targetVal = metric.emphasis === "highest" ? maxVal : minVal;
  const target = validValues.find((r) => r.value === targetVal);

  return (
    <article className={s.metricCard}>
      <header className={s.metricCardHeader}>
        <span className={s.metricCardIcon}>
          <Icon icon={metric.icon} size="sm" />
        </span>
        <h3 className={s.metricCardTitle}>{metric.title}</h3>
        <span className={s.metricCardUnit}>{metric.unit}</span>
      </header>
      <ul className={s.metricRowList}>
        {metric.rows.map((r) => {
          const isTarget = r.value !== null && r.value === targetVal;
          return (
            <li key={r.regionId} className={s.metricRow}>
              <span className={s.metricRowLabel}>{r.regionLabel}</span>
              <div
                className={`${s.metricRowBarTrack} ${isTarget ? s.metricRowBarTrackTarget : ""}`}
              >
                {r.value !== null && (
                  <div
                    className={`${s.metricRowBar} ${isTarget ? s.metricRowBarTarget : ""}`}
                    style={{ width: `${barPercent(r.value)}%` }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`${s.metricRowValue} ${isTarget ? s.metricRowValueTarget : ""}`}
                >
                  {r.value === null ? "—" : r.value.toLocaleString()}
                  {r.value !== null && (
                    <span className={s.metricRowUnit}>{metric.unit}</span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      {target && validValues.length >= 2 && (
        <footer className={s.metricCardFooter}>
          <span className={s.metricCardFooterLabel}>
            {metric.emphasis === "highest"
              ? metric.emphasisLabelHighest
              : metric.emphasisLabelLowest}
          </span>
          <span className={s.metricCardFooterRegion}>{target.regionLabel}</span>
        </footer>
      )}
    </article>
  );
}

function buildMetricRows(
  regions: RegionItem[],
  climateByStation: Map<string, ClimateData>,
): MetricRow[] {
  const make = (
    id: string,
    title: string,
    unit: string,
    icon: LucideIcon,
    emphasis: "highest" | "lowest",
    high: string,
    low: string,
    pick: (c: ClimateData) => number,
  ): MetricRow => ({
    id,
    title,
    unit,
    icon,
    emphasis,
    emphasisLabelHighest: high,
    emphasisLabelLowest: low,
    rows: regions.map((r) => {
      const climate = climateByStation.get(r.station.stnId);
      return {
        regionId: r.id,
        regionLabel: r.sigungu
          ? `${r.province.shortName} ${r.sigungu.shortName}`
          : r.province.shortName,
        value: climate ? pick(climate) : null,
      };
    }),
  });

  return [
    make(
      "avgTemp",
      "평균기온",
      "℃",
      Thermometer,
      "highest",
      "가장 따뜻해요",
      "가장 서늘해요",
      (c) => c.avgTemp,
    ),
    make(
      "precip",
      "누적 강수량",
      "mm",
      CloudRain,
      "highest",
      "비가 가장 많아요",
      "비가 가장 적어요",
      (c) => c.totalPrecipitation,
    ),
    make(
      "sunshine",
      "누적 일조시간",
      "hr",
      Sun,
      "highest",
      "햇볕이 가장 풍부해요",
      "햇볕이 가장 적어요",
      (c) => c.totalSunshine,
    ),
    make(
      "humidity",
      "평균 습도",
      "%",
      Droplets,
      "highest",
      "가장 습해요",
      "가장 건조해요",
      (c) => c.avgHumidity,
    ),
  ];
}

// ============================================================================
// Region Description Strip — 카드 나열 대신 한 줄로 컨텍스트만
// ============================================================================

function RegionContextStrip({ regions }: { regions: RegionItem[] }) {
  const items = regions
    .map((r) => ({
      region: r,
      text: r.sigungu?.description ?? r.station.description ?? null,
    }))
    .filter((e): e is { region: RegionItem; text: string } => e.text !== null);

  if (items.length === 0) return null;

  return (
    <section className={s.contextStrip} aria-label="지역 컨텍스트">
      {items.map(({ region, text }) => (
        <div key={region.id} className={s.contextItem}>
          <span className={s.contextLabel}>
            {region.sigungu
              ? `${region.province.shortName} ${region.sigungu.shortName}`
              : region.province.shortName}
          </span>
          <p className={s.contextText}>
            <AutoGlossary text={text} />
          </p>
        </div>
      ))}
    </section>
  );
}

// ============================================================================
// 정확한 수치 비교 테이블 (기존 패턴 유지)
// ============================================================================

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
      <td className={shared.tdLabel}>{label}</td>
      {values.map((val, i) => {
        if (val === null) {
          return (
            <td key={i} className={shared.tdValue}>
              <span className={shared.tdNoData}>—</span>
            </td>
          );
        }
        const isHighlighted =
          (highlight === "max" && val === maxVal) ||
          (highlight === "min" && val === minVal);
        return (
          <td key={i} className={shared.tdValue}>
            <span className={isHighlighted ? shared.tdHighlight : undefined}>
              {val.toLocaleString()}
            </span>
            <span className={shared.tdUnit}>{unit}</span>
          </td>
        );
      })}
    </tr>
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
