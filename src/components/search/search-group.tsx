"use client";

import { useCallback, useRef } from "react";
import SearchBar, { type SearchBarHandle } from "./search-bar";
import SearchTags from "./search-tags";
import s from "./search-group.module.css";

interface SearchGroupProps {
  placeholder?: string;
  size?: "default" | "large";
}

export default function SearchGroup({
  placeholder,
  size = "default",
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
      />
      <SearchTags onTagClick={handleTagClick} />
    </div>
  );
}
