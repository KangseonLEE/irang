"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import s from "./living-section.module.css";

/**
 * 카드 한 장에 필요한 값은 전부 서버(`living-section.tsx`)에서 문장으로 만들어 넘긴다.
 * 지역명 SSOT(PROVINCES)·상태 산출·날짜 포맷을 클라이언트 번들에 들이지 않기 위해서다.
 */
export interface LivingStay {
  id: string;
  /** 마을명 — "OO마을 농촌에서 살아보기 (귀촌형)" 에서 보일러플레이트를 뗀 값 */
  villageName: string;
  /** "경북 영양군" (시·도 shortName + 시·군·구) */
  regionLabel: string;
  /** "귀농형" | "귀촌형" | "프로젝트형" — 없으면 칩 미표시 */
  typeLabel?: string;
  status: "접수중" | "접수예정" | "마감";
  /** 마감 임박 배지 "오늘 마감" | "D-3" — 임박하지 않으면 없음 */
  urgentLabel?: string;
  /** "~9.30 마감" | "10.5부터 신청" | "상시 모집". 배지가 "오늘 마감"을 말하는 날엔 없다 */
  applyLabel?: string;
  /** "10.1부터 2개월 살아보기" — 운영 기간이 없으면 없음 */
  durationLabel?: string;
  /** "5명 모집" | "4가구 모집" */
  capacityLabel?: string;
  image: { src: string; alt: string; isPhoto: boolean; credit?: string };
}

/** 자동 넘김 간격 — 진행 바 애니메이션도 이 값 하나만 참조한다 */
const INTERVAL_MS = 5000;

/**
 * 살아보기 마을 캐러셀 (2026-09-30).
 *
 * 스크롤 컨테이너 **하나**로 두 레이아웃을 모두 굴린다 — `overflow-x: auto` + `scroll-snap-align: center`.
 * 데스크탑(1024+)은 활성 카드만 원래 크기로 두고 이웃을 축소·감광해 커버플로우처럼 보이게 하고,
 * <1024 는 스케일 없이 78vw 스냅 트랙이 된다(브리프의 모바일 요구 = 기본 스냅 트랙).
 * `scrollTo` 는 overflow hidden 에서도 동작하지만 auto 로 둬서 트랙패드 가로 스크롤·터치 스와이프가
 * 그대로 살아 있고, 스크롤바만 CSS 로 감춘다.
 *
 * - 활성 index 는 **스크롤 위치에서 파생**한다(단일 소스). 버튼·자동 넘김도 `scrollTo` 만 호출한다 —
 *   transform 기반으로 만들면 모바일 스와이프와 index 가 어긋난다.
 * - 자동 넘김은 데스크탑만. 모바일에서 가로 트랙이 저절로 움직이면 읽는 중 시점을 빼앗고
 *   세로 스크롤 제스처와 싸운다(9/7 useTapGesture 교훈과 같은 결).
 * - hover·포커스·터치 중에는 타이머와 진행 바를 **같이** 멈춘다(9/29 히어로 박제: 바만 멈추면 어긋남).
 * - ←/→ 는 캐러셀 안에 포커스가 있을 때만(React onKeyDown). 문서 전역 훅은 쓰지 않는다 —
 *   히어로 여정 레인이 document capture 로 ←/→ 를 쓰고 있어 이중 동작이 된다.
 * - 카드는 전부 `<Link>` 로 항상 렌더한다(조건부 렌더 금지) — SSR HTML 에 8개 링크가 남아야 색인된다.
 */
export function LivingCarousel({ items }: { items: LivingStay[] }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /** hover·포커스·터치 — 사용자가 보고 있는 동안은 넘기지 않는다 */
  const [held, setHeld] = useState(false);

  const total = items.length;
  const autoOn = isDesktop && !reduced && !paused && !held;

  /** 카드 1장 이동 거리 = 카드 폭 + gap. 뷰포트 폭에 따라 달라지므로 매번 DOM 에서 읽는다 */
  const step = useCallback(() => {
    const el = viewportRef.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return 0;
    const gap = parseFloat(getComputedStyle(card.parentElement as HTMLElement).columnGap || "0");
    return card.offsetWidth + gap;
  }, []);

  /* ── 활성 index 는 스크롤 위치에서 파생 ── */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const sync = () => {
      const width = step();
      if (!width) return;
      setIndex(Math.max(0, Math.min(Math.round(el.scrollLeft / width), total - 1)));
    };
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [step, total]);

  const goTo = useCallback(
    (next: number, smooth = true) => {
      const el = viewportRef.current;
      const width = step();
      if (!el || !width) return;
      const target = ((next % total) + total) % total;
      el.scrollTo({ left: target * width, behavior: smooth && !reduced ? "smooth" : "auto" });
    },
    [step, total, reduced],
  );

  /* ── 자동 넘김 (데스크탑) ── */
  useEffect(() => {
    if (!autoOn) return;
    const timer = setInterval(() => goTo(index + 1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [autoOn, goTo, index]);

  /* ── 터치 중 정지 → 손을 뗀 뒤 잠깐 더 (스냅이 끝나기 전에 다시 넘어가지 않게) ── */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let release = 0;
    const hold = () => {
      window.clearTimeout(release);
      setHeld(true);
    };
    const free = () => {
      window.clearTimeout(release);
      release = window.setTimeout(() => setHeld(false), 1200);
    };
    el.addEventListener("pointerdown", hold, { passive: true });
    el.addEventListener("pointerup", free, { passive: true });
    el.addEventListener("pointercancel", free, { passive: true });
    return () => {
      window.clearTimeout(release);
      el.removeEventListener("pointerdown", hold);
      el.removeEventListener("pointerup", free);
      el.removeEventListener("pointercancel", free);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
  };

  return (
    <div
      className={s.carousel}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className={s.viewport} ref={viewportRef}>
        <ul className={s.track}>
          {items.map((item, i) => (
            <li
              key={item.id}
              className={s.slide}
              data-card
              data-active={i === index ? "" : undefined}
            >
              <Link
                href={`/events/${item.id}`}
                className={s.card}
                data-track="living:card"
                /* 활성 카드가 아니면 클릭은 "그 카드로 이동"이 먼저다 — 데스크탑 커버플로우 관례 */
                onClick={(e) => {
                  if (isDesktop && i !== index) {
                    e.preventDefault();
                    goTo(i);
                  }
                }}
              >
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  sizes="(min-width: 1024px) 340px, 78vw"
                  className={s.photo}
                  /* 첫 카드만 선로드 — 8장을 한 번에 내려받으면 히어로 LCP 와 대역폭을 다툰다 */
                  preload={i === 0}
                  decoding="async"
                />
                <span className={s.scrim} aria-hidden="true" />

                <span className={s.topRow}>
                  <span className={item.status === "접수중" ? s.statusOpen : s.statusSoon}>
                    {item.status}
                  </span>
                  {item.urgentLabel && <span className={s.urgent}>{item.urgentLabel}</span>}
                  {item.typeLabel && <span className={s.typeChip}>{item.typeLabel}</span>}
                </span>

                <span className={s.body}>
                  <span className={s.region}>{item.regionLabel}</span>
                  <span className={s.village}>{item.villageName}</span>
                  {item.durationLabel && <span className={s.duration}>{item.durationLabel}</span>}
                  <span className={s.metaRow}>
                    <span className={s.meta}>
                      {[item.applyLabel, item.capacityLabel].filter(Boolean).join(" · ")}
                    </span>
                    {/* 사진일 때만 출처 — 시·도 배경 일러스트 폴백은 우리 자산이다 */}
                    {item.image.credit && <span className={s.credit}>{item.image.credit}</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 하단 중앙 — n / N + 진행선 + 이전·정지·다음 */}
      <div className={s.controls} role="group" aria-label="살아보기 마을 슬라이드 제어">
        <button
          type="button"
          className={s.ctrlBtn}
          onClick={() => goTo(index - 1)}
          aria-label="이전 마을"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <span className={s.counter}>
          <b className={s.counterNow}>{index + 1}</b>
          <span className={s.counterSep} aria-hidden="true">
            /
          </span>
          <span className={s.counterTotal}>{total}</span>
          {/* 자동 넘김이 도는 동안만 0→100%. 슬라이드가 바뀌면 key 로 재마운트해 리셋한다 */}
          {isDesktop && !reduced && (
            <span
              key={index}
              className={s.progress}
              aria-hidden="true"
              data-paused={autoOn ? undefined : ""}
              style={{ "--living-interval": `${INTERVAL_MS}ms` } as React.CSSProperties}
            />
          )}
        </span>

        {isDesktop && !reduced && (
          <button
            type="button"
            className={s.ctrlBtn}
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            aria-label={paused ? "자동 넘김 다시 시작" : "자동 넘김 멈추기"}
          >
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>
        )}

        <button
          type="button"
          className={s.ctrlBtn}
          onClick={() => goTo(index + 1)}
          aria-label="다음 마을"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
