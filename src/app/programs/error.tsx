"use client";

import { PageError } from "@/components/error/page-error";

export default function ProgramsError({
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
      title="지원사업 정보를 불러올 수 없습니다"
      tag="ProgramsError"
      listHref="/programs"
      listLabel="지원사업 목록"
    />
  );
}
