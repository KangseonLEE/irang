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

/** 기본 OG 이미지 — Next.js 동적 OG 이미지 엔드포인트 */
const DEFAULT_OG_IMAGE = "https://irangfarm.com/opengraph-image";

const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
const KAKAO_APP_KEY = "f300c0af75148eae0e05374466b1bf4c";

/**
 * SDK 로드 프로미스를 공유해서 여러 버튼이 있어도 1회만 로드.
 */
let sdkPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    // 5초 타임아웃 — CSP 차단 등으로 onload/onerror가 안 올 때 방어
    const timer = setTimeout(() => reject(new Error("Kakao SDK timeout")), 5000);
    const done = () => { clearTimeout(timer); resolve(); };
    const fail = (msg: string) => { clearTimeout(timer); reject(new Error(msg)); };

    // 이미 초기화 완료
    if (window.Kakao?.isInitialized()) { done(); return; }

    // 이미 스크립트가 있지만 초기화 안 된 경우
    const existing = document.querySelector(
      `script[src="${KAKAO_SDK_URL}"]`
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_APP_KEY);
        done();
      } else {
        existing.addEventListener("load", () => {
          if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(KAKAO_APP_KEY);
          done();
        });
        existing.addEventListener("error", () => fail("Kakao SDK load failed"));
      }
      return;
    }

    // 새로 로드
    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(KAKAO_APP_KEY);
      done();
    };
    script.onerror = () => fail("Kakao SDK load failed");
    document.head.appendChild(script);
  });

  // reject 시 다음 시도에서 재로드 가능하도록 리셋
  sdkPromise.catch(() => { sdkPromise = null; });

  return sdkPromise;
}

/**
 * 카카오톡 공유 버튼.
 * - 버튼 자체가 SDK를 로드하고 초기화한다 (외부 의존 없음).
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
    loadKakaoSdk()
      .then(() => setReady(true))
      .catch(() => {
        /* SDK 로드 실패 시 버튼 숨김 유지 */
      });
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

  // SDK 미로드 시 렌더링하지 않음
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
      style={{
        background: "#FEE500",
        borderRadius: "6px",
        padding: size === "sm" ? "5px" : "6px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
        cursor: "pointer",
      }}
      type="button"
      aria-label="카카오톡으로 공유"
    >
      <KakaoIcon size={size === "sm" ? 16 : 18} />
      {showLabel && <span style={{ color: "#191919", marginLeft: 4 }}>카카오톡</span>}
    </button>
  );
}

/** 카카오톡 공식 아이콘 (노란 배경 + 검정 말풍선) */
function KakaoIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="#191919"
      aria-hidden="true"
    >
      <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.66 6.62l-.96 3.56c-.08.3.26.54.52.36l4.2-2.78c.52.06 1.04.1 1.58.1 5.52 0 10-3.58 10-7.96S17.52 3 12 3z" />
    </svg>
  );
}
