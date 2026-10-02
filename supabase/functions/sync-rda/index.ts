/**
 * sync-rda Edge Function — 모집 상태 자동 전환 전용 (2026-10-03 A안, 회장 결재)
 *
 * 하는 일: `auto_update_program_status()` RPC 1회 — 지원사업·교육·체험의 접수 기간이 지나면 '마감',
 *          시작일이 되면 '모집중'으로 바꾼다(KST 기준, 20260829_program_status_kst.sql).
 * 트리거: GitHub Actions `sync-data.yml` Phase A (매일 06:00 KST) · POST /functions/v1/sync-rda
 *
 * 이름이 sync-rda 인 이유: 원래 RDA 똑똑!청년농부 API 수집 + 상태 전환을 함께 하던 함수였다. 배포 이름과
 * 워크플로 호출 경로를 바꾸지 않으려고 이름은 그대로 두고, 수집 부분만 걷어냈다.
 *
 * 걷어낸 이유 (10/2 dev QA 조사):
 *   - RDA API 수집은 4/6 포팅 이후 **한 번도 동작하지 않았다** — data_sync_log 188회 전부 fetched 0, `rda-*` 행 0건.
 *     원인 3중: ① 필수 파라미터 `typeDv=json` 누락 → HTTP 200 + code -97 ② 응답 키를 list·data·items 로 찾음
 *     (실제 policy_list·edu_list) ③ 마감일 필드 오타 appEdDt(실제 applEdDt) — 모든 실패를 null 로 삼켜 "성공 0건".
 *   - 같은 RDA 사이트는 sync-crawl 의 rda-programs·rda-education·rda-events 타깃이 이미 수집한다.
 *     API 경로를 고쳐 켜면 같은 사업이 `rda-*` 와 `crawl-rda-*` 두 slug 로 중복 적재된다(5/11 중복 사고 유형).
 *   - 다시 API 를 쓰려면 B안(크롤 RDA 타깃 끄기 + 기존 행 정리)이 선행돼야 한다 — 그때 git 이력에서 복원.
 *
 * 실패는 숨기지 않는다: RPC 가 실패하면 ok:false + HTTP 500. 워크플로가 HTTP 코드와 본문 ok:false 를 함께 본다.
 */

import { getServiceClient } from "../_shared/supabase-client.ts";

interface StatusUpdateResult {
  ok: boolean;
  statusUpdated: boolean;
  errors: string[];
}

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
  let statusUpdated = false;

  try {
    console.log("[sync-rda] 모집 상태 자동 전환 실행...");
    const { error: rpcError } = await supabase.rpc("auto_update_program_status");
    if (rpcError) {
      errors.push(`상태 업데이트 실패: ${rpcError.message}`);
      console.error("[sync-rda] status update error:", rpcError.message);
    } else {
      statusUpdated = true;
      console.log("[sync-rda] 모집 상태 자동 전환 완료");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`상태 업데이트 에러: ${msg}`);
    console.error("[sync-rda] fatal error:", msg);
  }

  // 동기화 로그 — source 를 'status_update' 로 바꿔 "RDA 수집 0건"처럼 읽히지 않게 한다.
  // table_name 은 쉼표로 묶여 loadSyncMeta(정확 일치)의 목록 기준 월 판정에는 쓰이지 않는다.
  const { error: logError } = await supabase.from("data_sync_log").insert({
    source: "status_update",
    table_name: "support_programs,education_courses,farm_events",
    action: "update",
    record_count: 0,
    status: errors.length > 0 ? "failed" : "success",
    error_message: errors.length > 0 ? errors.join("; ") : null,
    metadata: { status_updated: statusUpdated, timestamp: new Date().toISOString() },
  });
  if (logError) console.error("[sync-rda] data_sync_log insert error:", logError.message);

  const result: StatusUpdateResult = { ok: errors.length === 0, statusUpdated, errors };
  console.log("[sync-rda] 완료:", JSON.stringify(result));

  return new Response(JSON.stringify(result), {
    status: errors.length > 0 ? 500 : 200,
    headers: { "Content-Type": "application/json" },
  });
});
