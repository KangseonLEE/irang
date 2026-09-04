"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { isChosungQuery, matchChosung } from "@/lib/chosung";
import s from "./sigungu-list.module.css";

interface SigunguItem {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  mainCrops: string[];
}

interface SigunguListProps {
  provinceId: string;
  sigungus: SigunguItem[];
  /**
   * SigunguExplorer의 데스크탑 split 우측 패널처럼 좁은 폭에서 사용할 때 true.
   * 카드 그리드를 항상 1열로 강제하여 320~420px 영역에 자연스럽게 들어가게 한다.
   */
  compact?: boolean;
}

const PAGE_SIZE = 5;

/**
 * 시군구 리스트 — 검색 + 페이지네이션 클라이언트 컴포넌트.
 * Server Component에서 sigungus 전체를 props로 받으므로 SEO·SSG는 그대로 유지.
 * 클라이언트 hydration 후 검색·페이지 전환 인터랙션 제공.
 */
export function SigunguList({ provinceId, sigungus, compact = false }: SigunguListProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // 모바일/데스크탑/compact 모두 페이지 5건으로 통일.
  // - 모바일 단독 사용: 5건 1열로 깔끔
  // - 데스크탑 단독 사용 (구형): 5건 2~3열로 자연스러움
  // - compact (split 우측 패널): 5건 1열로 한 화면에 들어감
  const pageSize = PAGE_SIZE;

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return sigungus;
    const chosung = isChosungQuery(q);
    return sigungus.filter((sg) => {
      if (sg.name.includes(q)) return true;
      if (sg.shortName?.includes(q)) return true;
      if (chosung && matchChosung(sg.name, q)) return true;
      if (sg.description.includes(q)) return true;
      return sg.mainCrops.some((c) => c.includes(q));
    });
  }, [query, sigungus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const visible = filtered.slice(startIdx, startIdx + pageSize);

  return (
    <div className={`${s.wrap} ${compact ? s.compact : ""}`}>
      {/* 검색 바 */}
      <div className={s.searchBar}>
        <Icon icon={Search} size="sm" className={s.searchIcon} />
        <input
          type="search"
          inputMode="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="시·군·구 이름이나 작물로 검색해 보세요"
          className={s.searchInput}
          aria-label="시·군·구 검색"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setPage(1);
            }}
            className={s.clearButton}
            aria-label="검색어 지우기"
          >
            ×
          </button>
        )}
      </div>

      {/* 결과 카운트 */}
      <p className={s.resultCount}>
        {query ? (
          <>
            <strong>{filtered.length}</strong>개 일치 · 총 {sigungus.length}개
          </>
        ) : (
          <>
            총 <strong>{sigungus.length}</strong>개 시·군·구
          </>
        )}
      </p>

      {/* 카드 그리드 */}
      {visible.length > 0 ? (
        <div className={s.grid}>
          {visible.map((sg) => (
            <Link
              key={sg.id}
              href={`/regions/${provinceId}/${sg.id}`}
              className={s.card}
            >
              <h3 className={s.name}>{sg.name}</h3>
              <p className={s.desc}>
                <AutoGlossary text={sg.description} />
              </p>
              {sg.mainCrops.length > 0 && (
                <div className={s.crops}>
                  {sg.mainCrops.slice(0, 3).map((crop) => (
                    <span key={crop} className={s.crop}>
                      {crop}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <p>‘{query}’에 해당하는 시·군·구가 없어요.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setPage(1);
            }}
            className={s.emptyClear}
          >
            검색어 초기화
          </button>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <nav className={s.pagination} aria-label="시·군·구 페이지 이동">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={s.pageBtn}
            aria-label="이전 페이지"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const active = n === currentPage;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`${s.pageBtn} ${active ? s.pageBtnActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {n}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={s.pageBtn}
            aria-label="다음 페이지"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
