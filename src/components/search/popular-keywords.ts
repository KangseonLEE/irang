/**
 * 검색 오버레이 "인기 검색어" 섹션용 정적 키워드.
 *
 * 추천 검색어(`POPULAR_TAGS`)와 달리 순위·맥락이 있는 trending 리스트.
 * 이랑 도메인 맥락(귀농 준비·지역·작물·정책)에 맞춘 10개 상수.
 */
export interface PopularKeyword {
  /** 표시 라벨 (= 검색 쿼리) */
  label: string;
}

export const POPULAR_KEYWORDS: PopularKeyword[] = [
  { label: "귀농 지원금" },
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
