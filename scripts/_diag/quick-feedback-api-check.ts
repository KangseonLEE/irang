/**
 * /api/quick-feedback POST endpoint 동작 검증.
 *
 * 5/4 hardening 누락 fix 후 검증용. localhost 또는 prod 양쪽에서 사용 가능.
 *
 * 실행:
 *   npx tsx scripts/_diag/quick-feedback-api-check.ts                  # localhost:3000
 *   BASE_URL=https://irangfarm.com npx tsx scripts/_diag/quick-feedback-api-check.ts
 *
 * 5/11 가드 #2 (prefix+try/finally cleanup) + #5 (CoS 보고 라인 강제) 적용.
 */

import { config } from "dotenv";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: path.resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";

if (!url || !serviceKey) {
  console.error("[fail] env 미설정 (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  process.exit(1);
}

const PREFIX = "__diag_b4_post_fix__";
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  console.log(`=== /api/quick-feedback POST 검증 ===`);
  console.log(`Target: ${baseUrl}\n`);

  let insertedRow: Record<string, unknown> | null = null;

  try {
    // 1. POST 요청
    const res = await fetch(`${baseUrl}/api/quick-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: "neutral",
        message: PREFIX,
        page: "_diag",
      }),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.log(`❌ POST 실패: HTTP ${res.status}`);
      console.log(`   응답: ${JSON.stringify(json)}`);
      process.exit(1);
    }

    console.log(`✅ POST 성공: HTTP ${res.status}`);
    console.log(`   응답: ${JSON.stringify(json)}`);

    // 2. DB row 존재 확인
    const { data: rows, error } = await admin
      .from("quick_feedback")
      .select("*")
      .eq("message", PREFIX)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.log(`\n❌ DB SELECT 에러: ${error.message}`);
      process.exit(1);
    }

    if (!rows || rows.length === 0) {
      console.log(`\n❌ DB row 미생성 — INSERT 실패 (silent fail 재발 가능성)`);
      process.exit(1);
    }

    insertedRow = rows[0];
    console.log(`\n✅ DB row 1건 정상 적재 확인`);
    console.log(`   row: ${JSON.stringify(insertedRow)}`);
  } finally {
    // 3. cleanup (5/11 가드 #2)
    const { error: delErr, count } = await admin
      .from("quick_feedback")
      .delete({ count: "exact" })
      .eq("message", PREFIX);

    if (delErr) {
      console.log(`\n[cleanup] DELETE 실패: ${delErr.message}`);
    } else {
      console.log(`\n[cleanup] PREFIX="${PREFIX}" row ${count ?? 0}건 삭제`);
    }

    // 4. 잔존 0건 확인 (5/11 가드 #5 — CoS 인수 게이트 라인)
    const { count: remain } = await admin
      .from("quick_feedback")
      .select("*", { count: "exact", head: true })
      .eq("message", PREFIX);
    console.log(
      `[cleanup] 잔존 row 0건 SELECT 결과: ${remain ?? 0}건 ${remain === 0 ? "✅" : "❌"}`,
    );

    if (remain !== 0) {
      console.error("\n[fail] cleanup 실패 — admin 화면에 noise 잔존");
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("[fail]", err);
  process.exit(1);
});
