"use client";

import Link from "next/link";
import { trendingSearches } from "@/lib/data/landing";
import s from "./trending-searches.module.css";

interface TrendingItem {
  label: string;
  query: string;
}

interface TrendingSearchesProps {
  /** 서버에서 가져온 실데이터 (Supabase 인기 검색어) */
  serverTrending?: { query: string; count: number }[];
}

/**
 * 히어로 하단 — 인기 검색어 세로 로테이션.
 * 고정 라벨 + 키워드만 위로 슬라이드하며 자동 전환.
 * 클릭 시 /search?q= 로 이동.
 *
 * 데이터 우선순위:
 * 1. serverTrending (Supabase 최근 7일 실데이터, 최소 5개 이상일 때)
 * 2. 큐레이션 폴백 (landing.ts trendingSearches)
 */
export function TrendingSearches({ serverTrending }: TrendingSearchesProps) {
  // 실데이터가 5개 이상이면 사용, 아니면 큐레이션 폴백
  const MIN_REAL_DATA = 5;
  const hasRealData = serverTrending && serverTrending.length >= MIN_REAL_DATA;

  const items: TrendingItem[] = hasRealData
    ? serverTrending.map((t) => ({ label: t.query, query: t.query }))
    : trendingSearches;

  const count = items.length;

  return (
    <div className={s.wrapper}>
      <span className={s.label}>지금 많이 검색하는</span>

      <div
        className={s.roller}
        aria-label="인기 검색어"
        style={{ "--item-count": count } as React.CSSProperties}
      >
        <div className={s.track}>
          {/* 심리스 루프를 위해 첫 아이템을 끝에 한 번 더 */}
          {[...items, items[0]].map((item, i) => (
            <Link
              key={`${item.query}-${i}`}
              href={`/search?q=${encodeURIComponent(item.query)}`}
              className={s.item}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
