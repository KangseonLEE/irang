import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import s from "./tab-bar.module.css";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: LucideIcon;
}

interface Props<T extends string = string> {
  /** 탭 목록 (id·label·optional icon) */
  tabs: ReadonlyArray<TabItem<T>>;
  /** 현재 활성 탭 id */
  activeId: T;
  /** 링크 base path (예: `/crops/compare`) */
  basePath: string;
  /** 활성 탭을 결정하는 query key (기본 `tab`) */
  paramKey?: string;
  /**
   * 탭 전환 시 보존할 다른 query string.
   * URLSearchParams 또는 미리 만들어진 query string("regions=1&crop=2") 둘 다 허용.
   */
  baseQuery?: string | URLSearchParams;
  /** 접근성 라벨 (기본 "탭 메뉴") */
  ariaLabel?: string;
}

/**
 * 공통 탭 바 — URL `?<paramKey>=<id>` 기반 view switcher.
 * Server Component (Link 기반, JS 없이 동작).
 *
 * 사용 예:
 * ```tsx
 * <TabBar
 *   tabs={TABS}
 *   activeId={tab}
 *   basePath="/crops/compare"
 *   baseQuery={baseQuery}
 *   ariaLabel="비교 항목 선택"
 * />
 * ```
 */
export function TabBar<T extends string = string>({
  tabs,
  activeId,
  basePath,
  paramKey = "tab",
  baseQuery,
  ariaLabel = "탭 메뉴",
}: Props<T>) {
  return (
    <div className={s.tabsWrap} role="tablist" aria-label={ariaLabel}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = t.id === activeId;
        const params = new URLSearchParams(baseQuery);
        params.set(paramKey, t.id);
        const query = params.toString();
        const href = query ? `${basePath}?${query}` : basePath;
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
            {Icon ? <Icon size={16} aria-hidden="true" /> : null}
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
