/**
 * 인기 검색어 SSOT.
 *
 * 두 곳에서 함께 소비된다 (싱크 보장 — 2026-05-29 회장 결재):
 *  1. 검색 오버레이 "인기 검색어" 리스트 (search-bar.tsx)
 *  2. 히어로 "지금 많이 찾는 키워드는" 로테이션 정적 폴백
 *     (landing.ts `trendingSearches`가 이 배열에서 파생)
 *
 * 추천 검색어(`POPULAR_TAGS`, search-tags.ts)와 달리 순위·맥락이 있는 trending 리스트.
 * 이랑 도메인 맥락(정착 준비·지역·작물·정책)에 맞춘 10개 상수.
 *
 * ⚠ 항목 추가/변경 시 전부 `searchAll(label).length > 0` 이어야 한다.
 *   (히어로는 검색 결과 없는 키워드를 숨기므로 — trending-searches.tsx)
 *   검증: `npx tsx scripts/_diag/popkw-reach.ts`
 */
export interface PopularKeyword {
  /** 표시 라벨 (= 검색 쿼리) */
  label: string;
}

export const POPULAR_KEYWORDS: PopularKeyword[] = [
  { label: "농촌 정착 지원금" },
  { label: "전남 귀농" },
  { label: "감귤 작물" },
  { label: "청년농 창업" },
  { label: "토지이음" },
  { label: "귀농교육" },
  { label: "치유농업" },
  { label: "사과 재배지" },
  { label: "사회적 농장" },
  { label: "농촌체류형 쉼터" },
];
