import type { VarietyIncome } from "@/lib/data/crops";

/**
 * "10a당 약 511만 원 (...)" / "10a당 약 116~260만 원" / "10a당 약 1,069만 원"
 * → 10a당 대표 소득(만 원, 숫자) 추출. 범위는 상한값 채택.
 * 파싱 실패 시 null (호출부에서 텍스트 fallback 판정에 사용).
 *
 * 순수 함수 — Server Component(page.tsx)에서 사전 판정에 직접 호출 가능.
 */
export function parseVarietyRevenueMan(raw: string | undefined): number | null {
  if (!raw) return null;
  // 괄호(연 환산 등) 앞부분만 사용 — 10a당 값 우선
  const head = raw.split("(")[0];
  // "116~260만 원" → [116, 260], "1,069만 원" → [1069]
  const manMatch = head.match(/([\d,]+)(?:\s*~\s*([\d,]+))?\s*만\s*원/);
  if (!manMatch) return null;
  const lo = Number(manMatch[1].replace(/,/g, ""));
  const hi = manMatch[2] ? Number(manMatch[2].replace(/,/g, "")) : lo;
  const val = Number.isFinite(hi) ? hi : lo;
  return Number.isFinite(val) && val > 0 ? val : null;
}

/**
 * varieties 중 revenueRange가 숫자로 파싱되는 항목이 2개 이상이면 차트 가능.
 * 1개 이하면 비교 의미가 없어 텍스트 fallback.
 */
export function canRenderVarietiesChart(
  varieties: VarietyIncome[] | undefined,
): boolean {
  if (!varieties || varieties.length < 2) return false;
  const parseable = varieties.filter(
    (v) => parseVarietyRevenueMan(v.revenueRange) !== null,
  );
  return parseable.length >= 2;
}
