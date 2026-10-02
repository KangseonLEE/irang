import Link from "next/link";
import {
  ArrowRight,
  Trees,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  mountainData,
  mountainSummary,
  mountainReasons,
  mountainCauses,
  mountainVillageArea,
  reasonsSource,
  changePct,
  signedPct,
} from "@/lib/data/stats";
import { MountainTrendChart, FactorBarChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./stats-dashboard.module.css";
import tableStyles from "./stats-shared.module.css";

/**
 * 귀산촌 탭. 수치는 mountainData(국가데이터처 귀산촌 가구)에서 계산하고,
 * 숫자 포맷은 ko-KR 로 고정한다(통계 탭은 클라이언트 트리라 de-DE 브라우저에서 #418 — 10/3 FE-C 실측).
 */
export function MountainStats() {
  const latest = mountainData[mountainData.length - 1];
  const prev = mountainData[mountainData.length - 2];
  const first = mountainData[0];
  const growthPct = changePct(latest.households, prev.households);
  const totalChange = changePct(latest.households, first.households);
  const years = mountainData.length;

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
            산림기본법상 산촌으로 옮긴 귀산촌 가구 추이와 전입 사유를 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.households.toLocaleString("ko-KR")}</span>
            <span className={s.kpiLabel}>{latest.year} 귀산촌 가구</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={growthPct >= 0 ? ArrowUpRight : ArrowDownRight} size="lg" className={s.kpiIcon} />
              {signedPct(growthPct)}
            </span>
            <span className={s.kpiLabel}>전년 대비</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={totalChange >= 0 ? TrendingUp : TrendingDown} size="lg" className={s.kpiIcon} />
              {signedPct(totalChange)}
            </span>
            <span className={s.kpiLabel}>{years}년간 변화</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={MapPin} size="lg" className={s.kpiIcon} />
              {mountainVillageArea.eupmyeon}곳
            </span>
            <span className={s.kpiLabel}>산촌 읍·면</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="귀산촌 통계는 국가데이터처·산림청 공공데이터를 가공한 참고 자료예요." />

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
              귀산촌 전입 사유
            </h3>
            <FactorBarChart
              data={mountainReasons}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={reasonsSource} />
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
                    return (
                      <tr key={d.year}>
                        <td>{d.year}</td>
                        <td>{d.households.toLocaleString("ko-KR")}가구</td>
                        <td>
                          {prevEntry ? signedPct(changePct(d.households, prevEntry.households)) : "—"}
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
        {/* 10/3: tab 값은 normalize 화이트리스트(gov-roadmap id)와 같아야 한다 — "mountain-fund" 는 308 로 떨어졌다 */}
        <Link href="/programs/roadmap?tab=forest-village" className={s.interviewCta}>
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
