/**
 * /assess/r/[data] — 귀농 적합도 진단 결과 공유 랜딩 페이지
 *
 * URL 경로에 인코딩된 결과 데이터를 디코딩하여 표시합니다.
 * - 데이터 포맷: {tierNum}-{totalScore}-{dim1}-{dim2}-{dim3}-{dim4}-{dim5}
 * - 예: /assess/r/2-22-50-38-75-63-25
 *
 * OG 메타 태그로 카카오톡/SNS 공유 시 동적 카드가 표시됩니다.
 * 하단 CTA로 "나도 진단 받아보기" 전환을 유도합니다.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, RotateCcw } from "lucide-react";
import { decodeAssessScore } from "@/lib/assess-share";
import { DIMENSIONS, getDimensionGuide } from "@/lib/data/assessment";
import s from "./share.module.css";

// ── 타입 ──

interface PageProps {
  params: Promise<{ data: string }>;
}

// ── OG 메타 태그 ──

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data } = await params;
  const result = decodeAssessScore(data);

  if (!result) {
    return { title: "결과를 찾을 수 없습니다 | 이랑" };
  }

  const { tier, totalScore } = result;
  const title = `${tier.emoji} 나의 귀농 준비도: ${tier.title}`;
  const description = `총점 ${totalScore}/40점 — ${tier.summary}`;

  return {
    title: `${title} | 이랑`,
    description,
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "이랑 — 귀농 정보 큐레이션",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ── 페이지 컴포넌트 ──

export default async function AssessSharePage({ params }: PageProps) {
  const { data } = await params;
  const result = decodeAssessScore(data);

  if (!result) notFound();

  const { tier, totalScore, dimensions } = result;

  return (
    <div className={s.page}>
      {/* 히어로 — 결과 요약 */}
      <div className={s.hero}>
        <span className={s.emoji}>{tier.emoji}</span>
        <span className={s.overline}>귀농 적합도 진단 결과</span>
        <h1 className={s.title}>{tier.title}</h1>
        <span className={s.score}>총점 {totalScore}점 / 40점</span>
        <p className={s.summary}>{tier.summary}</p>
      </div>

      {/* 차원별 분석 바 차트 */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h2 className={s.cardTitle}>
            <BarChart3 size={18} />
            차원별 분석
          </h2>
        </div>
        <div className={s.cardContent}>
          <div className={s.dimList}>
            {dimensions.map((dim) => {
              const meta = DIMENSIONS.find((d) => d.id === dim.id);
              const isLow = dim.percent <= 37;
              return (
                <div key={dim.id} className={s.dimRow}>
                  <div className={s.dimMeta}>
                    <span className={s.dimLabel}>
                      <span className={s.dimIcon}>{meta?.icon}</span>
                      {dim.label}
                    </span>
                    <span className={`${s.dimPercent} ${isLow ? s.dimPercentLow : ""}`}>
                      {dim.percent}%
                    </span>
                  </div>
                  <div className={s.dimBarWrap}>
                    <div
                      className={`${s.dimBarFill} ${isLow ? s.dimBarLow : ""}`}
                      style={{ width: `${dim.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 상세 설명 */}
      <div className={s.card}>
        <div className={s.cardContent}>
          <p className={s.desc}>{tier.description}</p>
        </div>
      </div>

      {/* CTA — 나도 진단 받아보기 */}
      <section className={s.cta}>
        <h2 className={s.ctaTitle}>나도 귀농 적합도 진단 받아보기</h2>
        <p className={s.ctaDesc}>
          10가지 질문으로 나의 귀농 준비 상태를 점검하고,
          부족한 영역별 보강 방법까지 알아보세요
        </p>
        <Link
          href="/assess?utm_source=share&utm_medium=assess_result"
          className={s.ctaBtn}
        >
          나도 진단하기
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* 이랑 둘러보기 */}
      <div className={s.actions}>
        <Link href="/" className={s.exploreBtn}>
          <RotateCcw size={16} />
          이랑 둘러보기
        </Link>
      </div>
    </div>
  );
}
