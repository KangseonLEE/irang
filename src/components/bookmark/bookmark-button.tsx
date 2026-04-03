"use client";

import { Heart } from "lucide-react";
import { useBookmarks, type BookmarkType } from "@/lib/hooks/use-bookmarks";
import s from "./bookmark-button.module.css";

interface BookmarkButtonProps {
  id: string;
  type: BookmarkType;
  title: string;
  subtitle?: string;
  className?: string;
}

export function BookmarkButton({
  id,
  type,
  title,
  subtitle,
  className = "",
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, mounted } = useBookmarks();
  const active = mounted && isBookmarked(id, type);

  return (
    <button
      type="button"
      className={`${s.btn} ${active ? s.active : ""} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ id, type, title, subtitle });
      }}
      aria-label={active ? `${title} 북마크 해제` : `${title} 북마크`}
      title={active ? "저장됨" : "저장하기"}
    >
      <Heart
        size={20}
        fill={active ? "currentColor" : "none"}
        strokeWidth={active ? 0 : 1.8}
      />
    </button>
  );
}
