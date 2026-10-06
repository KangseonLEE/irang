"use client";

/**
 * 서비스 선택 카드의 링크 — 카드 내용은 서버가 그리고(children), 누름만 여기서 받는다 (2026-10-06 QA Q2-W4).
 *
 * 주소를 `/match?mode=…` 로 바꾸는 것만으로 화면이 바뀐다(게이트웨이가 useSearchParams 로 읽는다). 서버를 다시 부르지
 * 않게 Next 라우터와 연동되는 history.pushState 를 쓴다 — 그래서 뒤로가기를 누르면 선택 화면으로 돌아온다.
 * 자바스크립트 전이나 새 탭 열기(⌘·Ctrl·가운데 클릭)는 그냥 링크로 동작한다(서버가 그 모드를 그린다).
 */
import type { MouseEvent, ReactNode } from "react";
import { analytics } from "@/lib/analytics";
import { GATEWAY_FROM_SELECT_KEY, gatewayModeHref, type WizardMode } from "./gateway-mode";

interface ModeCardLinkProps {
  mode: WizardMode;
  className: string;
  children: ReactNode;
}

export function ModeCardLink({ mode, className, children }: ModeCardLinkProps) {
  const href = gatewayModeHref(mode);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    analytics.modeSelectClicked(mode);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    // 선택 화면에서 들어왔다는 표시 — 위저드의 "처음으로"가 새 항목을 쌓지 않고 뒤로 돌아오게
    window.history.pushState({ [GATEWAY_FROM_SELECT_KEY]: true }, "", href);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
