import Link from "next/link";
import {
  ArrowRight,
  Home,
  TrendingUp,
  TrendingDown,
  BarChart3,
  MessageCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  populationData,
  populationSummary,
  populationCauses,
  changePct,
  formatKoreanCount,
  signedPct,
  toCount,
} from "@/lib/data/stats";
import { PopulationTrendChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "./stats-shared.module.css";

/**
 * 귀촌 탭 — 귀촌 인구 추이만 표시
 * 만족도는 정착자 대상 조사이므로 귀촌 탭에서는 제외(데이터 신뢰성 부족).
 * 증감 부호·연도·기간은 populationData 에서 계산한다(10/3 정정 — "+" 고정이면 감소가 "+-13%"로 나왔다).
 */
export function VillageStats() {
  const latest = populationData[populationData.length - 1];
  const prev = populationData[populationData.length - 2];
  const first = populationData[0];
  const yoyPct = changePct(latest.rural, prev.rural);
  const totalChange = changePct(latest.rural, first.rural);
  const years = populationData.length;

  return (
    <section
      id="summary-village"
      className={s.dashboard}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby="tab-village"
    >
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Home} size="sm" />
            Village Trend
          </span>
          <h2 className={s.title} id="tabpanel-village-title">
            귀촌 인구는 어떻게 변했을까?
          </h2>
          <p className={s.desc}>
            농업과 무관하게 시골로 이주하는 귀촌 인구 {years}년 추이를 확인하세요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.rural.toFixed(1)}만</span>
            <span className={s.kpiLabel}>{latest.year} 귀촌인</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={yoyPct >= 0 ? ArrowUpRight : ArrowDownRight} size="lg" className={s.kpiIcon} />
              {signedPct(yoyPct)}
            </span>
            <span className={s.kpiLabel}>전년 대비</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={totalChange >= 0 ? TrendingUp : TrendingDown} size="lg" className={s.kpiIcon} />
              {signedPct(totalChange)}
            </span>
            <span className={s.kpiLabel}>{years}년 누적 변화</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Calendar} size="lg" className={s.kpiIcon} />
              {years}년
            </span>
            <span className={s.kpiLabel}>데이터 기간</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="귀촌 통계는 국가데이터처·농림축산식품부 공공데이터를 가공한 참고 자료예요." />

      <div className={s.dashGrid}>
        <section className={s.card} aria-labelledby="village-chart-title">
          <h3 className={s.cardTitle} id="village-chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            귀촌인 추이
          </h3>
          <PopulationTrendChart data={populationData} mode="rural" />
          <DataSource source={populationSummary.source} />
        </section>

        <section className={s.card} aria-labelledby="village-table-title">
          <h3 className={s.cardTitle} id="village-table-title">
            <Icon icon={BarChart3} size="lg" className={s.cardIcon} />
            연도별 상세 데이터
          </h3>
          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th scope="col">연도</th>
                  <th scope="col">귀촌인</th>
                  <th scope="col">전년 대비</th>
                </tr>
              </thead>
              <tbody>
                {[...populationData].reverse().map((d) => {
                  const prevEntry = populationData.find(
                    (e) => e.year === d.year - 1,
                  );
                  return (
                    <tr key={d.year}>
                      <td>{d.year}</td>
                      <td>{formatKoreanCount(toCount(d.rural))}명</td>
                      <td>{prevEntry ? signedPct(changePct(d.rural, prevEntry.rural)) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DataSource source={populationSummary.source} />
        </section>
      </div>

      <section className={s.card}>
        <CauseAnalysisSection
          title="귀촌 인구 변화의 배경"
          causes={populationCauses}
        />
      </section>

      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {populationSummary.description}
        </blockquote>
        <Link href="/interviews" className={s.interviewCta}>
          <Icon icon={MessageCircle} size="md" />
          <span>귀촌인들의 생생한 이야기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <footer className={s.footer}>
        <DataSource source={populationSummary.source} />
      </footer>
    </section>
  );
}
