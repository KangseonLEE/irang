/**
 * 요청자 IP — 레이트리밋·공감/신고 멱등·로그인 시도 제한 키의 단일 출처 (2026-10-16 보안 QA 🟡7).
 *
 * 예전엔 라우트마다 `x-forwarded-for` 첫 값을 따로 읽었다(7곳, 순서·폴백이 제각각).
 *
 * ── 헤더 근거 (Vercel 문서 "Request headers", https://vercel.com/docs/headers/request-headers) ──
 * - `x-forwarded-for` / `x-real-ip`: Vercel 이 **덮어쓴다** — 클라이언트가 보낸 값은 버려지고
 *   Vercel 에 접속한 쪽의 공인 IP 가 들어간다(스푸핑 방지). Vercel 앞에 프록시가 있으면 그 프록시의 IP 다.
 * - `x-vercel-forwarded-for`: x-forwarded-for 와 같은 값이지만, 앞단 프록시가 x-forwarded-for 를
 *   다시 쓰더라도 Vercel 이 본 값을 그대로 유지한다 → 1순위.
 * - `NextRequest.ip`·`geo` 는 Next 15 에서 제거됐다(node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-request.md
 *   버전 표 "v15.0.0 ip and geo removed") — 헤더에서 직접 읽어야 한다.
 *
 * ── Cloudflare 뒤라는 점 ──
 * irangfarm.com 은 Cloudflare 프록시 뒤라 위 세 헤더는 **Cloudflare 엣지 IP** 일 수 있다 — 여러 사용자가
 * 한 버킷을 나눠 쓰게 된다. 진짜 사용자 IP 는 Cloudflare 가 넣는 `cf-connecting-ip` 인데,
 * 오리진에 Cloudflare 를 거치지 않고 바로 접속하면 누구나 이 헤더를 지어낼 수 있다(보안 QA 🔴1).
 * 그래서 **오리진 잠금이 enforce 일 때만**(= 운영 호스트에 닿은 요청은 전부 Cloudflare 를 거쳤다고
 * 미들웨어가 보장할 때만) `cf-connecting-ip` 를 우선한다. 그 전에는 위조 불가능한 Vercel 헤더를 쓴다.
 * 판정은 `lib/origin-lock.ts` 와 같은 환경변수·호스트 규칙을 공유한다.
 *
 * 반환값은 키로만 쓴다 — 저장할 때는 반드시 해시(`lib/community/ip-hash`, `lib/admin/login-throttle`).
 */

import { isOriginLockEnforced } from "@/lib/origin-lock";

type HeaderSource = { headers: Headers };

function firstHop(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(",")[0]?.trim();
  return first ? first : null;
}

/** 요청자 IP. 아무 헤더도 없으면 `"unknown"`(로컬 단위 테스트 등) */
export function getClientIp(req: HeaderSource): string {
  const h = req.headers;
  if (isOriginLockEnforced(h.get("host"))) {
    const cf = h.get("cf-connecting-ip")?.trim();
    if (cf) return cf;
  }
  return (
    firstHop(h.get("x-vercel-forwarded-for")) ??
    (h.get("x-real-ip")?.trim() || null) ??
    firstHop(h.get("x-forwarded-for")) ??
    "unknown"
  );
}
