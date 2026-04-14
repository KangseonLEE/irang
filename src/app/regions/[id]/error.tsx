"use client";

import { PageError } from "@/components/error/page-error";

export default function RegionDetailError({
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
      title="지역 상세 정보를 불러올 수 없습니다"
      tag="RegionDetailError"
      listHref="/regions"
      listLabel="지역 비교"
    />
  );
}
