/**
 * 통합 검색 인덱스
 * - 지역(Station), 작물(Crop), 지원사업(Program) 데이터를 단일 검색 인덱스로 통합
 * - 클라이언트 사이드 fuzzy-ish 검색 (debounce + prefix match)
 */

import { STATIONS } from "./stations";
import { SIGUNGUS } from "./sigungus";
import { getProvinceById } from "./regions";
import { CROPS } from "./crops";
import { PROGRAMS } from "./programs";
import { EDUCATION_COURSES } from "./education";
import { EVENTS } from "./events";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchItem {
  type: "region" | "crop" | "program" | "education" | "event" | "guide";
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

const sigunguItems: SearchItem[] = SIGUNGUS.map((sg) => {
  const province = getProvinceById(sg.sidoId);
  const provinceName = province?.name ?? "";
  return {
    type: "region" as const,
    id: `${sg.sidoId}-${sg.id}`,
    title: sg.name,
    subtitle: truncate(`${provinceName} · ${sg.description}`, 45),
    href: `/regions/${sg.sidoId}/${sg.id}`,
    keywords: [sg.shortName, provinceName, ...sg.mainCrops, ...sg.highlights],
    icon: "\u{1F3E1}", // 🏡
  };
});

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

// ---------------------------------------------------------------------------
// 가이드 / 정보 페이지
// ---------------------------------------------------------------------------

const guideItems: SearchItem[] = [
  {
    type: "guide",
    id: "costs",
    title: "귀농 비용 가이드",
    subtitle: "연령·작물별 초기 투자금 분석 & 지원금",
    href: "/costs",
    keywords: ["비용", "투자금", "자금", "돈", "얼마", "예산", "생활비", "주거비", "영농비", "절감", "시뮬레이션"],
    icon: "\u{1F4B0}", // 💰
  },
  {
    type: "guide",
    id: "gov-roadmap",
    title: "정부사업 진입 가이드",
    subtitle: "4대 핵심 정부사업 신청 절차 안내",
    href: "/programs/roadmap",
    keywords: ["정부사업", "신청", "절차", "자격", "서류", "보조금", "융자", "청년창업농", "농지은행", "귀산촌", "로드맵"],
    icon: "\u{1F3DB}\u{FE0F}", // 🏛️
  },
  {
    type: "guide",
    id: "guide-5step",
    title: "귀농 5단계 로드맵",
    subtitle: "준비부터 정착까지 체크리스트 가이드",
    href: "/guide",
    keywords: ["가이드", "로드맵", "5단계", "준비", "프로세스", "체크리스트", "순서", "과정", "절차", "정보탐색", "교육이수", "지역선정", "영농시작", "정착"],
    icon: "\u{1F4CB}", // 📋
  },
  {
    type: "guide",
    id: "stats-population",
    title: "귀농·귀촌 인구 통계",
    subtitle: "10년 추이 데이터 & 원인 분석",
    href: "/stats/population",
    keywords: ["통계", "인구", "추이", "트렌드", "데이터", "현황", "몇명", "증가", "감소"],
    icon: "\u{1F4CA}", // 📊
  },
  {
    type: "guide",
    id: "stats-satisfaction",
    title: "귀농 만족도 통계",
    subtitle: "귀농인 생활 만족도 조사 결과",
    href: "/stats/satisfaction",
    keywords: ["만족도", "만족", "통계", "조사", "생활", "후회"],
    icon: "\u{1F4CA}", // 📊
  },
  {
    type: "guide",
    id: "stats-youth",
    title: "청년 귀농 통계",
    subtitle: "청년층 귀농 현황 & 지원 정책",
    href: "/stats/youth",
    keywords: ["청년", "청년귀농", "통계", "MZ", "20대", "30대"],
    icon: "\u{1F4CA}", // 📊
  },
  {
    type: "guide",
    id: "glossary",
    title: "농업 용어집",
    subtitle: "처음 만나는 농업 용어 해설",
    href: "/glossary",
    keywords: ["용어", "사전", "뜻", "의미", "설명", "농업용어", "재배", "토양", "비료", "병해충"],
    icon: "\u{1F4D6}", // 📖
  },
  {
    type: "guide",
    id: "match",
    title: "귀농 유형 진단",
    subtitle: "나에게 맞는 귀농 유형 · 지역 · 작물 추천",
    href: "/match",
    keywords: ["진단", "유형", "테스트", "추천", "맞춤", "적합", "나에게맞는", "어디", "뭐가좋을까"],
    icon: "\u{1F50D}", // 🔍
  },
];

export const SEARCH_INDEX: SearchItem[] = [
  ...regionItems,
  ...sigunguItems,
  ...cropItems,
  ...programItems,
  ...educationItems,
  ...eventItems,
  ...guideItems,
];

// ---------------------------------------------------------------------------
// Popular tags
// ---------------------------------------------------------------------------

export const POPULAR_TAGS: SearchTag[] = [
  { label: "#귀농융자", query: "융자", type: "search" },
  { label: "#청년농업인", query: "청년", type: "search" },
  { label: "#체류형", query: "체류형", type: "search" },
  { label: "#모집중", query: "모집중", type: "search" },
  { label: "#초보추천", query: "쉬움", type: "search" },
  { label: "#스마트팜", query: "스마트팜", type: "search" },
  { label: "#박람회", query: "박람회", type: "search" },
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
    guide: [],
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
    ...byType.guide,
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
