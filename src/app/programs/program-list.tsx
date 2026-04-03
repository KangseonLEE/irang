"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Loader2, FileText } from "lucide-react";
import { loadMorePrograms } from "./actions";
import { ProgramCard } from "./program-card";
import type { SupportProgram, ProgramFilters } from "@/lib/data/programs";
import s from "./program-list.module.css";

interface ProgramListProps {
  initialPrograms: SupportProgram[];
  initialHasMore: boolean;
  total: number;
  filters: ProgramFilters;
}

export function ProgramList({
  initialPrograms,
  initialHasMore,
  total,
  filters,
}: ProgramListProps) {
  const [programs, setPrograms] = useState(initialPrograms);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 필터가 바뀌면 초기 상태로 리셋
  useEffect(() => {
    setPrograms(initialPrograms);
    setHasMore(initialHasMore);
  }, [initialPrograms, initialHasMore]);

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

  return (
    <>
      {/* 결과 카운트 */}
      <div className={s.resultCount}>
        <p className={s.resultText}>
          검색 결과{" "}
          <span className={s.resultTotal}>{total}</span>건
          {programs.length < total && (
            <span className={s.resultShowing}>
              (현재 {programs.length}건 표시)
            </span>
          )}
        </p>
      </div>

      {/* 3열 카드 그리드 */}
      <div className={s.grid}>
        {programs.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>

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
