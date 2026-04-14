"use client";

import { PageError } from "@/components/error/page-error";

export default function GuideError({
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
      title="가이드를 불러올 수 없습니다"
      tag="GuideError"
    />
  );
}
