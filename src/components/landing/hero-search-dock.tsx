"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";
import { HeroSearchForm } from "./hero-search-form";
import s from "./hero-search-dock.module.css";

/**
 * 랜딩 A안 (2026-10-01) — 히어로 관찰자 + 스크롤 후 하단 고정 바.
 *
 * 1) 히어로(`[data-landing-hero]`)가 헤더 밑으로 지나가거나 맨 위에서 조금이라도 내려가면(10/2) `html[data-hero-passed]` 를 세운다 →
 *    header.module.css 의 투명 오버레이 헤더가 흰 헤더로 돌아온다(9/29 B안 규칙 재사용, 전 폭).
 * 2) 히어로가 화면 밖으로 완전히 나가면 하단 중앙에 [정착 유형 칩 6 + 검색] 바가 올라오고,
 *    히어로로 돌아오거나 푸터가 화면에 들어오면 내려간다(현대백화점그룹 채용 하단 바 번안).
 *    1024+ 전용 — 그 아래는 하단 탭바와 겹치므로 CSS 에서 display:none(탭 순서에서도 빠진다).
 *
 * 숨김 상태에선 `inert` 로 포커스 진입을 막고, 바 안에 포커스가 있는 동안에는 숨기지 않는다
 * (입력 도중 푸터에 닿아도 입력창이 사라지지 않게).
 */

/** 하단 바 칩은 폭이 빠듯해 "예비 귀농·귀촌인"만 짧게 쓴다 */
const SHORT_LABEL: Record<string, string> = { undecided: "예비 귀농·귀촌" };

export function HeroSearchDock() {
  const dockRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  /* 10/3 재검증: scroll-padding-bottom 만으로는 뷰포트 하단에 걸친 요소(Chromium 은 일부만 보이는 요소를 포커스
     스크롤하지 않는다)와 포커스 순간 커지는 커버플로우 카드가 도크 밑으로 일부 들어갔다(1024~1440 폭당 4곳).
     키보드 포커스가 도크와 겹치면 전환이 끝난 뒤 nearest 로 한 번 더 끌어올린다(scroll-padding 110px 이 적용됨). */
  useEffect(() => {
    let timer = 0;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement) || !target.matches(":focus-visible")) return;
      if (dockRef.current?.contains(target)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const dock = dockRef.current;
        if (!dock || dock.dataset.heroDock !== "visible" || document.activeElement !== target) return;
        if (target.getBoundingClientRect().bottom > dock.getBoundingClientRect().top - 8) {
          target.scrollIntoView({ block: "nearest" });
        }
      }, 550);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      window.clearTimeout(timer);
    };
  }, []);

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

      /* 10/2 오후 회장: 히어로 중간에서 위로 스크롤해 헤더가 다시 내려오면 투명 헤더가 히어로 본문(데이터 패널 제목 등)과
         글자째 겹쳤다. 투명은 **맨 위(스크롤 ≤ 8px)에서만** — 조금이라도 내려간 뒤 돌아오는 헤더는 흰 헤더다. */
      if (heroBottom <= headerH || window.scrollY > 8) root.dataset.heroPassed = "";
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
        <HeroSearchForm variant="dock" />
      </div>
    </div>
  );
}
