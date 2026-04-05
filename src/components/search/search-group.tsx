"use client";

import { useCallback, useRef } from "react";
import SearchBar, { type SearchBarHandle } from "./search-bar";
import SearchTags from "./search-tags";
import s from "./search-group.module.css";

interface SearchGroupProps {
  placeholder?: string;
  /** 모바일(< 640px)에서만 사용할 짧은 placeholder */
  mobilePlaceholder?: string;
  size?: "default" | "large";
  /** 인기 태그 숨김 (히어로 등 간결한 레이아웃용) */
  hideTags?: boolean;
}

export default function SearchGroup({
  placeholder,
  mobilePlaceholder,
  size = "default",
  hideTags = false,
}: SearchGroupProps) {
  const searchBarRef = useRef<SearchBarHandle>(null);

  const handleTagClick = useCallback((query: string) => {
    searchBarRef.current?.fillQuery(query);
  }, []);

  return (
    <div className={s.group}>
      <SearchBar
        ref={searchBarRef}
        size={size}
        placeholder={placeholder}
        mobilePlaceholder={mobilePlaceholder}
      />
      {!hideTags && <SearchTags onTagClick={handleTagClick} />}
    </div>
  );
}
