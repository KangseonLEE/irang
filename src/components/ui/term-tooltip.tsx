"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { findGlossaryEntry } from "@/lib/data/glossary";
import s from "./term-tooltip.module.css";

/* ==========================================================================
   TermTooltip
   모든 기기: Portal 기반 동적 배치 (뷰포트 경계 자동 보정)
   데스크탑: hover 트리거
   모바일:   click/tap 트리거
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
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const termRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
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

    const handleClose = () => setOpen(false);
    window.addEventListener("scroll", handleClose, { passive: true });
    window.addEventListener("resize", handleClose);

    return () => {
      window.removeEventListener("scroll", handleClose);
      window.removeEventListener("resize", handleClose);
    };
  }, [open, calcPosition]);

  // ── 외부 클릭/터치 시 닫기 ──
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        termRef.current && !termRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("touchstart", handleOutside, { passive: true });
    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("touchstart", handleOutside);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [open]);

  // ── 호버 핸들러 (데스크탑) ──
  const handleMouseEnter = useCallback(() => {
    clearTimeout(hoverTimeout.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // 짧은 딜레이: 용어 → 팝오버로 마우스 이동 시 깜빡임 방지
    hoverTimeout.current = setTimeout(() => setOpen(false), 120);
  }, []);

  // ── 클릭 핸들러 (모바일 + 키보드) ──
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <span
      className={s.wrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        ref={termRef}
        className={s.term}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
          if (e.key === "Escape") setOpen(false);
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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
