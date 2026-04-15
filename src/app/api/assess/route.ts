/**
 * POST /api/assess — 진단 결과 저장
 *
 * - Rate Limiting: IP 기반 분당 5건
 * - Payload 유효성 검증
 * - service_role로 Supabase INSERT (anon INSERT 차단)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isValidResultId } from "@/lib/assess-result";
import type { FarmTypeId } from "@/lib/data/match-questions";

// ── Rate Limiter (인메모리, Serverless 인스턴스 단위) ──

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1분
const MAX_REQUESTS = 5; // 분당 5건

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

// 오래된 항목 주기적 정리 (메모리 누수 방지)
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimit) {
    if (now > val.resetAt) rateLimit.delete(key);
  }
}, 60_000);

// ── 유효한 farm_type_id 목록 ──

const VALID_FARM_TYPE_IDS: FarmTypeId[] = [
  "weekend",
  "smartfarm",
  "rural-life",
  "young-entrepreneur",
];

// ── POST 핸들러 ──

export async function POST(req: NextRequest) {
  // 1. Rate Limit 체크
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // 2. Body 파싱
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. 필수 필드 검증
  const { id, answers, farm_type_id, top_regions, top_crops } = body;

  if (!id || typeof id !== "string" || !isValidResultId(id)) {
    return NextResponse.json(
      { error: "Invalid result ID (expected nanoid 12 chars)" },
      { status: 400 }
    );
  }

  if (!answers || typeof answers !== "object") {
    return NextResponse.json(
      { error: "Missing or invalid answers" },
      { status: 400 }
    );
  }

  if (
    !farm_type_id ||
    !VALID_FARM_TYPE_IDS.includes(farm_type_id as FarmTypeId)
  ) {
    return NextResponse.json(
      { error: "Invalid farm_type_id" },
      { status: 400 }
    );
  }

  if (!Array.isArray(top_regions) || !Array.isArray(top_crops)) {
    return NextResponse.json(
      { error: "top_regions and top_crops must be arrays" },
      { status: 400 }
    );
  }

  // 4. Supabase Admin 클라이언트 (service_role)
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    );
  }

  // 5. INSERT
  const { error } = await sb.from("assessment_results").insert({
    id,
    answers,
    farm_type_id,
    top_regions,
    top_crops,
    recommended_programs: body.recommended_programs ?? [],
    referrer: body.referrer ?? null,
    user_agent: req.headers.get("user-agent") ?? null,
  });

  if (error) {
    // 중복 ID (이미 저장된 결과)
    if (error.code === "23505") {
      return NextResponse.json({ success: true, id, duplicate: true });
    }
    console.error("[assess] Supabase insert error:", error.message);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
