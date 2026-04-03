"use client";

import { useState, useEffect, useCallback } from "react";

// ── 타입 정의 ──

export type BookmarkType = "region" | "program" | "crop" | "education" | "event";

export interface BookmarkItem {
  id: string;
  type: BookmarkType;
  title: string;
  subtitle?: string;
  savedAt: string;
}

// ── 상수 ──

const STORAGE_KEY = "irang-bookmarks";

// ── 유틸 ──

function loadBookmarks(): BookmarkItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookmarkItem[]) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(items: BookmarkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage 용량 초과 등 무시
  }
}

// ── 훅 ──

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // 클라이언트 마운트 시 localStorage에서 로드
  useEffect(() => {
    setBookmarks(loadBookmarks());
    setMounted(true);
  }, []);

  const isBookmarked = useCallback(
    (id: string, type: BookmarkType): boolean => {
      return bookmarks.some((b) => b.id === id && b.type === type);
    },
    [bookmarks],
  );

  const toggleBookmark = useCallback(
    (item: Omit<BookmarkItem, "savedAt">) => {
      setBookmarks((prev) => {
        const exists = prev.some(
          (b) => b.id === item.id && b.type === item.type,
        );
        const next = exists
          ? prev.filter((b) => !(b.id === item.id && b.type === item.type))
          : [...prev, { ...item, savedAt: new Date().toISOString() }];
        saveBookmarks(next);
        return next;
      });
    },
    [],
  );

  const removeBookmark = useCallback((id: string, type: BookmarkType) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => !(b.id === id && b.type === type));
      saveBookmarks(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setBookmarks([]);
    saveBookmarks([]);
  }, []);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearAll,
    count: bookmarks.length,
    mounted,
  };
}
