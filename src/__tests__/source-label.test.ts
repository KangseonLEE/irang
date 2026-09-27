import { describe, expect, it } from "vitest";
import { classifySource, sourceButtonLabel, sourceBlockLabel } from "@/lib/source-label";
import { PROGRAMS } from "@/lib/data/programs";

/** 출처별 버튼 문구 (9/28) — 기관 공고 / 언론 기사 / 그 외 안내 페이지 */
describe("source-label", () => {
  it.each([
    ["https://www.gov.kr/portal/service/serviceInfo/SD0000015802", "official"],
    ["https://www.jindo.go.kr/home/board/B0052.cs?m=23&act=read&articleId=176537", "official"],
    ["https://www.fbo.or.kr/contents/Contents.do?menuId=0500100030", "official"],
    ["https://www.nongmin.com/article/20251104500065", "news"],
    ["https://www.nocutnews.co.kr/news/1", "news"],
    ["https://www.dominilbo.com/news/1", "news"],
    ["https://www.foodtoday.or.kr/news/1", "news"],
    ["https://wanjuro.org/x", "other"],
    ["javascript:alert(1)", "other"],
  ])("%s → %s", (href, kind) => {
    expect(classifySource(href)).toBe(kind);
  });

  it("문구 3종", () => {
    expect(sourceButtonLabel("https://www.gov.kr/x")).toBe("공고 확인하기");
    expect(sourceButtonLabel("https://www.nongmin.com/x")).toBe("관련 기사 보기");
    expect(sourceButtonLabel("https://example.org/x")).toBe("안내 페이지 열기");
    expect(sourceBlockLabel("https://www.gov.kr/x")).toBe("공고 페이지 방문");
  });

  it("전체 사업의 출처가 세 갈래 중 하나로 판정되고 기관 출처가 다수", () => {
    const kinds = PROGRAMS.map((p) => classifySource(p.sourceUrl));
    expect(kinds.every((k) => ["official", "news", "other"].includes(k))).toBe(true);
    expect(kinds.filter((k) => k === "official").length).toBeGreaterThan(PROGRAMS.length / 2);
  });
});
