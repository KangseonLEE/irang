"use client";

import { PageError } from "@/components/error/page-error";

export default function InterviewsError({
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
      title="인터뷰를 불러올 수 없습니다"
      tag="InterviewsError"
    />
  );
}
