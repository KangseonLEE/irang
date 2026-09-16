/**
 * 내부·테스트 트래픽 적재 게이트 (2026-09-16)
 *
 * 운영자 테스트 검색·피드백이 admin 집계(인기 검색어·결과 없는 검색어)에 그대로 쌓이던 문제.
 * 9/14 세션 테스트 48건이 인기 검색어 1위를 차지해 30일 집계를 통째로 흐렸다.
 *
 * 판정 3종 (server):
 *   - `e2e`      UA 토큰 `irang-e2e` 또는 헤더 `x-irang-e2e` — Playwright (8/31 진단 DB 오염 교훈)
 *   - `internal` 쿠키 `irang-internal=1` — 운영자 브라우저 (/admin 1회 방문 시 자동 설정)
 *   - `dev`      NODE_ENV !== "production" — 로컬 dev 서버(프로덕션 Supabase 를 바라본다)
 *
 * 쿠키를 쓰는 이유: localStorage 는 서버가 읽을 수 없고, 헤더 방식은 write 호출처마다
 * 손으로 붙여야 해 새 엔드포인트에서 빠진다. 쿠키는 same-origin fetch 에 자동 동반되므로
 * 앞으로 추가되는 write 엔드포인트도 이 판정 하나만 호출하면 된다.
 *
 * GA4 게이트(`analytics-gate.ts`)와 플래그 이름을 공유하되 저장소가 다르다
 * (GA 는 인라인 스크립트라 localStorage, 여기는 서버 판정이라 쿠키) — 둘 다 AdminShell 이 세운다.
 */

import { INTERNAL_TRAFFIC_FLAG } from "@/lib/analytics-gate";

/** 운영자 브라우저 표시 쿠키 — localStorage 플래그와 같은 이름을 공유한다 */
export const INTERNAL_TRAFFIC_COOKIE = INTERNAL_TRAFFIC_FLAG;

/** 쿠키를 심지 못하는 환경(진단 스크립트·curl)용 명시 헤더 */
export const INTERNAL_TRAFFIC_HEADER = "x-irang-internal";

export type InternalSkipReason = "e2e" | "internal" | "dev";

/** 최소한의 헤더·쿠키 접근만 요구 — NextRequest 없이도 테스트 가능 */
export interface RequestLike {
  headers: { get(name: string): string | null };
  cookies?: { get(name: string): { value: string } | undefined };
}

/**
 * 이 요청을 집계에서 제외해야 하는 이유. 일반 방문자면 null.
 *
 * 호출처는 INSERT 를 건너뛰되 성공 응답을 돌려준다 — 클라이언트에 오류를 노출하면
 * 운영자 브라우저에서만 UI 가 다르게 보여 또 다른 혼선이 된다.
 */
export function internalSkipReason(req: RequestLike): InternalSkipReason | null {
  const ua = req.headers.get("user-agent") ?? "";
  if (ua.includes("irang-e2e") || req.headers.get("x-irang-e2e") !== null) {
    return "e2e";
  }

  if (req.headers.get(INTERNAL_TRAFFIC_HEADER) === "1") return "internal";
  if (req.cookies?.get(INTERNAL_TRAFFIC_COOKIE)?.value === "1") return "internal";

  if (process.env.NODE_ENV !== "production") return "dev";

  return null;
}

/** e2e 단독 판정 — 운영자·dev 는 통과시켜야 하는 경로(커뮤니티 작성 등)용 */
export function isE2eRequest(req: RequestLike): boolean {
  const ua = req.headers.get("user-agent") ?? "";
  return ua.includes("irang-e2e") || req.headers.get("x-irang-e2e") !== null;
}

/**
 * 브라우저를 운영자용으로 표시 (client 전용).
 * localStorage = GA 게이트, 쿠키 = 서버 적재 게이트. 1년 유지.
 */
export function markInternalBrowser(): void {
  try {
    window.localStorage.setItem(INTERNAL_TRAFFIC_FLAG, "1");
  } catch {
    // 스토리지 차단(프라이빗 모드) — 쿠키만으로도 서버 적재는 막힌다
  }
  try {
    const oneYear = 365 * 24 * 60 * 60;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${INTERNAL_TRAFFIC_COOKIE}=1; Max-Age=${oneYear}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // 쿠키 차단 — localStorage 플래그로 GA 만 제외됨
  }
}
