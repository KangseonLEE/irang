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
      title="인터뷰를 불러오지 못했어요"
      tag="InterviewsError"
    />
  );
}
