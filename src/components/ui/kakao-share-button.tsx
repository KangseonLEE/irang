"use client";

import { useCallback, useEffect, useState } from "react";
import { analytics } from "@/lib/analytics";
import s from "./share-button.module.css";

interface KakaoShareButtonProps {
  /** 공유 카드 제목 */
  title: string;
  /** 공유 카드 설명 */
  description: string;
  /** 공유 카드 썸네일 이미지 URL */
  imageUrl?: string;
  /** 공유할 페이지 URL (기본: 현재 페이지) */
  pageUrl?: string;
  /** GA4 콘텐츠 타입 */
  contentType?: string;
  /** 버튼 스타일 변형 */
  variant?: "default" | "outline" | "ghost";
  /** 크기 */
  size?: "sm" | "md";
  /** 라벨 표시 여부 */
  showLabel?: boolean;
}

/** 기본 OG 이미지 — 카카오 공유 시 썸네일이 없을 때 사용 */
const DEFAULT_OG_IMAGE = "https://irang-wheat.vercel.app/og-image.png";

/**
 * 카카오톡 공유 버튼.
 * - 카카오 SDK가 로드/초기화되지 않았거나 앱 키가 없으면 버튼을 숨긴다.
 * - `Kakao.Share.sendDefault()`로 feed 템플릿 공유를 실행한다.
 */
export function KakaoShareButton({
  title,
  description,
  imageUrl,
  pageUrl,
  contentType = "page",
  variant = "ghost",
  size = "sm",
  showLabel = false,
}: KakaoShareButtonProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // SDK 로드 타이밍이 불확실하므로 폴링으로 확인
    if (typeof window === "undefined") return;

    // 이미 초기화된 경우
    if (window.Kakao?.isInitialized()) {
      setReady(true);
      return;
    }

    // SDK 로드를 기다리는 인터벌 (최대 15초)
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 300;
      if (window.Kakao?.isInitialized()) {
        setReady(true);
        clearInterval(interval);
      } else if (elapsed >= 15_000) {
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleShare = useCallback(() => {
    if (!window.Kakao?.isInitialized()) return;

    const url = pageUrl ?? window.location.href;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title,
        description,
        imageUrl: imageUrl || DEFAULT_OG_IMAGE,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
    });

    analytics.share(contentType, "kakao");
  }, [title, description, imageUrl, pageUrl, contentType]);

  // SDK 미로드 또는 앱 키 미설정 시 렌더링하지 않음
  if (!ready) return null;

  const className = [
    s.btn,
    s[`variant_${variant}`],
    s[`size_${size}`],
  ].join(" ");

  return (
    <button
      onClick={handleShare}
      className={className}
      type="button"
      aria-label="카카오톡으로 공유"
    >
      <KakaoIcon size={size === "sm" ? 14 : 16} />
      {showLabel && <span>카카오톡</span>}
    </button>
  );
}

/** 카카오톡 말풍선 아이콘 (SVG) */
function KakaoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.66 6.62l-.96 3.56c-.08.3.26.54.52.36l4.2-2.78c.52.06 1.04.1 1.58.1 5.52 0 10-3.58 10-7.96S17.52 3 12 3z" />
    </svg>
  );
}
