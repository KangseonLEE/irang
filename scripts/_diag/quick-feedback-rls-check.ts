/**
 * quick_feedback anon INSERT 가능 여부 점검 (read-only + 1건 INSERT/DELETE 테스트).
 *
 * 30일 0건 원인이 RLS 차단인지, 위젯 노출이 안 된 건지 분기.
 *
 * 실행: npx tsx scripts/_diag/quick-feedback-rls-check.ts
 *
 * 5/11 가드 #1 (read-only 우선) + #2 (prefix+try/finally cleanup) 적용.
 */

import { config } from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !anonKey || !serviceKey) {
  console.error("[fail] env 미설정");
  process.exit(1);
}

const PREFIX = "__diag_b4_rls_check__";
const testRow = {
  rating: "neutral",
  message: PREFIX,
  page: "_diag",
  created_at: new Date().toISOString(),
};

async function main() {
  const anon = createClient(url, anonKey);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  console.log("=== quick_feedback anon INSERT 권한 점검 ===\n");

  // anon INSERT 시도
  const { data: anonData, error: anonErr } = await anon
    .from("quick_feedback")
    .insert(testRow)
    .select();

  if (anonErr) {
    console.log("❌ anon INSERT 차단됨");
    console.log(`   에러: ${anonErr.message} (code=${anonErr.code})`);
    console.log("   → 원인: RLS policy가 anon INSERT 차단");
    console.log("   → 해결: search_logs와 동일하게 service_role 경유 API Route 도입 필요");
  } else {
    console.log("✅ anon INSERT 성공");
    console.log(`   삽입 row: ${JSON.stringify(anonData)}`);
    console.log("   → 30일 0건은 RLS 문제가 아니라 위젯 노출/사용 0건");
  }

  // cleanup (service_role)
  try {
    const { error: delErr, count } = await admin
      .from("quick_feedback")
      .delete({ count: "exact" })
      .eq("message", PREFIX);
    if (delErr) {
      console.log(`\n[cleanup] DELETE 실패: ${delErr.message}`);
    } else {
      console.log(`\n[cleanup] PREFIX="${PREFIX}" row ${count ?? 0}건 삭제`);
    }

    // 잔존 0건 확인
    const { count: remain } = await admin
      .from("quick_feedback")
      .select("*", { count: "exact", head: true })
      .eq("message", PREFIX);
    console.log(`[cleanup] 잔존 row 0건 SELECT 결과: ${remain ?? 0}건 ${remain === 0 ? "✅" : "❌"}`);
  } catch (err) {
    console.error("[cleanup] 예외:", err);
  }
}

main().catch((err) => {
  console.error("[fail]", err);
  process.exit(1);
});
