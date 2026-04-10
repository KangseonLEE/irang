"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import s from "./modal.module.css";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ANIMATION_DURATION = 150; // ms — overlayOut / panelOut duration

export function Modal({ open, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  // SSR-safe: createPortal은 클라이언트에서만 동작
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 닫기를 애니메이션과 함께 처리
  const handleClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, ANIMATION_DURATION);
  }, [closing, onClose]);

  // body 스크롤 방지
  useEffect(() => {
    if (!open) return;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // 포커스 관리: 열릴 때 패널로, 닫힐 때 이전 요소로 복원
  useEffect(() => {
    if (!open) return;
    previousActiveRef.current = document.activeElement as HTMLElement | null;

    // 다음 프레임에 포커스 (portal 렌더링 후)
    const raf = requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      previousActiveRef.current?.focus();
    };
  }, [open]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open || closing) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, closing, handleClose]);

  // 포커스 트랩
  useEffect(() => {
    if (!open || closing) return;

    function handleTab(e: KeyboardEvent) {
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open, closing]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className={s.overlay}
      data-closing={closing || undefined}
      onClick={(e) => {
        // 오버레이(자기 자신) 클릭 시에만 닫기
        if (e.target === e.currentTarget) handleClose();
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        className={s.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        {/* 헤더 */}
        <div className={s.header}>
          <h2 className={s.title}>{title}</h2>
          <button
            type="button"
            className={s.closeBtn}
            onClick={handleClose}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 */}
        <div className={s.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
