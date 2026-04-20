"use client";

import { useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { IrangSearch as Search } from "@/components/ui/irang-search";
import { Icon } from "@/components/ui/icon";
import { DataSource } from "@/components/ui/data-source";
import s from "./modals.module.css";

/** 필터 옵션 */
export interface FilterOption {
  label: string;
  value: string;
}

/** PaginatedListModal에 넘길 Props (제네릭) */
export interface PaginatedListModalProps<T> {
  /** 지역 요약 텍스트에 들어갈 이름 */
  provinceShortName: string;
  /** 전체 건수 (서버에서 받은 totalCount) */
  totalCount: number;
  /** API endpoint (예: "/api/medical-list") */
  endpoint: string;
  /** API 쿼리 파라미터 (page 제외) */
  params: Record<string, string>;
  /** 유형별 필터 옵션 배열 (첫 번째는 "전체"여야 함) */
  filters: readonly FilterOption[];
  /** 검색 placeholder 텍스트 */
  searchPlaceholder: string;
  /** 로딩 배너에 표시할 항목 명칭 (예: "의료기관", "학교") */
  itemLabel: string;
  /** "데이터가 많아..." 안내가 뜨는 임계값 */
  loadingThreshold?: number;
  /** 아이템 렌더 함수 */
  renderItem: (item: T, index: number) => ReactNode;
  /** 아이템 고유 키 추출 함수 */
  itemKey: (item: T, index: number) => string;
  /** 필터 매칭 함수: typeCount에서 해당 필터 value의 카운트를 계산 */
  filterMatchCount?: (
    typeCount: Record<string, number>,
    filterValue: string
  ) => number;
  /** DataSource 출처 */
  dataSource: string;
  /** DataSource 부가 안내 */
  dataSourceNote?: string;
}

/** 네이버 지도 검색 URL */
export function naverMapUrl(name: string) {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name)}`;
}

/**
 * 페이지네이션 + 검색 + 필터 기능이 있는 리스트 모달 공통 컴포넌트.
 * MedicalModal, SchoolModal 등에서 래핑하여 사용합니다.
 */
export function PaginatedListModal<
  T extends { name: string; type: string; address: string },
>({
  provinceShortName,
  totalCount,
  endpoint,
  params,
  filters,
  searchPlaceholder,
  itemLabel,
  loadingThreshold = 500,
  renderItem,
  itemKey,
  filterMatchCount,
  dataSource,
  dataSourceNote = "항목을 누르면 네이버 지도에서 확인할 수 있어요",
}: PaginatedListModalProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ── 검색 & 필터 상태 ──
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const isInitialLoad = loading && page === 1;
  const isLoadingMore = loading && page > 1;

  // ── API 파라미터 직렬화 (의존성 안정화용) ──
  const paramString = useMemo(
    () =>
      Object.entries(params)
        .filter(([, v]) => v)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&"),
    [params]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchList() {
      setLoading(true);
      try {
        const url = `${endpoint}?${paramString}&page=${page}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled) {
          const newItems: T[] = json.items || [];
          setItems((prev) => {
            const next = page === 1 ? newItems : [...prev, ...newItems];
            setHasMore(next.length < (json.totalCount || 0));
            return next;
          });
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
  }, [endpoint, paramString, page]);

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

  // ── 필터 매칭 카운트 기본 구현: includes 기반 ──
  const defaultFilterMatchCount = useCallback(
    (tc: Record<string, number>, filterValue: string) =>
      Object.entries(tc)
        .filter(([type]) => type.includes(filterValue))
        .reduce((sum, [, c]) => sum + c, 0),
    []
  );

  const getFilterMatchCount = filterMatchCount ?? defaultFilterMatchCount;

  return (
    <div className={s.modalContent}>
      <p className={s.summary}>
        {provinceShortName} 지역에 등록된 {itemLabel} 총{" "}
        <strong>{totalCount.toLocaleString()}개</strong>
      </p>

      {/* ── 검색 ── */}
      {!isInitialLoad && items.length > 0 && (
        <div className={s.searchWrapper}>
          <Icon icon={Search} size="md" className={s.searchIcon} />
          <input
            type="text"
            className={s.searchInput}
            placeholder={searchPlaceholder}
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
              {itemLabel} {totalCount.toLocaleString()}건을 불러오고 있어요
            </p>
            {totalCount > loadingThreshold && (
              <p className={s.loadingBannerDesc}>
                데이터가 많아 조회에 시간이 걸릴 수 있어요
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
          {filters.map(({ label, value }) => {
            const matchCount = value
              ? getFilterMatchCount(typeCount, value)
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
                {value && (
                  <span className={s.filterChipCount}>{matchCount}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── 필터/검색 결과 카운트 ── */}
      {!isInitialLoad && (activeFilter || searchQuery) && (
        <p className={s.filterResult}>
          {filteredItems.length === 0
            ? "조건에 맞는 결과가 없어요"
            : `${filteredItems.length.toLocaleString()}건 표시 중`}
        </p>
      )}

      {/* ── 리스트 ── */}
      {!isInitialLoad && filteredItems.length > 0 && (
        <div className={s.list}>
          {filteredItems.map((item, i) => (
            <a
              key={itemKey(item, i)}
              href={naverMapUrl(item.name)}
              target="_blank"
              rel="noopener noreferrer"
              className={s.listItemLink}
            >
              {renderItem(item, i)}
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
        <div className={s.loadingText}>데이터를 불러올 수 없어요.</div>
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

      <DataSource source={dataSource} note={dataSourceNote} />
    </div>
  );
}
