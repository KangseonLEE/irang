"use client";

import { useState, useCallback } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { analytics } from "@/lib/analytics";
import s from "./share-button.module.css";

interface ShareButtonProps {
  /** 공유 제목 */
  title: string;
  /** 공유 본문 */
  text: string;
  /** 공유 URL (기본: 현재 페이지) */
  url?: string;
  /** 콘텐츠 타입 (GA4 트래킹용) */
  contentType?: string;
  /** 버튼 스타일 변형 */
  variant?: "default" | "outline" | "ghost";
  /** 크기 */
  size?: "sm" | "md";
  /** 라벨 표시 여부 */
  showLabel?: boolean;
}

export function ShareButton({
  title,
  text,
  url,
  contentType = "page",
  variant = "outline",
  size = "md",
  showLabel = true,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareUrl = url ?? window.location.href;

    // 1) Web Share API (모바일 네이티브)
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: shareUrl });
        analytics.share(contentType, "native");
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    // 2) 클립보드 폴백 (데스크톱)
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      analytics.share(contentType, "clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }, [title, text, url, contentType]);

  const className = [
    s.btn,
    s[`variant_${variant}`],
    s[`size_${size}`],
  ].join(" ");

  return (
    <button onClick={handleShare} className={className} type="button">
      {copied ? <Check size={size === "sm" ? 14 : 16} /> : <Share2 size={size === "sm" ? 14 : 16} />}
      {showLabel && (
        <span>{copied ? "링크 복사됨!" : "공유"}</span>
      )}
    </button>
  );
}

/** URL 복사 전용 버튼 (간소화 버전) */
export function CopyLinkButton({ url }: { url?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const copyUrl = url ?? window.location.href;
    try {
      await navigator.clipboard.writeText(copyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  }, [url]);

  return (
    <button onClick={handleCopy} className={`${s.btn} ${s.variant_ghost} ${s.size_sm}`} type="button">
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      <span>{copied ? "복사됨" : "링크 복사"}</span>
    </button>
  );
}
