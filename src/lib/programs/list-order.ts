import { sortPrograms, type ProgramSortKey, type SupportProgram } from "@/lib/data/programs";
import { rankProgramsForPersona } from "@/lib/data/persona-fit";
import type { PersonaId } from "@/lib/data/personas";

/** 페르소나 모드에서 목록에 남기는 최소 적합 점수 */
export const PERSONA_MIN_SCORE = 4;

/**
 * 적합도 점수로 거르고 줄 세우는 페르소나 — '기본 균등'(balanced)은 제외한다 (10/6 QA Q4-W3).
 * 균등은 사업 사이에 차이를 매기지 않아 모든 사업이 3점이다 → 4점 이상만 남기면 목록이 0건이 됐다
 * (빠른 점검 135조합 중 24개가 균등). 작물 목록의 같은 규칙: src/app/crops/crop-list-filter.ts `scoringPersonaOf`.
 */
export function scoringProgramPersona(persona: PersonaId | undefined): PersonaId | undefined {
  return persona && persona !== "balanced" ? persona : undefined;
}

/**
 * `/programs` 목록 순서 — 첫 화면(page.tsx)과 무한 스크롤 "더 불러오기"(actions.ts)가 **반드시 이 함수 하나**를 쓴다.
 *
 * 10/3 발견: 첫 화면은 정렬(마감순·최신순)·페르소나 점수순으로 6건을 그렸는데, 서버 액션은 정렬 전 목록을
 * offset 으로 잘라 붙였다 — 2쪽부터 순서가 어긋나 같은 사업이 두 번 보이고(dev 로그 SP-046 중복 key 244회)
 * 어떤 사업은 끝까지 안 보였다. 페르소나 모드는 점수 미달 사업까지 섞였다(5/22 정렬 도입 이후 잠복).
 *
 * 페르소나 모드: 마감순으로 먼저 줄 세운 뒤 점수로 안정 정렬 — 같은 점수 안에서도 순서가 매번 같다.
 * '기본 균등'은 점수로 거르지 않고 일반 정렬(마감순·최신순)만 한다.
 */
export function orderProgramsForList(
  programs: SupportProgram[],
  { persona, sort }: { persona?: PersonaId; sort: ProgramSortKey },
): SupportProgram[] {
  const scoring = scoringProgramPersona(persona);
  if (scoring) {
    return rankProgramsForPersona(sortPrograms(programs, "deadline"), scoring)
      .filter((r) => r.score >= PERSONA_MIN_SCORE)
      .map((r) => r.program);
  }
  return sortPrograms(programs, sort);
}
