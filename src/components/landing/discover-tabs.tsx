"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { analytics } from "@/lib/analytics";
import s from "./discover-section.module.css";

/**
 * 카드 한 장에 필요한 값은 전부 서버(`discover-section.tsx`)에서 문장으로 만들어 넘긴다.
 * 지역명 SSOT(PROVINCES)·상태 산출·날짜 포맷을 클라이언트 번들에 들이지 않기 위해서다.
 *
 * 지원사업·교육·체험·행사 네 종류가 이 한 모델을 공유한다 — 유형별로 다른 건
 * `line1`·`line2` 에 어떤 문장을 담는지(서버 규칙)뿐이고 카드 구조는 같다.
 */
export interface DiscoverCard {
  id: string;
  href: string;
  /**
   * 배경 이미지. 실제 사진(`isPhoto`)이거나 시·도 배경 일러스트.
   * 없으면(지원사업·전국 온라인 교육 등) 흰 카드 + 진한 글씨로 그린다.
   */
  image?: { src: string; alt: string; isPhoto: boolean; credit?: string };
  /** "모집중" | "접수중" | "모집예정" | "접수예정" | "상시 모집" */
  status: string;
  /** open = 지금 신청 가능(초록) / soon = 아직 안 열림(앰버) */
  statusTone: "open" | "soon";
  /** 마감 임박 배지 "오늘 마감" | "D-3" — 임박하지 않으면 없음 */
  deadlineLabel?: string;
  /** 유형 칩 "귀촌형" | "온라인" | "보조금" | "박람회" */
  chip?: string;
  /** "전남 강진군" | "전국" */
  region: string;
  title: string;
  /** 가장 먼저 읽혀야 하는 값 — 지원 금액 / 얼마나 머무나 / 언제 열리나 */
  line1?: string;
  /** 언제까지 신청하나 · 몇 명 */
  line2?: string;
  /** 부가 칩 — 실제 값이 있을 때만(교육: 과정 구분·비용·기간). 채움값은 서버에서 걸러 넘긴다 */
  tags?: string[];
  /** 주최 기관 */
  foot?: string;
}

export interface DiscoverTab {
  id: string;
  /** 탭 라벨 — 375px 한 줄에 4개가 들어가야 하므로 2~4자 */
  label: string;
  /** 목록 전체 보기 목적지 (탭마다 다름) */
  viewAllHref: string;
  cards: DiscoverCard[];
}

/** 섹션 머리말 — 두 섹션(지원사업·교육 / 체험·행사)이 같은 틀을 쓰고 문구만 다르다 */
export interface DiscoverHeading {
  eyebrow: string;
  /** 제목 앞부분 — 뒤의 `titleEm` 만 강조색 */
  titleLead: string;
  titleEm: string;
  sub: string;
}

/** 자동 넘김 간격 — 진행 바 애니메이션도 이 값 하나만 참조한다 */
const INTERVAL_MS = 5000;

/**
 * 랜딩 "지금 열린 기회" 탭 + 캐러셀 (2026-09-30 회장 지시).
 *
 * - 패널 4개를 **전부 렌더**하고 `hidden` 으로만 감춘다. 조건부 렌더로 만들면 비활성 탭의
 *   내부 링크가 SSR HTML 에서 사라진다(유입 61% Organic — 9/17 박제).
 * - 탭은 ARIA APG 관례(roving tabindex + ←/→ · Home/End, 포커스 이동 = 활성화).
 *   캐러셀도 ←/→ 를 쓰지만 tablist 와 별개 서브트리라 충돌하지 않는다 —
 *   카드·컨트롤에 포커스가 있을 때만 캐러셀이 받는다.
 * - "모두 보기"는 활성 탭의 목적지로 바뀐다. `hidden` 으로 4개를 숨기는 방식은 쓰지 않았다 —
 *   `.viewAll` 이 display 를 선언하고 있어 UA 의 [hidden] 을 이겨 버린다(9/29 박제).
 */
export function DiscoverTabs({
  tabs,
  heading,
  variant,
}: {
  tabs: DiscoverTab[];
  heading: DiscoverHeading;
  /**
   * photo = 사진 카드 커버플로우(체험·행사) / text = 이미지 없는 정보 카드 그리드(지원사업·교육).
   * 10/1 회장: 지원사업·교육은 이미지가 없어 3:4 커버플로우에 넣으면 빈 흰 포스터가 된다 → 섹션 분리.
   */
  variant: "photo" | "text";
}) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);

  const current = tabs[active] ?? tabs[0];
  const showTabs = tabs.length > 1;

  /* setState 업데이터 안에서 계측을 부르면 StrictMode 에서 두 번 발화한다(9/29 박제) → 바깥에서 판정 */
  const select = useCallback(
    (next: number) => {
      const index = ((next % tabs.length) + tabs.length) % tabs.length;
      if (index === active) return;
      analytics.discoverTabSwitch(tabs[index].id);
      setActive(index);
    },
    [tabs, active],
  );

  /** ←/→ 는 포커스를 옮기며 활성화(automatic activation), Home/End 는 양 끝 */
  const onTablistKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active + 1;
    else if (e.key === "ArrowLeft") next = active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    const index = ((next % tabs.length) + tabs.length) % tabs.length;
    select(index);
    tablistRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]?.focus();
  };

  return (
    <>
      {/* 제목 블록을 서버에서 children 으로 넘기지 않는다 — 클라이언트 경계를 건너는 서버 노드는
          RSC 페이로드(script)로만 나가고 SSR HTML 에서 사라졌다(9/30 실측: h2 가 __next_f 안에만 있었다).
          여기에 직접 두면 클라이언트 컴포넌트도 서버에서 HTML 로 렌더되므로 제자리에 남는다. */}
      <div className={s.header} data-reveal-x="left">
        <div className={s.heading}>
          <span className={s.eyebrow}>{heading.eyebrow}</span>
          <h2 className={s.title}>
            {heading.titleLead} <em>{heading.titleEm}</em>
          </h2>
          <p className={s.sub}>{heading.sub}</p>
        </div>
        <Link href={current.viewAllHref} className={s.viewAll} data-track={`discover:${current.id}:view_all`}>
          모두 보기 <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      {showTabs && (
        <div className={s.tabs} role="tablist" aria-label="분야 선택" ref={tablistRef} onKeyDown={onTablistKeyDown}>
          {tabs.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={i === active}
              aria-controls={`${baseId}-panel-${t.id}`}
              tabIndex={i === active ? 0 : -1}
              className={`${s.tab} ${i === active ? s.tabActive : ""}`}
              onClick={() => select(i)}
            >
              {/* 건수 배지는 뺐다(10/2 QA A🟡3) — 탭 카드는 상한 8장이라 "지원사업 8"이 히어로 "신청 가능한 지원사업 12건"과
                  어긋나 보였다. 같은 화면 숫자는 히어로 데이터 줄 하나가 말한다 */}
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tabs.map((t, i) => (
        <div
          key={t.id}
          id={`${baseId}-panel-${t.id}`}
          role={showTabs ? "tabpanel" : undefined}
          aria-labelledby={showTabs ? `${baseId}-tab-${t.id}` : undefined}
          className={s.panel}
          hidden={i !== active}
        >
          {variant === "photo" ? <DiscoverCarousel tab={t} active={i === active} /> : <DiscoverGrid tab={t} />}
        </div>
      ))}
    </>
  );
}

/** 키보드로 온 포커스인가(:focus-visible). 판정을 못 하는 환경이면 키보드로 본다 — 멈추는 쪽이 안전하다 */
function isKeyboardFocus(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  try {
    return target.matches(":focus-visible");
  } catch {
    return true;
  }
}

/**
 * 카드 트랙 하나 — 스크롤 컨테이너 **하나**로 두 레이아웃을 굴린다.
 * <1024 는 78vw 가운데 스냅 트랙, 1024+ 는 왼쪽 정렬(스냅 start, 10/2 회장: 첫 카드 앞 빈 공간 제거)
 * 트랙에서 활성 카드만 원래 크기로 두고 이웃을 축소·감광한다.
 *
 * - 활성 index 는 **스크롤 위치에서 파생**한다(단일 소스). 버튼·자동 넘김도 `scrollTo` 만 부른다.
 * - 비활성 패널은 `display: none` 이라 카드 폭이 0 이다 — 모든 계산·타이머가 `active` 에서 멈춘다.
 * - 탭을 바꿔 들어오면 트랙을 맨 앞으로 되돌린다(페이저 리셋).
 * - 자동 넘김은 데스크탑·활성 패널만. 모바일에서 가로 트랙이 저절로 움직이면 읽는 중 시점을
 *   빼앗고 세로 스크롤 제스처와 싸운다(9/7 검색창 탭·스크롤 혼동 사고와 같은 결).
 * - hover·키보드 포커스·터치 중에는 타이머와 진행 바를 **같이** 멈춘다(9/29 히어로 박제).
 *   세 원인은 따로 센다 — 하나로 묶으면 키보드 포커스가 안에 있는데 마우스가 지나가 나가는 순간 다시 넘어갔다(10/2 QA C-Y10).
 * - 키보드로 카드에 들어오면 그 카드로 트랙을 옮긴다 — <1024 에서 Tab 한 카드가 10~55% 만 보인 채 포커스를 받았다(C-Y9).
 */
function DiscoverCarousel({ tab, active }: { tab: DiscoverTab; active: boolean }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const viewportRef = useRef<HTMLDivElement>(null);
  /**
   * 버튼·자동 넘김이 정한 목표 카드 — 스크롤이 그 위치에 닿을 때까지 중간 스크롤 이벤트가
   * index 를 덮어쓰지 않게 붙잡아 둔다. 사용자가 직접 끌거나 휠을 굴리면 즉시 놓는다.
   */
  const pendingRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /* 사용자가 보고 있는 동안은 넘기지 않는다 — 마우스 올림 · 키보드 포커스 · 터치를 따로 들고 하나라도 있으면 멈춤 */
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [touching, setTouching] = useState(false);
  const held = hovered || focusWithin || touching;

  const items = tab.cards;
  const total = items.length;
  const autoOn = active && isDesktop && !reduced && !paused && !held && total > 1;

  /** 카드 1장 이동 거리 = 카드 폭 + gap. 뷰포트 폭에 따라 달라지므로 매번 DOM 에서 읽는다 */
  const step = useCallback(() => {
    const el = viewportRef.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return 0;
    const gap = parseFloat(getComputedStyle(card.parentElement as HTMLElement).columnGap || "0");
    return card.offsetWidth + gap;
  }, []);

  /* ── 탭 전환으로 들어오면 맨 앞으로 (페이저 리셋) ── */
  useEffect(() => {
    if (!active) return;
    const el = viewportRef.current;
    if (!el) return;
    pendingRef.current = null;
    el.scrollTo({ left: 0, behavior: "auto" });
    setIndex(0);
    setPaused(false);
    setHovered(false);
    setFocusWithin(false);
    setTouching(false);
  }, [active]);

  /**
   * 활성 index 는 스크롤 위치에서 파생.
   * 1024+ 는 왼쪽 정렬 트랙(10/2)이라 마지막 몇 장은 스크롤로 맨 앞에 설 수 없다 —
   * 스크롤 끝에 닿아 있으면 그 끝자락 안의 index 는 그대로 둔다(활성 표시만 옮겨 간다).
   */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !active) return;
    const sync = () => {
      const width = step();
      if (!width) return;
      const max = el.scrollWidth - el.clientWidth;
      const pending = pendingRef.current;
      if (pending !== null) {
        if (Math.abs(el.scrollLeft - Math.min(pending * width, max)) > 2) return;
        pendingRef.current = null;
        setIndex(pending);
        return;
      }
      const raw = Math.max(0, Math.min(Math.round(el.scrollLeft / width), total - 1));
      const atEnd = el.scrollLeft >= max - 2;
      setIndex((prev) => (atEnd && prev >= raw ? prev : raw));
    };
    const release = () => {
      pendingRef.current = null;
    };
    /* 안전판 — 스냅이 목표와 몇 px 다른 곳에 멈춰도 목표 카드를 활성으로 확정한다 */
    const settle = () => {
      if (pendingRef.current === null) return;
      setIndex(pendingRef.current);
      pendingRef.current = null;
    };
    sync();
    el.addEventListener("scrollend", settle);
    el.addEventListener("scroll", sync, { passive: true });
    el.addEventListener("wheel", release, { passive: true });
    el.addEventListener("pointerdown", release, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      el.removeEventListener("scrollend", settle);
      el.removeEventListener("wheel", release);
      el.removeEventListener("pointerdown", release);
      window.removeEventListener("resize", sync);
    };
  }, [step, total, active]);

  const goTo = useCallback(
    (next: number, smooth = true) => {
      const el = viewportRef.current;
      const width = step();
      if (!el || !width) return;
      const target = ((next % total) + total) % total;
      const left = Math.min(target * width, el.scrollWidth - el.clientWidth);
      // 이미 그 자리면(끝자락) 스크롤 이벤트가 안 온다 — 활성만 바로 옮긴다
      if (Math.abs(el.scrollLeft - left) <= 2) {
        pendingRef.current = null;
        setIndex(target);
        return;
      }
      pendingRef.current = target;
      el.scrollTo({
        left,
        behavior: smooth && !reduced ? "smooth" : "auto",
      });
    },
    [step, total, reduced],
  );

  /* ── 자동 넘김 (데스크탑 · 활성 패널) ── */
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
      setTouching(true);
    };
    const free = () => {
      window.clearTimeout(release);
      release = window.setTimeout(() => setTouching(false), 1200);
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

  /**
   * ←/→ — 트랙을 한 장 옮기고, 카드에 포커스가 있었으면 포커스도 그 카드로 옮긴다(roving).
   * 10/6 QA: 트랙만 움직이고 포커스는 첫 카드에 남아, 화면에서 사라진(노출 0%) 카드에서 Enter 를 누르면 보이지 않는 카드로 갔다.
   * 이동은 goTo(smooth)가 맡으므로 포커스는 preventScroll — 브라우저 포커스 스크롤이 스냅·smooth 이동과 다투지 않게.
   * 이전·다음·정지 버튼에 포커스가 있을 때는 포커스를 그대로 둔다(같은 버튼을 이어 누를 수 있게).
   */
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const links = Array.from(viewportRef.current?.querySelectorAll<HTMLElement>("[data-card] > a") ?? []);
    const focused = e.target instanceof Element ? links.findIndex((a) => a.contains(e.target as Node)) : -1;
    // 카드에 포커스가 있으면 그 카드에서, 아니면(제어 버튼) 진행 중 목적지(pending)·활성 카드에서 센다 — 빠른 연타에 index 가 옛 값일 수 있다
    const from = focused >= 0 ? focused : (pendingRef.current ?? index);
    const next = (((e.key === "ArrowLeft" ? from - 1 : from + 1) % total) + total) % total;
    goTo(next);
    if (focused >= 0) links[next]?.focus({ preventScroll: true });
  };

  return (
    /* 뷰포트와 컨트롤을 한 래퍼에 담는다 — 컨트롤 hover·포커스도 자동 넘김을 멈춰야 한다 */
    <div
      className={s.carousel}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => {
        // 키보드 포커스만 — 마우스로 버튼을 누른 뒤 남은 포커스까지 세면 마우스가 떠나도 계속 멈춰 있다
        if (isKeyboardFocus(e.target)) setFocusWithin(true);
      }}
      onBlur={(e) => {
        // 안쪽 요소끼리 옮겨 다니는 blur 는 무시 — 밖으로 나갈 때만 푼다
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setFocusWithin(false);
      }}
    >
      <div className={s.viewport} ref={viewportRef}>
        <ul className={s.track}>
          {items.map((item, i) => (
            <li key={item.id} className={s.slide} data-card data-active={i === index ? "" : undefined}>
              <Link
                href={item.href}
                className={`${s.card} ${item.image ? s.cardPhoto : s.cardText}`}
                data-track={`discover:${tab.id}:card`}
                /* 키보드로 들어온 카드로 트랙을 옮긴다 — 화면에 반쯤 걸친 카드가 포커스를 받지 않게 */
                onFocus={(e) => {
                  // 이동이 진행 중이면(pending) 그 목적지와 비교 — 빠른 Tab 에서 index 가 아직 옛 값이라 이동을 건너뛰던 경합(10/3)
                  const current = pendingRef.current ?? index;
                  if (i !== current && isKeyboardFocus(e.currentTarget)) goTo(i);
                }}
                /* 활성 카드가 아닌 걸 **마우스로** 누르면 "그 카드로 이동"이 먼저다 — 데스크탑 커버플로우 관례.
                   키보드 Enter(click detail 0)는 가로채지 않는다(10/2 QA A⚪8 — Enter 가 먹혔다) */
                onClick={(e) => {
                  if (isDesktop && i !== index && e.detail !== 0) {
                    e.preventDefault();
                    goTo(i);
                  }
                }}
              >
                <CardContent item={item} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 하단 중앙 — n / N + 진행선 + 이전·정지·다음 */}
      {total > 1 && (
        <div className={s.controls} role="group" aria-label={`${tab.label} 슬라이드 제어`}>
          <button type="button" className={s.ctrlBtn} onClick={() => goTo(index - 1)} aria-label="이전 카드">
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
                style={{ "--dc-interval": `${INTERVAL_MS}ms` } as React.CSSProperties}
              />
            )}
          </span>

          {isDesktop && !reduced && (
            /* 라벨만 바꾼다(APG 캐러셀 회전 버튼) — aria-pressed 와 라벨을 같이 바꾸면 "멈추기, 눌림"처럼 뜻이 엇갈린다 */
            <button
              type="button"
              className={s.ctrlBtn}
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "자동 넘김 다시 시작" : "자동 넘김 멈추기"}
            >
              {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
          )}

          <button type="button" className={s.ctrlBtn} onClick={() => goTo(index + 1)} aria-label="다음 카드">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * 정보 카드 그리드 (지원사업·교육) — 이미지가 없어 커버플로우 대신 한눈에 비교하는 배치.
 * <640 가로 스냅 트랙(다음 카드 peek) / 640+ 2열 / 1024+ 4열. 자동 넘김·페이저 없음 —
 * 비교하며 읽는 정보라 저절로 움직이면 안 된다.
 */
function DiscoverGrid({ tab }: { tab: DiscoverTab }) {
  return (
    <ul className={s.grid}>
      {tab.cards.map((item) => (
        <li key={item.id} className={s.gridItem}>
          <Link
            href={item.href}
            className={`${s.card} ${s.cardText} ${s.cardCompact}`}
            data-track={`discover:${tab.id}:card`}
            /* <640 은 가로 스크롤 그리드 — 브라우저는 일부만 보이는 카드를 포커스해도 스크롤하지 않아 짝수 번째 카드가
               20% 만 보인 채 포커스를 받았다(10/3 재검증). 키보드 포커스면 카드를 칸 시작으로 끌어온다. */
            onFocus={(e) => {
              if (isKeyboardFocus(e.currentTarget)) e.currentTarget.scrollIntoView({ block: "nearest", inline: "start" });
            }}
          >
            <CardContent item={item} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 카드 안쪽 — 사진·텍스트 두 배치가 공유한다 */
function CardContent({ item }: { item: DiscoverCard }) {
  return (
    <>
      {item.image && (
        <>
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            sizes="(min-width: 1024px) 340px, 78vw"
            className={s.photo}
            decoding="async"
          />
          <span className={s.scrim} aria-hidden="true" />
        </>
      )}

      <span className={s.topRow}>
        <span className={item.statusTone === "open" ? s.statusOpen : s.statusSoon}>{item.status}</span>
        {item.deadlineLabel && <span className={s.urgent}>{item.deadlineLabel}</span>}
        {item.chip && <span className={s.typeChip}>{item.chip}</span>}
      </span>

      <span className={s.body}>
        <span className={s.region}>{item.region}</span>
        <span className={s.cardTitle}>{item.title}</span>
        {item.line1 && <span className={s.line1}>{item.line1}</span>}
        {item.tags && item.tags.length > 0 && (
          <span className={s.tags}>
            {item.tags.map((tag) => (
              <span key={tag} className={s.tag}>
                {tag}
              </span>
            ))}
          </span>
        )}
        <span className={s.metaRow}>
          {item.line2 && <span className={s.line2}>{item.line2}</span>}
          {/* 사진일 때만 출처 — 시·도 배경 일러스트 폴백은 우리 자산이다 */}
          {item.image?.credit && <span className={s.credit}>{item.image.credit}</span>}
        </span>
        {item.foot && <span className={s.foot}>{item.foot}</span>}
      </span>
    </>
  );
}
