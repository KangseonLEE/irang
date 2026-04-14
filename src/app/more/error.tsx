"use client";

import { PageError } from "@/components/error/page-error";

export default function MoreError({
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
      title="페이지를 불러올 수 없습니다"
      tag="MoreError"
    />
  );
}
