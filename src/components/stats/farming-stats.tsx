import Link from "next/link";
import {
  ArrowRight,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MessageCircle,
  Calendar,
  ArrowUpRight,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Clock,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  populationData,
  populationSummary,
  populationCauses,
  satisfactionSegments,
  satisfactionFactors,
  dissatisfactionFactors,
  satisfactionSummary,
  satisfactionCauses,
} from "@/lib/data/stats";
import {
  PopulationTrendChart,
  SatisfactionDonutChart,
  FactorBarChart,
} from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "@/app/stats/stats.module.css";

/**
 * 귀농 탭 — 인구 추이 + 만족도 통합
 * 만족도는 귀농인을 대상으로 한 조사이므로 귀농 탭에 흡수.
 * 귀촌(rural)은 별도 village-stats에서 처리.
 */
export function FarmingStats() {
  // 인구 KPI
  const popLatest = populationData[populationData.length - 1];
  const popPrev = populationData[populationData.length - 2];
  const popGrowth = (
    ((popLatest.farming - popPrev.farming) / popPrev.farming) *
    100
  ).toFixed(1);

  // 만족도 KPI
  const totalSatisfied = satisfactionSegments
    .filter((d) => d.label === "매우 만족" || d.label === "만족")
    .reduce((sum, d) => sum + d.pct, 0);

  return (
    <section
      id="summary-farming"
      className={s.dashboard}
      aria-labelledby="tabpanel-farming-title"
    >
      {/* ── 헤더 + KPI ── */}
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Users} size="sm" />
            Farming Trend
          </span>
          <h2 className={s.title} id="tabpanel-farming-title">
            귀농 인구는 얼마나 늘고 있을까?
          </h2>
          <p className={s.desc}>
            2015~2024년 10년간 귀농 인구 변화와 귀농인의 생활 만족도를 한눈에 확인하세요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{popLatest.farming}만</span>
            <span className={s.kpiLabel}>2024 귀농 인구</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={ArrowUpRight} size="lg" className={s.kpiIcon} />
              {Number(popGrowth) >= 0 ? "+" : ""}
              {popGrowth}%
            </span>
            <span className={s.kpiLabel}>전년 대비 증감</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{totalSatisfied}%</span>
            <span className={s.kpiLabel}>전체 만족도</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Calendar} size="lg" className={s.kpiIcon} />
              10년
            </span>
            <span className={s.kpiLabel}>데이터 기간</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="귀농 통계와 만족도는 통계청·농림축산식품부 공공데이터를 가공한 참고 자료예요." />

      {/* ── 인구 추이 + 연도별 표 ── */}
      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="farming-chart-title">
          <h3 className={s.cardTitle} id="farming-chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            귀농 인구 추이
          </h3>
          <PopulationTrendChart data={populationData} mode="farming" />
          <DataSource source={populationSummary.source} />
        </section>

        <section className={s.card} aria-labelledby="farming-table-title">
          <h3 className={s.cardTitle} id="farming-table-title">
            <Icon icon={BarChart3} size="lg" className={s.cardIcon} />
            연도별 상세 데이터
          </h3>
          <FarmingYearlyTable />
          <DataSource source={populationSummary.source} />
        </section>
      </div>

      {/* ── 만족도 분포 + 만족/불만족 요인 ── */}
      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="farming-sat-title">
          <h3 className={s.cardTitle} id="farming-sat-title">
            <Icon icon={Heart} size="lg" className={s.cardIcon} />
            만족도 분포
          </h3>
          <SatisfactionDonutChart data={satisfactionSegments} />
          <DataSource source={satisfactionSummary.source} />
        </section>

        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="farming-pos-title">
            <h3 className={s.cardTitle} id="farming-pos-title">
              <Icon icon={ThumbsUp} size="lg" className={s.cardIcon} />
              만족 요인
            </h3>
            <FactorBarChart
              data={satisfactionFactors}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={satisfactionSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="farming-neg-title">
            <h3 className={s.cardTitle} id="farming-neg-title">
              <Icon icon={ThumbsDown} size="lg" className={s.cardIcon} />
              불만족 요인
            </h3>
            <FactorBarChart
              data={dissatisfactionFactors}
              variant="negative"
              highlightTop={2}
            />
            <DataSource source={satisfactionSummary.source} />
          </section>
        </div>
      </div>

      {/* ── 추가 KPI 행 (만족도 보조 지표) ── */}
      <div className={s.kpiRow}>
        <div className={s.kpiItem}>
          <span className={s.kpiValue}>
            <Icon icon={TrendingDown} size="lg" className={s.kpiIcon} />
            25%
          </span>
          <span className={s.kpiLabel}>생활비 절감</span>
        </div>
        <div className={s.kpiDivider} />
        <div className={s.kpiItem}>
          <span className={s.kpiValue}>
            <Icon icon={Clock} size="lg" className={s.kpiIcon} />
            3년
          </span>
          <span className={s.kpiLabel}>정착 분기점</span>
        </div>
        <div className={s.kpiDivider} />
        <div className={s.kpiItem}>
          <span className={s.kpiValue}>
            <Icon icon={Users} size="lg" className={s.kpiIcon} />
            75%
          </span>
          <span className={s.kpiLabel}>지역 관계 만족</span>
        </div>
        <div className={s.kpiDivider} />
        <div className={s.kpiItem}>
          <span className={s.kpiValue}>{popLatest.farming}만</span>
          <span className={s.kpiLabel}>2024 가구 수</span>
        </div>
      </div>

      {/* ── 원인 분석 (인구 + 만족도) ── */}
      <section className={s.card}>
        <CauseAnalysisSection
          title="귀농 인구 변화의 배경"
          causes={populationCauses}
        />
      </section>

      <section className={s.card}>
        <CauseAnalysisSection
          title="만족과 불만족, 그 이유는?"
          causes={satisfactionCauses}
        />
      </section>

      {/* ── 요약 + 인터뷰 CTA ── */}
      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {populationSummary.description}
        </blockquote>
        <Link href="/interviews" className={s.interviewCta}>
          <Icon icon={MessageCircle} size="md" />
          <span>귀농인들의 생생한 이야기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      {/* ── 출처 ── */}
      <footer className={s.footer}>
        <DataSource source={populationSummary.source} />
        <DataSource source={satisfactionSummary.source} />
      </footer>
    </section>
  );
}

/* ── 연도별 표 (귀농만) ── */
function FarmingYearlyTable() {
  return (
    <div className={tableStyles.tableWrap}>
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th scope="col">연도</th>
            <th scope="col">귀농 인구</th>
            <th scope="col">전년 대비</th>
          </tr>
        </thead>
        <tbody>
          {[...populationData].reverse().map((d) => {
            const prevEntry = populationData.find((e) => e.year === d.year - 1);
            const diff =
              prevEntry !== undefined
                ? (((d.farming - prevEntry.farming) / prevEntry.farming) * 100).toFixed(1)
                : "—";
            return (
              <tr key={d.year}>
                <td>{d.year}</td>
                <td>{d.farming}만</td>
                <td>
                  {diff === "—"
                    ? diff
                    : `${Number(diff) >= 0 ? "+" : ""}${diff}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
