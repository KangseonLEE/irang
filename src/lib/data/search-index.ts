/**
 * 통합 검색 인덱스
 * - 지역(Station), 작물(Crop), 지원사업(Program) 데이터를 단일 검색 인덱스로 통합
 * - 클라이언트 사이드 fuzzy-ish 검색 (debounce + prefix match)
 */

import { STATIONS } from "./stations";
import { CROPS } from "./crops";
import { PROGRAMS } from "./programs";
import { EDUCATION_COURSES } from "./education";
import { EVENTS } from "./events";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchItem {
  type: "region" | "crop" | "program" | "education" | "event";
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
  href: `/regions?stations=${s.stnId}`,
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

const educationItems: SearchItem[] = EDUCATION_COURSES.map((e) => ({
  type: "education" as const,
  id: e.id,
  title: e.title,
  subtitle: truncate(e.description, 50),
  href: `/education/${e.id}`,
  keywords: [e.region, e.type, e.level, e.organization],
  icon: "\u{1F393}", // 🎓
  badge: e.status,
}));

const eventItems: SearchItem[] = EVENTS.map((e) => ({
  type: "event" as const,
  id: e.id,
  title: e.title,
  subtitle: truncate(e.description, 50),
  href: `/events/${e.id}`,
  keywords: [e.region, e.type, e.organization, e.target],
  icon: "\u{1F389}", // 🎉
  badge: e.status,
}));

export const SEARCH_INDEX: SearchItem[] = [
  ...regionItems,
  ...cropItems,
  ...programItems,
  ...educationItems,
  ...eventItems,
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
 * 통합 검색 (드롭다운용) — 최대 8개 반환, 타입별 최대 3개.
 */
export function searchItems(query: string): SearchItem[] {
  const all = searchAll(query);

  // 타입별로 분류
  const byType: Record<SearchItem["type"], SearchItem[]> = {
    region: [],
    crop: [],
    program: [],
    education: [],
    event: [],
  };

  for (const item of all) {
    if (byType[item.type].length < 3) {
      byType[item.type].push(item);
    }
  }

  const results = [
    ...byType.region,
    ...byType.crop,
    ...byType.program,
    ...byType.education,
    ...byType.event,
  ];

  return results.slice(0, 10);
}

/**
 * 개별 항목이 단일 검색어(term)에 매칭되는지 확인
 */
function matchesTerm(item: SearchItem, term: string): boolean {
  if (item.title.toLowerCase().includes(term)) return true;
  if (item.subtitle.toLowerCase().includes(term)) return true;
  if (item.keywords.some((kw) => kw.toLowerCase().includes(term))) return true;
  if (item.badge?.toLowerCase().includes(term)) return true;
  return false;
}

/**
 * 통합 검색 (결과 페이지용) — 전체 매칭 결과 반환, 제한 없음.
 *
 * 복합 쿼리 지원:
 *   "전남 딸기" → "전남" OR "딸기" 로 분리하여 매칭
 *   더 많은 단어가 매칭되는 항목이 상위에 노출 (관련도 정렬)
 */
export function searchAll(query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  // 단일 단어: 기존 동작과 동일 (정렬 없이 원본 순서 유지)
  if (terms.length === 1) {
    return SEARCH_INDEX.filter((item) => matchesTerm(item, terms[0]));
  }

  // 복합 쿼리: OR 매칭 + 매칭 단어 수 기준 관련도 정렬
  const scored = SEARCH_INDEX
    .map((item) => ({
      item,
      score: terms.filter((t) => matchesTerm(item, t)).length,
    }))
    .filter(({ score }) => score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.map(({ item }) => item);
}
