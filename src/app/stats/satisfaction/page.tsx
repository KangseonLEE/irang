import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from "lucide-react";
import {
  satisfactionSegments,
  satisfactionFactors,
  dissatisfactionFactors,
  satisfactionSummary,
} from "@/lib/data/stats";
import s from "../stats.module.css";

export const metadata: Metadata = {
  title: "귀농 만족도 조사",
  description:
    "귀농인의 70%가 만족한다고 답한 귀농 생활. 만족·불만족 요인을 상세히 분석합니다.",
};

/** 만족도 분포 색상 매핑 */
const segmentColors: Record<string, string> = {
  "매우 만족": s.ratioBarGreen,
  "만족": s.ratioBarLightGreen,
  "보통": s.ratioBarAmber,
  "불만족": s.ratioBarRed,
};

function barWidth(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

export default function SatisfactionPage() {
  const maxSatisfaction = Math.max(
    ...satisfactionFactors.map((f) => f.pct),
  );
  const maxDissatisfaction = Math.max(
    ...dissatisfactionFactors.map((f) => f.pct),
  );

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
          <Heart size={16} aria-hidden="true" />
          Satisfaction
        </span>
        <h1 className={s.headerTitle}>{satisfactionSummary.title}</h1>
        <p className={s.headerDesc}>
          귀농인의 생활 만족도와 주요 만족·불만족 요인을 상세히 분석합니다.
        </p>
      </header>

      {/* 핵심 수치 */}
      <div className={s.card}>
        <div className={s.twoCol}>
          <div>
            <p className={s.bigNumber}>70%</p>
            <p className={s.bigNumberSub}>전체 만족도 (만족 + 매우 만족)</p>
          </div>
          <div>
            <p className={s.bigNumber}>-25%</p>
            <p className={s.bigNumberSub}>도시 대비 월 생활비 절감</p>
          </div>
        </div>
      </div>

      {/* 만족도 분포 */}
      <section className={s.card} aria-labelledby="dist-title">
        <h2 className={s.cardTitle} id="dist-title">
          <span className={s.cardTitleIcon} aria-hidden="true">
            <Heart size={20} />
          </span>
          만족도 분포
        </h2>
        <div className={s.ratioChart} role="img" aria-label="귀농 만족도 분포: 매우 만족 18%, 만족 52%, 보통 22%, 불만족 8%">
          {satisfactionSegments.map((seg) => (
            <div className={s.ratioRow} key={seg.label}>
              <span className={s.ratioLabel}>{seg.label}</span>
              <div className={s.ratioBarWrap}>
                <div
                  className={segmentColors[seg.label] || s.ratioBar}
                  style={{ width: `${seg.pct}%` }}
                >
                  {seg.pct}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 만족 요인 / 불만족 요인 — 2열 */}
      <div className={s.twoCol}>
        {/* 만족 요인 Top 5 */}
        <section className={s.card} aria-labelledby="positive-title">
          <h2 className={s.cardTitle} id="positive-title">
            <span className={s.cardTitleIcon} aria-hidden="true">
              <ThumbsUp size={20} />
            </span>
            만족 요인
          </h2>
          <div className={s.factorList}>
            {satisfactionFactors.map((f, i) => (
              <div className={s.factorRow} key={f.label}>
                <span className={s.factorRank}>{i + 1}</span>
                <span className={s.factorLabel}>{f.label}</span>
                <div className={s.factorBarWrap}>
                  <div
                    className={s.factorBar}
                    style={{ width: barWidth(f.pct, maxSatisfaction) }}
                  />
                </div>
                <span className={s.factorPct}>{f.pct}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* 불만족 요인 Top 3 */}
        <section className={s.card} aria-labelledby="negative-title">
          <h2 className={s.cardTitle} id="negative-title">
            <span className={s.cardTitleIcon} aria-hidden="true">
              <ThumbsDown size={20} />
            </span>
            불만족 요인
          </h2>
          <div className={s.factorList}>
            {dissatisfactionFactors.map((f, i) => (
              <div className={s.factorRow} key={f.label}>
                <span className={s.factorRank}>{i + 1}</span>
                <span className={s.factorLabel}>{f.label}</span>
                <div className={s.factorBarWrap}>
                  <div
                    className={s.factorBarNegative}
                    style={{ width: barWidth(f.pct, maxDissatisfaction) }}
                  />
                </div>
                <span className={s.factorPct}>{f.pct}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 분석 요약 */}
      <blockquote className={s.summary}>
        {satisfactionSummary.description}
      </blockquote>

      {/* 인터뷰 연결 */}
      <Link href="/interviews" className={s.interviewLink}>
        <span>
          <MessageCircle size={16} aria-hidden="true" style={{ display: "inline", verticalAlign: "-3px", marginRight: "6px" }} />
          귀농인들의 생생한 이야기 읽기
        </span>
        <ArrowRight size={16} className={s.interviewLinkArrow} aria-hidden="true" />
      </Link>

      {/* 출처 */}
      <p className={s.source}>
        <span className={s.sourceLabel}>출처:</span>
        {satisfactionSummary.source}
      </p>

      {/* 다른 통계 보기 */}
      <nav className={s.navFooter} aria-label="다른 통계 페이지">
        <p className={s.navFooterTitle}>다른 통계 보기</p>
        <div className={s.navFooterLinks}>
          <Link href="/stats/population" className={s.navFooterLink}>
            귀농·귀촌 인구
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <Link href="/stats/youth" className={s.navFooterLink}>
            청년 귀농 트렌드
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
          <span className={s.navFooterLinkActive} aria-current="page">
            귀농 만족도
          </span>
        </div>
      </nav>
    </div>
  );
}
