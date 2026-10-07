"use client";

/**
 * 위저드 안에서 브라우저 뒤로가기 = 한 단계 뒤로 (2026-10-06 QA Q4-W11).
 *
 * 예전엔 문항이 화면 상태로만 넘어가서, 뒤로가기를 누르면 답을 버린 채 이전 페이지로 나갔다.
 *
 * 동작: depth(첫 문항 0, 문항마다 +1, 결과 화면 = 마지막+1)가 1 이상인 동안 **같은 주소의 '가드' 항목 하나**를
 * history 맨 위에 얹어 둔다. 뒤로가기가 가드를 꺼내면(popstate) stepBack 으로 한 단계 되돌리고, 아직 1 이상이면
 * 가드를 다시 얹는다. depth 가 0 이 되면 가드를 걷는다 → 다음 뒤로가기는 원래대로 이전 화면으로 간다.
 *
 * 가드는 늘 하나뿐이다 — 문항마다 항목을 쌓으면 위저드가 사라진 뒤(링크로 떠났다 돌아와 다시 마운트)
 * 아무 일도 안 하는 뒤로가기가 문항 수만큼 남는다. 그렇게 남은 가드 하나도 다음 마운트 때 걷는다.
 *
 * 주소 없이 pushState 하므로 Next 라우터는 상태만 복사하고 이동하지 않는다(app-router 의 pushState 패치).
 * stepBack 은 depth 가 0 보다 클 때 반드시 depth 를 줄여야 한다 — 안 줄면 가드가 다시 얹히지 않는다.
 */
import { useEffect, useRef } from "react";

const GUARD_KEY = "__irangWizardGuard";

function isGuardState(state: unknown): boolean {
  return typeof state === "object" && state !== null && GUARD_KEY in state;
}

export function useWizardBackGuard(depth: number, stepBack: () => void): void {
  /** 가드가 지금 history 맨 위에 있는가 */
  const guardRef = useRef(false);
  /** 우리가 history.back() 으로 가드를 걷는 중 — 그 popstate 는 한 단계 뒤로가 아니다 */
  const skipPopRef = useRef(false);
  const stepBackRef = useRef(stepBack);

  useEffect(() => {
    stepBackRef.current = stepBack;
  });

  useEffect(() => {
    // 앞선 위저드가 남긴 가드 위에서 다시 마운트됐다(결과 화면 링크로 떠났다가 뒤로가기로 돌아옴) — 걷어 둔다.
    // skipPopRef 확인은 개발 모드 StrictMode 의 effect 두 번 실행에서 뒤로가기를 두 번 하지 않게 한다
    if (!skipPopRef.current && isGuardState(window.history.state)) {
      skipPopRef.current = true;
      window.history.back();
    }

    const onPopState = () => {
      if (skipPopRef.current) {
        skipPopRef.current = false;
        return;
      }
      if (!guardRef.current) return; // 가드가 없을 때의 뒤로가기는 우리 몫이 아니다
      guardRef.current = false; // 브라우저가 가드를 꺼냈다
      stepBackRef.current();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (depth > 0 && !guardRef.current) {
      window.history.pushState({ [GUARD_KEY]: true }, "");
      guardRef.current = true;
    } else if (depth === 0 && guardRef.current) {
      guardRef.current = false;
      skipPopRef.current = true;
      window.history.back();
    }
  }, [depth]);
}
