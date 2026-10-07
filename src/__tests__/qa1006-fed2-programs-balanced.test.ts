import { describe, expect, it } from "vitest";
import { PROGRAMS, sortPrograms } from "@/lib/data/programs";
import { getProgramPersonaFit } from "@/lib/data/persona-fit";
import { PERSONA_MIN_SCORE, orderProgramsForList, scoringProgramPersona } from "@/lib/programs/list-order";

/**
 * 10/6 QA Q4-W3 — `/programs?persona=balanced` 가 0건이었다.
 * '기본 균등'은 모든 사업이 같은 3점이라 4점 이상만 남기는 페르소나 거르기에 전부 걸렸다.
 * 빠른 점검 결과의 24%(135조합 중 24개)가 균등이라 "맞춤 지원 사업" 링크가 빈 목록으로 갔다.
 */
describe("지원사업 목록 — '기본 균등' 페르소나", () => {
  it("전제: 균등은 모든 사업이 기준 점수 미만이다 (거르면 0건)", () => {
    expect(PROGRAMS.every((p) => getProgramPersonaFit(p).balanced < PERSONA_MIN_SCORE)).toBe(true);
  });

  it("균등은 점수로 거르지 않고 일반 정렬과 같은 목록이다", () => {
    for (const sort of ["deadline", "recent"] as const) {
      const ids = orderProgramsForList(PROGRAMS, { persona: "balanced", sort }).map((p) => p.id);
      expect(ids.length).toBe(PROGRAMS.length);
      expect(ids).toEqual(sortPrograms(PROGRAMS, sort).map((p) => p.id));
    }
  });

  it("다른 페르소나는 그대로 4점 이상만 점수순", () => {
    for (const persona of ["family", "farmYouth", "elderRural", "commuter"] as const) {
      const list = orderProgramsForList(PROGRAMS, { persona, sort: "deadline" });
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((p) => getProgramPersonaFit(p)[persona] >= PERSONA_MIN_SCORE)).toBe(true);
    }
  });

  it("scoringProgramPersona — 균등·없음은 undefined", () => {
    expect(scoringProgramPersona("balanced")).toBeUndefined();
    expect(scoringProgramPersona(undefined)).toBeUndefined();
    expect(scoringProgramPersona("family")).toBe("family");
  });
});
