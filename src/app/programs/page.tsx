import type { Metadata } from "next";
import { Suspense } from "react";
import { FileText, CalendarDays, MessageCircle } from "lucide-react";
import {
  filterProgramsAsync,
  getCurrentPeriod,
  PAGE_SIZE,
  type ProgramFilters,
} from "@/lib/data/programs";
import { ProgramFilter } from "./program-filter";
import { ProgramList } from "./program-list";
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
  const { programs: allFiltered, source } = await filterProgramsAsync(filters);
  const total = allFiltered.length;
  const programs = allFiltered.slice(0, PAGE_SIZE);
  const hasMore = PAGE_SIZE < total;

  // 기준일 표시 텍스트
  const [pYear, pMonth] = period.split("-");
  const periodLabel = `${pYear}년 ${parseInt(pMonth)}월`;

  return (
    <div className={s.page}>
      {/* Page Header */}
      <div className={s.pageHeader}>
        <div className={s.headerTop}>
          <FileText size={20} />
          <span className={s.headerLabel}>Support Programs</span>
        </div>
        <h1 className={s.headerTitle}>지원사업 검색</h1>
        <p className={s.headerDesc}>
          나이, 지역, 희망 작물에 맞는 귀농 · 귀촌 지원사업을 찾아보세요.
        </p>
        <div className={s.headerMeta}>
          <p className={s.headerCount}>
            총 <span className={s.headerCountNumber}>{total}</span>건
          </p>
          <span className={s.headerPeriod}>
            <CalendarDays size={14} />
            {periodLabel} 기준
          </span>
        </div>
      </div>

      {/* Filters + Results */}
      <div className={s.content}>
        <Suspense
          fallback={
            <div className={s.filterFallback}>
              <p>검색 조건을 불러오는 중...</p>
            </div>
          }
        >
          <ProgramFilter
            currentFilters={{
              region: params.region ?? "",
              age: params.age ?? "",
              supportType: params.supportType ?? "",
              query: params.q ?? "",
              includeClosed,
              period,
            }}
          />
        </Suspense>

        <ProgramList
          initialPrograms={programs}
          initialHasMore={hasMore}
          total={total}
          filters={filters}
        />
      </div>

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
