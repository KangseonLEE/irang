"use server";

import {
  filterProgramsAsync,
  PAGE_SIZE,
  type ProgramFilters,
  type PaginatedResult,
} from "@/lib/data/programs";

/**
 * 지원사업 추가 로드 Server Action
 * 클라이언트에서 IntersectionObserver가 트리거할 때 호출
 * - RDA API 사용 가능 시 API 데이터, 아니면 폴백 데이터
 */
export async function loadMorePrograms(
  filters: ProgramFilters,
  offset: number
): Promise<PaginatedResult> {
  const { programs: allFiltered } = await filterProgramsAsync(filters);
  const programs = allFiltered.slice(offset, offset + PAGE_SIZE);
  return {
    programs,
    total: allFiltered.length,
    hasMore: offset + PAGE_SIZE < allFiltered.length,
  };
}
