"use server";

import {
  filterProgramsAsync,
  PAGE_SIZE,
  type ProgramFilters,
  type ProgramSortKey,
  type PaginatedResult,
} from "@/lib/data/programs";
import { PERSONA_INDEX, type PersonaId } from "@/lib/data/personas";
import { orderProgramsForList } from "@/lib/programs/list-order";

/**
 * 지원사업 추가 로드 Server Action
 * 클라이언트에서 IntersectionObserver가 트리거할 때 호출
 *
 * 첫 화면(page.tsx)과 같은 `orderProgramsForList` 로 줄 세운 뒤 자른다 — 10/3 전까지는 정렬 전 목록을 잘라
 * 2쪽부터 중복·누락이 났다. 클라이언트 입력이라 정렬 키·페르소나는 허용 값만 받는다.
 */
export async function loadMorePrograms(
  filters: ProgramFilters,
  offset: number,
  view: { persona?: string; sort?: string } = {},
): Promise<PaginatedResult> {
  const persona =
    view.persona && PERSONA_INDEX.has(view.persona as PersonaId) ? (view.persona as PersonaId) : undefined;
  const sort: ProgramSortKey = view.sort === "recent" ? "recent" : "deadline";
  const start = Number.isInteger(offset) && offset > 0 ? offset : 0;

  const { programs: rawFiltered } = await filterProgramsAsync(filters);
  const ordered = orderProgramsForList(rawFiltered, { persona, sort });
  return {
    programs: ordered.slice(start, start + PAGE_SIZE),
    total: ordered.length,
    hasMore: start + PAGE_SIZE < ordered.length,
  };
}
