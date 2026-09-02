"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { UPDATES, LATEST_UPDATE_ID } from "@/lib/data/updates";
import s from "./updates-banner.module.css";

/** 마지막으로 확인한 소식 id — 이 값이 LATEST_UPDATE_ID와 같으면 배너를 숨긴다 */
const STORAGE_KEY = "irang:lastSeenUpdate";

const latest = UPDATES[0];

/**
 * 랜딩 히어로 아래 한 줄 배너 — "새로워졌어요 · {최신 소식}".
 *
 * - localStorage 접근은 브라우저 설정·시크릿 모드에서 예외를 던질 수 있어 전부 try/catch.
 *   읽기가 실패하면 "아직 못 봤다"로 보고 배너를 노출한다(정보 노출이 손해가 아님).
 * - `useSearchParams` 등 dynamic hook은 쓰지 않는다. Suspense 경계 없이 쓰면 bailout이
 *   페이지 루트까지 번져 히어로가 SSR HTML에서 통째로 빠진 전례가 있다(6/1 사고).
 * - `role="status"`는 쓰지 않는다. 스크린리더가 로딩 알림처럼 읽어 방해가 돼서
 *   일반 landmark(aside + aria-label)로 노출한다.
 */
export function UpdatesBanner() {
  // 서버·첫 클라이언트 렌더는 "표시" — 첫 방문자에게 레이아웃 이동 없이 첫 화면에 들어온다(히어로 위 배치).
  // 이미 본 사용자만 마운트 후 감춘다(한 프레임 깜빡임은 재방문자 한정).
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // 저장소 접근 차단 — 못 본 것으로 간주(표시 유지)
    }
    if (seen === LATEST_UPDATE_ID) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 클라이언트 전용 저장소 확인 후 숨김 (SSR 안전)
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  const remember = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, LATEST_UPDATE_ID);
    } catch {
      // 저장 실패해도 이번 방문에서는 닫힌 상태 유지
    }
  };

  const handleDismiss = () => {
    remember();
    setVisible(false);
    trackEvent({
      action: "updates_banner_dismiss",
      category: "landing",
      label: LATEST_UPDATE_ID,
    });
  };

  const handleClick = () => {
    remember();
    trackEvent({
      action: "updates_banner_click",
      category: "landing",
      label: LATEST_UPDATE_ID,
    });
  };

  return (
    <aside className={s.banner} aria-label="업데이트 소식">
      <Link
        href="/about/updates"
        className={s.link}
        onClick={handleClick}
        data-track="updates_banner:about_updates"
      >
        <span className={s.badge}>
          <Sparkles size={14} aria-hidden="true" />
          새로워졌어요
        </span>
        <span className={s.title}>
          <span className={s.titleShort}>{latest.short ?? latest.title}</span>
          <span className={s.titleFull}>{latest.title}</span>
        </span>
        <span className={s.more}>
          <span className={s.moreText}>어떤 내용이 바뀌었는지 확인해 보세요</span>
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </Link>
      <button
        type="button"
        className={s.close}
        onClick={handleDismiss}
        aria-label="업데이트 소식 닫기"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  );
}
