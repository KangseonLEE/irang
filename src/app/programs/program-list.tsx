"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, FileText } from "lucide-react";
import { loadMorePrograms } from "./actions";
import { ProgramCard } from "./program-card";
import type { SupportProgram, ProgramFilters } from "@/lib/data/programs";
import { trackFeedbackEvent } from "@/lib/feedback-session";
import { isNewProgram } from "./program-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGrid } from "@/components/ui/card-grid";
import { Pagination } from "@/components/ui/pagination";
import type { ViewMode } from "@/components/ui/view-toggle";
import s from "./program-list.module.css";
import dt from "@/components/ui/data-table.module.css";

const TABLE_PAGE_SIZE = 20;

interface ProgramListProps {
  initialPrograms: SupportProgram[];
  initialHasMore: boolean;
  total: number;
  filters: ProgramFilters;
  viewMode?: ViewMode;
  /** 테이블 뷰용 전체 데이터 */
  allPrograms?: SupportProgram[];
}

export function ProgramList({
  initialPrograms,
  initialHasMore,
  // total is received via props but not used in this component
  filters,
  viewMode = "card",
  allPrograms,
}: ProgramListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [programs, setPrograms] = useState(initialPrograms);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 사용자가 실제로 필터를 적용했는지 여부 — 피드백 트리거 이벤트로 기록
  useEffect(() => {
    const hasMeaningfulFilter = Boolean(
      filters.region ||
        filters.age ||
        filters.supportType ||
        filters.status ||
        (filters.query && filters.query.trim().length > 0)
    );
    if (hasMeaningfulFilter) {
      trackFeedbackEvent("programs_filter");
    }
  }, [filters.region, filters.age, filters.supportType, filters.status, filters.query]);

  // 필터가 바뀌면 초기 상태로 리셋 (외부 props → 내부 state 동기화)
  /* eslint-disable react-hooks/set-state-in-effect -- props 변경 시 state 동기화 필수 */
  useEffect(() => {
    setPrograms(initialPrograms);
    setHasMore(initialHasMore);
  }, [initialPrograms, initialHasMore]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleLoadMore = useCallback(() => {
    if (isPending || !hasMore) return;

    startTransition(async () => {
      const result = await loadMorePrograms(filters, programs.length);
      setPrograms((prev) => [...prev, ...result.programs]);
      setHasMore(result.hasMore);
    });
  }, [isPending, hasMore, filters, programs.length]);

  // IntersectionObserver — 센티넬이 뷰포트에 들어오면 다음 페이지 로드
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, handleLoadMore]);

  if (programs.length === 0) {
    return (
      <div className={s.empty}>
        <div className={s.emptyInner}>
          <FileText className={s.emptyIcon} />
          <p className={s.emptyTitle}>
            조건에 맞는 지원사업이 없습니다
          </p>
          <p className={s.emptyDesc}>
            검색 조건을 변경하거나 필터를 초기화해 보세요.
          </p>
        </div>
      </div>
    );
  }

  /* ── 테이블 뷰 ── */
  if (viewMode === "table") {
    const allRows = allPrograms ?? programs;
    const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
    const totalPages = Math.ceil(allRows.length / TABLE_PAGE_SIZE);
    const rows = allRows.slice(
      (currentPage - 1) * TABLE_PAGE_SIZE,
      currentPage * TABLE_PAGE_SIZE,
    );

    return (
      <>
        <div className={dt.wrap}>
          <table className={dt.table}>
            <thead>
              <tr>
                <th>상태</th>
                <th>사업명</th>
                <th>지역</th>
                <th>유형</th>
                <th>지원금</th>
                <th className={dt.hideOnMobile}>담당기관</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className={dt.clickableRow}
                  onClick={() => router.push(`/programs/${p.id}`)}
                >
                  <td><StatusBadge status={p.status} /></td>
                  <td className={dt.titleCell}>
                    <Link href={`/programs/${p.id}`} className={dt.titleLink}>
                      {p.title}
                    </Link>
                    {isNewProgram(p.createdAt, p.status) && (
                      <span className={s.newTag}>신규</span>
                    )}
                  </td>
                  <td className={dt.muted}>{p.region}</td>
                  <td className={dt.muted}>{p.supportType}</td>
                  <td className={dt.amount}>{p.supportAmount}</td>
                  <td className={`${dt.muted} ${dt.hideOnMobile}`}>{p.organization}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </>
    );
  }

  /* ── 카드 뷰 (기존) ── */
  return (
    <>

      {/* 3열 카드 그리드 */}
      <CardGrid>
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </CardGrid>

      {/* 로딩 인디케이터 + 센티넬 */}
      {hasMore && (
        <div ref={sentinelRef} className={s.sentinel}>
          {isPending && (
            <div className={s.loadingInner}>
              <Loader2 className={s.spinner} />
              <span>불러오는 중...</span>
            </div>
          )}
        </div>
      )}

      {/* 모두 로드됨 표시 */}
      {!hasMore && programs.length > 0 && (
        <p className={s.allLoaded}>
          모든 지원사업을 표시했습니다
        </p>
      )}
    </>
  );
}
