"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, FileText } from "lucide-react";
import { loadMorePrograms } from "./actions";
import { ProgramCard } from "./program-card";
import type { SupportProgram, ProgramFilters } from "@/lib/data/programs";
import type { PersonaId } from "@/lib/data/personas";
import { getProgramPersonaFitTrace } from "@/lib/data/persona-fit";
import { isNewProgram } from "@/lib/program-status";
import { PersonaScoreExplain } from "@/components/persona/persona-score-explain";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGrid } from "@/components/ui/card-grid";
import { EmptyState } from "@/components/ui/empty-state";
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
  /** Phase 6 B3 D2 — 페르소나 모드 시 explain row 노출용 */
  currentPersona?: PersonaId;
}

export function ProgramList({
  initialPrograms,
  initialHasMore,
  // total is received via props but not used in this component
  filters,
  viewMode = "card",
  allPrograms,
  currentPersona,
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
      // 이벤트 트래킹 (향후 analytics로 대체 가능)
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
      <EmptyState
        icon={<FileText size={32} />}
        message="조건에 맞는 지원사업이 없어요. 검색 조건을 변경하거나 필터를 초기화해 보세요."
        linkHref="/programs"
        linkText="필터 초기화"
      />
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
                <th className={dt.hideOnMobile}>지역</th>
                <th className={dt.hideOnMobile}>유형</th>
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
                  <td className={`${dt.muted} ${dt.hideOnMobile}`}>{p.region}</td>
                  <td className={`${dt.muted} ${dt.hideOnMobile}`}>{p.supportType}</td>
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
  // sort 변경 시 wrapping div re-mount → 카드 stagger fade-in 트리거
  // (5/25 회장 요청 — 정렬 변경 인터랙션 시각 피드백)
  const sortKey = searchParams.get("sort") ?? "deadline";

  return (
    <>

      {/* 3열 카드 그리드 — sort 변경 시 stagger fade-in */}
      <div key={sortKey} className={s.gridAnim}>
        <CardGrid>
          {programs.map((program, i) => {
            const trace = currentPersona
              ? getProgramPersonaFitTrace(program, currentPersona)
              : null;
            // 첫 6개 카드만 stagger (180ms 총) — 더 많으면 어색
            const animDelay = `${Math.min(i, 5) * 30}ms`;
            if (trace) {
              return (
                <article
                  key={program.id}
                  className={`${s.programCellPersona} ${s.cardAnim}`}
                  style={{ animationDelay: animDelay }}
                >
                  <ProgramCard program={program} />
                  <PersonaScoreExplain trace={trace} subject="이 사업" />
                </article>
              );
            }
            return (
              <div
                key={program.id}
                className={s.cardAnim}
                style={{ animationDelay: animDelay }}
              >
                <ProgramCard program={program} />
              </div>
            );
          })}
        </CardGrid>
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
          지원사업을 모두 확인했어요
        </p>
      )}
    </>
  );
}
