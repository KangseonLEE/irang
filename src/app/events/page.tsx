import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  MapPin,
  Clock,
  Users,
  ExternalLink,
  Tag,
  Search,
} from "lucide-react";
import {
  filterEvents,
  getCurrentPeriod,
  EVENT_TYPES,
  EVENT_REGIONS,
  type FarmEvent,
  type EventFilters,
} from "@/lib/data/events";
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

/** 접수 상태 배지 클래스 */
function getStatusBadgeClass(status: FarmEvent["status"]): string {
  switch (status) {
    case "접수중":
      return s.statusOpen;
    case "접수예정":
      return s.statusUpcoming;
    case "마감":
      return s.statusClosed;
    default:
      return s.statusClosed;
  }
}

/** 필터 pill 링크용 URL 빌더 */
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
  return `/events${qs ? `?${qs}` : ""}`;
}

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
      <div className={s.pageHeader}>
        <div className={s.headerTop}>
          <Calendar size={20} />
          <span className={s.headerLabel}>Events</span>
        </div>
        <h1 className={s.headerTitle}>체험·행사</h1>
        <p className={s.headerDesc}>
          귀농 일일체험, 팜스테이, 박람회, 설명회 등 다양한 체험과 행사를
          찾아보세요.
        </p>
        <div className={s.headerMeta}>
          <p className={s.headerCount}>
            총 <span className={s.headerCountNumber}>{events.length}</span>건
          </p>
          <span className={s.headerPeriod}>
            <CalendarDays size={14} />
            {periodLabel} 기준
          </span>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className={s.filterBar}>
        {/* 행사 유형 */}
        <div className={s.filterRow}>
          <span className={s.filterLabel}>유형</span>
          <Link
            href={buildFilterUrl(currentParams, "type", undefined)}
            className={`${s.pill}${!params.type ? ` ${s.pillActive}` : ""}`}
          >
            전체
          </Link>
          {EVENT_TYPES.map((t) => (
            <Link
              key={t}
              href={buildFilterUrl(currentParams, "type", t)}
              className={`${s.pill}${params.type === t ? ` ${s.pillActive}` : ""}`}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* 지역 */}
        <div className={s.filterRow}>
          <span className={s.filterLabel}>지역</span>
          <Link
            href={buildFilterUrl(currentParams, "region", undefined)}
            className={`${s.pill}${!params.region ? ` ${s.pillActive}` : ""}`}
          >
            전체
          </Link>
          {EVENT_REGIONS.map((r) => (
            <Link
              key={r}
              href={buildFilterUrl(currentParams, "region", r)}
              className={`${s.pill}${params.region === r ? ` ${s.pillActive}` : ""}`}
            >
              {r}
            </Link>
          ))}
        </div>

        {/* 검색 + 마감 포함 */}
        <div className={s.searchRow}>
          <div className={s.searchInputWrap}>
            <Search size={15} className={s.searchIcon} />
            {/*
              서버 컴포넌트에서는 form submit으로 q를 전달합니다.
              JS 없이도 동작하는 progressive enhancement 패턴.
            */}
            <form action="/events" method="get">
              {/* 현재 필터 값 유지 */}
              {params.type && (
                <input type="hidden" name="type" value={params.type} />
              )}
              {params.region && (
                <input type="hidden" name="region" value={params.region} />
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
              <input
                type="text"
                name="q"
                placeholder="행사명, 지역, 기관으로 검색"
                defaultValue={params.q ?? ""}
                className={s.searchInput}
              />
            </form>
          </div>
          <label className={s.checkboxLabel}>
            <input
              type="checkbox"
              className={s.checkbox}
              checked={includeClosed}
              readOnly
            />
            <Link
              href={buildFilterUrl(
                currentParams,
                "includeClosed",
                includeClosed ? undefined : "1",
              )}
            >
              마감 포함
            </Link>
          </label>
        </div>
      </div>

      {/* ── Card Grid ── */}
      <div className={s.grid}>
        {events.length === 0 ? (
          <div className={s.emptyState}>
            <Calendar size={32} className={s.emptyStateIcon} />
            <p className={s.emptyStateText}>
              조건에 맞는 체험·행사가 없습니다.
              <br />
              필터를 변경하거나 마감 행사를 포함해 보세요.
            </p>
            <Link href="/events" className={s.emptyStateLink}>
              전체 행사 보기
            </Link>
          </div>
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
    <article className={s.card}>
      {/* Header: badges */}
      <div className={s.cardHeader}>
        <div className={s.cardBadges}>
          <span className={`${s.typeBadge} ${getTypeBadgeClass(event.type)}`}>
            <Tag size={10} />
            {event.type}
          </span>
          <span
            className={`${s.statusBadge} ${getStatusBadgeClass(event.status)}`}
          >
            {event.status}
          </span>
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
        <a
          href={event.url}
          target="_blank"
          rel="noopener noreferrer"
          className={s.cardLink}
        >
          자세히 보기
          <ExternalLink size={12} />
        </a>
      </div>
    </article>
  );
}
