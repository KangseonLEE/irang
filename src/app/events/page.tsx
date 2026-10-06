import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { formatDateRange } from "@/lib/format";
import {
  filterEventsAsync,
  getCurrentPeriod,
  sortEvents,
  EVENT_TYPES,
  EVENT_REGIONS,
  DEFAULT_EVENT_SORT,
  type EventFilters,
  type EventSortKey,
} from "@/lib/data/events";
import { EventSortControl } from "./event-sort-control";
import { loadSyncMeta, buildPeriodLabel, getDataYear } from "@/lib/data/loader";
import { FilterBar, FilterActions } from "@/components/filter/filter-bar";
import { IncludeClosedHint } from "@/components/filter/include-closed-hint";
import { FilterShell } from "@/components/filter/filter-shell";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGrid } from "@/components/ui/card-grid";
import { EventPhotoCard } from "@/components/events/event-photo-card";
import { meaningfulCost } from "@/components/events/event-fields";
import { getEventImage } from "@/lib/events/event-image";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { ListToolbar } from "@/components/ui/list-toolbar";
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
  title: "귀농 체험·행사 — 농촌 살아보기·팜스테이·박람회 일정",
  description:
    "농촌에서 살아보기, 일일체험, 팜스테이, 박람회·설명회 등 귀농·귀촌 행사 일정을 지역별로 찾아보세요. 참가 신청까지 한곳에서.",
  alternates: { canonical: "/events" },
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    region?: string;
    q?: string;
    period?: string;
    includeClosed?: string;
    view?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const includeClosed = params.includeClosed === "1";
  const viewMode: ViewMode = params.view === "table" ? "table" : "card";
  const period = params.period || undefined;
  const currentSort: EventSortKey =
    params.sort === "recent" ? "recent" : DEFAULT_EVENT_SORT;

  const filters: EventFilters = {
    region: params.region,
    type: params.type,
    query: params.q,
    period,
    includeClosed,
  };

  const [{ events: rawEvents }, lastSyncAt] = await Promise.all([
    filterEventsAsync(filters),
    loadSyncMeta("farm_events"),
  ]);
  const events = sortEvents(rawEvents, currentSort);

  // 테이블 페이지네이션
  const tablePage = Math.max(1, Number(params.page) || 1);
  const tableTotalPages = Math.ceil(events.length / TABLE_PAGE_SIZE);
  const tableRows = events.slice(
    (tablePage - 1) * TABLE_PAGE_SIZE,
    tablePage * TABLE_PAGE_SIZE,
  );

  // 기준일 표시 텍스트 (sync 시각 기반 자동 생성, 폴백: 현재 연월)
  const periodLabel = buildPeriodLabel(lastSyncAt, period || getCurrentPeriod());
  const dataYear = getDataYear(lastSyncAt);

  // 현재 필터 상태 (pill URL 빌드용)
  const currentParams: Record<string, string | undefined> = {
    type: params.type,
    region: params.region,
    q: params.q,
    period: params.period,
    includeClosed: params.includeClosed,
    view: params.view,
    page: params.page,
    sort: currentSort === DEFAULT_EVENT_SORT ? undefined : currentSort,
  };

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "체험·행사", href: "/events" }]} />
      {/* 섹션 내비게이션 — .page 바깥에서 full-width sticky */}
      <Suspense>
        <SectionNav items={sectionNavItems} />
      </Suspense>

    <div className={s.page}>
      {/* ── Page Header ── */}
      <PageHeader
        icon={<Calendar size={20} strokeWidth={1.75} />}
        label="Events"
        title="체험·행사"
        description="농촌에서 살아보기, 일일체험, 박람회, 설명회를 한곳에서 찾아보세요. 사진과 신청 기간을 보고 고르세요."
        periodLabel={periodLabel}
        dataNote={`${dataYear}년 데이터만 있어요. 연도는 바꿀 수 없어요.`}
      />

      {/* ── Filter Bar — 데스크탑(>= 640) FilterBar + 모바일(< 640) BottomSheet ── */}
      <FilterShell
        basePath="/events"
        currentFilters={currentParams}
        params={[
          {
            paramKey: "type",
            label: "유형",
            options: EVENT_TYPES,
            currentValue: params.type,
          },
          {
            paramKey: "region",
            label: "지역",
            options: EVENT_REGIONS,
            currentValue: params.region,
          },
        ]}
        mobileActions={
          <FilterBar>
            <FilterActions
              basePath="/events"
              currentFilters={currentParams}
              searchPlaceholder="행사명, 지역, 기관으로 검색..."
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
        resultCount={events.length}
        includeClosed={includeClosed}
        basePath="/events"
        currentFilters={currentParams}
        itemLabel="행사"
      />

      {/* 보기 모드 토글 + 정렬 */}
      <ListToolbar count={events.length}>
        <EventSortControl
          currentSort={currentSort}
          currentFilters={currentParams}
          basePath="/events"
        />
        <Suspense>
          <ViewToggle current={viewMode} />
        </Suspense>
      </ListToolbar>

      {/* ── Card Grid / Table / Empty ── */}
      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={32} strokeWidth={1.75} />}
          message={<>조건에 맞는 체험·행사가 없어요.<br />필터를 변경하거나 마감 행사를 포함해 보세요.</>}
          linkHref="/events"
          linkText="전체 행사 보기"
        />
      ) : viewMode === "table" ? (
        <>
          <div className={dt.wrap}>
            <table className={dt.table}>
              <thead>
                <tr>
                  <th>상태</th>
                  <th>행사명</th>
                  <th>지역</th>
                  <th>유형</th>
                  <th>일정</th>
                  <th className={dt.hideOnMobile}>비용</th>
                  <th className={dt.hideOnMobile}>주관</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((ev) => (
                  <tr key={ev.id} className={dt.clickableRow}>
                    <td><StatusBadge status={ev.status} /></td>
                    <td className={dt.titleCell}>
                      <Link href={`/events/${ev.id}`} className={`${dt.titleLink} ${dt.rowLink}`}>
                        {ev.title}
                      </Link>
                    </td>
                    <td className={dt.muted}>{ev.region}</td>
                    <td className={dt.muted}>{ev.type}</td>
                    <td className={dt.muted}>{formatDateRange(ev.date, ev.dateEnd)}</td>
                    <td className={`${dt.amount} ${dt.hideOnMobile}`}>{meaningfulCost(ev.cost) ?? "—"}</td>
                    <td className={`${dt.muted} ${dt.hideOnMobile}`}>{ev.organization}</td>
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
          <CardGrid className={s.photoGrid}>
            {events.map((event, i) => (
              <div
                key={event.id}
                className={s.cardAnim}
                style={{ animationDelay: `${Math.min(i, 5) * 30}ms` }}
              >
                {/* 카드 제목 h2 — 이 목록은 h1(페이지 제목) 바로 아래 (10/4 axe heading-order) */}
                <EventPhotoCard event={event} priority={i < 4} headingLevel={2} />
              </div>
            ))}
          </CardGrid>
          {events.some((event) => getEventImage(event).isPhoto) && (
            <p className={s.photoCredit}>
              마을 사진은 그린대로(농림축산식품부) 공고에서 가져왔어요. 사진이 없는 곳은 시·도 그림으로 대신해요.
            </p>
          )}
        </div>
      )}
    </div>
    </>
  );
}
