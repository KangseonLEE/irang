import { useEffect, useState, type RefObject } from "react";

/** 포커스 링(2px) + outline-offset(2px) — 요소 상자 밖으로 이만큼 그려진다 */
const FOCUS_RING = 4;

/**
 * 키보드 포커스가 화면에 떠 있는 고정 위젯(피드백·맨 위로)과 겹치면 `true` — 위젯은 그동안 비켜난다(투명·클릭 통과).
 *
 * 10/3 QA(WCAG 2.4.11 Focus Not Obscured): 1440 에서 푸터 '이용약관'에 Tab 하면 피드백 버튼이 41% 를 가렸다.
 * 문서 끝이라 더 내릴 수 없어 scroll-padding 으로는 못 푼다 — 랜딩 도크(hero-search-dock)처럼 focusin 에서 겹침을 재고,
 * 도크와 달리 페이지를 움직이는 대신 위젯이 물러난다. 위젯 자신에 포커스가 오면(Tab 으로 도달) 다시 보인다.
 *
 * - `:focus-visible` 만 센다 — 마우스 클릭 포커스로는 위젯이 사라지지 않는다(입력창은 클릭도 focus-visible 이라 포함).
 * - 비켜날 때 위치(transform)는 바꾸지 않는다 — 겹침을 다시 잴 때 위젯 상자가 제자리여야 한다(투명도만 바꾼다).
 * - 스크롤·리사이즈로 포커스 요소가 위젯 밑으로 들어가거나 빠져나와도 rAF 로 다시 잰다.
 *
 * @param ref      위젯 요소
 * @param enabled  위젯이 지금 보이는가 — 안 보이면(예: 맨 위로 버튼 숨김 상태) 가릴 일도 없다
 */
export function useFocusDodge(ref: RefObject<HTMLElement | null>, enabled = true): boolean {
  const [dodge, setDodge] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let settleTimer = 0;

    const measure = () => {
      raf = 0;
      setDodge(obscuresFocus(ref.current));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    const onFocusChange = () => {
      schedule();
      // 포커스 이동이 일으킨 스크롤(부드러운 스크롤 포함)이 끝난 뒤 한 번 더
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(schedule, 350);
    };

    document.addEventListener("focusin", onFocusChange);
    document.addEventListener("focusout", onFocusChange);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
    return () => {
      document.removeEventListener("focusin", onFocusChange);
      document.removeEventListener("focusout", onFocusChange);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
    };
  }, [ref, enabled]);

  return enabled && dodge;
}

/** 지금 키보드 포커스를 받은 요소가 위젯 상자(포커스 링 포함)와 겹치는가 */
function obscuresFocus(widget: HTMLElement | null): boolean {
  if (!widget) return false;
  const target = document.activeElement;
  if (!(target instanceof HTMLElement) || target === document.body || widget.contains(target)) return false;
  let keyboard = false;
  try {
    keyboard = target.matches(":focus-visible");
  } catch {
    return false;
  }
  if (!keyboard) return false;
  const w = widget.getBoundingClientRect();
  if (w.width === 0 || w.height === 0) return false; // display:none 구간(폭별 숨김)
  const r = target.getBoundingClientRect();
  return (
    r.left - FOCUS_RING < w.right &&
    r.right + FOCUS_RING > w.left &&
    r.top - FOCUS_RING < w.bottom &&
    r.bottom + FOCUS_RING > w.top
  );
}
