"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { HERO_SLIDES, HERO_SLIDE_INTERVAL_MS } from "@/lib/data/hero-slides";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import s from "./hero-slider.module.css";

/**
 * HeroSlider — 데스크탑(1024+) 풀블리드 슬라이드 히어로 (2026-09-28 시안).
 *
 * 레퍼런스(현대백화점 채용·삼성드림) 문법: 배경 이미지 + 느린 Ken Burns + 어두운 스크림,
 * 좌측 정렬 헤드라인, 좌하단 `01 ── 04` 인디케이터 + 이전/다음/정지.
 *
 * 설계 규칙
 * - **모바일(<1024)에서는 아무것도 렌더하지 않는다** — DOM 이 현행 히어로와 완전히 동일해야 한다.
 *   `useMediaQuery` 는 서버 스냅샷 false 라 SSR HTML 에도 들어가지 않는다.
 * - 프래그먼트를 반환해 `.layers`·`.copyStack`·`.controls` 가 히어로 섹션의 직계 자식이 된다
 *   (래퍼 div 없이 flex 흐름·절대 배치를 그대로 쓴다).
 * - 비활성 슬라이드 카피는 DOM 에 두고 `aria-hidden` + `inert` 로 접근성·포커스에서 제외.
 * - `prefers-reduced-motion: reduce` → 자동 전환·Ken Burns·전환 모션 전부 정지(정지 버튼도 숨김).
 * - 히어로를 지나 스크롤하면 `html[data-hero-floating-search]` 를 세워 검색 바를 화면 하단
 *   고정 바로 전환한다(CSS 는 page.module.css). 같은 플래그로 헤더 검색 트리거를 숨긴다.
 * - 이미지가 없으면(onError) 그 레이어를 접는다 → 히어로의 브랜드 그린 그라데이션이 그대로 보인다.
 */
export function HeroSlider() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  if (!isDesktop) return null;
  return <Slider reduced={reduced} />;
}

const LAST = HERO_SLIDES.length - 1;

function Slider({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState<Record<string, true>>({});
  const layersRef = useRef<HTMLDivElement>(null);

  const move = useCallback((step: 1 | -1) => {
    setIndex((prev) => (prev + step + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  /* 자동 전환 6초 — reduced motion·정지 중엔 타이머를 걸지 않는다 */
  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev === LAST ? 0 : prev + 1));
    }, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reduced, paused]);

  /* 히어로를 지나면 플로팅 검색 바로 전환 (CSS 플래그 하나로 헤더 트리거까지 정리) */
  useEffect(() => {
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
  }, []);

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
          failed[slide.id] ? null : (
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

      {/* 슬라이드별 카피 — 한 칸에 겹쳐 두고 크로스페이드 (높이 고정 → 전환 시 CLS 0) */}
      <div className={s.copyStack}>
        {HERO_SLIDES.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              className={`${s.copy}${active ? ` ${s.copyActive}` : ""}`}
              aria-hidden={active ? undefined : true}
              inert={active ? undefined : true}
            >
              <span className={s.eyebrow}>#{slide.eyebrow}</span>
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

      {/* 좌하단 컨트롤 — 01 ── 04 + 이전/정지/다음, 키보드 ←→ */}
      <div
        className={s.controls}
        role="group"
        aria-label="히어로 슬라이드 제어"
        onKeyDown={onKeyDown}
      >
        <span className={s.counter}>
          <b className={s.counterNow}>{String(index + 1).padStart(2, "0")}</b>
          <span className={s.counterRule} aria-hidden="true" />
          <span className={s.counterTotal}>
            {String(HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </span>
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
      </div>
    </>
  );
}
