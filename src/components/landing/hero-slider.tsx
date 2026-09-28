"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { HERO_SLIDES, HERO_SLIDE_INTERVAL_MS } from "@/lib/data/hero-slides";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import s from "./hero-slider.module.css";

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
 * - 프래그먼트를 반환해 `.layers`·`.copyStack`·`.controls` 가 히어로 섹션의 직계 자식이 된다
 *   (래퍼 div 없이 flex 흐름·절대 배치를 그대로 쓴다).
 * - 비활성 슬라이드 카피는 DOM 에 두고 `aria-hidden` + `inert` 로 접근성·포커스에서 제외.
 * - `prefers-reduced-motion: reduce` → 자동 전환·Ken Burns·전환 모션 전부 정지(정지 버튼도 숨김).
 * - LCP: 첫 슬라이드만 preload 하고, 나머지 3장은 마운트 2초 뒤에 DOM 에 넣는다. lazy 만으로는
 *   부족하다 — 4장 전부 뷰포트 안이라 첫 로드에서 같이 내려받으며 LCP 이미지와 대역폭을 다툰다
 *   (375 dpr2 기준 장당 36~54KB, 1920 은 199KB). 첫 전환(6초)까지 여유가 충분하다.
 * - 모바일(<1024)은 이전/다음/정지 버튼을 렌더하지 않고 `01 ── 04` 인디케이터만 둔다. 대신 수평
 *   스와이프(≥40px, |dx| > |dy|×1.5)로 넘긴다 — 세로 스크롤 제스처와 충돌하지 않도록 pointerup
 *   에서 판정하고(9/7 useTapGesture 교훈), 스와이프로 끝난 제스처의 click 은 한 번 막는다.
 *   정지 버튼이 없으므로 슬라이드 영역은 `aria-live="off"` — 자동 전환이 스크린리더를 끊지 않는다.
 * - 데스크탑에서만 히어로를 지나 `html[data-hero-floating-search]` 를 세워 검색 바를 화면 하단
 *   고정 바로 전환한다(CSS 는 page.module.css). 모바일은 히어로에 검색창이 없고 헤더 트리거가
 *   상시 노출이라 이 플래그·스크롤 리스너를 아예 걸지 않는다.
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
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<string, true>>({});
  /** 2~4번 슬라이드 이미지 예열 여부 — LCP 이미지와 대역폭을 다투지 않도록 늦춘다 */
  const [warm, setWarm] = useState(false);
  const layersRef = useRef<HTMLDivElement>(null);

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
    if (reduced || paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev === LAST ? 0 : prev + 1));
    }, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reduced, paused]);

  /* 히어로를 지나면 플로팅 검색 바로 전환 (CSS 플래그 하나로 헤더 트리거까지 정리).
     데스크탑 전용 — 모바일은 히어로에 검색창이 없어 전환할 대상이 없다 */
  useEffect(() => {
    if (!isDesktop) return;
    const hero = layersRef.current?.parentElement;
    if (!hero) return;
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (hero.getBoundingClientRect().bottom <= 72) {
        root.dataset.heroFloatingSearch = "";
      } else {
        delete root.dataset.heroFloatingSearch;
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
      delete root.dataset.heroFloatingSearch;
    };
  }, [isDesktop]);

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
              className={`${s.layer}${i === index ? ` ${s.layerActive}` : ""}`}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                sizes="100vw"
                /* Next 16: priority 는 deprecated → preload. 첫 슬라이드만 선로드(LCP) */
                preload={i === 0}
                className={s.image}
                onError={() => setFailed((prev) => ({ ...prev, [slide.id]: true }))}
              />
            </div>
          ),
        )}
        <span className={s.scrim} />
      </div>

      {/* 슬라이드별 카피 — 한 칸에 겹쳐 두고 크로스페이드 (높이 고정 → 전환 시 CLS 0).
          aria-live="off": 자동 전환이 스크린리더 낭독을 끊지 않게 한다(모바일엔 정지 버튼이 없다) */}
      <div className={s.copyStack} aria-live="off">
        {HERO_SLIDES.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              className={`${s.copy}${active ? ` ${s.copyActive}` : ""}`}
              aria-hidden={active ? undefined : true}
              inert={active ? undefined : true}
            >
              <span className={s.eyebrow}>{slide.eyebrow}</span>
              <p className={s.caption}>{slide.caption}</p>
              <Link
                href={slide.href}
                className={s.cta}
                data-track={`hero_slide:${slide.id}`}
              >
                {slide.ctaLabel}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* 좌하단 — 01 ── 04 인디케이터. 이전/정지/다음 버튼과 키보드 ←→ 는 데스크탑만,
          모바일은 스와이프로 넘긴다 (9/28 3차 회장 지시) */}
      <div
        className={s.controls}
        role="group"
        aria-label={isDesktop ? "히어로 슬라이드 제어" : "히어로 슬라이드 진행"}
        onKeyDown={onKeyDown}
      >
        <span className={s.counter}>
          <b className={s.counterNow}>{String(index + 1).padStart(2, "0")}</b>
          <span className={s.counterRule} aria-hidden="true" />
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
