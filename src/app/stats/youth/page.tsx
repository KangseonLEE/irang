import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, TrendingUp, Sprout } from "lucide-react";
import { youthData, youthSummary, farmingReasons, youthCauses } from "@/lib/data/stats";
import YouthTrendChart from "@/components/charts/youth-trend-chart";
import FactorBarChart from "@/components/charts/factor-bar-chart";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import s from "../stats.module.css";

export const metadata: Metadata = {
  title: "청년 귀농 트렌드",
  description:
    "2015~2024년 전체 귀농인 중 청년(40세 미만) 비율 추이와 귀농 사유 분석.",
};

export default function YouthPage() {
  return (
    <div className={s.page}>
      {/* 뒤로가기 */}
      <Link href="/" className={s.backLink}>
        <ArrowLeft size={16} aria-hidden="true" />
        메인으로
      </Link>

      {/* 페이지 헤더 */}
      <header className={s.pageHeader}>
        <span className={s.headerOverline}>
          <Sprout size={16} aria-hidden="true" />
          Youth Farming
        </span>
        <h1 className={s.headerTitle}>{youthSummary.title}</h1>
        <p className={s.headerDesc}>
          전체 귀농인 중 40세 미만 청년 비율 10년 추이와 귀농 사유를 분석합니다.
        </p>
      </header>

      {/* 핵심 수치 */}
      <div className={s.card}>
        <div className={s.twoCol}>
          <div>
            <p className={s.bigNumber}>13.1%</p>
            <p className={s.bigNumberSub}>2024년 청년 귀농 비율 (역대 최고)</p>
          </div>
          <div>
            <p className={s.bigNumber}>+4.9%p</p>
            <p className={s.bigNumberSub}>10년간 증가폭 (2015 대비)</p>
          </div>
        </div>
      </div>

      {/* 막대 + 추세선 혼합 차트 */}
      <section className={s.card} aria-labelledby="chart-youth-title">
        <h2 className={s.cardTitle} id="chart-youth-title">
          <span className={s.cardTitleIcon} aria-hidden="true">
            <TrendingUp size={20} />
          </span>
          청년 귀농 비율 추이 (40세 미만)
        </h2>
        <YouthTrendChart data={youthData} />
      </section>

      {/* 테이블 */}
      <section className={s.card} aria-labelledby="table-youth-title">
        <h2 className={s.cardTitle} id="table-youth-title">
          <span className={s.cardTitleIcon} aria-hidden="true">
            <TrendingUp size={20} />
          </span>
          연도별 상세 데이터
        </h2>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">연도</th>
                <th scope="col">청년 비율 (%)</th>
                <th scope="col">전년 대비</th>
              </tr>
            </thead>
            <tbody>
              {youthData.map((d, i) => {
                const prev = i > 0 ? youthData[i - 1].ratio : null;
                const diff = prev !== null ? (d.ratio - prev).toFixed(1) : "—";
                return (
                  <tr key={d.year}>
                    <td>{d.year}</td>
                    <td>{d.ratio}%</td>
                    <td>{diff === "—" ? diff : `+${diff}%p`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 귀농 사유 Top 5 — 인터랙티브 수평 바 */}
      <section className={s.card} aria-labelledby="reasons-title">
        <h2 className={s.cardTitle} id="reasons-title">
          <span className={s.cardTitleIcon} aria-hidden="true">
            <Sprout size={20} />
          </span>
          귀농 사유 Top 5
        </h2>
        <FactorBarChart data={farmingReasons} variant="positive" highlightTop={2} />
      </section>

      {/* 원인 분석 */}
      <section className={s.card}>
        <CauseAnalysisSection
          title="왜 청년 귀농이 늘고 있을까?"
          causes={youthCauses}
        />
      </section>

      {/* 분석 요약 */}
      <blockquote className={s.summary}>
        {youthSummary.description}
      </blockquote>

      {/* 출처 */}
      <p className={s.source}>
        <span className={s.sourceLabel}>출처:</span>
        {youthSummary.source}
      </p>

      {/* 다른 통계 보기 */}
      <nav className={s.navFooter} aria-label="다른 통계 페이지">
        <p className={s.navFooterTitle}>다른 통계 보기</p>
        <div className={s.navFooterLinks}>
          <Link href="/stats/population" className={s.navFooterLink}>
            귀농·귀촌 인구
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <span className={s.navFooterLinkActive} aria-current="page">
            청년 귀농 트렌드
          </span>
          <Link href="/stats/satisfaction" className={s.navFooterLink}>
            귀농 만족도
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
