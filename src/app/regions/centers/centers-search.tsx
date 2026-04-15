"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { ChevronDown, Search as SearchIcon, X } from "lucide-react";
import { CardGrid } from "@/components/ui/card-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { CenterCard } from "@/components/region/center-card";
import type { Center } from "@/lib/data/centers";
import s from "./centers-search.module.css";

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
  const [query, setQuery] = useState("");
  const groupRefs = useRef<Record<string, HTMLDetailsElement | null>>({});

  const q = query.trim();
  const hasQuery = q.length > 0;

  const filteredSido = useMemo(
    () => sidoCenters.filter((c) => matches(c, q)),
    [sidoCenters, q],
  );

  const filteredGroups = useMemo(
    () =>
      sigunguGroups
        .map((g) => ({
          ...g,
          centers: g.centers.filter((c) => matches(c, q)),
        }))
        .filter((g) => g.centers.length > 0),
    [sigunguGroups, q],
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

  const jumpTo = (id: string) => {
    const el = groupRefs.current[id];
    if (!el) return;
    el.open = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ── 검색 + 퀵점프 ── */}
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
            placeholder="지역명으로 찾기 (예: 남양주, 전남, gyeonggi)"
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

        <nav
          className={s.quickJump}
          role="navigation"
          aria-label="광역으로 바로 이동"
        >
          {sigunguGroups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => jumpTo(g.id)}
              className={s.quickChip}
            >
              <span>{g.shortName}</span>
              <span className={s.quickChipCount}>{g.centers.length}</span>
            </button>
          ))}
        </nav>
      </div>

      {hasQuery && totalMatches === 0 && (
        <EmptyState
          icon={<SearchIcon size={20} aria-hidden="true" />}
          message="찾는 지역이 아직 없어요. 다른 키워드로 시도해 보세요."
        />
      )}

      {/* ── 광역(시·도) 센터 ── */}
      {filteredSido.length > 0 && (
        <section className={s.section} aria-label="광역 시·도 센터">
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>광역 시·도 센터</h2>
            <p className={s.sectionDesc}>
              {hasQuery
                ? `검색 결과 ${filteredSido.length}곳이에요.`
                : `전국 ${sidoCenters.length}개 광역 귀농귀촌지원센터예요.`}
            </p>
          </div>
          <CardGrid>
            {filteredSido.map((center) => (
              <CenterCard key={center.id} center={center} showSidoLabel />
            ))}
          </CardGrid>
        </section>
      )}

      {/* ── 시·군 센터 (광역별 그룹) ── */}
      {filteredGroups.length > 0 && (
        <section className={s.section} aria-label="시·군 센터">
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>시·군 센터</h2>
            <p className={s.sectionDesc}>
              {hasQuery
                ? `검색 결과 ${filteredGroups.reduce(
                    (n, g) => n + g.centers.length,
                    0,
                  )}곳이에요.`
                : "광역을 열어 시·군 센터를 확인해 보세요."}
            </p>
          </div>

          <div className={s.groupList}>
            {filteredGroups.map((group) => (
              <details
                key={group.id}
                id={`group-${group.id}`}
                ref={(el) => {
                  groupRefs.current[group.id] = el;
                }}
                className={s.group}
                open={hasQuery}
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
