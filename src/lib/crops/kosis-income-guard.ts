import { parseIncome10a } from "@/lib/format";

/**
 * 작물 상세가 KOSIS 생산비조사(쌀·콩·마늘·양파)에서 실행 중에 다시 읽은 소득을 화면에 쓸지 판정 (2026-10-10).
 *
 * 종전 가드는 `income > 0` 하나였다 — 10/8 재배면적 사고(다른 항목을 읽어 그럴듯한 숫자를 그림)와 같은 구조라,
 * 항목을 잘못 읽어도 양수면 그대로 나갔다. 하나라도 어긋나면 정적 값(원문 대조한 2024·2025년산)을 유지한다.
 *
 * 1. 연도: 전년산 또는 2년 전(생산비조사는 다음 해 발표)
 * 2. 항목 정합: 총수입 > 경영비 > 0, 소득 = 총수입 − 경영비(±1%) — 항목을 잘못 짚으면 여기서 깨진다
 * 3. 범위: 10a당 소득이 정적 값의 1/2 ~ 2배 — 단위(원↔천원)·표 오독을 잡는다
 */
export interface KosisIncomeLike {
  grossRevenue: number;
  operatingCost: number;
  income: number;
  year: number;
}

export function isPlausibleKosisIncome(
  data: KosisIncomeLike | null | undefined,
  staticRevenueRange: string,
  currentYear: number,
): data is KosisIncomeLike {
  if (!data) return false;
  const { grossRevenue, operatingCost, income, year } = data;
  if (![grossRevenue, operatingCost, income, year].every(Number.isFinite)) return false;
  if (year !== currentYear - 1 && year !== currentYear - 2) return false;
  if (!(grossRevenue > operatingCost && operatingCost > 0 && income > 0)) return false;
  if (Math.abs(grossRevenue - operatingCost - income) > grossRevenue * 0.01) return false;
  const staticMan = parseIncome10a(staticRevenueRange);
  if (staticMan === null || staticMan <= 0) return false;
  const liveMan = income / 10000; // 원 → 만 원
  return liveMan >= staticMan / 2 && liveMan <= staticMan * 2;
}
