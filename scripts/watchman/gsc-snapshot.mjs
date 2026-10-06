/**
 * 서치 콘솔 월간 스냅샷 (2026-10-06, 회장 "다 진행하자" — 검색 성과를 내려받지 않고 매달 자동으로).
 *
 * 하는 일:
 *  1. Search Analytics — 지난달(또는 GSC_MONTH) 합계·일별·페이지·검색어·국가·기기 + 전월 비교
 *  2. URL 검사 — 사이트맵 URL 중 그달 노출 0 인 것의 색인 상태(색인됨 / 크롤링됨-색인 안 됨 / 발견됨-색인 안 됨 …)
 *  결과는 마크다운(stdout) → 워크플로가 이슈(gsc-snapshot)로 올린다.
 *
 * env:
 *  GSC_SA_JSON   서비스 계정 JSON(GA4 스냅샷과 같은 계정 — GSC 사용자로 '제한됨' 이상 추가돼 있어야 한다)
 *  GSC_SITE      기본 sc-domain:irangfarm.com
 *  GSC_MONTH     YYYY-MM (비우면 KST 기준 지난달)
 *  GSC_INSPECT   "0" 이면 URL 검사 생략
 *  GSC_INSPECT_LIMIT 검사 최대 URL 수 (기본 400 — 속성당 하루 2,000·분당 600 한도 안)
 *  E2E_SECRET    사이트맵을 미국 러너에서 읽을 때 쓰는 우회 헤더(없으면 그냥 요청)
 */
import { SCOPES, googleAccessToken } from "./google-auth.mjs";
import { SITE_ORIGIN, monthRange, prevMonth, renderReport } from "./gsc-report.mjs";

const SITE = process.env.GSC_SITE || "sc-domain:irangfarm.com";
const API = "https://searchconsole.googleapis.com";

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

/** 403 의 흔한 두 원인을 사람 말로 */
function explain(status, body) {
  if (status === 403 && /sufficient permission|not have permission|forbidden/i.test(body)) {
    return "서비스 계정이 서치 콘솔 속성 사용자로 추가되지 않았어요 — GSC 설정 → 사용자 및 권한 → 사용자 추가(제한됨).";
  }
  if (status === 403 && /has not been used|is disabled|SERVICE_DISABLED/i.test(body)) {
    return "서비스 계정의 Google Cloud 프로젝트에서 'Google Search Console API' 를 사용 설정해야 해요.";
  }
  return `서치 콘솔 API ${status}: ${body.slice(0, 300)}`;
}

async function api(token, path, body) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) throw Object.assign(new Error(explain(res.status, text)), { status: res.status });
  return JSON.parse(text);
}

async function query(token, { start, end }, dimensions, rowLimit = 1000) {
  const j = await api(token, `/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`, {
    startDate: start,
    endDate: end,
    dimensions,
    type: "web",
    dataState: "final",
    rowLimit,
  });
  return j.rows ?? [];
}

/** 미국 러너는 KR 외 차단에 걸린다 — watchman §13 과 같은 e2e 우회 헤더 */
function siteHeaders() {
  const h = { "user-agent": "Mozilla/5.0 (compatible; irang-watchman) irang-e2e/1.0" };
  if (process.env.E2E_SECRET) Object.assign(h, { "x-irang-e2e": "playwright", "x-irang-e2e-secret": process.env.E2E_SECRET });
  return h;
}

async function fetchText(url) {
  const res = await fetch(url, { headers: siteHeaders(), signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.text();
}

/** /sitemap.xml(목록) → 하위 사이트맵 → URL. 목록이 없으면 robots.txt 의 Sitemap 줄 */
async function sitemapUrls() {
  let children = [];
  try {
    const idx = await fetchText(`${SITE_ORIGIN}/sitemap.xml`);
    children = [...idx.matchAll(/<sitemap>\s*<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch {
    /* 목록이 없던 시절 대비 */
  }
  if (children.length === 0) {
    const robots = await fetchText(`${SITE_ORIGIN}/robots.txt`);
    children = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]).filter((u) => !u.endsWith("/sitemap.xml"));
  }
  const urls = new Set();
  for (const child of children) {
    const xml = await fetchText(child);
    for (const m of xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)) urls.add(m[1]);
  }
  return [...urls];
}

async function inspectAll(token, urls, concurrency = 4) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        const j = await api(token, "/v1/urlInspection/index:inspect", { inspectionUrl: url, siteUrl: SITE, languageCode: "ko" });
        const s = j.inspectionResult?.indexStatusResult ?? {};
        results.push({ url, coverageState: s.coverageState, verdict: s.verdict, lastCrawlTime: s.lastCrawlTime });
      } catch (e) {
        if (e.status === 403 || e.status === 401) throw e;
        results.push({ url, error: `검사 실패(${e.status ?? "네트워크"})` });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

function lastMonthKst() {
  const kst = new Date(Date.now() + 9 * 3600_000);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth(); // 0-based → 지난달
  return m === 0 ? `${y - 1}-12` : `${y}-${String(m).padStart(2, "0")}`;
}

async function main() {
  const raw = process.env.GSC_SA_JSON || process.env.GA4_SA_JSON;
  if (!raw) fail("GSC_SA_JSON(서비스 계정 JSON) 이 없어요.");
  const sa = JSON.parse(raw);
  const ym = process.env.GSC_MONTH || lastMonthKst();
  if (!/^\d{4}-\d{2}$/.test(ym)) fail(`GSC_MONTH 형식은 YYYY-MM 이에요: ${ym}`);
  const prevYm = prevMonth(ym);
  const cur = monthRange(ym);
  const prev = monthRange(prevYm);

  const token = await googleAccessToken(sa, SCOPES.searchConsole).catch((e) => fail(`토큰 발급 실패 — 서비스 계정 키 확인: ${e.message}`));

  const [totalRows, prevTotalRows, dateRows, pageRows, prevPageRows, queryRows, countryRows, deviceRows] = await Promise.all([
    query(token, cur, []),
    query(token, prev, []),
    query(token, cur, ["date"]),
    query(token, cur, ["page"], 5000),
    query(token, prev, ["page"], 5000),
    query(token, cur, ["query"], 200),
    query(token, cur, ["country"]),
    query(token, cur, ["device"]),
  ]).catch((e) => fail(e.message));

  let inspection = null;
  if (process.env.GSC_INSPECT !== "0") {
    const limit = Number(process.env.GSC_INSPECT_LIMIT || 400);
    const all = await sitemapUrls().catch((e) => {
      console.error(`⚠ 사이트맵을 못 읽어 색인 검사를 건너뛰어요: ${e.message}`);
      return null;
    });
    if (all) {
      const seen = new Set(pageRows.map((r) => r.keys[0].replace(/\/$/, "")));
      const zero = all.filter((u) => !seen.has(u.replace(/\/$/, "")));
      const results = await inspectAll(token, zero.slice(0, limit)).catch((e) => fail(e.message));
      inspection = { sitemapCount: all.length, zeroCount: zero.length, results };
    }
  }

  process.stdout.write(
    renderReport({ ym, totalRows, prevTotalRows, dateRows, pageRows, prevPageRows, queryRows, countryRows, deviceRows, inspection }),
  );
}

main();
