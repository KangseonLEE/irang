import { describe, it, expect } from "vitest";
import { formatRelativeDate } from "@/lib/format";

const NOW = new Date("2026-09-28T12:00:00+09:00");

describe("formatRelativeDate", () => {
  it("1시간 미만은 방금", () => {
    expect(formatRelativeDate("2026-09-28T11:30:00+09:00", NOW)).toBe("방금");
  });

  it("하루 안은 시간, 1일은 '하루 전', 일주일 안은 N일 전", () => {
    expect(formatRelativeDate("2026-09-28T09:00:00+09:00", NOW)).toBe("3시간 전");
    expect(formatRelativeDate("2026-09-27T10:00:00+09:00", NOW)).toBe("하루 전");
    expect(formatRelativeDate("2026-09-25T10:00:00+09:00", NOW)).toBe("3일 전");
  });

  it("7일을 넘기면 날짜, 잘못된 값은 빈 문자열", () => {
    expect(formatRelativeDate("2026-09-01T10:00:00+09:00", NOW)).toBe("2026.09.01");
    expect(formatRelativeDate("not-a-date", NOW)).toBe("");
  });
});
