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
import { ChevronDown, Search as SearchIcon, X } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { CenterCard } from "@/components/region/center-card";
import type { Center } from "@/lib/data/centers";
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

export function CentersSearch({
  sidoCenters,
  sigunguGroups,
}: CentersSearchProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState<string>(REGION_ALL);
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
      {/* ── 검색 + 시·도 필터 ── */}
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
            placeholder="지역명으로 센터 찾기"
            className={s.searchInput}
            aria-label="지역명 검색"
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
      </div>

      {hasQuery && totalMatches === 0 && (
        <EmptyState
          icon={<SearchIcon size={20} aria-hidden="true" />}
          message="찾는 지역이 아직 없어요. 다른 키워드로 시도해 보세요."
        />
      )}

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
                : "시·도 단위 귀농귀촌지원센터예요. 전화로 바로 상담할 수 있어요."}
            </p>
          </div>
          <div className={s.sidoGrid}>
            {filteredSido.map((center) => (
              <CenterCard key={center.id} center={center} showSidoLabel />
            ))}
          </div>
        </section>
      )}

      {/* ── 시·군 센터 (광역별 그룹) ── */}
      {filteredGroups.length > 0 && (
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

          <div className={s.groupList}>
            {filteredGroups.map((group) => (
              <details
                key={group.id}
                id={`group-${group.id}`}
                className={s.group}
                open={hasQuery || hasRegion}
              >
                <summary className={s.groupSummary}>
                  <span className={s.groupName}>{group.shortName}</span>
                  <span className={s.groupCount}>{group.centers.length}곳</span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={s.groupChevron}
                  />
                </summary>
                <div className={s.groupBody}>
                  <div className={s.compactList}>
                    {group.centers.map((center) => (
                      <CenterCard
                        key={center.id}
                        center={center}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
