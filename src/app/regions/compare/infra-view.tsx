import { Users, Home, HeartPulse, GraduationCap, Wallet, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Icon } from "@/components/ui/icon";
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
import { LazyPopulationBars } from "./charts-lazy";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import type { RegionItem } from "./region-item";
import s from "./climate-view.module.css";
import shared from "./page.module.css";

interface Props {
  regions: RegionItem[];
}

interface RegionInfraData {
  region: RegionItem;
  population: number | null;
  householdCount: number | null;
  agingRate: number | null;
  medicalCount: number | null;
  schoolCount: number | null;
}

/**
 * 생활 인프라 탭 — 토스 스타일 metric stat card.
 * - 6 metric: 인구·가구·고령화·의료·학교·지원사업
 * - 차트는 보조로 (기존 LazyPopulationBars)
 * sgis + hira + education 호출이라 가장 무거움 — tab=infra 일 때만.
 */
export async function InfraView({ regions }: Props) {
  const infraData = await fetchInfraForRegions(regions);
  const infraByRegion = new Map(infraData.map((i) => [i.region.id, i]));

  if (infraData.length === 0) {
    return (
      <div className={shared.viewEmptyState}>
        <p className={shared.viewEmptyText}>
          인프라 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  const metrics = buildInfraMetricRows(regions, infraByRegion);

  return (
    <>
      {/* Hero Metric Cards */}
      <div className={s.metricGrid}>
        {metrics.map((m) => (
          <MetricStatCard key={m.id} metric={m} />
        ))}
      </div>

      {/* 보조 차트 (선택 region이 2개 이상일 때) */}
      {regions.length >= 2 && (
        <section
          className={shared.chartSection}
          aria-labelledby="infra-chart-heading"
        >
          <h2 id="infra-chart-heading" className={shared.chartSectionTitle}>
            인구·의료·학교 한눈에
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

      <ReferenceNotice text="시·군·구 선택 시 인구·의료·학교는 해당 시·군·구 단위 통계예요. 지원사업은 시·도 단위로 집계해요." />
      <DataSource source="통계지리정보서비스(SGIS) · 건강보험심사평가원 · 교육부 NEIS · 공공누리 제1유형" />
    </>
  );
}

// ============================================================================
// Metric Stat Card (climate-view와 동일 컴포넌트 — 공유 가능하나 view 격리)
// ============================================================================

interface MetricRow {
  id: string;
  title: string;
  unit: string;
  icon: LucideIcon;
  emphasis: "highest" | "lowest";
  emphasisLabelHighest: string;
  emphasisLabelLowest: string;
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

function buildInfraMetricRows(
  regions: RegionItem[],
  infraByRegion: Map<string, RegionInfraData>,
): MetricRow[] {
  const labelOf = (r: RegionItem) =>
    r.sigungu
      ? `${r.province.shortName} ${r.sigungu.shortName}`
      : r.province.shortName;

  const make = (
    id: string,
    title: string,
    unit: string,
    icon: LucideIcon,
    emphasis: "highest" | "lowest",
    high: string,
    low: string,
    pick: (i: RegionInfraData) => number | null,
  ): MetricRow => ({
    id,
    title,
    unit,
    icon,
    emphasis,
    emphasisLabelHighest: high,
    emphasisLabelLowest: low,
    rows: regions.map((r) => {
      const infra = infraByRegion.get(r.id);
      return {
        regionId: r.id,
        regionLabel: labelOf(r),
        value: infra ? pick(infra) : null,
      };
    }),
  });

  return [
    make(
      "population",
      "인구수",
      "명",
      Users,
      "highest",
      "가장 큰 지역",
      "가장 작은 지역",
      (i) => i.population,
    ),
    make(
      "household",
      "가구수",
      "가구",
      Home,
      "highest",
      "가구가 가장 많아요",
      "가구가 가장 적어요",
      (i) => i.householdCount,
    ),
    make(
      "aging",
      "고령화율",
      "%",
      TrendingDown,
      "lowest",
      "고령화 비율 높음",
      "젊은 지역이에요",
      (i) => i.agingRate,
    ),
    make(
      "medical",
      "의료기관 수",
      "개소",
      HeartPulse,
      "highest",
      "의료 인프라가 가장 풍부해요",
      "의료 인프라 적어요",
      (i) => i.medicalCount,
    ),
    make(
      "school",
      "학교 수",
      "개교",
      GraduationCap,
      "highest",
      "학교가 가장 많아요",
      "학교가 가장 적어요",
      (i) => i.schoolCount,
    ),
    {
      id: "programs",
      title: "모집 중 지원사업",
      unit: "건",
      icon: Wallet,
      emphasis: "highest",
      emphasisLabelHighest: "지원사업이 가장 많아요",
      emphasisLabelLowest: "지원사업이 적어요",
      rows: regions.map((r) => ({
        regionId: r.id,
        regionLabel: labelOf(r),
        value: PROGRAMS.filter(
          (p) =>
            p.linkStatus !== "broken" &&
            p.status === "모집중" &&
            (p.region === "전국" || p.region === r.province.name),
        ).length,
      })),
    },
  ];
}

// ============================================================================
// Data fetching (unchanged — sgis + hira + education, 시군구 우선)
// ============================================================================

async function fetchInfraForRegions(
  regions: RegionItem[],
): Promise<RegionInfraData[]> {
  const promises = regions.map(async (region) => {
    if (region.sigungu) {
      const [popResult, medResult, schResult] = await Promise.allSettled([
        fetchSigunguPopulationData(region.sigungu.sgisCode),
        fetchSigunguMedicalFacilities(
          region.station.hiraSidoCd,
          region.sigungu.hiraSgguCd,
        ),
        fetchSigunguSchoolCounts(region.station.eduCode, region.sigungu.name),
      ]);

      let pop = popResult.status === "fulfilled" ? popResult.value : null;
      let med = medResult.status === "fulfilled" ? medResult.value : null;
      let sch = schResult.status === "fulfilled" ? schResult.value : null;

      const needsFallback = !pop || !med || !sch;
      if (needsFallback) {
        const [popFb, medFb, schFb] = await Promise.allSettled([
          !pop
            ? fetchPopulationData([region.station.sgisCode])
            : Promise.resolve([]),
          !med
            ? fetchMedicalFacilities([region.station.hiraSidoCd])
            : Promise.resolve([]),
          !sch ? fetchSchoolCounts([region.station.eduCode]) : Promise.resolve([]),
        ]);
        if (!pop && popFb.status === "fulfilled" && popFb.value[0]) {
          pop = popFb.value[0];
        }
        if (!med && medFb.status === "fulfilled" && medFb.value[0]) {
          med = medFb.value[0];
        }
        if (!sch && schFb.status === "fulfilled" && schFb.value[0]) {
          sch = schFb.value[0];
        }
      }

      return {
        region,
        population: pop?.population ?? null,
        householdCount: pop?.householdCount ?? null,
        agingRate: pop?.agingRate ?? null,
        medicalCount: med?.totalCount ?? null,
        schoolCount: sch?.totalCount ?? null,
      };
    }

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
  });

  return Promise.all(promises);
}
