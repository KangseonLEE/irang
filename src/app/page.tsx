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
import { InterviewCarousel } from "@/components/landing/interview-carousel";
import { QuickLinkSection } from "@/components/landing/quick-link-section";
import { HeroSearchHub, type HeroStat, type HeroDeadline } from "@/components/landing/hero-search-hub";
import { HeroSearchDock } from "@/components/landing/hero-search-dock";
import { isStayEvent } from "@/components/events/event-fields";
import { PROVINCES } from "@/lib/data/regions";
import { POPULATION_FALLBACK } from "@/lib/data/population";
import dynamic from "next/dynamic";
import { UpdatesBanner } from "@/components/landing/updates-banner";
import { PromoPopup } from "@/components/landing/promo-popup";
import { loadActivePromos } from "@/lib/promos/queries";
import { LandingClickTracker } from "@/components/analytics/landing-click-tracker";
import { TrendCostSection } from "@/components/landing/trend-cost-section";
import { ExperienceSection, OpportunitySection, countDistinctByGroup } from "@/components/landing/discover-section";
import { filterEventsAsync } from "@/lib/data/events";
import { filterEducationAsync } from "@/lib/data/education";
import { deriveStatus, daysUntilDeadline, isUnannounced, ALWAYS_OPEN } from "@/lib/program-status";
import { StartCardsSection } from "@/components/landing/start-cards-section";
import { CropGlanceSection } from "@/components/landing/crop-glance-section";
import { NewsTabsV2Loader } from "@/components/landing/news-tabs-v2-loader";
import { interviews } from "@/lib/data/landing";
import { PROGRAMS } from "@/lib/data/programs";
import { SurveyCta } from "./survey-cta";
import s from "./page.module.css";

/** 지역 지도 — /regions 와 같은 KoreaMap. 클라이언트 청크를 분리하되 SSR 은 유지(ssr 기본값) */
const KoreaMap = dynamic(
  () => import("@/components/map/korea-map").then((mod) => ({ default: mod.KoreaMap })),
  { loading: () => <div className={s.mapPlaceholder} role="img" aria-label="지도 불러오는 중" /> },
);
// 커튼 리빌 (9/29) — 인터뷰 다크 띠가 이전 섹션을 덮으며 올라온다. page.module.css 대신 전용 모듈
import curtain from "@/components/landing/interview-curtain.module.css";

/* ────────────────────────────────────────────
   Page — 섹션 순서 (withgo 레퍼런스 기반):
   히어로(검색) → 인터뷰(사회적 증거) → 왜 농촌 정착(동기)
   → 비용(현실) → 지원사업(행동) → 뉴스(시의성) → CTA
   ──────────────────────────────────────────── */

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

  // 히어로 A안(10/1) — 마감이 가까운 지원사업 3건 (모집중·확정 마감일, 가까운 순)
  const closingPrograms: HeroDeadline[] = announced
    .filter((p) => p.programStatus === "모집중" && p.applicationEnd !== ALWAYS_OPEN)
    .map((p) => ({ id: p.id, title: p.title, amount: p.supportAmount, daysLeft: daysUntilDeadline(p.applicationEnd) }))
    .filter((p) => Number.isFinite(p.daysLeft) && p.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  return { activePrograms, ongoingPrograms, openProgramCount, dueSoonProgramCount, closingPrograms };
}

/** 지역 지도 섹션 — 시·도 인구밀도(정적 폴백, API 호출 없음). /regions 와 같은 계산 */
function getProvinceDensityMap(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const prov of PROVINCES) {
    const pop = POPULATION_FALLBACK.find((p) => p.sgisCode === prov.sgisCode);
    if (pop && prov.area > 0) map[prov.id] = pop.population / prov.area;
  }
  return map;
}

export default async function HomePage() {
  const { activePrograms, ongoingPrograms, openProgramCount, dueSoonProgramCount, closingPrograms } = getProgramsData();
  // 노출 기간·활성 판정은 서버(DB)에서 끝낸다 — 클라이언트는 받은 것만 그린다.
  // 교육·체험·행사는 두 섹션(Opportunity·Experience)이 나눠 쓰므로 목록을 통째로 넘기고 고르기는 그쪽에서 한다.
  const [promos, eventsResult, educationResult] = await Promise.all([
    loadActivePromos(),
    filterEventsAsync({}),
    filterEducationAsync({}),
  ]);

  // 히어로 데이터 줄 — 전부 배열·DB 결과에서 센다(0 이면 히어로가 그 항목을 그리지 않는다)
  const heroStats: HeroStat[] = [
    { id: "programs_open", label: "신청 가능한 지원사업", value: openProgramCount, unit: "건", href: "/programs" },
    { id: "programs_due", label: "7일 안에 마감", value: dueSoonProgramCount, unit: "건", href: "/programs" },
    {
      id: "education_open",
      label: "모집 중인 교육",
      // 시간대별로 쪼갠 행(같은 과정 10시·13시·15시)을 한 과정으로 센다 — 랜딩 교육 카드와 같은 묶음 기준
      value: countDistinctByGroup(educationResult.courses.filter((c) => c.status === "모집중")),
      unit: "개 과정",
      href: "/education",
    },
    {
      id: "stay_open",
      label: "신청 중인 살아보기",
      value: countDistinctByGroup(eventsResult.events.filter((e) => e.status === "접수중" && isStayEvent(e))),
      unit: "곳",
      href: "/events",
    },
  ];
  const provinceDensityMap = getProvinceDensityMap();

  return (
    <div className={s.page}>
      {/* 랜딩 IA 계측 (8/30): [data-track] 클릭 위임 + ScrollReveal trackId 섹션 노출 → GA4 */}
      <LandingClickTracker />

      {/* 히어로 위 띠배너 — 최근 업데이트 한 줄 알림 (9/2: 히어로 아래에 두면 모바일 첫 화면에 안 들어와 이동).
          서버에서 기본 표시하고 이미 본 사용자만 마운트 후 감춘다 → 첫 방문자는 레이아웃 이동 없음 */}
      <UpdatesBanner />

      {/* 외부 기관 홍보 요청 팝업 (9/29 회장 지시) — 노출 기간·내용은 /admin/promos 에서 제어. 자동화 UA 에선 안 뜬다 */}
      <PromoPopup items={promos} />

      {/* ═══ 1. 히어로 — A안 (10/1 회장 결재, 기후금융포털 구도) ═══ */}
      {/* 검색 입력 + 인기 검색어 + 정착 유형 카드 6 + 지금 열린 기회 수치. data-landing-hero 로 투명 헤더.
          이전 efusioni 히어로는 태그 archive/hero-efusioni-2026-10-01 과 hero-showcase.* 파일로 보관(렌더만 뺐다) */}
      <HeroSearchHub stats={heroStats} deadlines={closingPrograms} />
      {/* 히어로 관찰자(투명 헤더 복귀) + 스크롤 후 하단 고정 바(1024+) */}
      <HeroSearchDock />

      {/* ═══ 1-2. 자주 찾는 서비스 — 아이콘 8종, GNB 여정 순 (9/7 회장 결재: 히어로 밖 별도 섹션) ═══ */}
      <ScrollReveal trackId="quick_link" variant="fade" stagger>
        <QuickLinkSection />
      </ScrollReveal>

      {/* ═══ 2. 지금 열린 기회 — 지원사업·교육 정보 카드 그리드 (9/30 한 섹션 → 10/1 회장: 이미지 유무로 분리) ═══ */}
      <ScrollReveal trackId="discover" variant="fade" stagger>
        <OpportunitySection
          activePrograms={activePrograms}
          ongoingPrograms={ongoingPrograms}
          courses={educationResult.courses}
        />
      </ScrollReveal>

      {/* ═══ 2-2. 지도로 고르는 지역 (10/1 A안) — KoreaMap 재사용, 시·도 17 SSR 링크 병기 ═══ */}
      <ScrollReveal trackId="region_map" variant="fade" stagger>
        <section className={s.mapSection} aria-labelledby="landing-map-title">
          <div className={s.mapText} data-reveal-x="left">
            <span className={s.eyebrow}>#지역 탐색</span>
            <h2 id="landing-map-title" className={s.mapTitle}>
              지도에서 <em>내 지역</em> 찾기
            </h2>
            <p className={s.mapSub}>
              시·도를 누르면 기후·인구·추천 작물·지원사업을 한곳에서 볼 수 있어요
            </p>
            {/* 지도는 클라이언트 클릭(router.push)이라 크롤러가 따라갈 링크를 따로 둔다 */}
            <ul className={s.provinceLinks} aria-label="시·도 바로가기">
              {PROVINCES.map((p) => (
                <li key={p.id}>
                  <Link href={`/regions/${p.id}`} className={s.provinceLink} data-track={`region_map:${p.id}`}>
                    {p.shortName}
                  </Link>
                </li>
              ))}
            </ul>
            <div className={s.mapActions}>
              <Link href="/regions/compare" className={s.mapCompare} data-track="region_map:compare">
                지역 비교하기 <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/regions" className={s.mapAll} data-track="region_map:all">
                지역 탐색 전체
              </Link>
            </div>
          </div>
          <div className={s.mapFigure} data-reveal-x="right">
            <KoreaMap densityMap={provinceDensityMap} showLegend />
          </div>
        </section>
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

      {/* ═══ 5-2. 직접 가 보는 농촌 — 체험·행사 사진 캐러셀 (10/1 A안: 작물 뒤로) ═══ */}
      <ScrollReveal trackId="experience" variant="fade" stagger>
        <ExperienceSection events={eventsResult.events} />
      </ScrollReveal>

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
