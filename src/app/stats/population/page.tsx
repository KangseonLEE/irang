import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, Users, TrendingUp } from "lucide-react";
import { populationData, populationSummary } from "@/lib/data/stats";
import s from "../stats.module.css";

export const metadata: Metadata = {
  title: "귀농·귀촌 인구 추이",
  description:
    "2015~2024년 귀농·귀촌 인구 10년 추이 데이터. 귀농 인구와 귀촌 인구 변화를 한눈에 확인하세요.",
};

/** 바 차트에서 최대값 대비 비율 계산 */
function barWidth(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

export default function PopulationPage() {
  const maxFarming = Math.max(...populationData.map((d) => d.farming));
  const maxRural = Math.max(...populationData.map((d) => d.rural));

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
          <Users size={16} aria-hidden="true" />
          Population Trend
        </span>
        <h1 className={s.headerTitle}>{populationSummary.title}</h1>
        <p className={s.headerDesc}>
          2015~2024년 10년간 귀농·귀촌 인구 변화를 데이터로 확인하세요.
        </p>
      </header>

      {/* 핵심 수치 */}
      <div className={s.card}>
        <div className={s.twoCol}>
          <div>
            <p className={s.bigNumber}>1.2만</p>
            <p className={s.bigNumberSub}>2024년 귀농 인구</p>
          </div>
          <div>
            <p className={s.bigNumber}>42.2만</p>
            <p className={s.bigNumberSub}>2024년 귀촌 인구 (전년 대비 +5.7%)</p>
          </div>
        </div>
      </div>

      {/* 바 차트 — 귀농 인구 */}
      <section className={s.card} aria-labelledby="chart-farming-title">
        <h2 className={s.cardTitle} id="chart-farming-title">
          <span className={s.cardTitleIcon} aria-hidden="true">
            <BarChart3 size={20} />
          </span>
          귀농 인구 추이
        </h2>
        <div className={s.chart} role="img" aria-label="2015년부터 2024년까지 귀농 인구 추이 바 차트">
          {populationData.map((d) => (
            <div className={s.chartRow} key={d.year}>
              <span className={s.chartLabel}>{d.year}</span>
              <div className={s.chartBarWrap}>
                <div
                  className={s.chartBar}
                  style={{ width: barWidth(d.farming, maxFarming) }}
                />
              </div>
              <span className={s.chartValue}>{d.farming}만</span>
            </div>
          ))}
        </div>
      </section>

      {/* 바 차트 — 귀촌 인구 */}
      <section className={s.card} aria-labelledby="chart-rural-title">
        <h2 className={s.cardTitle} id="chart-rural-title">
          <span className={s.cardTitleIcon} aria-hidden="true">
            <TrendingUp size={20} />
          </span>
          귀촌 인구 추이
        </h2>
        <div className={s.chart} role="img" aria-label="2015년부터 2024년까지 귀촌 인구 추이 바 차트">
          {populationData.map((d) => (
            <div className={s.chartRow} key={d.year}>
              <span className={s.chartLabel}>{d.year}</span>
              <div className={s.chartBarWrap}>
                <div
                  className={s.chartBarSecondary}
                  style={{ width: barWidth(d.rural, maxRural) }}
                />
              </div>
              <span className={s.chartValue}>{d.rural}만</span>
            </div>
          ))}
        </div>
      </section>

      {/* 테이블 */}
      <section className={s.card} aria-labelledby="table-title">
        <h2 className={s.cardTitle} id="table-title">
          <span className={s.cardTitleIcon} aria-hidden="true">
            <BarChart3 size={20} />
          </span>
          연도별 상세 데이터
        </h2>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th scope="col">연도</th>
                <th scope="col">귀농 (만 명)</th>
                <th scope="col">귀촌 (만 명)</th>
                <th scope="col">합계 (만 명)</th>
              </tr>
            </thead>
            <tbody>
              {populationData.map((d) => (
                <tr key={d.year}>
                  <td>{d.year}</td>
                  <td>{d.farming}</td>
                  <td>{d.rural}</td>
                  <td>{(d.farming + d.rural).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 분석 요약 */}
      <blockquote className={s.summary}>
        {populationSummary.description}
      </blockquote>

      {/* 출처 */}
      <p className={s.source}>
        <span className={s.sourceLabel}>출처:</span>
        {populationSummary.source}
      </p>

      {/* 다른 통계 보기 */}
      <nav className={s.navFooter} aria-label="다른 통계 페이지">
        <p className={s.navFooterTitle}>다른 통계 보기</p>
        <div className={s.navFooterLinks}>
          <span className={s.navFooterLinkActive} aria-current="page">
            귀농·귀촌 인구
          </span>
          <Link href="/stats/youth" className={s.navFooterLink}>
            청년 귀농 트렌드
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link href="/stats/satisfaction" className={s.navFooterLink}>
            귀농 만족도
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </div>
  );
}
