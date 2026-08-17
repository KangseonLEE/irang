"use client";

import { PageError } from "@/components/error/page-error";

export default function MatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      error={error}
      reset={reset}
      title="진단을 불러오지 못했어요"
      tag="MatchError"
      listHref="/"
      listLabel="홈으로"
    />
  );
}
