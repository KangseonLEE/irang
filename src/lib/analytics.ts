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

  // -- Assessment step view --
  assessStepView: (stepNumber: number, questionId: string) =>
    trackEvent({
      action: "assess_step_view",
      category: "assessment",
      label: questionId,
      value: stepNumber,
    }),

  // -- Match wizard --
  matchStart: () =>
    trackEvent({ action: "match_start", category: "match" }),
  matchComplete: () =>
    trackEvent({ action: "match_complete", category: "match" }),
  matchStepView: (stepNumber: number, questionId: string) =>
    trackEvent({
      action: "match_step_view",
      category: "match",
      label: questionId,
      value: stepNumber,
    }),

  // -- Quick check (Phase 2c 2026-05-15) --
  quickCheckStart: () =>
    trackEvent({ action: "quick_check_start", category: "quick_check" }),
  quickCheckStepView: (stepNumber: number, questionId: string) =>
    trackEvent({
      action: "quick_check_step_view",
      category: "quick_check",
      label: questionId,
      value: stepNumber,
    }),
  quickCheckComplete: (personaId: string) =>
    trackEvent({
      action: "quick_check_complete",
      category: "quick_check",
      label: personaId,
    }),

  // -- Mode select (Phase 2c gateway 카드 3장 클릭) --
  modeSelectClicked: (mode: "quick" | "assess" | "match") =>
    trackEvent({
      action: "mode_select_clicked",
      category: "quick_check",
      label: mode,
    }),

  // -- Ranking wizard (/regions/ranking D2 2026-05-14, Sprint 2 2026-05-16 확장) --
  // Sprint 2: mode 3종(persona·dimension·custom) + sido step + 결과 상단 modeChip
  rankingWizardStart: () =>
    trackEvent({ action: "ranking_wizard_start", category: "ranking" }),
  rankingWizardStep: (mode: "persona" | "dimension" | "custom") =>
    trackEvent({
      action: "ranking_wizard_step",
      category: "ranking",
      label: mode,
    }),
  rankingWizardSido: (sido: string) =>
    trackEvent({
      action: "ranking_wizard_sido",
      category: "ranking",
      label: sido,
    }),
  rankingWizardComplete: (
    mode: "persona" | "dimension" | "custom",
    selection: string,
  ) =>
    trackEvent({
      action: "ranking_wizard_complete",
      category: "ranking",
      label: `${mode}:${selection}`,
    }),
  rankingModeChipClicked: (
    from: "persona" | "dimension" | "custom",
    to: "persona" | "dimension" | "custom" | "restart",
  ) =>
    trackEvent({
      action: "ranking_mode_chip_clicked",
      category: "ranking",
      label: `${from}->${to}`,
    }),

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
