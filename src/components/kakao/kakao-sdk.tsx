"use client";

import { useEffect } from "react";

const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

/**
 * 카카오 JavaScript SDK 로더.
 * - `NEXT_PUBLIC_KAKAO_JS_KEY`가 없으면 아무것도 하지 않는다.
 * - useEffect 내에서 직접 <script> 태그를 삽입해 SDK를 로드한다.
 * - SDK 로드 완료 후 `Kakao.init()`을 1회 호출한다.
 *
 * next/script 대신 직접 로드하는 이유:
 * Next.js 16의 next/script strategy="afterInteractive"가
 * 특정 조건에서 onLoad 콜백을 호출하지 않는 이슈 회피.
 */
export function KakaoSdk() {
  useEffect(() => {
    if (!KAKAO_APP_KEY) return;
    if (typeof window === "undefined") return;

    // 이미 초기화된 경우 스킵
    if (window.Kakao?.isInitialized()) return;

    // 이미 스크립트 태그가 있는 경우 스킵
    if (document.querySelector(`script[src="${KAKAO_SDK_URL}"]`)) return;

    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_APP_KEY);
      }
    };
    document.head.appendChild(script);
  }, []);

  return null;
}
