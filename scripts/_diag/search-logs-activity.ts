/**
 * search_logs / quick_feedback 7일치 INSERT 활성도 진단.
 *
 * Phase 6 B4 (피드백 학습 루프) 시동 전 선결 과제 점검:
 * - 데이터가 실제로 쌓이고 있는지 (case A: 호출은 되는데 INSERT 안 됨)
 * - 검색 사용 자체가 0건인지 (case B: 시기상조)
 * - 정상 적재 중인지 (case C: B4 즉시 진행 가능)
 *
 * read-only. INSERT/UPDATE/DELETE 없음.
 *
 * 실행: npx tsx scripts/_diag/search-logs-activity.ts
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

const now = new Date();
const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
const since30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

async function main() {
  console.log("=== search_logs / quick_feedback 활성도 진단 ===");
  console.log(`기준 시각: ${now.toISOString()}\n`);

  // ── search_logs ──
  console.log("--- search_logs ---");

  const { count: total7d } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since7d);
  console.log(`최근 7일 INSERT: ${total7d ?? "조회 실패"}건`);

  const { count: total30d } = await sb
    .from("search_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since30d);
  console.log(`최근 30일 INSERT: ${total30d ?? "조회 실패"}건`);

  const { data: latest, error: latestErr } = await sb
    .from("search_logs")
    .select("query, result_count, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  if (latestErr) {
    console.log(`최근 5건 조회 실패: ${latestErr.message}`);
  } else {
    console.log("최근 5건:");
    (latest ?? []).forEach((r) => {
      console.log(`  ${r.created_at} | "${r.query}" (${r.result_count}건)`);
    });
  }

  // 일자별 분포 (최근 7일)
  const { data: daily } = await sb
    .from("search_logs")
    .select("created_at")
    .gte("created_at", since7d)
    .order("created_at", { ascending: false });
  if (daily) {
    const buckets: Record<string, number> = {};
    daily.forEach((r) => {
      const day = (r.created_at as string).slice(0, 10);
      buckets[day] = (buckets[day] ?? 0) + 1;
    });
    console.log("일자별 분포 (최근 7일):");
    Object.entries(buckets)
      .sort()
      .forEach(([day, count]) => {
        console.log(`  ${day}: ${count}건`);
      });
  }

  // ── quick_feedback ──
  console.log("\n--- quick_feedback ---");

  const { count: qf7d } = await sb
    .from("quick_feedback")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since7d);
  console.log(`최근 7일 INSERT: ${qf7d ?? "조회 실패"}건`);

  const { count: qf30d } = await sb
    .from("quick_feedback")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since30d);
  console.log(`최근 30일 INSERT: ${qf30d ?? "조회 실패"}건`);

  const { data: qfLatest, error: qfErr } = await sb
    .from("quick_feedback")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  if (qfErr) {
    console.log(`최근 5건 조회 실패: ${qfErr.message}`);
  } else {
    console.log("최근 5건:");
    (qfLatest ?? []).forEach((r) => {
      console.log(`  ${(r as any).created_at} | ${JSON.stringify(r)}`);
    });
  }

  // ── 케이스 판정 ──
  console.log("\n=== 케이스 판정 ===");
  const sl7 = total7d ?? 0;
  const qf7 = qf7d ?? 0;

  if (sl7 === 0 && qf7 === 0) {
    console.log("⚪ 케이스 B 또는 A 후보:");
    console.log("  - 7일간 search_logs / quick_feedback 둘 다 0건");
    console.log("  - 추가 확인 필요: 라이브에서 실제 검색 사용 시 search_logs 적재 되는지");
    console.log("  - 권고: 라이브 검색 1회 직접 시도 → 본 스크립트 재실행하여 1건 증가 확인");
  } else if (sl7 > 0 && sl7 < 10) {
    console.log("🟡 케이스 C (low traffic):");
    console.log(`  - 7일간 ${sl7}건 — 학습용으로 부족`);
    console.log("  - B4 진행 가능하지만 효과 측정에 4~6주 필요");
  } else if (sl7 >= 10) {
    console.log("✅ 케이스 C:");
    console.log(`  - 7일간 ${sl7}건 — B4 plan 즉시 진행 가능`);
  }
}

main().catch((err) => {
  console.error("[fail]", err);
  process.exit(1);
});
