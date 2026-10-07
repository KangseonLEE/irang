"use client";

/**
 * 진단 결과 히스토리 저장소 훅 — localStorage `irang_assess_history` (2026-10-06).
 *
 * 예전 src/hooks/use-assessment-history.ts(정착 유형 진단 전용)를 세 진단 공용으로 넓혔다. 모양 검증·중복 처리는
 * diagnosis-history.ts 순수 함수가 맡고, 여기서는 읽기·쓰기와 구독만 한다.
 *
 * useSyncExternalStore 로 읽는다 — 서버와 하이드레이션 첫 렌더는 빈 목록, 마운트 뒤 실제 목록(하이드레이션 불일치 없음).
 * 같은 탭의 다른 컴포넌트(위저드가 저장 → 게이트웨이 목록)와 다른 탭(storage 이벤트) 변경을 함께 따라간다.
 */
import { useCallback, useSyncExternalStore } from "react";
import {
  HISTORY_STORAGE_KEY,
  addHistoryItem,
  parseHistory,
  type DiagnosisHistoryItem,
  type NewHistoryItem,
} from "./history";

const EMPTY: DiagnosisHistoryItem[] = [];
const listeners = new Set<() => void>();

/** 원문 문자열이 같으면 같은 배열을 돌려준다 — useSyncExternalStore 는 매번 새 배열이면 무한 렌더 */
let cachedRaw: string | null = null;
let cachedList: DiagnosisHistoryItem[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(HISTORY_STORAGE_KEY);
  } catch {
    return null; // 사생활 보호 모드·저장소 차단
  }
}

function getSnapshot(): DiagnosisHistoryItem[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    cachedList = raw ? parseHistory(JSON.parse(raw)) : EMPTY;
  } catch {
    cachedList = EMPTY;
  }
  return cachedList;
}

function getServerSnapshot(): DiagnosisHistoryItem[] {
  return EMPTY;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === HISTORY_STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function notify() {
  for (const l of listeners) l();
}

function write(list: DiagnosisHistoryItem[]) {
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 저장소가 가득 찼거나 막혔다 — 결과 화면은 그대로 두고 조용히 넘어간다
  }
  notify();
}

export function useDiagnosisHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /** 새 결과를 맨 앞에 — 최대 5건, 같은 결과 연속 저장 방지 */
  const addResult = useCallback((item: NewHistoryItem) => {
    write(addHistoryItem(getSnapshot(), item, new Date().toISOString()));
  }, []);

  const clearHistory = useCallback(() => {
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // 무시
    }
    notify();
  }, []);

  return { history, addResult, clearHistory, hasHistory: history.length > 0 };
}
