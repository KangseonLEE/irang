"use client";

import { PageError } from "@/components/error/page-error";

export default function GuDetailError({
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
      title="구/동 정보를 불러올 수 없어요"
      tag="GuDetailError"
      listHref="/regions"
      listLabel="지역 탐색"
    />
  );
}
