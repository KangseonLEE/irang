/**
 * GA4 Data API 스냅샷 (2026-09-08) — M7 판정 기준선용 핵심 지표를 마크다운 표로 출력.
 * 의존성 0: 서비스 계정 JWT(RS256, node:crypto) → OAuth 토큰 → analyticsdata runReport.
 *
 * env: GA4_PROPERTY_ID(숫자 속성 ID), GA4_SA_JSON(서비스 계정 JSON 원문), 선택 GA4_DAYS(기본 28)
 * 출력: stdout 마크다운. GITHUB_STEP_SUMMARY 가 있으면 거기에도 기록.
 */
import { appendFileSync } from "node:fs";
import { createGa4Client, HOST_FILTER } from "./ga4-client.mjs";

const PID = process.env.GA4_PROPERTY_ID;
const SA = process.env.GA4_SA_JSON ? JSON.parse(process.env.GA4_SA_JSON) : null;
const DAYS = Number(process.env.GA4_DAYS || 28);
if (!PID || !SA) {
  console.error("GA4_PROPERTY_ID / GA4_SA_JSON 필요");
  process.exit(2);
}

const raw = await createGa4Client({ pid: PID, sa: SA, dateRanges: [{ startDate: `${DAYS}daysAgo`, endDate: "yesterday" }] });
// 정규 리포트는 hostName == irangfarm.com 만 센다 (9/19). 9/17 로컬 prod 서버 실측이 localhost 로
// 70명 잡혀 하루 활성이 5배 부풀었고, GA 에서 과거 데이터는 지울 수 없다 — 판정 지표에서 걸러낸다.
// 진단 모드(GA4_DIAG)는 호스트를 봐야 하므로 필터 없이 조회한다.
async function report(body, { allHosts = false } = {}) {
  const { dimensionFilter, ...body2 } = body;
  const filter = allHosts
    ? dimensionFilter
    : dimensionFilter
      ? { andGroup: { expressions: [HOST_FILTER, dimensionFilter] } }
      : HOST_FILTER;
  return raw({ ...body2, ...(filter ? { dimensionFilter: filter } : {}) });
}

// 진단 모드 (2026-09-19): 방문 급증이 실제 사용자인지, 우리 실측(로컬 prod 서버 Playwright 등)인지 가른다.
// 로컬 `next start` 는 NODE_ENV=production 이라 GA 가 로드되고, 새 브라우저 컨텍스트마다 새 사용자로 잡힌다.
// hostName·screenResolution·city 조합이 서명이다 (localhost / 1280x700·1280x900 / 세션 도시).
if (process.env.GA4_DIAG === "1") {
  const users = [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }];
  const byDate = { orderBys: [{ dimension: { dimensionName: "date" } }] };
  const [byHost, byDayHost, byDayRes, byDayCity, hostPages, byDayBrowser] = await Promise.all([
    report({ dimensions: [{ name: "hostName" }], metrics: users, orderBys: [{ metric: { metricName: "sessions" }, desc: true }] }, { allHosts: true }),
    report({ dimensions: [{ name: "date" }, { name: "hostName" }], metrics: users, ...byDate, limit: 200 }, { allHosts: true }),
    report({ dimensions: [{ name: "date" }, { name: "screenResolution" }], metrics: users, ...byDate, limit: 300 }, { allHosts: true }),
    report({ dimensions: [{ name: "date" }, { name: "city" }], metrics: users, ...byDate, limit: 300 }, { allHosts: true }),
    report({ dimensions: [{ name: "hostName" }, { name: "pagePath" }], metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }], orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }], limit: 40 }, { allHosts: true }),
    report({ dimensions: [{ name: "date" }, { name: "browser" }, { name: "operatingSystem" }], metrics: users, ...byDate, limit: 300 }, { allHosts: true }),
  ]);
  const day = (d) => `${d.slice(4, 6)}/${d.slice(6, 8)}`;
  const table = (rows, head) => `| ${head.join(" | ")} |\n|${head.map(() => "---").join("|")}|\n${rows.map((r) => `| ${[...r.d.map((v, i) => (i === 0 && /^\d{8}$/.test(v) ? day(v) : v)), ...r.m].join(" | ")} |`).join("\n") || "| (없음) |"}`;
  const top = (rows, n = 40) => rows.sort((a, b) => b.m[0] - a.m[0]).slice(0, n).sort((a, b) => a.d[0].localeCompare(b.d[0]) || b.m[0] - a.m[0]);
  const md = `## GA4 진단 — 최근 ${DAYS}일 (어제까지) 방문 급증 출처

### 호스트별 합계 (활성·세션·조회)
${table(byHost, ["hostName", "활성", "세션", "조회"])}

### 일자 × 호스트
${table(byDayHost, ["일자", "hostName", "활성", "세션", "조회"])}

### 일자 × 화면 해상도 (상위)
${table(top(byDayRes), ["일자", "해상도", "활성", "세션", "조회"])}

### 일자 × 도시 (상위)
${table(top(byDayCity), ["일자", "도시", "활성", "세션", "조회"])}

### 일자 × 브라우저·OS (상위)
${table(top(byDayBrowser), ["일자", "브라우저", "OS", "활성", "세션", "조회"])}

### 호스트 × 페이지 (조회 상위 40)
${table(hostPages, ["hostName", "pagePath", "조회", "사용자"])}
`;
  console.log(md);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  process.exit(0);
}

// 검색 일별 추이 — DB search_logs 적재량과 대조해 "적재 끊김"과 "사용자가 안 쓴다"를 가른다 (9/16).
// 9/8 이후 search_logs 0건이 어느 쪽인지 28일 합계만으로는 판정할 수 없었다.
const searchDailyReq = {
  dimensions: [{ name: "date" }],
  metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
  dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "search" } } },
  orderBys: [{ dimension: { dimensionName: "date" } }],
};

// 유입 구조 — 세션이 "어느 페이지로 들어오는지"와 "어디서 오는지" (9/16).
// 활성 622명인데 랜딩 `/` 조회가 62명이라, 대부분이 검색엔진에서 상세 페이지로 직접
// 들어온다는 가설이 섰다. 사실이면 전환 작업 대상은 랜딩이 아니라 상세 페이지다.
const landingReq = {
  dimensions: [{ name: "landingPagePlusQueryString" }],
  metrics: [{ name: "sessions" }, { name: "activeUsers" }],
  orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  limit: 30,
};
const channelReq = {
  dimensions: [{ name: "sessionDefaultChannelGroup" }],
  metrics: [{ name: "sessions" }],
  orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  limit: 8,
};

// 9/16 진입점 확대(PersonaCta 6지면)의 되돌림 판정(≈9/30) 근거 — 어느 지면이 도달을 만드는지.
// 지면별 0에 가까우면 철회. compare_view 는 실사용 1순위(지역 비교)의 탭 분포.
const byLabelReq = (eventName) => ({
  dimensions: [{ name: "customEvent:event_label" }],
  metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
  dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: eventName } } },
  orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
  limit: 20,
});

// 홍보 팝업 퍼널(9/30 회장 "원본 페이지로 얼마나 이동하는지") — label = "<id>"(view) / "<id>:detail|tel|request"(click) / "<id>:today|close"(dismiss)
// 랜딩 섹션별 도달 → 클릭 (10/5 회장 "인터뷰를 랜딩에 둘지" — 8/30 계측의 섹션별 판독). 도달 label = 섹션 trackId,
// 클릭 label = "섹션:대상" 이라 접두어로 묶는다. 인터뷰는 목록·상세 조회도 같이 본다.
const landingClickReq = { ...byLabelReq("landing_cta_click"), limit: 200 };
const interviewPagesReq = {
  dimensions: [{ name: "pagePath" }],
  metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
  dimensionFilter: { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/interviews" } } },
  orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
  limit: 50,
};

const [totals, nvr, events, pages, searchDaily, landings, channels, entryByLabel, compareByLabel, promoView, promoClick, promoDismiss, sectionViews, sectionClicks, interviewPages] = await Promise.all([
  report({ metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "newUsers" }] }),
  report({ dimensions: [{ name: "newVsReturning" }], metrics: [{ name: "activeUsers" }] }),
  report({
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
    dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: ["assess_start", "assess_complete", "match_start", "match_complete", "external_click", "landing_cta_click", "search", "mode_select_clicked"] } } },
  }),
  report({
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
    dimensionFilter: { filter: { fieldName: "pagePath", inListFilter: { values: ["/", "/assess", "/match", "/regions/ranking", "/regions/compare", "/programs", "/search"] } } },
  }),
  report(searchDailyReq),
  report(landingReq),
  report(channelReq),
  report(byLabelReq("assess_entry_click")),
  report(byLabelReq("compare_view")),
  report(byLabelReq("promo_popup_view")),
  report(byLabelReq("promo_popup_click")),
  report(byLabelReq("promo_popup_dismiss")),
  report(byLabelReq("landing_section_view")),
  report(landingClickReq),
  report(interviewPagesReq),
]);

// 홍보 팝업 — id 별로 노출(명) → 원문 클릭(명) 전환율. 같은 사람이 여러 번 봐도 명 수로 센다.
const promoIds = [...new Set([...promoView, ...promoClick, ...promoDismiss].map((r) => String(r.d[0]).split(":")[0]))].filter((x) => x && x !== "(not set)");
const promoRows = promoIds.map((id) => {
  const users = (rows, suffix) => rows.filter((r) => r.d[0] === (suffix ? `${id}:${suffix}` : id)).reduce((a, r) => a + Number(r.m[1] ?? 0), 0);
  const seen = users(promoView, "");
  const detail = users(promoClick, "detail");
  return `${id}: 노출 ${seen}명 → 원문 ${detail}명(${seen ? ((detail / seen) * 100).toFixed(1) : "0.0"}%) · 전화 ${users(promoClick, "tel")} · 홍보요청 ${users(promoClick, "request")} · 오늘하루 ${users(promoDismiss, "today")} · 닫기 ${users(promoDismiss, "close")}`;
});

const active = totals[0]?.m[0] ?? 0;
const returning = nvr.find((r) => r.d[0] === "returning")?.m[0] ?? 0;
const ev = Object.fromEntries(events.map((r) => [r.d[0], { count: r.m[0], users: r.m[1] }]));
const pg = Object.fromEntries(pages.map((r) => [r.d[0], { views: r.m[0], users: r.m[1] }]));
const pct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");

// 랜딩 섹션 — 클릭 접두어가 섹션 trackId 와 다른 것만 맞춘다(start_card→start_cards, trend→trend_cost)
const CLICK_PREFIX_TO_SECTION = { start_card: "start_cards", trend: "trend_cost" };
const SECTION_ORDER = ["quick_link", "start_cards", "discover", "region_map", "trend_cost", "experience", "interviews", "news", "bottom_cta"];
const sectionView = Object.fromEntries(sectionViews.map((r) => [r.d[0], { events: Number(r.m[0]), users: Number(r.m[1]) }]));
const sectionClick = {};
for (const r of sectionClicks) {
  const prefix = String(r.d[0]).split(":")[0];
  const id = CLICK_PREFIX_TO_SECTION[prefix] ?? prefix;
  const c = (sectionClick[id] ??= { events: 0, users: 0 });
  c.events += Number(r.m[0]);
  c.users += Number(r.m[1]); // 대상별 명 수의 합 — 한 사람이 여러 대상을 누르면 중복
}
const sectionIds = [
  ...SECTION_ORDER.filter((id) => sectionView[id] || sectionClick[id]),
  ...[...new Set([...Object.keys(sectionView), ...Object.keys(sectionClick)])].filter((id) => !SECTION_ORDER.includes(id) && id !== "(not set)"),
];
const landingUsers = pg["/"]?.users ?? 0;
const sectionRows = sectionIds.map((id) => {
  const v = sectionView[id] ?? { events: 0, users: 0 };
  const c = sectionClick[id] ?? { events: 0, users: 0 };
  return `| ${id} | ${v.users}명 (${pct(v.users, landingUsers)}) | ${c.events}건 / ${c.users}명 | ${pct(c.users, v.users)} |`;
});
const interviewList = interviewPages.find((r) => r.d[0] === "/interviews");
const interviewDetail = interviewPages.filter((r) => r.d[0] !== "/interviews");
const interviewDetailViews = interviewDetail.reduce((a, r) => a + Number(r.m[0]), 0);
const interviewDetailUsers = interviewDetail.reduce((a, r) => a + Number(r.m[1]), 0);
// 진단 도달 분모 = `/match` (2026-09-16 교정).
// `/assess` 는 redirect("/match?mode=assess") 한 줄짜리 페이지라 아무도 머물지 않는다 →
// page_view 가 **구조적으로 항상 0**. 9/8 에 PageViewTracker 를 넣으며 "이제 도달을 잰다"고
// 했지만 잘못된 URL 을 보고 있었고, M7 퍼널의 분모가 통째로 비어 있었다.
// 실제 진단 UI 는 /match 의 ServiceGateway 가 ?mode=quick|assess|match 로 분기해 띄운다.
const assessReach = pg["/match"]?.users ?? 0;
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
| 진단 도달 (/match page_view 사용자) | ${assessReach} (${pct(assessReach, active)} of 활성) | 도달→시작 ${pct(assessStart, assessReach)} |
| 진단 시작 (assess_start) | ${assessStart} | 시작→완료 ${pct(assessDone, assessStart)} |
| 매칭 시작 → 완료 | ${ev.match_start?.users ?? 0} → ${ev.match_complete?.users ?? 0} | |
| external_click | ${ev.external_click?.count ?? 0}건 / ${ev.external_click?.users ?? 0}명 | 목적지는 event_label 측정기준 |
| 랜딩 CTA 클릭 | ${ev.landing_cta_click?.count ?? 0}건 | |
| 진단 모드 선택 (mode_select_clicked) | ${ev.mode_select_clicked?.count ?? 0}건 / ${ev.mode_select_clicked?.users ?? 0}명 | 어느 모드를 고르는지는 event_label |
| 검색 실행 (search) | ${ev.search?.count ?? 0}건 / ${ev.search?.users ?? 0}명 | DB search_logs 적재량과 대조 |
| 세션 / 신규 | ${totals[0]?.m[1] ?? 0} / ${totals[0]?.m[2] ?? 0} | |

주요 페이지 조회(사용자): ${["/", "/assess", "/match", "/regions/ranking", "/regions/compare", "/programs", "/search"].map((p) => `\`${p}\` ${pg[p]?.users ?? 0}`).join(" · ")}

검색 일별(최근 14일, 건·명): ${searchDaily.slice(-14).map((r) => `${r.d[0].slice(4, 6)}/${r.d[0].slice(6, 8)} ${r.m[0]}·${r.m[1]}`).join(" | ") || "없음"}

진단 진입 클릭 지면별 (assess_entry_click, 건·명 — 9/30 되돌림 판정 근거): ${entryByLabel.map((r) => `${r.d[0]} ${r.m[0]}·${r.m[1]}`).join(" | ") || "0건"}

지역 비교 탭별 (compare_view, 건·명): ${compareByLabel.map((r) => `${r.d[0]} ${r.m[0]}·${r.m[1]}`).join(" | ") || "0건"}

홍보 팝업 퍼널 (promo_popup_view → click, 명 — 원문 이동률): ${promoRows.join(" | ") || "노출 0"}

랜딩 섹션 도달 → 클릭 (landing_section_view → landing_cta_click, 랜딩 사용자 ${landingUsers}명 기준 · 클릭 명 수는 대상별 합이라 중복 가능):

| 섹션 | 도달 | 섹션 안 클릭 | 클릭/도달 |
|---|---|---|---|
${sectionRows.join("\n") || "| (계측 없음) | | | |"}

인터뷰 페이지 조회: 목록 \`/interviews\` ${interviewList?.m[0] ?? 0}회·${interviewList?.m[1] ?? 0}명 · 상세 ${interviewDetail.length}쪽 합계 ${interviewDetailViews}회·${interviewDetailUsers}명(쪽별 명 합)

유입 채널(세션): ${channels.map((r) => `${r.d[0]} ${r.m[0]}`).join(" · ") || "없음"}

유입 상위 페이지(세션·사용자):
${landings.slice(0, 15).map((r) => `- ${r.d[0]} — ${r.m[0]}세션 / ${r.m[1]}명`).join("\n") || "- 없음"}

유입 페이지 구성(세션): 랜딩 ${landings.find((r) => r.d[0] === "/")?.m[0] ?? 0} · 목록 ${landings.filter((r) => ["/crops", "/regions", "/programs", "/education", "/events", "/interviews", "/costs"].includes(r.d[0])).reduce((a, r) => a + r.m[0], 0)} · 상세 ${landings.filter((r) => /^\/(crops|regions|programs|education|events|interviews|guides)\/.+/.test(r.d[0])).reduce((a, r) => a + r.m[0], 0)} · 기타·미집계 ${landings.filter((r) => r.d[0] === "(not set)").reduce((a, r) => a + r.m[0], 0)} / 상위 30 합계 ${landings.reduce((a, r) => a + r.m[0], 0)} (전체 ${totals[0]?.m[1] ?? 0})

**판정(기계 계산, 참고용)**: ${verdict}

> 진단 도달 분모는 /match 예요 — /assess 는 /match?mode=assess 로 넘기는 리다이렉트 전용 페이지라 page_view 가 항상 0이에요(9/16 교정). SPA 경로 이동 page_view 는 9/8 배포부터 수집돼요.
`;
console.log(md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
