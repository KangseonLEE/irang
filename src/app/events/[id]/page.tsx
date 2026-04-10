import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Building2,
  Calendar,
  Coins,
  Users,
  MapPinned,
  Tag,
  CalendarDays,
} from "lucide-react";
import { getEventByIdAsync, EVENTS } from "@/lib/data/events";
import type { FarmEvent } from "@/lib/data/events";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import s from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventByIdAsync(id);
  return {
    title: event ? event.title : "행사 상세",
    description: event?.description.slice(0, 160),
  };
}

export function generateStaticParams() {
  return EVENTS.map((e) => ({ id: e.id }));
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

const TYPE_CLASS: Record<FarmEvent["type"], string> = {
  일일체험: s.typeExperience,
  팜스테이: s.typeFarmstay,
  박람회: s.typeExpo,
  설명회: s.typeSeminar,
  멘토링: s.typeMentoring,
  축제: s.typeFestival,
};

function formatEventDate(date: string, dateEnd: string | null): string {
  if (!dateEnd) return date;
  return `${date} ~ ${dateEnd}`;
}

function getRelatedEvents(
  current: FarmEvent,
  limit: number = 3
): FarmEvent[] {
  return EVENTS.filter(
    (e) =>
      e.id !== current.id &&
      (e.region === current.region || e.type === current.type)
  ).slice(0, limit);
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { id } = await params;
  const event = await getEventByIdAsync(id);

  if (!event) {
    notFound();
  }

  const related = getRelatedEvents(event);

  return (
    <div className={s.page}>
      {/* Back link */}
      <Link href="/events" className={s.backLink}>
        <ArrowLeft size={16} />
        행사 목록으로
      </Link>

      {/* Title + Badges */}
      <div className={s.titleSection}>
        <div className={s.badgeRow}>
          <StatusBadge status={event.status} />
          <span className={`${s.typeBadge} ${TYPE_CLASS[event.type]}`}>
            {event.type}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
          <h1 className={s.pageTitle} style={{ flex: 1 }}>{event.title}</h1>
          <BookmarkButton
            id={event.id}
            type="event"
            title={event.title}
            subtitle={event.region}
          />
        </div>
      </div>

      <div className={s.contentGrid}>
        {/* Main content */}
        <div className={s.mainContent}>
          {/* Basic Info */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>기본 정보</h2>
            </div>
            <div className={s.cardContent}>
              <table className={s.table}>
                <tbody>
                  <InfoRow
                    icon={<Building2 size={16} />}
                    label="주최 기관"
                    value={event.organization}
                  />
                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="지역"
                    value={event.region}
                  />
                  <InfoRow
                    icon={<MapPinned size={16} />}
                    label="장소"
                    value={event.location}
                  />
                  <InfoRow
                    icon={<Calendar size={16} />}
                    label="행사 일시"
                    value={formatEventDate(event.date, event.dateEnd)}
                  />
                  <InfoRow
                    icon={<Coins size={16} />}
                    label="비용"
                    value={event.cost}
                  />
                  <InfoRow
                    icon={<Users size={16} />}
                    label="정원"
                    value={
                      event.capacity !== null
                        ? `${event.capacity}명`
                        : "제한 없음"
                    }
                  />
                  <InfoRow
                    icon={<Tag size={16} />}
                    label="대상"
                    value={event.target}
                  />
                </tbody>
              </table>
            </div>
          </div>

          {/* Description */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>행사 내용</h2>
            </div>
            <div className={s.cardContent}>
              <p className={s.descriptionText}><AutoGlossary text={event.description} /></p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          {/* CTA */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>참가 신청</h2>
            </div>
            <div className={s.cardContent}>
              <a
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className={s.ctaButton}
              >
                <ExternalLink size={16} />
                신청 페이지 방문
              </a>
              <p className={s.ctaNote}>
                상세 내용과 신청 방법은 원문 페이지에서 확인하세요.
              </p>
            </div>
          </div>

          {/* Related Events */}
          {related.length > 0 && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h2 className={s.cardTitle}>
                  <CalendarDays size={16} />
                  관련 행사
                </h2>
              </div>
              <div className={s.cardContent}>
                <ul className={s.relatedList}>
                  {related.map((r) => (
                    <li key={r.id} className={s.relatedItem}>
                      <Link href={`/events/${r.id}`} className={s.relatedLink}>
                        <span className={s.relatedTitle}>{r.title}</span>
                        <span className={s.relatedMeta}>
                          {r.region} · {r.type}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <tr className={s.tableRow}>
      <td className={s.tableLabelCell}>
        <span className={s.iconLabel}>
          <span className={s.iconMuted}>{icon}</span>
          {label}
        </span>
      </td>
      <td className={s.tableValueCell}>{value}</td>
    </tr>
  );
}
