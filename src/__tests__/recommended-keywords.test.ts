import { describe, expect, it } from "vitest";
import { RECOMMENDED_KEYWORDS } from "@/lib/data/popular-keywords";
import { searchAll } from "@/lib/data/search-index";

/**
 * 추천 검색어 SSOT (10/2) — 히어로·헤더 검색 패널·/search 빈 화면이 같은 목록을 쓴다.
 * 누르면 결과가 나와야 하고(0건 칩 금지), 외부 서비스명은 목록 단계에서 빠져 있어야 한다.
 */
describe("RECOMMENDED_KEYWORDS", () => {
  it("8~10개, 중복 없음", () => {
    expect(RECOMMENDED_KEYWORDS.length).toBeGreaterThanOrEqual(8);
    expect(RECOMMENDED_KEYWORDS.length).toBeLessThanOrEqual(10);
    expect(new Set(RECOMMENDED_KEYWORDS).size).toBe(RECOMMENDED_KEYWORDS.length);
  });

  it("외부 서비스명(토지이음) 제외", () => {
    expect(RECOMMENDED_KEYWORDS).not.toContain("토지이음");
  });

  it.each([...RECOMMENDED_KEYWORDS])("'%s' 검색 결과가 1건 이상", (kw) => {
    expect(searchAll(kw).length).toBeGreaterThan(0);
  });
});
