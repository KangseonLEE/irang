/**
 * Sprint 0 (B4) 점검: quick_feedback 5/14 RLS fix 효과 read-only 검증.
 *
 * 배경:
 *   - 5/14 Phase 3 commit 252381d에서 3개 위젯(feedback-widget / request-modal / crop-request-button)
 *     모두 anon Supabase INSERT → /api/quick-feedback service_role 경유로 교체 완료
 *   - 본 진단은 fix 적용 후 실제 DB row 누적 여부만 read-only로 확인
 *
 * 실행: npx tsx scripts/_diag/quick-feedback-status-2026-05-16.ts
 *
 * 5/11 가드: #1 (read-only 우선) — INSERT/DELETE 없음.
 */

import { config } from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!url || !serviceKey) {
  console.error("[fail] env 미설정 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  console.log("=== quick_feedback 현황 진단 (read-only) ===");
  console.log(`기준 시각: ${new Date().toISOString()}\n`);

  // 1. 전체 row 수
  const { count: totalCount, error: totalErr } = await admin
    .from("quick_feedback")
    .select("*", { count: "exact", head: true });

  if (totalErr) {
    console.log(`❌ 전체 count SELECT 실패: ${totalErr.message}`);
    console.log(`   code=${totalErr.code} hint=${totalErr.hint ?? "-"}`);
    process.exit(1);
  }

  console.log(`[전체] quick_feedback 누적: ${totalCount ?? 0}건`);

  // 2. 최근 7일 row 수
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: weekCount, error: weekErr } = await admin
    .from("quick_feedback")
    .select("*", { count: "exact", head: true })
    .gte("created_at", sevenDaysAgo);

  if (weekErr) {
    console.log(`❌ 최근 7일 count SELECT 실패: ${weekErr.message}`);
    process.exit(1);
  }

  console.log(`[최근 7일] quick_feedback INSERT: ${weekCount ?? 0}건`);

  // 3. 최근 30일 row 수
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: monthCount, error: monthErr } = await admin
    .from("quick_feedback")
    .select("*", { count: "exact", head: true })
    .gte("created_at", thirtyDaysAgo);

  if (monthErr) {
    console.log(`❌ 최근 30일 count SELECT 실패: ${monthErr.message}`);
    process.exit(1);
  }

  console.log(`[최근 30일] quick_feedback INSERT: ${monthCount ?? 0}건`);

  // 4. 5/14 Sprint 0 fix 이후 (5/14 09:00 KST = 5/14 00:00 UTC)
  const since514Fix = "2026-05-14T00:00:00.000Z";
  const { count: postFixCount, error: postFixErr } = await admin
    .from("quick_feedback")
    .select("*", { count: "exact", head: true })
    .gte("created_at", since514Fix);

  if (postFixErr) {
    console.log(`❌ Sprint 0 fix 후 count SELECT 실패: ${postFixErr.message}`);
    process.exit(1);
  }

  console.log(`[5/14 Sprint 0 fix 이후] INSERT: ${postFixCount ?? 0}건`);

  // 5. request_kind 컬럼 적재 현황 (5/15 마이그레이션 후)
  const { data: kindBreak, error: kindErr } = await admin
    .from("quick_feedback")
    .select("request_kind")
    .gte("created_at", since514Fix);

  if (kindErr) {
    console.log(`\n[request_kind 분포] SELECT 실패: ${kindErr.message}`);
  } else {
    const counts = new Map<string, number>();
    (kindBreak ?? []).forEach((row: { request_kind: string | null }) => {
      const key = row.request_kind ?? "(null)";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    console.log(`\n[request_kind 분포 (5/14 이후)]`);
    if (counts.size === 0) {
      console.log(`   (데이터 없음)`);
    } else {
      Array.from(counts.entries()).forEach(([k, v]) => {
        console.log(`   ${k}: ${v}건`);
      });
    }
  }

  // 6. 케이스 판정
  console.log(`\n=== 케이스 판정 ===`);

  if ((postFixCount ?? 0) === 0) {
    console.log(`A. ⚠️ 5/14 fix 이후에도 0건 — silent fail 잔존 가능성`);
    console.log(`   - 가능 원인 1: 사용자가 위젯을 실제로 안 누름 (low traffic)`);
    console.log(`   - 가능 원인 2: /api/quick-feedback route 다른 에러`);
    console.log(`   → 다음 단계: 위젯 UI 노출 확인 + route log 확인 + 1회 수동 POST 검증`);
  } else if ((postFixCount ?? 0) < 5) {
    console.log(`B. ✅ 5/14 fix 이후 ${postFixCount}건 적재 — silent fail 해소 확인`);
    console.log(`   - 단, low traffic 영향으로 적재량 적음. B4 thumbs UI 도입 시 increment 기대`);
  } else {
    console.log(`C. ✅ 5/14 fix 이후 ${postFixCount}건 — Sprint 0 정상`);
  }
}

main().catch((err) => {
  console.error("[fail]", err);
  process.exit(1);
});
