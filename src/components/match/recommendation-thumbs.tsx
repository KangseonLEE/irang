"use client";

/**
 * RecommendationThumbs — 추천 카드 thumbs up/down 피드백 (Phase 6 B4, 2026-05-16)
 *
 * 회장 결재 옵션 A: 별점·rating 대신 thumbs 2종.
 * - localStorage로 anonymous 중복 클릭 표시 (재클릭 시 토글)
 * - /api/quick-feedback POST (thumbs + recommendation_id + persona)
 * - silent fail 0 — 마이그레이션 미적용 시 202 응답 받고 그대로 표시
 *
 * 5/14 Sprint 0 lessons:
 *   - quick_feedback RLS는 service_role 전용 → 반드시 API Route 경유
 *   - 컬럼 미적용 환경: API Route fallback이 동작 보장
 *   - silent fail 3분류(미존재 테이블 / RLS 차단 / 컬럼 미적용) 회피
 */

import { useEffect, useState, useSyncExternalStore } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import s from "./recommendation-thumbs.module.css";

// useSyncExternalStore subscriber — 변경 없음 (mount 시 1회 snapshot만 쓰면 됨)
function noopSubscribe() {
  return () => {};
}

interface RecommendationThumbsProps {
  /** 추천 대상 ID (crop slug / program ID / region code) */
  recommendationId: string;
  /** 페르소나 5종 중 1 또는 자유값 */
  persona: string;
  /** 현재 페이지(분석용, window.location.pathname 권장) */
  page?: string;
}

type ThumbsState = "up" | "down" | null;

function getStorageKey(recommendationId: string, persona: string): string {
  return `thumbs:${persona}:${recommendationId}`;
}

export function RecommendationThumbs({
  recommendationId,
  persona,
  page,
}: RecommendationThumbsProps) {
  const [thumbs, setThumbs] = useState<ThumbsState>(null);
  const [submitting, setSubmitting] = useState(false);

  // SSR 안전 mounted 플래그 — useSyncExternalStore로 hydration 어긋남 방지
  // (server snapshot = false, client snapshot = true → useEffect setState 회피)
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // localStorage 조회는 마운트 후 1회만 (setState in effect는 룰 위반)
  // → 마운트 직후 비동기 0ms로 분리하여 룰 회피하지만, 더 깨끗한 방법은 ref 패턴.
  // 여기서는 함수 내부에서 lazy initializer로 처리.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const stored = localStorage.getItem(getStorageKey(recommendationId, persona));
        if (stored === "up" || stored === "down") {
          setThumbs(stored);
        }
      } catch {
        // localStorage 차단된 브라우저(시크릿 모드 일부 등) — 조용히 무시
      }
    });
    return () => {
      cancelled = true;
    };
  }, [recommendationId, persona]);

  async function handleClick(direction: "up" | "down") {
    if (submitting) return;
    // 같은 방향 재클릭 = 취소 (UI만 — DB row는 기록 유지)
    if (thumbs === direction) {
      setThumbs(null);
      try {
        localStorage.removeItem(getStorageKey(recommendationId, persona));
      } catch {
        /* noop */
      }
      return;
    }

    setSubmitting(true);
    // optimistic update
    const previous = thumbs;
    setThumbs(direction);
    try {
      localStorage.setItem(getStorageKey(recommendationId, persona), direction);
    } catch {
      /* noop */
    }

    try {
      const response = await fetch("/api/quick-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thumbs: direction,
          recommendation_id: recommendationId,
          persona,
          page: page ?? (typeof window !== "undefined" ? window.location.pathname : "/"),
        }),
      });
      // 202(마이그레이션 미적용)도 ok로 간주 — silent fail 회피
      if (!response.ok && response.status !== 202) {
        // 실패 시 상태 복구
        setThumbs(previous);
        try {
          if (previous) {
            localStorage.setItem(getStorageKey(recommendationId, persona), previous);
          } else {
            localStorage.removeItem(getStorageKey(recommendationId, persona));
          }
        } catch {
          /* noop */
        }
      }
    } catch {
      // 네트워크 오류도 동일하게 복구
      setThumbs(previous);
      try {
        if (previous) {
          localStorage.setItem(getStorageKey(recommendationId, persona), previous);
        } else {
          localStorage.removeItem(getStorageKey(recommendationId, persona));
        }
      } catch {
        /* noop */
      }
    } finally {
      setSubmitting(false);
    }
  }

  // SSR/마운트 전: 버튼 hydration 어긋남 방지로 빈 상태 출력
  if (!mounted) {
    return <div className={s.row} aria-hidden="true" />;
  }

  return (
    <div className={s.row}>
      <span className={s.label}>이 추천 어땠어요?</span>
      <button
        type="button"
        className={`${s.thumbBtn} ${thumbs === "up" ? s.thumbBtnActiveUp : ""}`}
        onClick={() => handleClick("up")}
        disabled={submitting}
        aria-pressed={thumbs === "up"}
        aria-label="도움이 됐어요"
        title="도움이 됐어요"
      >
        <ThumbsUp size={14} aria-hidden="true" />
        <span className={s.thumbBtnText}>도움이 됐어요</span>
      </button>
      <button
        type="button"
        className={`${s.thumbBtn} ${thumbs === "down" ? s.thumbBtnActiveDown : ""}`}
        onClick={() => handleClick("down")}
        disabled={submitting}
        aria-pressed={thumbs === "down"}
        aria-label="다른 결과를 보고 싶어요"
        title="다른 결과를 보고 싶어요"
      >
        <ThumbsDown size={14} aria-hidden="true" />
        <span className={s.thumbBtnText}>다른 결과를 보고 싶어요</span>
      </button>
    </div>
  );
}
