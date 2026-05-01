import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Users,
  Award,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon } from "@/components/ui/icon";
import {
  youthData,
  youthSummary,
  farmingReasons,
  youthCauses,
} from "@/lib/data/stats";
import { YouthTrendChart, FactorBarChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "@/app/stats/stats.module.css";

export function YouthStats() {
  const latest = youthData[youthData.length - 1];
  const first = youthData[0];
  const growthPp = (latest.ratio - first.ratio).toFixed(1);

  return (
    <section
      id="summary-youth"
      className={s.dashboard}
      aria-labelledby="tabpanel-youth-title"
    >
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Sprout} size="sm" />
            Youth Farming
          </span>
          <h2 className={s.title} id="tabpanel-youth-title">
            {youthSummary.title}
          </h2>
          <p className={s.desc}>
            전체 귀농인 중 40세 미만 청년 비율 10년 추이와 귀농 사유를 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.ratio}%</span>
            <span className={s.kpiLabel}>2024 청년 비율</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={TrendingUp} size="lg" className={s.kpiIcon} />
              +{growthPp}%p
            </span>
            <span className={s.kpiLabel}>10년간 증가폭</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Award} size="lg" className={s.kpiIcon} />
              역대 최고
            </span>
            <span className={s.kpiLabel}>2024 기록</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Users} size="lg" className={s.kpiIcon} />
              40세 미만
            </span>
            <span className={s.kpiLabel}>대상 연령</span>
          </div>
        </div>
      </header>

      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="youth-chart-title">
          <h3 className={s.cardTitle} id="youth-chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            청년 귀농 비율 추이
          </h3>
          <YouthTrendChart data={youthData} />
          <DataSource source={youthSummary.source} />
        </section>

        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="youth-reasons-title">
            <h3 className={s.cardTitle} id="youth-reasons-title">
              <Icon icon={Sprout} size="lg" className={s.cardIcon} />
              귀농 사유 Top 5
            </h3>
            <FactorBarChart
              data={farmingReasons}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={youthSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="youth-table-title">
            <h3 className={s.cardTitle} id="youth-table-title">
              <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
              연도별 상세 데이터
            </h3>
            <div className={tableStyles.tableWrap}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th scope="col">연도</th>
                    <th scope="col">청년 비율</th>
                    <th scope="col">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[...youthData].reverse().map((d) => {
                    const prevEntry = youthData.find((e) => e.year === d.year - 1);
                    const diff =
                      prevEntry !== undefined
                        ? (d.ratio - prevEntry.ratio).toFixed(1)
                        : "—";
                    return (
                      <tr key={d.year}>
                        <td>{d.year}</td>
                        <td>{d.ratio}%</td>
                        <td>
                          {diff === "—"
                            ? diff
                            : `${Number(diff) >= 0 ? "+" : ""}${diff}%p`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <DataSource source={youthSummary.source} />
          </section>
        </div>
      </div>

      <section className={s.card}>
        <CauseAnalysisSection
          title="왜 청년 귀농이 늘고 있을까?"
          causes={youthCauses}
        />
      </section>

      <div className={s.bottomRow}>
        <blockquote className={s.summary}>{youthSummary.description}</blockquote>
        <Link href="/interviews" className={s.interviewCta}>
          <Icon icon={MessageCircle} size="md" />
          <span>청년 귀농인들의 이야기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <ReferenceNotice text="청년 귀농 데이터는 통계청·농림축산식품부 공공데이터를 가공한 참고 자료예요." />

      <footer className={s.footer}>
        <DataSource source={youthSummary.source} />
      </footer>
    </section>
  );
}
