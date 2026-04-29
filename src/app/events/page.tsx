import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Tag,
} from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { formatDateRange } from "@/lib/format";
import {
  filterEventsAsync,
  getCurrentPeriod,
  EVENT_TYPES,
  EVENT_REGIONS,
  type FarmEvent,
  type EventFilters,
} from "@/lib/data/events";
import { loadSyncMeta, buildPeriodLabel, getDataYear } from "@/lib/data/loader";
import {
  FilterBar,
  FilterRow,
  FilterGroup,
  FilterDivider,
  FilterActions,
} from "@/components/filter/filter-bar";
import { IncludeClosedHint } from "@/components/filter/include-closed-hint";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { PageHeader } from "@/components/ui/page-header";
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
  title: "귀농 체험·행사 — 일일체험·팜스테이·박람회 일정",
  description:
    "귀농 일일체험, 팜스테이, 박람회, 설명회 등 귀농 관련 행사 일정을 지역별로 찾아보세요. 참가 신청까지 한곳에서.",
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
  }>;
}

/** 행사 유형별 배지 색상 클래스 */
function getTypeBadgeClass(type: FarmEvent["type"]): string {
  switch (type) {
    case "일일체험":
    case "팜스테이":
      return s.typeBadgeGreen;
    case "박람회":
    case "축제":
      return s.typeBadgeAmber;
    case "설명회":
    case "멘토링":
      return s.typeBadgeBlue;
    default:
      return s.typeBadgeGreen;
  }
}

/* StatusBadge is now a shared component from @/components/ui/status-badge */

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const includeClosed = params.includeClosed === "1";
  const viewMode: ViewMode = params.view === "table" ? "table" : "card";
  const period = params.period || undefined;

  const filters: EventFilters = {
    region: params.region,
    type: params.type,
    query: params.q,
    period,
    includeClosed,
  };

  const [{ events }, lastSyncAt] = await Promise.all([
    filterEventsAsync(filters),
    loadSyncMeta("farm_events"),
  ]);

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
        description="귀농 일일체험, 팜스테이, 박람회, 설명회 등 다양한 체험과 행사를 찾아보세요."
        periodLabel={periodLabel}
        dataNote={`${dataYear}년 데이터만 제공되며, 연도 변경은 지원되지 않습니다.`}
      />

      {/* ── Filter Bar ── */}
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
        <FilterDivider />
        <FilterRow>
          <FilterGroup
            label="유형"
            paramKey="type"
            options={EVENT_TYPES}
            currentValue={params.type}
            currentFilters={currentParams}
            basePath="/events"
          />
        </FilterRow>
        <FilterRow>
          <FilterGroup
            label="지역"
            paramKey="region"
            options={EVENT_REGIONS}
            currentValue={params.region}
            currentFilters={currentParams}
            basePath="/events"
          />
        </FilterRow>
      </FilterBar>

      <IncludeClosedHint
        resultCount={events.length}
        includeClosed={includeClosed}
        basePath="/events"
        currentFilters={currentParams}
        itemLabel="행사"
      />

      {/* 보기 모드 토글 */}
      <div className={s.toolbar}>
        <p className={s.resultText}>
          검색 결과 <span className={s.resultTotal}>{events.length}</span>건
        </p>
        <Suspense>
          <ViewToggle current={viewMode} />
        </Suspense>
      </div>

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
                    <td className={`${dt.amount} ${dt.hideOnMobile}`}>{ev.cost}</td>
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
        <CardGrid>
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </CardGrid>
      )}
    </div>
    </>
  );
}

// --- 서브 컴포넌트 ---

function EventCard({ event }: { event: FarmEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className={s.card}
    >
      {/* Header: badges */}
      <div className={s.cardHeader}>
        <div className={s.cardBadges}>
          <span className={`${s.typeBadge} ${getTypeBadgeClass(event.type)}`}>
            <Icon icon={Tag} size="xs" />
            {event.type}
          </span>
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Body */}
      <div className={s.cardBody}>
        <h3 className={s.cardTitle}>{event.title}</h3>

        <div className={s.cardMeta}>
          <div className={s.cardMetaRow}>
            <Icon icon={Clock} size="sm" className={s.cardMetaIcon} />
            <span className={s.cardMetaValue}>
              {formatDateRange(event.date, event.dateEnd)}
            </span>
          </div>
          <div className={s.cardMetaRow}>
            <Icon icon={MapPin} size="sm" className={s.cardMetaIcon} />
            <span className={s.cardMetaValue}>{event.location}</span>
          </div>
          <div className={s.cardMetaRow}>
            <Icon icon={Calendar} size="sm" className={s.cardMetaIcon} />
            <span className={s.cardMetaValue}>{event.organization}</span>
          </div>
          {event.capacity && (
            <div className={s.cardMetaRow}>
              <Icon icon={Users} size="sm" className={s.cardMetaIcon} />
              <span className={s.cardMetaValue}>
                정원 {event.capacity}명 | {event.target}
              </span>
            </div>
          )}
        </div>

        <p className={s.cardDesc}><AutoGlossary text={event.description} /></p>
      </div>

      {/* Footer */}
      <div className={s.cardFooter}>
        <span className={s.cardCost}>{event.cost}</span>
        <span className={s.cardLink} aria-hidden="true">
          상세보기
        </span>
      </div>
    </Link>
  );
}
