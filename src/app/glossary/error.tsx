"use client";

import { PageError } from "@/components/error/page-error";

export default function GlossaryError({
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
      title="용어 정보를 불러올 수 없습니다"
      tag="GlossaryError"
      listHref="/glossary"
      listLabel="용어 목록"
    />
  );
}
