import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Target,
  Sprout,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import {
  smartfarmData,
  smartfarmSummary,
  smartfarmCrops,
  smartfarmCauses,
} from "@/lib/data/stats";
import { SmartfarmTrendChart, FactorBarChart } from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./page.module.css";
import shared from "../stats.module.css";

export const metadata: Metadata = {
  title: "스마트팜 현황 — 도입 농가·시설면적 통계",
  description:
    "스마트팜 도입 농가 수, 시설면적 추이, 주요 재배 작물을 데이터로 확인하세요. 정부 지원 정책과 청년창업보육센터 정보도 함께 제공해요.",
  keywords: ["스마트팜", "스마트팜 현황", "스마트팜 농가", "스마트팜 지원", "혁신밸리"],
  alternates: { canonical: "/stats/smartfarm" },
};

export default function SmartfarmPage() {
  const latest = smartfarmData[smartfarmData.length - 1];
  const prev = smartfarmData[smartfarmData.length - 2];
  const first = smartfarmData[0];
  const growthPct = (((latest.farms / prev.farms) - 1) * 100).toFixed(1);
  const totalGrowth = (((latest.farms / first.farms) - 1) * 100).toFixed(0);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "스마트팜 현황", href: "/stats/smartfarm" }]} />
      <Link href="/" className={shared.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        메인으로
      </Link>

      {/* ── 헤더 + KPI ── */}
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Cpu} size="sm" />
            Smart Farm
          </span>
          <h1 className={s.title}>{smartfarmSummary.title}</h1>
          <p className={s.desc}>
            IoT·AI 기반 스마트팜 도입 농가와 시설면적 추이를 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              {latest.farms.toLocaleString()}
            </span>
            <span className={s.kpiLabel}>2024 도입 농가</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              {latest.area.toLocaleString()}ha
            </span>
            <span className={s.kpiLabel}>시설면적</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={TrendingUp} size="lg" className={s.kpiIcon} />
              +{growthPct}%
            </span>
            <span className={s.kpiLabel}>전년 대비 증가</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Target} size="lg" className={s.kpiIcon} />
              1만 호
            </span>
            <span className={s.kpiLabel}>2027 목표</span>
          </div>
        </div>
      </header>

      <ReferenceNotice text="통계 데이터는 농림축산식품부·스마트팜코리아 공공데이터를 가공한 참고 자료예요." />

      {/* ── 메인 대시보드 그리드 ── */}
      <div className={s.dashGrid}>
        {/* 좌: 복합 차트 */}
        <section className={s.card} aria-labelledby="chart-sf-title">
          <h2 className={s.cardTitle} id="chart-sf-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            농가 수 · 시설면적 추이
          </h2>
          <SmartfarmTrendChart data={smartfarmData} />
          <DataSource source={smartfarmSummary.source} />
        </section>

        {/* 우: 작물 비중 + 테이블 */}
        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="crops-sf-title">
            <h2 className={s.cardTitle} id="crops-sf-title">
              <Icon icon={Sprout} size="lg" className={s.cardIcon} />
              주요 재배 작물
            </h2>
            <FactorBarChart
              data={smartfarmCrops}
              variant="positive"
              highlightTop={3}
            />
            <DataSource source={smartfarmSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="table-sf-title">
            <h2 className={s.cardTitle} id="table-sf-title">
              <Icon icon={BarChart3} size="lg" className={s.cardIcon} />
              연도별 상세 데이터
            </h2>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
                <thead>
                  <tr>
                    <th scope="col">연도</th>
                    <th scope="col">농가 수</th>
                    <th scope="col">면적(ha)</th>
                    <th scope="col">전년 대비</th>
                  </tr>
                </thead>
                <tbody>
                  {[...smartfarmData].reverse().map((d) => {
                    const prevEntry = smartfarmData.find(
                      (e) => e.year === d.year - 1,
                    );
                    const diff =
                      prevEntry !== undefined
                        ? (
                            ((d.farms / prevEntry.farms) - 1) *
                            100
                          ).toFixed(1)
                        : "—";
                    return (
                      <tr key={d.year}>
                        <td>{d.year}</td>
                        <td>{d.farms.toLocaleString()}</td>
                        <td>{d.area.toLocaleString()}</td>
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
            <DataSource source={smartfarmSummary.source} />
          </section>
        </div>
      </div>

      {/* ── 원인 분석 ── */}
      <section className={s.card}>
        <CauseAnalysisSection
          title="스마트팜이 왜 늘어날까?"
          causes={smartfarmCauses}
        />
      </section>

      {/* ── 요약 + CTA ── */}
      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {smartfarmSummary.description}
        </blockquote>
        <Link href="/programs/roadmap?tab=smartfarm-support" className={s.interviewCta}>
          <Icon icon={Cpu} size="md" />
          <span>스마트팜 지원사업 보기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <ReferenceNotice text="스마트팜 데이터는 농림축산식품부·스마트팜코리아를 가공한 참고 자료예요." />

      <footer className={s.footer}>
        <DataSource source={smartfarmSummary.source} />
      </footer>
    </div>
  );
}
