"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import s from "../error.module.css";

export default function CropsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[CropsError]", error);
  }, [error]);

  return (
    <div className={s.container}>
      <AlertTriangle size={48} className={s.icon} />
      <h2 className={s.title}>작물 정보를 불러올 수 없습니다</h2>
      <p className={s.description}>
        일시적인 데이터 오류일 수 있습니다. 다시 시도해 주세요.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
        <button onClick={reset} className={s.retryButton}>
          <RotateCcw size={16} />
          다시 시도
        </button>
        <Link
          href="/crops"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "10px",
            border: "1px solid var(--border, #e4e4e7)",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "var(--foreground)",
            textDecoration: "none",
          }}
        >
          <Home size={16} />
          작물 목록
        </Link>
      </div>
    </div>
  );
}
