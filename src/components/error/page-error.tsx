"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { ErrorReportButton } from "./error-report-button";
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
  /* 이 오류의 Sentry 이벤트 id — 사용자가 보내는 피드백을 같은 이슈에 묶는 데 쓴다 */
  const [eventId, setEventId] = useState<string | undefined>();

  useEffect(() => {
    const id = Sentry.captureException(error, { tags: { component: tag } });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEventId(id);
    console.error(`[${tag}]`, error);
  }, [error, tag]);

  return (
    <div className={s.container}>
      <Icon icon={AlertTriangle} size="2xl" className={s.icon} />
      <h2 className={s.title}>{title}</h2>
      <p className={s.description}>
        잠시 후 다시 시도해 보세요.
      </p>
      <div className={s.actions}>
        <button onClick={reset} className={s.retryButton}>
          <Icon icon={RotateCcw} size="md" />
          다시 시도
        </button>
        {listHref && listLabel && (
          <Link href={listHref} className={s.secondaryButton}>
            <Icon icon={Home} size="md" />
            {listLabel}
          </Link>
        )}
        <ErrorReportButton error={error} eventId={eventId} tag={tag} />
      </div>
    </div>
  );
}
