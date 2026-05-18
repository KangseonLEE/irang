import { LayoutGrid, TrendingUp, Sprout, Scale } from "lucide-react";
import { TabBar, type TabItem } from "@/components/ui/tab-bar";

export const TAB_IDS = ["summary", "economy", "cultivation", "prosCons"] as const;
export type TabId = (typeof TAB_IDS)[number];

const TABS: ReadonlyArray<TabItem<TabId>> = [
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
 * 공용 TabBar 컴포넌트 사용 (regions/compare 와 동일 패턴).
 */
export function CompareTabs({ activeTab, baseQuery }: Props) {
  return (
    <TabBar
      tabs={TABS}
      activeId={activeTab}
      basePath="/crops/compare"
      baseQuery={baseQuery}
      ariaLabel="비교 항목 선택"
    />
  );
}
