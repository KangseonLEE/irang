/**
 * 여러 화면이 함께 인용하는 정책 사실 — 단일 출처 (2026-10-10)
 *
 * 왜: 10/10 전수 목록화에서 한 사업의 같은 사실(한도·금리·지원금·교육 시간)이 사업 데이터·신청 가이드·진단 문구·
 * 용어 사전·비용 화면·FAQ·DB 에 최대 7곳 따로 적혀 있었고, 정정이 한두 곳에만 반영돼 어긋났다(금리 연 2% vs 1.5%,
 * 9/28 정정 미전파 등). 이제 숫자는 여기 한 곳에만 두고 다른 화면은 import 해서 문장을 만든다.
 *
 * 규칙: 값을 바꿀 땐 원문을 다시 대조하고 verifiedAt·source 를 함께 고친다. 화면 문자열에 같은 숫자를 직접 쓰지 않는다
 * (src/__tests__/policy-facts.test.ts 가 중복 하드코딩을 잡는다).
 */

export interface PolicyFact<T> {
  value: T;
  /** 원문 이름 */
  source: string;
  /** 원문 대조일 (YYYY-MM-DD) */
  verifiedAt: string;
}

const fact = <T>(value: T, source: string, verifiedAt: string): PolicyFact<T> => ({ value, source, verifiedAt });

/** SP-001 귀농 농업창업 및 주택구입 지원사업 (융자) */
export const RETURN_FARM_LOAN = {
  /** 농업창업자금 한도 (만 원) */
  startupMaxManwon: fact(30000, "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-09-28"),
  /** 주택구입자금 한도 (만 원) */
  housingMaxManwon: fact(7500, "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-09-28"),
  /** 금리 표기 */
  interestRate: fact("연 2% 이내", "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-09-28"),
  /** 상환 조건 */
  repayment: fact("5년 거치 10년 상환", "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-09-28"),
  /** 교육 이수 자격 (시간) */
  minEducationHours: fact(8, "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-08-29"),
  /** 이 시간 미만이면 심사 최저 등급(D) */
  lowestGradeBelowHours: fact(100, "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-08-29"),
} as const;

/** SP-002 청년농업인 영농정착지원사업 (보조금) */
export const YOUTH_SETTLEMENT = {
  /** 연차별 월 지원금 (만 원) — 1·2·3년차 */
  monthlyManwonByYear: fact([110, 100, 90] as const, "농림축산식품부 청년농업인 영농정착지원사업 시행지침", "2026-09-28"),
  /** 연령 (만) */
  ageRange: fact([18, 39] as const, "농림축산식품부 청년농업인 영농정착지원사업 시행지침", "2026-09-28"),
  /** 영농 경력 상한 (년) */
  maxFarmingYears: fact(3, "농림축산식품부 청년농업인 영농정착지원사업 시행지침", "2026-09-28"),
  /** 신청 경로 */
  applyChannel: fact("농림사업정보시스템(Agrix) 온라인 전용", "농림축산식품부 청년농업인 영농정착지원사업 시행지침", "2026-09-28"),
} as const;

/** "3억 원" 처럼 만 원 단위를 억·만 원 표기로 */
export function formatManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000);
  const rest = manwon % 10000;
  if (eok > 0 && rest === 0) return `${eok}억 원`;
  if (eok > 0) return `${eok}억 ${rest.toLocaleString("ko-KR")}만 원`;
  return `${manwon.toLocaleString("ko-KR")}만 원`;
}

/** 자주 쓰는 문장 조각 */
export const POLICY_TEXT = {
  /** "농업창업 최대 3억 원·주택구입 최대 7,500만 원 융자(연 2% 이내, 5년 거치 10년 상환)" */
  returnFarmLoan: `농업창업 최대 ${formatManwon(RETURN_FARM_LOAN.startupMaxManwon.value)}·주택구입 최대 ${formatManwon(RETURN_FARM_LOAN.housingMaxManwon.value)} 융자(${RETURN_FARM_LOAN.interestRate.value}, ${RETURN_FARM_LOAN.repayment.value})`,
  /** "1년차 월 110만 원·2년차 100만 원·3년차 90만 원" */
  youthMonthly: (() => {
    const [a, b, c] = YOUTH_SETTLEMENT.monthlyManwonByYear.value;
    return `1년차 월 ${a}만 원·2년차 ${b}만 원·3년차 ${c}만 원`;
  })(),
  /** "영농 교육 8시간 이상(100시간 미만은 심사 최저 등급)" */
  educationRequirement: `영농 교육 ${RETURN_FARM_LOAN.minEducationHours.value}시간 이상(${RETURN_FARM_LOAN.lowestGradeBelowHours.value}시간 미만은 심사 최저 등급)`,
} as const;
