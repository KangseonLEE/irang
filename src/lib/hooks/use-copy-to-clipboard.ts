"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseCopyToClipboardOptions {
  /** copied=true 상태 지속 시간 (ms). 기본 2000. 0이면 자동 reset 안 함 */
  timeout?: number;
  /** 복사 성공 시 콜백 */
  onCopy?: (text: string) => void;
  /** 복사 실패 시 콜백 */
  onError?: (error: unknown) => void;
}

interface UseCopyToClipboardReturn {
  /** 직전 copy 호출이 성공했는지. timeout 후 자동 false */
  copied: boolean;
  /** 텍스트를 클립보드에 복사. clipboard API 실패 시 execCommand fallback */
  copy: (text: string) => Promise<boolean>;
  /** copied 상태 수동 reset */
  reset: () => void;
}

/**
 * 클립보드 복사 hook.
 * - navigator.clipboard.writeText 우선 시도
 * - 실패 시 textarea + document.execCommand("copy") fallback (구형 브라우저·iOS Safari 일부)
 * - 복사 성공 후 timeout ms 동안 copied=true 유지 → 자동 false
 */
export function useCopyToClipboard(
  options?: UseCopyToClipboardOptions,
): UseCopyToClipboardReturn {
  const { timeout = 2000, onCopy, onError } = options ?? {};
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setCopied(false);
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let ok = false;
      try {
        if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          ok = true;
        } else {
          ok = legacyCopy(text);
        }
      } catch (err) {
        // clipboard API 거부 시 fallback 1회 시도
        ok = legacyCopy(text);
        if (!ok) {
          onError?.(err);
          return false;
        }
      }

      if (ok) {
        setCopied(true);
        onCopy?.(text);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (timeout > 0) {
          timerRef.current = setTimeout(() => {
            setCopied(false);
            timerRef.current = null;
          }, timeout);
        }
      }
      return ok;
    },
    [timeout, onCopy, onError],
  );

  return { copied, copy, reset };
}

function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
