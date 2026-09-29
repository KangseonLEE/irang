/**
 * 홍보 팝업 관리 API — 수정 · 삭제 (2026-09-29)
 *
 *   PUT    /admin/api/promos/[id]  → { item: PromoRecord }   (부분 수정 가능)
 *   DELETE /admin/api/promos/[id]  → { ok: true }
 */

import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/require-admin";
import { deletePromo, getPromo, upsertPromo } from "@/lib/promos/queries";
import { validatePromoInput, toPromoInput, PROMO_ID_RE, type PromoInput } from "@/lib/promos/types";
import { promoErrorResponse, NO_STORE } from "../_respond";

export async function PUT(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!PROMO_ID_RE.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400, headers: NO_STORE });
  }

  let body: Partial<PromoInput>;
  try {
    body = (await request.json()) as Partial<PromoInput>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  const current = await getPromo(id);
  if (!current.ok) return promoErrorResponse(current);
  if (!current.data) {
    return NextResponse.json({ error: "not found" }, { status: 404, headers: NO_STORE });
  }

  // 부분 수정 — 기존 값에 덮어쓴 뒤 전체를 다시 검증한다(기간 역전 같은 교차 규칙 때문)
  const merged: Partial<PromoInput> = { ...toPromoInput(current.data), ...body, id };

  const validated = validatePromoInput(merged);
  if (!validated.ok) {
    return NextResponse.json(
      { error: "validation", errors: validated.errors },
      { status: 400, headers: NO_STORE },
    );
  }

  const result = await upsertPromo(validated.value as PromoInput);
  if (!result.ok) return promoErrorResponse(result);

  revalidatePath("/");
  return NextResponse.json({ item: result.data }, { headers: NO_STORE });
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const { id } = await ctx.params;
  if (!PROMO_ID_RE.test(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400, headers: NO_STORE });
  }

  const result = await deletePromo(id);
  if (!result.ok) return promoErrorResponse(result);

  revalidatePath("/");
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
