/**
 * 홍보 팝업 관리 API — 목록 · 작성 (2026-09-29)
 *
 *   GET  /admin/api/promos  → { items: PromoRecord[] }
 *   POST /admin/api/promos  → { item: PromoRecord }
 *
 * 인가는 미들웨어 `/admin/*` 쿠키 가드 + `requireAdmin()` 2차 방어(9/17 보안 점검).
 */

import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { listPromos, upsertPromo, getPromo } from "@/lib/promos/queries";
import { validatePromoInput, type PromoInput } from "@/lib/promos/types";
import { promoErrorResponse, NO_STORE } from "./_respond";

export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const result = await listPromos();
  if (!result.ok) return promoErrorResponse(result);
  return NextResponse.json({ items: result.data }, { headers: NO_STORE });
}

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let body: Partial<PromoInput>;
  try {
    body = (await request.json()) as Partial<PromoInput>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  const validated = validatePromoInput(body);
  if (!validated.ok) {
    return NextResponse.json(
      { error: "validation", errors: validated.errors },
      { status: 400, headers: NO_STORE },
    );
  }

  const existing = await getPromo(validated.value.id!);
  if (existing.ok && existing.data) {
    return NextResponse.json(
      { error: "duplicate", errors: [{ field: "id", message: "이미 같은 id 의 팝업이 있어요" }] },
      { status: 409, headers: NO_STORE },
    );
  }

  const result = await upsertPromo(validated.value as PromoInput);
  if (!result.ok) return promoErrorResponse(result);

  // 랜딩은 ISR 1h — 이게 없으면 저장이 한 시간 뒤에야 보인다
  revalidatePath("/");
  return NextResponse.json({ item: result.data }, { status: 201, headers: NO_STORE });
}
