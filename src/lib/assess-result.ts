/**
 * 진단 v2.0 — 결과 ID 생성 + Supabase 저장/조회
 *
 * - nanoid 12자로 URL-friendly 결과 ID 생성
 * - API Route 경유로 Supabase에 저장 (service_role only)
 * - 공유 랜딩 페이지에서 결과 조회
 */

import { nanoid } from "nanoid";
import type { Answers, FarmTypeId } from "@/lib/data/match-questions";

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
  answers: Answers;
  farm_type_id: FarmTypeId;
  top_regions: string[];
  top_crops: string[];
  recommended_programs: string[];
  referrer: string | null;
}

export interface AssessmentResultRow extends AssessmentResultPayload {
  created_at: string;
}

// ── 결과 저장 (클라이언트 → API Route 경유) ──

export async function saveAssessmentResult(
  payload: AssessmentResultPayload
): Promise<{ success: boolean; id: string; error?: string }> {
  try {
    const res = await fetch("/api/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

// ── 결과 조회 (서버/클라이언트 공용) ──

export async function fetchAssessmentResult(
  id: string,
  baseUrl?: string
): Promise<AssessmentResultRow | null> {
  if (!isValidResultId(id)) return null;

  try {
    const url = baseUrl
      ? `${baseUrl}/api/assess/${id}`
      : `/api/assess/${id}`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = await res.json();
    return data as AssessmentResultRow;
  } catch {
    return null;
  }
}
