/**
 * 통합 검색 인덱스
 * - 지역(Station), 작물(Crop), 지원사업(Program) 데이터를 단일 검색 인덱스로 통합
 * - 클라이언트 사이드 fuzzy-ish 검색 (debounce + prefix match)
 */

import { STATIONS } from "./stations";
import { CROPS } from "./crops";
import { PROGRAMS } from "./programs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchItem {
  type: "region" | "crop" | "program";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  keywords: string[];
  icon: string;
  badge?: string;
}

export interface SearchTag {
  label: string;
  query: string;
  type: "search" | "link";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** 문자열을 maxLen 이하로 잘라서 말줄임표 붙이기 */
function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + "...";
}

// ---------------------------------------------------------------------------
// Build index
// ---------------------------------------------------------------------------

const regionItems: SearchItem[] = STATIONS.map((s) => ({
  type: "region" as const,
  id: s.stnId,
  title: s.name,
  subtitle: truncate(`${s.province} · ${s.description}`, 40),
  href: `/regions?station=${s.stnId}`,
  keywords: [s.province],
  icon: "\u{1F4CD}", // 📍
}));

const cropItems: SearchItem[] = CROPS.map((c) => ({
  type: "crop" as const,
  id: c.id,
  title: c.name,
  subtitle: truncate(c.description, 50),
  href: `/crops/${c.id}`,
  keywords: [c.category, c.difficulty],
  icon: c.emoji,
  badge: c.category,
}));

const programItems: SearchItem[] = PROGRAMS.map((p) => ({
  type: "program" as const,
  id: p.id,
  title: p.title,
  subtitle: truncate(p.summary, 50),
  href: `/programs/${p.id}`,
  keywords: [p.region, p.supportType, ...p.relatedCrops],
  icon: "\u{1F4CB}", // 📋
  badge: p.status,
}));

export const SEARCH_INDEX: SearchItem[] = [
  ...regionItems,
  ...cropItems,
  ...programItems,
];

// ---------------------------------------------------------------------------
// Popular tags
// ---------------------------------------------------------------------------

export const POPULAR_TAGS: SearchTag[] = [
  { label: "#순천", query: "순천", type: "search" },
  { label: "#블루베리", query: "블루베리", type: "search" },
  { label: "#보조금", query: "보조금", type: "search" },
  { label: "#모집중", query: "모집중", type: "search" },
  { label: "#초보추천", query: "쉬움", type: "search" },
  { label: "#과수", query: "과수", type: "search" },
  { label: "#전남", query: "전남", type: "search" },
  { label: "#교육지원", query: "교육", type: "search" },
];

// ---------------------------------------------------------------------------
// Search function
// ---------------------------------------------------------------------------

/**
 * 통합 검색 — 대소문자 무시, title / subtitle / keywords 에서 매칭.
 * 최대 8개 반환, 타입별 최대 3개.
 */
export function searchItems(query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const matches = SEARCH_INDEX.filter((item) => {
    if (item.title.toLowerCase().includes(q)) return true;
    if (item.subtitle.toLowerCase().includes(q)) return true;
    if (item.keywords.some((kw) => kw.toLowerCase().includes(q))) return true;
    if (item.badge?.toLowerCase().includes(q)) return true;
    return false;
  });

  // 타입별로 분류
  const byType: Record<SearchItem["type"], SearchItem[]> = {
    region: [],
    crop: [],
    program: [],
  };

  for (const item of matches) {
    if (byType[item.type].length < 3) {
      byType[item.type].push(item);
    }
  }

  const results = [
    ...byType.region,
    ...byType.crop,
    ...byType.program,
  ];

  return results.slice(0, 8);
}
