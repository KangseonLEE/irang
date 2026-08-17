"use client";

import { PageError } from "@/components/error/page-error";

export default function ProgramDetailError({
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
      title="지원사업 정보를 불러오지 못했어요"
      tag="ProgramDetailError"
      listHref="/programs"
      listLabel="지원사업 목록"
    />
  );
}
