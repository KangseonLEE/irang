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
      title="행사 정보를 불러오지 못했어요"
      tag="EventsError"
      listHref="/events"
      listLabel="행사 목록"
    />
  );
}
