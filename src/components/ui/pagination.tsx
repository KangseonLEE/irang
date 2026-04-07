"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import s from "./pagination.module.css";

interface PaginationProps {
  /** 현재 페이지 (1-based) */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** URL 파라미터 키 (기본 "page") */
  paramKey?: string;
}

/** 표시할 페이지 번호 목록 생성 (최대 7개, 현재 페이지 중심) */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  paramKey = "page",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete(paramKey);
    } else {
      params.set(paramKey, String(page));
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    // 테이블 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className={s.nav} aria-label="페이지 이동">
      {/* 이전 */}
      <button
        type="button"
        className={s.arrow}
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>

      {/* 페이지 번호 */}
      <div className={s.pages}>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className={s.dots}>
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${s.page} ${p === currentPage ? s.pageActive : ""}`}
              onClick={() => goTo(p)}
              aria-current={p === currentPage ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}
      </div>

      {/* 다음 */}
      <button
        type="button"
        className={s.arrow}
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
