"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import s from "./error.module.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className={s.container}>
      <AlertTriangle size={48} className={s.icon} />
      <h2 className={s.title}>
        문제가 발생했습니다
      </h2>
      <p className={s.description}>
        일시적인 오류일 수 있습니다. 아래 버튼을 눌러 다시 시도해 주세요.
      </p>
      <button onClick={reset} className={s.retryButton}>
        <RotateCcw size={16} />
        다시 시도
      </button>
    </div>
  );
}
