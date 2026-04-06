import type { Metadata } from "next";
import { Suspense } from "react";
import { FileText, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import {
  filterProgramsAsync,
  getCurrentPeriod,
  PAGE_SIZE,
  REGIONS,
  SUPPORT_TYPES,
  type ProgramFilters,
} from "@/lib/data/programs";
import { ProgramList } from "./program-list";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import {
  FilterBar,
  FilterRow,
  FilterGroup,
  FilterDivider,
  FilterActions,
} from "@/components/filter/filter-bar";
import s from "./page.module.css";

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
  }>;
}

export default async function ProgramsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const includeClosed = params.includeClosed === "1";
  // 기본값: 현재 연월
  const period = params.period || getCurrentPeriod();

  const filters: ProgramFilters = {
    region: params.region,
    age: params.age ? Number(params.age) : undefined,
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
  };

  return (
    <div className={s.page}>
      {/* 로드맵 단계 컨텍스트 */}
      <Suspense>
        <RoadmapBanner />
      </Suspense>

      {/* Page Header */}
      <PageHeader
        icon={<FileText size={20} />}
        label="Support Programs"
        title="지원사업 검색"
        description="나이, 지역, 희망 작물에 맞는 귀농 · 귀촌 지원사업을 찾아보세요."
        count={total}
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
        <FilterDivider />
        <FilterActions
          basePath="/programs"
          currentFilters={currentFilters}
          searchPlaceholder="지원사업명, 지역, 기관명으로 검색"
          numberInput={{
            paramKey: "age",
            label: "나이",
            placeholder: "만 나이",
            min: 18,
            max: 80,
          }}
          toggle={{
            paramKey: "includeClosed",
            label: "마감 포함",
            isActive: includeClosed,
          }}
        />
      </FilterBar>

      <ProgramList
        initialPrograms={programs}
        initialHasMore={hasMore}
        total={total}
        filters={filters}
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
            원하는 지원사업 정보를 알려주시면 우선적으로 업데이트하겠습니다.
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
  );
}
