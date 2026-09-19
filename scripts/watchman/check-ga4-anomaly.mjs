/**
 * §17 GA4 계측 오염·급증 감시 (2026-09-19) — watchman-ci 매일.
 *
 * 배경: 9/17 하루 활성이 16 → 86 으로 뛰었고 회장이 GA 화면에서 발견했다. 70명은 로컬
 * `next start` 에서 돌린 Playwright 실측(localhost)이었다. 게이트를 고쳤지만(호스트 허용목록·
 * webdriver 차단) **다음 구멍은 또 다른 모양**일 것이므로, 결과(집계) 쪽에서 매일 본다.
 *
 * 판정 (판정일 = 2daysAgo — GA4 는 전날 데이터가 아직 확정 전일 수 있다):
 *   🟡 사이트 외 호스트(localhost·*.vercel.app 등) 활성 ≥ 1명 → 게이트가 뚫렸다
 *   🟡 사이트 활성이 직전 7일 중앙값의 3배 초과이고 +20명 이상 → 급증. 해상도·도시·브라우저
 *      상위 서명을 근거에 붙여 실측(1280x700 같은 뷰포트)인지 실제 유입인지 바로 가르게
 *   ⚪ 시크릿 없음(로컬 실행) → 건너뜀
 * 출력 계약: WATCHMAN_FINDINGS 에 `등급|항목|근거` 1행 append (report.sh 가 취합).
 */
import { appendFileSync } from "node:fs";
import { createGa4Client, ga4Env, HOST_FILTER, SITE_HOST } from "./ga4-client.mjs";

const finding = (grade, item, reason) => {
  console.log(`  ${grade} ${item} — ${reason}`);
  if (process.env.WATCHMAN_FINDINGS) appendFileSync(process.env.WATCHMAN_FINDINGS, `${grade}|${item}|${reason}\n`, "utf8");
};

console.log("▸ §17 GA4 계측 오염·급증 감시");
const env = ga4Env();
if (!env) {
  console.log("  ⚪ GA4_PROPERTY_ID / GA4_SA_JSON 없음 — 건너뜀 (CI 시크릿 필요)");
  process.exit(0);
}

const report = await createGa4Client({ ...env, dateRanges: [{ startDate: "9daysAgo", endDate: "2daysAgo" }] });
const byDate = { orderBys: [{ dimension: { dimensionName: "date" } }] };
const [byDayHost, byDaySite] = await Promise.all([
  report({ dimensions: [{ name: "date" }, { name: "hostName" }], metrics: [{ name: "activeUsers" }], ...byDate, limit: 200 }),
  report({ dimensions: [{ name: "date" }], metrics: [{ name: "activeUsers" }], dimensionFilter: HOST_FILTER, ...byDate }),
]);
const day = (d) => `${d.slice(4, 6)}/${d.slice(6, 8)}`;
const judged = byDaySite.at(-1)?.d[0] ?? byDayHost.at(-1)?.d[0];
if (!judged) {
  console.log("  ✓ 조회 데이터 없음");
  process.exit(0);
}

// a) 사이트 외 호스트
const foreign = byDayHost.filter((r) => r.d[0] === judged && r.d[1] !== SITE_HOST && r.d[1] !== `www.${SITE_HOST}`);
const foreignUsers = foreign.reduce((a, r) => a + r.m[0], 0);
if (foreignUsers > 0) {
  finding("🟡", `GA4 사이트 외 호스트 집계 (${day(judged)})`,
    `${foreign.map((r) => `${r.d[1]} ${r.m[0]}명`).join(" · ")} — 게이트(호스트 허용목록·webdriver) 우회 경로 확인. 로컬 next start 나 미리보기에서 gtag 가 로드됐다는 뜻`);
} else {
  console.log(`  ✓ ${day(judged)} 사이트 외 호스트 집계 0명`);
}

// b) 급증
const series = byDaySite.map((r) => r.m[0]);
const today = series.at(-1) ?? 0;
const prev = series.slice(0, -1).sort((a, b) => a - b);
const median = prev.length ? prev[Math.floor(prev.length / 2)] : 0;
if (prev.length >= 3 && today > Math.max(median * 3, median + 20)) {
  const sig = await createGa4Client({ ...env, dateRanges: [{ startDate: "2daysAgo", endDate: "2daysAgo" }] });
  const [res, city, br] = await Promise.all([
    sig({ dimensions: [{ name: "screenResolution" }], metrics: [{ name: "activeUsers" }], dimensionFilter: HOST_FILTER, orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 3 }),
    sig({ dimensions: [{ name: "city" }], metrics: [{ name: "activeUsers" }], dimensionFilter: HOST_FILTER, orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 3 }),
    sig({ dimensions: [{ name: "browser" }, { name: "operatingSystem" }], metrics: [{ name: "activeUsers" }], dimensionFilter: HOST_FILTER, orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 3 }),
  ]);
  const fmt = (rows) => rows.map((r) => `${r.d.join(" ")} ${r.m[0]}`).join(", ");
  finding("🟡", `GA4 활성 급증 (${day(judged)})`,
    `${today}명 vs 직전 7일 중앙값 ${median}명. 서명 — 해상도 ${fmt(res)} / 도시 ${fmt(city)} / 브라우저 ${fmt(br)}. 1280x700·1280x900 같은 실측 뷰포트가 상위면 우리 테스트, 아니면 실제 유입(원인 확인)`);
} else {
  console.log(`  ✓ ${day(judged)} 사이트 활성 ${today}명 (직전 7일 중앙값 ${median}명) — 급증 아님`);
}
