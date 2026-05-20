"use client";

/**
 * /programs 빠른 키워드 chip (치유농업·사회적 농업)
 * Sprint K Fix-2 (commit e1d8eb5)에서 추가된 deep link chip 2개.
 * Sprint N P2-f: GA 클릭 이벤트 firing 추가 — SP-027~031 노출 효과 측정 baseline.
 *
 * - 클릭 시 navigator는 그대로(Link 동작 유지)
 * - GA event: quick_keyword_click / category: engagement / label: 키워드
 */

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import s from "./page.module.css";

const KEYWORDS: ReadonlyArray<{ label: string; query: string }> = [
  { label: "치유농업", query: "치유농업" },
  { label: "사회적 농업", query: "사회적 농업" },
];

export function QuickKeywords() {
  const handleClick = (keyword: string) => {
    trackEvent({
      action: "quick_keyword_click",
      category: "engagement",
      label: keyword,
    });
  };

  return (
    <div className={s.quickKeywords} aria-label="빠른 키워드">
      <span className={s.quickKeywordsLabel}>빠른 키워드</span>
      {KEYWORDS.map((k) => (
        <Link
          key={k.query}
          href={`/programs?q=${encodeURIComponent(k.query)}`}
          className={s.quickKeywordChip}
          prefetch={false}
          onClick={() => handleClick(k.label)}
        >
          {k.label}
        </Link>
      ))}
    </div>
  );
}
