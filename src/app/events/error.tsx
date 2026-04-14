"use client";

import { PageError } from "@/components/error/page-error";

export default function EventsError({
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
      title="행사 정보를 불러올 수 없습니다"
      tag="EventsError"
      listHref="/events"
      listLabel="행사 목록"
    />
  );
}
