"use client";

/**
 * StartCards — 카드 트랙 + 모바일 위치 점.
 * 카드는 전부 <Link>(SSR 링크 보존). 모바일(<768)은 CSS scroll-snap 캐러셀, 점은 scroll 위치로 동기화.
 * 데스크탑은 그리드라 점을 CSS 로 숨긴다. useSearchParams 미사용(Suspense 불필요).
 */

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SnapDots } from "@/components/ui/snap-dots";
import s from "./start-cards.module.css";

export interface StartCard {
  id: string;
  href: string;
  tag: string;
  title: string;
  desc: string;
  image: string;
  alt: string;
}

export function StartCards({ cards }: { cards: readonly StartCard[] }) {
  const trackRef = useRef<HTMLUListElement>(null);

  return (
    <>
      <ul ref={trackRef} className={s.track} aria-label="시작하기 좋은 세 가지">
        {cards.map((card) => (
          <li key={card.id} className={s.item} data-reveal-item>
            <Link
              href={card.href}
              className={s.card}
              data-track={`start_card:${card.id}`}
              prefetch={false}
            >
              {/* 아이템 내부 3단 등장 (9/29) — 일러스트(1) → 태그·제목(2) → 설명(3) */}
              <span className={s.art} aria-hidden="true" data-reveal-part="1">
                <Image
                  src={card.image}
                  alt=""
                  width={480}
                  height={360}
                  sizes="(min-width: 768px) 33vw, 84vw"
                  className={s.image}
                />
              </span>
              <span className={s.body}>
                <span className={s.tag} data-reveal-part="2">{card.tag}</span>
                <span className={s.title} data-reveal-part="2">{card.title}</span>
                <span className={s.desc} data-reveal-part="3">{card.desc}</span>
              </span>
              <span className={s.corner} aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
              <span className={s.srOnly}>{card.alt}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* 위치 점 — 공용 SnapDots (768+ 는 CSS 로 숨김) */}
      <SnapDots
        trackRef={trackRef}
        count={cards.length}
        itemLabel={(i) => `${cards[i].tag} 카드로`}
      />
    </>
  );
}
