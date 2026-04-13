import { Suspense } from "react";

/** 홈페이지 ISR — 뉴스 데이터를 1시간마다 갱신 */
export const revalidate = 3600;
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Calculator,
  Compass,
  Footprints,
  BookOpen,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { Icon as IconWrap } from "@/components/ui/icon";
import SearchGroup from "@/components/search/search-group";
import { InterviewCarousel } from "@/components/landing/interview-carousel";
import { TrendingSearchesSkeleton } from "@/components/landing/trending-searches";
import { TrendingSearchesLoader } from "@/components/landing/trending-searches-loader";
import { NewsTabsLoader } from "@/components/landing/news-tabs-loader";
import { FarmerIllustration } from "@/components/landing/farmer-illustration";
import { CostSection } from "@/components/landing/cost-section";
import { interviews } from "@/lib/data/landing";
import { CROPS } from "@/lib/data/crops";
import s from "./page.module.css";

/* ── 서비스 맵 데이터 ── */
const serviceMapItems = [
  {
    icon: MapPin,
    title: "지역 탐색",
    desc: "163개 시군구의 기후, 인구, 인프라 비교",
    href: "/regions",
    variant: "region" as const,
  },
  {
    icon: Sprout,
    title: "작물 비교",
    desc: `${CROPS.length}종 작물의 난이도, 수익성을 한눈에`,
    href: "/crops",
    variant: "crop" as const,
  },
  {
    icon: Calculator,
    title: "비용 가이드",
    desc: "작물별 투자비용과 지원금 시뮬레이션",
    href: "/costs",
    variant: "cost" as const,
  },
  {
    icon: Compass,
    title: "유형 진단",
    desc: "10문항으로 찾는 나만의 귀농 유형",
    href: "/match",
    variant: "match" as const,
  },
  {
    icon: Footprints,
    title: "귀농 로드맵",
    desc: "5단계 체크리스트와 실전 가이드",
    href: "/guide",
    variant: "guide" as const,
  },
  {
    icon: BookOpen,
    title: "농업 용어집",
    desc: "처음 듣는 농업 용어, 쉽게 정리",
    href: "/glossary",
    variant: "glossary" as const,
  },
];

/* ── 유형 진단 티저 배지 ── */
const matchTypes = [
  { label: "주말농부형", emoji: "🌱" },
  { label: "스마트팜형", emoji: "📊" },
  { label: "전원생활형", emoji: "🏡" },
  { label: "청년창농형", emoji: "🚀" },
];

/* ────────────────────────────────────────────
   Page — 섹션 순서:
   Hook(히어로) → 현실검증(비용) → 탐색분기(서비스맵)
   → 뉴스 → 사회증거(인터뷰) → 개인화전환(유형진단 티저)
   ──────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className={s.page}>

      {/* ═══ 1. 히어로 — 검색 + 수치 Hook + 보조 CTA ═══ */}
      <section className={s.heroSection} aria-label="검색">
        <span className={s.heroEyebrow}>연 1.2만명이 귀농을 준비합니다</span>

        <h1 className={s.heroTitle}>
          막막한 귀농, 비교하고 결정하세요
        </h1>

        <p className={s.heroSubtitle}>
          지역, 작물, 지원금까지 —<br />
          공공데이터 기반으로 한곳에서.
        </p>

        <div className={s.heroSearchWrap}>
          <Suspense fallback={<div className={s.searchFallback} />}>
            <SearchGroup size="large" placeholder="궁금한 지역이나 작물을 검색해보세요" mobilePlaceholder="지역, 작물, 지원사업 검색" hideTags mobileRedirect="/search" />
          </Suspense>
        </div>

        <Suspense fallback={<TrendingSearchesSkeleton />}>
          <TrendingSearchesLoader />
        </Suspense>

        <Link href="/match" className={s.heroSecondaryCta}>
          <IconWrap icon={Compass} size="sm" />
          귀농 유형 먼저 진단해 보기
        </Link>
      </section>

      {/* ═══ 2. 비용 티저 — 핵심 수치 + /costs CTA ═══ */}
      <CostSection
        barPercent={84.6}
        counts={[
          { end: 6219 },
          { end: 27.4, decimals: 1 },
          { end: 3, prefix: "최대 " },
          { end: 7500 },
        ]}
      />

      {/* ═══ 3. 서비스 맵 — 6개 서브페이지 허브 ═══ */}
      <section className={s.serviceMapSection} aria-label="서비스 안내">
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>내 상황에 맞는 정보 찾기</h2>
        </div>

        <div className={s.serviceMapGrid}>
          {serviceMapItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${s.serviceMapCard} ${s[`serviceMap_${item.variant}`]}`}
              >
                <div className={s.serviceMapIcon}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div className={s.serviceMapText}>
                  <span className={s.serviceMapTitle}>{item.title}</span>
                  <span className={s.serviceMapDesc}>{item.desc}</span>
                </div>
                <IconWrap icon={ArrowRight} size="sm" className={s.serviceMapArrow} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ═══ 4. 농촌 소식 — 뉴스 2단 레이아웃 ═══ */}
      <section className={s.newsSection} aria-label="농촌 소식">
        <Suspense fallback={<div className={s.newsSkeleton}><p className={s.newsSkeletonText}>소식을 불러오는 중...</p></div>}>
          <NewsTabsLoader />
        </Suspense>
      </section>

      {/* ═══ 5. 인터뷰 — 사회적 증거 ═══ */}
      <section className={s.interviewSection} aria-label="인터뷰">
        <div className={s.sectionHeader}>
          <h2 className={s.sectionTitle}>먼저 떠난 사람들</h2>
          <p className={s.interviewSub}>
            도시를 떠나 새로운 삶을 시작한 사람들의 진짜 이야기
          </p>
        </div>
        <InterviewCarousel items={interviews.slice(0, 6)} />
        <Link href="/interviews" className={s.interviewViewAll}>
          {interviews.length}명의 귀농인 이야기 더 보기 <IconWrap icon={ArrowRight} size="sm" />
        </Link>
      </section>

      {/* ═══ 6. 유형 진단 티저 — 최종 전환 ═══ */}
      <section className={s.matchTeaser} aria-label="귀농 유형 진단">
        <div className={s.matchTeaserBody}>
          <span className={s.matchTeaserOverline}>맞춤 귀농 진단</span>
          <h2 className={s.matchTeaserTitle}>
            어떤 귀농이<br />나에게 맞을까?
          </h2>
          <p className={s.matchTeaserDesc}>
            나이, 예산, 원하는 삶의 방식만 알려주세요.
            3분이면 나만의 귀농 유형을 찾을 수 있어요.
          </p>
          <div className={s.matchChips}>
            {matchTypes.map((type) => (
              <span key={type.label} className={s.matchChip}>
                #{type.label}
              </span>
            ))}
          </div>
        </div>

        <div className={s.matchTeaserCta}>
          <FarmerIllustration className={s.matchIllust} />
          <Link href="/match" className={s.matchTeaserBtn}>
            무료 진단 시작하기
            <IconWrap icon={ArrowRight} size="md" />
          </Link>
        </div>
      </section>
    </div>
  );
}
