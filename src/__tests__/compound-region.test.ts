import { describe, expect, it } from "vitest";
import { isCompoundRegionQuery } from "@/lib/compound-region";

// 10/13 착수 기준 카운터 — '시·도 + 그 시·도 안의 시·군·구'가 남김없이 맞을 때만 센다
describe("isCompoundRegionQuery", () => {
  it.each(["경북안동", "충남서산", "강원평창", "경기가평", "전남순천시", "경상북도안동시"])("%s → 붙여 쓴 지역명", (q) => {
    expect(isCompoundRegionQuery(q)).toBe(true);
  });
  it.each(["인천공항", "경북대", "안동찜닭", "경북 안동", "경북", "충남안동", "서울시청"])("%s → 아님", (q) => {
    expect(isCompoundRegionQuery(q)).toBe(false);
  });
});
