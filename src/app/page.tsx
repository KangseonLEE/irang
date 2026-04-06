import { Fragment, Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  TrendingUp,
  ArrowLeftRight,
  Footprints,
  HelpCircle,
} from "lucide-react";
import SearchGroup from "@/components/search/search-group";
import { CountUp } from "@/components/landing/count-up";
import { FaqAccordion } from "@/components/landing/faq-accordion";
import { InterviewCarousel } from "@/components/landing/interview-carousel";
import { TrendingSearches } from "@/components/landing/trending-searches";
import { ServiceCarousel } from "@/components/landing/service-carousel";
import type { ServiceCard } from "@/components/landing/service-carousel";
import { getTrendingSearches } from "@/lib/supabase";
import {
  RegionIllustration,
  CropIllustration,
  ProgramIllustration,
} from "@/components/illustrations";
import {
  trendStats,
  trendReasons,
  trendNews,
  popularRegions,
  popularCrops,
  hotPrograms,
  cityVsRural,
  interviews,
  roadmapSteps,
  faqItems,
} from "@/lib/data/landing";
import { fetchLatestNews } from "@/lib/api/news";
import type { NewsArticle } from "@/lib/api/news";
import { JsonLd } from "@/components/seo/json-ld";
import type { FAQPage } from "schema-dts";
import s from "./page.module.css";

/* ── 대형 카드 캐러셀 데이터 ── */
const serviceCards: ServiceCard[] = [
  {
    badge: "지역탐색",
    title: "인기 지역",
    desc: "귀농인이 가장 많이 찾는 지역과 특징을 한눈에 비교하세요.",
    variant: "region",
    items: popularRegions.map((r) => ({
      label: r.name,
      sub: `${r.climate} · ${r.highlight}`,
      href: `/regions/${r.provinceId}`,
    })),
    more: { label: "13개 지역 모두 보기", href: "/regions" },
    illustration: <RegionIllustration />,
  },
  {
    badge: "작물정보",
    title: "인기 작물",
    desc: "초보 귀농인도 도전할 수 있는 작물, 난이도와 수익성을 비교합니다.",
    variant: "crop",
    items: popularCrops.map((c) => ({
      label: c.name,
      sub: `재배 난이도 ${c.difficulty} · 수확기 ${c.season}`,
      href: `/crops/${c.id}`,
    })),
    more: { label: "17종 작물 모두 보기", href: "/crops" },
    illustration: <CropIllustration />,
  },
  {
    badge: "지원사업",
    title: "모집중인 지원사업",
    desc: "지금 신청 가능한 정부·지자체 귀농 지원사업을 확인하세요.",
    variant: "program",
    items: hotPrograms.map((p) => ({
      label: p.title,
      sub: `${p.region} · ${p.type} · ${p.amount}`,
      href: `/programs/${p.id}`,
    })),
    more: { label: "전체 지원사업 보기", href: "/programs" },
    illustration: <ProgramIllustration />,
  },
];

/* ────────────────────────────────────────────
   Page — 섹션 순서:
   호기심(히어로) → 사회증거(트렌드) → 현실확인(비교→비용)
   → 공감(인터뷰) → 행동브릿지(로드맵) → 탐색(벤토) → 저항제거(FAQ) → 전환(CTA)
   ──────────────────────────────────────────── */

export default async function HomePage() {
  // 네이버 뉴스 API → 실패 시 정적 데이터 폴백
  const liveNews: NewsArticle[] | null = await fetchLatestNews();
  const newsItems = liveNews ?? trendNews;

  // 인기 검색어: Supabase 실데이터 → 큐레이션 폴백
  const trendingData = await getTrendingSearches(7, 12);
  return (
    <div className={s.page}>
      {/* ── FAQ 구조화 데이터 (JSON-LD) ── */}
      <JsonLd<FAQPage>
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question" as const,
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer" as const,
              text: item.a,
            },
          })),
        }}
      />

      {/* ═══ 1. 히어로 — 검색 중심 ═══ */}
      <section className={s.heroSection} aria-label="검색">
        <span className={s.heroEyebrow}>귀농, 이랑 같이</span>

        <h1 className={s.heroTitle}>
          막막했던 귀농,
          <br />
          이제 비교하고 결정하세요
        </h1>

        <p className={s.heroSubtitle}>
          지역, 작물, 지원금까지 —<br />
          공공데이터 기반으로 한곳에서.
        </p>

        <div className={s.heroSearchWrap}>
          <Suspense fallback={<div className={s.searchFallback} />}>
            <SearchGroup size="large" placeholder="궁금한 지역이나 작물을 검색해보세요" mobilePlaceholder="지역, 작물, 지원사업 검색" hideTags />
          </Suspense>
        </div>

        {/* 인기 검색어 슬라이더 */}
        <TrendingSearches serverTrending={trendingData} />
      </section>

      {/* ═══ 2. 귀농 트렌드 — 사회적 증거 ═══ */}
      <section className={s.trendSection} aria-label="귀농 트렌드">
        <div className={s.sectionHeader}>
          <h2 className={s.trendTitle}>
            <TrendingUp size={18} className={s.trendTitleIcon} />
            지금, 농촌은
          </h2>
          <p className={s.trendSub}>
            같은 생각을 한 사람들, 이렇게 많아요.
          </p>
        </div>

        {/* 핵심 숫자 — 통합 카드 */}
        <div className={s.trendStatsCard}>
          {trendStats.map((stat, i) => (
            <Fragment key={stat.label}>
              {i > 0 && <div className={s.trendStatDivider} role="separator" />}
              <Link href={stat.href} className={s.trendStatItem}>
                <span className={s.trendValue}>{stat.value}</span>
                <span className={s.trendLabel}>{stat.label}</span>
                <span className={s.trendStatSub}>{stat.sub}</span>
              </Link>
            </Fragment>
          ))}
        </div>

        {/* 귀농 이유 + 농촌 소식 — 2열 그리드 */}
        <div className={s.trendBottomGrid}>
          {/* 귀농 이유 차트 */}
          <div className={s.reasonsCard}>
            <h3 className={s.reasonsTitle}>사람들이 농촌을 선택한 이유</h3>
            <div className={s.reasonsList}>
              {trendReasons.map((r, i) => {
                const maxPct = trendReasons[0].pct;
                const isTop = i === 0;
                return (
                  <div
                    key={r.label}
                    className={`${s.reasonRow} ${isTop ? s.reasonRowTop : ""}`}
                  >
                    <div className={s.reasonLabelRow}>
                      <span className={s.reasonLabel}>{r.label}</span>
                      <span className={`${s.reasonPct} ${isTop ? s.reasonPctTop : ""}`}>
                        {r.pct}%
                      </span>
                    </div>
                    <div className={s.reasonBarWrap}>
                      <div
                        className={`${s.reasonBar} ${isTop ? s.reasonBarTop : ""}`}
                        style={{ width: `${(r.pct / maxPct) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={s.reasonSource}>
              출처: 농림축산식품부 귀농귀촌 실태조사 (복수응답)
            </p>
          </div>

          {/* 관련 뉴스 */}
          <div className={s.newsCard}>
            <h3 className={s.newsTitle}>농촌 소식</h3>
            <div className={s.newsList}>
              {newsItems.map((news) => (
                <a
                  key={news.url}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.newsItem}
                >
                  <span className={s.newsItemTitle}>{news.title}</span>
                  <span className={s.newsItemMeta}>
                    {news.source} · {news.date}
                    <ExternalLink size={12} />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ 3. 도시 vs 농촌 비교 — 맥락 형성 ═══ */}
      <section className={s.compareSection} aria-label="도시 농촌 비교">
        <h2 className={s.trendTitle}>
          <ArrowLeftRight size={18} className={s.trendTitleIcon} />
          월급은 줄어도, 삶은 넉넉해지더라
        </h2>

        <div className={s.compareTable}>
          <div className={s.compareRowHeader}>
            <span className={s.compareHeaderCell} />
            <span className={s.compareHeaderCell}>도시</span>
            <span className={s.compareHeaderCell}>농촌</span>
            <span className={s.compareHeaderCell} />
          </div>
          {cityVsRural.map((row) => (
            <div key={row.label} className={s.compareRow}>
              <span className={s.compareLabel}>{row.label}</span>
              <span className={s.compareCity}>{row.city}</span>
              <span className={s.compareRural}>{row.rural}</span>
              <span className={s.compareChange}>{row.change}</span>
            </div>
          ))}
        </div>

        <p className={s.compareNote}>
          귀농 가구 절반 이상이 농업 외 부수입(투잡)을 병행합니다. 5년차 귀농가구의 농업소득은 일반 농가 평균보다 60% 높아요.
        </p>
      </section>

      {/* ═══ 4. 귀농 비용 — 핵심 걱정 해소 ═══ */}
      <section className={s.costSection} aria-label="귀농 비용">
        {/* 상단: 인트로 텍스트 */}
        <div className={s.costIntro}>
          <span className={s.costOverline}>실제 귀농인 평균 데이터</span>
          <h2 className={s.costTitle}>귀농, 돈이 얼마나 들까?</h2>
          <p className={s.costDesc}>
            30~60대 귀농인이 평균 <strong className={s.costDescStrong}>6,219만 원</strong>을
            투자하며, 비용의 <strong className={s.costDescStrong}>84.6%</strong>는
            12~18개월 영농 준비 단계에 집중됩니다.
            정부 융자를 활용하면 초기 부담을 크게 줄일 수 있습니다.
          </p>
        </div>

        {/* 하단: 핵심 수치 4열 카드 — 타이틀 → 카운트업 숫자 → 서브 */}
        <div className={s.costStatsCard}>
          <div className={s.costStatItem}>
            <p className={s.costStatLabel}>평균 초기 투자금</p>
            <p className={s.costStatValue}>
              <CountUp end={6219} className={s.costStatNum} />
              <span className={s.costStatUnit}>만 원</span>
            </p>
            <p className={s.costStatSub}>월평균 약 230만 원 수준</p>
          </div>
          <div className={s.costStatDivider} />
          <div className={s.costStatItem}>
            <p className={s.costStatLabel}>평균 준비 기간</p>
            <p className={s.costStatValue}>
              <CountUp end={27.4} decimals={1} className={s.costStatNum} />
              <span className={s.costStatUnit}>개월</span>
            </p>
            <p className={s.costStatSub}>탐색부터 정착까지</p>
          </div>
          <div className={s.costStatDivider} />
          <div className={s.costStatItem}>
            <p className={s.costStatLabel}>농업창업자금</p>
            <p className={s.costStatValue}>
              <CountUp end={3} prefix="최대 " className={s.costStatNum} />
              <span className={s.costStatUnit}>억 원</span>
            </p>
            <p className={s.costStatSub}>정부 융자 지원</p>
          </div>
          <div className={s.costStatDivider} />
          <div className={s.costStatItem}>
            <p className={s.costStatLabel}>주택자금</p>
            <p className={s.costStatValue}>
              <CountUp end={7500} className={s.costStatNum} />
              <span className={s.costStatUnit}>만 원</span>
            </p>
            <p className={s.costStatSub}>정부 융자 지원</p>
          </div>
        </div>

        {/* 데이터 아래 CTA */}
        <Link href="/programs?supportType=융자" className={s.costCtaOutline}>
          지원사업 알아보기 <ArrowRight size={14} />
        </Link>

        <p className={s.costSource}>
          출처: 농림축산식품부 2025 귀농귀촌 실태조사
        </p>
      </section>

      {/* ═══ 5. 귀농 5단계 로드맵 — 행동 브릿지 (비용→로드맵 직결) ═══ */}
      <section id="roadmap" className={s.roadmapSection} aria-label="귀농 로드맵">
        <div className={s.sectionHeader}>
          <h2 className={s.trendTitle}>
            <Footprints size={18} className={s.trendTitleIcon} />
            귀농, 어디서부터 시작하죠?
          </h2>
          <p className={s.roadmapSub}>
            평균 27개월, 이 순서대로 준비하면 됩니다.
          </p>
        </div>

        <div className={s.roadmapTimeline}>
          {roadmapSteps.map((step) => (
            <div key={step.step} className={s.roadmapStep}>
              <div className={s.roadmapDot}>{step.step}</div>
              <div className={s.roadmapContent}>
                <span className={s.roadmapStepTitle}>{step.title}</span>
                <span className={s.roadmapPeriod}>{step.period}</span>
                <span className={s.roadmapDesc}>{step.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 로드맵 하단 CTA */}
        <div className={s.roadmapCtaGroup}>
          <Link href="/match" className={s.roadmapBottomCta}>
            <span>1단계부터 시작해볼까요?</span>
            <span className={s.roadmapBottomCtaSub}>
              맞춤 귀농 플랜 받기 <ArrowRight size={16} />
            </span>
          </Link>
          <Link href="/regions" className={s.roadmapSecondary}>
            지역·작물·지원사업 둘러보기 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══ 5.5 귀농 적합성 진단 — 자기 점검 브릿지 ═══ */}
      <section className={s.assessBanner} aria-label="귀농 적합성 진단">
        <span className={s.assessEmoji}>🧑‍🌾</span>
        <h2 className={s.assessTitle}>
          나는 귀농에 맞는 사람일까?
        </h2>
        <p className={s.assessDesc}>
          3분이면 충분해요. 10가지 질문으로 나의 귀농 준비 상태를 점검하고, 맞춤 행동 가이드를 받아보세요.
        </p>
        <Link href="/assess" className={s.assessBtn}>
          무료 진단 시작하기
          <ArrowRight size={16} />
        </Link>
      </section>

      {/* ═══ 6. 인터뷰 카드 — 감정적 전환점 ═══ */}
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>먼저 떠난 사람들</h2>
        <p className={s.interviewSub}>
          도시를 떠나 새로운 삶을 시작한 사람들의 진짜 이야기
        </p>
      </div>
      <InterviewCarousel items={interviews.slice(0, 4)} />
      <Link href="/interviews" className={s.interviewViewAll}>
        {interviews.length}명의 귀농인 이야기 더 보기 <ArrowRight size={14} />
      </Link>

      {/* ═══ 7. 서비스 카드 — 인기 데이터 ═══ */}
      <section aria-label="인기 데이터">
        <h2 className={s.sectionTitle}>지금 귀농인들이 찾는 것</h2>
        <ServiceCarousel cards={serviceCards} />
      </section>

      {/* ═══ 8. FAQ — 잔여 저항 제거 ═══ */}
      <section className={s.faqSection} aria-label="자주 묻는 질문">
        <h2 className={s.trendTitle}>
          <HelpCircle size={18} className={s.trendTitleIcon} />
          이것, 궁금하셨죠?
        </h2>
        <FaqAccordion items={faqItems} />
      </section>

      {/* ═══ 9. CTA 배너 — 최종 전환 ═══ */}
      <section className={s.ctaBanner} aria-label="시작하기">
        <div className={s.ctaBannerText}>
          <h2 className={s.ctaBannerTitle}>
            내 땅, 어디쯤일까요?
          </h2>
          <p className={s.ctaBannerSub}>
            나이, 예산, 원하는 삶의 방식만 알려주세요.
          </p>
        </div>
        <Link href="/match" className={s.ctaBannerBtn}>
          내 귀농지 찾기
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
