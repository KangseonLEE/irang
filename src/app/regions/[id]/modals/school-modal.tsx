"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { MapPin } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { Icon } from "@/components/ui/icon";
import { DataSource } from "@/components/ui/data-source";
import s from "./modals.module.css";

interface SchoolItem {
  name: string;
  type: string;
  address: string;
  foundType: string;
}

interface SchoolModalProps {
  provinceShortName: string;
  totalCount: number;
  eduCode: string;
  sigunguName?: string;
}

/** 네이버 지도 검색 URL (학교명만 검색) */
function naverMapUrl(name: string) {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
}

/** 학교 유형 필터 옵션 */
const SCHOOL_FILTERS = [
  { label: "전체", value: "" },
  { label: "초등학교", value: "초등학교" },
  { label: "중학교", value: "중학교" },
  { label: "고등학교", value: "고등학교" },
  { label: "특수학교", value: "특수학교" },
] as const;

export function SchoolModal({
  provinceShortName,
  totalCount,
  eduCode,
  sigunguName,
}: SchoolModalProps) {
  const [items, setItems] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ── 검색 & 필터 상태 ──
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const isInitialLoad = loading && page === 1;
  const isLoadingMore = loading && page > 1;

  useEffect(() => {
    let cancelled = false;

    async function fetchList() {
      setLoading(true);
      try {
        const sgguParam = sigunguName ? `&sigunguName=${encodeURIComponent(sigunguName)}` : "";
        const res = await fetch(
          `/api/school-list?eduCode=${eduCode}${sgguParam}&page=${page}`
        );
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled) {
          const newItems: SchoolItem[] = json.items || [];
          setItems((prev) => (page === 1 ? newItems : [...prev, ...newItems]));
          setHasMore(items.length + newItems.length < (json.totalCount || 0));
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchList();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eduCode, sigunguName, page]);

  // ── 유형별 카운트 ──
  const typeCount = useMemo(
    () =>
      items.reduce<Record<string, number>>((acc, item) => {
        const type = item.type || "기타";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    [items]
  );

  // ── 검색 + 필터 적용 ──
  const filteredItems = useMemo(() => {
    let result = items;
    if (activeFilter) {
      result = result.filter((item) => item.type.includes(activeFilter));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeFilter, searchQuery]);

  const handleFilterClick = useCallback((value: string) => {
    setActiveFilter((prev) => (prev === value ? "" : value));
  }, []);

  return (
    <div className={s.modalContent}>
      <p className={s.summary}>
        {provinceShortName} 지역에 등록된 학교 총{" "}
        <strong>{totalCount.toLocaleString()}개</strong>
      </p>

      {/* ── 검색 ── */}
      {!isInitialLoad && items.length > 0 && (
        <div className={s.searchWrapper}>
          <Icon icon={Search} size="md" className={s.searchIcon} />
          <input
            type="text"
            className={s.searchInput}
            placeholder="학교명 또는 주소 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className={s.searchClear}
              onClick={() => setSearchQuery("")}
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* 초기 로딩 — 안내 배너 + 스켈레톤 */}
      {isInitialLoad && (
        <>
          <div className={s.loadingBanner}>
            <div className={s.spinner} />
            <p className={s.loadingBannerTitle}>
              학교 {totalCount.toLocaleString()}건을 불러오고 있습니다
            </p>
            {totalCount > 300 && (
              <p className={s.loadingBannerDesc}>
                데이터가 많아 조회에 시간이 걸릴 수 있습니다
              </p>
            )}
          </div>
          <div className={s.skeletonList}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={s.skeletonItem}>
                <div className={s.skeletonLine} />
                <div className={s.skeletonLine} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 유형별 필터 (토글) ── */}
      {!isInitialLoad && Object.keys(typeCount).length > 0 && (
        <div className={s.filterGroup}>
          {SCHOOL_FILTERS.map(({ label, value }) => {
            const matchCount = value
              ? typeCount[value] ?? 0
              : items.length;
            if (value && matchCount === 0) return null;
            const isActive = activeFilter === value;
            return (
              <button
                key={label}
                type="button"
                className={`${s.filterChip} ${isActive ? s.filterChipActive : ""}`}
                onClick={() => handleFilterClick(value)}
              >
                {label}
                {value && <span className={s.filterChipCount}>{matchCount}</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 필터/검색 결과 카운트 ── */}
      {!isInitialLoad && (activeFilter || searchQuery) && (
        <p className={s.filterResult}>
          {filteredItems.length === 0
            ? "조건에 맞는 결과가 없습니다"
            : `${filteredItems.length.toLocaleString()}건 표시 중`}
        </p>
      )}

      {/* ── 리스트 (네이버 지도 연결) ── */}
      {!isInitialLoad && filteredItems.length > 0 && (
        <div className={s.list}>
          {filteredItems.map((item, i) => (
            <a
              key={`${item.name}-${i}`}
              href={naverMapUrl(item.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={s.listItemLink}
            >
              <div className={s.listItemMain}>
                <span className={s.listItemName}>{item.name}</span>
                <span className={s.listItemMeta}>
                  {item.type}
                  {item.foundType ? ` · ${item.foundType}` : ""}
                </span>
              </div>
              <div className={s.listItemBottom}>
                <span className={s.listItemSub}>{item.address}</span>
                <span className={s.listItemMapHint}>
                  <Icon icon={MapPin} size="xs" />
                  지도
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* 추가 페이지 로딩 */}
      {isLoadingMore && (
        <div className={s.inlineLoading}>
          <div className={s.inlineSpinner} />
          추가 데이터를 불러오는 중...
        </div>
      )}

      {error && (
        <div className={s.loadingText}>데이터를 불러올 수 없습니다.</div>
      )}

      {!loading && !error && hasMore && (
        <button
          type="button"
          className={s.loadMoreBtn}
          onClick={() => setPage((p) => p + 1)}
        >
          더 보기
        </button>
      )}

      <DataSource source="교육부 NEIS" note="항목을 누르면 네이버 지도에서 확인할 수 있습니다" />
    </div>
  );
}
