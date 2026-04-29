import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Trees,
  TrendingUp,
  BarChart3,
  MessageCircle,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
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
import s from "./page.module.css";
import shared from "../stats.module.css";

export const metadata: Metadata = {
  title: "귀산촌 트렌드 — 산촌 이주 가구 현황",
  description:
    "산촌으로 이주하는 귀산촌 가구 수 추이, 이주 사유, 산림청 지원 정책을 데이터로 확인하세요.",
  keywords: ["귀산촌", "산촌 이주", "귀산촌 지원", "산림청", "산촌진흥지역"],
  alternates: { canonical: "/stats/mountain" },
};

export default function MountainPage() {
  const latest = mountainData[mountainData.length - 1];
  const prev = mountainData[mountainData.length - 2];
  const first = mountainData[0];
  const growthPct = (((latest.households / prev.households) - 1) * 100).toFixed(1);
  const totalGrowth = (((latest.households / first.households) - 1) * 100).toFixed(0);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[{ name: "귀산촌 트렌드", href: "/stats/mountain" }]} />
      <Link href="/" className={shared.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        메인으로
      </Link>

      {/* ── 헤더 + KPI ── */}
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Trees} size="sm" />
            Mountain Village
          </span>
          <h1 className={s.title}>{mountainSummary.title}</h1>
          <p className={s.desc}>
            산촌진흥지역으로 이주하는 귀산촌 가구 추이와 이주 사유를 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              {latest.households.toLocaleString()}
            </span>
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

      <ReferenceNotice text="통계 데이터는 통계청·산림청 공공데이터를 가공한 참고 자료예요." />

      {/* ── 메인 대시보드 그리드 ── */}
      <div className={s.dashGrid}>
        {/* 좌: 추이 차트 */}
        <section className={s.card} aria-labelledby="chart-mountain-title">
          <h2 className={s.cardTitle} id="chart-mountain-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            귀산촌 가구 추이
          </h2>
          <MountainTrendChart data={mountainData} />
          <DataSource source={mountainSummary.source} />
        </section>

        {/* 우: 이주 사유 + 테이블 */}
        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="reasons-mtn-title">
            <h2 className={s.cardTitle} id="reasons-mtn-title">
              <Icon icon={Trees} size="lg" className={s.cardIcon} />
              귀산촌 사유
            </h2>
            <FactorBarChart
              data={mountainReasons}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={mountainSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="table-mtn-title">
            <h2 className={s.cardTitle} id="table-mtn-title">
              <Icon icon={BarChart3} size="lg" className={s.cardIcon} />
              연도별 상세 데이터
            </h2>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
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
                        ? (
                            ((d.households / prevEntry.households) - 1) *
                            100
                          ).toFixed(1)
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

      {/* ── 원인 분석 ── */}
      <section className={s.card}>
        <CauseAnalysisSection
          title="왜 산촌으로 떠날까?"
          causes={mountainCauses}
        />
      </section>

      {/* ── 요약 + CTA ── */}
      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {mountainSummary.description}
        </blockquote>
        <Link href="/interviews" className={s.interviewCta}>
          <Icon icon={MessageCircle} size="md" />
          <span>귀농인들의 생생한 이야기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      <ReferenceNotice text="귀산촌 데이터는 통계청·산림청 공공데이터를 가공한 참고 자료예요." />

      <footer className={s.footer}>
        <DataSource source={mountainSummary.source} />
      </footer>
    </div>
  );
}
