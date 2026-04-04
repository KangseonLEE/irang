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
  Search,
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

/** 현재 활성 필터를 유지하면서 특정 필터만 변경하는 URL 생성 */
function buildFilterUrl(
  current: Record<string, string | undefined>,
  key: string,
  value: string | undefined,
): string {
  const params = new URLSearchParams();

  const merged = { ...current, [key]: value };

  for (const [k, v] of Object.entries(merged)) {
    if (v && v !== "전체") {
      params.set(k, v);
    }
  }

  const qs = params.toString();
  return qs ? `/education?${qs}` : "/education";
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

/** 상태 배지 */
function StatusBadge({ status }: { status: EducationCourse["status"] }) {
  switch (status) {
    case "모집중":
      return <span className={s.statusOpen}>모집중</span>;
    case "모집예정":
      return <span className={s.statusUpcoming}>모집예정</span>;
    case "마감":
      return <span className={s.statusClosed}>마감</span>;
  }
}

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

  const { courses, source } = await filterEducationAsync(filters);

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
      <div className={s.pageHeader}>
        <div className={s.headerTop}>
          <GraduationCap size={20} />
          <span className={s.headerLabel}>Education</span>
        </div>
        <h1 className={s.headerTitle}>귀농 교육</h1>
        <p className={s.headerDesc}>
          귀농에 필요한 교육 과정을 지역, 유형, 난이도별로 찾아보세요.
        </p>
        <div className={s.headerMeta}>
          <p className={s.headerCount}>
            총 <span className={s.headerCountNumber}>{courses.length}</span>건
          </p>
          <span className={s.headerPeriod}>
            <CalendarDays size={14} />
            {periodLabel} 기준
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={s.filterBar}>
        {/* 지역 필터 */}
        <div className={s.filterRow}>
          <div className={s.filterGroup}>
            <span className={s.filterLabel}>지역</span>
            <div className={s.filterPills}>
              <Link
                href={buildFilterUrl(currentFilters, "region", undefined)}
                className={!params.region ? s.pillActive : s.pill}
              >
                전체
              </Link>
              {EDUCATION_REGIONS.map((region) => (
                <Link
                  key={region}
                  href={buildFilterUrl(currentFilters, "region", region)}
                  className={params.region === region ? s.pillActive : s.pill}
                >
                  {region}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 유형 + 난이도 필터 */}
        <div className={s.filterRow}>
          <div className={s.filterGroup}>
            <span className={s.filterLabel}>유형</span>
            <div className={s.filterPills}>
              <Link
                href={buildFilterUrl(currentFilters, "type", undefined)}
                className={!params.type ? s.pillActive : s.pill}
              >
                전체
              </Link>
              {EDUCATION_TYPES.map((t) => (
                <Link
                  key={t}
                  href={buildFilterUrl(currentFilters, "type", t)}
                  className={params.type === t ? s.pillActive : s.pill}
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>

          <div className={s.filterGroup}>
            <span className={s.filterLabel}>난이도</span>
            <div className={s.filterPills}>
              <Link
                href={buildFilterUrl(currentFilters, "level", undefined)}
                className={!params.level ? s.pillActive : s.pill}
              >
                전체
              </Link>
              {EDUCATION_LEVELS.map((lv) => (
                <Link
                  key={lv}
                  href={buildFilterUrl(currentFilters, "level", lv)}
                  className={params.level === lv ? s.pillActive : s.pill}
                >
                  {lv}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <hr className={s.filterDivider} />

        {/* 검색 + 마감 포함 + 초기화 */}
        <div className={s.filterActions}>
          <form className={s.searchForm} action="/education" method="get">
            {/* 기존 필터를 hidden으로 유지 */}
            {params.region && (
              <input type="hidden" name="region" value={params.region} />
            )}
            {params.type && (
              <input type="hidden" name="type" value={params.type} />
            )}
            {params.level && (
              <input type="hidden" name="level" value={params.level} />
            )}
            {params.period && (
              <input type="hidden" name="period" value={params.period} />
            )}
            {params.includeClosed && (
              <input
                type="hidden"
                name="includeClosed"
                value={params.includeClosed}
              />
            )}
            <Search size={16} className={s.searchIcon} />
            <input
              type="text"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="교육명, 기관명 검색..."
              className={s.searchInput}
            />
          </form>

          <Link
            href={buildFilterUrl(
              currentFilters,
              "includeClosed",
              includeClosed ? undefined : "1",
            )}
            className={includeClosed ? s.closedToggleActive : s.closedToggle}
          >
            마감 포함
          </Link>

          <Link href="/education" className={s.resetLink}>
            초기화
          </Link>
        </div>
      </div>

      {/* Result Count */}
      <p className={s.resultCount}>
        검색 결과 <span className={s.resultTotal}>{courses.length}</span>건
      </p>

      {/* Course Grid or Empty */}
      {courses.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyInner}>
            <GraduationCap className={s.emptyIcon} />
            <p className={s.emptyTitle}>
              조건에 맞는 교육 과정이 없습니다
            </p>
            <p className={s.emptyDesc}>
              검색 조건을 변경하거나 필터를 초기화해 보세요.
            </p>
          </div>
        </div>
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
    <div className={`${s.card}${isClosed ? ` ${s.cardClosed}` : ""}`}>
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

      {/* 하단: 비용 + 상세 링크 */}
      <div className={s.cardFooter}>
        <span className={s.cardCost}>{course.cost}</span>
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className={s.cardLink}
        >
          상세보기
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
