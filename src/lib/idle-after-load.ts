/**
 * 첫 화면과 무관한 코드를 "페이지 로드가 끝나고, 조금 지나, 브라우저가 한가할 때" 받기 위한 예약 (2026-10-17, 모바일 LCP 2단계).
 *
 * `requestIdleCallback` 만 쓰면 빠른 기기에선 로드 도중에도 한가한 틈이 생겨 첫 화면 요청과 겹친다.
 * `load` 이벤트 → `delayMs` → 한가할 때(최대 `idleTimeoutMs`) 순서로 미룬다.
 * 반환값은 취소 함수 — useEffect 정리에서 부른다.
 */
type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function runWhenIdleAfterLoad(
  cb: () => void,
  { delayMs = 1500, idleTimeoutMs = 3000 }: { delayMs?: number; idleTimeoutMs?: number } = {},
): () => void {
  if (typeof window === "undefined") return () => {};
  const w = window as IdleWindow;
  let cancelled = false;
  let timerId: number | null = null;
  let idleId: number | null = null;

  const schedule = () => {
    if (cancelled) return;
    timerId = window.setTimeout(() => {
      timerId = null;
      if (cancelled) return;
      if (w.requestIdleCallback) {
        idleId = w.requestIdleCallback(() => {
          idleId = null;
          if (!cancelled) cb();
        }, { timeout: idleTimeoutMs });
      } else {
        cb();
      }
    }, delayMs);
  };

  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });

  return () => {
    cancelled = true;
    window.removeEventListener("load", schedule);
    if (timerId !== null) window.clearTimeout(timerId);
    if (idleId !== null) w.cancelIdleCallback?.(idleId);
  };
}
