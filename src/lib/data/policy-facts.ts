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
  /** 금리 표기 — 보조금24 154300000011(최종수정 2026.08.14) '창업 3억 원(한도), 2.0% / 주택 7.5천만 원(한도), 2.0%' */
  interestRate: fact("연 2.0%", "보조금24 귀농 농업창업 및 주택구입지원 사업(154300000011)", "2026-10-10"),
  /** 상환 조건 */
  repayment: fact("5년 거치 10년 상환", "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-09-28"),
  /** 교육 이수 자격 (시간) */
  minEducationHours: fact(8, "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-08-29"),
  /** 이 시간 미만이면 심사 최저 등급(D) */
  lowestGradeBelowHours: fact(100, "농림축산식품부 귀농 농업창업 및 주택구입 지원사업 시행지침(정부24)", "2026-08-29"),
  /** 신청 기간 원칙 — 실제 기간은 시·군마다 조금씩 다름 */
  applicationWindow: fact(
    "상반기 1월 1일~2월 10일, 하반기 6월 1일~7월 10일",
    "보조금24 귀농 농업창업 및 주택구입지원 사업(154300000011)",
    "2026-10-10",
  ),
  /** 접수처 — 방문 접수 */
  applyOffice: fact(
    "시·군 귀농귀촌 담당 부서(농업기술센터나 시청 부서)",
    "보조금24 귀농 농업창업 및 주택구입지원 사업(154300000011)",
    "2026-10-10",
  ),
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
  /** 신청 경로 — 2025년 1차(2026년 대상)는 Agrix, 2026년 6~7월 2차부터 차세대 시스템 농업e지(RDA 똑똑청년농부 sId=46862 '온라인 접수(농업e지) * 방문접수 아님') */
  applyChannel: fact("농업e지(nongupez.go.kr) 온라인 전용", "농촌진흥청 똑똑청년농부 2026년 2차 모집 공고(sId=46862)", "2026-10-10"),
  /** 농고·농대 미졸업자 서류평가 교육 이수 배점 만점 기준 (시간) — 자격 요건 아님 */
  educationFullScoreHours: fact(100, "농림축산식품부 청년농업인 영농정착지원사업 시행지침(찾기쉬운 생활법령 대조)", "2026-08-29"),
  /** 2026년 대상자 1차 선발 접수 기간 — 서울특별시농업기술센터 공고 제2025-63호 */
  firstRound2026: fact("2025년 11월 5일~12월 11일", "서울특별시농업기술센터 공고 제2025-63호", "2026-10-10"),
} as const;

/** SP-013 우수후계농업경영인 선발 및 육성자금 (융자) — 서울특별시농업기술센터 공고 제2026-24호 */
export const EXCELLENT_SUCCESSOR = {
  /** 대출 한도 (만 원) */
  maxManwon: fact(20000, "서울특별시농업기술센터 공고 제2026-24호", "2026-10-10"),
  interestRate: fact("연 1.5% 고정금리", "서울특별시농업기술센터 공고 제2026-24호", "2026-10-10"),
  repayment: fact("5년 거치 10년 상환", "서울특별시농업기술센터 공고 제2026-24호", "2026-10-10"),
  /** 전국 선발 인원 (시·도별 배정 없음) */
  quota: fact(500, "서울특별시농업기술센터 공고 제2026-24호", "2026-10-10"),
  /** 2026년 접수 기간 */
  period2026: fact("3월 23일~4월 15일", "서울특별시농업기술센터 공고 제2026-24호", "2026-10-10"),
} as const;

/** 귀산촌인 창업·주택구입 융자 (산림청) — 산림청 귀산촌 정착지원 안내(cmsId=FC_000434) */
export const FOREST_VILLAGE_LOAN = {
  startupMaxManwon: fact(30000, "산림청 귀산촌 정착지원 안내", "2026-10-10"),
  housingMaxManwon: fact(7500, "산림청 귀산촌 정착지원 안내", "2026-10-10"),
  interestRate: fact("연 2%", "산림청 귀산촌 정착지원 안내", "2026-10-10"),
  repayment: fact("5년 거치 10년 분할 상환", "산림청 귀산촌 정착지원 안내", "2026-10-10"),
  /** 5년 이내 이수 시간 (주택구입·국산목조주택 신축 자금은 교육 불필요) */
  educationHours: fact(60, "산림청 귀산촌 정착지원 안내", "2026-10-10"),
  applyOffice: fact("귀산촌 예정지 관할 산림조합", "산림청 귀산촌 정착지원 안내", "2026-10-10"),
  applicationWindow: fact("상반기 2~3월 · 하반기 6~7월", "산림청 귀산촌 정착지원 안내", "2026-10-10"),
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
  /** "농업창업 최대 3억 원·주택구입 최대 7,500만 원 융자(연 2.0%, 5년 거치 10년 상환)" */
  returnFarmLoan: `농업창업 최대 ${formatManwon(RETURN_FARM_LOAN.startupMaxManwon.value)}·주택구입 최대 ${formatManwon(RETURN_FARM_LOAN.housingMaxManwon.value)} 융자(${RETURN_FARM_LOAN.interestRate.value}, ${RETURN_FARM_LOAN.repayment.value})`,
  /** "1년차 월 110만 원·2년차 100만 원·3년차 90만 원" */
  youthMonthly: (() => {
    const [a, b, c] = YOUTH_SETTLEMENT.monthlyManwonByYear.value;
    return `1년차 월 ${a}만 원·2년차 ${b}만 원·3년차 ${c}만 원`;
  })(),
  /** "3억 원" — 귀농 농업창업자금 한도 */
  returnFarmStartupMax: formatManwon(RETURN_FARM_LOAN.startupMaxManwon.value),
  /** "7,500만 원" — 귀농 주택구입자금 한도 */
  returnFarmHousingMax: formatManwon(RETURN_FARM_LOAN.housingMaxManwon.value),
  /** "월 최대 110만 원" — 청년 영농정착지원금 1년차 */
  youthMonthlyMax: `월 최대 ${YOUTH_SETTLEMENT.monthlyManwonByYear.value[0]}만 원`,
  /** "만 39세 이하" */
  youthAgeMaxLabel: `만 ${YOUTH_SETTLEMENT.ageRange.value[1]}세 이하`,
  /** "최대 2억 원 (연 1.5% 고정금리, 5년 거치 10년 상환)" */
  excellentSuccessorLoan: `최대 ${formatManwon(EXCELLENT_SUCCESSOR.maxManwon.value)} (${EXCELLENT_SUCCESSOR.interestRate.value}, ${EXCELLENT_SUCCESSOR.repayment.value})`,
  /** "영농 교육 8시간 이상(100시간 미만은 심사 최저 등급)" */
  educationRequirement: `영농 교육 ${RETURN_FARM_LOAN.minEducationHours.value}시간 이상(${RETURN_FARM_LOAN.lowestGradeBelowHours.value}시간 미만은 심사 최저 등급)`,
} as const;
