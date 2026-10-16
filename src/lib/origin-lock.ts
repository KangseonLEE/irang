/**
 * 오리진 잠금 — Vercel 오리진은 Cloudflare 를 거친 요청만 받는다 (2026-10-16 보안 QA 🔴1).
 *
 * ── 왜 ──
 * `curl --resolve irangfarm.com:443:76.76.21.21 https://irangfarm.com/` 처럼 Vercel 에 바로 붙으면
 * Cloudflare 의 KR 외 차단·봇 차단 Worker·WAF 를 전부 건너뛴다. 게다가 미들웨어의 국가 판정은
 * `cf-ipcountry` 헤더가 **없으면 통과**라, 해외 데이터센터 봇이 Vercel 함수·CPU 를 직접 쓸 수 있다
 * (5/4 Hobby 일시 정지와 같은 경로). Cloudflare 만 아는 비밀 헤더로 오리진을 잠근다.
 *
 * ── 켜는 절차 (기본은 꺼짐 — 순서를 지킬 것) ──
 * 1. 시크릿 생성: `openssl rand -hex 32` (64자). 값은 대화·로그에 남기지 않는다.
 * 2. Cloudflare → irangfarm.com → Rules → Transform Rules → **Modify Request Header** 룰 추가
 *    - 조건: All incoming requests (호스트 irangfarm.com·www 모두)
 *    - 동작: Set static — 헤더 `x-irang-edge`, 값 = 1의 시크릿
 *    - Worker(irang-bot-detection)보다 먼저 적용되는지 무관 — Transform Rule 은 오리진 요청 헤더에 붙는다.
 * 3. Vercel → Settings → Environment Variables (Production 만, Sensitive)
 *    - `ORIGIN_LOCK_SECRET` = 1의 시크릿 (printf '%s' 로 넣어 끝 줄바꿈 금지 — 5/22 박제)
 *    - `ORIGIN_LOCK_MODE` = `log`
 *    → 재배포.
 * 4. `log` 로 하루 이상: Vercel 로그에서 `[origin-lock] mismatch` 가 **Cloudflare 경유 요청에서는 0** 인지 확인
 *    (`cf-ray=yes` 인 mismatch 가 있으면 2단계 룰이 일부 요청에 안 붙는 것 — enforce 금지).
 *    직접 접속 시험: `curl --resolve irangfarm.com:443:76.76.21.21 -sI https://irangfarm.com/about` → 로그에 `cf-ray=no` 한 줄.
 * 5. `ORIGIN_LOCK_MODE` = `enforce` → 재배포. 같은 curl 이 403, 일반 접속·E2E smoke·Sentry 웹훅·GSC URL 검사가 200 인지 확인.
 *    enforce 부터는 국가 판정도 `cf-ipcountry` 를 신뢰하고, 헤더가 없으면 KR 외로 본다.
 * 되돌리기: `ORIGIN_LOCK_MODE` 를 지우거나 `off` → 재배포. (시크릿 교체: CF 룰 값 → Vercel env 순으로, 사이에 log 로 잠깐)
 *
 * ── 검사하지 않는 것 ──
 * - `/.well-known/acme-challenge/` — 인증서 갱신 경로(7/24·8/17 자기잠금 사고).
 * - 운영 호스트(`irangfarm.com`·`www.irangfarm.com`)가 아닌 요청 — 미리보기 alias·localhost·dev 터널.
 *   그 호스트는 Cloudflare 를 거치지 않는 게 정상이고, 미리보기는 Vercel Auth 뒤에 있다.
 * - 시크릿이 비어 있으면 모드와 무관하게 끈다 — 설정 실수 하나로 사이트 전체가 403 이 되면 안 된다.
 *
 * 이 모듈은 미들웨어에서 import 된다 — node:crypto 금지(Web 표준만).
 */

export const ORIGIN_LOCK_HEADER = "x-irang-edge";
const PRODUCTION_HOSTS = new Set(["irangfarm.com", "www.irangfarm.com"]);
const ACME_PREFIX = "/.well-known/acme-challenge/";

export type OriginLockMode = "off" | "log" | "enforce";

export interface OriginLockEnv {
  mode?: string | undefined;
  secret?: string | undefined;
}

function readEnv(): OriginLockEnv {
  return { mode: process.env.ORIGIN_LOCK_MODE, secret: process.env.ORIGIN_LOCK_SECRET };
}

/** 모드 — 미설정·알 수 없는 값은 off. 시크릿이 없으면 무조건 off(전면 403 방지) */
export function originLockMode(env: OriginLockEnv = readEnv()): OriginLockMode {
  const secret = (env.secret ?? "").trim();
  if (!secret) return "off";
  const mode = (env.mode ?? "").trim().toLowerCase();
  return mode === "log" || mode === "enforce" ? mode : "off";
}

/** Host 헤더 → 운영 호스트인지 (포트·대소문자 무시) */
export function isProductionHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const name = host.trim().toLowerCase().replace(/:\d+$/, "");
  return PRODUCTION_HOSTS.has(name);
}

/**
 * 상수 시간 문자열 비교 — 실행 시간이 비밀값 길이에만 의존한다.
 * 길이 차이도 diff 에 접어 넣어, 길이가 달라도 같은 횟수만큼 돈다.
 */
export function constantTimeEqual(input: string, secret: string): boolean {
  let diff = input.length ^ secret.length;
  for (let i = 0; i < secret.length; i++) {
    // 범위 밖 charCodeAt 은 NaN → 비트 연산에서 0. 길이 차이는 위에서 이미 diff 에 들어갔다
    diff |= (input.charCodeAt(i) | 0) ^ secret.charCodeAt(i);
  }
  return diff === 0;
}

export type OriginLockDecision =
  | { action: "pass"; reason: "off" | "exempt-path" | "non-production-host" | "ok" }
  | { action: "log"; reason: "mismatch" }
  | { action: "block"; reason: "mismatch" };

export interface OriginLockInput {
  host: string | null | undefined;
  pathname: string;
  /** 요청의 `x-irang-edge` 값 */
  edgeHeader: string | null | undefined;
}

/** 미들웨어 첫 분기에서 부르는 판정 */
export function decideOriginLock(
  input: OriginLockInput,
  env: OriginLockEnv = readEnv(),
): OriginLockDecision {
  const mode = originLockMode(env);
  if (mode === "off") return { action: "pass", reason: "off" };
  if (input.pathname.startsWith(ACME_PREFIX)) return { action: "pass", reason: "exempt-path" };
  if (!isProductionHost(input.host)) return { action: "pass", reason: "non-production-host" };

  const secret = (env.secret ?? "").trim();
  if (constantTimeEqual(input.edgeHeader ?? "", secret)) return { action: "pass", reason: "ok" };
  return mode === "enforce"
    ? { action: "block", reason: "mismatch" }
    : { action: "log", reason: "mismatch" };
}

/**
 * 이 호스트로 온 요청이 Cloudflare 를 거쳤다고 미들웨어가 **보장**하는가 —
 * enforce + 운영 호스트일 때만 true. 이때만 `cf-ipcountry`·`cf-connecting-ip` 를 믿을 수 있다.
 */
export function isOriginLockEnforced(
  host: string | null | undefined,
  env: OriginLockEnv = readEnv(),
): boolean {
  return originLockMode(env) === "enforce" && isProductionHost(host);
}

/**
 * 국가 판정에 쓸 값.
 * - 잠금 enforce + 운영 호스트: `cf-ipcountry` 를 신뢰. 헤더가 없으면 `"XX"`(알 수 없음 = KR 외)로 본다 —
 *   Cloudflare 는 모든 요청에 이 헤더를 넣으므로 없다는 것 자체가 이상 신호다.
 * - 그 밖(off·log·미리보기·로컬): 지금까지와 같다 — 헤더가 없으면 null(국가 차단하지 않음).
 *   켜기 전에 갑자기 막히는 요청이 생기지 않게 한다.
 */
export function countryForGeoBlock(
  host: string | null | undefined,
  cfIpCountry: string | null | undefined,
  env: OriginLockEnv = readEnv(),
): string | null {
  const value = cfIpCountry?.trim().toUpperCase() || null;
  if (isOriginLockEnforced(host, env)) return value ?? "XX";
  return value;
}
