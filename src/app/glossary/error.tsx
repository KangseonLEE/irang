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
      title="용어 정보를 불러오지 못했어요"
      tag="GlossaryError"
      listHref="/glossary"
      listLabel="용어 목록"
    />
  );
}
