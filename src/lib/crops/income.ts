import { CROP_INCOME_SURVEY } from "@/lib/data/crop-income-source";
import { parseIncome10a } from "@/lib/format";

/**
 * 작물 소득이 공식 통계인지 (2026-10-10).
 *
 * 공식 = 농촌진흥청 「2025년도 농산물 소득 조사」(crop-income-source.ts 원표와 테스트로 대조) 또는
 * 국가데이터처(통계청) 농축산물생산비조사(쌀·콩·마늘·양파, 작물 상세가 KOSIS 에서 다시 읽는다).
 * 그 밖은 '추정'으로 적혀 있고 검색 결과 설명·정렬·출처 배지에 소득 기관 이름을 쓰지 않는다.
 */
const COST_SURVEY_PREFIX = /^(통계청|국가데이터처) 농축산물생산비조사/;

/** 공식 소득이면 출처 문자열 첫머리의 기관 이름("농촌진흥청"·"통계청"·"국가데이터처"), 아니면 null */
export function officialIncomeAgency(source?: string): string | null {
  const s = source?.trim() ?? "";
  if (s.startsWith(CROP_INCOME_SURVEY.source)) return "농촌진흥청";
  return s.match(COST_SURVEY_PREFIX)?.[1] ?? null;
}

/** 공식 소득일 때만 10a당 만 원, 아니면 null */
export function officialIncome10a(income: { revenueRange: string; source?: string }): number | null {
  return officialIncomeAgency(income.source) ? parseIncome10a(income.revenueRange) : null;
}

/**
 * 공식 소득의 머리 숫자 그대로 — "10a당 약 1,260~1,642만 원 (…)" → "1,260~1,642", 아니면 null.
 * 범위를 가운데 값으로 바꾸지 않는다(가운데 값은 원표에 없는 숫자다).
 */
export function officialIncomeFigure(income: { revenueRange: string; source?: string }): string | null {
  if (!officialIncomeAgency(income.source)) return null;
  return income.revenueRange.match(/^10a당\s*약\s*([\d,]+(?:\s*~\s*[\d,]+)?)\s*만\s*원/)?.[1].replace(/\s+/g, "") ?? null;
}
