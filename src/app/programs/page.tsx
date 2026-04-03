import type { Metadata } from "next";
import { Suspense } from "react";
import { FileText } from "lucide-react";
import {
  filterProgramsPaginated,
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
  }>;
}

export default async function ProgramsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const includeClosed = params.includeClosed === "1";

  const filters: ProgramFilters = {
    region: params.region,
    age: params.age ? Number(params.age) : undefined,
    supportType: params.supportType,
    query: params.q,
    includeClosed,
  };

  // SSR: 첫 페이지 데이터만 렌더
  const { programs, total, hasMore } = filterProgramsPaginated(
    filters,
    0,
    PAGE_SIZE
  );

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
        <p className={s.headerCount}>
          총 <span className={s.headerCountNumber}>{total}</span>건
        </p>
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
    </div>
  );
}
