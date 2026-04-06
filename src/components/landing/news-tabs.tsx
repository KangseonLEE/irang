"use client";

import { useState, useMemo } from "react";
import { ExternalLink } from "lucide-react";
import s from "./news-tabs.module.css";

/* ── 통합 뉴스 아이템 ── */

export interface UnifiedNewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
  /** 탭 분류: news(전체 뉴스), education, event, program */
  category: "news" | "education" | "event" | "program";
}

interface NewsTabsProps {
  items: UnifiedNewsItem[];
}

const TABS = [
  { id: "all", label: "전체" },
  { id: "education", label: "교육" },
  { id: "event", label: "행사" },
  { id: "program", label: "지원" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function NewsTabs({ items }: NewsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const filtered = useMemo(() => {
    if (activeTab === "all") return items.slice(0, 6);
    return items
      .filter((item) => item.category === activeTab)
      .slice(0, 5);
  }, [activeTab, items]);

  return (
    <div className={s.newsCard}>
      <div className={s.header}>
        <h3 className={s.title}>농촌 소식</h3>
        <div className={s.tabs} role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              className={`${s.tab} ${activeTab === tab.id ? s.tabActive : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={s.list} role="tabpanel">
        {filtered.length > 0 ? (
          filtered.map((item, i) => (
            <a
              key={`${item.category}-${i}`}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={s.item}
            >
              <span className={s.itemTitle}>{item.title}</span>
              <span className={s.itemMeta}>
                {item.source} · {item.date}
                <ExternalLink size={12} />
              </span>
            </a>
          ))
        ) : (
          <p className={s.empty}>해당 카테고리의 소식이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
