/**
 * 홍보 팝업 포스터 업로드 (2026-09-29)
 *
 *   POST /admin/api/promos/upload   multipart/form-data: file, id?
 *   → { url, width, height }
 *
 * webp(폭 900 상한)로 변환해 Storage 버킷 `promo` 에 올린다.
 */

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { uploadPromoImage } from "@/lib/promos/queries";
import { promoErrorResponse, NO_STORE } from "../_respond";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/webp", "image/png", "image/jpeg"]);

export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "multipart/form-data 가 아니에요" }, { status: 400, headers: NO_STORE });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "file 을 함께 보내 주세요" }, { status: 400, headers: NO_STORE });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "포스터는 5MB 이하로 올려 주세요" }, { status: 413, headers: NO_STORE });
  }
  if (file.type && !ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "webp · png · jpg 만 올릴 수 있어요" },
      { status: 415, headers: NO_STORE },
    );
  }

  const idHint = typeof form.get("id") === "string" ? String(form.get("id")) : "promo";
  const result = await uploadPromoImage(file, idHint);
  if (!result.ok) return promoErrorResponse(result);

  return NextResponse.json(result.data, { headers: NO_STORE });
}
