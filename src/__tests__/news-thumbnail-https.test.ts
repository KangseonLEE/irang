import { describe, expect, it } from "vitest";
import { forceHttps } from "@/lib/api/news";

/**
 * 뉴스 썸네일 https 강제 (2026-09-29) — CSP `img-src … https:` 에서 `http://` 썸네일이 통째로 차단되던 결함.
 */
describe("forceHttps", () => {
  it("http 스킴을 https 로 올린다", () => {
    expect(forceHttps("http://www.gndomin.com/news/photo/a.jpg")).toBe("https://www.gndomin.com/news/photo/a.jpg");
  });
  it("대문자 스킴도 올린다", () => {
    expect(forceHttps("HTTP://sjbnews.com/x.png")).toBe("https://sjbnews.com/x.png");
  });
  it("이미 https 면 그대로", () => {
    expect(forceHttps("https://a.b/c.jpg")).toBe("https://a.b/c.jpg");
  });
  it("경로 안의 http:// 문자열은 건드리지 않는다", () => {
    expect(forceHttps("https://a.b/r?u=http://c.d/e.jpg")).toBe("https://a.b/r?u=http://c.d/e.jpg");
  });
});
