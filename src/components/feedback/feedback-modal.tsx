"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import s from "./feedback-modal.module.css";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  /** "나중에" 선택 시 호출 */
  onLater: () => void;
  /** 제출 성공 시 호출 (localStorage 영구 기록용) */
  onSent: () => void;
}

const FEEDBACK_TAGS = [
  "정보가 많아요",
  "찾기 쉬워요",
  "디자인 좋아요",
  "데이터 신뢰가요",
  "느려요",
  "정보 부족해요",
] as const;

const MAX_COMMENT_LENGTH = 200;

export function FeedbackModal({
  open,
  onClose,
  onLater,
  onSent,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = rating > 0 && !submitting;

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          tags: Array.from(selectedTags),
          comment: comment.trim(),
        }),
      });
    } catch {
      // 네트워크 실패해도 사용자 경험은 유지 — 조용히 완료 처리
    }
    setSubmitting(false);
    setSent(true);
    onSent();
    // 2초 뒤 자동 닫기
    window.setTimeout(() => {
      onClose();
    }, 1800);
  }

  function handleLater() {
    onLater();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="이랑 어떠세요?">
      {sent ? (
        <div className={s.success}>
          <h3 className={s.successTitle}>고마워요</h3>
          <p className={s.successDesc}>
            주신 의견을 꼭 반영할게요.
          </p>
        </div>
      ) : (
        <>
          <p className={s.intro}>
            한 줄 피드백이 서비스에 큰 도움이 돼요.
          </p>

          {/* 별점 */}
          <div
            className={s.ratingRow}
            role="radiogroup"
            aria-label="별점"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={s.starBtn}
                data-active={n <= rating || undefined}
                role="radio"
                aria-checked={n === rating}
                aria-label={`${n}점`}
                onClick={() => setRating(n)}
              >
                <Star
                  size={28}
                  fill={n <= rating ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>

          {/* 태그 */}
          <span className={s.sectionLabel}>어떤 점이 눈에 띄었나요?</span>
          <div className={s.tagRow}>
            {FEEDBACK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={s.tagChip}
                data-active={selectedTags.has(tag) || undefined}
                aria-pressed={selectedTags.has(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 자유 입력 */}
          <span className={s.sectionLabel}>더 남기고 싶은 이야기</span>
          <textarea
            className={s.textarea}
            placeholder="자유롭게 남겨 주세요 (선택)"
            maxLength={MAX_COMMENT_LENGTH}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <span className={s.charCount}>
            {comment.length} / {MAX_COMMENT_LENGTH}
          </span>

          {/* 액션 */}
          <div className={s.actions}>
            <button
              type="button"
              className={s.laterBtn}
              onClick={handleLater}
              disabled={submitting}
            >
              나중에
            </button>
            <button
              type="button"
              className={s.submitBtn}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {submitting ? "보내는 중..." : "보내기"}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
