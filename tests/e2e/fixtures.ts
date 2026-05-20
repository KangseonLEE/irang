/**
 * Playwright 공용 fixture — e2e가 GA·GTM·Analytics 비콘에 측정되지 않게 차단
 *
 * 배경 (회장 5/20 라이브 회고 9차):
 * - playwright runner가 prod 페이지를 로드하면 head 안의 GA4·GTM 스크립트가
 *   실행되어 measurement 비콘이 발사됨.
 * - 결과: GA Realtime에 미국 클라우드 데이터센터 트래픽처럼 e2e 트래픽이 누적되어
 *   봇/사람 신호를 흐리고 CF Bot Fight Mode 점검을 어렵게 함.
 *
 * 조치: page 생성 직후 GA·GTM·Analytics 도메인을 route intercept로 abort.
 * - prod 코드 0 영향 (e2e config layer만)
 * - 모든 spec이 이 fixture의 test를 import하면 자동 적용
 *
 * 박제:
 * - 5/19: trace/screenshot/video off (secret 헤더 누출 방지) — 본 파일 무관, 유지
 * - 5/14: UA `irang-e2e/1.0` 토큰 + secret header 이중 검증 — playwright.config.ts 유지
 */

import { test as base } from "@playwright/test";

/** 차단 대상 — GA4 v2 collect, GTM 로더, regional GA endpoints 모두 포함 */
const ANALYTICS_BEACON_PATTERN =
  /(google-analytics|googletagmanager|analytics\.google)\.com/;

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(ANALYTICS_BEACON_PATTERN, (route) => route.abort());
    // eslint-disable-next-line react-hooks/rules-of-hooks -- playwright fixture API의 `use` 콜백 (React hook 아님)
    await use(page);
  },
});

export { expect } from "@playwright/test";
export type { Page } from "@playwright/test";
