import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { posterCoverFactor, scaleSizes, getEventImage } from "@/lib/events/event-image";
import type { FarmEvent } from "@/lib/data/events";

import { buildEventFacts, cardTitle, eventTypeChip, regionLabel } from "./event-fields";
import s from "./event-photo-card.module.css";

/* ==========================================================================
   EventPhotoCard — 체험·살아보기 사진 카드 (2026-09-30)

   상단 가로 사진(상태·마감 배지 우상단 / 마을 유형 칩 좌하단) + 하단 지역·제목·사실 행.
   카드 껍데기는 <article> 이고 제목 <a> 가 ::after 로 카드를 덮는다(9/26 검색 카드와 같은 패턴)
   — 나중에 카드 안에 보조 링크를 넣어도 클릭 타깃이 겹치지 않는다.
   ========================================================================== */

interface EventPhotoCardProps {
  event: FarmEvent;
  /** 그리드 폭에 맞춘 next/image sizes (기본은 /events 4열 그리드 기준) */
  sizes?: string;
  /** 사진 우선 로딩 (첫 화면 카드 몇 장) */
  priority?: boolean;
  /**
   * 카드 제목 단계 (10/4 axe heading-order). 기본 3 = 섹션 h2 아래에 놓이는 자리(/start 기회 탭).
   * /events 목록처럼 h1 바로 아래면 2 를 넘긴다 — .title 이 margin·크기·굵기를 정해 두어 화면은 같다.
   */
  headingLevel?: 2 | 3;
}

const DEFAULT_SIZES =
  "(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 48px) / 2), (max-width: 1279px) calc((100vw - 64px) / 3), 300px";

export function EventPhotoCard({
  event,
  sizes = DEFAULT_SIZES,
  priority = false,
  headingLevel = 3,
}: EventPhotoCardProps) {
  const image = getEventImage(event);
  // 포스터는 잘리지 않게(contain) 놓고 흐린 배경을 깐다 — 16:10 자르기를 확인한 넓은 배너만 사진처럼 채운다(cover)
  const letterbox = image.kind === "poster" && !image.crop16x10;
  const facts = buildEventFacts(event, "card");
  const Title = headingLevel === 2 ? "h2" : "h3";

  return (
    <article className={s.card}>
      <div className={s.media}>
        {/* 남는 자리는 같은 이미지를 흐리게 깔아 채운다(같은 src·sizes·quality 라 한 번만 받는다) */}
        {letterbox && (
          <Image
            src={image.src}
            alt=""
            aria-hidden="true"
            fill
            sizes={sizes}
            quality={70}
            priority={priority}
            className={s.backdrop}
            style={{ objectFit: "cover" }}
          />
        )}
        <Image
          src={image.src}
          alt={image.alt}
          fill
          // 16:10 을 채우는 넓은 배너는 카드보다 넓게 그려진다 — 그 배율만큼 큰 이미지를 받는다(흐려짐 방지, 10/8)
          sizes={scaleSizes(sizes, posterCoverFactor(image))}
          quality={70}
          priority={priority}
          className={image.kind === "poster" ? s.poster : s.image}
          style={{ objectFit: letterbox ? "contain" : "cover" }}
        />
        <div className={s.badges}>
          <StatusBadge status={event.status} />
          <DeadlineBadge
            applicationEnd={event.applicationEnd}
            applicationStart={event.applicationStart}
            status={event.status}
          />
        </div>
        <span className={s.chip}>{eventTypeChip(event)}</span>
      </div>

      <div className={s.body}>
        <p className={s.region}>{regionLabel(event)}</p>
        <Title className={s.title}>
          <Link href={`/events/${event.id}`} className={s.stretchLink}>
            {cardTitle(event)}
          </Link>
        </Title>

        {facts.length > 0 && (
          <dl className={s.facts}>
            {facts.map((fact) => (
              <div key={fact.label} className={s.fact}>
                <dt className={s.factLabel}>{fact.label}</dt>
                <dd className={s.factValue}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
}
