import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { JsonLd } from "@/components/seo/json-ld";
import type { Event } from "schema-dts";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { getEventByIdAsync, EVENTS } from "@/lib/data/events";
import type { FarmEvent } from "@/lib/data/events";
import { getEventImage } from "@/lib/events/event-image";
import {
  buildEventFacts,
  eventTypeChip,
  isBoilerplateDescription,
  isStayEvent,
  regionLabel,
  regionHref,
} from "@/components/events/event-fields";
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
  if (!event) notFound();

  return {
    title: `${event.title} — ${event.type} | ${event.region}`,
    description: `${event.region}에서 열리는 ${event.type} "${event.title}". ${event.description.slice(0, 120)}`,
    keywords: [`${event.region} 농촌 정착 체험`, `귀농 ${event.type}`, "귀농 행사", "농촌 체험"],
    alternates: { canonical: `/events/${id}` },
    // 마을 사진이 있으면 공유 카드도 그 사진으로 (없으면 기본 OG 이미지 라우트)
    ...(event.imageUrl ? { openGraph: { images: [event.imageUrl] } } : {}),
  };
}

export function generateStaticParams() {
  return EVENTS.map((e) => ({ id: e.id }));
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

/** 살아보기 한 줄 안내 — 유형 이름만으로는 무엇을 하는 프로그램인지 알 수 없다 */
const STAY_INTRO =
  "‘농촌에서 살아보기’는 귀농·귀촌을 결정하기 전에 마을에 일정 기간 머물며 생활과 일을 겪어 보는 프로그램이에요. 숙소와 체험 프로그램이 함께 제공되고, 지원 조건은 마을마다 달라요.";

// GSC 이벤트 구조화 데이터 권장 필드(offers) — cost·status에서 가격·재고 상태 매핑
function buildOffer(event: FarmEvent): Event["offers"] {
  const availability =
    event.status === "마감"
      ? "https://schema.org/SoldOut"
      : event.status === "접수예정"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock";
  const isFree = event.cost.includes("무료");
  return {
    "@type": "Offer",
    url: event.url,
    availability,
    priceCurrency: "KRW",
    ...(isFree ? { price: "0" } : {}),
    ...(event.applicationStart ? { validFrom: event.applicationStart } : {}),
  };
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
  const image = getEventImage(event);
  const facts = buildEventFacts(event, "detail");
  const stay = isStayEvent(event);
  const showDescription = !isBoilerplateDescription(event.description);
  const regionLink = regionHref(event);

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={[
        { name: "체험행사", href: "/events" },
        { name: event.title, href: `/events/${id}` },
      ]} />
      <JsonLd<Event>
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: event.title,
          description: event.description,
          startDate: event.date,
          ...(event.dateEnd ? { endDate: event.dateEnd } : {}),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: event.location,
            address: { "@type": "PostalAddress", addressRegion: event.region, addressCountry: "KR" },
          },
          image: [event.imageUrl ?? "https://irangfarm.com/opengraph-image"],
          organizer: { "@type": "Organization", name: event.organization, url: event.url },
          performer: { "@type": "Organization", name: event.organization },
          offers: buildOffer(event),
          inLanguage: "ko",
          mainEntityOfPage: `https://irangfarm.com/events/${id}`,
        }}
      />
      {/* Back link */}
      <Link href="/events" className={s.backLink}>
        <Icon icon={ArrowLeft} size="md" />
        행사 목록으로
      </Link>

      {/* ── 사진 히어로 — 배지(우상단) + 마을 유형 칩(좌하단) ── */}
      <figure className={s.heroFigure}>
        <div className={s.hero}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1343px) calc(100vw - 64px), 1216px"
          quality={72}
          priority
          style={{ objectFit: "cover" }}
        />
        <div className={s.heroBadges}>
          <StatusBadge status={event.status} />
          <DeadlineBadge
            applicationEnd={event.applicationEnd}
            applicationStart={event.applicationStart}
            status={event.status}
          />
        </div>
        <span className={s.heroChip}>{eventTypeChip(event)}</span>
        </div>
        {image.credit && <figcaption className={s.heroCredit}>{image.credit}</figcaption>}
      </figure>

      {/* Title */}
      <div className={s.titleSection}>
        <p className={s.regionLine}>
          {regionLink ? (
            <Link href={regionLink} className={s.regionLink}>
              {regionLabel(event)}
            </Link>
          ) : (
            regionLabel(event)
          )}
        </p>
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
          </div>
        </div>
      </div>

      <div className={s.contentGrid}>
        {/* Main content */}
        <div className={s.mainContent}>
          {/* 살아보기가 뭔지 먼저 한 줄 */}
          {stay && <p className={s.intro}>{STAY_INTRO}</p>}

          {/* 사실 그리드 — 데스크탑 2열 / 모바일 1열 */}
          <div className={s.card}>
            <div className={s.cardHeader}>
              <h2 className={s.cardTitle}>기본 정보</h2>
            </div>
            <div className={s.cardContent}>
              <dl className={s.factGrid}>
                {facts.map((fact) => (
                  <div key={fact.label} className={s.fact}>
                    <dt className={s.factLabel}>{fact.label}</dt>
                    <dd className={s.factValue}>
                      {fact.href ? (
                        <Link href={fact.href} className={s.factLink}>
                          {fact.value}
                        </Link>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Description — 수집 안내 상투 문구면 생략(아래 원문 링크·참고 안내가 같은 말을 한다) */}
          {showDescription && (
            <div className={s.card}>
              <div className={s.cardHeader}>
                <h2 className={s.cardTitle}>행사 내용</h2>
              </div>
              <div className={s.cardContent}>
                <p className={s.descriptionText}><AutoGlossary text={event.description} /></p>
              </div>
            </div>
          )}

          {/* 접수 기간 미제공 안내 (데이터 없을 때만) */}
          {!event.applicationStart && (
            <div className={s.card}>
              <div className={`${s.cardContent} ${s.cardContentSpacedTop}`}>
                <p className={s.missingInfoNotice}>
                  접수 기간은 아직 공개되지 않았어요. 원문 페이지에서 확인해 보세요.
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
                label="신청 페이지 보러가기"
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
                          {regionLabel(r)} · {eventTypeChip(r)}
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
