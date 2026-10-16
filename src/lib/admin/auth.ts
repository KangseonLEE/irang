/**
 * 어드민 인증 유틸
 *
 * Web Crypto API 기반 HMAC 토큰 + httpOnly 쿠키 검증.
 * Edge/Node.js 양쪽에서 동작.
 * 환경변수: ADMIN_PASSWORD, ADMIN_SECRET
 */

export const COOKIE_NAME = "admin_token";
const TOKEN_TTL_SEC = 60 * 60 * 8; // 8시간

/** 서명 키 최소 길이 — 32자 미만은 대입·추측 여지가 있어 운영에서 거부한다 */
const MIN_ADMIN_SECRET_LENGTH = 32;
const DEV_FALLBACK_SECRET = "dev-fallback-secret-change-me";

/**
 * 서명 키 — **운영에서는 fail-closed** (2026-10-16 보안 QA ⚪1).
 *
 * 예전엔 ADMIN_SECRET 이 없으면 리포에 공개된 고정 문자열로 서명했다. 운영엔 설정돼 있지만
 * 환경변수 하나가 빠지는 순간 누구나 관리자 토큰을 만들 수 있는 구조였다.
 * 지금은 `VERCEL_ENV === "production"` 에서 키가 **없으면** null → 로그인·토큰 검증 모두 실패.
 * 32자 미만은 운영에서 경고만 남기고 쓴다 — 운영 값의 길이는 숨김 처리라 확인할 수 없고, 짧은 키로
 * 막아 버리면 배포 직후 관리자가 잠긴다(10/16 CoS 판단). 길이 확인·교체 뒤 거부로 올린다.
 * 개발·미리보기(키 없음)에서만 폴백을 쓴다 — 미리보기는 Vercel Auth 뒤에 있고 service role 키도 없다.
 */
let warnedShortSecret = false;
function getSecret(): string | null {
  const secret = (process.env.ADMIN_SECRET ?? "").trim();
  if (secret.length >= MIN_ADMIN_SECRET_LENGTH) return secret;
  if (process.env.VERCEL_ENV === "production") {
    if (!secret) return null;
    if (!warnedShortSecret) {
      warnedShortSecret = true;
      console.warn(`[admin-auth] ADMIN_SECRET 이 ${MIN_ADMIN_SECRET_LENGTH}자 미만이에요 — 교체 권장`);
    }
    return secret;
  }
  return secret || DEV_FALLBACK_SECRET;
}

/** 운영에서 서명 키가 쓸 수 있는 상태인지 — 로그인 라우트가 503 을 낼지 판단 */
export function isAdminAuthConfigured(): boolean {
  return getSecret() !== null && getPassword() !== "";
}

function getPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

// ── Web Crypto HMAC 헬퍼 ──

async function hmacSign(message: string): Promise<string> {
  const secret = getSecret();
  if (secret === null) throw new Error("ADMIN_SECRET 미설정 — 운영에서 서명 거부");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacVerify(message: string, signature: string): Promise<boolean> {
  if (getSecret() === null) return false;
  const expected = await hmacSign(message);
  // constant-time comparison (lengths always equal for hex sha256)
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

/**
 * 비밀번호 검증 — 양쪽 sha256 다이제스트(항상 32바이트)를 상수 시간으로 비교한다 (보안 QA ⚪2).
 * 예전엔 길이가 다르면 즉시 false 라 응답 시간으로 비밀번호 길이가 샜다.
 * Web Crypto 만 쓴다 — 이 모듈은 미들웨어에서도 import 된다(node:crypto 금지).
 */
export async function verifyPassword(input: string): Promise<boolean> {
  const pw = getPassword();
  if (!pw) return false;
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(input)),
    crypto.subtle.digest("SHA-256", enc.encode(pw)),
  ]);
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/** HMAC 토큰 생성 (payload: 만료 시각) */
export async function createToken(): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC;
  const payload = `admin:${expires}`;
  const sig = await hmacSign(payload);
  return `${payload}:${sig}`;
}

/** 토큰 검증 (만료 + 서명) */
export async function verifyToken(token: string): Promise<boolean> {
  const parts = token.split(":");
  if (parts.length !== 3) return false;

  const [prefix, expiresStr, sig] = parts;
  const payload = `${prefix}:${expiresStr}`;

  // 만료 확인
  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires) || expires < Math.floor(Date.now() / 1000)) return false;

  // 서명 검증
  return hmacVerify(payload, sig);
}

/** Set-Cookie 헤더 값 생성 */
export function buildCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=${TOKEN_TTL_SEC}`;
}

/** 쿠키 삭제 헤더 */
export function buildLogoutCookieHeader(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0`;
}
