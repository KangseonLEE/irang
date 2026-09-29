/**
 * Edge Function 공유 타입 정의
 * - RDA API 응답 타입
 * - DB 행 삽입/업데이트 타입
 */

// ─── RDA API 응답 타입 ───

export interface RdaBaseItem {
  seq: number;
  typeDv: string;
  title: string;
  contents: string;
  applStDt: string;
  appEdDt: string;
  eduTarget: string;
  area1Nm: string;
  area2Nm: string;
  chargeAgency: string;
  chargeDept: string;
  chargeTel: string;
  infoUrl: string;
}

export interface RdaPolicyItem extends RdaBaseItem {
  typeDv: "policy";
  totQuantity: string;
  price: string;
}

export interface RdaEduItem extends RdaBaseItem {
  typeDv: "edu";
  eduStDt: string;
  eduEdDt: string;
  eduTime: string;
  eduCnt: string;
}

// ─── DB 삽입용 타입 ───

export interface ProgramInsertRow {
  slug: string;
  title: string;
  summary: string;
  /** PROVINCES.name 17종 또는 "전국" (region-normalize SSOT) */
  region: string;
  /** 원문 시·군·구 토큰 — region 정규화로 잘려 나가는 정보 보존 (20260929 마이그레이션 컬럼) */
  sigungu?: string | null;
  organization: string;
  support_type: string;
  support_amount: string;
  eligibility_age_min: number;
  eligibility_age_max: number;
  eligibility_detail: string;
  application_start: string;
  application_end: string;
  status: string;
  related_crops: string[];
  source_url: string;
  year: number;
  is_verified: boolean;
}

export interface EducationInsertRow {
  slug: string;
  title: string;
  /** PROVINCES.name 17종 또는 "전국" (region-normalize SSOT) */
  region: string;
  /** 원문 시·군·구 토큰 (20260929 마이그레이션 컬럼) */
  sigungu?: string | null;
  organization: string;
  type: string;
  duration: string;
  schedule: string;
  target: string;
  cost: string;
  description: string;
  capacity: number | null;
  application_start: string;
  application_end: string;
  status: string;
  level: string;
  url: string;
  is_verified: boolean;
}

// ─── 동기화 결과 ───

export interface SyncResult {
  ok: boolean;
  programs: { fetched: number; upserted: number };
  education: { fetched: number; upserted: number };
  statusUpdated: boolean;
  errors: string[];
}

// ─── 행사(체험) 삽입용 ───

export interface EventInsertRow {
  slug: string;
  title: string;
  /** PROVINCES.name 17종 또는 "전국" (region-normalize SSOT) */
  region: string;
  /** 원문 시·군·구 토큰 (20260929 마이그레이션 컬럼) */
  sigungu?: string | null;
  organization: string;
  type: string;
  date_start: string;
  date_end: string | null;
  application_start: string | null;
  application_end: string | null;
  location: string;
  cost: string;
  description: string;
  capacity: number | null;
  target: string;
  url: string;
  status: string;
  is_verified: boolean;
}
