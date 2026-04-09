import type { Metadata } from "next";
import { Suspense } from "react";
import { FileText, MessageCircle, ArrowRight, Map } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
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
  title: "지원사업 검색",
  description:
    "나이, 지역, 희망 작물 조건에 맞는 귀농 지원사업을 검색하세요.",
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
  const { programs: allFiltered } = await filterProgramsAsync(filters);
  const total = allFiltered.length;
  const programs = allFiltered.slice(0, PAGE_SIZE);
  const hasMore = PAGE_SIZE < total;

  // 기준일 표시 텍스트
  const [pYear, pMonth] = period.split("-");
  const periodLabel = `${pYear}년 ${parseInt(pMonth)}월`;

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
      />

      {/* Filter Bar */}
      <FilterBar>
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
        <FilterDivider />
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
