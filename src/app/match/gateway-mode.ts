/**
 * /match 게이트웨이 모드 — URL(`?mode=`)이 정한다 (2026-10-06 QA Q2-W4).
 *
 * 서버(page.tsx)와 클라이언트(service-gateway.tsx)가 같은 규칙으로 읽는다. `"use client"` 파일에 두면 서버가 import 할 때
 * 참조 프록시가 와서 함수가 사라진다(Next 16 RSC 경계) — 그래서 순수 모듈로 둔다.
 */

export type GatewayMode = "select" | "quick" | "match" | "assess";

/** 위저드 모드 — 카드·딥링크가 여는 세 진단 */
export type WizardMode = Exclude<GatewayMode, "select">;

type ParamValue = string | string[] | null | undefined;

function first(v: ParamValue): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

/**
 * - `?mode=quick|assess|match` → 그 위저드
 * - `?experience=`·`?lifestyle=` (14문항 결과의 "맞춤 지역 찾기" 딥링크) → 정착 유형 진단(미리 채움)
 * - 그 밖 → 서비스 선택 화면
 */
export function resolveGatewayMode(get: (key: string) => ParamValue): GatewayMode {
  const mode = first(get("mode"));
  if (mode === "quick" || mode === "assess" || mode === "match") return mode;
  if (first(get("experience")) !== undefined || first(get("lifestyle")) !== undefined) return "match";
  return "select";
}

/** 모드 진입 주소 — 카드 링크와 "다시 진단하기"가 같은 주소를 쓴다 */
export function gatewayModeHref(mode: WizardMode): string {
  return `/match?mode=${mode}`;
}

/**
 * history.state 표시 — 이 항목이 서비스 선택 화면에서 카드로 들어온 위저드인가.
 * 그렇다면 위저드 "처음으로"는 history.back() 으로 선택 화면 항목에 돌아가고, 아니면(딥링크로 바로 들어옴)
 * 선택 화면 주소를 새로 쌓는다 — back() 이 사이트 밖으로 나가지 않게.
 */
export const GATEWAY_FROM_SELECT_KEY = "__irangGatewayFromSelect";
