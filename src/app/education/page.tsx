import type { Metadata } from "next";
import { Suspense } from "react";
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
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import {
  FilterBar,
  FilterRow,
  FilterGroup,
  FilterDivider,
  FilterActions,
} from "@/components/filter/filter-bar";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import s from "./page.module.css";

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
  const period = params.period || getCurrentPeriod();

  const filters: EducationFilters = {
    region: params.region,
    type: params.type,
    level: params.level,
    query: params.q,
    period,
    includeClosed,
  };

  const { courses } = await filterEducationAsync(filters);

  // 기준일 표시 텍스트
  const [pYear, pMonth] = period.split("-");
  const periodLabel = `${pYear}년 ${parseInt(pMonth)}월`;

  // 현재 활성 필터 (URL 빌딩용)
  const currentFilters: Record<string, string | undefined> = {
    region: params.region,
    type: params.type,
    level: params.level,
    q: params.q,
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
        icon={<GraduationCap size={20} />}
        label="Education"
        title="귀농 교육"
        description="귀농에 필요한 교육 과정을 지역, 유형, 난이도별로 찾아보세요."
        count={courses.length}
        periodLabel={periodLabel}
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

      {/* Course Grid or Empty */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={32} />}
          message={<>조건에 맞는 교육 과정이 없습니다.<br />검색 조건을 변경하거나 필터를 초기화해 보세요.</>}
        />
      ) : (
        <div className={s.grid}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
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
      <p className={s.cardDesc}>{course.description}</p>

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
