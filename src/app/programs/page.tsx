import type { Metadata } from "next";
import { Suspense } from "react";
import { FileText, MessageCircle, ArrowRight, Map } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { FAQPage } from "schema-dts";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { SectionNav } from "@/components/layout/section-nav";
import {
  filterProgramsAsync,
  getCurrentPeriod,
  PAGE_SIZE,
  REGIONS,
  SUPPORT_TYPES,
  AGE_RANGES,
  type ProgramFilters,
} from "@/lib/data/programs";
import { loadSyncMeta, buildPeriodLabel, getDataYear } from "@/lib/data/loader";
import Link from "next/link";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { ProgramList } from "./program-list";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import {
  FilterBar,
  FilterRow,
  FilterGroup,
  FilterDivider,
  FilterActions,
} from "@/components/filter/filter-bar";
import { IncludeClosedHint } from "@/components/filter/include-closed-hint";
import s from "./page.module.css";

const sectionNavItems = [
  { href: "/programs", label: "지원사업" },
  { href: "/education", label: "교육" },
  { href: "/events", label: "체험·행사" },
];

export const metadata: Metadata = {
  title: "귀농 지원사업 — 정착금·주택·영농자금 검색",
  description:
    "전국 귀농·귀촌 지원사업을 지역별로 검색하세요. 정착금 최대 3억, 주택 지원, 영농 자금 등 자격 조건과 신청 방법을 비교해요.",
};

interface PageProps {
  searchParams: Promise<{
    region?: string;
    age?: string;
    supportType?: string;
    q?: string;
    includeClosed?: string;
    period?: string;
    view?: string;
  }>;
}

export default async function ProgramsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const includeClosed = params.includeClosed === "1";
  const viewMode: ViewMode = params.view === "table" ? "table" : "card";
  // 기본값: 현재 연월
  const period = params.period || getCurrentPeriod();

  const filters: ProgramFilters = {
    region: params.region,
    age: params.age,
    supportType: params.supportType,
    query: params.q,
    includeClosed,
    period,
  };

  // SSR: API → 폴백 자동 전환, 첫 페이지 데이터만 렌더
  const [{ programs: allFiltered }, lastSyncAt] = await Promise.all([
    filterProgramsAsync(filters),
    loadSyncMeta("support_programs"),
  ]);
  const total = allFiltered.length;
  const programs = allFiltered.slice(0, PAGE_SIZE);
  const hasMore = PAGE_SIZE < total;

  // 기준일 표시 텍스트 (sync 시각 기반 자동 생성, 폴백: 현재 연월)
  const periodLabel = buildPeriodLabel(lastSyncAt, period);
  const dataYear = getDataYear(lastSyncAt);

  // 현재 활성 필터 (URL 빌딩용)
  const currentFilters: Record<string, string | undefined> = {
    region: params.region,
    supportType: params.supportType,
    q: params.q,
    age: params.age,
    period: params.period,
    includeClosed: params.includeClosed,
    view: params.view,
  };

  return (
    <>
      <JsonLd<FAQPage>
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "귀농 지원금 자격 조건은 무엇인가요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "지자체마다 다르지만 일반적으로 농촌 지역 전입, 일정 기간 거주, 영농 계획서 제출이 기본 조건이에요. 청년(만 39세 이하)은 별도 우대 조건이 있어요.",
              },
            },
            {
              "@type": "Question",
              name: "귀농 정착금은 얼마나 받을 수 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "지자체별로 월 50만~100만 원 수준의 정착 지원금을 최대 3년간 받을 수 있어요. 영농 정착 자금은 최대 3억 원까지 장기 저리 대출도 가능해요.",
              },
            },
          ],
        }}
      />
      <BreadcrumbJsonLd items={[{ name: "지원사업 검색", href: "/programs" }]} />
      {/* 섹션 내비게이션 — .page 바깥에서 full-width sticky */}
      <Suspense>
        <SectionNav items={sectionNavItems} />
      </Suspense>

    <div className={s.page}>
      {/* 로드맵 단계 컨텍스트 */}
      <Suspense>
        <RoadmapBanner />
      </Suspense>

      {/* 정부사업 진입 가이드 배너 */}
      <Link href="/programs/roadmap" className={s.guideBanner}>
        <div className={s.guideBannerIcon} aria-hidden="true">
          <Map size={18} />
        </div>
        <div className={s.guideBannerBody}>
          <span className={s.guideBannerTitle}>정부사업, 어떻게 신청하나요?</span>
          <span className={s.guideBannerDesc}><AutoGlossary text="4대 핵심 사업의 자격 요건·신청 절차 안내" /></span>
        </div>
        <ArrowRight size={16} className={s.guideBannerArrow} />
      </Link>

      {/* Page Header */}
      <PageHeader
        icon={<FileText size={20} />}
        label="Support Programs"
        title="지원사업 검색"
        description="나이, 지역, 희망 작물에 맞는 귀농 · 귀촌 지원사업을 찾아보세요."
        periodLabel={periodLabel}
        dataNote={`${dataYear}년 데이터만 제공되며, 연도 변경은 지원되지 않습니다.`}
      />

      {/* Filter Bar */}
      <FilterBar>
        <FilterActions
          basePath="/programs"
          currentFilters={currentFilters}
          searchPlaceholder="지원사업명, 지역, 기관명으로 검색"
          toggle={{
            paramKey: "includeClosed",
            label: "마감 포함",
            isActive: includeClosed,
          }}
        />
        <FilterDivider />
        <FilterRow>
          <FilterGroup
            label="지역"
            paramKey="region"
            options={REGIONS}
            currentValue={params.region}
            currentFilters={currentFilters}
            basePath="/programs"
          />
        </FilterRow>
        <FilterRow>
          <FilterGroup
            label="지원 유형"
            paramKey="supportType"
            options={SUPPORT_TYPES}
            currentValue={params.supportType}
            currentFilters={currentFilters}
            basePath="/programs"
          />
        </FilterRow>
        <FilterRow>
          <FilterGroup
            label="연령대"
            paramKey="age"
            options={AGE_RANGES}
            currentValue={params.age}
            currentFilters={currentFilters}
            basePath="/programs"
          />
        </FilterRow>
      </FilterBar>

      <IncludeClosedHint
        resultCount={total}
        includeClosed={includeClosed}
        basePath="/programs"
        currentFilters={currentFilters}
        itemLabel="지원사업"
      />

      <div className={s.toolbar}>
        <p className={s.resultText}>
          검색 결과 <span className={s.resultTotal}>{total}</span>건
        </p>
        <Suspense>
          <ViewToggle current={viewMode} />
        </Suspense>
      </div>

      <ProgramList
        initialPrograms={programs}
        initialHasMore={hasMore}
        total={total}
        filters={filters}
        viewMode={viewMode}
        allPrograms={viewMode === "table" ? allFiltered : undefined}
      />

      {/* ═══ 피드백 CTA ═══ */}
      <section className={s.feedbackCta} aria-label="의견 보내기">
        <div className={s.feedbackCtaIcon} aria-hidden="true">
          <MessageCircle size={22} />
        </div>
        <div className={s.feedbackCtaBody}>
          <h2 className={s.feedbackCtaTitle}>
            찾는 지원사업이 없으신가요?
          </h2>
          <p className={s.feedbackCtaDesc}>
            <AutoGlossary text="원하는 지원사업 정보를 알려주시면 우선적으로 업데이트하겠습니다." />
          </p>
        </div>
        <a
          href="https://tally.so/r/mOx0Ap"
          target="_blank"
          rel="noopener noreferrer"
          className={s.feedbackCtaBtn}
        >
          의견 보내기
          <MessageCircle size={14} />
        </a>
      </section>
    </div>
    </>
  );
}
