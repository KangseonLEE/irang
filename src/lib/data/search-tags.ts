/**
 * 검색 관련 태그 상수
 * - search-index.ts에서 분리하여 POPULAR_TAGS만 필요한 컴포넌트가
 *   무거운 검색 인덱스 의존성(stations, sigungus 등)을 로드하지 않도록 함
 */

export interface SearchTag {
  label: string;
  query: string;
  type: "search" | "link";
}

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
