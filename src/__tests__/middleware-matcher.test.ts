// @vitest-environment node
/**
 * 미들웨어 matcher — 실제 정적 파일만 건너뛴다 (2026-10-16 보안 2차 QA A2).
 * 예전엔 확장자 예외에 끝 고정이 없어 `/programs/x.png` 가 오리진 잠금·국가 차단을 통째로 건너뛰었다.
 */

import { describe, expect, it } from "vitest";
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
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
      // 3차 QA B1 — 동적 라우트 끝에 확장자를 붙여도 미들웨어(잠금)를 탄다
      "/programs/x.png",
      "/events/x.png",
      "/education/a.webp",
      "/regions/gyeonggi/x.png",
      "/crops/x.png",
      "/interviews/x.jpg",
      "/assess/result/a.png",
      "/r/a.png",
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
      "/images/regions/a.webp",
      "/interviews/illustrations/a.webp",
      "/promo/a.webp",
      "/updates/a.webp",
      "/file.svg",
      "/fonts/nanum-myeongjo-800-irang.woff2",
    ]) {
      expect(runs(url), url).toBe(false);
    }
  });

  it("public/ 의 실제 정적 파일은 전부 건너뛴다 — 새 최상위 폴더를 만들면 matcher 도 고치라는 신호", () => {
    const root = join(__dirname, "../../public");
    const files: string[] = [];
    const walk = (d: string) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf)$/.test(n)) files.push("/" + relative(root, p));
      }
    };
    walk(root);
    expect(files.length).toBeGreaterThan(0);
    for (const url of files) expect(runs(url), url).toBe(false);
  });
});
