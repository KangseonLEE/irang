"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Icon } from "@/components/ui/icon";
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
      <Icon icon={AlertTriangle} size="2xl" className={s.icon} />
      <h2 className={s.title}>작물 정보를 불러올 수 없습니다</h2>
      <p className={s.description}>
        일시적인 데이터 오류일 수 있습니다. 다시 시도해 주세요.
      </p>
      <div className={s.actions}>
        <button onClick={reset} className={s.retryButton}>
          <Icon icon={RotateCcw} size="md" />
          다시 시도
        </button>
        <Link href="/crops" className={s.secondaryButton}>
          <Icon icon={Home} size="md" />
          작물 목록
        </Link>
      </div>
    </div>
  );
}
