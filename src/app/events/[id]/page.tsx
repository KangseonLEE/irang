import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark/bookmark-button";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { formatDateRange } from "@/lib/format";
import {
  ArrowLeft,
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
import { Icon } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { ReferenceNotice } from "@/components/ui/reference-notice";
import s from "./page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventByIdAsync(id);
  if (!event) return { title: "행사 상세" };

  return {
    title: `${event.title} — ${event.type} | ${event.region}`,
    description: `${event.region}에서 열리는 ${event.type} "${event.title}". ${event.description.slice(0, 120)}`,
    keywords: [`${event.region} 귀농 체험`, `귀농 ${event.type}`, "귀농 행사", "농촌 체험"],
    alternates: { canonical: `/events/${id}` },
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
      <BreadcrumbJsonLd items={[
        { name: "체험행사", href: "/events" },
        { name: event.title, href: `/events/${id}` },
      ]} />
      {/* Back link */}
      <Link href="/events" className={s.backLink}>
        <Icon icon={ArrowLeft} size="md" />
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
        <div className={s.titleRow}>
          <h1 className={s.pageTitle}>{event.title}</h1>
          <div className={s.titleActions}>
            <KakaoShareButton
              title={`${event.title} | 이랑`}
              description={`${event.description.slice(0, 100)}`}
              contentType="event"
            />
            <ShareButton
              title={`${event.title} | 이랑`}
              text={`${event.title}: ${event.description.slice(0, 80)}`}
              contentType="event"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
            <BookmarkButton
              id={event.id}
              type="event"
              title={event.title}
              subtitle={event.region}
            />
          </div>
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
                    icon={<Building2 size={16} strokeWidth={1.75} />}
                    label="주최 기관"
                    value={event.organization}
                  />
                  <InfoRow
                    icon={<MapPin size={16} strokeWidth={1.75} />}
                    label="지역"
                    value={event.region}
                  />
                  <InfoRow
                    icon={<MapPinned size={16} strokeWidth={1.75} />}
                    label="장소"
                    value={event.location}
                  />
                  <InfoRow
                    icon={<Calendar size={16} strokeWidth={1.75} />}
                    label="행사 일시"
                    value={formatDateRange(event.date, event.dateEnd)}
                  />
                  <InfoRow
                    icon={<Coins size={16} strokeWidth={1.75} />}
                    label="비용"
                    value={event.cost}
                  />
                  <InfoRow
                    icon={<Users size={16} strokeWidth={1.75} />}
                    label="정원"
                    value={
                      event.capacity !== null
                        ? `${event.capacity}명`
                        : "제한 없음"
                    }
                  />
                  {event.applicationStart && event.applicationEnd && (
                    <InfoRow
                      icon={<CalendarDays size={16} strokeWidth={1.75} />}
                      label="접수 기간"
                      value={formatDateRange(event.applicationStart, event.applicationEnd)}
                    />
                  )}
                  <InfoRow
                    icon={<Tag size={16} strokeWidth={1.75} />}
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

          {/* 접수 기간 미제공 안내 (데이터 없을 때만) */}
          {!event.applicationStart && (
            <div className={s.card}>
              <div className={s.cardContent} style={{ paddingTop: "24px" }}>
                <p className={s.missingInfoNotice}>
                  접수 기간 정보가 아직 제공되지 않습니다. 원문 페이지에서 확인해 주세요.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={s.sidebar}>
          {/* CTA */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>참가 신청</h2>
            </div>
            <div className={s.cardContent}>
              <ExternalLinkBlock
                href={event.url}
                label="신청 페이지 방문"
                title={event.title}
              />
            </div>
          </div>

          {/* Related Events */}
          {related.length > 0 && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h2 className={s.cardTitle}>
                  <Icon icon={CalendarDays} size="md" />
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

      <ReferenceNotice text="행사 정보는 주최 기관 공고를 참고한 자료예요. 참가 전 해당 기관에서 최신 일정을 확인하세요." />
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
