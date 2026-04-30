/**
 * 빌드 phase 감지 + fetch 타임아웃 분기
 *
 * 배경: Vercel SSG 빌드 시 외부 API(RDA·네이버·기상청 등)가 ECONNRESET
 * 또는 응답 지연을 일으키면 페이지 빌드가 60초 타임아웃으로 실패하는
 * 패턴이 반복됨. 빌드 시에는 짧은 타임아웃(3s)으로 빠르게 폴백 처리하고,
 * 런타임(ISR fetch)에서는 기존 10초 타임아웃 유지.
 *
 * 사용법:
 *   import { FETCH_TIMEOUT, IS_BUILD_PHASE } from "./_build-phase";
 *   fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT) });
 *
 * NEXT_PHASE 값:
 *   - "phase-production-build" → vercel build / npm run build
 *   - "phase-production-server" → 런타임 prod
 *   - "phase-development-server" → dev
 */

export const IS_BUILD_PHASE =
  process.env.NEXT_PHASE === "phase-production-build";

/** 외부 API fetch 타임아웃 (빌드 3s, 런타임 10s) */
export const FETCH_TIMEOUT = IS_BUILD_PHASE ? 3_000 : 10_000;
