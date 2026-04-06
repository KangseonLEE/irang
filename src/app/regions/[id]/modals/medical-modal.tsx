"use client";

import { useEffect, useState } from "react";
import s from "./modals.module.css";

interface MedicalItem {
  name: string;
  type: string;
  address: string;
  tel: string;
}

interface MedicalModalProps {
  provinceShortName: string;
  totalCount: number;
  hiraSidoCd: string;
  sgguCd?: string;
}

export function MedicalModal({
  provinceShortName,
  totalCount,
  hiraSidoCd,
  sgguCd,
}: MedicalModalProps) {
  const [items, setItems] = useState<MedicalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const isInitialLoad = loading && page === 1;
  const isLoadingMore = loading && page > 1;

  useEffect(() => {
    let cancelled = false;

    async function fetchList() {
      setLoading(true);
      try {
        const sgguParam = sgguCd ? `&sgguCd=${sgguCd}` : "";
        const res = await fetch(
          `/api/medical-list?sidoCd=${hiraSidoCd}${sgguParam}&page=${page}`
        );
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (!cancelled) {
          const newItems: MedicalItem[] = json.items || [];
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
  }, [hiraSidoCd, sgguCd, page]);

  // 유형별 그룹핑
  const typeCount = items.reduce<Record<string, number>>((acc, item) => {
    const type = item.type || "기타";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={s.modalContent}>
      <p className={s.summary}>
        {provinceShortName} 지역에 등록된 의료기관 총{" "}
        <strong>{totalCount.toLocaleString()}개</strong>
      </p>

      {/* 초기 로딩 — 안내 배너 + 스켈레톤 */}
      {isInitialLoad && (
        <>
          <div className={s.loadingBanner}>
            <div className={s.spinner} />
            <p className={s.loadingBannerTitle}>
              의료기관 {totalCount.toLocaleString()}건을 불러오고 있습니다
            </p>
            {totalCount > 500 && (
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

      {/* 유형별 요약 */}
      {!isInitialLoad && Object.keys(typeCount).length > 0 && (
        <div className={s.badgeGroup}>
          {Object.entries(typeCount)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <span key={type} className={s.badge}>
                {type} {count}
              </span>
            ))}
        </div>
      )}

      {/* 리스트 */}
      {!isInitialLoad && items.length > 0 && (
        <div className={s.list}>
          {items.map((item, i) => (
            <div key={`${item.name}-${i}`} className={s.listItem}>
              <div className={s.listItemMain}>
                <span className={s.listItemName}>{item.name}</span>
                <span className={s.listItemMeta}>{item.type}</span>
              </div>
              <span className={s.listItemSub}>{item.address}</span>
            </div>
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

      <p className={s.source}>출처: 건강보험심사평가원</p>
    </div>
  );
}
