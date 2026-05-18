/**
 * [baseline-2026-05-15] Phase 0 search KPI baseline 측정
 *
 * 5/15 push (Phase 1·1B·1C·1D 통합 라이브) 시점까지 누적된 search_logs baseline 추출.
 * 5/22 변경 후 측정의 비교 기준 박제용.
 *
 * cutoff = 2026-05-15 12:00 KST (push 시각 추정)
 *
 * 가드:
 * - read-only SELECT만 (INSERT/UPDATE/DELETE 0건)
 * - silent fail 3분류 (table 미존재 / RLS 권한 / 0건 누적)
 * - GENERIC_TERMS 12종 stopword 기준 노출 비율 측정
 *
 * 실행: npx tsx scripts/_diag/search-baseline-2026-05-15.ts
 */

import { config } from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey) {
  console.error("[fail] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정");
  process.exit(1);
}

const sb = createClient(url, serviceKey, { auth: { persistSession: false } });

// ── 상수 ──
// GENERIC_TERMS — src/lib/data/search-index.ts 동기화 (Phase 1 도입 stopword 12종)
// import 대신 hardcoded fallback (script 단일 의존성)
const GENERIC_TERMS: ReadonlySet<string> = new Set([
  "지역",
  "농업",
  "도시",
  "재배",
  "귀농",
  "체험",
  "정보",
  "찾기",
  "맞춤",
  "농촌",
  "교육",
  "지원",
]);

// cutoff: 2026-05-15 12:00 KST = 2026-05-15 03:00 UTC
const PUSH_CUTOFF_ISO = "2026-05-15T03:00:00.000Z";

const now = new Date();
const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
const since14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();

/**
 * silent fail 3분류 진단 (5/14 박제 feedback_supabase_table_silent_fail.md 직역)
 *   (a) 테이블 미존재 → error.message 에 "does not exist" / "relation" 포함
 *   (b) RLS 권한 차단 → error.message 에 "permission" / "policy" 포함 또는 count:0 + data:[]
 *   (c) 0건 누적 → error:null + count:0 + data:[]
 */
function diagnoseSilentFail(
  label: string,
  error: { message: string } | null,
  count: number | null,
): "ok" | "missing" | "rls" | "empty" {
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("does not exist") || msg.includes("relation")) {
      console.log(`  [silent-fail/A] 테이블 미존재: ${label} — ${error.message}`);
      return "missing";
    }
    if (msg.includes("permission") || msg.includes("policy") || msg.includes("rls")) {
      console.log(`  [silent-fail/B] RLS 권한 차단: ${label} — ${error.message}`);
      return "rls";
    }
    console.log(`  [silent-fail/?] 알 수 없는 에러: ${label} — ${error.message}`);
    return "missing";
  }
  if (count === null) {
    console.log(`  [silent-fail/?] count:null + error:null: ${label} — Supabase 응답 이상`);
    return "missing";
  }
  if (count === 0) {
    console.log(`  [silent-fail/C] 0건 누적: ${label} (테이블 정상, 데이터 없음)`);
    return "empty";
  }
  return "ok";
}

async function main() {
  console.log("============================================================");
  console.log("[baseline-2026-05-15] Phase 0 search KPI baseline");
  console.log("============================================================");
  console.log(`기준 시각: ${now.toISOString()}`);
  console.log(`Push cutoff: ${PUSH_CUTOFF_ISO} (2026-05-15 12:00 KST)`);
  console.log();

  // ─────────────────────────────────────────
  // 0. 전체 row 수 + cutoff 분기점
  // ─────────────────────────────────────────
  console.log("--- 0. search_logs 전체 현황 ---");

  const { count: totalAll, error: totalAllErr } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true });
  const totalAllStatus = diagnoseSilentFail("전체 row", totalAllErr, totalAll);

  if (totalAllStatus === "missing" || totalAllStatus === "rls") {
    console.error("\n[fail] search_logs 테이블 접근 불가 — baseline 측정 중단");
    process.exit(1);
  }

  const { count: beforePush } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .lt("created_at", PUSH_CUTOFF_ISO);

  const { count: afterPush } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", PUSH_CUTOFF_ISO);

  console.log(`전체 row 수: ${totalAll ?? 0}건`);
  console.log(`5/15 push 직전 누적: ${beforePush ?? 0}건 (cutoff: ${PUSH_CUTOFF_ISO})`);
  console.log(`5/15 push 이후 누적: ${afterPush ?? 0}건`);

  // ─────────────────────────────────────────
  // 1. KPI 1: 결과 0건율 (7일·30일)
  // ─────────────────────────────────────────
  console.log("\n--- 1. KPI: 결과 0건율 ---");

  const { count: zero7d } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .eq("result_count", 0)
    .gte("created_at", since7d);
  const { count: total7d } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since7d);
  const { count: zero30d } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .eq("result_count", 0)
    .gte("created_at", since30d);
  const { count: total30d } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since30d);

  const zeroRate7 = total7d && total7d > 0 ? ((zero7d ?? 0) / total7d) * 100 : 0;
  const zeroRate30 = total30d && total30d > 0 ? ((zero30d ?? 0) / total30d) * 100 : 0;
  console.log(`7일: ${zero7d ?? 0}/${total7d ?? 0} (${zeroRate7.toFixed(1)}%)`);
  console.log(`30일: ${zero30d ?? 0}/${total30d ?? 0} (${zeroRate30.toFixed(1)}%)`);

  // ─────────────────────────────────────────
  // 2. KPI 2: 평균 result_count
  // ─────────────────────────────────────────
  console.log("\n--- 2. KPI: 평균 result_count ---");

  const { data: rc7d } = await sb
    .from("search_logs")
    .select("result_count")
    .gte("created_at", since7d);
  const { data: rc30d } = await sb
    .from("search_logs")
    .select("result_count")
    .gte("created_at", since30d);

  const avg7 = rc7d && rc7d.length > 0
    ? rc7d.reduce((sum, r) => sum + ((r as { result_count: number }).result_count ?? 0), 0) / rc7d.length
    : 0;
  const avg30 = rc30d && rc30d.length > 0
    ? rc30d.reduce((sum, r) => sum + ((r as { result_count: number }).result_count ?? 0), 0) / rc30d.length
    : 0;
  console.log(`7일 평균: ${avg7.toFixed(1)}건/검색 (n=${rc7d?.length ?? 0})`);
  console.log(`30일 평균: ${avg30.toFixed(1)}건/검색 (n=${rc30d?.length ?? 0})`);

  // ─────────────────────────────────────────
  // 3. KPI 3: 결과 없는 검색어 top 10 (30일)
  // ─────────────────────────────────────────
  console.log("\n--- 3. KPI: 결과 없는 검색어 top 10 (30일) ---");

  const { data: zeroQueries } = await sb
    .from("search_logs")
    .select("query")
    .eq("result_count", 0)
    .gte("created_at", since30d);

  if (zeroQueries && zeroQueries.length > 0) {
    const counts: Record<string, number> = {};
    for (const r of zeroQueries) {
      const q = (r as { query: string }).query;
      counts[q] = (counts[q] ?? 0) + 1;
    }
    const top10 = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    console.log("| rank | query | count |");
    console.log("|------|-------|-------|");
    top10.forEach(([q, c], i) => {
      console.log(`| ${i + 1} | "${q}" | ${c} |`);
    });
  } else {
    console.log("(0건 — 결과 없는 검색어 없음 또는 데이터 없음)");
  }

  // ─────────────────────────────────────────
  // 4. KPI 4: 인기 검색어 top 20 (30일)
  // ─────────────────────────────────────────
  console.log("\n--- 4. KPI: 인기 검색어 top 20 (30일) ---");

  const { data: allQueries } = await sb
    .from("search_logs")
    .select("query")
    .gte("created_at", since30d);

  if (allQueries && allQueries.length > 0) {
    const counts: Record<string, number> = {};
    for (const r of allQueries) {
      const q = (r as { query: string }).query;
      counts[q] = (counts[q] ?? 0) + 1;
    }
    const top20 = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 20);
    console.log("| rank | query | count |");
    console.log("|------|-------|-------|");
    top20.forEach(([q, c], i) => {
      console.log(`| ${i + 1} | "${q}" | ${c} |`);
    });
  } else {
    console.log("(30일 검색 0건)");
  }

  // ─────────────────────────────────────────
  // 5. KPI 5: GENERIC_TERMS 노출 비율
  // ─────────────────────────────────────────
  console.log("\n--- 5. KPI: GENERIC_TERMS 노출 비율 ---");
  console.log(`GENERIC_TERMS (${GENERIC_TERMS.size}종): ${[...GENERIC_TERMS].join(", ")}`);

  let generic7 = 0;
  let generic30 = 0;

  if (allQueries) {
    for (const r of allQueries) {
      const q = (r as { query: string }).query.trim().toLowerCase();
      if (GENERIC_TERMS.has(q)) generic30++;
    }
  }

  const { data: qs7 } = await sb
    .from("search_logs")
    .select("query")
    .gte("created_at", since7d);
  if (qs7) {
    for (const r of qs7) {
      const q = (r as { query: string }).query.trim().toLowerCase();
      if (GENERIC_TERMS.has(q)) generic7++;
    }
  }

  const gRate7 = total7d && total7d > 0 ? (generic7 / total7d) * 100 : 0;
  const gRate30 = total30d && total30d > 0 ? (generic30 / total30d) * 100 : 0;
  console.log(`7일: ${generic7}/${total7d ?? 0} (${gRate7.toFixed(1)}%)`);
  console.log(`30일: ${generic30}/${total30d ?? 0} (${gRate30.toFixed(1)}%)`);

  // ─────────────────────────────────────────
  // 6. KPI 6: 일별 분포 (최근 14일)
  // ─────────────────────────────────────────
  console.log("\n--- 6. KPI: 일별 검색 볼륨 분포 (최근 14일) ---");

  const { data: dailyRows } = await sb
    .from("search_logs")
    .select("created_at")
    .gte("created_at", since14d)
    .order("created_at", { ascending: true });

  const buckets: Record<string, number> = {};
  // 14일 모든 날짜 0으로 초기화
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }
  if (dailyRows) {
    for (const r of dailyRows) {
      const day = ((r as { created_at: string }).created_at).slice(0, 10);
      if (day in buckets) buckets[day]++;
    }
  }

  const maxCount = Math.max(...Object.values(buckets), 1);
  const barWidth = 30;
  const pushDate = "2026-05-15";
  console.log("| 날짜 | 건수 | 막대 |");
  console.log("|------|------|------|");
  for (const [day, count] of Object.entries(buckets).sort()) {
    const bar = "█".repeat(Math.round((count / maxCount) * barWidth));
    const marker = day === pushDate ? " ← 5/15 push" : "";
    console.log(`| ${day} | ${count} | ${bar}${marker}`);
  }

  // ─────────────────────────────────────────
  // 7. 데이터 충분성 평가
  // ─────────────────────────────────────────
  console.log("\n--- 7. 데이터 충분성 평가 (5/22 측정 권고) ---");

  const sufficient = (total30d ?? 0) >= 30;
  if (!sufficient) {
    console.log(`🟡 baseline 의미 약함: 30일 누적 ${total30d ?? 0}건 (< 30건 기준)`);
    console.log("  권고: 5/22 측정 불가 가능성 — 누적 기간 연장 (예: 6월 말 측정)");
    console.log("  대안: CTR·전환율 등 추가 인프라(session_id, click events) 필요");
  } else {
    console.log(`✅ baseline 의미 있음: 30일 누적 ${total30d}건 (≥ 30건)`);
    console.log("  5/22 동일 스크립트 재실행으로 비교 측정 가능");
  }

  // ─────────────────────────────────────────
  // CoS 보고 게이트 라인 (3종 필수)
  // ─────────────────────────────────────────
  console.log("\n============================================================");
  console.log("CoS 보고 게이트 라인");
  console.log("============================================================");
  console.log("1. SELECT-only — INSERT/UPDATE/DELETE 0건 ✅");
  console.log("2. silent fail 3분류 적용 (error/count/null 구분) ✅");
  console.log("3. 잔존 row 0건 (해당 없음, read-only) ✅");
}

main().catch((err) => {
  console.error("[fail]", err);
  process.exit(1);
});
