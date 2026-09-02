/**
 * 커뮤니티 한 줄 의견 — Supabase 접근 (service_role 경유, API route 전용)
 *
 * 테이블 미존재(마이그레이션 미적용) 는 `{ ok: false, reason: "migration-pending" }` 로
 * 명시 반환한다 — 5/26 quick_feedback silent 202 사고 교훈: 호출자는 이를 성공으로 포장하지 않는다.
 */

import { getSupabaseAdmin } from "@/lib/supabase";
import type { AdminNote, NoteStatus, NoteTargetType, PublicNote } from "./types";
import type { FilterFlag } from "./filter";

type Result<T> =
  | { ok: true; data: T }
  | { ok: false; reason: "no-supabase" | "migration-pending" | "db-error"; message?: string };

function isMissingTable(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return m.includes("does not exist") || m.includes("could not find the table") || m.includes("schema cache");
}

interface NoteRow {
  id: number;
  target_type: NoteTargetType;
  target_id: string;
  body: string;
  nickname: string | null;
  status: NoteStatus;
  reject_reason: string | null;
  filter_flags: string[] | null;
  llm_verdict: AdminNote["llmVerdict"];
  like_count: number;
  report_count: number;
  created_at: string;
}

function toPublic(row: NoteRow): PublicNote {
  return {
    id: row.id,
    body: row.body,
    nickname: row.nickname,
    likeCount: row.like_count,
    createdAt: row.created_at,
  };
}

function toAdmin(row: NoteRow): AdminNote {
  return {
    ...toPublic(row),
    targetType: row.target_type,
    targetId: row.target_id,
    status: row.status,
    rejectReason: row.reject_reason,
    filterFlags: row.filter_flags ?? [],
    llmVerdict: row.llm_verdict ?? null,
    reportCount: row.report_count,
  };
}

const PUBLIC_COLUMNS = "id, body, nickname, like_count, created_at";
const ADMIN_COLUMNS =
  "id, target_type, target_id, body, nickname, status, reject_reason, filter_flags, llm_verdict, like_count, report_count, created_at";

export async function listApprovedNotes(
  targetType: NoteTargetType,
  targetId: string,
  limit = 20,
): Promise<Result<PublicNote[]>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };
  const { data, error } = await sb
    .from("community_notes")
    .select(PUBLIC_COLUMNS)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("status", "approved")
    .eq("is_e2e", false)
    .order("like_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    return {
      ok: false,
      reason: isMissingTable(error.message) ? "migration-pending" : "db-error",
      message: error.message,
    };
  }
  return { ok: true, data: (data as unknown as NoteRow[]).map(toPublic) };
}

export async function insertNote(input: {
  targetType: NoteTargetType;
  targetId: string;
  body: string;
  nickname: string | null;
  status: NoteStatus;
  rejectReason: string | null;
  filterFlags: FilterFlag[];
  llmVerdict: AdminNote["llmVerdict"];
  ipHash: string;
  userAgent: string | null;
  isE2e: boolean;
}): Promise<Result<{ id: number }>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };
  const { data, error } = await sb
    .from("community_notes")
    .insert({
      target_type: input.targetType,
      target_id: input.targetId,
      body: input.body,
      nickname: input.nickname,
      status: input.status,
      reject_reason: input.rejectReason,
      filter_flags: input.filterFlags,
      llm_verdict: input.llmVerdict,
      ip_hash: input.ipHash,
      user_agent: input.userAgent,
      is_e2e: input.isE2e,
    })
    .select("id")
    .single();
  if (error) {
    return {
      ok: false,
      reason: isMissingTable(error.message) ? "migration-pending" : "db-error",
      message: error.message,
    };
  }
  return { ok: true, data: { id: (data as { id: number }).id } };
}

/** 최근 24시간 같은 ip_hash 제출 수 — 인메모리 rate limit 의 영속 보조 */
export async function countRecentByIp(ipHash: string, hours = 24): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb) return 0;
  const since = new Date(Date.now() - hours * 3_600_000).toISOString();
  const { count } = await sb
    .from("community_notes")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  return count ?? 0;
}

export async function likeNote(noteId: number, ipHash: string): Promise<Result<number>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };
  const { data, error } = await sb.rpc("community_note_like", {
    p_note_id: noteId,
    p_ip_hash: ipHash,
  });
  if (error) {
    return {
      ok: false,
      reason: isMissingTable(error.message) ? "migration-pending" : "db-error",
      message: error.message,
    };
  }
  return { ok: true, data: Number(data ?? 0) };
}

export async function reportNote(
  noteId: number,
  ipHash: string,
  reason: string | null,
): Promise<Result<number>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };
  const { data, error } = await sb.rpc("community_note_report", {
    p_note_id: noteId,
    p_ip_hash: ipHash,
    p_reason: reason,
  });
  if (error) {
    return {
      ok: false,
      reason: isMissingTable(error.message) ? "migration-pending" : "db-error",
      message: error.message,
    };
  }
  return { ok: true, data: Number(data ?? 0) };
}

// ── 관리자 ──

export async function listNotesForAdmin(
  status: NoteStatus | "all",
  limit = 100,
): Promise<Result<AdminNote[]>> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, reason: "no-supabase" };
  let q = sb
    .from("community_notes")
    .select(ADMIN_COLUMNS)
    .eq("is_e2e", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (status !== "all") q = q.eq("status", status);
  const { data, error } = await q;
  if (error) {
    return {
      ok: false,
      reason: isMissingTable(error.message) ? "migration-pending" : "db-error",
      message: error.message,
    };
  }
  return { ok: true, data: (data as unknown as NoteRow[]).map(toAdmin) };
}

export async function countPendingNotes(): Promise<number> {
  const sb = getSupabaseAdmin();
  if (!sb) return 0;
  const { count } = await sb
    .from("community_notes")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("is_e2e", false);
  return count ?? 0;
}

export async function updateNoteStatus(
  id: number,
  status: NoteStatus,
  rejectReason?: string | null,
): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const patch: Record<string, unknown> = { status };
  if (status === "approved") patch.approved_at = new Date().toISOString();
  if (rejectReason !== undefined) patch.reject_reason = rejectReason;
  const { error } = await sb.from("community_notes").update(patch).eq("id", id);
  return !error;
}
