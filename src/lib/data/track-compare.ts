/* ==========================================================================
   귀농·귀산촌 추진체계 비교표 데이터
   출처: 농림축산식품부 귀농어귀촌 종합지원 체계 + 산림청 귀산촌 지원사업
   정착 단계(창업·주택구입)까지 포함된 정책 요약
   ========================================================================== */

export type TrackId = "farming" | "forestry";

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
      education: "최근 5년 내 8시간 ~ 250시간",
      businessPeriod: "전업 기준 5년",
      supportScope: "영농기반, 농식품 제조·가공 시설, 주택 구입(신축·증개축)",
      supportAmount: "창업 3억 7,500만원 이내",
      loanTerms: "금리 2%, 5년 거치 10년 원금균등분할상환",
      applyTo: "주소지 관할 시·군청",
    },
    sourceUrl: "https://www.greendaero.go.kr",
  },
  {
    id: "forestry",
    name: "귀산촌",
    shortName: "귀산촌",
    agency: "산림청",
    values: {
      age: "창업 만 70세 이하 · 주택구입 나이 제한 없음",
      education: "최근 5년 내 60시간 ~ 120시간",
      businessPeriod: "전입 기준 5년",
      supportScope: "임산물 생산자금, 임야 매입자금, 정착지원(주택)",
      supportAmount: "창업 3억원 이내",
      loanTerms: "금리 2%, 5년 거치 10년 원금균등분할상환",
      applyTo: "사업장 관할 군 산림조합",
    },
    sourceUrl: "https://www.forest.go.kr",
  },
];

/** 마지막 정책 검증일 — 수치 변동 시 갱신 */
export const TRACK_LAST_VERIFIED = "2026-04-15";
