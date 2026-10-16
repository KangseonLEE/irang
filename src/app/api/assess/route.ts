/**
 * POST /api/assess — 진단 결과 저장
 *
 * - Rate Limiting: IP 기반 분당 5건
 * - Payload 유효성 검증
 * - service_role로 Supabase INSERT (anon INSERT 차단)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, recordApiFallback } from "@/lib/supabase";
import { isValidResultId } from "@/lib/assess-result";
import { isE2eRequest } from "@/lib/internal-traffic";
import type { FarmTypeId } from "@/lib/data/match-questions";
import { getClientIp } from "@/lib/client-ip";
import { isJsonContentType, unsupportedMediaType } from "@/lib/request-guards";
import {
  MAX_BODY_BYTES,
  filterCropIds,
  filterRegionIds,
  normalizeReferrer,
  validateAnswers,
  validatePrograms,
} from "./validate-payload";

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
  // 0. E2E 테스트 적재 차단 (2026-08-31)
  // core-journeys e2e가 /assess 위저드를 완주하며 매 push마다 결과를 실 DB에
  // 적재해 통계를 오염 (7/24~8/31 사이 106건, 전부 첫 옵션 선택 → 귀농형).
  // 판정은 `lib/internal-traffic` SSOT (9/16).
  //
  // ⚠️ 운영자 쿠키·로컬 dev 는 일부러 막지 않는다 — /assess/result/[id] 재열람이
  // 이 row 를 읽으므로 저장을 건너뛰면 회장이 재방문 흐름을 테스트할 수 없다.
  // M7 진단 완료율은 GA4(운영자 브라우저 제외됨)로 재므로 DB 쪽 오염 영향도 낮다.
  if (isE2eRequest(req)) {
    return NextResponse.json({ success: true, skipped: "e2e" });
  }

  // 0-1. JSON 만 받는다 (보안 QA ⚪15) — text/plain 단순 요청(다른 사이트의 폼·fetch)으로 쓰기를 막는다
  if (!isJsonContentType(req)) return unsupportedMediaType();

  // 1. Rate Limit 체크
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // 2. Body 파싱 — 크기 상한 먼저 (보안 QA 🟡6)
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 3. 필수 필드 검증
  const { id, farm_type_id } = body;

  if (!id || typeof id !== "string" || !isValidResultId(id)) {
    return NextResponse.json(
      { error: "Invalid result ID (expected nanoid 12 chars)" },
      { status: 400 }
    );
  }

  const answersCheck = validateAnswers(body.answers);
  if (!answersCheck.ok) {
    return NextResponse.json(
      { error: `Missing or invalid answers (${answersCheck.error})` },
      { status: 400 }
    );
  }
  const answers = answersCheck.value;

  // ── 선택 필드는 거부하지 않고 버린다 (2026-10-16 보안 2차 QA A4) ──
  // 1차 수정이 잘못된 age_group 등을 400 으로 거부해, /match?ageGroup=<임의값> 처럼 옛·외부 링크로 들어온
  // 사용자의 결과 저장과 공유 링크가 깨졌다. 필수 형식 오류(id·answers, full 의 farm_type_id·배열, quick 의 persona)만
  // 400 이고, 나머지는 알 수 있는 값만 남기고 모르는 값은 null(또는 빈 배열)로 저장한다.
  //
  // 지역·작물은 알려진 id 만, 최대 5개 — 공유 화면이 이 값을 그대로 그린다 (콘텐츠 위조 방지)
  const top_regions = filterRegionIds(body.top_regions) ?? [];
  const top_crops = filterCropIds(body.top_crops) ?? [];
  const programsCheck = validatePrograms(body.recommended_programs);
  const recommendedPrograms = programsCheck.ok ? programsCheck.value : [];
  const referrerCheck = normalizeReferrer(body.referrer);
  const referrer = referrerCheck.ok ? referrerCheck.value : null;

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
    // full 은 배열 필드가 반드시 와야 한다(빈 배열은 허용 — 14문항 assess 위저드는 [] 를 보낸다)
    if (!Array.isArray(body.top_regions) || !Array.isArray(body.top_crops)) {
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
    await recordApiFallback({
      endpoint: "/api/assess",
      statusCode: 503,
      fallbackReason: "not-configured",
      userAgent: req.headers.get("user-agent"),
      page: referrer,
      requestMeta: {
        source,
        persona: isValidPersona(body.persona) ? body.persona : null,
      },
    });
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
    // quick 은 farm_type_id 선택 — 모르는 값은 저장하지 않고 placeholder(NOT NULL 컬럼)
    farm_type_id:
      source === "full" || VALID_FARM_TYPE_IDS.includes(farm_type_id as FarmTypeId)
        ? farm_type_id
        : "guinong",
    top_regions,
    top_crops,
    recommended_programs: recommendedPrograms,
    referrer,
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
        await recordApiFallback({
          endpoint: "/api/assess",
          statusCode: 202,
          fallbackReason: "migration-pending",
          userAgent: req.headers.get("user-agent"),
          page: referrer,
          requestMeta: {
            source,
            persona: personaValue,
            missing_column_hint: error.message ?? null,
          },
        });
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
        recommended_programs: recommendedPrograms,
        referrer,
        user_agent: req.headers.get("user-agent") ?? null,
        age_group: ageGroupValue,
      });
      if (fallbackError) {
        console.error("[assess] fallback insert failed:", fallbackError.message);
        return NextResponse.json({ error: "Save failed" }, { status: 500 });
      }
      await recordApiFallback({
        endpoint: "/api/assess",
        statusCode: 200,
        fallbackReason: "legacy-columns-only",
        userAgent: req.headers.get("user-agent"),
        page: referrer,
        requestMeta: {
          source,
          persona: personaValue,
          missing_column_hint: error.message ?? null,
        },
      });
      return NextResponse.json({ success: true, id, fallback: true });
    }

    console.error("[assess] Supabase insert error:", error.message);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true, id });
}
