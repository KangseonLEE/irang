"use client";

/**
 * StartCards — 카드 트랙 + 모바일 위치 점.
 * 카드는 전부 <Link>(SSR 링크 보존). 모바일(<768)은 CSS scroll-snap 캐러셀, 점은 scroll 위치로 동기화.
 * 데스크탑은 그리드라 점을 CSS 로 숨긴다. useSearchParams 미사용(Suspense 불필요).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
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
  const [active, setActive] = useState(0);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    const first = el.children[0] as HTMLElement;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    setActive(Math.min(Math.round(el.scrollLeft / step), cards.length - 1));
  }, [cards.length]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    return () => el.removeEventListener("scroll", sync);
  }, [sync]);

  const jump = (i: number) => {
    const el = trackRef.current;
    if (!el || !el.children.length) return;
    const first = el.children[0] as HTMLElement;
    const step = first.offsetWidth + parseFloat(getComputedStyle(el).columnGap || "0");
    el.scrollTo({ left: i * step, behavior: "smooth" });
  };

  return (
    <>
      <ul ref={trackRef} className={s.track} aria-label="시작하기 좋은 세 가지">
        {cards.map((card) => (
          <li key={card.id} className={s.item}>
            <Link
              href={card.href}
              className={s.card}
              data-track={`start_card:${card.id}`}
              prefetch={false}
            >
              <span className={s.art} aria-hidden="true">
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
                <span className={s.tag}>{card.tag}</span>
                <span className={s.title}>{card.title}</span>
                <span className={s.desc}>{card.desc}</span>
              </span>
              <span className={s.corner} aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
              <span className={s.srOnly}>{card.alt}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={s.dots} role="tablist" aria-label="카드 위치">
        {cards.map((card, i) => (
          <button
            key={card.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`${card.tag} 카드로`}
            className={`${s.dot} ${i === active ? s.dotActive : ""}`}
            onClick={() => jump(i)}
          />
        ))}
      </div>
    </>
  );
}
