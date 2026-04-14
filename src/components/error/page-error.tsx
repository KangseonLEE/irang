"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./page-error.module.css";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** 에러 페이지 제목 (예: "작물 정보를 불러올 수 없습니다") */
  title: string;
  /** console.error 태그명 (예: "CropsError") */
  tag: string;
  /** 돌아가기 링크 경로 (없으면 링크 버튼 숨김) */
  listHref?: string;
  /** 돌아가기 링크 라벨 (예: "작물 목록") */
  listLabel?: string;
}

export function PageError({
  error,
  reset,
  title,
  tag,
  listHref,
  listLabel,
}: PageErrorProps) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { component: tag } });
    console.error(`[${tag}]`, error);
  }, [error, tag]);

  return (
    <div className={s.container}>
      <Icon icon={AlertTriangle} size="2xl" className={s.icon} />
      <h2 className={s.title}>{title}</h2>
      <p className={s.description}>
        일시적인 오류일 수 있습니다. 다시 시도해 주세요.
      </p>
      {listHref && listLabel ? (
        <div className={s.actions}>
          <button onClick={reset} className={s.retryButton}>
            <Icon icon={RotateCcw} size="md" />
            다시 시도
          </button>
          <Link href={listHref} className={s.secondaryButton}>
            <Icon icon={Home} size="md" />
            {listLabel}
          </Link>
        </div>
      ) : (
        <button onClick={reset} className={s.retryButton}>
          <Icon icon={RotateCcw} size="md" />
          다시 시도
        </button>
      )}
    </div>
  );
}
