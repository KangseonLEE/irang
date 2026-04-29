import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "이랑 — 귀농 정보 큐레이션 포탈",
  description:
    "귀농 비용, 지원금, 추천 지역, 작물 수익까지 — 공공데이터 기반으로 한곳에서 비교하고 결정하세요.",
  alternates: { canonical: "/" },
};

/** 홈페이지 ISR — 뉴스 데이터를 1시간마다 갱신 */
export const revalidate = 3600;
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import HeroSearch from "@/components/search/hero-search";
import { TrendingSearchesSkeleton } from "@/components/landing/trending-searches";
import { TrendingSearchesLoader } from "@/components/landing/trending-searches-loader";
import { KeywordRotator } from "@/components/landing/keyword-rotator";
import { InterviewCarousel } from "@/components/landing/interview-carousel";
import { TrendHighlight } from "@/components/landing/trend-highlight";
import { CostHighlight } from "@/components/landing/cost-highlight";
import { ProgramsSection } from "@/components/landing/programs-section";
import { deriveStatus, daysUntilDeadline } from "@/lib/program-status";
import { GovSupportGuide } from "@/components/landing/gov-support-guide";
import { NewsTabsV2Loader } from "@/components/landing/news-tabs-v2-loader";
import { interviews } from "@/lib/data/landing";
import { PROGRAMS } from "@/lib/data/programs";
import { SurveyCta } from "./survey-cta";
import s from "./page.module.css";

/* ── 마퀴 키워드 (2줄 엇갈림) ── */
interface MarqueeChip { label: string; accent?: boolean }

const marqueeRow1: MarqueeChip[] = [
  { label: "전남 순천" }, { label: "딸기", accent: true }, { label: "경북 상주" },
  { label: "귀농 교육" }, { label: "블루베리", accent: true }, { label: "충남 홍성" },
  { label: "스마트팜" }, { label: "강원 횡성" }, { label: "감귤", accent: true },
  { label: "주말농장" }, { label: "제주" }, { label: "토마토", accent: true },
];

const marqueeRow2: MarqueeChip[] = [
  { label: "지원사업", accent: true }, { label: "전북 완주" }, { label: "샤인머스캣" },
  { label: "경남 하동" }, { label: "귀농 체험", accent: true }, { label: "충북 괴산" },
  { label: "고추" }, { label: "청년 귀농", accent: true }, { label: "전남 해남" },
  { label: "인삼" }, { label: "농지은행", accent: true }, { label: "경기 여주" },
];

/* ────────────────────────────────────────────
   Page — 섹션 순서 (withgo 레퍼런스 기반):
   히어로(검색) → 인터뷰(사회적 증거) → 왜 귀농(동기)
   → 비용(현실) → 지원사업(행동) → 뉴스(시의성) → CTA
   ──────────────────────────────────────────── */

/* ── 지원사업 데이터 준비 (서버 사이드) ── */
const DEADLINE_THRESHOLD_DAYS = 14;

function getProgramsData() {
  const activePrograms = PROGRAMS
    .map((p) => ({
      ...p,
      programStatus: deriveStatus(p.applicationStart, p.applicationEnd),
    }))
    .filter((p) => p.programStatus === "모집중" || p.programStatus === "모집예정")
    .slice(0, 4);

  const deadlinePrograms = PROGRAMS
    .map((p) => ({
      ...p,
      status: deriveStatus(p.applicationStart, p.applicationEnd),
      daysLeft: daysUntilDeadline(p.applicationEnd),
    }))
    .filter((p) => p.status === "모집중" && p.daysLeft >= 0 && p.daysLeft <= DEADLINE_THRESHOLD_DAYS)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 4);

  return { activePrograms, deadlinePrograms };
}

export default function HomePage() {
  const { activePrograms, deadlinePrograms } = getProgramsData();

  return (
    <div className={s.page}>

      {/* ═══ 1. 히어로 ═══ */}
      <section className={s.heroSection} aria-label="검색">
        <h1 className={s.heroTitle}>
          <span className={s.heroTitleLine}>
            <KeywordRotator /> 준비,
          </span>
          <span className={s.heroTitleLine}>어디서부터 시작할까요?</span>
        </h1>
        <p className={s.heroSubtitle}>
          지역 비교부터 지원금 찾기까지, 필요한 건 다 모았어요.
        </p>

        <div className={s.heroSearchWrap}>
          <HeroSearch />
        </div>

        <div className={s.heroTrending}>
          <Suspense fallback={<TrendingSearchesSkeleton />}>
            <TrendingSearchesLoader />
          </Suspense>
        </div>

        {/* 마퀴 띠 — 2줄 엇갈림 */}
        <div className={s.heroMarquee} aria-hidden="true">
          <div className={s.heroMarqueeTrack}>
            {[...marqueeRow1, ...marqueeRow1].map((item, i) => (
              <span key={i} className={`${s.heroMarqueeItem}${item.accent ? ` ${s.heroMarqueeAccent}` : ""}`}>
                {item.label}
              </span>
            ))}
          </div>
          <div className={`${s.heroMarqueeTrack} ${s.heroMarqueeTrackReverse}`}>
            {[...marqueeRow2, ...marqueeRow2].map((item, i) => (
              <span key={i} className={`${s.heroMarqueeItem}${item.accent ? ` ${s.heroMarqueeAccent}` : ""}`}>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 2. 귀농한 사람들의 이야기 (다크 배경) ═══ */}
      <ScrollReveal>
        <div className={s.darkBg}>
          <section className={s.interviewSection} aria-label="인터뷰">
            <div className={s.interviewHeader}>
              <div className={s.interviewHeading}>
                <span className={s.eyebrowDark}>#실제 귀농인</span>
                <h2 className={`${s.interviewSectionTitle} ${s.sectionTitleDark}`}>
                  먼저 떠난 사람들의 <em>진짜 이야기</em>
                </h2>
                <p className={s.interviewSub}>
                  도시를 떠나 새로운 삶을 시작한 사람들이에요
                </p>
              </div>
              <Link href="/interviews" className={s.interviewHeaderLink}>
                모두 보기 <IconWrap icon={ArrowRight} size="sm" />
              </Link>
            </div>
            <InterviewCarousel items={interviews.slice(0, 6)} variant="dark" />
          </section>
        </div>
      </ScrollReveal>

      {/* ═══ 3. 귀농 트렌드 ═══ */}
      <ScrollReveal>
        <TrendHighlight />
      </ScrollReveal>

      {/* ═══ 4. 비용 핵심 지표 하이라이트 ═══ */}
      <ScrollReveal>
        <CostHighlight />
      </ScrollReveal>

      {/* ═══ 5. 귀농 길잡이 (연한 그린 배경) ═══ */}
      <ScrollReveal>
        <div className={s.lightGreenBg}>
          <GovSupportGuide />
        </div>
      </ScrollReveal>

      {/* ═══ 6. 지원사업 (추천 + 마감 임박 탭) ═══ */}
      <ScrollReveal>
        <ProgramsSection
          activePrograms={activePrograms}
          deadlinePrograms={deadlinePrograms}
        />
      </ScrollReveal>

      {/* ═══ 6+7. 뉴스 → CTA (여백 없이 연결) ═══ */}
      <div className={s.bottomGroup}>
        <ScrollReveal>
          <div className={s.mutedBg}>
            <section className={s.newsSection} aria-label="농촌 소식">
              <div className={s.sectionHeader}>
                <div>
                  <span className={s.eyebrow}>#농촌 소식</span>
                  <h2 className={s.sectionTitle}>놓치면 아까운 <em>소식</em></h2>
                </div>
              </div>
              <Suspense fallback={<div className={s.newsSkeleton}><p className={s.newsSkeletonText}>소식을 불러오는 중...</p></div>}>
                <NewsTabsV2Loader />
              </Suspense>
            </section>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <section className={s.bottomCta} aria-label="다음 단계 선택">
            {/* 좌측 텍스트 블록 */}
            <div className={s.ctaTextBlock}>
              <span className={s.ctaEyebrow}>다음 한 걸음</span>
              <h2 className={s.ctaQuestion}>
                어디서부터<br />시작할까요?
              </h2>
              <p className={s.ctaSub}>
                두 가지 길 중 하나를 골라 보세요
              </p>

              {/* 설문 — 타이틀 블록 안 */}
              <SurveyCta />
            </div>

            {/* 우측 카드 그리드 */}
            <div className={s.ctaPaths}>
              <Link href="/guide" className={s.ctaPath}>
                <span className={s.ctaPathNumber}>01</span>
                <span className={s.ctaPathLabel}>정보 탐색</span>
                <span className={s.ctaPathDesc}>
                  지역, 작물, 비용, 지원사업까지 한눈에 비교해 보세요
                </span>
                <span className={s.ctaPathCta}>
                  가이드 보기
                  <span className={s.ctaArrowCircle}>
                    <ArrowRight size={14} />
                  </span>
                </span>
              </Link>
              <Link href="/match" className={s.ctaPath}>
                <span className={s.ctaPathNumber}>02</span>
                <span className={s.ctaPathLabel}>적합도 진단</span>
                <span className={s.ctaPathDesc}>
                  3분이면 나에게 맞는 지역과 작물을 추천받을 수 있어요
                </span>
                <span className={s.ctaPathCta}>
                  무료 진단하기
                  <span className={s.ctaArrowCircle}>
                    <ArrowRight size={14} />
                  </span>
                </span>
              </Link>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
