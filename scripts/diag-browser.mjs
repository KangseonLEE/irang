/**
 * 실측(Playwright) 브라우저 컨텍스트 헬퍼 (2026-09-19) — 진단 스크립트는 이걸로 컨텍스트를 연다.
 *
 * 붙이는 표식 2종: localStorage `irang-internal=1`(GA 게이트) · 쿠키 `irang-internal=1`(서버 적재
 * 게이트). 페이지가 /api 에 POST 할 때는 `internalRequestHeaders()` 가 localStorage 표식으로
 * `x-irang-internal`, webdriver 로 `x-irang-e2e` 를 직접 붙인다 — 자동화 브라우저는 `navigator.webdriver`
 * 로도 이미 걸려서 헬퍼를 거치면 GA·DB 둘 다 이중으로 막힌다.
 *
 * (2026-10-06) 예전엔 컨텍스트 전체에 `x-irang-internal` 헤더도 붙였는데, Playwright 의
 * extraHTTPHeaders 는 모든 출처에 실려 jsdelivr Pretendard CSS 가 CORS 로 막혔다 → 대체 글꼴로
 * 글자 폭이 달라져 레이아웃 실측이 틀어졌다(10/6 QA). 위 표식으로 충분해 헤더는 뺐다.
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
