"use client";

import { PageError } from "@/components/error/page-error";

export default function CropDetailError({
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
      title="작물 상세 정보를 불러오지 못했어요"
      tag="CropDetailError"
      listHref="/crops"
      listLabel="작물 목록"
    />
  );
}
