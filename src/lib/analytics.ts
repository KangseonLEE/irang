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

  // -- Share --
  share: (contentType: string, method: string) =>
    trackEvent({
      action: "share",
      category: "engagement",
      label: `${contentType}_${method}`,
    }),

  // -- Bookmark crop (Phase E #12 2026-05-21, GA4 → 빌드 시 Reporting API → CropPageCard interestCount) --
  bookmarkCrop: (cropId: string, action: "add" | "remove", sourcePage: string) =>
    trackEvent({
      action: "bookmark_crop",
      category: "engagement",
      label: `${cropId}:${action}:${sourcePage}`,
    }),

  // -- External link (OutboundClickTracker 가 사이트 전역 a[href^=http] 외부 이동을 위임 수집, 2026-09-03) --
  // 상세 조회(region/crop/program_view)·cta_click 헬퍼는 호출처 0으로 9/3 삭제 — 조회는 page_view 가 대신한다.
  externalClick: (hostAndPath: string) =>
    trackEvent({ action: "external_click", category: "outbound", label: hostAndPath }),

  // -- Landing IA 계측 (2026-08-30, 회장 지시 "사용자 패턴 분석 후 랜딩 구조 변경") --
  // 하루 1~2건 규모의 검색·진단 로그로는 정보 구조를 판단할 수 없어, 섹션 단위 노출·클릭을 GA4에 쌓는다.
  // 4~8주 뒤 GA4 탐색(Explorations)에서 landing_section_view 도달률 → landing_cta_click 전환으로 순서 재편 근거를 만든다.
  /** 랜딩 섹션이 뷰포트 50% 이상 노출됐을 때 1회 (ScrollReveal trackId) */
  landingSectionView: (sectionId: string) =>
    trackEvent({ action: "landing_section_view", category: "landing", label: sectionId }),
  /** 랜딩 내 [data-track="section:target"] 클릭 (LandingClickTracker 위임) */
  landingCtaClick: (track: string) =>
    trackEvent({ action: "landing_cta_click", category: "landing", label: track }),
  /** 랜딩 지원사업 탭 전환 (active | deadline | ongoing) */
  programsTabSwitch: (tab: string) =>
    trackEvent({ action: "programs_tab_switch", category: "landing", label: tab }),

  // -- 재배 캘린더 행 확장 (2026-08-30) — 어떤 작물을 펼쳐 보는지 = 인기 작물 신호 --
  calendarRowExpand: (cropId: string) =>
    trackEvent({ action: "calendar_row_expand", category: "crops", label: cropId }),
};
