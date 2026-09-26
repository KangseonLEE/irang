"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SelectCombobox } from "@/components/ui/select-combobox";
import type { RequestStatus } from "@/lib/admin/types";
import s from "./page.module.css";

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "대기",
  done: "완료",
  rejected: "반려",
};

const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as RequestStatus[]).map(
  (value) => ({ value, label: STATUS_LABELS[value] })
);

interface StatusToggleProps {
  id: number;
  currentStatus: RequestStatus;
}

/**
 * 요청 처리 상태 선택 (2026-09-26 회장 지시)
 * 이전엔 칩을 누를 때마다 대기→완료→반려로 즉시 순환해 실수 클릭이 곧 상태 변경이었다.
 * 칩을 누르면 목록이 열리고, 고른 값만 PATCH 한다. 실패하면 이전 값으로 되돌린다.
 */
export function StatusToggle({ id, currentStatus }: StatusToggleProps) {
  const router = useRouter();
  const [status, setStatus] = useState<RequestStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    async (next: string) => {
      const nextStatus = next as RequestStatus;
      if (loading || nextStatus === status || !(nextStatus in STATUS_LABELS)) return;

      const prev = status;
      setStatus(nextStatus);
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/admin/api/requests", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status: nextStatus }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        router.refresh();
      } catch {
        setStatus(prev);
        setError("변경하지 못했어요. 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    },
    [id, status, loading, router]
  );

  return (
    <div className={s.statusField}>
      <SelectCombobox
        value={status}
        onChange={handleChange}
        options={STATUS_OPTIONS}
        ariaLabel={`요청 ${id} 처리 상태`}
        searchable={false}
        size="sm"
        disabled={loading}
        className={`${s.statusSelect} ${s[`status_${status}`] ?? ""}`}
      />
      {error && (
        <span className={s.statusError} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
