"use client";

import { useCallback } from "react";
import { Share2, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";
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
  const { copied, copy } = useCopyToClipboard();

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
    const ok = await copy(shareUrl);
    if (ok) analytics.share(contentType, "clipboard");
  }, [title, text, url, contentType, copy]);

  const className = [
    s.btn,
    s[`variant_${variant}`],
    s[`size_${size}`],
    // 아이콘만 있는 작은 투명 버튼 — 누르는 영역만 세로 44px 로 (10/6 QA 터치 표적)
    variant === "ghost" && size === "sm" && !showLabel ? s.hitSm : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      onClick={handleShare}
      className={className}
      type="button"
      // 아이콘만 보일 때도 이름이 있어야 한다 (10/4 QA axe button-name — 상세 3종)
      aria-label={showLabel ? undefined : copied ? "링크 복사됨" : "공유하기"}
    >
      {copied ? (
        <Check size={size === "sm" ? 14 : 16} aria-hidden="true" />
      ) : (
        <Share2 size={size === "sm" ? 14 : 16} aria-hidden="true" />
      )}
      {showLabel && (
        <span>{copied ? "링크 복사됨!" : "공유"}</span>
      )}
    </button>
  );
}
