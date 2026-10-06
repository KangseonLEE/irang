/**
 * 서치 콘솔 월간 보고서 — 계산·렌더링 (순수 함수, 2026-10-06).
 * 입력은 searchAnalytics.query 응답 행({ keys, clicks, impressions, ctr, position })과 URL 검사 결과.
 * 9월 수동 분석(회장 다운로드 CSV)과 같은 잣대로 매달 자동으로 뽑는다 — gsc-snapshot.mjs 가 호출한다.
 */

export const SITE_ORIGIN = "https://irangfarm.com";

/** 10/6 검색 결과 제목·설명을 정비한 페이지 — 다음 달부터 전월 대비 클릭률을 본다 */
const WATCH_PAGES = [
  { path: "/costs", note: "귀농 비용 가이드" },
  { path: "/programs/SP-018", note: "농지은행 임대·위탁 조건" },
  { path: "/programs", note: "귀농·귀촌 지원사업" },
  { path: "/crops", note: "귀농 작물 목록" },
  { path: "/guide", note: "귀농 절차 5단계" },
  { path: "/glossary", note: "귀농 농업 용어집" },
];

const pathOf = (url) => url.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";

/** 9월 분석과 같은 페이지 유형 */
export function pageType(url) {
  const p = pathOf(url);
  if (p === "/") return "랜딩";
  const seg = p.split("/").filter(Boolean);
  if (seg[0] === "regions") {
    if (seg.length === 4) return "지역-구";
    if (seg.length === 3) return seg[2] === "stories" ? "지역-현장 이야기" : "지역-시군구";
    if (seg.length === 2 && !["compare", "ranking", "centers"].includes(seg[1])) return "지역-시도";
    return "지역-목록·비교·순위";
  }
  if (seg[0] === "crops") return seg.length > 1 && seg[1] !== "compare" ? "작물-상세" : "작물-목록·비교";
  if (seg[0] === "programs") return seg.length > 1 && seg[1] !== "roadmap" ? "지원사업-상세" : "지원사업-목록";
  if (seg[0] === "education") return seg.length > 1 ? "교육-상세" : "교육-목록";
  if (seg[0] === "events") return seg.length > 1 ? "체험-상세" : "체험-목록";
  return seg[0];
}

/** 행 묶음 합계 — 순위는 노출 가중 평균 */
export function summarize(rows) {
  let clicks = 0;
  let impressions = 0;
  let posWeighted = 0;
  for (const r of rows) {
    clicks += r.clicks;
    impressions += r.impressions;
    posWeighted += r.position * r.impressions;
  }
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? posWeighted / impressions : 0,
  };
}

/** "2026-10" → { start, end, days } */
export function monthRange(ym) {
  const [y, m] = ym.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return { start: `${y}-${mm}-01`, end: `${y}-${mm}-${String(days).padStart(2, "0")}`, days };
}

export function prevMonth(ym) {
  const [y, m] = ym.split("-").map(Number);
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
}

/** 일별 행 → 전반(1~15일)·후반(16일~) 일평균 */
export function halves(dateRows) {
  const first = dateRows.filter((r) => Number(r.keys[0].slice(8, 10)) <= 15);
  const second = dateRows.filter((r) => Number(r.keys[0].slice(8, 10)) > 15);
  const avg = (rows) => {
    const s = summarize(rows);
    return { ...s, perDay: rows.length ? s.impressions / rows.length : 0, days: rows.length };
  };
  return { first: avg(first), second: avg(second) };
}

export function byType(pageRows) {
  const groups = new Map();
  for (const r of pageRows) {
    const t = pageType(r.keys[0]);
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t).push(r);
  }
  return [...groups.entries()]
    .map(([type, rows]) => ({ type, pages: rows.length, ...summarize(rows) }))
    .sort((a, b) => b.impressions - a.impressions);
}

const n = (x) => Math.round(x).toLocaleString("ko-KR");
const pct = (x) => `${(x * 100).toFixed(2)}%`;
const pos = (x) => (x ? x.toFixed(1) : "-");
const delta = (now, before) => {
  if (!before) return now ? "새로 생김" : "-";
  const d = (now - before) / before;
  return `${d >= 0 ? "+" : ""}${Math.round(d * 100)}%`;
};

/** URL 검사 결과 → 상태별 묶음 */
export function summarizeInspection(results) {
  const groups = new Map();
  for (const r of results) {
    const key = r.coverageState || r.error || "알 수 없음";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r.url);
  }
  return [...groups.entries()].map(([state, urls]) => ({ state, count: urls.length, urls })).sort((a, b) => b.count - a.count);
}

export function renderReport(d) {
  const t = summarize(d.totalRows);
  const pt = summarize(d.prevTotalRows);
  const h = halves(d.dateRows);
  const pageRowsByPath = new Map(d.pageRows.map((r) => [pathOf(r.keys[0]), r]));
  const prevByPath = new Map(d.prevPageRows.map((r) => [pathOf(r.keys[0]), r]));
  const queryShare = summarize(d.queryRows);
  const kr = d.countryRows.find((r) => r.keys[0] === "kor");
  const lines = [];

  lines.push(`## 구글 검색 성과 — ${d.ym} (웹, 확정 데이터)`, "");
  lines.push("| 지표 | 이번 달 | 지난달 | 변화 |", "|---|---|---|---|");
  lines.push(`| 클릭 | ${n(t.clicks)} | ${n(pt.clicks)} | ${delta(t.clicks, pt.clicks)} |`);
  lines.push(`| 노출 | ${n(t.impressions)} | ${n(pt.impressions)} | ${delta(t.impressions, pt.impressions)} |`);
  lines.push(`| 클릭률 | ${pct(t.ctr)} | ${pct(pt.ctr)} | |`);
  lines.push(`| 평균 순위 | ${pos(t.position)} | ${pos(pt.position)} | |`, "");
  lines.push(
    `전반(1~15일) 일평균 노출 ${n(h.first.perDay)}회 → 후반 ${n(h.second.perDay)}회 (${delta(h.second.perDay, h.first.perDay)}), ` +
      `평균 순위 ${pos(h.first.position)} → ${pos(h.second.position)}`,
    "",
  );

  lines.push("### 지켜보는 페이지 — 10/6 검색 결과 제목·설명 정비", "");
  lines.push("| 페이지 | 노출 | 클릭 | 클릭률 | 순위 | 지난달 클릭률 | 지난달 노출 |", "|---|---|---|---|---|---|---|");
  for (const w of d.watchPages ?? WATCH_PAGES) {
    const r = pageRowsByPath.get(w.path);
    const pr = prevByPath.get(w.path);
    lines.push(
      `| ${w.path} (${w.note}) | ${r ? n(r.impressions) : 0} | ${r ? n(r.clicks) : 0} | ${r ? pct(r.ctr) : "-"} | ${r ? pos(r.position) : "-"} | ${pr ? pct(pr.ctr) : "-"} | ${pr ? n(pr.impressions) : 0} |`,
    );
  }
  const crops = byType(d.pageRows).find((x) => x.type === "작물-상세");
  const prevCrops = byType(d.prevPageRows).find((x) => x.type === "작물-상세");
  if (crops) {
    lines.push(
      `| 작물 상세 전체 (${crops.pages}쪽) | ${n(crops.impressions)} | ${n(crops.clicks)} | ${pct(crops.ctr)} | ${pos(crops.position)} | ${prevCrops ? pct(prevCrops.ctr) : "-"} | ${prevCrops ? n(prevCrops.impressions) : 0} |`,
    );
  }
  lines.push("");

  lines.push("### 페이지 유형별", "", "| 유형 | 페이지 | 노출 | 클릭 | 클릭률 | 순위 |", "|---|---|---|---|---|---|");
  for (const g of byType(d.pageRows)) {
    lines.push(`| ${g.type} | ${g.pages} | ${n(g.impressions)} | ${n(g.clicks)} | ${pct(g.ctr)} | ${pos(g.position)} |`);
  }
  lines.push("");

  lines.push("### 노출 상위 페이지 15", "", "| 페이지 | 노출 | 클릭 | 클릭률 | 순위 |", "|---|---|---|---|---|");
  for (const r of [...d.pageRows].sort((a, b) => b.impressions - a.impressions).slice(0, 15)) {
    lines.push(`| ${pathOf(r.keys[0])} | ${n(r.impressions)} | ${n(r.clicks)} | ${pct(r.ctr)} | ${pos(r.position)} |`);
  }
  lines.push("");

  lines.push(
    `### 검색어 상위 15 — 공개된 검색어는 노출의 ${t.impressions ? Math.round((queryShare.impressions / t.impressions) * 100) : 0}%(구글이 적은 검색어를 가린다)`,
    "",
    "| 검색어 | 노출 | 클릭 | 순위 |",
    "|---|---|---|---|",
  );
  for (const r of [...d.queryRows].sort((a, b) => b.impressions - a.impressions).slice(0, 15)) {
    lines.push(`| ${r.keys[0]} | ${n(r.impressions)} | ${n(r.clicks)} | ${pos(r.position)} |`);
  }
  lines.push("");

  const devices = d.deviceRows.map((r) => `${r.keys[0]} ${n(r.impressions)}회·클릭 ${n(r.clicks)}`).join(" · ");
  lines.push(
    `국가: 한국 노출 ${kr ? n(kr.impressions) : 0}회(${t.impressions && kr ? Math.round((kr.impressions / t.impressions) * 100) : 0}%) — 해외는 KR 외 차단이라 클릭으로 이어지지 않는다 · 기기: ${devices}`,
    "",
  );

  if (d.inspection) {
    const s = summarizeInspection(d.inspection.results);
    lines.push(
      `### 색인 상태 — 사이트맵 ${n(d.inspection.sitemapCount)}개 중 이번 달 노출 0인 ${n(d.inspection.zeroCount)}개 가운데 ${n(d.inspection.results.length)}개 검사`,
      "",
      "| 상태 | 수 | 유형 | 예 |",
      "|---|---|---|---|",
    );
    for (const g of s) {
      const types = [...new Set(g.urls.map(pageType))].slice(0, 4).join("·");
      lines.push(`| ${g.state} | ${g.count} | ${types} | ${g.urls.slice(0, 3).map(pathOf).join(", ")} |`);
    }
    lines.push("");
  }

  lines.push("> 🤖 GitHub Actions(gsc-snapshot)가 서치 콘솔 API 로 매월 뽑아요. 9월 기준선: 클릭 101·노출 5,922·평균 7.0위.");
  return lines.join("\n") + "\n";
}
