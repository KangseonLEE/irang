import { Thermometer, Stethoscope, Sprout } from "lucide-react";
import { TabBar, type TabItem } from "@/components/ui/tab-bar";

export const TAB_IDS = ["climate", "infra", "suitability"] as const;
export type TabId = (typeof TAB_IDS)[number];

const TABS: ReadonlyArray<TabItem<TabId>> = [
  { id: "climate", label: "기후", icon: Thermometer },
  { id: "infra", label: "생활 인프라", icon: Stethoscope },
  { id: "suitability", label: "작물 적합성", icon: Sprout },
];

interface Props {
  activeTab: TabId;
  baseQuery: string;
}

/**
 * 지역 비교 탭 — URL `?tab=climate|infra|suitability` 기반 view switcher.
 * 공용 TabBar 컴포넌트 사용 (crops/compare 와 동일 패턴).
 */
export function CompareTabs({ activeTab, baseQuery }: Props) {
  return (
    <TabBar
      tabs={TABS}
      activeId={activeTab}
      basePath="/regions/compare"
      baseQuery={baseQuery}
      ariaLabel="비교 항목 선택"
    />
  );
}
