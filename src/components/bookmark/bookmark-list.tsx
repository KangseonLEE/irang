"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { X, Trash2, MapPin, FileText, GraduationCap, CalendarDays, Heart } from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";
import { useBookmarks, type BookmarkType } from "@/lib/hooks/use-bookmarks";
import s from "./bookmark-list.module.css";

interface BookmarkListProps {
  open: boolean;
  onClose: () => void;
}

const TYPE_META: Record<
  BookmarkType,
  { label: string; icon: React.ElementType; basePath: string }
> = {
  region: { label: "지역", icon: MapPin, basePath: "/regions" },
  program: { label: "지원사업", icon: FileText, basePath: "/programs" },
  crop: { label: "작물", icon: Sprout, basePath: "/crops" },
  education: { label: "교육", icon: GraduationCap, basePath: "/education" },
  event: { label: "행사", icon: CalendarDays, basePath: "/events" },
};

const TYPE_ORDER: BookmarkType[] = [
  "region",
  "program",
  "crop",
  "education",
  "event",
];

export function BookmarkList({ open, onClose }: BookmarkListProps) {
  const { bookmarks, removeBookmark, clearAll, count } = useBookmarks();
  const panelRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  // 타입별 그룹핑
  const grouped = TYPE_ORDER.map((type) => ({
    type,
    ...TYPE_META[type],
    items: bookmarks.filter((b) => b.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={s.overlay}>
      <div className={s.panel} ref={panelRef} role="dialog" aria-label="저장 목록">
        {/* 헤더 */}
        <div className={s.header}>
          <h3 className={s.title}>
            <Heart size={18} fill="#e74c3c" color="#e74c3c" strokeWidth={0} />
            저장 목록 ({count})
          </h3>
          <button
            type="button"
            className={s.closeBtn}
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* 본문 */}
        <div className={s.body}>
          {count === 0 ? (
            <div className={s.empty}>
              <Heart size={40} color="#cbd5e1" />
              <p>저장한 항목이 없습니다</p>
              <span>관심 있는 지역, 지원사업, 작물의 하트를 눌러 저장하세요</span>
            </div>
          ) : (
            <>
              {grouped.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.type} className={s.group}>
                    <div className={s.groupLabel}>
                      <Icon size={14} />
                      {group.label} ({group.items.length})
                    </div>
                    <ul className={s.list}>
                      {group.items.map((item) => (
                        <li key={`${item.type}-${item.id}`} className={s.item}>
                          <Link
                            href={`${group.basePath}/${item.id}`}
                            className={s.itemLink}
                            onClick={onClose}
                          >
                            <span className={s.itemTitle}>{item.title}</span>
                            {item.subtitle && (
                              <span className={s.itemSub}>{item.subtitle}</span>
                            )}
                          </Link>
                          <button
                            type="button"
                            className={s.removeBtn}
                            onClick={() => removeBookmark(item.id, item.type)}
                            aria-label={`${item.title} 삭제`}
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* 푸터 */}
        {count > 0 && (
          <div className={s.footer}>
            <button
              type="button"
              className={s.clearBtn}
              onClick={() => {
                if (window.confirm("저장 목록을 모두 삭제하시겠습니까?")) {
                  clearAll();
                }
              }}
            >
              <Trash2 size={14} />
              전체 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
