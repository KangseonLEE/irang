"use client";

import { PageError } from "@/components/error/page-error";

export default function RegionsError({
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
      title="지역 정보를 불러오지 못했어요"
      tag="RegionsError"
      listHref="/regions"
      listLabel="지역 비교"
    />
  );
}
