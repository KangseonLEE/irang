import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "이랑 — 농촌 정착 정보 큐레이션 포탈",
  description:
    "농촌 정착(귀농·귀촌)을 준비하는 사람을 위한 정보 큐레이션 서비스예요. 지역 비교, 작물 정보, 정착 비용, 지원사업까지 공공데이터로 한곳에서 확인하세요.",
  alternates: { canonical: "/" },
};

/** 홈페이지 ISR — 6h마다 갱신 (뉴스 갱신 주기 + 봇 트래픽 절감 균형) */
export const revalidate = 21600;
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon as IconWrap } from "@/components/ui/icon";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { HeroSlider } from "@/components/landing/hero-slider";
import { InterviewCarousel } from "@/components/landing/interview-carousel";
import { QuickLinkSection } from "@/components/landing/quick-link-section";
import { JourneyLanes } from "@/components/landing/journey-lanes";
import { resolveJourneyLanes } from "@/lib/data/journey-lanes-images";
import { buildLaneStats } from "@/lib/data/journey-lanes-stats";
import { UpdatesBanner } from "@/components/landing/updates-banner";
import { LandingClickTracker } from "@/components/analytics/landing-click-tracker";
import { TrendCostSection } from "@/components/landing/trend-cost-section";
import { ProgramsSection } from "@/components/landing/programs-section";
import { deriveStatus, daysUntilDeadline, isUnannounced, ALWAYS_OPEN } from "@/lib/program-status";
import { StartCardsSection } from "@/components/landing/start-cards-section";
import { CropGlanceSection } from "@/components/landing/crop-glance-section";
import { NewsTabsV2Loader } from "@/components/landing/news-tabs-v2-loader";
import { interviews } from "@/lib/data/landing";
import { PROGRAMS } from "@/lib/data/programs";
import { SurveyCta } from "./survey-cta";
import s from "./page.module.css";
// 커튼 리빌 (9/29) — 인터뷰 다크 띠가 이전 섹션을 덮으며 올라온다. page.module.css 대신 전용 모듈
import curtain from "@/components/landing/interview-curtain.module.css";

/* ────────────────────────────────────────────
   Page — 섹션 순서 (withgo 레퍼런스 기반):
   히어로(검색) → 인터뷰(사회적 증거) → 왜 농촌 정착(동기)
   → 비용(현실) → 지원사업(행동) → 뉴스(시의성) → CTA
   ──────────────────────────────────────────── */

/** 히어로 여정 레인 — 일러스트 존재 판정까지 끝낸 목록 (프로세스당 1회) */
const heroLanes = resolveJourneyLanes();

/* ── 지원사업 데이터 준비 (서버 사이드) ── */
/**
 * "상시·연중" 판정 창 (8/30 회장 지시 — 랜딩 지원사업 탭 분리).
 * 마감이 없거나(ALWAYS_OPEN: 예산 소진 시까지·모집완료 시까지) 신청 기간이 150일 이상이면
 * 마감 임박·기간 한정 공고와 성격이 달라 별도 탭으로 보여준다 (예: 1/1~12/31 연중 사업).
 */
const LONG_RUNNING_MIN_DAYS = 150;
const MS_PER_DAY = 86_400_000;

function isLongRunning(applicationStart: string, applicationEnd: string): boolean {
  if (applicationEnd === ALWAYS_OPEN) return applicationStart !== ALWAYS_OPEN; // 9999 페어(미발표)는 제외
  const span = (new Date(applicationEnd).getTime() - new Date(applicationStart).getTime()) / MS_PER_DAY;
  return Number.isFinite(span) && span >= LONG_RUNNING_MIN_DAYS;
}

function getProgramsData() {
  const base = PROGRAMS.map((p) => ({
    ...p,
    programStatus: deriveStatus(p.applicationStart, p.applicationEnd),
  }));
  // 9999 페어(공고 미발표)는 deriveStatus가 "모집예정"으로 산출하지만 실제론 미정 → 홈 추천에서 제외
  const announced = base.filter((p) => !isUnannounced(p.applicationStart, p.applicationEnd));

  // 상시·연중 탭 — 모집중 + 장기 접수. 최근 공고 순
  const ongoingPrograms = announced
    .filter((p) => p.programStatus === "모집중" && isLongRunning(p.applicationStart, p.applicationEnd))
    .sort((a, b) => b.applicationStart.localeCompare(a.applicationStart))
    .slice(0, 6);

  // 진행·예정 탭 — 기간 한정 공고만(상시 건은 위 탭으로). 모집중 먼저, 마감 가까운 순
  const statusRank = (s: string) => (s === "모집중" ? 0 : 1);
  // 진행·예정 카드에 마감 임박(D-N) 배지를 인라인 표시 — 별도 "마감 임박" 탭이 같은 건을 중복 노출하던 문제 해소(9/14)
  const activePrograms = announced
    .filter((p) => (p.programStatus === "모집중" || p.programStatus === "모집예정") && !isLongRunning(p.applicationStart, p.applicationEnd))
    .map((p) => ({ ...p, daysLeft: daysUntilDeadline(p.applicationEnd) }))
    .sort((a, b) => statusRank(a.programStatus) - statusRank(b.programStatus) || a.applicationEnd.localeCompare(b.applicationEnd))
    .slice(0, 6);

  // 시작 카드(9/7) — 지금 신청 가능(모집중, 공고 미발표 제외) / 7일 내 마감
  const openProgramCount = announced.filter((p) => p.programStatus === "모집중").length;
  const dueSoonProgramCount = announced.filter((p) => {
    const d = daysUntilDeadline(p.applicationEnd);
    return p.programStatus === "모집중" && d >= 0 && d <= 7;
  }).length;

  return { activePrograms, ongoingPrograms, openProgramCount, dueSoonProgramCount };
}

export default function HomePage() {
  const { activePrograms, ongoingPrograms, openProgramCount, dueSoonProgramCount } = getProgramsData();

  return (
    <div className={s.page}>
      {/* 랜딩 IA 계측 (8/30): [data-track] 클릭 위임 + ScrollReveal trackId 섹션 노출 → GA4 */}
      <LandingClickTracker />

      {/* 히어로 위 띠배너 — 최근 업데이트 한 줄 알림 (9/2: 히어로 아래에 두면 모바일 첫 화면에 안 들어와 이동).
          서버에서 기본 표시하고 이미 본 사용자만 마운트 후 감춘다 → 첫 방문자는 레이아웃 이동 없음 */}
      <UpdatesBanner />

      {/* ═══ 1. 히어로 ═══ */}
      {/* data-landing-hero — 헤더가 :has() 로 이 페이지를 알아보고 1024+ 에서 투명 오버레이가 된다 (9/29 B안) */}
      <section className={s.heroSection} aria-label="검색" data-landing-hero>
        {/* 9/29 회장 1안: 히어로 자체가 "어떤 시작인지" 고르는 화면. 회전 키워드는 뺐다 —
            카드 6장이 이미 선택지를 보여 주므로 제목까지 움직이면 읽을 것이 둘이 된다.
            SSR 에 완전한 문장이 남도록 주제어는 srOnly 로 덧붙인다(h1 은 1개 유지). */}
        {/* 여정을 고르면 이 머리말은 접히고 선택 화면이 히어로를 차지한다 (9/29 S3) */}
        <div className={s.heroIntro}>
          <h1 className={s.heroTitle}>
            어떤 시작을 생각하세요?
            <span className={s.srOnly}>
              {" "}귀농·귀촌·귀산촌·청년농·스마트팜까지, 지역·작물·지원금을 비교해 보세요.
            </span>
          </h1>
          <p className={s.heroSubtitle}>
            고르면 지원금·작물·지역을 그 기준으로 보여 드려요.
          </p>
        </div>

        {/* 여정 카드 6장 — 배경 슬라이드 위. 일러스트 존재 판정은 서버에서 (파일이 없어도 안 깨짐) */}
        <JourneyLanes lanes={heroLanes} stats={buildLaneStats(heroLanes.map((l) => l.id))} />

        {/* 슬라이드 히어로 — 배경 레이어 + 슬라이드별 카피 + 좌하단 컨트롤.
            9/28 3차 회장 지시로 모바일까지 공통 렌더(뷰포트 분기는 CSS). 모바일은 검색창을 빼고
            헤더 트리거가 검색 입구를 맡는다 — page.module.css 1-M 블록. */}
        <HeroSlider />
      </section>

      {/* ═══ 1-2. 자주 찾는 서비스 — 아이콘 8종, GNB 여정 순 (9/7 회장 결재: 히어로 밖 별도 섹션) ═══ */}
      <ScrollReveal trackId="quick_link" variant="fade" stagger>
        <QuickLinkSection />
      </ScrollReveal>

      {/* ═══ 2. 지원사업 (진행·예정 + 마감 임박 + 상시·연중 탭) — 9/7 회장: 인터뷰와 순서 교체 ═══ */}
      <ScrollReveal trackId="programs" variant="fade" stagger>
        <ProgramsSection
          activePrograms={activePrograms}
          ongoingPrograms={ongoingPrograms}
        />
      </ScrollReveal>

      {/* ═══ 3+4. 트렌드 + 비용 통합 ═══ */}
      <ScrollReveal trackId="trend_cost" variant="fade">
        <TrendCostSection />
      </ScrollReveal>

      {/* ═══ 4-2 + 5. 작물 한눈에 + 이랑에서 할 수 있는 것 3카드 (연한 그린 배경) ═══ */}
      <div className={s.lightGreenBg}>
        <ScrollReveal trackId="crops" variant="fade" stagger>
          <CropGlanceSection />
        </ScrollReveal>
        <ScrollReveal trackId="start_cards" variant="fade" stagger>
          <StartCardsSection
            openProgramCount={openProgramCount}
            dueSoonProgramCount={dueSoonProgramCount}
          />
        </ScrollReveal>
      </div>

      {/* ═══ 6. 농촌으로 간 사람들의 이야기 (다크 배경) — 9/7 회장: 지원사업 아래로 ═══ */}
      <ScrollReveal trackId="interviews" variant="fade" stagger>
        <div className={`${s.darkBg} ${curtain.curtain}`}>
          <section className={s.interviewSection} aria-label="인터뷰">
            <div className={s.interviewHeader} data-reveal-x="left">
              <div className={s.interviewHeading}>
                <span className={s.eyebrowDark}>#실제 정착자</span>
                <h2 className={`${s.interviewSectionTitle} ${s.sectionTitleDark}`}>
                  먼저 떠난 사람들의 <em>진짜 이야기</em>
                </h2>
                <p className={s.interviewSub}>
                  도시를 떠나 새로운 삶을 시작한 사람들이에요
                </p>
              </div>
              <Link href="/interviews" className={s.interviewHeaderLink} data-track="interviews:view_all">
                모두 보기 <IconWrap icon={ArrowRight} size="sm" />
              </Link>
            </div>
            <InterviewCarousel items={interviews.slice(0, 6)} variant="dark" />
          </section>
        </div>
      </ScrollReveal>

      {/* ═══ 6+7. 뉴스 → CTA (여백 없이 연결) ═══ */}
      <div className={s.bottomGroup}>
        <ScrollReveal trackId="news" variant="fade" stagger>
          <div className={s.mutedBg}>
            <section className={s.newsSection} aria-label="농촌 소식">
              <div className={s.sectionHeader} data-reveal-x="left">
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

        <ScrollReveal trackId="bottom_cta" variant="fade" stagger>
          <section className={s.bottomCta} aria-label="다음 단계 선택">
            {/* 좌측 텍스트 블록 */}
            <div className={s.ctaTextBlock} data-reveal-x="left">
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
            <div className={s.ctaPaths} data-reveal-x="right">
              <Link href="/guide" className={s.ctaPath} data-track="bottom_cta:guide" data-reveal-item>
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
              <Link href="/match" className={s.ctaPath} data-track="bottom_cta:match" data-reveal-item>
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
