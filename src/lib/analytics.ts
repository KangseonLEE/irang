// ---------------------------------------------------------------------------
// GA4 Custom Event Tracking
// ---------------------------------------------------------------------------

type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

/**
 * GA4 커스텀 이벤트 전송.
 * SSR 환경에서 안전하게 동작하도록 window / gtag 존재 여부를 확인한다.
 */
export function trackEvent({ action, category, label, value }: GtagEvent) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// ---------------------------------------------------------------------------
// Pre-defined event helpers
// ---------------------------------------------------------------------------

export const analytics = {
  // -- Search --
  search: (query: string) =>
    trackEvent({ action: "search", category: "engagement", label: query }),

  // -- Assessment --
  assessStart: () =>
    trackEvent({ action: "assess_start", category: "assessment" }),
  assessComplete: (tier: string, score: number) =>
    trackEvent({
      action: "assess_complete",
      category: "assessment",
      label: tier,
      value: score,
    }),

  // -- Match wizard --
  matchStart: () =>
    trackEvent({ action: "match_start", category: "match" }),
  matchComplete: () =>
    trackEvent({ action: "match_complete", category: "match" }),

  // -- Navigation / Content views --
  regionView: (regionId: string) =>
    trackEvent({ action: "region_view", category: "content", label: regionId }),
  cropView: (cropId: string) =>
    trackEvent({ action: "crop_view", category: "content", label: cropId }),
  programView: (programId: string) =>
    trackEvent({
      action: "program_view",
      category: "content",
      label: programId,
    }),

  // -- Share --
  share: (contentType: string, method: string) =>
    trackEvent({
      action: "share",
      category: "engagement",
      label: `${contentType}_${method}`,
    }),

  // -- External link --
  externalClick: (url: string) =>
    trackEvent({ action: "external_click", category: "outbound", label: url }),

  // -- CTA clicks --
  ctaClick: (ctaName: string) =>
    trackEvent({
      action: "cta_click",
      category: "conversion",
      label: ctaName,
    }),
};
