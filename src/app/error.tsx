"use client";

import { PageError } from "@/components/error/page-error";

export default function RootError({
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
      title="문제가 생겼어요"
      tag="RootError"
    />
  );
}
