"use client";

import { useEffect, type RefObject } from "react";
import SearchBar from "./search-bar";
import s from "./gnb-search-popover.module.css";

interface GnbSearchPopoverProps {
  open: boolean;
  onClose: () => void;
  /**
   * 외부 클릭 판정에 사용할 컨테이너 ref. 트리거 버튼 + 팝오버를
   * 함께 감싸는 wrapper를 넘기면 버튼 재클릭 시 닫힘-열림 race를 방지.
   */
  anchorRef: RefObject<HTMLElement | null>;
}

/**
 * GNB 돋보기 아이콘에서 여는 작은 데스크탑 드롭다운.
 * 모바일에서는 SearchOverlay(풀스크린)가 쓰이므로 데스크탑 전용.
 */
export function GnbSearchPopover({ open, onClose, anchorRef }: GnbSearchPopoverProps) {
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
    <div className={s.popover} role="dialog" aria-label="통합 검색">
      <SearchBar
        size="default"
        placeholder="지역, 작물, 교육, 비용 검색"
        autoFocus
        onClose={onClose}
      />
    </div>
  );
}
