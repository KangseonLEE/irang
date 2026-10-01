"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";
import { HeroSearchForm } from "./hero-search-form";
import s from "./hero-search-dock.module.css";

/**
 * 랜딩 A안 (2026-10-01) — 히어로 관찰자 + 스크롤 후 하단 고정 바.
 *
 * 1) 히어로(`[data-landing-hero]`)가 헤더 밑으로 지나가면 `html[data-hero-passed]` 를 세운다 →
 *    header.module.css 의 투명 오버레이 헤더가 흰 헤더로 돌아온다(9/29 B안 규칙 재사용, 전 폭).
 * 2) 히어로가 화면 밖으로 완전히 나가면 하단 중앙에 [정착 유형 칩 6 + 검색] 바가 올라오고,
 *    히어로로 돌아오거나 푸터가 화면에 들어오면 내려간다(현대백화점그룹 채용 하단 바 번안).
 *    1024+ 전용 — 그 아래는 하단 탭바와 겹치므로 CSS 에서 display:none(탭 순서에서도 빠진다).
 *
 * 숨김 상태에선 `inert` 로 포커스 진입을 막고, 바 안에 포커스가 있는 동안에는 숨기지 않는다
 * (입력 도중 푸터에 닿아도 입력창이 사라지지 않게).
 */

/** 하단 바 칩은 폭이 빠듯해 "아직 고르는 중"만 짧게 쓴다 */
const SHORT_LABEL: Record<string, string> = { undecided: "고르는 중" };

export function HeroSearchDock() {
  const dockRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
    if (!hero) return;
    const root = document.documentElement;
    const headerEl = document.querySelector("header");
    const footerEl = document.querySelector("footer");
    let raf = 0;

    const update = () => {
      raf = 0;
      const heroBottom = hero.getBoundingClientRect().bottom;
      // 헤더 높이는 실제 요소에서 — --h-header 는 rem 이라 parseInt 하면 3 이 된다(9/29 실측)
      const headerH = headerEl?.offsetHeight || 56;

      if (heroBottom <= headerH) root.dataset.heroPassed = "";
      else delete root.dataset.heroPassed;

      const footerIn = footerEl ? footerEl.getBoundingClientRect().top < window.innerHeight : false;
      const next = heroBottom <= 0 && !footerIn;
      const focusedInside = dockRef.current?.contains(document.activeElement) ?? false;
      setVisible((prev) => (focusedInside && prev ? true : next));
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

  return (
    <div
      ref={dockRef}
      className={`${s.dock} ${visible ? s.visible : ""}`}
      inert={!visible}
      aria-hidden={!visible}
      data-hero-dock={visible ? "visible" : "hidden"}
    >
      <nav className={s.lanes} aria-label="정착 유형 바로가기">
        <span className={s.lanesLabel}>유형</span>
        <ul className={s.laneList}>
          {JOURNEY_LANES.map((lane) => (
            <li key={lane.id}>
              <Link href={lane.href} className={s.lane} data-track={`hero_dock:${lane.id}`}>
                {SHORT_LABEL[lane.id] ?? lane.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <span className={s.divider} aria-hidden="true" />
      <div className={s.search}>
        <HeroSearchForm variant="dock" idPrefix="hero-dock" />
      </div>
    </div>
  );
}
