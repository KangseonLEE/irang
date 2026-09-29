"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import s from "./confirm-dialog.module.css";

/**
 * 공용 확인·알림 다이얼로그 (2026-09-29 회장: "브라우저 팝업 대신 자체 alert 을 공통으로").
 *
 * **`window.confirm` / `window.alert` / `window.prompt` 는 쓰지 않는다** — 브랜드 밖 OS 팝업이고,
 * 모달 위에서 포커스·스크롤 잠금과 충돌하며, 문구 톤(카피 규칙)도 맞출 수 없다.
 * 대신 어디서든 `const { confirm, alert } = useDialog()` 로 부른다.
 *
 *   if (await confirm({ title: "최근 검색어를 모두 지울까요?", tone: "danger" })) { … }
 *   await alert({ title: "전송했어요" });
 *
 * 공용 `Modal` 을 재사용하지 않는 이유: 검색 모달 **안에서도** 확인을 띄워야 하는데,
 * Modal 은 body 스크롤 잠금을 스스로 걸고 풀어서 중첩하면 안쪽이 닫힐 때 바깥 모달의 잠금까지
 * 되돌린다. 이 다이얼로그는 스크롤을 건드리지 않는 **독립 포털 레이어**(z 210)다.
 */

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** danger — 되돌릴 수 없는 동작. 브랜드 팔레트 안에서 딥그린 채움으로 강조한다(붉은색 미사용) */
  tone?: "default" | "danger";
  icon?: LucideIcon;
}

interface AlertOptions {
  title: string;
  description?: string;
  okLabel?: string;
  icon?: LucideIcon;
}

interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const noopConfirm = async () => false;
const noopAlert = async () => {};

const DialogContext = createContext<DialogContextValue>({
  confirm: noopConfirm,
  alert: noopAlert,
});

export function useDialog(): DialogContextValue {
  return useContext(DialogContext);
}

type DialogState =
  | null
  | ({ kind: "confirm"; resolve: (v: boolean) => void } & ConfirmOptions)
  | ({ kind: "alert"; resolve: () => void } & AlertOptions);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(null);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  /* 현재 열린 다이얼로그 — resolve 는 업데이터 밖에서 정확히 1회(StrictMode 이중 호출 방지, 9/29 QA) */
  const stateRef = useRef<DialogState | null>(null);

  const close = useCallback((result: boolean) => {
    const cur = stateRef.current;
    if (!cur) return;
    stateRef.current = null;
    if (cur.kind === "confirm") cur.resolve(result);
    else cur.resolve();
    setState(null);
  }, []);

  /* 배경 스크롤 잠금 — 공용 Modal 위(body fixed)면 그 잠금을 그대로 쓰고, 단독(현장 이야기 신고 등)일 때만
     html overflow 를 잠근다(9/29 QA: 모달 밖 경로에서 배경이 400px 스크롤됐다) */
  useEffect(() => {
    if (!state) return;
    if (getComputedStyle(document.body).position === "fixed") return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [state]);

  /* 닫힌 뒤 원래 있던 곳으로 포커스 복귀 — preventScroll 로 화면이 튀지 않게 */
  useEffect(() => {
    if (state) return;
    const el = returnFocusRef.current;
    returnFocusRef.current = null;
    el?.focus({ preventScroll: true });
  }, [state]);

  /* 열릴 때: 파괴적 확인은 **취소**에 포커스(실수 방지 관례), 알림은 확인 버튼 */
  useEffect(() => {
    if (!state) return;
    const target = state.kind === "confirm" ? cancelRef.current : confirmRef.current;
    const raf = requestAnimationFrame(() => target?.focus());
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const api = useMemo<DialogContextValue>(
    () => ({
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          if (stateRef.current) return resolve(false); // 이미 열려 있으면 거절 — 앞선 Promise 가 영구 pending 이 되지 않게
          returnFocusRef.current = document.activeElement as HTMLElement | null;
          const next: DialogState = { kind: "confirm", resolve, ...options };
          stateRef.current = next;
          setState(next);
        }),
      alert: (options) =>
        new Promise<void>((resolve) => {
          if (stateRef.current) return resolve();
          returnFocusRef.current = document.activeElement as HTMLElement | null;
          const next: DialogState = { kind: "alert", resolve, ...options };
          stateRef.current = next;
          setState(next);
        }),
    }),
    [],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation(); // 뒤에 열린 모달까지 함께 닫히지 않게
      close(false);
    } else if (e.key === "Enter") {
      /* 포커스된 버튼을 따른다 — 취소에 포커스된 채 Enter 면 취소(9/29 QA: 무조건 확정이면 파괴적) */
      e.preventDefault();
      close(document.activeElement !== cancelRef.current);
    } else if (e.key === "Tab") {
      // 두 버튼 사이 포커스 트랩
      const focusables = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
      if (focusables.length < 2) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const Icon = state?.icon;

  return (
    <DialogContext.Provider value={api}>
      {children}
      {mounted && state
        ? createPortal(
            <div
              className={s.overlay}
              /* 바깥 클릭 감지 훅들이 "다이얼로그 안 클릭"을 외부 클릭으로 오해하지 않게 하는 표식.
                 포털이라 DOM 상으론 항상 남의 바깥이다 — 검색 드롭다운이 확인 중에 닫히던 것(9/29 실측) */
              data-irang-dialog=""
              onClick={(e) => {
                if (e.target === e.currentTarget) close(false);
              }}
            >
              <div
                ref={panelRef}
                className={s.panel}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="irang-dialog-title"
                aria-describedby={state.description ? "irang-dialog-desc" : undefined}
                onKeyDown={onKeyDown}
                tabIndex={-1}
              >
                {Icon && (
                  <span className={s.icon} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                )}
                <h2 id="irang-dialog-title" className={s.title}>
                  {state.title}
                </h2>
                {state.description && (
                  <p id="irang-dialog-desc" className={s.desc}>
                    {state.description}
                  </p>
                )}
                <div className={s.actions}>
                  {state.kind === "confirm" && (
                    <button
                      ref={cancelRef}
                      type="button"
                      className={s.cancel}
                      onClick={() => close(false)}
                    >
                      {state.cancelLabel ?? "취소"}
                    </button>
                  )}
                  <button
                    ref={confirmRef}
                    type="button"
                    className={`${s.confirm} ${
                      state.kind === "confirm" && state.tone === "danger" ? s.confirmDanger : ""
                    }`}
                    onClick={() => close(true)}
                  >
                    {state.kind === "confirm"
                      ? (state.confirmLabel ?? "삭제")
                      : (state.okLabel ?? "확인")}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </DialogContext.Provider>
  );
}
