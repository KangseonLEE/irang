import Link from "next/link";
import { Thermometer, Stethoscope, Sprout } from "lucide-react";
import s from "./compare-tabs.module.css";

export const TAB_IDS = ["climate", "infra", "suitability"] as const;
export type TabId = (typeof TAB_IDS)[number];

const TABS: { id: TabId; label: string; icon: typeof Thermometer }[] = [
  { id: "climate", label: "기후", icon: Thermometer },
  { id: "infra", label: "생활 인프라", icon: Stethoscope },
  { id: "suitability", label: "작물 적합성", icon: Sprout },
];

interface Props {
  activeTab: TabId;
  baseQuery: string;
}

/**
 * 비교 탭 — URL `?tab=climate|infra|suitability` 기반 view switcher.
 * Link 기반 server component (이전 IntersectionObserver scroll 방식 폐기).
 * 활성 탭만 SSR fetch → 첫 페인트 속도 크게 향상.
 */
export function CompareTabs({ activeTab, baseQuery }: Props) {
  return (
    <div className={s.tabsWrap} role="tablist" aria-label="비교 항목 선택">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === activeTab;
        const params = new URLSearchParams(baseQuery);
        params.set("tab", t.id);
        const href = `/regions/compare?${params.toString()}`;
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
