"use client";

import { useEffect, type RefObject } from "react";
import { X } from "lucide-react";
import SearchBar from "./search-bar";
import s from "./gnb-inline-search.module.css";

interface GnbInlineSearchProps {
  open: boolean;
  onClose: () => void;
  /** 외부 클릭 판정용 (트리거 버튼 + 인라인 입력 포함) */
  anchorRef: RefObject<HTMLElement | null>;
}

/**
 * GNB 돋보기 클릭 시 헤더 바 안에서 "확장되는" 인라인 검색 입력.
 * 팝오버가 아닌 바의 연장선 — 포커스·드롭다운은 SearchBar 기본 동작을 재사용.
 * 데스크탑 전용(모바일은 SearchOverlay 풀스크린이 담당).
 */
export function GnbInlineSearch({ open, onClose, anchorRef }: GnbInlineSearchProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onClick = (e: MouseEvent) => {
      const anchor = anchorRef.current;
      if (anchor && anchor.contains(e.target as Node)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div className={s.inline} role="search" aria-label="통합 검색">
      <div className={s.inner}>
        <SearchBar
          size="default"
          placeholder="지역, 작물, 교육, 비용 검색"
          autoFocus
          richMode
          onClose={onClose}
        />
      </div>
      <button
        type="button"
        className={s.closeBtn}
        onClick={onClose}
        aria-label="검색 닫기"
      >
        <X size={18} />
      </button>
    </div>
  );
}
