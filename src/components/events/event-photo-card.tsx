import Image from "next/image";
import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import { getEventImage } from "@/lib/events/event-image";
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
}

const DEFAULT_SIZES =
  "(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc((100vw - 48px) / 2), (max-width: 1279px) calc((100vw - 64px) / 3), 300px";

export function EventPhotoCard({ event, sizes = DEFAULT_SIZES, priority = false }: EventPhotoCardProps) {
  const image = getEventImage(event);
  const facts = buildEventFacts(event, "card");

  return (
    <article className={s.card}>
      <div className={s.media}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          quality={70}
          priority={priority}
          className={s.image}
          style={{ objectFit: "cover" }}
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
        <h3 className={s.title}>
          <Link href={`/events/${event.id}`} className={s.stretchLink}>
            {cardTitle(event)}
          </Link>
        </h3>

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
