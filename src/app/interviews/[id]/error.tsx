"use client";

import { PageError } from "@/components/error/page-error";

export default function InterviewDetailError({
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
      tag="InterviewDetailError"
      listHref="/interviews"
      listLabel="인터뷰 목록"
    />
  );
}
