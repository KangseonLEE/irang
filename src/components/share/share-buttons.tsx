/**
 * ShareButtons — URL 복사 공유 버튼 (Sprint 1)
 *
 * Sprint 2에서 카카오톡 공유 추가 예정
 * Sprint 3에서 인스타그램 공유 추가 예정
 */

"use client";

import { useState, useCallback } from "react";
import { Link2, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface ShareButtonsProps {
  resultId: string;
  farmTypeLabel: string;
}

export function ShareButtons({ resultId, farmTypeLabel }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/r/${resultId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // GA4 이벤트
      analytics.share("assess_result", "link");
    } catch {
      // fallback: 구형 브라우저
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [resultId]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem 0",
      }}
    >
      <p
        style={{
          fontSize: "0.85rem",
          color: "var(--color-text-secondary, #666)",
          textAlign: "center",
          margin: "0 0 0.25rem",
        }}
      >
        결과를 친구에게 공유해 보세요
      </p>

      <button
        type="button"
        onClick={handleCopyLink}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          padding: "0.75rem 1.5rem",
          border: "1px solid var(--color-border, #d0d0d0)",
          borderRadius: 12,
          background: copied
            ? "var(--color-primary, #1B6B5A)"
            : "var(--color-bg, #fff)",
          color: copied ? "#fff" : "var(--color-text, #333)",
          fontSize: "0.9rem",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s ease",
          width: "100%",
        }}
      >
        {copied ? (
          <>
            <Check size={16} />
            링크가 복사되었습니다!
          </>
        ) : (
          <>
            <Link2 size={16} />
            결과 링크 복사
          </>
        )}
      </button>
    </div>
  );
}
