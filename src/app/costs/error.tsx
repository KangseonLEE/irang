"use client";

import { PageError } from "@/components/error/page-error";

export default function CostsError({
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
      title="비용 정보를 불러오지 못했어요"
      tag="CostsError"
      listHref="/costs"
      listLabel="비용 목록"
    />
  );
}
