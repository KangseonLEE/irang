import { describe, it, expect } from "vitest";
import { formatAgeRange } from "@/lib/format";

/**
 * 8/30 — 데이터 관례상 상한 없음 = 99 (programs.ts 9건). 상세·랜딩 카드가 "만 19세 ~ 99세"로
 * 새던 것을 "만 19세 이상"으로. Supabase row는 null일 수 있어 null/undefined도 커버.
 */
describe("formatAgeRange — 대상 연령 표기", () => {
  it("min·max 실값이면 범위", () => {
    expect(formatAgeRange(18, 39)).toBe("만 18~39세");
    expect(formatAgeRange(18, 65)).toBe("만 18~65세");
  });
  it("max 99 또는 없음이면 '이상'", () => {
    expect(formatAgeRange(19, 99)).toBe("만 19세 이상");
    expect(formatAgeRange(18, undefined)).toBe("만 18세 이상");
    expect(formatAgeRange(18, null)).toBe("만 18세 이상");
  });
  it("min 없음이면 '이하', 둘 다 없으면 '제한 없음'", () => {
    expect(formatAgeRange(undefined, 65)).toBe("만 65세 이하");
    expect(formatAgeRange(0, 65)).toBe("만 65세 이하");
    expect(formatAgeRange(null, null)).toBe("연령 제한 없음");
    expect(formatAgeRange(0, 99)).toBe("연령 제한 없음");
  });
});
