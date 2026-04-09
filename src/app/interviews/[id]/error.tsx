"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import s from "../../error.module.css";

export default function InterviewDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[InterviewDetailError]", error);
  }, [error]);

  return (
    <div className={s.container}>
      <AlertTriangle size={48} className={s.icon} />
      <h2 className={s.title}>인터뷰를 불러올 수 없습니다</h2>
      <p className={s.description}>
        일시적인 오류일 수 있습니다. 다시 시도해 주세요.
      </p>
      <div className={s.actions}>
        <button onClick={reset} className={s.retryButton}>
          <RotateCcw size={16} />
          다시 시도
        </button>
        <Link href="/interviews" className={s.secondaryButton}>
          <Home size={16} />
          인터뷰 목록
        </Link>
      </div>
    </div>
  );
}
