"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { isComposingEvent } from "@/lib/ime";

/**
 * 통합검색 단축키 (2026-09-29 회장) — mac ⌘K / 그 외 Ctrl+K.
 *
 * 회장 요청은 "윈도우는 Win+K" 였지만 **Win+K 는 OS 가 선점**한다(캐스트 패널) — 브라우저까지
 * 이벤트가 오지 않으므로 윈도우·리눅스는 웹 관례인 Ctrl+K 로 둔다.
 */

/** 이 브라우저가 mac 계열인지 — 표기와 판정에 함께 쓴다 */
export function detectMac(nav: Pick<Navigator, "platform" | "userAgent"> | undefined): boolean {
  if (!nav) return false;
  const uaData = (nav as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
  const platform = uaData?.platform || nav.platform || "";
  if (platform) return /mac/i.test(platform);
  return /Macintosh|Mac OS X/i.test(nav.userAgent ?? "");
}

/** 키 이벤트에서 읽는 최소 형태 — 테스트에서 실제 KeyboardEvent 없이 검증한다 */
export interface ShortcutKeyEvent {
  key?: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  isComposing?: boolean;
  keyCode?: number;
}

/**
 * 검색 단축키인가 — mac 은 ⌘K, 그 외는 Ctrl+K.
 * 한글 입력 중(IME 조합)에는 무시한다 (9/7 배추→고구마 사고와 같은 가드).
 */
export function isSearchShortcut(e: ShortcutKeyEvent, mac: boolean): boolean {
  if ((e.key ?? "").toLowerCase() !== "k") return false;
  if (isComposingEvent(e)) return false;
  return mac ? Boolean(e.metaKey) && !e.ctrlKey : Boolean(e.ctrlKey) && !e.metaKey;
}

const subscribe = () => () => {};

/** mac 여부 — 서버 스냅샷은 false 라 SSR/하이드레이션 불일치가 없다 */
export function useIsMac(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => detectMac(typeof navigator === "undefined" ? undefined : navigator),
    () => false,
  );
}

/**
 * 문서 전역 단축키 등록. 입력창에 포커스가 있어도 동작한다 —
 * ⌘K/Ctrl+K 는 브라우저 기본 동작이 없는 조합이라 가로채도 잃는 기능이 없다.
 */
export function useSearchShortcut(onTrigger: () => void): void {
  const mac = useIsMac();
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!isSearchShortcut(e, mac)) return;
      e.preventDefault();
      onTrigger();
    },
    [mac, onTrigger],
  );

  useEffect(() => {
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [handler]);
}

/** 화면에 보여 줄 단축키 표기 — 마운트 전(서버)엔 빈 문자열로 폭만 예약한다 */
export function shortcutLabel(mounted: boolean, mac: boolean): string {
  if (!mounted) return "";
  return mac ? "⌘K" : "Ctrl K";
}
