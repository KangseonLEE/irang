"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import s from "./section-pager.module.css";

/**
 * 검색 결과 섹션 공용 페이저 (2026-09-27) — 지역·지원사업 섹션이 같은 모양으로 쓴다.
 * - 페이지 번호는 0-based, 표시는 1-based.
 * - 버튼 창은 처음·현재±1·마지막, 사이는 "…"(버튼 아님) — 375px 에서 한 줄.
 * - 상태는 호출부가 든다(검색어가 바뀌면 호출부가 0으로 되돌린다). URL 파라미터 없음.
 */
export function SectionPager({
  page,
  total,
  onChange,
  ariaLabel,
}: {
  page: number;
  total: number;
  onChange: (next: number) => void;
  ariaLabel: string;
}) {
  if (total <= 1) return null;
  return (
    <nav className={s.pager} aria-label={ariaLabel}>
      <button
        type="button"
        className={s.pagerStep}
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        <span className={s.pagerStepLabel}>이전</span>
      </button>
      <ul className={s.pagerList}>
        {pageWindow(page, total).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className={s.pagerGap} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={p === page ? `${s.pagerNum} ${s.pagerNumActive}` : s.pagerNum}
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`${p + 1}페이지`}
              >
                {p + 1}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className={s.pagerStep}
        onClick={() => onChange(page + 1)}
        disabled={page === total - 1}
        aria-label="다음 페이지"
      >
        <span className={s.pagerStepLabel}>다음</span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}

/** 처음 · 현재±1 · 마지막, 사이는 gap. 5페이지 이하면 전부 */
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i);
  const out: (number | "gap")[] = [0];
  const from = Math.max(1, current - 1);
  const to = Math.min(total - 2, current + 1);
  if (from > 1) out.push("gap");
  for (let p = from; p <= to; p += 1) out.push(p);
  if (to < total - 2) out.push("gap");
  out.push(total - 1);
  return out;
}
