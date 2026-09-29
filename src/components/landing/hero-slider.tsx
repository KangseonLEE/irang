"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play, ChevronDown } from "lucide-react";
import { HERO_SLIDES, HERO_SLIDE_INTERVAL_MS } from "@/lib/data/hero-slides";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useHeroLaneSelected } from "@/lib/hooks/use-hero-lane-selection";
import s from "./hero-slider.module.css";

/** 히어로 하단 컨트롤이 차지하는 띠(bottom 32 + 높이 44 + 여유) — 투명→흰 헤더 전환을 이만큼 앞당긴다 (9/29 QA) */
const CONTROLS_BAND_PX = 80;

/**
 * HeroSlider — 풀블리드 슬라이드 히어로 (2026-09-28 시안, 9/28 3차로 모바일까지 확장).
 *
 * 레퍼런스(현대백화점 채용·삼성드림) 문법: 배경 이미지 + 느린 Ken Burns + 어두운 스크림,
 * 좌측 정렬 헤드라인, 좌하단 `01 ── 04` 인디케이터 + 이전/다음/정지.
 *
 * 설계 규칙
 * - **모든 폭에서 SSR 렌더한다** (9/28 3차 회장 지시로 "모바일 DOM 무변경" 규칙 해제).
 *   SSR HTML 이 하나뿐이므로 뷰포트 분기는 CSS 로만 한다 — 렌더 게이트를 쓰면 데스크탑 SSR 에서도
 *   빠져 LCP·색인이 깨진다. 모바일 값은 `@media (max-width: 1023px)` 에 격리(기본값 = 데스크탑).
 * - 프래그먼트를 반환해 `.layers`·`.controls` 가 히어로 섹션의 직계 자식이 된다
 *   (래퍼 div 없이 flex 흐름·절대 배치를 그대로 쓴다).
 * - 9/29 회장 1안: 슬라이드별 카피(말머리·설명·CTA)는 제거했다 — 히어로의 주인공은 여정 카드 6장이고,
 *   배경은 6초마다 바뀌는 분위기 레이어만 맡는다. 슬라이드 전환 중에도 카드는 그대로 있어야 한다.
 * - `prefers-reduced-motion: reduce` → 자동 전환·Ken Burns·전환 모션 전부 정지(정지 버튼도 숨김).
 * - LCP: 첫 슬라이드만 preload 하고, 나머지 3장은 마운트 2초 뒤에 DOM 에 넣는다. lazy 만으로는
 *   부족하다 — 4장 전부 뷰포트 안이라 첫 로드에서 같이 내려받으며 LCP 이미지와 대역폭을 다툰다
 *   (375 dpr2 기준 장당 36~54KB, 1920 은 199KB). 첫 전환(6초)까지 여유가 충분하다.
 * - 모바일(<1024)은 이전/다음/정지 버튼을 렌더하지 않고 `01 ── 04` 인디케이터만 둔다. 대신 수평
 *   스와이프(≥40px, |dx| > |dy|×1.5)로 넘긴다 — 세로 스크롤 제스처와 충돌하지 않도록 pointerup
 *   에서 판정하고(9/7 useTapGesture 교훈), 스와이프로 끝난 제스처의 click 은 한 번 막는다.
 *   정지 버튼이 없으므로 슬라이드 영역은 `aria-live="off"` — 자동 전환이 스크린리더를 끊지 않는다.
 * - 데스크탑에서도 히어로 검색창을 없앴다(9/29 회장) — 검색 입구는 헤더 트리거 하나.
 *   대신 히어로를 지나면 `html[data-hero-passed]` 를 세워 투명 오버레이 헤더를 흰 헤더로 되돌린다.
 * - 이미지가 없으면(onError) 그 레이어를 접는다 → 히어로의 브랜드 그린 그라데이션이 그대로 보인다.
 */
export function HeroSlider() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  return <Slider reduced={reduced} isDesktop={isDesktop} />;
}

const LAST = HERO_SLIDES.length - 1;

/** 모바일 스와이프로 인정할 최소 수평 이동량 (px) */
const SWIPE_MIN_PX = 40;

function Slider({ reduced, isDesktop }: { reduced: boolean; isDesktop: boolean }) {
  // 모바일 스크롤 안내 — 히어로가 화면을 가득 채우므로 아래에 더 있다는 신호(회장 9/28 실기기). 60px 내리면 사라진다
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (isDesktop) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDesktop]);
  const scrollToNext = () => {
    const hero = document.querySelector('section[aria-label="검색"]');
    const next = hero?.nextElementSibling as HTMLElement | null;
    next?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /** 컨트롤 위 hover — 진행 바만 멈추면 타이머와 어긋나므로 **타이머도 같은 상태로 멈춘다** */
  const [hoverPaused, setHoverPaused] = useState(false);
  /* 여정 카드를 고른 동안엔 배경이 바뀌지 않는다 — 패널을 읽는 중에 전환되면 산만하다 (9/29 S) */
  const laneSelected = useHeroLaneSelected();
  const autoPaused = paused || hoverPaused || laneSelected;
  const [failed, setFailed] = useState<Record<string, true>>({});
  /** 2~4번 슬라이드 이미지 예열 여부 — LCP 이미지와 대역폭을 다투지 않도록 늦춘다 */
  const [warm, setWarm] = useState(false);
  const layersRef = useRef<HTMLDivElement>(null);
  /* 직전 슬라이드 — 새 레이어가 완전히 덮을 때까지(1.2s) 아래에 깔아 둔다.
     즉시 지우면 전환 첫 200ms 동안 배경 그라데이션이 비쳐 어두워진다(9/29 실측). */
  const prevIndexRef = useRef(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  useEffect(() => {
    const from = prevIndexRef.current;
    if (from === index) return;
    prevIndexRef.current = index;
    setPrevIndex(from);
    const t = setTimeout(() => setPrevIndex(null), 1250);
    return () => clearTimeout(t);
  }, [index]);

  const move = useCallback((step: 1 | -1) => {
    setIndex((prev) => (prev + step + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  /* 첫 화면이 안정된 뒤 나머지 슬라이드 이미지를 붙인다 (첫 전환 6초보다 한참 이르다) */
  useEffect(() => {
    const t = setTimeout(() => setWarm(true), 2000);
    return () => clearTimeout(t);
  }, []);

  /* 자동 전환 6초 — reduced motion·정지 중엔 타이머를 걸지 않는다 */
  useEffect(() => {
    if (reduced || autoPaused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev === LAST ? 0 : prev + 1));
    }, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reduced, autoPaused]);

  /* 히어로를 지나면 투명 오버레이 헤더 → 흰 헤더 (CSS 가 색만 0.25s 로 바꾼다).
     9/29 P: 모바일도 히어로가 헤더 뒤까지 차오르므로 폭 제한 없이 건다. */
  useEffect(() => {
    const hero = layersRef.current?.parentElement;
    if (!hero) return;
    const root = document.documentElement;
    /* 헤더 높이는 **실제 요소**에서 읽는다 — `--h-header` 는 rem 단위라 parseInt 가 3 을 준다(9/29 실측:
       전환 지점이 히어로 하단 −헤더 가 아니라 히어로 하단에서 일어났다) */
    const headerEl = document.querySelector("header");
    let raf = 0;
    const update = () => {
      raf = 0;
      const headerH = headerEl?.offsetHeight || 56;
      /* 9/29 QA: 히어로 하단 컨트롤(01 ── 04, 하단 32 + 높이 44)이 투명 헤더 띠에 들어오는 ~80px 구간에서
         흰 로고와 겹쳤다 — 컨트롤이 헤더 띠에 닿기 전에 흰 헤더로 먼저 전환한다 */
      if (hero.getBoundingClientRect().bottom <= headerH + CONTROLS_BAND_PX) {
        root.dataset.heroPassed = "";
      } else {
        delete root.dataset.heroPassed;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      delete root.dataset.heroPassed;
    };
  }, []);

  /* 모바일 스와이프 — 버튼이 없으므로 유일한 수동 전환 수단.
     pointerdown 이 아니라 pointerup 에서 이동량으로 판정해야 세로 스크롤과 안 싸운다(9/7 박제). */
  useEffect(() => {
    if (isDesktop) return;
    const hero = layersRef.current?.parentElement;
    if (!hero) return;

    let x0 = 0;
    let y0 = 0;
    let tracking = false;
    let swiped = false;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      /* 여정 카드 트랙을 옆으로 미는 동작이 배경 슬라이드까지 넘기지 않게 (9/29 S) */
      if ((e.target as Element | null)?.closest?.("[data-hero-lanes]")) return;
      x0 = e.clientX;
      y0 = e.clientY;
      tracking = true;
      swiped = false;
    };
    const onUp = (e: PointerEvent) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
        swiped = true;
        move(dx < 0 ? 1 : -1);
      }
    };
    const onCancel = () => {
      tracking = false;
    };
    /* 스와이프로 끝난 제스처가 링크 클릭까지 발화하지 않게 한 번만 막는다 */
    const onClick = (e: MouseEvent) => {
      if (!swiped) return;
      swiped = false;
      e.preventDefault();
      e.stopPropagation();
    };

    hero.addEventListener("pointerdown", onDown, { passive: true });
    hero.addEventListener("pointerup", onUp, { passive: true });
    hero.addEventListener("pointercancel", onCancel, { passive: true });
    hero.addEventListener("click", onClick, true);
    return () => {
      hero.removeEventListener("pointerdown", onDown);
      hero.removeEventListener("pointerup", onUp);
      hero.removeEventListener("pointercancel", onCancel);
      hero.removeEventListener("click", onClick, true);
    };
  }, [isDesktop, move]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    }
  };

  return (
    <>
      {/* 배경 레이어 — 전부 DOM 에 두고 활성 슬라이드만 불투명 */}
      <div className={s.layers} ref={layersRef} aria-hidden="true">
        {HERO_SLIDES.map((slide, i) =>
          /* 예열 전에는 1번만 — 단, 사용자가 2초 안에 넘기면 그 슬라이드는 즉시 붙인다 */
          failed[slide.id] || !(i === 0 || warm || i === index) ? null : (
            <div
              key={slide.id}
              className={`${s.layer}${i === index ? ` ${s.layerActive}` : ""}${
                i === prevIndex ? ` ${s.layerPrev}` : ""
              }`}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="100vw"
                /* Next 16: priority 는 deprecated → preload. 첫 슬라이드만 선로드(LCP) */
                preload={i === 0}
                decoding="async"
                className={s.image}
                onError={() => setFailed((prev) => ({ ...prev, [slide.id]: true }))}
              />
            </div>
          ),
        )}
        <span className={s.scrim} />
      </div>

      {(
        <button
          type="button"
          className={`${s.scrollHint}${scrolled ? ` ${s.scrollHintHidden}` : ""}`}
          onClick={scrollToNext}
          aria-label="아래로 내려 더 보기"
        >
          <span className={s.scrollHintText}>아래로 내려 보세요</span>
          <ChevronDown size={20} aria-hidden="true" />
        </button>
      )}

      {/* 좌하단 — 01 ── 04 인디케이터. 이전/정지/다음 버튼과 키보드 ←→ 는 데스크탑만,
          모바일은 스와이프로 넘긴다 (9/28 3차 회장 지시) */}
      <div
        className={s.controls}
        onMouseEnter={isDesktop ? () => setHoverPaused(true) : undefined}
        onMouseLeave={isDesktop ? () => setHoverPaused(false) : undefined}
        role="group"
        aria-label={isDesktop ? "히어로 슬라이드 제어" : "히어로 슬라이드 진행"}
        onKeyDown={onKeyDown}
      >
        <span className={s.counter}>
          <b className={s.counterNow}>{String(index + 1).padStart(2, "0")}</b>
          {/* 진행 바 — 자동 전환 간격 동안 0→100%. 슬라이드가 바뀌면 key 로 재마운트해 리셋하고,
              정지·hover 중엔 CSS 가 animation-play-state 로 멈춘다. 간격은 HERO_SLIDE_INTERVAL_MS 하나만 참조 */}
          <span
            key={index}
            className={s.counterRule}
            aria-hidden="true"
            data-paused={autoPaused ? "" : undefined}
            style={{ "--hero-interval": `${HERO_SLIDE_INTERVAL_MS}ms` } as React.CSSProperties}
          />
          <span className={s.counterTotal}>
            {String(HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </span>
        {isDesktop && (
        <span className={s.buttons}>
          <button
            type="button"
            className={s.ctrlBtn}
            onClick={() => move(-1)}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          {!reduced && (
            <button
              type="button"
              className={s.ctrlBtn}
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? "자동 전환 다시 시작" : "자동 전환 멈추기"}
            >
              {paused ? (
                <Play size={16} aria-hidden="true" />
              ) : (
                <Pause size={16} aria-hidden="true" />
              )}
            </button>
          )}
          <button
            type="button"
            className={s.ctrlBtn}
            onClick={() => move(1)}
            aria-label="다음 슬라이드"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </span>
        )}
      </div>
    </>
  );
}
