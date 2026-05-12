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
import { SwipeHint } from "@/components/ui/swipe-hint";
import type { RegionItem } from "./region-item";
import s from "./page.module.css";

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
 * 생활 인프라 탭 — sgis + hira + education API + 정적 PROGRAMS.
 * region별 시군구 단위 우선 → null fallback 시 시도 단위.
 * 가장 느린 fetch 경로 — tab=infra 일 때만 호출.
 */
export async function InfraView({ regions }: Props) {
  const infraData = await fetchInfraForRegions(regions);
  const infraByRegion = new Map(infraData.map((i) => [i.region.id, i]));

  if (infraData.length === 0) {
    return (
      <div className={s.viewEmptyState}>
        <p className={s.viewEmptyText}>
          인프라 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* 인프라 차트 */}
      {regions.length >= 2 && (
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

      {/* 상세 비교 — 인프라 + 지원사업 */}
      <section aria-labelledby="infra-detail-heading">
        <div className={s.tableCard}>
          <div className={s.tableCardHeader}>
            <h2 id="infra-detail-heading" className={s.tableCardTitle}>
              인프라 상세
            </h2>
            <p className={s.tableCardDesc}>
              인구·의료·교육 인프라와 모집 중인 지원사업
            </p>
          </div>
          <SwipeHint />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <caption className={s.srOnly}>
                지역별 인프라·지원사업 상세 비교
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

      <ReferenceNotice text="시·군·구 선택 시 인구·의료·학교는 해당 시·군·구 단위 통계예요. 지원사업은 시·도 단위로 집계해요." />
      <DataSource source="통계지리정보서비스(SGIS) · 건강보험심사평가원 · 교육부 NEIS · 공공누리 제1유형" />
    </>
  );
}

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
