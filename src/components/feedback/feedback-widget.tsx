"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { getPageName } from "@/lib/page-names";
import s from "./feedback-widget.module.css";

type Rating = "good" | "neutral" | "bad";

interface RatingOption {
  value: Rating;
  emoji: string;
  label: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { value: "good", emoji: "\u{1F60A}", label: "좋아요" },
  { value: "neutral", emoji: "\u{1F610}", label: "보통" },
  { value: "bad", emoji: "\u{1F622}", label: "아쉬워요" },
];

const MAX_MESSAGE_LENGTH = 300;

/**
 * /api/quick-feedback 으로 피드백 저장 (fire-and-forget).
 * - service_role 경유 INSERT (search-log와 동일 패턴)
 * - anon Supabase client는 RLS로 차단됨 (5/4 hardening)
 */
async function saveFeedback(data: {
  rating: Rating;
  message: string;
  page: string;
}): Promise<void> {
  try {
    await fetch("/api/quick-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: data.rating,
        message: data.message,
        page: data.page,
      }),
    });
  } catch {
    // fire-and-forget — 네트워크 실패는 조용히 무시
  }
}

export function FeedbackWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR hydration 우회 표준 패턴
  useEffect(() => { setMounted(true); }, []);

  const resetForm = useCallback(() => {
    setRating(null);
    setMessage("");
    setSubmitting(false);
    setSent(false);
  }, []);

  const handleOpen = useCallback(() => {
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!rating || submitting) return;
    setSubmitting(true);

    await saveFeedback({
      rating,
      message: message.trim(),
      page: getPageName(pathname ?? "/"),
    });

    setSubmitting(false);
    setSent(true);

    // 2초 후 자동 닫기
    window.setTimeout(() => {
      setOpen(false);
    }, 2000);
  }, [rating, message, submitting, pathname]);

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        className={s.fab}
        onClick={handleOpen}
        aria-label="피드백 보내기"
      >
        <MessageCircle size={20} aria-hidden="true" />
      </button>

      <Modal open={open} onClose={handleClose} title="의견 보내기">
        {sent ? (
          <div className={s.success}>
            <span className={s.successEmoji} aria-hidden="true">
              {"\u{1F64F}"}
            </span>
            <h3 className={s.successTitle}>소중한 의견 감사해요!</h3>
            <p className={s.successDesc}>
              더 나은 서비스를 만드는 데 큰 힘이 돼요.
            </p>
          </div>
        ) : (
          <>
            <p className={s.intro}>
              이랑을 사용하면서 느낀 점을 알려주세요.
            </p>

            {/* 이모지 선택 */}
            <div
              className={s.emojiRow}
              role="radiogroup"
              aria-label="만족도"
            >
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={s.emojiBtn}
                  data-active={rating === opt.value || undefined}
                  role="radio"
                  aria-checked={rating === opt.value}
                  aria-label={opt.label}
                  onClick={() => setRating(opt.value)}
                >
                  <span className={s.emoji} aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <span className={s.emojiLabel}>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* 텍스트 입력 */}
            <textarea
              className={s.textarea}
              placeholder="더 나은 서비스를 위해 의견을 남겨주세요"
              maxLength={MAX_MESSAGE_LENGTH}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <span className={s.pagePath}>
              현재 페이지: {getPageName(pathname ?? "/")}
            </span>

            {/* 제출 */}
            <button
              type="button"
              className={s.submitBtn}
              onClick={handleSubmit}
              disabled={!rating || submitting}
            >
              {submitting ? "보내는 중..." : "보내기"}
            </button>
          </>
        )}
      </Modal>
    </>
  );
}
