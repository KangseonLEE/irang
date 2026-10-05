import { describe, expect, it } from "vitest";
import { sortPrograms, type SupportProgram } from "@/lib/data/programs";
import { orderProgramsForList, PERSONA_MIN_SCORE } from "@/lib/programs/list-order";
import { getProgramPersonaFit } from "@/lib/data/persona-fit";
import { PROGRAMS } from "@/lib/data/programs";

/**
 * /programs 무한 스크롤 — 첫 화면과 "더 불러오기"가 같은 순서여야 쪽이 겹치거나 빠지지 않는다 (10/3 SP-046 중복 key).
 * 순서는 입력 순서(DB 응답 순서)와 무관해야 한다 — 같은 집합이면 몇 번을 섞어 넣어도 결과가 같다.
 */

const shuffled = <T,>(xs: readonly T[], seed: number): T[] => {
  const out = [...xs];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const ids = (xs: SupportProgram[]) => xs.map((p) => p.id);

describe("목록 순서는 입력 순서와 무관하다", () => {
  for (const sort of ["deadline", "recent"] as const) {
    it(`${sort} — 섞어 넣어도 같은 순서`, () => {
      const base = ids(sortPrograms(PROGRAMS, sort));
      for (const seed of [1, 7, 42]) {
        expect(ids(sortPrograms(shuffled(PROGRAMS, seed), sort))).toEqual(base);
      }
    });
  }

  it("페르소나 모드 — 섞어 넣어도 같은 순서, 점수 미달 없음", () => {
    const base = orderProgramsForList(PROGRAMS, { persona: "farmYouth", sort: "deadline" });
    for (const seed of [3, 11]) {
      expect(ids(orderProgramsForList(shuffled(PROGRAMS, seed), { persona: "farmYouth", sort: "deadline" }))).toEqual(ids(base));
    }
    expect(base.every((p) => getProgramPersonaFit(p).farmYouth >= PERSONA_MIN_SCORE)).toBe(true);
  });
});

describe("쪽을 이어 붙이면 전체와 같다 (중복·누락 0)", () => {
  it("6건씩 잘라 붙인 결과 = 한 번에 줄 세운 결과", () => {
    const PAGE = 6;
    const full = orderProgramsForList(PROGRAMS, { sort: "deadline" });
    const pages: SupportProgram[] = [];
    for (let offset = 0; offset < full.length; offset += PAGE) {
      // 매 요청마다 DB 응답 순서가 다르다고 가정
      const again = orderProgramsForList(shuffled(PROGRAMS, offset + 5), { sort: "deadline" });
      pages.push(...again.slice(offset, offset + PAGE));
    }
    expect(ids(pages)).toEqual(ids(full));
    expect(new Set(ids(pages)).size).toBe(full.length);
  });
});
