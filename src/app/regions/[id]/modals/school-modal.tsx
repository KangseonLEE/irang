"use client";

import { useEffect, useState } from "react";
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

  // 유형별 그룹핑
  const typeCount = items.reduce<Record<string, number>>((acc, item) => {
    const type = item.type || "기타";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={s.modalContent}>
      <p className={s.summary}>
        {provinceShortName} 지역에 등록된 학교 총{" "}
        <strong>{totalCount.toLocaleString()}개</strong>
      </p>

      {/* 유형별 요약 */}
      {Object.keys(typeCount).length > 0 && (
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
      <div className={s.list}>
        {items.map((item, i) => (
          <div key={`${item.name}-${i}`} className={s.listItem}>
            <div className={s.listItemMain}>
              <span className={s.listItemName}>{item.name}</span>
              <span className={s.listItemMeta}>
                {item.type}
                {item.foundType ? ` · ${item.foundType}` : ""}
              </span>
            </div>
            <span className={s.listItemSub}>{item.address}</span>
          </div>
        ))}
      </div>

      {loading && <div className={s.loadingText}>불러오는 중...</div>}
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

      <p className={s.source}>출처: 교육부 NEIS</p>
    </div>
  );
}
