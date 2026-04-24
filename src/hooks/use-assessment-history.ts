/**
 * useAssessmentHistory — localStorage 기반 진단 결과 히스토리 관리
 *
 * - 최대 5건 유지 (FIFO)
 * - SSR-safe (typeof window 체크)
 * - 결과 ID, 유형, 타임스탬프 저장
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import type { FarmTypeId } from "@/lib/data/match-questions";

const STORAGE_KEY = "irang_assess_history";
const MAX_ITEMS = 5;

export interface AssessmentHistoryItem {
  resultId: string;
  farmTypeId: FarmTypeId;
  farmTypeLabel: string;
  topRegions: string[]; // shortName (display)
  topRegionIds?: string[]; // province id (lookup)
  topCropIds?: string[]; // crop id (lookup)
  savedAt: string; // ISO 8601
}

function readHistory(): AssessmentHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items: AssessmentHistoryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage full or disabled — 조용히 무시
  }
}

export function useAssessmentHistory() {
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);

  // 초기 로드
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistory(readHistory());
  }, []);

  /** 새 결과 추가 (중복 ID 무시, 최대 5건) */
  const addResult = useCallback(
    (item: Omit<AssessmentHistoryItem, "savedAt">) => {
      setHistory((prev) => {
        // 이미 저장된 ID면 무시
        if (prev.some((h) => h.resultId === item.resultId)) return prev;

        const newItem: AssessmentHistoryItem = {
          ...item,
          savedAt: new Date().toISOString(),
        };
        const updated = [newItem, ...prev].slice(0, MAX_ITEMS);
        writeHistory(updated);
        return updated;
      });
    },
    []
  );

  /** 특정 결과 삭제 */
  const removeResult = useCallback((resultId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.resultId !== resultId);
      writeHistory(updated);
      return updated;
    });
  }, []);

  /** 히스토리 전체 삭제 */
  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    history,
    addResult,
    removeResult,
    clearHistory,
    hasHistory: history.length > 0,
  };
}
