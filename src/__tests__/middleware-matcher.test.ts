// @vitest-environment node
/**
 * 미들웨어 matcher — 실제 정적 파일만 건너뛴다 (2026-10-16 보안 2차 QA A2).
 * 예전엔 확장자 예외에 끝 고정이 없어 `/programs/x.png` 가 오리진 잠금·국가 차단을 통째로 건너뛰었다.
 */

import { describe, expect, it } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { config } from "../../middleware";

const runs = (url: string) => unstable_doesMiddlewareMatch({ config, url });

describe("middleware matcher", () => {
  it("확장자·접두가 경로 중간에만 있으면 미들웨어를 탄다", () => {
    for (const url of [
      "/programs/x.pngabc",
      "/regions/gyeonggi/a.svgz",
      "/a.svg/b",
      "/sitemapfoo",
      "/sitemap/0",
      "/robots.txt/x",
      "/favicon.icox",
      "/about",
      "/admin/community",
      "/api/assess",
      "/.well-known/acme-challenge/tok",
    ]) {
      expect(runs(url), url).toBe(true);
    }
  });

  it("실제 정적 파일·이미지 최적화·사이트맵은 건너뛴다", () => {
    for (const url of [
      "/_next/static/chunks/main.js",
      "/_next/image?url=%2Fcrops%2Fa.webp&w=640&q=70",
      "/favicon.ico",
      "/icon.svg",
      "/icon.png",
      "/apple-icon.png",
      "/robots.txt",
      "/sitemap.xml",
      "/sitemap-index.xml",
      "/sitemap/0.xml",
      "/crops/illustrations/apple.webp",
      "/landing/hero/a.jpg",
      "/fonts/x.woff2",
      // 정적 파일 모양으로 끝나는 경로는 파일 목록 없이 구분할 수 없어 여전히 건너뛴다 — 남은 면(보고서 참조)
      "/programs/x.png",
    ]) {
      expect(runs(url), url).toBe(false);
    }
  });
});
