/* ==========================================================================
   귀농·귀산촌 추진체계 비교표 데이터
   출처: 농림축산식품부 귀농어귀촌 종합지원 체계 + 산림청 귀산촌 지원사업
   정착 단계(창업·주택구입)까지 포함된 정책 요약
   ========================================================================== */

import {
  FOREST_VILLAGE_LOAN,
  POLICY_TEXT,
  RETURN_FARM_LOAN,
  formatManwon,
} from "./policy-facts";

type TrackId = "farming" | "forestry";

export interface TrackRow {
  field:
    | "age"
    | "education"
    | "businessPeriod"
    | "supportScope"
    | "supportAmount"
    | "loanTerms"
    | "applyTo";
  label: string;
}

export interface TrackData {
  id: TrackId;
  name: string;
  shortName: string;
  agency: string;
  /** 비교 필드 → 값 */
  values: Record<TrackRow["field"], string>;
  /** 공식 출처 링크 */
  sourceUrl: string;
}

export const TRACK_FIELDS: TrackRow[] = [
  { field: "age", label: "나이" },
  { field: "education", label: "교육이수" },
  { field: "businessPeriod", label: "사업기간" },
  { field: "supportScope", label: "지원분야" },
  { field: "supportAmount", label: "지원금액" },
  { field: "loanTerms", label: "상환조건" },
  { field: "applyTo", label: "신청기관" },
];

export const TRACKS: TrackData[] = [
  {
    id: "farming",
    name: "귀농",
    shortName: "귀농",
    agency: "농림축산식품부",
    values: {
      age: "창업 만 65세 이하 · 주택구입 나이 제한 없음",
      // 10/10: '8시간 ~ 250시간'의 250시간은 원문 근거 없음 — 자격·심사 기준으로
      education: POLICY_TEXT.educationRequirement,
      businessPeriod: "전업 기준 5년",
      supportScope: "영농기반, 농식품 제조·가공 시설, 주택 구입(신축·증개축)",
      supportAmount: `창업 ${POLICY_TEXT.returnFarmStartupMax} · 주택 ${POLICY_TEXT.returnFarmHousingMax} 이내`,
      loanTerms: `${RETURN_FARM_LOAN.interestRate.value}, ${RETURN_FARM_LOAN.repayment.value}`,
      applyTo: RETURN_FARM_LOAN.applyOffice.value,
    },
    sourceUrl: "https://www.greendaero.go.kr",
  },
  {
    id: "forestry",
    name: "귀산촌",
    shortName: "귀산촌",
    agency: "산림청",
    values: {
      // 10/10: '창업 만 70세 이하'·'60~120시간'은 산림청 안내 원문에 없었다(gov-roadmap 8/29 대조값과도 달랐다)
      age: "산림청 안내에 연령 조건 없음 (세부는 산림조합 확인)",
      education: `5년 이내 ${FOREST_VILLAGE_LOAN.educationHours.value}시간 이상 (주택구입·목조주택 신축은 교육 불필요)`,
      businessPeriod: "전입 기준 5년",
      supportScope: "임산물 생산자금, 임야 매입자금, 정착지원(주택)",
      supportAmount: `창업 ${formatManwon(FOREST_VILLAGE_LOAN.startupMaxManwon.value)} · 주택 ${formatManwon(FOREST_VILLAGE_LOAN.housingMaxManwon.value)} 이내`,
      loanTerms: `${FOREST_VILLAGE_LOAN.interestRate.value}, ${FOREST_VILLAGE_LOAN.repayment.value}`,
      applyTo: FOREST_VILLAGE_LOAN.applyOffice.value,
    },
    sourceUrl: "https://www.forest.go.kr",
  },
];

/** 마지막 정책 검증일 — 수치 변동 시 갱신 */
export const TRACK_LAST_VERIFIED = "2026-10-10";
