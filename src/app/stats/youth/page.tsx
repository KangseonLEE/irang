import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
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
import s from "./page.module.css";
import shared from "../stats.module.css";

export const metadata: Metadata = {
  title: "청년 귀농 현황 — 연령별·지역별 통계",
  description:
    "청년 귀농 비율, 지역별 청년 귀농 현황, 지원 정책을 데이터로 살펴보세요.",
};

export default function YouthPage() {
  const latest = youthData[youthData.length - 1];
  const first = youthData[0];
  const growthPp = (latest.ratio - first.ratio).toFixed(1);

  return (
    <div className={s.page}>
      {/* 뒤로가기 */}
      <Link href="/" className={shared.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        메인으로
      </Link>

      {/* ── 헤더 + KPI 한 블록 ── */}
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Icon icon={Sprout} size="sm" />
            Youth Farming
          </span>
          <h1 className={s.title}>{youthSummary.title}</h1>
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

      {/* ── 메인 대시보드 그리드 ── */}
      <div className={s.dashGrid}>
        {/* 좌: 청년 비율 추이 차트 */}
        <section className={s.card} aria-labelledby="chart-youth-title">
          <h2 className={s.cardTitle} id="chart-youth-title">
            <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
            청년 귀농 비율 추이
          </h2>
          <YouthTrendChart data={youthData} />
          <DataSource source={youthSummary.source} />
        </section>

        {/* 우: 귀농 사유 + 테이블 세로 스택 */}
        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="reasons-title">
            <h2 className={s.cardTitle} id="reasons-title">
              <Icon icon={Sprout} size="lg" className={s.cardIcon} />
              귀농 사유 Top 5
            </h2>
            <FactorBarChart
              data={farmingReasons}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={youthSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="table-youth-title">
            <h2 className={s.cardTitle} id="table-youth-title">
              <Icon icon={TrendingUp} size="lg" className={s.cardIcon} />
              연도별 상세 데이터
            </h2>
            <div className={shared.tableWrap}>
              <table className={shared.table}>
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

      {/* ── 원인 분석 ── */}
      <section className={s.card}>
        <CauseAnalysisSection
          title="왜 청년 귀농이 늘고 있을까?"
          causes={youthCauses}
        />
      </section>

      {/* ── 요약 + 인터뷰 CTA ── */}
      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {youthSummary.description}
        </blockquote>
        <Link href="/interviews" className={s.interviewCta}>
          <Icon icon={MessageCircle} size="md" />
          <span>귀농인들의 생생한 이야기</span>
          <Icon icon={ArrowRight} size="sm" />
        </Link>
      </div>

      {/* ── 출처 ── */}
      <footer className={s.footer}>
        <DataSource source={youthSummary.source} />
      </footer>
    </div>
  );
}
