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
  /**
   * 본문(.body) 스타일 변형.
   * - default: padding 20/24/24 (모바일 16/16/20) + overflow-y:auto — 일반 콘텐츠용
   * - flush: padding 0 + overflow:hidden + display:flex column — 자식이 자체 스크롤·sticky 영역을 가질 때 (예: BottomSheetFilter)
   *
   * 5/21 박제 — BottomSheetFilter 옵션 17개 스크롤 미작동 fix.
   * Modal body의 overflow-y:auto가 자식의 내부 스크롤 컨테이너와 충돌해 sticky CTA cutoff 발생.
   * flush 모드는 padding을 child에 위임하고 overflow는 child가 직접 관리.
   */
  bodyVariant?: "default" | "flush";
  /**
   * 모바일(< 640px) max-height 확장. 기본 90dvh.
   * "tall" → 95dvh (5/21 회장 결재 — BottomSheetFilter 앵커 패턴: 모든 그룹 동시 노출로 영역 증가).
   * 다른 모달(PopulationModal·AreaModal 등 단순 콘텐츠)에 영향 주지 않도록 prop 분리.
   */
  mobileHeight?: "default" | "tall";
}

const ANIMATION_DURATION = 150; // ms — overlayOut / panelOut duration
const DRAG_DISMISS_THRESHOLD = 100; // px — 이 이상 아래로 드래그하면 닫기

export function Modal({ open, onClose, title, children, bodyVariant = "default", mobileHeight = "default" }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const dragDeltaY = useRef(0);

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

  // body 스크롤 방지 + 드래그 인라인 스타일 초기화
  useEffect(() => {
    if (!open) return;

    // 이전 드래그로 남은 인라인 스타일 초기화
    if (panelRef.current) {
      panelRef.current.style.transform = "";
      panelRef.current.style.transition = "";
    }
    if (overlayRef.current) {
      overlayRef.current.style.background = "";
      overlayRef.current.style.transition = "";
    }
    dragStartY.current = null;
    dragDeltaY.current = 0;

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

  // iOS Safari URL bar 변동 대응 — visualViewport 기반 동적 max-height
  // dvh가 일부 iOS 버전에서 정확하지 않은 문제를 우회
  useEffect(() => {
    if (!open) return;

    const updateMaxHeight = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const vv = window.visualViewport;
      const height = vv?.height ?? window.innerHeight;
      const isMobile = window.matchMedia("(max-width: 639px)").matches;
      // 모바일: default 0.9 / tall 0.95 (BottomSheetFilter 앵커 패턴 — 더 큰 영역)
      const mobileRatio = mobileHeight === "tall" ? 0.95 : 0.9;
      const ratio = isMobile ? mobileRatio : 0.8;
      panel.style.maxHeight = `${Math.floor(height * ratio)}px`;
    };

    updateMaxHeight();

    // ref capture: cleanup 시점에 panelRef.current가 다른 elem을 가리킬 수 있어
    // effect 본문에서 capture 후 cleanup에서 사용 (React useEffect 표준 패턴)
    const panel = panelRef.current;
    const vv = window.visualViewport;
    vv?.addEventListener("resize", updateMaxHeight);
    vv?.addEventListener("scroll", updateMaxHeight);
    window.addEventListener("orientationchange", updateMaxHeight);

    return () => {
      vv?.removeEventListener("resize", updateMaxHeight);
      vv?.removeEventListener("scroll", updateMaxHeight);
      window.removeEventListener("orientationchange", updateMaxHeight);
      if (panel) {
        panel.style.maxHeight = "";
      }
    };
  }, [open, mobileHeight]);

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

  // ── 모바일 바텀시트 드래그 핸들러 ──
  const handleDragStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    dragDeltaY.current = 0;
    // 드래그 중 패널 transition 제거
    if (panelRef.current) {
      panelRef.current.style.transition = "none";
    }
  }, []);

  const handleDragMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    // 아래로만 드래그 허용
    const clampedDelta = Math.max(0, delta);
    dragDeltaY.current = clampedDelta;

    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${clampedDelta}px)`;
    }
    // 오버레이 opacity도 드래그 비율에 따라 감소
    if (overlayRef.current) {
      const progress = Math.min(clampedDelta / 300, 1);
      overlayRef.current.style.background = `rgba(0, 0, 0, ${0.4 * (1 - progress * 0.6)})`;
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;

    if (dragDeltaY.current > DRAG_DISMISS_THRESHOLD) {
      // 임계치 초과 → 닫기
      handleClose();
    } else {
      // 원위치 복원 (spring 애니메이션)
      if (panelRef.current) {
        panelRef.current.style.transition = "transform 250ms cubic-bezier(0.16, 1, 0.3, 1)";
        panelRef.current.style.transform = "translateY(0)";
      }
      if (overlayRef.current) {
        overlayRef.current.style.transition = "background 250ms ease-out";
        overlayRef.current.style.background = "";
      }
    }
    dragDeltaY.current = 0;
  }, [handleClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      ref={overlayRef}
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
        data-mobile-height={mobileHeight}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        {/* 드래그 핸들 (모바일 바텀시트 전용, 데스크탑에서는 CSS로 숨김) */}
        <div
          className={s.dragHandle}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          aria-hidden="true"
        >
          <div className={s.dragBar} />
        </div>

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
        <div className={bodyVariant === "flush" ? s.bodyFlush : s.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
