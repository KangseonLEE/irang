/** 홍보 팝업 관리 API 공통 응답 (라우트 파일이 아니라 헬퍼 — `_` 접두라 라우트로 잡히지 않는다) */

import { NextResponse } from "next/server";
import type { PromoFallbackReason } from "@/lib/promos/queries";

export const NO_STORE = { "Cache-Control": "private, no-store" } as const;

const STATUS: Record<PromoFallbackReason, number> = {
  "no-supabase": 503,
  "migration-pending": 503,
  "db-error": 500,
};

const MESSAGE: Record<PromoFallbackReason, string> = {
  "no-supabase": "Supabase 설정이 없어요. 환경변수를 확인해 주세요.",
  "migration-pending": "promo_popups 마이그레이션이 아직 적용되지 않았어요.",
  "db-error": "저장소 오류가 났어요.",
};

/**
 * 폴백 사유를 그대로 상태코드로 옮긴다.
 * 5/26 silent 202 교훈 — 관리자 화면에서 실패를 성공처럼 포장하지 않는다.
 */
export function promoErrorResponse(result: { reason: PromoFallbackReason; message?: string }) {
  return NextResponse.json(
    { error: result.reason, message: MESSAGE[result.reason], detail: result.message },
    { status: STATUS[result.reason], headers: NO_STORE },
  );
}
