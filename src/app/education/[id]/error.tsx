"use client";

import { PageError } from "@/components/error/page-error";

export default function EducationDetailError({
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
      title="교육 정보를 불러오지 못했어요"
      tag="EducationDetailError"
      listHref="/education"
      listLabel="교육 목록"
    />
  );
}
