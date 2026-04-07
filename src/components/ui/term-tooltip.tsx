"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { findGlossaryEntry } from "@/lib/data/glossary";
import s from "./term-tooltip.module.css";

/* ==========================================================================
   TermTooltip
   데스크탑: CSS :hover 인라인 팝업
   모바일:   클릭 → Portal 말풍선 (용어 위치 기준 자동 배치)
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

const POPOVER_GAP = 8; // 용어와 말풍선 사이 간격(px)
const VIEWPORT_PAD = 12; // 화면 가장자리 여백(px)

export function TermTooltip({ term, description, glossarySlug }: TermTooltipProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const termRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 위치 계산
  const calcPosition = useCallback(() => {
    const termEl = termRef.current;
    const popEl = popoverRef.current;
    if (!termEl || !popEl) return;

    const rect = termEl.getBoundingClientRect();
    const popRect = popEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.visualViewport?.height ?? window.innerHeight;

    // 좌우 위치: 용어 중앙 기준, 화면 밖으로 나가지 않도록 보정
    const termCenterX = rect.left + rect.width / 2;
    let left = termCenterX - popRect.width / 2;
    left = Math.max(VIEWPORT_PAD, Math.min(left, vw - popRect.width - VIEWPORT_PAD));

    // 화살표: 용어 중앙 위치 (popover 왼쪽 기준 상대 좌표)
    const arrowLeft = Math.max(12, Math.min(termCenterX - left, popRect.width - 12));

    // 위/아래 판단: 위 공간이 부족하면 아래로
    const spaceAbove = rect.top;
    const spaceBelow = vh - rect.bottom;

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

  // open 시 위치 계산 + 스크롤/리사이즈 시 닫기
  useEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }

    // 첫 프레임에 위치 계산
    requestAnimationFrame(calcPosition);

    const handleClose = () => setOpen(false);
    window.addEventListener("scroll", handleClose, { passive: true });
    window.addEventListener("resize", handleClose);

    return () => {
      window.removeEventListener("scroll", handleClose);
      window.removeEventListener("resize", handleClose);
    };
  }, [open, calcPosition]);

  // 외부 클릭/터치 시 닫기
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((prev) => !prev);
  };

  return (
    <span className={s.wrapper}>
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

      {/* 데스크탑: 인라인 호버 툴팁 */}
      <span className={s.tooltip} role="tooltip">
        {description}
        {glossarySlug && (
          <a
            href={`/glossary#${glossarySlug}`}
            className={s.tooltipLink}
            onClick={(e) => e.stopPropagation()}
          >
            자세히 →
          </a>
        )}
      </span>

      {/* 모바일: Portal 말풍선 (용어 근처에 배치) */}
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
