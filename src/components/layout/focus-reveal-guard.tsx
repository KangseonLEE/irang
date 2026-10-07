"use client";

import { useFocusReveal } from "@/lib/hooks/use-focus-reveal";

/**
 * 키보드 포커스 노출 안전망 (2026-10-06 QA Q3-🟡5·🟡12) — 레이아웃에 한 번만 둔다.
 * 일부만 보이는 요소(가로 캐러셀·섹션 탭)는 그 스크롤 상자를, 고정 띠(헤더·하단 탭바·하단 고정 바)에 가린 요소는 문서를
 * 최소한만 민다. 각 컴포넌트에 포커스 처리를 따로 넣지 않아도 된다 — 규칙·예외는 `use-focus-reveal` 주석.
 * 모바일 가상 키보드 안전망(KeyboardFocusGuard)과는 대상이 갈린다: 이쪽은 키보드(Tab·화살표)로 온 포커스만.
 */
export function FocusRevealGuard() {
  useFocusReveal();
  return null;
}
