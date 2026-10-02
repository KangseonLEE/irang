"use client";

import { useSyncExternalStore } from "react";
import { kstToday } from "@/lib/program-status";

/** 다음 KST 자정까지 남은 ms (자정 직후 깨우도록 1초 여유) */
function msUntilNextKstMidnight(nowMs: number): number {
  const kstNow = nowMs + 9 * 60 * 60 * 1000;
  const dayMs = 24 * 60 * 60 * 1000;
  return dayMs - (kstNow % dayMs) + 1000;
}

/**
 * 날짜가 바뀔 수 있는 순간에만 다시 읽게 한다 — 탭이 다시 보일 때 + KST 자정.
 * 스냅샷이 문자열이라 값이 같으면 React 가 다시 렌더하지 않는다.
 */
function subscribe(onChange: () => void): () => void {
  let timer = 0;
  const arm = () => {
    timer = window.setTimeout(() => {
      onChange();
      arm();
    }, msUntilNextKstMidnight(Date.now()));
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") onChange();
  };
  arm();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

function getSnapshot(): string {
  return kstToday();
}

/**
 * 보는 사람의 "오늘"(KST, YYYY-MM-DD) — 하이드레이션 불일치 없이 (2026-10-03).
 *
 * D-day·이번 달처럼 날짜에 따라 글자가 바뀌는 클라이언트 컴포넌트는 렌더 중 `new Date()` 를
 * 직접 부르면 안 된다. ISR 스냅샷을 만든 날(서버)과 방문한 날(브라우저)이 다르면 서버 HTML 과
 * 첫 클라이언트 렌더가 어긋나 React #418 이 난다(운영 Sentry #157, SP-031 "74일" vs "73일").
 *
 * - 서버 렌더·하이드레이션: 서버가 넘긴 `asOf`(= 서버의 `kstToday()`) → 서버 HTML 과 글자 단위로 같다
 * - 하이드레이션 직후: 브라우저의 오늘과 다르면 React 가 한 번 더 렌더해 오늘 값으로 바꾼다
 * - 클라이언트 이동(하이드레이션 아님)으로 처음 마운트될 때는 바로 오늘 값
 *
 * 사용: 서버 컴포넌트 `<X asOf={kstToday()} />` → 클라이언트 `const today = useKstToday(asOf)`.
 */
export function useKstToday(asOf: string): string {
  return useSyncExternalStore(subscribe, getSnapshot, () => asOf);
}
