"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { COST_TYPES, type CostTypeId } from "@/lib/data/landing";
import { centeredScrollLeft } from "@/lib/scroll-geometry";
import s from "./type-filter.module.css";

function isValidCostType(v: string | null): v is CostTypeId {
  return !!v && COST_TYPES.some((t) => t.id === v);
}

/**
 * 비용 유형 탭 (SectionNav 스타일 — GNB 바로 아래 sticky)
 * 모바일에서 랜딩 → /costs?type=X 진입 시 선택된 탭이 보이도록 **탭바(.nav) 안에서만** 가로로 옮긴다.
 * 10/6 R2-Q3 F1: 예전 scrollIntoView 는 마운트 때 크롬의 순차 포커스 시작점을 그 탭으로 옮겨, 첫 Tab 이 헤더·내비를 건너뛰었다
 * (운영 동일). 붙은 sticky 바에서는 세로로 문서까지 움직일 수도 있다.
 */
export function CostTypeFilter() {
  const searchParams = useSearchParams();
  const activeType: CostTypeId = isValidCostType(searchParams.get("type"))
    ? (searchParams.get("type") as CostTypeId)
    : "farming";
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || nav.scrollWidth <= nav.clientWidth) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) return;
    const itemLeft = active.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft;
    nav.scrollTo({ left: centeredScrollLeft(itemLeft, active.offsetWidth, nav.clientWidth, nav.scrollWidth), behavior: "instant" });
  }, [activeType]);

  return (
    <nav ref={navRef} className={s.nav} aria-label="비용 유형 선택">
      <div className={s.inner}>
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
