"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { RequestStatus } from "@/lib/admin/types";
import s from "./page.module.css";

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "⏳ 대기",
  done: "✅ 완료",
  rejected: "❌ 반려",
};

const STATUS_CYCLE: RequestStatus[] = ["pending", "done", "rejected"];

interface StatusToggleProps {
  id: number;
  currentStatus: RequestStatus;
}

export function StatusToggle({ id, currentStatus }: StatusToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;

    // 다음 상태로 순환
    const currentIndex = STATUS_CYCLE.indexOf(status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    setLoading(true);
    try {
      const res = await fetch("/admin/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus }),
      });

      if (res.ok) {
        setStatus(nextStatus);
        router.refresh();
      }
    } catch {
      // 실패 시 무시
    } finally {
      setLoading(false);
    }
  }, [id, status, loading, router]);

  const statusClass = `${s.statusBtn} ${s[`status_${status}`] ?? ""}`;

  return (
    <button
      type="button"
      className={statusClass}
      onClick={handleClick}
      disabled={loading}
      title="클릭하여 상태 변경"
    >
      {loading ? "..." : STATUS_LABELS[status]}
    </button>
  );
}
