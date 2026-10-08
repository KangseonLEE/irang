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
import { isNewProgram, programStatusLabel } from "@/lib/program-status";
import { useKstToday } from "@/lib/hooks/use-kst-today";
import { PersonaScoreExplain } from "@/components/persona/persona-score-explain";
import { StatusBadge } from "@/components/ui/status-badge";
import { CardGrid } from "@/components/ui/card-grid";
import { CrawlGroupNote } from "@/components/ui/crawl-group-note";
import { displayAmount, displaySupportType } from "@/lib/programs/display";
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
  /** 서버가 목록을 그린 날(KST YYYY-MM-DD, `kstToday()`) — D-N·신규 배지 하이드레이션 기준 (10/3) */
  asOf: string;
}

export function ProgramList({
  initialPrograms,
  initialHasMore,
  // total is received via props but not used in this component
  filters,
  viewMode = "card",
  allPrograms,
  currentPersona,
  asOf,
}: ProgramListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 하이드레이션 = 서버가 그린 날(asOf), 직후 보는 사람의 오늘 — 카드 D-N 이 CDN 스냅샷과 어긋나지 않게
  const today = useKstToday(asOf);
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
      // 첫 화면과 같은 순서(정렬 키·페르소나)로 다음 쪽을 받는다 — 다르면 쪽이 겹치거나 빠진다(10/3)
      const result = await loadMorePrograms(filters, programs.length, {
        persona: currentPersona,
        sort: searchParams.get("sort") ?? undefined,
      });
      setPrograms((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...result.programs.filter((p) => !seen.has(p.id))];
      });
      setHasMore(result.hasMore);
    });
  }, [isPending, hasMore, filters, programs.length, currentPersona, searchParams]);

  // IntersectionObserver — 센티넬이 화면 위·아래 두 화면 거리 안에 들어오면 다음 페이지 로드
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      // 위·아래로 두 화면(200%)씩 넓혀 미리 불러온다 (10/8 CLS). 200px 이면 응답(운영 0.24~0.34초)이 오기 전에 목록 끝
      // 아래 의견 요청·푸터가 먼저 화면에 들어왔다가 새 카드에 밀려 내려갔다 — 스크롤 중 레이아웃 이동 CLS
      // 0.14~0.53(1280)·0.39~0.94(375) 실측. 한 화면(100%)은 빠른 스크롤(초당 1,700px)에서 아직 0.39~0.44 였고 두 화면에서 0.
      // 퍼센트는 뷰포트 높이 기준이라 기기마다 같은 여유가 된다. 붙은 뒤에도 센티넬이 범위 안이면 다음 쪽을 이어 받는다
      // (옵저버를 다시 걸 때 첫 콜백). 위쪽도 넓히는 건 End 키처럼 센티넬을 한 번에 지나쳐 화면 위로 올라간 경우를
      // 잡기 위해서다 — 아래만 넓혔을 땐 모바일에서 맨 끝으로 건너뛰면 다음 쪽을 영영 안 불렀다.
      // 대가: 데스크탑은 첫 화면에서 다음 쪽을 미리 받는다(스크롤 없이 서버 액션 2회, 모바일 0회)
      { rootMargin: "200% 0px 200% 0px" }
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
                  <td><StatusBadge status={programStatusLabel(p)} /></td>
                  <td className={dt.titleCell}>
                    <Link href={`/programs/${p.id}`} className={dt.titleLink}>
                      {p.title}
                    </Link>
                    {isNewProgram(p.createdAt, p.status, today) && (
                      <span className={s.newTag}>신규</span>
                    )}
                    {p.crawlGroup && (
                      <span className={s.groupTag}>외 {p.crawlGroup.others.length}개 지역</span>
                    )}
                  </td>
                  <td className={`${dt.muted} ${dt.hideOnMobile}`}>{p.region}</td>
                  {/* 수집 행의 지원 유형은 수집기 기본값 "보조금"뿐이다 — 카드 배지와 같은 규칙 (10/6 QA) */}
                  <td className={`${dt.muted} ${dt.hideOnMobile}`}>{displaySupportType(p.id, p.supportType) ?? "—"}</td>
                  {/* 수집 행의 "상세 공고 참조" 같은 채움값은 금액 칸에 쓰지 않는다 — 카드와 같은 규칙 (10/4 QA) */}
                  <td className={dt.amount}>{displayAmount(p.id, p.supportAmount) ?? "—"}</td>
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
                  <ProgramCard program={program} today={today} />
                  {program.crawlGroup && (
                    <CrawlGroupNote group={program.crawlGroup} basePath="/programs" />
                  )}
                  <PersonaScoreExplain trace={trace} subject="이 사업" />
                </article>
              );
            }
            return (
              <div
                key={program.id}
                className={`${s.programCell} ${s.cardAnim}`}
                style={{ animationDelay: animDelay }}
              >
                <ProgramCard program={program} today={today} />
                {program.crawlGroup && (
                  <CrawlGroupNote group={program.crawlGroup} basePath="/programs" />
                )}
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
