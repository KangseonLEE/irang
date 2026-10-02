import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Users,
  Award,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/lib/icons/irang-sprout";
import { Icon } from "@/components/ui/icon";
import {
  youthData,
  youthSummary,
  youthFarmingReasons,
  farmingReasonsSource,
  youthCauses,
} from "@/lib/data/stats";
import { YouthTrendChart, FactorBarChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "./stats-shared.module.css";

/** 소수 첫째 자리 %p, 부호는 값에서 */
function signedPp(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%p`;
}

export function YouthStats() {
  const latest = youthData[youthData.length - 1];
  const first = youthData[0];
  const best = youthData.reduce((a, b) => (b.ratio > a.ratio ? b : a));
  const growthPp = Number((latest.ratio - first.ratio).toFixed(1));
  const years = youthData.length;

  return (
    <section
      id="summary-youth"
      className={s.dashboard}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby="tab-youth"
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
            귀농가구주 중 30대 이하 비중 {years}년 추이와 청년이 꼽은 귀농 이유를 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.ratio}%</span>
            <span className={s.kpiLabel}>{latest.year} 청년 비중</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={growthPp >= 0 ? TrendingUp : TrendingDown} size="lg" className={s.kpiIcon} />
              {signedPp(growthPp)}
            </span>
            <span className={s.kpiLabel}>{years}년간 변화</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Award} size="lg" className={s.kpiIcon} />
              {best.ratio}%
            </span>
            <span className={s.kpiLabel}>최고 {best.year}년</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Users} size="lg" className={s.kpiIcon} />
              30대 이하
            </span>
            <span className={s.kpiLabel}>귀농가구주 기준</span>
          </div>
        </div>
      </header>

      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="youth-chart-title">
          <h3 className={s.cardTitle} id="youth-chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            청년 귀농 비중 추이
          </h3>
          <YouthTrendChart data={youthData} />
          <DataSource source={youthSummary.source} />
        </section>

        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="youth-reasons-title">
            <h3 className={s.cardTitle} id="youth-reasons-title">
              <Icon icon={Sprout} size="lg" className={s.cardIcon} />
              청년이 꼽은 귀농 이유
            </h3>
            <FactorBarChart
              data={youthFarmingReasons}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={farmingReasonsSource} />
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
                    <th scope="col">청년 비중</th>
                    <th scope="col">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[...youthData].reverse().map((d) => {
                    const prevEntry = youthData.find((e) => e.year === d.year - 1);
                    return (
                      <tr key={d.year}>
                        <td>{d.year}</td>
                        <td>{d.ratio}%</td>
                        <td>{prevEntry ? signedPp(d.ratio - prevEntry.ratio) : "—"}</td>
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
          title="청년 귀농 비중 변화의 배경"
          causes={youthCauses}
        />
      </section>

      <div className={s.bottomRow}>
        <blockquote className={s.summary}>{youthSummary.description}</blockquote>
        <Link href="/interviews" className={s.interviewCta}>
          <Icon icon={MessageCircle} size="md" />
          <span>청년 정착자들의 이야기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <ReferenceNotice text="청년 귀농 데이터는 국가데이터처·농림축산식품부 공공데이터를 가공한 참고 자료예요." />

      <footer className={s.footer}>
        <DataSource source={youthSummary.source} />
        <DataSource source={farmingReasonsSource} />
      </footer>
    </section>
  );
}
