"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  markFeedbackDismissed,
  markFeedbackLater,
  markFeedbackSent,
  shouldShowFeedback,
} from "@/lib/feedback-session";
import { FeedbackModal } from "./feedback-modal";

/**
 * 전역 피드백 트리거
 *
 * - layout에 1회만 마운트
 * - 사용자가 `/` 또는 `/more`로 돌아올 때, 세션 내 의미있는 이벤트가
 *   2회 이상 발생했으면 피드백 모달을 띄움
 * - 영구 노출 플래그는 localStorage, 이벤트 카운트는 sessionStorage
 */

/** 트리거 대상 경로 — "홈으로 돌아옴" 시점 */
const TRIGGER_PATHS = new Set<string>(["/", "/more"]);

/** 진입 후 모달을 띄우기까지의 지연 (사용자 당황 방지) */
const DELAY_MS = 1500;

export function FeedbackTrigger() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  /** 종료 사유 — X/오버레이면 "dismissed", 버튼이면 각 마커가 이미 기록함 */
  const resolvedRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!pathname || !TRIGGER_PATHS.has(pathname)) return;
    if (open) return;
    if (!shouldShowFeedback()) return;

    const timer = window.setTimeout(() => {
      // 타이머 발동 시점에 다시 확인 — 그 사이 조건이 바뀌었을 수 있음
      if (shouldShowFeedback()) {
        setOpen(true);
      }
    }, DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mounted, pathname, open]);

  if (!mounted) return null;

  return (
    <FeedbackModal
      open={open}
      onClose={() => {
        setOpen(false);
        // 버튼으로 종료(later/sent)된 경우가 아니면 "닫기"로 간주
        if (!resolvedRef.current) {
          markFeedbackDismissed();
        }
        resolvedRef.current = false;
      }}
      onLater={() => {
        resolvedRef.current = true;
        markFeedbackLater();
      }}
      onSent={() => {
        resolvedRef.current = true;
        markFeedbackSent();
      }}
    />
  );
}
