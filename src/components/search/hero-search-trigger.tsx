"use client";

import { useCallback } from "react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import s from "./hero-search-trigger.module.css";

interface HeroSearchTriggerProps {
  /** 데스크탑 placeholder (기본 풀 문장) */
  placeholder?: string;
  /** 모바일(< 640px) 짧은 placeholder */
  mobilePlaceholder?: string;
}

/**
 * 히어로 영역 검색 트리거 — 탭하면 전역 SearchOverlay를 열어 네이버+ 스토어 스타일
 * 풀스크린 리스트 오버레이를 노출한다.
 *
 * 시각적으로는 입력창처럼 보이지만 실제로는 `<button>` — 포커스 시 오버레이가 뜨면서
 * 진짜 input이 autoFocus 된다. 기존 `/search` 페이지 이동 동작은 오버레이 내에서 유지.
 */
export function HeroSearchTrigger({
  placeholder = "궁금한 귀농 정보를 검색해보세요",
  mobilePlaceholder = "지역, 작물, 교육, 비용 검색",
}: HeroSearchTriggerProps) {
  const { open } = useSearchOverlay();

  const handleOpen = useCallback(() => {
    open();
  }, [open]);

  return (
    <button
      type="button"
      className={s.trigger}
      onClick={handleOpen}
      aria-label="통합 검색 열기"
      aria-haspopup="dialog"
    >
      <Search size={22} strokeWidth={1.75} className={s.icon} aria-hidden="true" />
      <span className={s.placeholder}>
        <span className={s.placeholderFull}>{placeholder}</span>
        <span className={s.placeholderMobile}>{mobilePlaceholder}</span>
      </span>
    </button>
  );
}
