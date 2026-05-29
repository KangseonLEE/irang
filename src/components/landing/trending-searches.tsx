"use client";

import { useMemo } from "react";
import Link from "next/link";
import { trendingSearches } from "@/lib/data/landing";
import { searchAll } from "@/lib/data/search-index";
import s from "./trending-searches.module.css";

/** 아이템 수에 맞는 @keyframes를 동적 생성 (4.5초/키워드 고정) */
function buildRollKeyframes(itemCount: number): string {
  const slots = itemCount + 1; // 심리스 루프를 위한 복제 슬롯 포함
  const step = 100 / slots;
  const hold = step * 0.65; // 65% 정지, 35% 전환

  let kf = "@keyframes trendRoll {\n";
  for (let i = 0; i < slots; i++) {
    const start = +(i * step).toFixed(2);
    const end = i === slots - 1 ? 100 : +(i * step + hold).toFixed(2);
    kf += `  ${start}%,${end}% { transform: translateY(calc(${-i} * var(--row-h))) }\n`;
  }
  kf += "}";
  return kf;
}

/**
 * 히어로 하단 — 인기 검색어 세로 로테이션.
 * 고정 라벨 + 키워드만 위로 슬라이드하며 자동 전환.
 * 클릭 시 /search?q= 로 이동.
 *
 * 키워드는 큐레이션 SSOT(`POPULAR_KEYWORDS` → landing.ts `trendingSearches`)로 고정한다.
 * 검색 오버레이 "인기 검색어"와 항상 동일 (2026-05-29 회장 결재 — 실데이터 경로 제거).
 *
 * ⚠ 검색 결과가 없는 키워드는 표시하지 않음 (사용자가 클릭해도 빈 결과가 나오므로)
 */
export function TrendingSearches() {
  // 검색 인덱스에 결과가 있는 키워드만 표시
  const items = useMemo(
    () => trendingSearches.filter((item) => searchAll(item.query).length > 0),
    [],
  );

  const count = items.length;

  // 아이템 수에 맞는 키프레임 동적 생성 (4.5s/키워드 고정)
  const rollCSS = useMemo(() => buildRollKeyframes(count), [count]);

  // 표시할 키워드가 없으면 렌더링하지 않음
  if (count === 0) return null;

  return (
    <div className={s.wrapper}>
      {/* 아이템 수에 맞는 동적 키프레임 주입 */}
      <style>{rollCSS}</style>

      <span className={s.label}>지금 많이 찾는 키워드는</span>

      <div
        className={s.roller}
        aria-label="인기 검색어"
      >
        <div
          className={s.track}
          style={{
            animationName: "trendRoll",
            animationDuration: `${count * 4.5}s`,
          }}
        >
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
