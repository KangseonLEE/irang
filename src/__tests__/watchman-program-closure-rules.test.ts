/**
 * watchman §20 — 그린대로 교육 '원천은 접수 중인데 화면은 마감·숨김' 판정 (2026-11-17 #205 오경보).
 * 원천 접수중 탭은 접수 전 과정도 담는다. 모집예정 행을 '마감·숨김'으로 부르지 않되(오탐),
 * 진짜 되돌림 누락·기간 어긋남은 계속 잡는다(누락) — 양방향을 고정한다.
 */
import { describe, expect, it } from "vitest";
import { classifyReopen, isOpen } from "../../scripts/watchman/program-closure-rules";

const TODAY = "2026-11-17";

describe("오탐 방지 — 모집예정 행", () => {
  it("#205 실제 행: 원천과 같은 12/02~12/02 → 경보 없음", () => {
    const ours = { start: "2026-12-02", end: "2026-12-02", broken: false };
    expect(isOpen(ours.start, ours.end, TODAY)).toBe(false);
    expect(classifyReopen(ours, { start: "2026-12-02", end: "2026-12-02" }, TODAY)).toBeNull();
  });
});

describe("누락 방지 — 계속 잡아야 하는 것", () => {
  it("우리는 마감일이 지났는데 원천은 접수 중 → 마감·숨김", () => {
    expect(classifyReopen({ start: "2026-11-01", end: "2026-11-10", broken: false }, { start: "2026-11-01", end: "2026-11-30" }, TODAY)).toBe(
      "원천은 접수 중인데 화면은 마감·숨김",
    );
  });

  it("원문 깨짐으로 숨긴 행이 원천 접수중 탭에 있음 → 마감·숨김 (모집예정이어도)", () => {
    expect(classifyReopen({ start: "2026-12-02", end: "2026-12-02", broken: true }, { start: "2026-12-02", end: "2026-12-02" }, TODAY)).toBe(
      "원천은 접수 중인데 화면은 마감·숨김",
    );
  });

  it("모집예정인데 원천이 시작일을 앞당김(이미 접수 중) → 기간 어긋남", () => {
    expect(classifyReopen({ start: "2026-12-02", end: "2026-12-17", broken: false }, { start: "2026-11-15", end: "2026-12-17" }, TODAY)).toBe(
      "모집예정 행의 접수 기간이 원천과 다름",
    );
  });

  it("모집예정인데 원천 마감일만 다름 → 기간 어긋남", () => {
    expect(classifyReopen({ start: "2026-12-02", end: "2026-12-02", broken: false }, { start: "2026-12-02", end: "2026-12-05" }, TODAY)).toBe(
      "모집예정 행의 접수 기간이 원천과 다름",
    );
  });
});
