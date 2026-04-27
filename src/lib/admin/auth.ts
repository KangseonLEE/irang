/**
 * 어드민 인증 유틸
 *
 * Web Crypto API 기반 HMAC 토큰 + httpOnly 쿠키 검증.
 * Edge/Node.js 양쪽에서 동작.
 * 환경변수: ADMIN_PASSWORD, ADMIN_SECRET
 */

export const COOKIE_NAME = "admin_token";
const TOKEN_TTL_SEC = 60 * 60 * 8; // 8시간

function getSecret(): string {
  return process.env.ADMIN_SECRET ?? "dev-fallback-secret-change-me";
}

function getPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

// ── Web Crypto HMAC 헬퍼 ──

async function hmacSign(message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
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
  const expected = await hmacSign(message);
  // constant-time comparison (lengths always equal for hex sha256)
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

/** 비밀번호 검증 */
export function verifyPassword(input: string): boolean {
  const pw = getPassword();
  if (!pw) return false;
  if (input.length !== pw.length) return false;
  let result = 0;
  for (let i = 0; i < pw.length; i++) {
    result |= input.charCodeAt(i) ^ pw.charCodeAt(i);
  }
  return result === 0;
}

/** HMAC ���큰 생성 (payload: 만료 시각) */
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
