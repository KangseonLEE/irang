"use client";

import { PageError } from "@/components/error/page-error";

export default function AssessResultError({
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
      title="진단 결과를 불러올 수 없어요"
      tag="AssessResultError"
      listHref="/match"
      listLabel="다시 진단하기"
    />
  );
}
