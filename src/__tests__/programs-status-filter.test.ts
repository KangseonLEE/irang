import { describe, expect, it } from "vitest";
import { filterProgramsAsync, PROGRAMS } from "@/lib/data/programs";
import { programStatusLabel, CYCLE_LABEL } from "@/lib/program-status";
import { normalizeSearchParams, LIST_PAGE_NORMALIZE_OPTIONS } from "@/lib/search-params/normalize";

/** 9/28 회장 결재 — "정기 접수" 상태 필터 (연례 창구형 9999 페어 + applicationCycle) */
describe("/programs status 필터 — 정기 접수", () => {
  it("정적 데이터에 정기 접수 사업이 20건 이상 있다", () => {
    const n = PROGRAMS.filter((p) => programStatusLabel(p) === CYCLE_LABEL).length;
    expect(n).toBeGreaterThanOrEqual(20);
  });

  it("status=정기 접수 → 전부 정기 접수 라벨, status=모집예정 → 정기 접수 0건", async () => {
    const cycle = await filterProgramsAsync({ status: "정기 접수" });
    expect(cycle.programs.length).toBeGreaterThan(0);
    expect(cycle.programs.every((p) => programStatusLabel(p) === CYCLE_LABEL)).toBe(true);
    const upcoming = await filterProgramsAsync({ status: "모집예정" });
    expect(upcoming.programs.some((p) => programStatusLabel(p) === CYCLE_LABEL)).toBe(false);
  });

  it("normalize 화이트리스트가 정기 접수를 통과시킨다 (6/16 함정 방지)", () => {
    const { cleaned } = normalizeSearchParams(
      new URLSearchParams("status=모집중,정기 접수,마감"),
      LIST_PAGE_NORMALIZE_OPTIONS["/programs"],
    );
    expect(cleaned.get("status")).toContain("정기 접수");
  });
});
