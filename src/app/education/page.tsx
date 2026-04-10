import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  GraduationCap,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Monitor,
  Building2,
  Combine,
} from "lucide-react";
import {
  filterEducationAsync,
  getCurrentPeriod,
  EDUCATION_REGIONS,
  EDUCATION_TYPES,
  EDUCATION_LEVELS,
  type EducationCourse,
  type EducationFilters,
} from "@/lib/data/education";
import { loadSyncMeta, buildPeriodLabel, getDataYear } from "@/lib/data/loader";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import {
  FilterBar,
  FilterRow,
  FilterGroup,
  FilterDivider,
  FilterActions,
} from "@/components/filter/filter-bar";
import { IncludeClosedHint } from "@/components/filter/include-closed-hint";
import { PageHeader } from "@/components/ui/page-header";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGrid } from "@/components/ui/card-grid";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { SectionNav } from "@/components/layout/section-nav";
import { Pagination } from "@/components/ui/pagination";
import s from "./page.module.css";
import dt from "@/components/ui/data-table.module.css";

const TABLE_PAGE_SIZE = 20;

const sectionNavItems = [
  { href: "/programs", label: "지원사업" },
  { href: "/education", label: "교육" },
  { href: "/events", label: "체험·행사" },
];

export const metadata: Metadata = {
  title: "귀농 교육",
  description:
    "귀농에 필요한 교육 과정을 지역, 유형, 난이도별로 검색하세요. 온·오프라인 귀농 교육 정보를 한눈에 확인할 수 있습니다.",
};

interface PageProps {
  searchParams: Promise<{
    region?: string;
    type?: string;
    level?: string;
    q?: string;
    period?: string;
    includeClosed?: string;
    view?: string;
    page?: string;
  }>;
}

/** 교육 유형 아이콘 */
function TypeIcon({ type }: { type: EducationCourse["type"] }) {
  switch (type) {
    case "온라인":
      return <Monitor size={13} />;
    case "오프라인":
      return <Building2 size={13} />;
    case "혼합":
      return <Combine size={13} />;
  }
}

/* StatusBadge is now a shared component from @/components/ui/status-badge */

export default async function EducationPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const includeClosed = params.includeClosed === "1";
  const viewMode: ViewMode = params.view === "table" ? "table" : "card";
  const period = params.period || getCurrentPeriod();

  const filters: EducationFilters = {
    region: params.region,
    type: params.type,
    level: params.level,
    query: params.q,
    period,
    includeClosed,
  };

  const [{ courses }, lastSyncAt] = await Promise.all([
    filterEducationAsync(filters),
    loadSyncMeta("education_courses"),
  ]);

  // 테이블 페이지네이션
  const tablePage = Math.max(1, Number(params.page) || 1);
  const tableTotalPages = Math.ceil(courses.length / TABLE_PAGE_SIZE);
  const tableRows = courses.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE,
  );

  // 기준일 표시 텍스트 (sync 시각 기반 자동 생성, 폴백: 현재 연월)
  const periodLabel = buildPeriodLabel(lastSyncAt, period);
  const dataYear = getDataYear(lastSyncAt);

  // 현재 활성 필터 (URL 빌딩용)
  const currentFilters: Record<string, string | undefined> = {
    region: params.region,
    type: params.type,
    level: params.level,
    q: params.q,
    period: params.period,
    includeClosed: params.includeClosed,
    view: params.view,
    page: params.page,
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

      {/* Page Header */}
      <PageHeader
        icon={<GraduationCap size={20} />}
        label="Education"
        title="귀농 교육"
        description="귀농에 필요한 교육 과정을 지역, 유형, 난이도별로 찾아보세요."
        periodLabel={periodLabel}
        dataNote={`${dataYear}년 데이터만 제공되며, 연도 변경은 지원되지 않습니다.`}
      />

      {/* Filter Bar */}
      <FilterBar>
        <FilterRow>
          <FilterGroup
            label="지역"
            paramKey="region"
            options={EDUCATION_REGIONS}
            currentValue={params.region}
            currentFilters={currentFilters}
            basePath="/education"
          />
        </FilterRow>
        <FilterRow>
          <FilterGroup
            label="유형"
            paramKey="type"
            options={EDUCATION_TYPES}
            currentValue={params.type}
            currentFilters={currentFilters}
            basePath="/education"
          />
          <FilterGroup
            label="난이도"
            paramKey="level"
            options={EDUCATION_LEVELS}
            currentValue={params.level}
            currentFilters={currentFilters}
            basePath="/education"
          />
        </FilterRow>
        <FilterDivider />
        <FilterActions
          basePath="/education"
          currentFilters={currentFilters}
          searchPlaceholder="교육명, 기관명 검색..."
          toggle={{
            paramKey: "includeClosed",
            label: "마감 포함",
            isActive: includeClosed,
          }}
        />
      </FilterBar>

      <IncludeClosedHint
        resultCount={courses.length}
        includeClosed={includeClosed}
        basePath="/education"
        currentFilters={currentFilters}
        itemLabel="교육과정"
      />

      {/* 보기 모드 토글 */}
      <div className={s.toolbar}>
        <p className={s.resultText}>
          검색 결과 <span className={s.resultTotal}>{courses.length}</span>건
        </p>
        <Suspense>
          <ViewToggle current={viewMode} />
        </Suspense>
      </div>

      {/* Course Grid / Table / Empty */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={32} />}
          message={<>조건에 맞는 교육 과정이 없습니다.<br />검색 조건을 변경하거나 필터를 초기화해 보세요.</>}
        />
      ) : viewMode === "table" ? (
        <>
          <div className={dt.wrap}>
            <table className={dt.table}>
              <thead>
                <tr>
                  <th>상태</th>
                  <th>교육명</th>
                  <th>지역</th>
                  <th>유형</th>
                  <th>난이도</th>
                  <th>비용</th>
                  <th className={dt.hideOnMobile}>기관</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((c) => (
                  <tr key={c.id} className={dt.clickableRow}>
                    <td><StatusBadge status={c.status} /></td>
                    <td className={dt.titleCell}>
                      <Link href={c.url} target="_blank" rel="noopener noreferrer" className={`${dt.titleLink} ${dt.rowLink}`}>
                        {c.title}
                      </Link>
                    </td>
                    <td className={dt.muted}>{c.region}</td>
                    <td className={dt.muted}>{c.type}</td>
                    <td className={dt.muted}>{c.level}</td>
                    <td className={dt.amount}>{c.cost}</td>
                    <td className={`${dt.muted} ${dt.hideOnMobile}`}>{c.organization}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Suspense>
            <Pagination currentPage={tablePage} totalPages={tableTotalPages} />
          </Suspense>
        </>
      ) : (
        <CardGrid>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </CardGrid>
      )}
    </div>
    </>
  );
}

/** 교육 과정 카드 */
function CourseCard({ course }: { course: EducationCourse }) {
  const isClosed = course.status === "마감";

  return (
    <a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${s.card}${isClosed ? ` ${s.cardClosed}` : ""}`}
    >
      {/* 상단: 상태 + 난이도 */}
      <div className={s.cardTopRow}>
        <StatusBadge status={course.status} />
        <span className={s.levelBadge}>{course.level}</span>
      </div>

      {/* 제목 */}
      <h3 className={s.cardTitle}>{course.title}</h3>

      {/* 기관 + 지역 */}
      <div className={s.cardSubtitle}>
        <MapPin size={13} />
        <span className={s.cardRegion}>{course.region}</span>
        <span className={s.cardDot} />
        <span className={s.cardOrg}>{course.organization}</span>
      </div>

      <hr className={s.cardDivider} />

      {/* 메타 정보 2x2 그리드 */}
      <div className={s.cardMeta}>
        <div className={s.metaItem}>
          <TypeIcon type={course.type} />
          <span className={s.metaValue}>{course.type}</span>
        </div>
        <div className={s.metaItem}>
          <Clock size={13} />
          <span className={s.metaValue}>{course.duration}</span>
        </div>
        <div className={s.metaItem}>
          <CalendarDays size={13} />
          <span className={s.metaValue}>{course.schedule}</span>
        </div>
        <div className={s.metaItem}>
          <Users size={13} />
          <span className={s.metaValue}>
            {course.capacity ? `정원 ${course.capacity}명` : "제한없음"}
          </span>
        </div>
      </div>

      {/* 설명 */}
      <p className={s.cardDesc}><AutoGlossary text={course.description} /></p>

      {/* 하단: 비용 */}
      <div className={s.cardFooter}>
        <span className={s.cardCost}>{course.cost}</span>
        <span className={s.cardLink} aria-hidden="true">
          상세보기
          <ExternalLink size={12} />
        </span>
      </div>
    </a>
  );
}
