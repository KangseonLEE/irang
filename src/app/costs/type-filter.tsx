"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { COST_TYPES, type CostTypeId } from "@/lib/data/landing";
import s from "./type-filter.module.css";

function isValidCostType(v: string | null): v is CostTypeId {
  return !!v && COST_TYPES.some((t) => t.id === v);
}

/**
 * 비용 유형 탭 (SectionNav 스타일 — GNB 바로 아래 sticky)
 * 모바일에서 랜딩 → /costs?type=X 진입 시 선택된 탭이 보이도록 scrollIntoView 처리
 */
export function CostTypeFilter() {
  const searchParams = useSearchParams();
  const activeType: CostTypeId = isValidCostType(searchParams.get("type"))
    ? (searchParams.get("type") as CostTypeId)
    : "farming";
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const active = inner.querySelector<HTMLElement>('[aria-current="page"]');
    if (active) {
      active.scrollIntoView({ inline: "center", block: "nearest", behavior: "instant" });
    }
  }, [activeType]);

  return (
    <nav className={s.nav} aria-label="비용 유형 선택">
      <div ref={innerRef} className={s.inner}>
        {COST_TYPES.map((t) => (
          <Link
            key={t.id}
            href={`/costs?type=${t.id}`}
            className={`${s.tab} ${activeType === t.id ? s.tabActive : ""}`}
            aria-current={activeType === t.id ? "page" : undefined}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
