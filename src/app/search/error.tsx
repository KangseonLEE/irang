"use client";

import { PageError } from "@/components/error/page-error";

export default function SearchError({
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
      title="검색 서비스를 불러오지 못했어요"
      tag="SearchError"
      listHref="/"
      listLabel="홈으로"
    />
  );
}
