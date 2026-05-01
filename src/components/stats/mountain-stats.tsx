import Link from "next/link";
import {
  ArrowRight,
  Trees,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  mountainData,
  mountainSummary,
  mountainReasons,
  mountainCauses,
} from "@/lib/data/stats";
import { MountainTrendChart, FactorBarChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "@/app/stats/stats.module.css";

export function MountainStats() {
  const latest = mountainData[mountainData.length - 1];
  const prev = mountainData[mountainData.length - 2];
  const first = mountainData[0];
  const growthPct = (((latest.households / prev.households) - 1) * 100).toFixed(1);
  const totalGrowth = (((latest.households / first.households) - 1) * 100).toFixed(0);

  return (
    <section
      id="summary-mountain"
      className={s.dashboard}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby="tab-mountain"
    >
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Trees} size="sm" />
            Mountain Village
          </span>
          <h2 className={s.title} id="tabpanel-mountain-title">
            {mountainSummary.title}
          </h2>
          <p className={s.desc}>
            산촌진흥지역으로 이주하는 귀산촌 가구 추이와 이주 사유를 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.households.toLocaleString()}</span>
            <span className={s.kpiLabel}>2024 귀산촌 가구</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={ArrowUpRight} size="lg" className={s.kpiIcon} />
              +{growthPct}%
            </span>
            <span className={s.kpiLabel}>전년 대비 증가</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={TrendingUp} size="lg" className={s.kpiIcon} />
              +{totalGrowth}%
            </span>
            <span className={s.kpiLabel}>7년간 증가율</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={MapPin} size="lg" className={s.kpiIcon} />
              120+
            </span>
            <span className={s.kpiLabel}>산촌진흥지역</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="귀산촌 통계는 통계청·산림청 공공데이터를 가공한 참고 자료예요." />

      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="mountain-chart-title">
          <h3 className={s.cardTitle} id="mountain-chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            귀산촌 가구 추이
          </h3>
          <MountainTrendChart data={mountainData} />
          <DataSource source={mountainSummary.source} />
        </section>

        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="mountain-reasons-title">
            <h3 className={s.cardTitle} id="mountain-reasons-title">
              <Icon icon={Trees} size="lg" className={s.cardIcon} />
              귀산촌 사유
            </h3>
            <FactorBarChart
              data={mountainReasons}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={mountainSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="mountain-table-title">
            <h3 className={s.cardTitle} id="mountain-table-title">
              <Icon icon={BarChart3} size="lg" className={s.cardIcon} />
              연도별 상세 데이터
            </h3>
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">연도</th>
                    <th scope="col">귀산촌 가구</th>
                    <th scope="col">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[...mountainData].reverse().map((d) => {
                    const prevEntry = mountainData.find(
                      (e) => e.year === d.year - 1,
                    );
                    const diff =
                      prevEntry !== undefined
                        ? (((d.households / prevEntry.households) - 1) * 100).toFixed(1)
                        : "—";
                    return (
                      <tr key={d.year}>
                        <td>{d.year}</td>
                        <td>{d.households.toLocaleString()}가구</td>
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
            <DataSource source={mountainSummary.source} />
          </section>
        </div>
      </div>

      <section className={s.card}>
        <CauseAnalysisSection title="왜 산촌으로 떠날까?" causes={mountainCauses} />
      </section>

      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {mountainSummary.description}
        </blockquote>
        <Link href="/programs/roadmap?tab=mountain-fund" className={s.interviewCta}>
          <Icon icon={Trees} size="md" />
          <span>귀산촌 지원사업 보기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <footer className={s.footer}>
        <DataSource source={mountainSummary.source} />
      </footer>
    </section>
  );
}
