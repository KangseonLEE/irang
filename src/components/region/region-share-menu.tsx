"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, MoreHorizontal, Share2, Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  useBookmarks,
  type BookmarkType,
} from "@/lib/hooks/use-bookmarks";
import { analytics } from "@/lib/analytics";
import s from "./region-share-menu.module.css";

interface RegionShareMenuProps {
  /** 공유 카드 제목 */
  shareTitle: string;
  /** 공유 카드 설명 */
  shareDescription: string;
  /** 공유 카드 썸네일 (카카오 OG) */
  shareImageUrl?: string;
  /** 공유 페이지 URL (기본: 현재 페이지) */
  pageUrl?: string;
  /** GA4 contentType */
  contentType?: string;
  /** 북마크 메타 */
  bookmark: {
    id: string;
    type: BookmarkType;
    title: string;
    subtitle?: string;
  };
  /** 트리거 버튼 시각 변형 — hero(이미지 위 흰 알약), plain(기본) */
  triggerVariant?: "hero" | "plain";
}

const KAKAO_SDK_URL =
  "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
const KAKAO_APP_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? "f300c0af75148eae0e05374466b1bf4c";
const DEFAULT_OG_IMAGE = "https://irangfarm.com/opengraph-image";

let sdkPromise: Promise<void> | null = null;

function loadKakaoSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Kakao SDK timeout")),
      5000,
    );
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    const fail = (msg: string) => {
      clearTimeout(timer);
      reject(new Error(msg));
    };

    if (window.Kakao?.isInitialized()) {
      done();
      return;
    }

    const existing = document.querySelector(
      `script[src="${KAKAO_SDK_URL}"]`,
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.Kakao) {
        if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_APP_KEY);
        done();
      } else {
        existing.addEventListener("load", () => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(KAKAO_APP_KEY);
          }
          done();
        });
        existing.addEventListener("error", () =>
          fail("Kakao SDK load failed"),
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_APP_KEY);
      }
      done();
    };
    script.onerror = () => fail("Kakao SDK load failed");
    document.head.appendChild(script);
  });

  sdkPromise.catch(() => {
    sdkPromise = null;
  });

  return sdkPromise;
}

/**
 * 시도/시군구 hero 우측 상단의 단일 ⋯ 메뉴 트리거 + ActionSheet.
 * 모바일에서 카카오/공유/북마크 3개 액션을 하나의 시트에 모은다.
 *
 * 데스크탑(≥768px)에서는 페이지 측 CSS로 이 컴포넌트를 숨기고,
 * 기존 `heroActions` inline 3버튼이 그대로 노출된다.
 */
export function RegionShareMenu({
  shareTitle,
  shareDescription,
  shareImageUrl,
  pageUrl,
  contentType = "region",
  bookmark,
  triggerVariant = "hero",
}: RegionShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isBookmarked, toggleBookmark, mounted } = useBookmarks();
  const active = mounted && isBookmarked(bookmark.id, bookmark.type);

  // 시트가 처음 열릴 때만 SDK 로드 (불필요한 초기 로드 회피).
  useEffect(() => {
    if (!open || kakaoReady) return;
    loadKakaoSdk()
      .then(() => setKakaoReady(true))
      .catch(() => {
        /* SDK 로드 실패 시 카카오 항목 disabled */
      });
  }, [open, kakaoReady]);

  const close = useCallback(() => setOpen(false), []);

  const handleKakao = useCallback(() => {
    if (!window.Kakao?.isInitialized()) return;
    const url = pageUrl ?? window.location.href;

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: shareTitle,
        description: shareDescription,
        imageUrl: shareImageUrl || DEFAULT_OG_IMAGE,
        link: { mobileWebUrl: url, webUrl: url },
      },
    });
    analytics.share(contentType, "kakao");
    close();
  }, [shareTitle, shareDescription, shareImageUrl, pageUrl, contentType, close]);

  const handleShare = useCallback(async () => {
    const url = pageUrl ?? window.location.href;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url,
        });
        analytics.share(contentType, "native");
        close();
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }

    // 폴백 — 클립보드 복사 (시트는 짧게 유지해 사용자에게 결과 인지 시간 부여)
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      analytics.share(contentType, "clipboard");
      setTimeout(() => {
        setCopied(false);
        close();
      }, 900);
    } catch {
      close();
    }
  }, [shareTitle, shareDescription, pageUrl, contentType, close]);

  const handleBookmark = useCallback(() => {
    toggleBookmark(bookmark);
    close();
  }, [toggleBookmark, bookmark, close]);

  const triggerClass =
    triggerVariant === "hero" ? `${s.trigger} ${s.triggerHero}` : s.trigger;

  return (
    <>
      <button
        type="button"
        className={triggerClass}
        onClick={() => setOpen(true)}
        aria-label="공유 및 북마크 메뉴 열기"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </button>

      <Modal open={open} onClose={close} title="공유하기">
        <ul className={s.menu} role="menu">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={s.item}
              onClick={handleKakao}
              disabled={!kakaoReady}
            >
              <span className={s.itemIcon} aria-hidden="true">
                <KakaoIcon size={20} />
              </span>
              <span className={s.itemBody}>
                <span className={s.itemLabel}>카카오톡으로 공유</span>
                {!kakaoReady && (
                  <span className={s.itemHint}>SDK 준비 중이에요</span>
                )}
              </span>
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={s.item}
              onClick={handleShare}
            >
              <span
                className={`${s.itemIcon} ${s.itemIconNeutral}`}
                aria-hidden="true"
              >
                {copied ? <Check size={18} /> : <Share2 size={18} />}
              </span>
              <span className={s.itemBody}>
                <span className={s.itemLabel}>
                  {copied ? "링크가 복사됐어요" : "공유하기"}
                </span>
                <span className={s.itemHint}>
                  {copied
                    ? "원하는 곳에 붙여넣으세요"
                    : "다른 앱으로 보내거나 링크를 복사해요"}
                </span>
              </span>
            </button>
          </li>
          <li role="none">
            <button
              type="button"
              role="menuitemcheckbox"
              className={`${s.item} ${active ? s.itemActive : ""}`}
              onClick={handleBookmark}
              aria-checked={active}
            >
              <span
                className={`${s.itemIcon} ${
                  active ? s.itemIconActive : s.itemIconNeutral
                }`}
                aria-hidden="true"
              >
                <Heart
                  size={18}
                  fill={active ? "currentColor" : "none"}
                  strokeWidth={active ? 0 : 1.8}
                />
              </span>
              <span className={s.itemBody}>
                <span className={s.itemLabel}>
                  {active ? "북마크 해제" : "북마크에 저장"}
                </span>
                <span className={s.itemHint}>
                  {active
                    ? "내 북마크에서 빼낼게요"
                    : "마이 페이지에서 다시 볼 수 있어요"}
                </span>
              </span>
            </button>
          </li>
        </ul>
      </Modal>
    </>
  );
}

function KakaoIcon({ size = 20 }: { size?: number }) {
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
