import Link from "next/link";
import { LayoutGrid, TrendingUp, Sprout, Scale } from "lucide-react";
import s from "./compare-tabs.module.css";

export const TAB_IDS = ["summary", "economy", "cultivation", "prosCons"] as const;
export type TabId = (typeof TAB_IDS)[number];

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "summary", label: "종합", icon: LayoutGrid },
  { id: "economy", label: "수익·비용", icon: TrendingUp },
  { id: "cultivation", label: "재배 환경", icon: Sprout },
  { id: "prosCons", label: "장단점", icon: Scale },
];

interface Props {
  activeTab: TabId;
  baseQuery: string;
}

/**
 * 작물 비교 탭 — URL `?tab=summary|economy|cultivation|prosCons` 기반 view switcher.
 * Link 기반 server component (regions/compare CompareTabs 패턴 이식).
 * 활성 탭만 렌더 → 코드 분리 + 인지 부담 완화.
 */
export function CompareTabs({ activeTab, baseQuery }: Props) {
  return (
    <div className={s.tabsWrap} role="tablist" aria-label="비교 항목 선택">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === activeTab;
        const params = new URLSearchParams(baseQuery);
        params.set("tab", t.id);
        const href = `/crops/compare?${params.toString()}`;
        return (
          <Link
            key={t.id}
            href={href}
            scroll={false}
            prefetch
            role="tab"
            aria-selected={isActive}
            className={isActive ? s.tabActive : s.tab}
          >
            <Icon size={16} aria-hidden="true" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
