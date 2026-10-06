"use client";

/**
 * /match 게이트웨이 — 모드(서비스 선택·빠른 점검·적합도 진단·유형 진단)만 고르는 클라이언트 경계 (2026-10-06 QA Q2-W4).
 *
 * - 모드는 URL(`?mode=`)이 정한다. 페이지가 searchParams 를 읽는 동적 렌더라 useSearchParams 가 서버에서 바로 값을 받고,
 *   BAILOUT 없이 그 모드의 첫 화면(h1 포함)이 HTML 에 들어간다.
 * - 선택 화면의 제목·카드는 서버가 그려 props 로 넘긴다(intro·cards). 여기서는 "이전 진단 결과" 목록만 그린다.
 * - 카드는 history.pushState 로 주소만 바꾼다(mode-card-link.tsx) → 뒤로가기 = 선택 화면.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AssessmentWizard } from "../assess/assessment-wizard";
import { GatewayHistory } from "./gateway-history";
import { GATEWAY_FROM_SELECT_KEY, gatewayModeHref, resolveGatewayMode, type WizardMode } from "./gateway-mode";
import type { DiagnosisHistoryItem } from "./diagnosis-history";
import { HistoryResult } from "./history-result";
import { MatchWizard } from "./match-wizard";
import { QuickWizard } from "./quick-wizard";
import s from "./service-gateway.module.css";

interface ServiceGatewayProps {
  /** 선택 화면 윗부분(제목·안내) — 서버 렌더 */
  intro: ReactNode;
  /** 진단 카드·비용 바로가기 — 서버 렌더 */
  cards: ReactNode;
}

export function ServiceGateway({ intro, cards }: ServiceGatewayProps) {
  const searchParams = useSearchParams();
  const mode = resolveGatewayMode((key) => searchParams.get(key));
  /** 선택 화면에서 연 이전 결과 — 이 브라우저 기록이라 주소에는 싣지 않는다 */
  const [viewing, setViewing] = useState<DiagnosisHistoryItem | null>(null);

  // 화면이 바뀌면 맨 위로 — 같은 /match 안이라 ScrollToTop(pathname 기준)이 못 잡는다
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode, viewing]);

  /**
   * 위저드 "처음으로" — 선택 화면 카드로 들어왔으면 뒤로(그 항목으로 돌아감), 딥링크로 바로 들어왔으면
   * 선택 화면 주소를 쌓는다(back() 이 사이트 밖으로 나가지 않게).
   */
  const exitToSelect = useCallback(() => {
    const state: unknown = window.history.state;
    const fromSelect =
      typeof state === "object" && state !== null && GATEWAY_FROM_SELECT_KEY in state;
    if (fromSelect) window.history.back();
    else window.history.pushState(null, "", "/match");
  }, []);

  /** 이전 결과 화면에서 "다시 …하기" — 같은 진단을 처음부터 (주소를 그 모드로) */
  const restart = useCallback((next: WizardMode) => {
    setViewing(null);
    window.history.pushState({ [GATEWAY_FROM_SELECT_KEY]: true }, "", gatewayModeHref(next));
  }, []);

  const closeViewing = useCallback(() => setViewing(null), []);

  // key — 같은 컴포넌트라도 새 진단·다시 보기는 상태를 새로 시작한다
  if (mode === "quick") return <QuickWizard key="quick" onBack={exitToSelect} />;
  if (mode === "assess") return <AssessmentWizard key="assess" onBack={exitToSelect} />;
  if (mode === "match") return <MatchWizard key="match" onBack={exitToSelect} />;

  if (viewing?.kind === "quick") {
    return (
      <QuickWizard
        key={`review-${viewing.resultId}`}
        review={viewing.answers}
        onBack={closeViewing}
        onRestart={() => restart("quick")}
      />
    );
  }
  if (viewing?.kind === "assess") {
    return (
      <AssessmentWizard
        key={`review-${viewing.resultId}`}
        review={{ answers: viewing.answers, demo: viewing.demo, track: viewing.track }}
        onBack={closeViewing}
        onRestart={() => restart("assess")}
      />
    );
  }
  if (viewing) {
    return (
      <HistoryResult
        farmTypeId={viewing.farmTypeId}
        regionIds={viewing.topRegionIds ?? []}
        cropIds={viewing.topCropIds ?? []}
        onBack={closeViewing}
      />
    );
  }

  /* ═══ 서비스 선택 화면 ═══ */
  return (
    <div className={s.page}>
      {intro}
      <GatewayHistory onOpen={setViewing} />
      {cards}
    </div>
  );
}
