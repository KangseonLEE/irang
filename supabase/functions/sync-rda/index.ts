/**
 * sync-rda Edge Function
 * - RDA 똑똑!청년농부 API에서 지원사업/교육 데이터를 가져와 DB에 upsert
 * - 마감 상태 자동 전환 (auto_update_program_status)
 * - GitHub Actions cron으로 매일 06:00 KST 실행
 *
 * 트리거: POST /functions/v1/sync-rda
 */

import { getServiceClient } from "../_shared/supabase-client.ts";
import { fetchAllPolicies, fetchAllEducation } from "../_shared/rda-api.ts";
import { mapPolicyToRow, mapEduToRow } from "../_shared/mapping.ts";
import type { SyncResult } from "../_shared/types.ts";

Deno.serve(async (req: Request) => {
  // POST만 허용
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 인증: CRON_SECRET 검증 (필수 — 미설정 시 요청 거부)
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret) {
    return new Response(JSON.stringify({ error: "CRON_SECRET not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const authHeader = req.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getServiceClient();
  const errors: string[] = [];

  let programsFetched = 0;
  let programsUpserted = 0;
  let eduFetched = 0;
  let eduUpserted = 0;
  let statusUpdated = false;

  try {
    // ═══ 1. 지원사업 동기화 ═══
    console.log("[sync-rda] 지원사업 동기화 시작...");
    const policies = await fetchAllPolicies();
    programsFetched = policies.length;

    if (policies.length > 0) {
      const rows = policies.map(mapPolicyToRow);
      const { error } = await supabase
        .from("support_programs")
        .upsert(rows, { onConflict: "slug" });

      if (error) {
        errors.push(`지원사업 upsert 실패: ${error.message}`);
        console.error("[sync-rda] programs upsert error:", error.message);
      } else {
        programsUpserted = rows.length;
        console.log(`[sync-rda] 지원사업 ${rows.length}건 upsert 완료`);
      }
    } else {
      console.log("[sync-rda] RDA API에서 지원사업 데이터 없음 (키 미설정 또는 데이터 없음)");
    }

    // ═══ 2. 교육과정 동기화 ═══
    console.log("[sync-rda] 교육과정 동기화 시작...");
    const education = await fetchAllEducation();
    eduFetched = education.length;

    if (education.length > 0) {
      const rows = education.map(mapEduToRow);
      const { error } = await supabase
        .from("education_courses")
        .upsert(rows, { onConflict: "slug" });

      if (error) {
        errors.push(`교육과정 upsert 실패: ${error.message}`);
        console.error("[sync-rda] education upsert error:", error.message);
      } else {
        eduUpserted = rows.length;
        console.log(`[sync-rda] 교육과정 ${rows.length}건 upsert 완료`);
      }
    } else {
      console.log("[sync-rda] RDA API에서 교육 데이터 없음");
    }

    // ═══ 3. 상태 자동 업데이트 ═══
    console.log("[sync-rda] 상태 자동 업데이트 실행...");
    const { error: rpcError } = await supabase.rpc(
      "auto_update_program_status"
    );

    if (rpcError) {
      errors.push(`상태 업데이트 실패: ${rpcError.message}`);
      console.error("[sync-rda] status update error:", rpcError.message);
    } else {
      statusUpdated = true;
      console.log("[sync-rda] 상태 자동 업데이트 완료");
    }

    // ═══ 4. 동기화 로그 기록 ═══
    await supabase.from("data_sync_log").insert({
      source: "rda_api",
      table_name: "support_programs,education_courses",
      action: "sync",
      record_count: programsUpserted + eduUpserted,
      status: errors.length > 0 ? "partial" : "success",
      error_message: errors.length > 0 ? errors.join("; ") : null,
      metadata: {
        programs_fetched: programsFetched,
        programs_upserted: programsUpserted,
        education_fetched: eduFetched,
        education_upserted: eduUpserted,
        status_updated: statusUpdated,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`전체 동기화 에러: ${msg}`);
    console.error("[sync-rda] fatal error:", msg);

    // 에러 로그도 기록
    await supabase.from("data_sync_log").insert({
      source: "rda_api",
      table_name: "all",
      action: "sync",
      record_count: 0,
      status: "failed",
      error_message: msg,
      metadata: { timestamp: new Date().toISOString() },
    }).catch(() => {});
  }

  const result: SyncResult = {
    ok: errors.length === 0,
    programs: { fetched: programsFetched, upserted: programsUpserted },
    education: { fetched: eduFetched, upserted: eduUpserted },
    statusUpdated,
    errors,
  };

  console.log("[sync-rda] 완료:", JSON.stringify(result));

  return new Response(JSON.stringify(result), {
    status: errors.length > 0 && programsUpserted + eduUpserted === 0 ? 500 : 200,
    headers: { "Content-Type": "application/json" },
  });
});
