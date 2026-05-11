"use client";

import { useEffect, useState } from "react";
import { Thermometer, Stethoscope, Sprout } from "lucide-react";
import s from "./compare-tabs.module.css";

const TABS = [
  { id: "climate-heading", label: "기후", icon: Thermometer },
  { id: "infra-chart-heading", label: "생활 인프라", icon: Stethoscope },
  { id: "suitability-heading", label: "작물 적합성", icon: Sprout },
] as const;

export function CompareTabs() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25] },
    );
    for (const tab of TABS) {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offsetTop = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offsetTop, behavior: "smooth" });
  };

  return (
    <div className={s.tabsWrap} role="tablist" aria-label="비교 항목 선택">
      {TABS.map((t) => {
        const Icon = t.icon;
        const isActive = activeId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={isActive ? s.tabActive : s.tab}
            onClick={() => handleClick(t.id)}
          >
            <Icon size={16} aria-hidden="true" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
