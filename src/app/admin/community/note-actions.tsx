"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import type { NoteStatus } from "@/lib/community/types";
import c from "./page.module.css";

interface Props {
  id: number;
  status: NoteStatus;
}

const ACTIONS: { to: NoteStatus; label: string; from: NoteStatus[] }[] = [
  { to: "approved", label: "승인", from: ["pending", "rejected", "hidden"] },
  { to: "rejected", label: "반려", from: ["pending", "approved", "hidden"] },
  { to: "hidden", label: "숨김", from: ["approved"] },
  { to: "pending", label: "대기로", from: ["approved", "rejected", "hidden"] },
];

export function NoteActions({ id, status }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<NoteStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const change = useCallback(
    async (to: NoteStatus) => {
      if (loading) return;
      setLoading(to);
      setError(null);
      try {
        const res = await fetch("/admin/api/community", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: to }),
        });
        if (!res.ok) {
          setError("변경 실패");
          return;
        }
        router.refresh();
      } catch {
        setError("네트워크 오류");
      } finally {
        setLoading(null);
      }
    },
    [id, loading, router],
  );

  return (
    <div className={c.actions}>
      {ACTIONS.filter((a) => a.from.includes(status)).map((a) => (
        <button
          key={a.to}
          type="button"
          className={`${c.actionBtn} ${c[`action_${a.to}`] ?? ""}`}
          onClick={() => change(a.to)}
          disabled={loading !== null}
        >
          {loading === a.to ? "…" : a.label}
        </button>
      ))}
      {error && <span className={c.actionError}>{error}</span>}
    </div>
  );
}
