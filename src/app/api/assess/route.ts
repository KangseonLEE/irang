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
  "guinong",
  "guichon",
  "guisanchon",
  "smartfarm",
  "cheongnyeon",
];

// ── 유효한 age_group 값 (위저드 demoAnswers.ageGroup) ──
const VALID_AGE_GROUPS = ["youth", "30s", "40s", "50s", "60plus"] as const;
type AgeGroup = (typeof VALID_AGE_GROUPS)[number];

function isValidAgeGroup(v: unknown): v is AgeGroup {
  return typeof v === "string" && (VALID_AGE_GROUPS as readonly string[]).includes(v);
}

// ── 유효한 source 값 (2026-05-18 Quick wizard 적재 도입) ──
const VALID_SOURCES = ["full", "quick"] as const;
type AssessSource = (typeof VALID_SOURCES)[number];

function isValidSource(v: unknown): v is AssessSource {
  return typeof v === "string" && (VALID_SOURCES as readonly string[]).includes(v);
}

// ── 유효한 persona 값 (5종) ──
const VALID_PERSONAS = [
  "family",
  "farmYouth",
  "elderRural",
  "commuter",
  "balanced",
] as const;
type Persona = (typeof VALID_PERSONAS)[number];

function isValidPersona(v: unknown): v is Persona {
  return typeof v === "string" && (VALID_PERSONAS as readonly string[]).includes(v);
}

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

  // source 분기 (2026-05-18) — 'full'=14문항 정식, 'quick'=4문항 가벼운 적재
  const source: AssessSource = isValidSource(body.source) ? body.source : "full";

  if (source === "full") {
    // 기존 14문항 정식 진단 validation
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
  } else {
    // Quick 적재 — farm_type_id 생략 가능, persona 필수
    if (!isValidPersona(body.persona)) {
      return NextResponse.json(
        { error: "Quick wizard requires valid persona" },
        { status: 400 }
      );
    }
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
  // age_group 은 선택값 — invalid 면 NULL 로 저장 (legacy 호환)
  const ageGroupValue = isValidAgeGroup(body.age_group) ? body.age_group : null;
  const personaValue = isValidPersona(body.persona) ? body.persona : null;

  // Quick은 farm_type_id를 persona로 대체 의미. DB schema는 NOT NULL이므로
  // Quick 적재 시 farm_type_id에 'quick'(placeholder)을 명시적으로 박는 게 아니라
  // 마이그레이션 후엔 별도 처리 — 마이그레이션 apply 전 fallback:
  //  · source/persona 컬럼이 DB에 없을 수 있으므로 unknown column 시 'full' legacy 모드로 폴백
  const fullPayload = {
    id,
    answers,
    farm_type_id: source === "full" ? farm_type_id : (farm_type_id ?? "guinong"),
    top_regions: Array.isArray(top_regions) ? top_regions : [],
    top_crops: Array.isArray(top_crops) ? top_crops : [],
    recommended_programs: body.recommended_programs ?? [],
    referrer: body.referrer ?? null,
    user_agent: req.headers.get("user-agent") ?? null,
    age_group: ageGroupValue,
    source,
    persona: personaValue,
  };

  const { error } = await sb.from("assessment_results").insert(fullPayload);

  if (error) {
    // 중복 ID (이미 저장된 결과)
    if (error.code === "23505") {
      return NextResponse.json({ success: true, id, duplicate: true });
    }

    // 마이그레이션 미적용 fallback (5/16 quick_feedback 패턴)
    const msg = error.message ?? "";
    const isMissingColumn =
      msg.includes("source") ||
      msg.includes("persona") ||
      (error as { code?: string }).code === "PGRST204" ||
      (error as { code?: string }).code === "42703";

    if (isMissingColumn) {
      console.warn(
        "[assess] source/persona 컬럼 부재 — 마이그레이션 20260518_assessment_source_persona.sql apply 필요",
      );
      // Quick 적재는 farm_type_id 강제 placeholder — 마이그레이션 apply 후 정식 처리
      if (source === "quick") {
        // 마이그레이션 미적용 + Quick = 라이브 silent fail 방지 위해 202 반환
        return NextResponse.json(
          { ok: true, skipped: "migration-pending", id },
          { status: 202 },
        );
      }
      // Full 적재는 legacy 모드 fallback (기존 컬럼만)
      const { error: fallbackError } = await sb.from("assessment_results").insert({
        id,
        answers,
        farm_type_id,
        top_regions,
        top_crops,
        recommended_programs: body.recommended_programs ?? [],
        referrer: body.referrer ?? null,
        user_agent: req.headers.get("user-agent") ?? null,
        age_group: ageGroupValue,
      });
      if (fallbackError) {
        console.error("[assess] fallback insert failed:", fallbackError.message);
        return NextResponse.json({ error: "Save failed" }, { status: 500 });
      }
      return NextResponse.json({ success: true, id, fallback: true });
    }

    console.error("[assess] Supabase insert error:", error.message);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
