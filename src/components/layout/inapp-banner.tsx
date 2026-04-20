"use client";

import { useEffect, useState } from "react";
import { ExternalLink, X, Copy, Check } from "lucide-react";
import s from "./inapp-banner.module.css";

interface InAppInfo {
  isInApp: boolean;
  appName: string | null;
}

function detectInAppBrowser(): InAppInfo {
  if (typeof window === "undefined") return { isInApp: false, appName: null };
  const ua = navigator.userAgent;
  if (/KAKAOTALK/i.test(ua)) return { isInApp: true, appName: "카카오톡" };
  if (/Instagram/i.test(ua)) return { isInApp: true, appName: "인스타그램" };
  if (/FBAV|FBAN/i.test(ua)) return { isInApp: true, appName: "페이스북" };
  if (/NAVER/i.test(ua)) return { isInApp: true, appName: "네이버" };
  if (/Line\//i.test(ua)) return { isInApp: true, appName: "라인" };
  return { isInApp: false, appName: null };
}

const DISMISSED_KEY = "inapp-banner-dismissed";

export function InAppBanner() {
  const [info, setInfo] = useState<InAppInfo>({ isInApp: false, appName: null });
  const [dismissed, setDismissed] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const detected = detectInAppBrowser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInfo(detected);
    if (detected.isInApp) {
      const wasDismissed = sessionStorage.getItem(DISMISSED_KEY) === "1";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDismissed(wasDismissed);
    }
  }, []);

  if (!info.isInApp || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISSED_KEY, "1");
  };

  const handleOpenExternal = () => {
    const currentUrl = location.href;
    const ua = navigator.userAgent;

    // Android: intent:// 스킴으로 Chrome 실행 시도
    if (/Android/i.test(ua)) {
      const intentUrl =
        `intent://${location.host}${location.pathname}${location.search}${location.hash}` +
        `#Intent;scheme=https;package=com.android.chrome;end`;
      // eslint-disable-next-line react-hooks/immutability
      location.href = intentUrl;
      return;
    }

    // iOS: 클립보드 복사 + 안내
    handleCopyUrl(currentUrl);
  };

  const handleCopyUrl = async (url?: string) => {
    try {
      await navigator.clipboard.writeText(url ?? location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 미지원 시 fallback
      const input = document.createElement("input");
      input.value = url ?? location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isAndroid = /Android/i.test(navigator.userAgent);

  return (
    <div className={s.banner}>
      <div className={s.content}>
        <p className={s.message}>
          {info.appName} 앱에서 열렸어요.{" "}
          {isAndroid
            ? "외부 브라우저에서 더 편하게 이용할 수 있어요."
            : "주소를 복사해서 Safari에서 열어보세요."}
        </p>
        <div className={s.actions}>
          {isAndroid ? (
            <button
              type="button"
              className={s.openBtn}
              onClick={handleOpenExternal}
            >
              <ExternalLink size={14} />
              브라우저로 열기
            </button>
          ) : (
            <button
              type="button"
              className={s.openBtn}
              onClick={() => handleCopyUrl()}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "복사 완료" : "주소 복사"}
            </button>
          )}
        </div>
      </div>
      <button
        type="button"
        className={s.closeBtn}
        onClick={handleDismiss}
        aria-label="배너 닫기"
      >
        <X size={16} />
      </button>
    </div>
  );
}
