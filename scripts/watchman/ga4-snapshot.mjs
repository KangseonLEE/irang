/**
 * GA4 Data API 스냅샷 (2026-09-08) — M7 판정 기준선용 핵심 지표를 마크다운 표로 출력.
 * 의존성 0: 서비스 계정 JWT(RS256, node:crypto) → OAuth 토큰 → analyticsdata runReport.
 *
 * env: GA4_PROPERTY_ID(숫자 속성 ID), GA4_SA_JSON(서비스 계정 JSON 원문), 선택 GA4_DAYS(기본 28)
 * 출력: stdout 마크다운. GITHUB_STEP_SUMMARY 가 있으면 거기에도 기록.
 */
import { createSign } from "node:crypto";
import { appendFileSync } from "node:fs";

const PID = process.env.GA4_PROPERTY_ID;
const SA = process.env.GA4_SA_JSON ? JSON.parse(process.env.GA4_SA_JSON) : null;
const DAYS = Number(process.env.GA4_DAYS || 28);
if (!PID || !SA) {
  console.error("GA4_PROPERTY_ID / GA4_SA_JSON 필요");
  process.exit(2);
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: SA.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign("RSA-SHA256").update(unsigned).sign(SA.private_key, "base64url");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

const token = await accessToken();
async function report(body) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PID}:runReport`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "yesterday" }], ...body }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`runReport ${res.status}: ${await res.text()}`);
  const j = await res.json();
  return (j.rows ?? []).map((r) => ({
    d: (r.dimensionValues ?? []).map((v) => v.value),
    m: (r.metricValues ?? []).map((v) => Number(v.value)),
  }));
}

const [totals, nvr, events, pages] = await Promise.all([
  report({ metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "newUsers" }] }),
  report({ dimensions: [{ name: "newVsReturning" }], metrics: [{ name: "activeUsers" }] }),
  report({
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["assess_start", "assess_complete", "match_start", "match_complete", "external_click", "landing_cta_click", "search"] } } },
  }),
  report({
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    dimensionFilter: { filter: { fieldName: "pagePath", inListFilter: { values: ["/", "/assess", "/match", "/regions/ranking", "/regions/compare", "/programs"] } } },
  }),
]);

const active = totals[0]?.m[0] ?? 0;
const returning = nvr.find((r) => r.d[0] === "returning")?.m[0] ?? 0;
const ev = Object.fromEntries(events.map((r) => [r.d[0], { count: r.m[0], users: r.m[1] }]));
const pg = Object.fromEntries(pages.map((r) => [r.d[0], { views: r.m[0], users: r.m[1] }]));
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");
const assessReach = pg["/assess"]?.users ?? 0;
const assessStart = ev.assess_start?.users ?? 0;
const assessDone = ev.assess_complete?.users ?? 0;

const verdict =
  active < 300 ? "유입 우선 (활성 < 300)"
  : active >= 600 && assessDone / active >= 0.05 && returning / active >= 0.1 ? "Go"
  : "Pivot (완료 < 5% 또는 재방문 < 10%)";

const md = `## GA4 스냅샷 — 최근 ${DAYS}일 (어제까지)

| 지표 | 값 | M7 기준 |
|---|---|---|
| 활성 사용자 | ${active} | Go ≥ 600 / 유입 우선 < 300 |
| 재방문 사용자 | ${returning} (${pct(returning, active)}) | Go ≥ 10% |
| 진단 완료 사용자 (assess_complete) | ${assessDone} (${pct(assessDone, active)} of 활성) | Go ≥ 5% |
| 진단 도달 (/assess page_view 사용자) | ${assessReach} | 도달→시작 ${pct(assessStart, assessReach)} |
| 진단 시작 (assess_start) | ${assessStart} | 시작→완료 ${pct(assessDone, assessStart)} |
| 매칭 시작 → 완료 | ${ev.match_start?.users ?? 0} → ${ev.match_complete?.users ?? 0} | |
| external_click | ${ev.external_click?.count ?? 0}건 / ${ev.external_click?.users ?? 0}명 | 목적지는 event_label 측정기준 |
| 랜딩 CTA 클릭 | ${ev.landing_cta_click?.count ?? 0}건 | |
| 세션 / 신규 | ${totals[0]?.m[1] ?? 0} / ${totals[0]?.m[2] ?? 0} | |

주요 페이지 조회(사용자): ${["/", "/assess", "/match", "/regions/ranking", "/regions/compare", "/programs"].map((p) => `\`${p}\` ${pg[p]?.users ?? 0}`).join(" · ")}

**판정(기계 계산, 참고용)**: ${verdict}

> /assess 도달은 9/8 배포(SPA page_view 보강) 이후 수집분부터 유효. 그 전 창에서는 0에 가깝게 나온다.
`;
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
