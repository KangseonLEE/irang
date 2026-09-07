import { describe, expect, it } from "vitest";
import { TAP_SLOP, isTap } from "@/lib/hooks/use-tap-gesture";

describe("isTap — 검색창 탭 vs 스크롤 판정 (9/7)", () => {
  const start = { x: 100, y: 300, scrollY: 0 };
  it("제자리에서 떼면 탭", () => {
    expect(isTap(start, { x: 102, y: 303, scrollY: 0 })).toBe(true);
  });
  it(`이동이 ${TAP_SLOP}px 이상이면 탭 아님(스크롤·드래그)`, () => {
    expect(isTap(start, { x: 100, y: 300 + TAP_SLOP, scrollY: 0 })).toBe(false);
    expect(isTap(start, { x: 100, y: 360, scrollY: 0 })).toBe(false);
  });
  it("페이지가 스크롤됐으면 좌표가 같아도 탭 아님", () => {
    expect(isTap(start, { x: 100, y: 300, scrollY: 40 })).toBe(false);
  });
});
