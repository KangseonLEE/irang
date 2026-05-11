/**
 * 빌드 phase 감지 + fetch 타임아웃 분기
 *
 * 배경: Vercel SSG 빌드 시 외부 API(RDA·네이버·기상청 등)가 ECONNRESET
 * 또는 응답 지연을 일으키면 페이지 빌드가 60초 타임아웃으로 실패하는
 * 패턴이 반복됨. 빌드 시에는 짧은 타임아웃(3s)으로 빠르게 폴백 처리.
 *
 * 런타임 타임아웃은 5s (2026-05-11 단축):
 * - 사용자 체감 응답성 우선 — 10s 이상 대기는 이탈 요인
 * - 일부 station 조합에서 10s 사고 사례 후 단축
 * - 5s 안에 응답 못 하면 정적 폴백 또는 부분 결과로 렌더
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

/** 외부 API fetch 타임아웃 (빌드 3s, 런타임 5s) */
export const FETCH_TIMEOUT = IS_BUILD_PHASE ? 3_000 : 5_000;
