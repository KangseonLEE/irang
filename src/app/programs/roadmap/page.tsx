import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, GitCompareArrows } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { fetchYouthCasesForRoadmap } from "@/lib/api/rda-youth";
import { RoadmapClient } from "./roadmap-client";
import s from "./page.module.css";

/* ── SEO ── */
export const metadata: Metadata = {
  title: "정부사업 진입 가이드",
  description:
    "귀농귀촌 지원사업, 청년창업농, 농지은행, 귀산촌 자금, 스마트팜까지. 5대 핵심 정부사업의 자격 요건, 신청 절차, 필요 서류를 한눈에 확인하세요.",
  openGraph: {
    title: "정부사업 진입 가이드 | 이랑",
    description:
      "5대 핵심 정부사업의 자격 요건, 신청 절차, 필요 서류를 한눈에 확인하세요.",
  },
};

/** 1시간마다 청년농 사례 데이터 재검증 */
export const revalidate = 3600;

export default async function ProgramRoadmapPage() {
  const youthCases = await fetchYouthCasesForRoadmap(6).catch(() => []);

  return (
    <div className={s.page}>
      {/* ── 히어로 ── */}
      <section className={s.hero}>
        <span className={s.heroOverline}>Gov Program Guide</span>
        <h1 className={s.heroTitle}>
          정부사업, <span className={s.accent}>어떻게 신청</span>하나요?
        </h1>
        <p className={s.heroDesc}>
          <AutoGlossary text="귀농·귀촌을 위한 5대 핵심 정부사업의 자격 요건부터 신청 절차, 필요 서류, 선정 후 의무사항까지 한곳에서 확인하세요." />
        </p>
      </section>

      {/* ── 인터랙티브 영역 (클라이언트) ── */}
      <RoadmapClient youthCases={youthCases} />

      {/* ── CTA ── */}
      <section className={s.ctaSection}>
        <h2 className={s.ctaTitle}>나에게 맞는 사업을 찾아보세요</h2>
        <p className={s.ctaDesc}>
          <AutoGlossary text="이랑이 제공하는 지원사업 검색과 맞춤 추천으로 나에게 딱 맞는 사업을 빠르게 찾을 수 있습니다." />
        </p>
        <div className={s.ctaButtons}>
          <Link href="/programs" className={s.ctaPrimary}>
            <Search size={18} />
            지원사업 검색
          </Link>
          <Link href="/guide" className={s.ctaSecondary}>
            <BookOpen size={18} />
            귀농 5단계 가이드
          </Link>
          <Link href="/guide/track-compare" className={s.ctaSecondary}>
            <GitCompareArrows size={18} />
            귀농·귀산촌 비교
          </Link>
        </div>
      </section>
    </div>
  );
}
