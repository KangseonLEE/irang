/**
 * 구글 서비스 계정 → OAuth 접근 토큰 (의존성 0) — GA4·서치 콘솔 클라이언트 공용 (2026-10-06).
 * 서비스 계정 JWT(RS256)를 scope 하나로 서명해 oauth2 토큰과 바꾼다.
 */
import { createSign } from "node:crypto";

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");

export const SCOPES = {
  analytics: "https://www.googleapis.com/auth/analytics.readonly",
  searchConsole: "https://www.googleapis.com/auth/webmasters.readonly",
};

/** @param sa 서비스 계정 JSON(client_email·private_key) */
export async function googleAccessToken(sa, scope) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}
