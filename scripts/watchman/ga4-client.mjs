/**
 * GA4 Data API 최소 클라이언트 (의존성 0) — ga4-snapshot.mjs · check-ga4-anomaly.mjs 공용 (2026-09-19).
 * 서비스 계정 JWT(RS256) → OAuth 토큰 → analyticsdata runReport.
 * env: GA4_PROPERTY_ID(숫자 속성 ID), GA4_SA_JSON(서비스 계정 JSON 원문)
 */
import { createSign } from "node:crypto";

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");

export function ga4Env() {
  const pid = process.env.GA4_PROPERTY_ID;
  const sa = process.env.GA4_SA_JSON ? JSON.parse(process.env.GA4_SA_JSON) : null;
  return pid && sa?.client_email && sa?.private_key ? { pid, sa } : null;
}

async function accessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
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

/**
 * runReport 함수를 만든다. 반환 함수는 `body.dateRanges` 가 없으면 `dateRanges` 기본값을 쓰고,
 * 행을 `{ d: string[], m: number[] }` 로 평탄화해 돌려준다.
 */
export async function createGa4Client({ pid, sa, dateRanges }) {
  const token = await accessToken(sa);
  return async function report(body) {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${pid}:runReport`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ dateRanges, ...body }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`runReport ${res.status}: ${await res.text()}`);
    const j = await res.json();
    return (j.rows ?? []).map((r) => ({
      d: (r.dimensionValues ?? []).map((v) => v.value),
      m: (r.metricValues ?? []).map((v) => Number(v.value)),
    }));
  };
}

/** 사이트 호스트만 세는 필터 — 로컬 prod 서버·미리보기 alias 의 조회를 판정 지표에서 뺀다 */
export const SITE_HOST = "irangfarm.com";
export const HOST_FILTER = { filter: { fieldName: "hostName", stringFilter: { matchType: "EXACT", value: SITE_HOST } } };
