"use client";

import { useEffect } from "react";
import { trackFeedbackEvent } from "@/lib/feedback-session";

/**
 * 서버 컴포넌트에서 의미있는 이벤트를 기록할 때 사용하는 경량 트래커.
 *
 * 사용 예: `<FeedbackEventTracker event="assess_result" />`
 *
 * 마운트 시 1회만 sessionStorage 카운터를 증가시키고 아무것도 렌더하지 않음.
 */

type Event =
  | "assess_result"
  | "regions_compare_result"
  | "programs_filter"
  | "match_result";

export function FeedbackEventTracker({ event }: { event: Event }) {
  useEffect(() => {
    trackFeedbackEvent(event);
  }, [event]);

  return null;
}
