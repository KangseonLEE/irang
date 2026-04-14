"use client";

import { PageError } from "@/components/error/page-error";

export default function EducationError({
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
      title="교육 정보를 불러올 수 없습니다"
      tag="EducationError"
      listHref="/education"
      listLabel="교육 목록"
    />
  );
}
