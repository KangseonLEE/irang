"use server";

import {
  filterProgramsPaginated,
  PAGE_SIZE,
  type ProgramFilters,
  type PaginatedResult,
} from "@/lib/data/programs";

/**
 * 지원사업 추가 로드 Server Action
 * 클라이언트에서 IntersectionObserver가 트리거할 때 호출
 */
export async function loadMorePrograms(
  filters: ProgramFilters,
  offset: number
): Promise<PaginatedResult> {
  // 실제 API 연동 시 여기에 fetch/DB 쿼리로 교체
  // 네트워크 지연 시뮬레이션 (실서비스 전환 시 제거)
  await new Promise((r) => setTimeout(r, 300));

  return filterProgramsPaginated(filters, offset, PAGE_SIZE);
}
