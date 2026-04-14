"use client";

import { POPULAR_TAGS } from "@/lib/data/search-tags";
import s from "./search-tags.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchTagsProps {
  /** 태그 클릭 시 호출 (검색창에 쿼리를 채울 때 사용) */
  onTagClick?: (query: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SearchTags({ onTagClick }: SearchTagsProps) {
  return (
    <div className={s.tags} aria-label="인기 검색 태그">
      {POPULAR_TAGS.map((tag) => (
        <button
          key={tag.label}
          className={s.tag}
          type="button"
          onClick={() => {
            if (onTagClick) {
              onTagClick(tag.query);
            }
          }}
        >
          {tag.label}
        </button>
      ))}
    </div>
  );
}
