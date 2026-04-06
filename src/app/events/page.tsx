import type { Metadata } from "next";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Tag,
} from "lucide-react";
import {
  filterEvents,
  getCurrentPeriod,
  EVENT_TYPES,
  EVENT_REGIONS,
  type FarmEvent,
  type EventFilters,
} from "@/lib/data/events";
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
  title: "체험·행사",
  description:
    "귀농 일일체험, 팜스테이, 박람회, 설명회 등 다양한 귀농 관련 행사를 찾아보세요.",
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    region?: string;
    q?: string;
    period?: string;
    includeClosed?: string;
  }>;
}

/** 날짜 포맷: "2026-05-15" → "2026. 5. 15 (금)" */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = dayNames[d.getDay()];
  return `${y}. ${m}. ${day} (${dow})`;
}

/** 행사 기간 표시 */
function formatEventPeriod(date: string, dateEnd: string | null): string {
  if (!dateEnd) {
    return formatDate(date);
  }
  // 같은 월이면 간략 표시
  const start = new Date(date + "T00:00:00");
  const end = new Date(dateEnd + "T00:00:00");
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    return `${start.getFullYear()}. ${start.getMonth() + 1}. ${start.getDate()} ~ ${end.getDate()} (${dayNames[end.getDay()]})`;
  }
  return `${formatDate(date)} ~ ${formatDate(dateEnd)}`;
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
  const period = params.period || getCurrentPeriod();

  const filters: EventFilters = {
    region: params.region,
    type: params.type,
    query: params.q,
    period,
    includeClosed,
  };

  const events = filterEvents(filters);

  // 기준일 표시 텍스트
  const [pYear, pMonth] = period.split("-");
  const periodLabel = `${pYear}년 ${parseInt(pMonth)}월`;

  // 현재 필터 상태 (pill URL 빌드용)
  const currentParams: Record<string, string | undefined> = {
    type: params.type,
    region: params.region,
    q: params.q,
    period: params.period,
    includeClosed: params.includeClosed,
  };

  return (
    <div className={s.page}>
      {/* ── Page Header ── */}
      <PageHeader
        icon={<Calendar size={20} />}
        label="Events"
        title="체험·행사"
        description="귀농 일일체험, 팜스테이, 박람회, 설명회 등 다양한 체험과 행사를 찾아보세요."
        count={events.length}
        periodLabel={periodLabel}
      />

      {/* ── Filter Bar ── */}
      <FilterBar>
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
        <FilterDivider />
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

      {/* ── Card Grid ── */}
      <div className={s.grid}>
        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar size={32} />}
            message={<>조건에 맞는 체험·행사가 없습니다.<br />필터를 변경하거나 마감 행사를 포함해 보세요.</>}
            linkHref="/events"
            linkText="전체 행사 보기"
          />
        ) : (
          events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}

// --- 서브 컴포넌트 ---

function EventCard({ event }: { event: FarmEvent }) {
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      className={s.card}
    >
      {/* Header: badges */}
      <div className={s.cardHeader}>
        <div className={s.cardBadges}>
          <span className={`${s.typeBadge} ${getTypeBadgeClass(event.type)}`}>
            <Tag size={10} />
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
            <Clock size={14} className={s.cardMetaIcon} />
            <span className={s.cardMetaValue}>
              {formatEventPeriod(event.date, event.dateEnd)}
            </span>
          </div>
          <div className={s.cardMetaRow}>
            <MapPin size={14} className={s.cardMetaIcon} />
            <span className={s.cardMetaValue}>{event.location}</span>
          </div>
          <div className={s.cardMetaRow}>
            <Calendar size={14} className={s.cardMetaIcon} />
            <span className={s.cardMetaValue}>{event.organization}</span>
          </div>
          {event.capacity && (
            <div className={s.cardMetaRow}>
              <Users size={14} className={s.cardMetaIcon} />
              <span className={s.cardMetaValue}>
                정원 {event.capacity}명 | {event.target}
              </span>
            </div>
          )}
        </div>

        <p className={s.cardDesc}>{event.description}</p>
      </div>

      {/* Footer */}
      <div className={s.cardFooter}>
        <span className={s.cardCost}>{event.cost}</span>
        <span className={s.cardLink} aria-hidden="true">
          자세히 보기
          <ExternalLink size={12} />
        </span>
      </div>
    </a>
  );
}
