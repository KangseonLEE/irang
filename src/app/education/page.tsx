import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { FAQPage } from "schema-dts";
import {
  GraduationCap,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  Monitor,
  Building2,
  Combine,
  Heart,
  ChevronRight,
} from "lucide-react";
import {
  filterEducationAsync,
  getCurrentPeriod,
  sortEducation,
  EDUCATION_REGIONS,
  EDUCATION_TYPES,
  DEFAULT_EDUCATION_SORT,
  type EducationCourse,
  type EducationFilters,
  type EducationSortKey,
} from "@/lib/data/education";
import { EducationSortControl } from "./education-sort-control";
import { loadSyncMeta, buildPeriodLabel, getDataYear } from "@/lib/data/loader";
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner";
import { FilterBar, FilterActions } from "@/components/filter/filter-bar";
import { IncludeClosedHint } from "@/components/filter/include-closed-hint";
import { FilterShell } from "@/components/filter/filter-shell";
import { PageHeader } from "@/components/ui/page-header";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { shareMetadata } from "@/lib/seo/share-metadata";
import {
  displayAmount,
  displayEducationLevel,
  displayEducationType,
  displayText,
  displayValue,
  isCapacityKnown,
} from "@/lib/programs/display";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGrid } from "@/components/ui/card-grid";
import { CrawlGroupNote } from "@/components/ui/crawl-group-note";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { SectionNav } from "@/components/layout/section-nav";
import { Pagination } from "@/components/ui/pagination";
import s from "./page.module.css";
import dt from "@/components/ui/data-table.module.css";
import { RETURN_FARM_LOAN } from "@/lib/data/policy-facts";

const TABLE_PAGE_SIZE = 20;

const sectionNavItems = [
  { href: "/programs", label: "지원사업" },
  { href: "/education", label: "교육" },
  { href: "/events", label: "체험·행사" },
];

const DESCRIPTION = `귀농 귀촌 교육 과정을 검색하세요. 정착 교육(${RETURN_FARM_LOAN.lowestGradeBelowHours.value}시간 이상 권장), 온라인·오프라인 실습, 멘토링 프로그램 일정과 신청 방법을 한눈에 비교해요.`;

export const metadata: Metadata = {
  title: "귀농 교육 — 온라인·현장 실습·멘토링 과정 검색",
  description: DESCRIPTION,
  alternates: { canonical: "/education" },
  // 공유 카드 — 없으면 레이아웃의 사이트 기본 제목·설명이 나갔다 (10/6 QA Q2-W3)
  ...shareMetadata({
    title: "귀농 교육 — 온라인·현장 실습·멘토링 과정 검색 | 이랑",
    description: DESCRIPTION,
    path: "/education",
  }),
};

/** 봇 트래픽 절감은 next.config.ts headers의 s-maxage로 처리.
 *  searchParams 의존 페이지에 export const revalidate 추가 시 dynamic SSR과 충돌 (2026-05-11 lessons). */

interface PageProps {
  // level(난이도)은 읽지 않는다 — 아래 FilterShell 주석 (10/6). 예전 ?level= 링크로 들어와도 거르지 않는다
  searchParams: Promise<{
    region?: string;
    type?: string;
    q?: string;
    period?: string;
    includeClosed?: string;
    view?: string;
    page?: string;
    sort?: string;
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
  const currentSort: EducationSortKey =
    params.sort === "recent" ? "recent" : DEFAULT_EDUCATION_SORT;

  const filters: EducationFilters = {
    region: params.region,
    type: params.type,
    query: params.q,
    period,
    includeClosed,
  };

  const [{ courses: rawCourses }, lastSyncAt] = await Promise.all([
    filterEducationAsync(filters),
    loadSyncMeta("education_courses"),
  ]);
  const courses = sortEducation(rawCourses, currentSort);

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
    q: params.q,
    period: params.period,
    includeClosed: params.includeClosed,
    view: params.view,
    sort: currentSort === DEFAULT_EDUCATION_SORT ? undefined : currentSort,
    page: params.page,
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
              name: "정착 교육은 어디서 받을 수 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "각 시·도 농업기술센터, 귀농귀촌종합센터, 농업대학 등에서 온·오프라인 교육을 제공해요. 대부분 무료이고, 수료 시 지원사업 가산점을 받을 수 있어요.",
              },
            },
            {
              "@type": "Question",
              name: "정착 교육 기간은 얼마나 걸리나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "단기 과정은 1~5일, 장기 과정은 3개월~1년까지 다양해요. 정착 준비 단계에 맞는 과정을 선택하는 것이 중요해요.",
              },
            },
          ],
        }}
      />
      <BreadcrumbJsonLd items={[{ name: "정착 교육", href: "/education" }]} />
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
        title="정착 교육"
        description="귀농에 필요한 교육 과정을 지역, 유형별로 찾아보세요."
        periodLabel={periodLabel}
        dataNote={`${dataYear}년 데이터만 있어요. 연도는 바꿀 수 없어요.`}
      />

      {/* 치유·사회적 농업 진입점 */}
      <Link href="/education/therapy" className={s.therapyBanner}>
        <span className={s.therapyBannerIcon} aria-hidden="true">
          <Heart size={18} />
        </span>
        <span className={s.therapyBannerText}>
          <span className={s.therapyBannerTitle}>
            작물 생산 말고 다른 귀농이 궁금하다면
          </span>
          <span className={s.therapyBannerDesc}>
            치유농업·사회적 농업 가이드로 이동해요
          </span>
        </span>
        <ChevronRight size={18} className={s.therapyBannerArrow} aria-hidden="true" />
      </Link>

      {/* Filter Bar — 데스크탑(>= 640) FilterBar + 모바일(< 640) BottomSheet */}
      <FilterShell
        basePath="/education"
        currentFilters={currentFilters}
        params={[
          {
            paramKey: "region",
            label: "지역",
            options: EDUCATION_REGIONS,
            currentValue: params.region,
          },
          {
            paramKey: "type",
            label: "유형",
            options: EDUCATION_TYPES,
            currentValue: params.type,
          },
          /* '난이도' 그룹은 감춘다 (10/6 CoS 결정) — 수집 행의 level 은 원문이 아니라 수집기 기본값("초급")이라
             '모름'으로 처리했고(lib/programs/display), 그 결과 "초급"으로 거르면 109건이 1건만 남아 필터가 쓸모없어졌다.
             수집기가 실제 수준을 줄 때까지 숨기고, 예전 ?level= 링크도 거르지 않는다(안 보이는 필터가 목록을 줄이지 않게).
             되살릴 때: { paramKey: "level", label: "난이도", options: EDUCATION_LEVELS } + filters·currentFilters 의 level */
        ]}
        mobileActions={
          <FilterBar>
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
        }
      />

      <IncludeClosedHint
        resultCount={courses.length}
        includeClosed={includeClosed}
        basePath="/education"
        currentFilters={currentFilters}
        itemLabel="교육과정"
      />

      {/* 보기 모드 토글 + 정렬 */}
      <ListToolbar count={courses.length}>
        <EducationSortControl
          currentSort={currentSort}
          currentFilters={currentFilters}
          basePath="/education"
        />
        <Suspense>
          <ViewToggle current={viewMode} />
        </Suspense>
      </ListToolbar>

      {/* Course Grid / Table / Empty */}
      {courses.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={32} />}
          message={<>조건에 맞는 교육 과정이 없어요.<br />검색 조건을 변경하거나 필터를 초기화해 보세요.</>}
          linkHref="/education"
          linkText="전체 교육 보기"
        />
      ) : viewMode === "table" ? (
        <>
          <div className={dt.wrap}>
            <table className={dt.table}>
              <thead>
                <tr>
                  <th>상태</th>
                  <th>교육명</th>
                  <th className={dt.hideOnMobile}>지역</th>
                  <th className={dt.hideOnMobile}>유형</th>
                  <th className={dt.hideOnMobile}>난이도</th>
                  <th>비용</th>
                  <th className={dt.hideOnMobile}>기관</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((c) => (
                  <tr key={c.id} className={dt.clickableRow}>
                    <td><StatusBadge status={c.status} /></td>
                    <td className={dt.titleCell}>
                      <Link href={`/education/${c.id}`} className={`${dt.titleLink} ${dt.rowLink}`}>
                        {c.title}
                      </Link>
                      {c.crawlGroup && (
                        <span className={s.groupTag}>외 {c.crawlGroup.others.length}개 지역</span>
                      )}
                    </td>
                    <td className={`${dt.muted} ${dt.hideOnMobile}`}>{c.region}</td>
                    {/* 수집 행의 기본값(유형 "오프라인"·난이도 "초급")·채움값("상세 공고 참조")은 "—" — 카드와 같은 규칙 (10/6 QA) */}
                    <td className={`${dt.muted} ${dt.hideOnMobile}`}>{displayEducationType(c.id, c.type) ?? "—"}</td>
                    <td className={`${dt.muted} ${dt.hideOnMobile}`}>{displayEducationLevel(c.id, c.level) ?? "—"}</td>
                    <td className={dt.amount}>{displayAmount(c.id, c.cost) ?? "—"}</td>
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
        <div key={currentSort} className={s.gridAnim}>
          <CardGrid>
            {courses.map((course, i) => (
              <div
                key={course.id}
                className={`${s.cardCell} ${s.cardAnim}`}
                style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}
              >
                <CourseCard course={course} />
                {course.crawlGroup && (
                  <CrawlGroupNote group={course.crawlGroup} basePath="/education" />
                )}
              </div>
            ))}
          </CardGrid>
        </div>
      )}
    </div>
    </>
  );
}

/** 교육 과정 카드 */
function CourseCard({ course }: { course: EducationCourse }) {
  const isClosed = course.status === "마감";
  // 수집 행 설명은 "…에서 수집했어요"·"원문 공고를 꼭 확인하세요" 같은 상투 문장뿐이라 줄째 숨긴다 (10/4 QA, 지원사업 카드와 같은 규칙)
  const description = displayText(course.id, course.description);
  // 수집 행 비용은 원문 칸이 비어 "상세 공고 참조"가 채워진다 — 금액처럼 굵게 보이지 않게 비운다(자리는 유지)
  const cost = displayAmount(course.id, course.cost);
  // 수집 행의 기본값·채움값은 칸째 뺀다 (10/6 QA Q4-W4, lib/programs/display) — 110장 중 108장의 시계 칸이
  // "상세 공고 참조"였고, 난이도 "초급"·RDA 과정의 "오프라인"·정원 "제한없음"은 원문이 아니라 수집기 기본값이다
  const level = displayEducationLevel(course.id, course.level);
  const type = displayEducationType(course.id, course.type);
  const duration = displayValue(course.id, course.duration);
  const schedule = displayValue(course.id, course.schedule);
  const capacityLabel = isCapacityKnown(course.capacity) ? `정원 ${course.capacity}명` : null;

  return (
    <Link
      href={`/education/${course.id}`}
      className={`${s.card}${isClosed ? ` ${s.cardClosed}` : ""}`}
    >
      {/* 상단: 상태 + 난이도 */}
      <div className={s.cardTopRow}>
        <StatusBadge status={course.status} />
        {level && <span className={s.levelBadge}>{level}</span>}
      </div>

      {/* 제목 — 목록이 h1(페이지 제목) 바로 아래라 h2 (10/4 axe heading-order: h1 다음 h3 건너뜀).
          .cardTitle 이 margin·글자 크기·굵기를 모두 정해 두어 화면은 같다 */}
      <h2 className={s.cardTitle}>{course.title}</h2>

      {/* 기관 + 지역 */}
      <div className={s.cardSubtitle}>
        <MapPin size={13} />
        <span className={s.cardRegion}>{course.region}</span>
        <span className={s.cardDot} />
        <span className={s.cardOrg}>{course.organization}</span>
      </div>

      {/* 구분선 — 아래에 메타·설명이 하나라도 있을 때만 (수집 행은 둘 다 빌 수 있다) */}
      {(type || duration || capacityLabel || schedule || description) && <hr className={s.cardDivider} />}

      {/* 메타 정보 — 짧은 값(방식·정원)은 2열, 긴 값(기간·일정)은 한 줄을 다 쓴다. 반 칸이면
          "2026-10-07 ~ 2026-…"처럼 끝 날짜가 말줄임으로 잘렸다 (10/6 QA — 마감 포함 199장 메타 796칸 중 130칸) */}
      {(type || duration || capacityLabel || schedule) && (
        <div className={s.cardMeta}>
          {type && (
            <div className={s.metaItem}>
              <TypeIcon type={type} />
              <span className={s.metaValue}>{type}</span>
            </div>
          )}
          {capacityLabel && (
            <div className={s.metaItem}>
              <Users size={13} />
              <span className={s.metaValue}>{capacityLabel}</span>
            </div>
          )}
          {duration && (
            <div className={`${s.metaItem} ${s.metaItemWide}`}>
              <Clock size={13} />
              <span className={s.metaValue}>{duration}</span>
            </div>
          )}
          {schedule && (
            <div className={`${s.metaItem} ${s.metaItemWide}`}>
              <CalendarDays size={13} />
              <span className={s.metaValue}>{schedule}</span>
            </div>
          )}
        </div>
      )}

      {/* 설명 */}
      {description && <p className={s.cardDesc}><AutoGlossary text={description} /></p>}

      {/* 하단: 비용 */}
      <div className={s.cardFooter}>
        <span className={s.cardCost}>{cost ?? ""}</span>
        <span className={s.cardLink} aria-hidden="true">
          상세보기
        </span>
      </div>
    </Link>
  );
}
