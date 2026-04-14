"use client";

import { PageError } from "@/components/error/page-error";

export default function CropsError({
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
      title="작물 정보를 불러올 수 없습니다"
      tag="CropsError"
      listHref="/crops"
      listLabel="작물 목록"
    />
  );
}
