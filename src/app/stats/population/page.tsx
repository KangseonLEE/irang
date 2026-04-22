import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import {
  populationData,
  populationSummary,
  populationCauses,
} from "@/lib/data/stats";
import { PopulationTrendChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./page.module.css";
import shared from "../stats.module.css";

export const metadata: Metadata = {
  title: "귀농 인구 통계 — 연도별 귀농·귀촌 현황",
  description:
    "연도별 귀농·귀촌 인구 추이, 지역별 귀농 인구 분포를 데이터로 확인하세요. 귀농 귀촌 동향과 증감 추이를 차트로 비교할 수 있어요.",
  keywords: ["귀농 인구", "귀농 통계", "귀촌 인구", "귀농 현황", "귀농 추이"],
};

export default function PopulationPage() {
  const latest = populationData[populationData.length - 1];
  const prev = populationData[populationData.length - 2];
  const totalLatest = latest.farming + latest.rural;
  const totalPrev = prev.farming + prev.rural;
  const growthPct = (((totalLatest - totalPrev) / totalPrev) * 100).toFixed(1);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "귀농 인구 통계", href: "/stats/population" }]} />
      {/* 뒤로가기 */}
      <Link href="/" className={shared.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        메인으로
      </Link>

      {/* ── 헤더 + KPI 한 블록 ── */}
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Users} size="sm" />
            Population Trend
          </span>
          <h1 className={s.title}>{populationSummary.title}</h1>
          <p className={s.desc}>
            2015~2024년 10년간 귀농·귀촌 인구 변화를 데이터로 확인하세요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.farming}만</span>
            <span className={s.kpiLabel}>2024 귀농 인구</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{latest.rural}만</span>
            <span className={s.kpiLabel}>2024 귀촌 인구</span>
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
              <Icon icon={Calendar} size="lg" className={s.kpiIcon} />
              10년
            </span>
            <span className={s.kpiLabel}>데이터 기간</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="통계 데이터는 통계청·농림축산식품부 공공데이터를 가공한 참고 자료예요." />

      {/* ── 메인 대시보드 그리드 ── */}
      <div className={s.dashGrid}>
        {/* 좌: 복합 차트 */}
        <section className={s.card} aria-labelledby="chart-title">
          <h2 className={s.cardTitle} id="chart-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            귀농·귀촌 인구 추이
          </h2>
          <PopulationTrendChart data={populationData} />
          <DataSource source={populationSummary.source} />
        </section>

        {/* 우: 테이블 */}
        <section className={s.card} aria-labelledby="table-title">
          <h2 className={s.cardTitle} id="table-title">
            <Icon icon={BarChart3} size="lg" className={s.cardIcon} />
            연도별 상세 데이터
          </h2>
          <div className={shared.tableWrap}>
            <table className={shared.table}>
              <thead>
                <tr>
                  <th scope="col">연도</th>
                  <th scope="col">귀농</th>
                  <th scope="col">귀촌</th>
                  <th scope="col">합계</th>
                </tr>
              </thead>
              <tbody>
                {[...populationData].reverse().map((d) => (
                  <tr key={d.year}>
                    <td>{d.year}</td>
                    <td>{d.farming}만</td>
                    <td>{d.rural}만</td>
                    <td>{(d.farming + d.rural).toFixed(1)}만</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DataSource source={populationSummary.source} />
        </section>
      </div>

      {/* ── 원인 분석 ── */}
      <section className={s.card}>
        <CauseAnalysisSection
          title="왜 이런 결과가 나왔을까?"
          causes={populationCauses}
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
      </footer>
    </div>
  );
}
