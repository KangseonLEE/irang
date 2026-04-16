"use client";

import SearchBar from "./search-bar";

/**
 * 히어로 인라인 검색창.
 * - 데스크탑: 포커스 시 그 자리에 드롭다운이 펼쳐지며 추천/인기/바로탐색 노출 (richMode)
 * - 모바일(< 640px): input 포커스 시 풀스크린 확장 (mobileExpand)
 */
export default function HeroSearch() {
  return (
    <SearchBar
      size="large"
      placeholder="궁금한 지역이나 작물을 검색해보세요"
      mobilePlaceholder="지역, 작물, 지원사업 검색"
      mobileExpand
      richMode
    />
  );
}
