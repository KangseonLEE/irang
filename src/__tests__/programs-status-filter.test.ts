import { describe, expect, it } from "vitest";
import { filterProgramsAsync, PROGRAMS } from "@/lib/data/programs";
import { programStatusLabel, CYCLE_LABEL } from "@/lib/program-status";
import { normalizeSearchParams, LIST_PAGE_NORMALIZE_OPTIONS } from "@/lib/search-params/normalize";
import { searchAll } from "@/lib/data/search-index";

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

/**
 * 9/28 회장 결재 — 매년 돌아가는 농식품부 국비 4건을 연례 창구형(9999 페어 + applicationCycle)으로 전환.
 * 한 시·군/한 해의 접수창을 확정 날짜로 박아 두면 창이 지난 뒤 "마감"이 되어 /programs 기본 필터와
 * 통합검색(마감 제외)에서 사라진다 — 9/28 기준 4건 전부 그 상태였다.
 */
const ANNUAL_CYCLE_IDS = ["SP-001", "SP-002", "SP-013", "SP-023"] as const;
const DEFAULT_STATUS = "모집중,정기 접수,모집예정";

describe("연례 창구형 국비 4건 (SP-001·002·013·023)", () => {
  it("4건 모두 라벨이 '정기 접수' (9999 페어 + 접수 시기 문구)", () => {
    for (const id of ANNUAL_CYCLE_IDS) {
      const p = PROGRAMS.find((x) => x.id === id);
      expect(p, `${id} 정적 데이터 존재`).toBeDefined();
      expect(p!.applicationStart, `${id} start`).toBe("9999-12-31");
      expect(p!.applicationEnd, `${id} end`).toBe("9999-12-31");
      expect(p!.applicationCycle?.trim(), `${id} 접수 시기 문구`).toBeTruthy();
      expect(programStatusLabel(p!), `${id} 라벨`).toBe(CYCLE_LABEL);
    }
  });

  it("/programs 기본 필터(모집중·정기 접수·모집예정)에 4건 전부 포함", async () => {
    const { programs } = await filterProgramsAsync({ status: DEFAULT_STATUS });
    const ids = new Set(programs.map((p) => p.id));
    for (const id of ANNUAL_CYCLE_IDS) expect(ids.has(id), `${id} 기본 목록 노출`).toBe(true);
  });

  it("통합검색(마감 제외)에 노출 — searchAll('귀농 농업창업') 에 SP-001", () => {
    const hrefs = searchAll("귀농 농업창업").map((i) => i.href);
    expect(hrefs).toContain("/programs/SP-001");
    for (const [q, id] of [
      ["청년농업인 영농정착지원사업", "SP-002"],
      ["우수후계농업경영인", "SP-013"],
      ["후계농업경영인 사업대상자 선발", "SP-023"],
    ] as const) {
      expect(searchAll(q).map((i) => i.href), `${q} → ${id}`).toContain(`/programs/${id}`);
    }
  });
});
