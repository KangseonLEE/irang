"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search as SearchIcon,
  X,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { CenterCard } from "@/components/region/center-card";
import type { Center } from "@/lib/data/centers";

const ITEMS_PER_PAGE = 10;
import s from "./centers-search.module.css";

/** 시·도 필터 sentinel — "전체" */
const REGION_ALL = "__all__";

interface SidoGroup {
  /** 광역 id (regions.ts Province.id와 동일) */
  id: string;
  /** 광역 짧은 이름 (예: "경기") */
  shortName: string;
  /** 해당 광역의 시·군 센터 */
  centers: Center[];
}

interface CentersSearchProps {
  sidoCenters: Center[];
  sigunguGroups: SidoGroup[];
}

/** 검색 매칭: 대소문자 무시, 공백 trim, name/sido/sigungu/slug 전체 검사 */
function matches(center: Center, q: string): boolean {
  if (!q) return true;
  const fields = [
    center.name,
    center.sido,
    center.sigungu ?? "",
    center.sidoSlug,
    center.sigunguSlug ?? "",
  ];
  const lower = q.toLowerCase();
  return fields.some((f) => f.toLowerCase().includes(lower));
}

/**
 * 광역별 시·군 데이터 테이블 모달 — 검색·페이지네이션 내장.
 * 5/27 회장 결재 — 10건/페이지, 시·군 검색, 전화 컬럼 제거 (3-컬럼).
 */
function CentersTableModal({
  group,
  onClose,
}: {
  group: SidoGroup;
  onClose: () => void;
}) {
  const [modalQuery, setModalQuery] = useState("");
  const [page, setPage] = useState(0);

  const q = modalQuery.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!q) return group.centers;
    return group.centers.filter((c) => {
      const fields = [c.name, c.sigungu ?? "", c.sigunguSlug ?? ""];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [group.centers, q]);

  // 검색어 변경 시 page 0으로 reset — setter 합쳐서 cascading render 방지
  const handleQueryChange = (next: string) => {
    setModalQuery(next);
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(
    safePage * ITEMS_PER_PAGE,
    (safePage + 1) * ITEMS_PER_PAGE,
  );

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={`${group.shortName} 시·군 센터 ${group.centers.length}곳`}
    >
      {/* 모달 검색 input */}
      <div className={s.modalSearchBox}>
        <SearchIcon
          size={16}
          aria-hidden="true"
          className={s.modalSearchIcon}
        />
        <input
          type="search"
          inputMode="search"
          value={modalQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="시·군 이름으로 찾기"
          className={s.modalSearchInput}
          aria-label="시·군 검색"
        />
        {modalQuery && (
          <button
            type="button"
            onClick={() => handleQueryChange("")}
            className={s.modalSearchClear}
            aria-label="검색어 지우기"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      <table className={s.dataTable}>
        <thead>
          <tr>
            <th scope="col" className={s.thSigungu}>시·군</th>
            <th scope="col" className={s.thName}>센터/기관</th>
            <th scope="col" className={s.thLink}>
              <span className="sr-only">홈페이지</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr>
              <td colSpan={3} className={s.tdEmpty}>
                검색 결과가 없어요.
              </td>
            </tr>
          ) : (
            paginated.map((center) => (
              <tr key={center.id}>
                <td className={s.tdSigungu}>{center.sigungu ?? "—"}</td>
                <td className={s.tdName}>{center.name}</td>
                <td className={s.tdLink}>
                  <a
                    href={center.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.externalLink}
                    aria-label={`${center.name} 홈페이지 새 창`}
                  >
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* 페이지네이션 — 총 페이지 > 1일 때만 노출 */}
      {totalPages > 1 && (
        <div className={s.pagination}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className={s.paginationButton}
            aria-label="이전 페이지"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className={s.paginationText}>
            {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className={s.paginationButton}
            aria-label="다음 페이지"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </Modal>
  );
}

export function CentersSearch({
  sidoCenters,
  sigunguGroups,
}: CentersSearchProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState<string>(REGION_ALL);
  /** 모달로 열린 광역 id. null이면 닫힘 — 사용자 명시 클릭으로만 변경. */
  const [openSidoId, setOpenSidoId] = useState<string | null>(null);
  const initialScrollDone = useRef(false);

  // URL ?q= 파라미터로 진입 시 결과 영역으로 스크롤
  useEffect(() => {
    if (initialScrollDone.current) return;
    const urlQuery = searchParams.get("q");
    if (!urlQuery) return;
    initialScrollDone.current = true;
    requestAnimationFrame(() => {
      const searchWrap = document.querySelector(`.${s.searchWrap}`);
      searchWrap?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [searchParams]);

  const q = query.trim();
  const hasQuery = q.length > 0;
  const hasRegion = region !== REGION_ALL;
  const matchesRegion = (id: string) => !hasRegion || id === region;

  const filteredSido = useMemo(
    () =>
      sidoCenters.filter((c) => matches(c, q) && matchesRegion(c.sidoSlug)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sidoCenters, q, region],
  );

  const filteredGroups = useMemo(
    () =>
      sigunguGroups
        .filter((g) => matchesRegion(g.id))
        .map((g) => ({
          ...g,
          centers: g.centers.filter((c) => matches(c, q)),
        }))
        .filter((g) => g.centers.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sigunguGroups, q, region],
  );

  const totalMatches =
    filteredSido.length +
    filteredGroups.reduce((sum, g) => sum + g.centers.length, 0);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => setQuery("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && query) {
      e.preventDefault();
      setQuery("");
    }
  };

  return (
    <>
      {/* ── 광역(시·도) 센터 — 2열 featured ── */}
      {filteredSido.length > 0 && (
        <section className={s.sidoSection} aria-label="광역 시·도 센터">
          <div className={s.sectionHeader}>
            <div className={s.sectionTitleRow}>
              <h2 className={s.sectionTitle}>광역 거점 센터</h2>
              <span className={s.sectionCount}>{filteredSido.length}곳</span>
            </div>
            <p className={s.sectionDesc}>
              {hasQuery
                ? "검색 결과예요."
                : "시·도 단위 귀농귀촌지원센터예요. 홈페이지에서 자세히 확인해 보세요."}
            </p>
          </div>
          <div className={s.sidoGrid}>
            {filteredSido.map((center) => (
              <CenterCard key={center.id} center={center} showSidoLabel />
            ))}
          </div>
        </section>
      )}

      {/* ── 시·군 센터 (광역별 그룹) — sticky 검색·필터가 이 섹션 컨테이너 안에 한정 ── */}
      <section className={s.sigunguSection} aria-label="시·군 센터">
        <div className={s.sectionHeader}>
          <div className={s.sectionTitleRow}>
            <h2 className={s.sectionTitle}>시·군 센터</h2>
            <span className={s.sectionCount}>
              {filteredGroups.reduce((n, g) => n + g.centers.length, 0)}곳
            </span>
          </div>
          <p className={s.sectionDesc}>
            {hasQuery
              ? "검색 결과예요."
              : "광역을 열어 시·군 센터를 확인해 보세요."}
          </p>
        </div>

        {/* sticky: 시·군 섹션 컨테이너 안에서만 sticky → 섹션 벗어나면 자동 해제 */}
        <div className={s.searchWrap}>
          <div className={s.searchBox}>
            <SearchIcon
              size={18}
              aria-hidden="true"
              className={s.searchIcon}
            />
            <input
              type="search"
              inputMode="search"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="시·군 센터 이름으로 찾기"
              className={s.searchInput}
              aria-label="시·군 센터 검색"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className={s.clearButton}
                aria-label="검색어 지우기"
              >
                <X size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* 모바일: <details> 드롭다운(기본 닫힘) / 데스크탑(≥640px): chip 항상 노출 */}
          <details className={s.filterDetails}>
            <summary className={s.filterSummary}>
              <span className={s.filterSummaryLabel}>
                지역 필터
                <span className={s.filterSummarySelection}>
                  {hasRegion
                    ? sigunguGroups.find((g) => g.id === region)?.shortName ?? "전체"
                    : "전체"}
                </span>
              </span>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={s.filterSummaryChevron}
              />
            </summary>
            <div
              className={s.filterChips}
              role="group"
              aria-label="시·도 필터"
            >
              <button
                type="button"
                onClick={() => setRegion(REGION_ALL)}
                className={s.filterChip}
                aria-pressed={!hasRegion}
                data-active={!hasRegion}
              >
                전체
              </button>
              {sigunguGroups.map((g) => {
                const active = region === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setRegion(active ? REGION_ALL : g.id)}
                    className={s.filterChip}
                    aria-pressed={active}
                    data-active={active}
                  >
                    <span>{g.shortName}</span>
                    <span className={s.filterChipCount}>{g.centers.length}</span>
                  </button>
                );
              })}
            </div>
          </details>
        </div>

        {hasQuery && totalMatches === 0 && (
          <EmptyState
            icon={<SearchIcon size={20} aria-hidden="true" />}
            message="찾는 지역이 아직 없어요. 다른 키워드로 시도해 보세요."
          />
        )}

        {filteredGroups.length > 0 && (
          <div className={s.groupList}>
            {filteredGroups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setOpenSidoId(group.id)}
                className={s.groupButton}
                aria-label={`${group.shortName} 시·군 센터 ${group.centers.length}곳 보기`}
                aria-haspopup="dialog"
              >
                <span className={s.groupName}>{group.shortName}</span>
                <span className={s.groupCount}>{group.centers.length}곳</span>
                <ChevronRight
                  size={16}
                  aria-hidden="true"
                  className={s.groupChevron}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 광역별 시·군 데이터 테이블 모달 — 검색·페이지네이션 내장 */}
      {(() => {
        const openGroup = filteredGroups.find((g) => g.id === openSidoId);
        if (!openGroup) return null;
        return (
          <CentersTableModal
            group={openGroup}
            onClose={() => setOpenSidoId(null)}
          />
        );
      })()}
    </>
  );
}
