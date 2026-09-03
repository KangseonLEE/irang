/**
 * 어드민 — 커뮤니티 의견 승인 큐 (사전 승인제, 2026-09-02)
 *
 * pending 기본 필터. 룰 필터 결과(플래그·사유)를 함께 보여 관리자가 오탐을 복구할 수 있게 한다.
 * 스타일은 요청 관리 페이지 모듈을 재사용(카드·필터 pill·배지), 액션만 별도.
 */

import Link from "next/link";
import { listNotesForAdmin } from "@/lib/community/queries";
import {
  TARGET_TYPE_LABELS,
  resolveTargetHref,
  resolveTargetLabel,
} from "@/lib/community/target-label";
import { NOTE_STATUSES, isNoteStatus, type NoteStatus } from "@/lib/community/types";
import { loadPrograms } from "@/lib/data/programs";
import { NoteActions } from "./note-actions";
import s from "../requests/page.module.css";
import c from "./page.module.css";

/** admin은 매 요청 fresh fetch가 의도. searchParams 의존이라 revalidate 추가 금지 (2026-05-11 lessons). */

const STATUS_LABELS: Record<NoteStatus | "all", string> = {
  all: "전체",
  pending: "⏳ 대기",
  approved: "✅ 게시",
  rejected: "❌ 반려",
  hidden: "🙈 숨김",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminCommunityPage({ searchParams }: Props) {
  const params = await searchParams;
  const statusFilter: NoteStatus | "all" = isNoteStatus(params.status)
    ? params.status
    : params.status === "all"
      ? "all"
      : "pending";

  const result = await listNotesForAdmin(statusFilter);

  // 지원사업 제목은 정적+DB 병합 목록에서 (target-label 모듈은 CI 실행용이라 supabase 의존 금지)
  const needsPrograms =
    result.ok && result.data.some((n) => n.targetType === "program");
  const programTitles = new Map<string, string>();
  if (needsPrograms) {
    const { programs } = await loadPrograms();
    for (const p of programs) programTitles.set(p.id, p.title);
  }

  return (
    <div className={s.page}>
      <h1 className={s.heading}>커뮤니티 의견</h1>

      <div className={s.filters}>
        <div className={s.filterGroup}>
          {(["pending", ...NOTE_STATUSES.filter((x) => x !== "pending"), "all"] as const).map(
            (value) => (
              <Link
                key={value}
                href={`/admin/community?status=${value}`}
                className={`${s.filterPill} ${statusFilter === value ? s.filterActive : ""}`}
              >
                {STATUS_LABELS[value]}
              </Link>
            ),
          )}
        </div>
        {result.ok && <span className={s.totalCount}>총 {result.data.length}건</span>}
      </div>

      {!result.ok ? (
        <p className={s.empty}>
          {result.reason === "migration-pending"
            ? "community_notes 테이블이 아직 없어요 — supabase/migrations/20260902_community_notes.sql 을 적용해 주세요."
            : result.reason === "no-supabase"
              ? "Supabase service role 설정이 없어요."
              : `조회 실패: ${result.message ?? "unknown"}`}
        </p>
      ) : result.data.length === 0 ? (
        <p className={s.empty}>해당 상태의 의견이 없어요</p>
      ) : (
        <div className={s.list}>
          {result.data.map((note) => (
            <div key={note.id} className={s.card}>
              <div className={s.cardTop}>
                <span className={s.categoryBadge}>{TARGET_TYPE_LABELS[note.targetType]}</span>
                <Link
                  href={resolveTargetHref(note.targetType, note.targetId)}
                  className={s.keywordBadge}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={note.targetId}
                >
                  {resolveTargetLabel(note.targetType, note.targetId, programTitles)}
                </Link>
                <span className={c.nickname}>{note.nickname ?? "익명"}</span>
                <span className={s.date}>
                  {new Date(note.createdAt).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <p className={s.message}>{note.body}</p>

              <div className={c.signals}>
                {note.filterFlags.length > 0 && (
                  <span className={c.signalRule}>룰: {note.filterFlags.join(", ")}</span>
                )}
                {note.llmVerdict && (
                  <span
                    className={note.llmVerdict.label === "ok" ? c.signalOk : c.signalWarn}
                    title={note.llmVerdict.model}
                  >
                    LLM: {note.llmVerdict.label} ({Math.round(note.llmVerdict.confidence * 100)}%)
                    {note.llmVerdict.reason ? ` · ${note.llmVerdict.reason}` : ""}
                  </span>
                )}
                {note.rejectReason && <span className={c.signalMuted}>사유: {note.rejectReason}</span>}
                {note.reportCount > 0 && <span className={c.signalWarn}>신고 {note.reportCount}</span>}
                {note.likeCount > 0 && <span className={c.signalMuted}>공감 {note.likeCount}</span>}
              </div>

              <div className={s.cardBottom}>
                <span className={s.pagePath}>#{note.id}</span>
                <NoteActions id={note.id} status={note.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
