"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { findGlossaryEntry } from "@/lib/data/glossary";
import s from "./term-tooltip.module.css";

/* ==========================================================================
   TermTooltip
   모든 기기: Portal 기반 동적 배치 (뷰포트 경계 자동 보정)
   마우스:   hover 로 미리보기, 클릭하면 고정(마우스가 떠나도 유지) — 고정된 것을 다시 클릭하면 닫힘
   터치·펜:  탭으로 열기 / 다시 탭·바깥 탭으로 닫기 (hover 열기 없음)
   키보드:   Enter·Space 열기·닫기, Esc 닫기

   10/6 QA(Q4-W8): 예전엔 hover 와 click 이 같은 토글을 공유했다.
   - 데스크탑: hover 로 열린 뒤 클릭하면 토글이라 닫혔다.
   - 터치: 탭이 만드는 호환 mouseenter 가 먼저 열고 이어진 click 이 토글로 닫아, 첫 탭은 반응이 없고 두 번째 탭에 열렸다.
   → hover 열기는 pointerType "mouse" 에서만, click 은 "고정해서 열기"(이미 고정된 상태에서만 닫기).
   ========================================================================== */

interface TermTooltipProps {
  term: string;
  description: string;
  glossarySlug?: string;
}

interface PopoverPos {
  top: number;
  left: number;
  arrowLeft: number;
  placement: "above" | "below";
}

const POPOVER_GAP = 8;
const VIEWPORT_PAD = 12;

export function TermTooltip({ term, description, glossarySlug }: TermTooltipProps) {
  const [open, setOpen] = useState(false);
  /** 클릭·탭·키보드로 연 상태 — hover 로 연 미리보기와 달리 마우스가 떠나도 닫히지 않는다 */
  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const termRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  /** 닫기는 고정도 함께 푼다 — 다음 hover 미리보기가 고정으로 남지 않게 */
  const close = useCallback(() => {
    setOpen(false);
    setPinned(false);
  }, []);

  // ── 위치 계산 (뷰포트 경계 자동 보정) ──
  const calcPosition = useCallback(() => {
    const termEl = termRef.current;
    const popEl = popoverRef.current;
    if (!termEl || !popEl) return;

    const rect = termEl.getBoundingClientRect();
    const popRect = popEl.getBoundingClientRect();
    const vw = window.innerWidth;

    // 좌우: 용어 중앙 기준, 화면 밖으로 나가지 않도록 보정
    const termCenterX = rect.left + rect.width / 2;
    let left = termCenterX - popRect.width / 2;
    left = Math.max(VIEWPORT_PAD, Math.min(left, vw - popRect.width - VIEWPORT_PAD));

    // 화살표: 용어 중앙 위치 (popover 왼쪽 기준 상대 좌표)
    const arrowLeft = Math.max(12, Math.min(termCenterX - left, popRect.width - 12));

    // 위/아래 판단: 위 공간이 부족하면 아래로
    const spaceAbove = rect.top;

    let placement: "above" | "below";
    let top: number;

    if (spaceAbove >= popRect.height + POPOVER_GAP + 20) {
      placement = "above";
      top = rect.top - popRect.height - POPOVER_GAP + window.scrollY;
    } else {
      placement = "below";
      top = rect.bottom + POPOVER_GAP + window.scrollY;
    }

    setPos({ top, left, arrowLeft, placement });
  }, []);

  // ── open 시 위치 계산 + 스크롤/리사이즈 시 닫기 ──
  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPos(null);
      return;
    }

    requestAnimationFrame(calcPosition);

    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
  }, [open, calcPosition, close]);

  // ── 외부 클릭/터치 시 닫기 ──
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        termRef.current && !termRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        close();
      }
    };

    document.addEventListener("touchstart", handleOutside, { passive: true });
    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [open, close]);

  // ── 호버 핸들러 (마우스만) — 터치 탭이 만드는 호환 mouse 이벤트·펜은 무시 ──
  const handlePointerEnter = useCallback((e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    clearTimeout(hoverTimeout.current);
    setOpen(true);
  }, []);

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || pinned) return;
      // 짧은 딜레이: 용어 → 팝오버로 마우스 이동 시 깜빡임 방지
      hoverTimeout.current = setTimeout(close, 120);
    },
    [pinned, close],
  );

  /** 클릭·탭·Enter — 열기(고정). 이미 고정돼 열려 있을 때만 닫는다(hover 로 열린 미리보기를 누르면 고정) */
  const togglePinned = () => {
    clearTimeout(hoverTimeout.current);
    if (open && pinned) {
      close();
      return;
    }
    setPinned(true);
    setOpen(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    togglePinned();
  };

  return (
    <span
      className={s.wrapper}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <span
        ref={termRef}
        className={s.term}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            togglePinned();
          }
          if (e.key === "Escape") close();
        }}
      >
        {term}
      </span>

      {/* Portal 기반 팝오버 (모든 기기 공통) */}
      {mounted &&
        open &&
        createPortal(
          <div
            ref={popoverRef}
            className={`${s.popover} ${pos ? s.popoverVisible : ""} ${
              pos?.placement === "below" ? s.popoverBelow : ""
            }`}
            style={
              pos
                ? { top: pos.top, left: pos.left }
                : { top: 0, left: -9999 }
            }
            onClick={(e) => e.stopPropagation()}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
          >
            <p className={s.popoverText}>{description}</p>
            {glossarySlug && (
              <a
                href={`/glossary#${glossarySlug}`}
                className={s.popoverLink}
              >
                자세히 →
              </a>
            )}
            {/* 화살표 */}
            <span
              className={`${s.popoverArrow} ${
                pos?.placement === "below" ? s.popoverArrowUp : ""
              }`}
              style={pos ? { left: pos.arrowLeft } : undefined}
            />
          </div>,
          document.body,
        )}
    </span>
  );
}

/** Convenience wrapper using glossary data */
export function GlossaryTerm({ term }: { term: string }) {
  const entry = findGlossaryEntry(term);
  if (!entry) return <span>{term}</span>;
  return (
    <TermTooltip
      term={entry.term}
      description={entry.shortDesc}
      glossarySlug={entry.slug}
    />
  );
}
