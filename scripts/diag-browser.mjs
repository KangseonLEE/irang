/**
 * 실측(Playwright) 브라우저 컨텍스트 헬퍼 (2026-09-19) — 진단 스크립트는 이걸로 컨텍스트를 연다.
 *
 * 붙이는 표식 3종: localStorage `irang-internal=1`(GA 게이트) · 쿠키 `irang-internal=1`(서버 적재
 * 게이트) · 요청 헤더 `x-irang-internal: 1`(쿠키가 안 실리는 경로 대비). 자동화 브라우저는
 * `navigator.webdriver` 로도 이미 걸리지만, 헬퍼를 거치면 도메인·UA 무관하게 3중이 된다.
 *
 * 사용:
 *   import { chromium } from "playwright";
 *   import { openContext } from "../diag-browser.mjs";
 *   const browser = await chromium.launch();
 *   const ctx = await openContext(browser, { baseURL: "https://irangfarm.com", viewport: { width: 1280, height: 700 } });
 *
 * ⚠️ 데스크탑 실측은 실제 Chrome UA 필수 — middleware 가 HeadlessChrome 을 403 으로 막는다 (9/16).
 */
export const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

export async function openContext(browser, { baseURL, ...options } = {}) {
  const ctx = await browser.newContext({
    userAgent: DESKTOP_UA,
    ...options,
    baseURL,
    extraHTTPHeaders: { "x-irang-internal": "1", ...(options.extraHTTPHeaders ?? {}) },
  });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem("irang-internal", "1");
    } catch {
      /* 프라이빗 모드 */
    }
  });
  if (baseURL) {
    const { hostname } = new URL(baseURL);
    await ctx.addCookies([{ name: "irang-internal", value: "1", domain: hostname, path: "/" }]).catch(() => {});
  }
  return ctx;
}
