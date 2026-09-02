/**
 * /api/community/notes — 커뮤니티 1단계 "한 줄 의견" (2026-09-02 회장 결재)
 *
 * GET  ?type=region|crop|program&id=…  → 승인(approved)된 의견 목록
 * POST { targetType, targetId, body, nickname?, honeypot?, composeMs?, targetLabel? }
 *      → 사전 승인제: 필터 통과 시 pending(관리자 승인 후 노출), 필터 걸리면 rejected 로 적재
 *
 * 방어 층: e2e 분리 → rate limit(인메모리 + 24h DB 카운트) → 룰 필터 → LLM 분류 → 승인 큐
 * 테이블 미적용(migration-pending) 은 503 으로 명시 — 성공으로 포장하지 않는다(5/26 교훈).
 */

import { NextRequest, NextResponse } from "next/server";
import { recordApiFallback } from "@/lib/supabase";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp, hashIp, isE2eRequest } from "@/lib/community/ip-hash";
import { isNoteTargetType, isValidTargetId } from "@/lib/community/types";
import {
  NICKNAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  NOTE_MIN_LENGTH,
  runRuleFilter,
} from "@/lib/community/filter";
import { classifyNote, shouldAutoReject } from "@/lib/community/moderation";
import { countRecentByIp, insertNote, listApprovedNotes } from "@/lib/community/queries";

const ENDPOINT = "/api/community/notes";
const limiter = createRateLimiter({ windowMs: 10 * 60_000, max: 3 }); // 10분 3건
const DAILY_MAX = 10;

const NO_STORE = { "Cache-Control": "private, no-store, max-age=0" };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  if (!isNoteTargetType(type) || !isValidTargetId(id)) {
    return NextResponse.json({ ok: false, error: "invalid target" }, { status: 400, headers: NO_STORE });
  }

  const result = await listApprovedNotes(type, id);
  if (!result.ok) {
    if (result.reason !== "db-error") {
      await recordApiFallback({
        endpoint: ENDPOINT,
        statusCode: 503,
        fallbackReason: result.reason,
        userAgent: req.headers.get("user-agent"),
      });
    }
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: 503, headers: NO_STORE },
    );
  }
  return NextResponse.json({ ok: true, notes: result.data }, { headers: NO_STORE });
}

interface PostBody {
  targetType?: unknown;
  targetId?: unknown;
  body?: unknown;
  nickname?: unknown;
  honeypot?: unknown;
  composeMs?: unknown;
  targetLabel?: unknown;
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent");

  // e2e(Playwright) 는 적재하지 않는다 — 8/31 assessment_results 73% 오염 교훈
  if (isE2eRequest(req)) {
    return NextResponse.json({ ok: true, skipped: "e2e", status: "pending" }, { status: 202, headers: NO_STORE });
  }

  const ip = clientIp(req);
  const ipHash = hashIp(ip);
  if (limiter.isLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "잠시 후 다시 시도해 주세요" },
      { status: 429, headers: NO_STORE },
    );
  }

  let json: PostBody;
  try {
    json = (await req.json()) as PostBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400, headers: NO_STORE });
  }

  const { targetType, targetId } = json;
  if (!isNoteTargetType(targetType) || !isValidTargetId(targetId)) {
    return NextResponse.json({ ok: false, error: "invalid target" }, { status: 400, headers: NO_STORE });
  }
  const body = typeof json.body === "string" ? json.body.trim().replace(/\s+/g, " ") : "";
  if (body.length < NOTE_MIN_LENGTH || body.length > NOTE_MAX_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `${NOTE_MIN_LENGTH}~${NOTE_MAX_LENGTH}자로 적어 주세요` },
      { status: 400, headers: NO_STORE },
    );
  }
  const nicknameRaw = typeof json.nickname === "string" ? json.nickname.trim() : "";
  const nickname = nicknameRaw ? nicknameRaw.slice(0, NICKNAME_MAX_LENGTH) : null;
  const honeypot = typeof json.honeypot === "string" ? json.honeypot : null;
  const composeMs = typeof json.composeMs === "number" ? json.composeMs : null;
  const targetLabel =
    typeof json.targetLabel === "string" ? json.targetLabel.slice(0, 60) : `${targetType}:${targetId}`;

  // 24h 영속 카운트 (인메모리 limiter 는 인스턴스 교체 시 초기화)
  if ((await countRecentByIp(ipHash)) >= DAILY_MAX) {
    return NextResponse.json(
      { ok: false, error: "오늘은 의견을 충분히 남기셨어요. 내일 다시 만나요" },
      { status: 429, headers: NO_STORE },
    );
  }

  // 2층 룰 필터
  const filter = runRuleFilter({ body, honeypot, composeMs });
  let status: "pending" | "rejected" = filter.reject ? "rejected" : "pending";
  let rejectReason: string | null = filter.reject ? `rule:${filter.flags.join(",")}` : null;

  // 3층 LLM 분류 — 룰 통과 글만. 미설정·실패 시 null → 승인 큐로
  let verdict = null;
  if (!filter.reject) {
    verdict = await classifyNote({ body, targetLabel });
    if (shouldAutoReject(verdict)) {
      status = "rejected";
      rejectReason = `llm:${verdict!.label}`;
    }
  }

  const inserted = await insertNote({
    targetType,
    targetId,
    body,
    nickname,
    status,
    rejectReason,
    filterFlags: filter.flags,
    llmVerdict: verdict,
    ipHash,
    userAgent: ua,
    isE2e: false,
  });

  if (!inserted.ok) {
    if (inserted.reason !== "db-error") {
      await recordApiFallback({
        endpoint: ENDPOINT,
        statusCode: 503,
        fallbackReason: inserted.reason,
        userAgent: ua,
        requestMeta: { targetType, targetId },
      });
    } else {
      console.error("[community/notes] insert failed:", inserted.message);
    }
    return NextResponse.json(
      { ok: false, reason: inserted.reason, error: "지금은 의견을 남길 수 없어요. 잠시 후 다시 시도해 주세요" },
      { status: 503, headers: NO_STORE },
    );
  }

  // 사용자 안내용 사유 — 봇에게 세부 규칙을 노출하지 않도록 두 종류만
  const contactFlag = filter.flags.some((f) => f === "url_count" || f === "phone_number" || f === "messenger_id");
  return NextResponse.json(
    {
      ok: true,
      id: inserted.data.id,
      status,
      ...(status === "rejected" ? { reason: contactFlag ? "contact" : "policy" } : {}),
    },
    { headers: NO_STORE },
  );
}
