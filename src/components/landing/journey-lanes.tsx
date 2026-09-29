"use client";

/**
 * JourneyLanes — 히어로 안의 여정 선택 (2026-09-29 회장 S/S2/S3).
 *
 * 히어로가 두 화면을 갖는다.
 *  · 카드 화면 — 포스터 6장(1024+ 한 줄 / <1024 가로 스냅 + SnapDots).
 *  · 선택 화면 — 카드를 고르면 히어로 머리말과 카드 6장이 0.25s 로 걷히고, 그 자리에
 *    "한 번 전환된" 화면이 들어온다. 히어로 가용 영역을 **전부** 쓰고 좌우 1:1 —
 *    좌: 큰 포스터(빛이 한 바퀴 도는 글로우 링) / 우: 배경 없는 캐릭터 **옆에** 제목·소개글·데이터 타일·탐색하기.
 *
 * 설계 규칙
 * - **카드는 `<Link>` 로 둔다.** SSR HTML 에 내부 링크 6개가 남아야 하기 때문(유입 61% Organic).
 *   클릭은 가로채 선택 상태로 바꾸되, 새 탭·수식키·가운데 클릭은 그대로 통과시킨다.
 *   `aria-pressed` 는 링크에 못 쓰므로 공개 관계인 `aria-expanded` + `aria-controls` 로 표현.
 * - 카드 화면은 선택 중에도 DOM 에 남긴다(absolute + opacity 0 + inert) — 지우면 크로스페이드가 안 되고,
 *   되돌아올 때 스크롤 위치·SnapDots 구독이 끊긴다.
 * - 선택 중엔 배경 슬라이드 자동 전환을 멈춘다(`setHeroLaneSelected` → HeroSlider).
 * - 타일 값은 전부 서버에서 계산해 prop 으로 받는다(`lib/data/journey-lanes-stats`).
 * - `data-hero-lanes` — 히어로의 모바일 스와이프가 이 영역에서 시작한 제스처를 건너뛰는 표식.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { SnapDots } from "@/components/ui/snap-dots";
import { setHeroLaneSelected } from "@/lib/hooks/use-hero-lane-selection";
import type { JourneyLaneCard } from "@/lib/data/journey-lanes";
import type { LaneStats } from "@/lib/data/journey-lanes-stats";
import s from "./journey-lanes.module.css";

const PANEL_ID = "hero-lane-panel";

export function JourneyLanes({
  gates,
  lanes,
  stats,
}: {
  /** 첫 화면 두 갈래 — [목적이 있어요, 아직 고르는 중] */
  gates: readonly JourneyLaneCard[];
  /** 목적이 있는 사람에게 보여 주는 5장 */
  lanes: readonly JourneyLaneCard[];
  stats: LaneStats;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef(new Map<string, HTMLAnchorElement>());
  /** gate(두 갈래) → lanes(5장) → selected(요약). 뒤로는 한 단씩 되돌아간다 */
  const [view, setView] = useState<"gate" | "lanes">("gate");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const gateRef = useRef<HTMLAnchorElement | null>(null);
  const lanesBackRef = useRef<HTMLButtonElement>(null);
  const index = lanes.findIndex((l) => l.id === selectedId);
  const selected = index >= 0 ? lanes[index] : null;
  const tiles = selected ? (stats[selected.id] ?? []) : [];
  /* 양 끝은 순환 — 6번째에서 다음을 누르면 1번째로 */
  const prevLane = selected ? lanes[(index - 1 + lanes.length) % lanes.length] : null;
  const nextLane = selected ? lanes[(index + 1) % lanes.length] : null;

  /** 카드 화면에서 처음 열 때만 뒤로 버튼으로 포커스를 옮긴다 — 이전/다음 전환 때는 그 버튼에 남긴다 */
  const focusBackOnOpen = useRef(false);
  /** 닫힐 때 돌아갈 카드 — 이전/다음으로 레인을 바꿨다면 **마지막으로 보던** 레인의 카드 */
  const returnToId = useRef<string | null>(null);

  const select = useCallback((id: string | null, fromCards = false) => {
    if (fromCards) focusBackOnOpen.current = true;
    if (id) returnToId.current = id;
    setSelectedId(id);
    setHeroLaneSelected(id !== null);
  }, []);

  /* 닫히면 보던 레인의 카드로 포커스를 돌린다 — 안 그러면 body 로 유실돼 다음 Tab 이 엉뚱한 곳으로 간다.
     카드 레이어의 inert 가 풀린 **다음 프레임**에 잡아야 focus() 가 먹는다 */
  useEffect(() => {
    if (selectedId) return;
    const id = returnToId.current;
    returnToId.current = null;
    if (!id) return;
    const raf = requestAnimationFrame(() => {
      cardRefs.current.get(id)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(raf);
  }, [selectedId]);

  /* 처음 열릴 때만 포커스 이동(키보드 사용자가 빈 곳에 남지 않게) */
  useEffect(() => {
    if (!selectedId || !focusBackOnOpen.current) return;
    focusBackOnOpen.current = false;
    const t = setTimeout(() => backRef.current?.focus({ preventScroll: true }), 60);
    return () => clearTimeout(t);
  }, [selectedId]);

  /* 언마운트 시 자동 전환 재개 — 플래그가 모듈 스코프라 남겨 두면 슬라이드가 영영 멈춘다 */
  useEffect(() => () => setHeroLaneSelected(false), []);

  /* Esc 로 카드 화면 복귀 · ←/→ 로 이웃 여정 전환 (입력 중에는 무시) */
  useEffect(() => {
    if (!selectedId && view === "gate") return;
    const onKey = (e: KeyboardEvent) => {
      /* 검색 모달·확인 다이얼로그가 위에 떠 있으면 Esc·←/→ 는 그쪽 것이다 (9/29 QA).
         Next 개발 오버레이(nextjs-portal)는 제외 — 실제 앱 레이어만 본다 */
      if (document.querySelector('[data-irang-dialog], [role="dialog"][aria-modal="true"]')) return;
      if (e.key === "Escape") {
        if (selectedId) select(null);
        else setView("gate");
        return;
      }
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      /* Alt+← 는 브라우저 뒤로가기 — 수식키가 붙은 화살표는 삼키지 않는다. e.repeat(길게 누름)는 허용 */
      if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const el = document.activeElement;
      if (el instanceof HTMLElement) {
        if (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
        /* 히어로 슬라이드 컨트롤(role=group)도 ←/→ 를 쓴다 — 거기 포커스가 있으면 슬라이드만 넘긴다.
           레인 화면 안이거나 body(아무 데도 포커스 없음)일 때만 우리가 처리한다 (9/29 QA 이중 동작) */
        const inLanes = el.closest("[data-hero-lanes]");
        if (!inLanes && el !== document.body) return;
      }
      e.preventDefault();
      const at = lanes.findIndex((l) => l.id === selectedId);
      const to = e.key === "ArrowLeft" ? (at - 1 + lanes.length) % lanes.length : (at + 1) % lanes.length;
      select(lanes[to].id);
    };
    /* capture 로 듣는다 — React 는 루트 컨테이너(body)에서 onKeyDown 을 처리하므로 bubble 로 들으면
       검색 모달이 먼저 닫히고, 그 다음 우리 차례엔 이미 다이얼로그가 사라져 가드가 무용지물이다 (9/29 QA) */
    document.addEventListener("keydown", onKey, { capture: true });
    return () => document.removeEventListener("keydown", onKey, { capture: true });
  }, [selectedId, view, select, lanes]);

  /** 새 탭·수식키·가운데 클릭은 링크 그대로, 평범한 클릭만 선택으로 가로챈다 */
  const onCardClick = (id: string) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    select(id, true);
  };

  /** 게이트에서 막 넘어왔는지 — 선택 화면에서 되돌아온 경우와 포커스 목적지가 다르다 */
  const cameFromGate = useRef(false);

  /** 게이트 카드 1 — 이동 대신 히어로 안에서 레인 5장으로 전환 */
  const onGateClick = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    cameFromGate.current = true;
    setView("lanes");
  };

  /* 게이트 → 레인일 때만 첫 카드로 포커스(선택 화면에서 돌아올 땐 보던 레인 카드가 받는다) */
  useEffect(() => {
    if (view !== "lanes" || selectedId || !cameFromGate.current) return;
    cameFromGate.current = false;
    const t = setTimeout(() => cardRefs.current.get(lanes[0]?.id)?.focus({ preventScroll: true }), 60);
    return () => clearTimeout(t);
  }, [view, selectedId, lanes]);

  /* 게이트로 돌아오면 눌렀던 게이트 카드로 포커스 복귀 */
  useEffect(() => {
    if (view !== "gate") return;
    const el = gateRef.current;
    const raf = requestAnimationFrame(() => el?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [view]);

  /** 링크는 Space 로 눌리지 않지만 이 카드는 disclosure 이기도 하다 — 관례대로 Space 도 받는다 */
  const onCardKeyDown = (id: string) => (e: React.KeyboardEvent) => {
    if (e.key !== " " || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    select(id, true);
  };

  return (
    <div
      className={`${s.wrap}${selected ? ` ${s.wrapSelected}` : ""}`}
      data-hero-lanes
      data-view={selected ? "selected" : view}
      data-selected={selected ? "" : undefined}
    >
      {/* ── ① 게이트 — 두 갈래 ── */}
      <div className={s.gate} hidden={view !== "gate"} inert={view !== "gate" ? true : undefined}>
        <ul className={s.gateTrack} aria-label="시작 방식 고르기">
          {gates.map((gate, i) => (
            <li key={gate.id} className={s.gateItem}>
              <Link
                ref={i === 0 ? gateRef : undefined}
                href={gate.href}
                className={`${s.card} ${s.gateCard}`}
                data-track={`journey_gate:${gate.id}`}
                aria-expanded={i === 0 ? view !== "gate" : undefined}
                onClick={i === 0 ? onGateClick : undefined}
                prefetch={false}
              >
                <span className={s.art} aria-hidden="true">
                  {gate.hasImage && (
                    <Image src={gate.image} alt="" fill sizes="(min-width: 1024px) 260px, 46vw" className={s.image} />
                  )}
                </span>
                <span className={s.body}>
                  <span className={s.title}>{gate.label}</span>
                  <span className={s.desc}>{gate.desc}</span>
                </span>
                <span className={s.corner} aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
                {gate.hasImage && <span className={s.srOnly}>{gate.alt}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* ── ② 레인 카드 5장 ── */}
      <div
        className={s.cards}
        hidden={view !== "lanes"}
        inert={view !== "lanes" || selected ? true : undefined}
      >
        <button
          ref={lanesBackRef}
          type="button"
          className={`${s.back} ${s.lanesBack}`}
          onClick={() => setView("gate")}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          뒤로
        </button>
        <ul ref={trackRef} className={s.track} aria-label="시작 유형 고르기">
          {lanes.map((lane) => (
            <li key={lane.id} className={s.item}>
              <Link
                ref={(el) => {
                  if (el) cardRefs.current.set(lane.id, el);
                  else cardRefs.current.delete(lane.id);
                }}
                href={lane.href}
                className={s.card}
                /* 카드 클릭은 "고름" — 실제 이동은 선택 화면의 탐색하기(journey_lanes:<id>)가 센다.
                   같은 이벤트(landing_cta_click)에 라벨만 달리해 새 이벤트를 만들지 않는다 */
                data-track={`journey_lanes_pick:${lane.id}`}
                aria-expanded={lane.id === selectedId}
                aria-controls={PANEL_ID}
                onClick={onCardClick(lane.id)}
                onKeyDown={onCardKeyDown(lane.id)}
                prefetch={false}
              >
                <span className={s.art} aria-hidden="true">
                  {lane.hasImage && (
                    <Image
                      src={lane.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 240px, 60vw"
                      className={s.image}
                    />
                  )}
                </span>
                <span className={s.body}>
                  <span className={s.title}>{lane.label}</span>
                  <span className={s.desc}>{lane.desc}</span>
                </span>
                <span className={s.corner} aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
                {lane.hasImage && <span className={s.srOnly}>{lane.alt}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {!selected && (
          <SnapDots
            trackRef={trackRef}
            count={lanes.length}
            label="시작 유형 카드 위치"
            itemLabel={(i) => `${lanes[i].label} 카드로`}
            tone="onDark"
            className={s.dots}
          />
        )}
      </div>

      {/* ── 선택 화면 ── */}
      <div
        id={PANEL_ID}
        className={s.screen}
        role="region"
        aria-label="고른 여정 안내"
        hidden={!selected}
      >
        {selected && (
          <>
            {/* 화살표마다 패널 전체가 다시 읽히지 않게, 바뀐 사실만 한 줄로 알린다 (9/29 QA) */}
            <span className={s.srOnly} role="status" aria-live="polite">
              {`${selected.label}, ${lanes.length}개 중 ${index + 1}번째`}
            </span>
            <button ref={backRef} type="button" className={s.back} onClick={() => select(null)}>
              <ArrowLeft size={18} aria-hidden="true" />
              뒤로
            </button>

            <div className={s.stage}>
              {/* 포스터 — 레인이 바뀌면 key 로 재마운트해 글로우·페이드를 다시 태운다 */}
              <div className={s.poster} key={selected.id}>
              {/* 글로우 링 — 카드보다 3px 큰 뒤판이 회전하고, 안쪽은 카드가 덮어 테두리만 빛난다 */}
              <span className={s.glow} aria-hidden="true" />
              <span className={s.glowBlur} aria-hidden="true" />
              <Link
                href={selected.href}
                className={s.bigCard}
                data-track={`journey_lanes:${selected.id}`}
                data-assess-entry={selected.id === "undecided" ? "landing_lane" : undefined}
                prefetch={false}
              >
                <span className={s.art} aria-hidden="true">
                  {selected.hasImage && (
                    <Image
                      src={selected.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 320px, 45vw"
                      className={s.image}
                    />
                  )}
                </span>
                <span className={s.body}>
                  <span className={s.title}>{selected.label}</span>
                  <span className={s.desc}>{selected.desc}</span>
                </span>
                {selected.hasImage && <span className={s.srOnly}>{selected.alt}</span>}
              </Link>
              </div>

              {/* 이전/다음 — 뒤로 가지 않고 다른 여정으로 (9/29 S5 회장). 양 끝 순환 */}
              <div className={s.stepNav}>
                <button
                  type="button"
                  className={s.stepBtn}
                  aria-label={`이전: ${prevLane?.label}`}
                  data-track={`journey_lanes_nav:${prevLane?.id}`}
                  onClick={() => prevLane && select(prevLane.id)}
                >
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <span className={s.stepCount}>
                  <b>{index + 1}</b> / {lanes.length}
                </span>
                <button
                  type="button"
                  className={s.stepBtn}
                  aria-label={`다음: ${nextLane?.label}`}
                  data-track={`journey_lanes_nav:${nextLane?.id}`}
                  onClick={() => nextLane && select(nextLane.id)}
                >
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* 배경 없는 캐릭터(투명 webp) — 텍스트 컬럼 바로 옆에 전체 높이로 선다 */}
            <span className={s.charStage} key={`char-${selected.id}`} data-lane-char aria-hidden="true">
              {selected.hasChar && (
                <Image
                  src={selected.charImage}
                  alt=""
                  fill
                  /* contain 이라 실제로 그려지는 폭은 높이의 약 0.5배(세로 컷아웃) —
                     요소 박스 기준으로 잡으면 몇 배 큰 파일을 내려받는다 */
                  sizes="(min-width: 1024px) 260px, 150px"
                  className={s.charImage}
                />
              )}
            </span>

            {/* 텍스트 컬럼 — 데스크탑은 세로 가운데 한 묶음, 모바일은 display:contents 로 화면 그리드에 펼쳐진다 */}
            <div className={s.textCol}>
              <div className={s.copy} key={`copy-${selected.id}`}>
                <h3 className={s.panelTitle}>{selected.label}</h3>
                <p className={s.panelIntro}>{selected.intro}</p>
              </div>
              <ul className={s.tiles} key={`tiles-${selected.id}`}>
                {tiles.map((t) => (
                  <li key={t.label} className={s.tile}>
                    <span className={s.tileValue}>{t.value}</span>
                    <span className={s.tileLabel}>{t.label}</span>
                    <span className={s.tileSource}>{t.source}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={selected.href}
                className={s.go}
                data-track={`journey_lanes:${selected.id}`}
                data-assess-entry={selected.id === "undecided" ? "landing_lane" : undefined}
                prefetch={false}
              >
                탐색하기
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
