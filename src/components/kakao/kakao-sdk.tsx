"use client";

import Script from "next/script";

const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";

/**
 * 카카오 JavaScript SDK 로더.
 * - `NEXT_PUBLIC_KAKAO_JS_KEY`가 없으면 아무것도 렌더링하지 않는다.
 * - SDK 로드 후 `Kakao.init()`을 1회 호출한다.
 */
export function KakaoSdk() {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

  if (!appKey) return null;

  return (
    <Script
      src={KAKAO_SDK_URL}
      strategy="lazyOnload"
      onLoad={() => {
        if (
          typeof window !== "undefined" &&
          window.Kakao &&
          !window.Kakao.isInitialized()
        ) {
          window.Kakao.init(appKey);
        }
      }}
    />
  );
}
