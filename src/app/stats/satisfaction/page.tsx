import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  TrendingDown,
  Clock,
  Users,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import {
  satisfactionSegments,
  satisfactionFactors,
  dissatisfactionFactors,
  satisfactionSummary,
  satisfactionCauses,
} from "@/lib/data/stats";
import {
  SatisfactionDonutChart,
  FactorBarChart,
} from "@/components/charts/lazy";
import CauseAnalysisSection from "@/components/charts/cause-analysis-section";
import { DataSource } from "@/components/ui/data-source";
import s from "./page.module.css";
import shared from "../stats.module.css";

export const metadata: Metadata = {
  title: "귀농 만족도 조사",
  description:
    "귀농인의 70%가 만족한다고 답한 귀농 생활. 만족·불만족 요인을 상세히 분석해요.",
};

export default function SatisfactionPage() {
  const totalSatisfied = satisfactionSegments
    .filter((d) => d.label === "매우 만족" || d.label === "만족")
    .reduce((sum, d) => sum + d.pct, 0);

  return (
    <div className={s.page}>
      {/* 뒤로가기 */}
      <Link href="/" className={shared.backLink}>
        <ArrowLeft size={16} aria-hidden="true" />
        메인으로
      </Link>

      {/* ── 헤더 + KPI 한 블록 ── */}
      <header className={s.dashHeader}>
        <div className={s.dashHeaderText}>
          <span className={s.overline}>
            <Heart size={14} aria-hidden="true" />
            Satisfaction
          </span>
          <h1 className={s.title}>{satisfactionSummary.title}</h1>
          <p className={s.desc}>
            귀농인의 생활 만족도와 주요 만족·불만족 요인을 분석했어요.
          </p>
        </div>
        <div className={s.kpiRow}>
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>{totalSatisfied}%</span>
            <span className={s.kpiLabel}>전체 만족도</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={TrendingDown} size="lg" className={s.kpiIcon} />
              25%
            </span>
            <span className={s.kpiLabel}>생활비 절감</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Clock} size="lg" className={s.kpiIcon} />
              3년
            </span>
            <span className={s.kpiLabel}>정착 분기점</span>
          </div>
          <div className={s.kpiDivider} />
          <div className={s.kpiItem}>
            <span className={s.kpiValue}>
              <Icon icon={Users} size="lg" className={s.kpiIcon} />
              75%
            </span>
            <span className={s.kpiLabel}>지역 관계 만족</span>
          </div>
        </div>
      </header>

      {/* ── 메인 대시보드 그리드 ── */}
      <div className={s.dashGrid}>
        {/* 좌: 도넛 차트 */}
        <section className={s.card} aria-labelledby="dist-title">
          <h2 className={s.cardTitle} id="dist-title">
            <Icon icon={Heart} size="lg" className={s.cardIcon} />
            만족도 분포
          </h2>
          <SatisfactionDonutChart data={satisfactionSegments} />
          <DataSource source={satisfactionSummary.source} />
        </section>

        {/* 우: 만족/불만족 요인 세로 스택 */}
        <div className={s.factorsStack}>
          <section className={s.card} aria-labelledby="pos-title">
            <h2 className={s.cardTitle} id="pos-title">
              <Icon icon={ThumbsUp} size="lg" className={s.cardIcon} />
              만족 요인
            </h2>
            <FactorBarChart
              data={satisfactionFactors}
              variant="positive"
              highlightTop={2}
            />
            <DataSource source={satisfactionSummary.source} />
          </section>

          <section className={s.card} aria-labelledby="neg-title">
            <h2 className={s.cardTitle} id="neg-title">
              <Icon icon={ThumbsDown} size="lg" className={s.cardIcon} />
              불만족 요인
            </h2>
            <FactorBarChart
              data={dissatisfactionFactors}
              variant="negative"
              highlightTop={2}
            />
            <DataSource source={satisfactionSummary.source} />
          </section>
        </div>
      </div>

      {/* ── 원인 분석 ── */}
      <section className={s.card}>
        <CauseAnalysisSection
          title="만족과 불만족, 그 이유는?"
          causes={satisfactionCauses}
        />
      </section>

      {/* ── 요약 + 인터뷰 CTA ── */}
      <div className={s.bottomRow}>
        <blockquote className={s.summary}>
          {satisfactionSummary.description}
        </blockquote>
        <Link href="/interviews" className={s.interviewCta}>
          <MessageCircle size={16} aria-hidden="true" />
          <span>귀농인들의 생생한 이야기</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── 출처 ── */}
      <footer className={s.footer}>
        <DataSource source={satisfactionSummary.source} />
      </footer>
    </div>
  );
}
