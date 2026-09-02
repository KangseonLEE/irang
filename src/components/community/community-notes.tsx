"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquareText, ThumbsUp, Loader2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import {
  NICKNAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  NOTE_MIN_LENGTH,
} from "@/lib/community/filter";
import type { NoteTargetType, PublicNote } from "@/lib/community/types";
import s from "./community-notes.module.css";

interface Props {
  targetType: NoteTargetType;
  targetId: string;
  /** 부제 표시용 이름 (예: "경북 영주시", "사과", "청년농업인 영농정착지원") */
  targetLabel: string;
}

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "pending" }
  | { kind: "rejected"; reason: "contact" | "policy" }
  | { kind: "error"; message: string };

const TITLE_BY_TYPE: Record<NoteTargetType, string> = {
  region: "이 지역, 한 줄 의견",
  crop: "이 작물, 한 줄 의견",
  program: "이 지원사업, 한 줄 의견",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * 커뮤니티 1단계 — 로그인 없는 한 줄 의견 + 공감 (사전 승인제, 2026-09-02 회장 결재).
 * GET 이 503(마이그레이션 미적용·Supabase 미설정) 이면 섹션 자체를 렌더하지 않는다.
 * 사용자 생성 텍스트라 AutoGlossary 미적용.
 */
export function CommunityNotes({ targetType, targetId, targetLabel }: Props) {
  const [notes, setNotes] = useState<PublicNote[] | null>(null);
  const [available, setAvailable] = useState(true);
  const [body, setBody] = useState("");
  const [nickname, setNickname] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });
  const [liked, setLiked] = useState<Set<number>>(() => new Set());
  const [reported, setReported] = useState<Set<number>>(() => new Set());
  const composeStartRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `/api/community/notes?type=${encodeURIComponent(targetType)}&id=${encodeURIComponent(targetId)}`;
    fetch(url)
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setAvailable(false);
          return;
        }
        const json = (await res.json()) as { ok: boolean; notes?: PublicNote[] };
        setNotes(json.notes ?? []);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  const handleSubmit = useCallback(async () => {
    if (submit.kind === "submitting") return;
    const trimmed = body.trim();
    if (trimmed.length < NOTE_MIN_LENGTH) return;
    setSubmit({ kind: "submitting" });
    const composeMs =
      composeStartRef.current !== null ? Date.now() - composeStartRef.current : null;
    try {
      const res = await fetch("/api/community/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          body: trimmed,
          nickname: nickname.trim() || undefined,
          honeypot,
          composeMs,
        }),
      });
      const json = (await res.json().catch(() => null)) as
        | { ok?: boolean; status?: string; reason?: string; error?: string }
        | null;
      if (!res.ok || !json?.ok) {
        setSubmit({
          kind: "error",
          message: json?.error ?? "의견을 전달하지 못했어요. 잠시 후 다시 시도해 주세요",
        });
        return;
      }
      if (json.status === "rejected") {
        setSubmit({ kind: "rejected", reason: json.reason === "contact" ? "contact" : "policy" });
        trackEvent({ action: "community_note_rejected", category: "community", label: targetType });
        return;
      }
      setSubmit({ kind: "pending" });
      setBody("");
      trackEvent({ action: "community_note_submit", category: "community", label: targetType });
    } catch {
      setSubmit({ kind: "error", message: "네트워크 오류가 있어요. 잠시 후 다시 시도해 주세요" });
    }
  }, [submit.kind, body, nickname, honeypot, targetType, targetId]);

  const handleLike = useCallback(
    async (id: number) => {
      if (liked.has(id)) return;
      setLiked((prev) => new Set(prev).add(id));
      setNotes((prev) =>
        prev?.map((n) => (n.id === id ? { ...n, likeCount: n.likeCount + 1 } : n)) ?? prev,
      );
      try {
        const res = await fetch(`/api/community/notes/${id}/like`, { method: "POST" });
        const json = (await res.json().catch(() => null)) as { likeCount?: number } | null;
        if (res.ok && typeof json?.likeCount === "number") {
          const count = json.likeCount;
          setNotes((prev) => prev?.map((n) => (n.id === id ? { ...n, likeCount: count } : n)) ?? prev);
        }
      } catch {
        // 낙관적 반영 유지 — 새로고침 시 서버값으로 정정됨
      }
      trackEvent({ action: "community_note_like", category: "community", label: targetType });
    },
    [liked, targetType],
  );

  const handleReport = useCallback(
    async (id: number) => {
      if (reported.has(id)) return;
      if (!window.confirm("이 의견을 신고할까요? 광고·욕설·무관한 내용이면 검토 후 숨겨져요.")) return;
      setReported((prev) => new Set(prev).add(id));
      try {
        await fetch(`/api/community/notes/${id}/report`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "user" }),
        });
      } catch {
        // 무음 — 신고는 best-effort
      }
    },
    [reported],
  );

  if (!available) return null;

  const canSubmit =
    submit.kind !== "submitting" &&
    body.trim().length >= NOTE_MIN_LENGTH &&
    body.trim().length <= NOTE_MAX_LENGTH;

  return (
    <section className={s.section} aria-labelledby="community-notes-heading">
      <div className={s.header}>
        <h2 id="community-notes-heading" className={s.title}>
          <MessageSquareText size={18} aria-hidden="true" />
          {TITLE_BY_TYPE[targetType]}
        </h2>
        <p className={s.subtitle}>
          {targetLabel}에 대해 알고 있거나 궁금한 걸 남겨 주세요. 검토 후 게시돼요.
        </p>
      </div>

      {notes === null ? (
        <div className={s.skeleton} aria-hidden="true" />
      ) : notes.length === 0 ? (
        <p className={s.empty}>아직 의견이 없어요. 첫 의견을 남겨 보세요.</p>
      ) : (
        <ul className={s.list}>
          {notes.map((n) => (
            <li key={n.id} className={s.item}>
              <div className={s.itemMeta}>
                <span className={s.nickname}>{n.nickname ?? "익명"}</span>
                <span className={s.date}>{formatDate(n.createdAt)}</span>
              </div>
              <p className={s.body}>{n.body}</p>
              <div className={s.itemActions}>
                <button
                  type="button"
                  className={liked.has(n.id) ? s.likeBtnActive : s.likeBtn}
                  onClick={() => handleLike(n.id)}
                  aria-pressed={liked.has(n.id)}
                  aria-label={`공감 ${n.likeCount}`}
                >
                  <ThumbsUp size={14} aria-hidden="true" />
                  {n.likeCount > 0 ? n.likeCount : "공감"}
                </button>
                <button
                  type="button"
                  className={s.reportBtn}
                  onClick={() => handleReport(n.id)}
                  disabled={reported.has(n.id)}
                >
                  {reported.has(n.id) ? "신고됨" : "신고"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {submit.kind === "pending" ? (
        <div className={s.notice} role="note">
          <strong>의견이 전달됐어요.</strong> 검토가 끝나면 이 자리에 게시돼요 (보통 하루 안).
        </div>
      ) : (
        <form
          className={s.form}
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          <label htmlFor="community-note-body" className={s.srOnly}>
            의견
          </label>
          <textarea
            id="community-note-body"
            className={s.textarea}
            value={body}
            maxLength={NOTE_MAX_LENGTH}
            placeholder="예) 겨울 바람이 세서 하우스 보강이 필요했어요"
            onFocus={() => {
              if (composeStartRef.current === null) composeStartRef.current = Date.now();
            }}
            onChange={(e) => {
              setBody(e.target.value);
              if (submit.kind === "rejected" || submit.kind === "error") setSubmit({ kind: "idle" });
            }}
            rows={3}
          />
          <div className={s.formRow}>
            <input
              type="text"
              className={s.nicknameInput}
              value={nickname}
              maxLength={NICKNAME_MAX_LENGTH}
              placeholder="닉네임 (선택)"
              aria-label="닉네임"
              onChange={(e) => setNickname(e.target.value)}
            />
            {/* 봇용 허니팟 — 사람은 볼 수 없고 자동완성도 막는다 */}
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className={s.honeypot}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            <span className={s.counter} aria-live="polite">
              {body.trim().length}/{NOTE_MAX_LENGTH}
            </span>
            <button type="submit" className={s.submitBtn} disabled={!canSubmit}>
              {submit.kind === "submitting" ? (
                <>
                  <Loader2 size={14} className={s.spinner} aria-hidden="true" />
                  보내는 중
                </>
              ) : (
                "의견 남기기"
              )}
            </button>
          </div>
          {submit.kind === "rejected" && (
            <p className={s.errorMessage} role="alert">
              {submit.reason === "contact"
                ? "링크·연락처가 담긴 의견은 게시할 수 없어요. 내용만 남겨 주세요."
                : "게시할 수 없는 내용이 포함돼 있어요. 다른 표현으로 다시 남겨 주세요."}
            </p>
          )}
          {submit.kind === "error" && (
            <p className={s.errorMessage} role="alert">
              {submit.message}
            </p>
          )}
          <p className={s.policy}>
            광고·연락처·욕설이 담긴 글은 게시되지 않아요. IP는 암호화된 해시로만 보관해요.{" "}
            <Link href="/terms#community" className={s.policyLink}>
              운영 원칙
            </Link>
          </p>
        </form>
      )}
    </section>
  );
}
