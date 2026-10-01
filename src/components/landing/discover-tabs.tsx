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
              {t.label}
              <span className={s.tabCount}>{t.cards.length}</span>
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

/**
 * 카드 트랙 하나 — 스크롤 컨테이너 **하나**로 두 레이아웃을 굴린다
 * (`overflow-x: auto` + `scroll-snap-align: center`). 1024+ 는 활성 카드만 원래 크기로 두고
 * 이웃을 축소·감광해 커버플로우처럼 보이게 하고, <1024 는 78vw 스냅 트랙이 된다.
 *
 * - 활성 index 는 **스크롤 위치에서 파생**한다(단일 소스). 버튼·자동 넘김도 `scrollTo` 만 부른다.
 * - 비활성 패널은 `display: none` 이라 카드 폭이 0 이다 — 모든 계산·타이머가 `active` 에서 멈춘다.
 * - 탭을 바꿔 들어오면 트랙을 맨 앞으로 되돌린다(페이저 리셋).
 * - 자동 넘김은 데스크탑·활성 패널만. 모바일에서 가로 트랙이 저절로 움직이면 읽는 중 시점을
 *   빼앗고 세로 스크롤 제스처와 싸운다(9/7 useTapGesture 교훈과 같은 결).
 * - hover·포커스·터치 중에는 타이머와 진행 바를 **같이** 멈춘다(9/29 히어로 박제).
 */
function DiscoverCarousel({ tab, active }: { tab: DiscoverTab; active: boolean }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  /** hover·포커스·터치 — 사용자가 보고 있는 동안은 넘기지 않는다 */
  const [held, setHeld] = useState(false);

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
    el.scrollTo({ left: 0, behavior: "auto" });
    setIndex(0);
    setPaused(false);
    setHeld(false);
  }, [active]);

  /* ── 활성 index 는 스크롤 위치에서 파생 ── */
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || !active) return;
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
  }, [step, total, active]);

  const goTo = useCallback(
    (next: number, smooth = true) => {
      const el = viewportRef.current;
      const width = step();
      if (!el || !width) return;
      const target = ((next % total) + total) % total;
      el.scrollTo({
        left: target * width,
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
    /* 뷰포트와 컨트롤을 한 래퍼에 담는다 — 컨트롤 hover·포커스도 자동 넘김을 멈춰야 한다 */
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
            <li key={item.id} className={s.slide} data-card data-active={i === index ? "" : undefined}>
              <Link
                href={item.href}
                className={`${s.card} ${item.image ? s.cardPhoto : s.cardText}`}
                data-track={`discover:${tab.id}:card`}
                /* 활성 카드가 아니면 클릭은 "그 카드로 이동"이 먼저다 — 데스크탑 커버플로우 관례 */
                onClick={(e) => {
                  if (isDesktop && i !== index) {
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
          <Link href={item.href} className={`${s.card} ${s.cardText} ${s.cardCompact}`} data-track={`discover:${tab.id}:card`}>
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
