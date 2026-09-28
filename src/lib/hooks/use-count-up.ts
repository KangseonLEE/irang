import { useEffect, useRef, useState } from "react";

/**
 * 숫자 카운트업 훅 — "1,234만", "3.2배", "48건" 처럼 접두·접미가 붙은 표기를 그대로 유지하면서
 * 숫자 부분만 0 → 값으로 센다. (2026-09-28: trend-cost-section 로컬 구현을 공용으로 승격)
 *
 * - 초기 반환값은 항상 최종 표기 → 서버 렌더 HTML·JS 차단 환경에서도 숫자가 보인다(SEO·접근성).
 * - `prefers-reduced-motion: reduce` 면 애니메이션 없이 최종값 유지.
 * - 자리수·소수점·콤마는 원본 표기에서 역산한다(Intl 대신 원본 포맷 보존).
 */

interface Parsed {
  prefix: string;
  num: number;
  suffix: string;
}

function parseNumeric(raw: string): Parsed | null {
  const m = raw.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!m) return null;
  return { prefix: m[1], num: parseFloat(m[2].replace(/,/g, "")), suffix: m[3] };
}

function formatBack(num: number, original: string): string {
  const parsed = parseNumeric(original);
  if (!parsed) return original;
  const plain = original.replace(/,/g, "");
  const dotIdx = plain.indexOf(".");
  const decimals = dotIdx >= 0 ? plain.length - dotIdx - 1 : 0;
  const fixed = num.toFixed(decimals);
  const [intPart, decPart] = fixed.split(".");
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${parsed.prefix}${withComma}${decPart ? `.${decPart}` : ""}${parsed.suffix}`;
}

export function useCountUp(target: string, trigger: boolean, duration = 800): string {
  const [display, setDisplay] = useState(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const parsed = parseNumeric(target);
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!parsed || reduced) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(formatBack(parsed.num * eased, target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
      else setDisplay(target);
    };
    setDisplay(formatBack(0, target));
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, trigger, duration]);

  return display;
}
