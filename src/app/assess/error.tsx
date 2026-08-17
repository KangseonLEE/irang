"use client";

import { PageError } from "@/components/error/page-error";

export default function AssessError({
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
      title="진단 페이지를 불러오지 못했어요"
      tag="AssessError"
      listHref="/"
      listLabel="홈으로"
    />
  );
}
