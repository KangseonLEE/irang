import type { Metadata } from "next";
import { cache } from "react";
import { optimizedShareImage, shareMetadata } from "@/lib/seo/share-metadata";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShareButton } from "@/components/ui/share-button";
import { KakaoShareButton } from "@/components/ui/kakao-share-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { ExternalLinkBlock } from "@/components/ui/external-link-block";
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-jsonld";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JsonLd } from "@/components/seo/json-ld";
import type { Event } from "schema-dts";
import { CalendarDays } from "lucide-react";
import { filterEventsAsync, getEventByIdAsync, EVENTS } from "@/lib/data/events";
import type { FarmEvent } from "@/lib/data/events";
import { getEventImage, posterCoverFactor } from "@/lib/events/event-image";
import { EVENT_POSTERS } from "@/lib/data/event-posters";
import {
  buildEventFacts,
  distinctEventTitle,
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
import { offerPrice } from "./offer-price";

/**
 * 같은 제목 회차를 가르려면 전체 행사가 필요하다 — generateMetadata 와 페이지가 한 요청에서 한 번만 읽게 (React cache).
 * 마감 회차도 쌍둥이로 센다(마감 상세도 색인돼 있다).
 */
const loadAllEvents = cache(async () => (await filterEventsAsync({ includeClosed: true })).events);

/** 상세 제목 — 같은 제목 회차가 있으면 " · 10월 13일" (10/6 QA Q2-X4, event-fields) */
async function detailTitle(event: FarmEvent): Promise<string> {
  try {
    return distinctEventTitle(event, await loadAllEvents());
  } catch {
    return event.title;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventByIdAsync(id);
  if (!event) notFound();

  const title = await detailTitle(event);
  // 수집 행 상투 설명("…집계 기준이에요")은 공유 문구에 싣지 않는다
  const summary = isBoilerplateDescription(event.description) ? "" : event.description.slice(0, 120);
  const description = `${event.region}에서 열리는 ${event.type} "${title}".${summary ? ` ${summary}` : ""}`;
  const poster = EVENT_POSTERS[event.id];
  const shareImage = poster
    ? { url: poster.url, width: poster.width, height: poster.height, alt: `${title} 홍보 이미지` }
    : event.imageUrl
      ? optimizedShareImage(event.imageUrl, event.title)
      : undefined;
  return {
    title: `${title} — ${event.type} | ${event.region}`,
    description,
    keywords: [`${event.region} 농촌 정착 체험`, `귀농 ${event.type}`, "귀농 행사", "농촌 체험"],
    alternates: { canonical: `/events/${id}` },
    // 행사 포스터·마을 사진이 있으면 공유 카드도 그 이미지로, 없으면 사이트 기본 OG 이미지.
    // 포스터는 원본 크기 그대로(공유용으로 만든 이미지가 많고 수백 KB), 마을 사진은 원본 7MB 라 1200px 최적화 경로.
    // 예전엔 openGraph 에 이미지만 넣어 제목·사이트명이 빠졌다(10/3 QA — 레이아웃 openGraph 는 통째로 대체된다)
    ...shareMetadata({
      title: `${title} | 이랑`,
      description,
      path: `/events/${id}`,
      ...(shareImage ? { image: shareImage } : {}),
    }),
  };
}

export function generateStaticParams() {
  return EVENTS.map((e) => ({ id: e.id }));
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

/** 히어로 이미지 sizes — 본문 폭(모바일 좌우 16 · 데스크탑 좌우 32 · 최대 1216) */
const HERO_SIZES = "(max-width: 1023px) calc(100vw - 32px), (max-width: 1343px) calc(100vw - 64px), 1216px";

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
  return {
    "@type": "Offer",
    url: event.url,
    availability,
    priceCurrency: "KRW",
    ...offerPrice(event.cost),
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
  const title = await detailTitle(event);
  const image = getEventImage(event);
  const facts = buildEventFacts(event, "detail");
  const stay = isStayEvent(event);
  const showDescription = !isBoilerplateDescription(event.description);
  const regionLink = regionHref(event);
  // 화면 브레드크럼·BreadcrumbJsonLd 공용 경로 — 목록 이름은 메뉴 SSOT(navigation.ts)·목록 JSON-LD 와 같은
  // "체험·행사" (10/3: 상세만 "체험행사"라 화면·구조화 데이터가 목록과 달랐다)
  const breadcrumbTrail = [
    { name: "체험·행사", href: "/events" },
    { name: title, href: `/events/${id}` },
  ];

  return (
    <div className={s.page}>
      <BreadcrumbJsonLd items={breadcrumbTrail} />
      <JsonLd<Event>
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: title,
          // 수집 안내 상투 문구("그린대로(농식품부) 집계 기준이에요…")는 화면처럼 구조화 데이터에도 싣지 않는다 (10/6 QA)
          description: showDescription ? event.description : `${regionLabel(event)}에서 열리는 ${event.type} "${title}"`,
          startDate: event.date,
          ...(event.dateEnd ? { endDate: event.dateEnd } : {}),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: {
            "@type": "Place",
            name: event.location,
            address: { "@type": "PostalAddress", addressRegion: event.region, addressCountry: "KR" },
          },
          // 포스터·마을 사진(외부 원본 절대 주소)이 있으면 그것, 없으면 사이트 기본 이미지 — 시·도 일러스트는 행사 이미지가 아니다
          image: [image.kind === "illustration" ? "https://irangfarm.com/opengraph-image" : image.src],
          organizer: { "@type": "Organization", name: event.organization, url: event.url },
          performer: { "@type": "Organization", name: event.organization },
          offers: buildOffer(event),
          inLanguage: "ko",
          mainEntityOfPage: `https://irangfarm.com/events/${id}`,
        }}
      />
      {/* ── 사진 히어로 — 배지(우상단) + 마을 유형 칩(좌하단) ── */}
      <figure className={s.heroFigure}>
        <div className={s.hero}>
        {/* 행사 포스터는 잘리지 않게(contain) — 남는 자리는 같은 이미지를 흐리게 깔아 채운다(카드와 같은 처리, 10/8).
            16:10 자르기를 확인한 넓은 배너(crop16x10)는 모바일 히어로(16:10)에서만 채운다 — 넓은 화면 히어로는 배너 비율에 가깝다.
            object-fit 은 화면 폭에 따라 바뀌므로 인라인 style 이 아니라 CSS 클래스로 정한다 */}
        {image.kind === "poster" && (
          <Image
            src={image.src}
            alt=""
            aria-hidden="true"
            fill
            sizes={HERO_SIZES}
            quality={72}
            priority
            className={s.heroBackdrop}
            style={{ objectFit: "cover" }}
          />
        )}
        <Image
          src={image.src}
          alt={image.alt}
          fill
          // 모바일 히어로(16:10)를 채우는 넓은 배너는 히어로보다 넓게 그려진다 — 그 폭에서만 배율만큼 큰 이미지(10/8)
          sizes={
            posterCoverFactor(image) > 1
              ? `(max-width: 767px) calc((100vw - 32px) * ${posterCoverFactor(image)}), ${HERO_SIZES}`
              : HERO_SIZES
          }
          quality={72}
          priority
          className={
            image.kind === "poster" ? `${s.heroPoster}${image.crop16x10 ? ` ${s.heroPosterCrop}` : ""}` : undefined
          }
          style={image.kind === "poster" ? undefined : { objectFit: "cover" }}
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
          <h1 className={s.pageTitle}>{title}</h1>
          <div className={s.titleActions}>
            <KakaoShareButton
              title={`${title} | 이랑`}
              description={showDescription ? event.description.slice(0, 100) : `${event.region} ${event.type}`}
              contentType="event"
            />
            <ShareButton
              title={`${title} | 이랑`}
              text={showDescription ? `${title}: ${event.description.slice(0, 80)}` : title}
              contentType="event"
              variant="ghost"
              size="sm"
              showLabel={false}
            />
          </div>
        </div>
      </div>

      {/* 브레드크럼 — 히어로(사진·제목) 아래 공통 위치 (2026-10-02 회장) */}
      <Breadcrumb className={s.breadcrumbBar} items={breadcrumbTrail} />

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
