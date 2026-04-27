"use client";

import { useState, useCallback } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { getSupabase } from "@/lib/supabase";
import s from "./request-modal.module.css";

const MAX_MESSAGE_LENGTH = 200;

interface RequestModalProps {
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 자동 채워지는 키워드 (검색어 등) */
  keyword?: string;
  /** 요청 종류 라벨 (예: "정보", "작물", "지원사업") */
  category?: string;
  /** 피드백 저장 시 page 필드 값 */
  pageName: string;
}

async function saveRequest(data: {
  message: string;
  page: string;
}): Promise<void> {
  try {
    const sb = getSupabase();
    if (sb) {
      await sb.from("quick_feedback").insert({
        rating: "neutral",
        message: data.message,
        page: data.page,
        created_at: new Date().toISOString(),
      });
      return;
    }
  } catch {
    // Supabase 실패 시 API 폴백
  }

  try {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "quick",
        rating: "neutral",
        message: data.message,
        page: data.page,
      }),
    });
  } catch {
    // fire-and-forget
  }
}

export function RequestModal({
  open,
  onClose,
  keyword = "",
  category = "정보",
  pageName,
}: RequestModalProps) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const resetForm = useCallback(() => {
    setMessage("");
    setSubmitting(false);
    setSent(false);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    // 닫은 후 폼 리셋 (애니메이션 후)
    window.setTimeout(resetForm, 200);
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    const prefix = keyword ? `[${category} 요청: ${keyword}]` : `[${category} 요청]`;
    const fullMessage = message.trim()
      ? `${prefix} ${message.trim()}`
      : prefix;

    await saveRequest({
      message: fullMessage,
      page: pageName,
    });

    setSubmitting(false);
    setSent(true);

    window.setTimeout(handleClose, 2000);
  }, [submitting, keyword, category, message, pageName, handleClose]);

  return (
    <Modal open={open} onClose={handleClose} title={`${category} 추가 요청`}>
      {sent ? (
        <div className={s.success}>
          <span className={s.successEmoji} aria-hidden="true">
            {"\u{1F64F}"}
          </span>
          <h3 className={s.successTitle}>요청이 전달됐어요!</h3>
          <p className={s.successDesc}>
            검토 후 우선적으로 추가할게요.
          </p>
        </div>
      ) : (
        <>
          {keyword && (
            <div className={s.keywordBadge}>
              <MessageSquarePlus size={14} aria-hidden="true" />
              <span>&lsquo;{keyword}&rsquo;</span>
            </div>
          )}

          <p className={s.intro}>
            {keyword
              ? "추가로 알려주실 내용이 있다면 남겨주세요."
              : `추가를 원하는 ${category}를 알려주세요.`}
          </p>

          <textarea
            className={s.textarea}
            placeholder={
              keyword
                ? "추가 설명이 있다면 적어주세요 (선택)"
                : `원하는 ${category}를 설명해 주세요`
            }
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            type="button"
            className={s.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || (!keyword && !message.trim())}
          >
            {submitting ? "전달 중..." : "요청 보내기"}
          </button>
        </>
      )}
    </Modal>
  );
}

/**
 * 요청 모달을 여는 트리거 버튼 (인라인 사용용)
 */
interface RequestButtonProps {
  keyword?: string;
  category?: string;
  pageName: string;
  /** 버튼 라벨 */
  label?: string;
  className?: string;
  iconSize?: number;
}

export function RequestButton({
  keyword,
  category = "정보",
  pageName,
  label,
  className,
  iconSize = 16,
}: RequestButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        <MessageSquarePlus size={iconSize} aria-hidden="true" />
        {label ?? `${category} 추가 요청하기`}
      </button>
      <RequestModal
        open={open}
        onClose={() => setOpen(false)}
        keyword={keyword}
        category={category}
        pageName={pageName}
      />
    </>
  );
}
