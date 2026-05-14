"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import s from "./crop-request-button.module.css";

interface CropRequestButtonProps {
  query: string;
}

export function CropRequestButton({ query }: CropRequestButtonProps) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleRequest() {
    if (sent || sending) return;
    setSending(true);

    // /api/quick-feedback 으로 service_role 경유 INSERT (anon RLS 차단 우회)
    try {
      await fetch("/api/quick-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: "neutral",
          message: `[작물 요청] ${query}`,
          page: "작물 정보",
        }),
      });
    } catch {
      // fire-and-forget
    }

    setSending(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className={s.done}>
        요청이 전달됐어요. 검토 후 추가할게요!
      </p>
    );
  }

  return (
    <button
      type="button"
      className={s.button}
      onClick={handleRequest}
      disabled={sending}
    >
      <MessageCircle size={16} aria-hidden="true" />
      {sending ? "전달 중..." : `'${query}' 작물 정보 요청하기`}
    </button>
  );
}
