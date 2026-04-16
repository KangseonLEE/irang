"use client";

import { useState, useCallback, useEffect } from "react";
import { Link2, Check, Download } from "lucide-react";
import { analytics } from "@/lib/analytics";
import s from "./share-buttons.module.css";

interface ShareButtonsProps {
  resultId: string;
  farmTypeLabel: string;
}

const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
const KAKAO_APP_KEY = "f300c0af75148eae0e05374466b1bf4c";
const DEFAULT_OG_IMAGE = "https://irang-wheat.vercel.app/opengraph-image";

let sdkPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), 5000);
    const done = () => { clearTimeout(timer); resolve(); };
    const fail = (msg: string) => { clearTimeout(timer); reject(new Error(msg)); };

    if (window.Kakao?.isInitialized()) { done(); return; }

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
        existing.addEventListener("error", () => fail("load failed"));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(KAKAO_APP_KEY);
      done();
    };
    script.onerror = () => fail("load failed");
    document.head.appendChild(script);
  });

  sdkPromise.catch(() => { sdkPromise = null; });
  return sdkPromise;
}

export function ShareButtons({ resultId, farmTypeLabel }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    loadKakaoSdk()
      .then(() => setKakaoReady(true))
      .catch(() => {});
  }, []);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r/${resultId}`
    : "";

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    analytics.share("assess_result", "link");
  }, [shareUrl]);

  const handleKakaoShare = useCallback(() => {
    if (!window.Kakao?.isInitialized()) return;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: `🌾 나의 귀농 유형: ${farmTypeLabel}`,
        description: "이랑에서 귀농 적합도 진단을 받아보세요!",
        imageUrl: DEFAULT_OG_IMAGE,
        link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
      },
    });

    analytics.share("assess_result", "kakao");
  }, [farmTypeLabel, shareUrl]);

  const handlePrint = useCallback(() => {
    window.print();
    analytics.share("assess_result", "print");
  }, []);

  return (
    <div className={s.wrap}>
      <p className={s.label}>결과를 공유해 보세요</p>
      <div className={s.buttons}>
        {kakaoReady && (
          <button
            type="button"
            onClick={handleKakaoShare}
            className={s.btnKakao}
          >
            <span className={s.btnIcon}><KakaoIcon /></span>
            카카오톡
          </button>
        )}
        <button
          type="button"
          onClick={handleCopyLink}
          className={copied ? s.btnCopied : s.btn}
        >
          {copied ? (
            <><Check size={16} /> 복사됨</>
          ) : (
            <><Link2 size={16} /> 링크 복사</>
          )}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className={s.btn}
        >
          <Download size={16} />
          저장
        </button>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="#191919" aria-hidden="true">
      <path d="M12 3C6.48 3 2 6.58 2 10.9c0 2.78 1.86 5.22 4.66 6.62l-.96 3.56c-.08.3.26.54.52.36l4.2-2.78c.52.06 1.04.1 1.58.1 5.52 0 10-3.58 10-7.96S17.52 3 12 3z" />
    </svg>
  );
}
