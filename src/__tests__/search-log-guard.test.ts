import { describe, it, expect } from "vitest";
import { isMarkupOrSchemeQuery, isNaturalLanguageQuery } from "@/lib/search-log-guard";

describe("isMarkupOrSchemeQuery — 스캐너·실측 페이로드는 적재하지 않는다", () => {
  it.each([
    "javascript:alert(1)", // 9/17 실측 흔적 — 19자라 자연어 필터를 통과했다
    "<img src=x onerror=alert(1)>",
    '"><script>alert(1)</script>',
    "<svg onload=alert(1)>",
    "{{7*7}}",
    "${7*7}",
    "onerror=x",
    "data:text/html,hi",
    "prompt(1)",
    "배추 \u0007", // 제어 문자
  ])("거른다: %s", (q) => {
    expect(isMarkupOrSchemeQuery(q)).toBe(true);
  });

  it.each(["배추", "충북 서산", "사과 재배", "귀농인의 집", "가시오이", "on air", "5도 이하", "김치·젓갈"])(
    "정상 검색어는 통과: %s",
    (q) => {
      expect(isMarkupOrSchemeQuery(q)).toBe(false);
    },
  );
});

describe("isNaturalLanguageQuery — 기존 휴리스틱 회귀", () => {
  it("질문·긴 문장은 자연어", () => {
    expect(isNaturalLanguageQuery("귀농 어디가 좋아요?")).toBe(true);
    expect(isNaturalLanguageQuery("a".repeat(21))).toBe(true);
  });
  it("짧은 키워드는 아님", () => {
    expect(isNaturalLanguageQuery("배추")).toBe(false);
  });
});
