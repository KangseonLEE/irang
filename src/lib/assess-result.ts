/**
 * 진단 v2.0 — 결과 ID 생성 + Supabase 저장/조회
 *
 * - nanoid 12자로 URL-friendly 결과 ID 생성
 * - API Route 경유로 Supabase에 저장 (service_role only)
 * - 공유 랜딩 페이지에서 결과 조회
 */

import { nanoid } from "nanoid";
import type { Answers, FarmTypeId } from "@/lib/data/match-questions";
import { internalRequestHeaders } from "@/lib/internal-traffic";
import { readAssessEntry } from "@/lib/assess-entry";

// ── 결과 ID 생성 ──

/** nanoid 12자 — URL-friendly, 충돌 확률 극히 낮음 */
export function generateResultId(): string {
  return nanoid(12);
}

/** nanoid 12자 형식 검증 (영숫자 + _-) */
export function isValidResultId(id: string): boolean {
  return /^[A-Za-z0-9_-]{12}$/.test(id);
}

// ── 결과 데이터 타입 ──

export interface AssessmentResultPayload {
  id: string;
  answers: Answers | Record<string, unknown>;
  /** Quick wizard 적재 시 farm_type_id는 선택 (persona가 대체) */
  farm_type_id?: FarmTypeId;
  top_regions: string[];
  top_crops: string[];
  recommended_programs: string[];
  referrer: string | null;
  /** 위저드 demoAnswers.ageGroup — /assess/result/[id] 페르소나 추천에 사용 */
  age_group?: string | null;
  /** 'full'=14문항 정식 / 'quick'=4문항 가벼운 점검 (2026-05-18 추가) */
  source?: "full" | "quick";
  /** Quick wizard가 매핑한 페르소나 ID (5종) */
  persona?: string | null;
}

/**
 * 저장 직전 보강 (2026-10-20): 진입 기록(entry_from·entry_path)을 붙이고, referrer 가 비면 document.referrer.
 * 빠른 점검은 referrer 를 보내지 않았고 매칭은 utm_source 만 보내 바깥 유입이 '직접'으로 몰렸다.
 */
function withEntryContext(payload: AssessmentResultPayload) {
  const docReferrer = typeof document !== "undefined" && document.referrer ? document.referrer : null;
  return { ...payload, referrer: payload.referrer ?? docReferrer, ...readAssessEntry() };
}

// ── 결과 저장 (클라이언트 → API Route 경유) ──

export async function saveAssessmentResult(
  payload: AssessmentResultPayload
): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const res = await fetch("/api/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...internalRequestHeaders() },
      body: JSON.stringify(withEntryContext(payload)),
    });

    if (res.status === 429) {
      return { success: false, id: payload.id, error: "too_many_requests" };
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        success: false,
        id: payload.id,
        error: body.error || "save_failed",
      };
    }

    return { success: true, id: payload.id };
  } catch {
    return { success: false, id: payload.id, error: "network_error" };
  }
}
