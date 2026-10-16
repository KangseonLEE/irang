// @vitest-environment node
/**
 * /api/assess 입력 검증 + 공개 POST Content-Type 강제 (2026-10-16 보안 QA 🟡6·⚪15).
 * DB 에 닿기 전 단계만 시험한다 — Supabase 는 mock(쓰기 0).
 */

import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => null,
  recordApiFallback: vi.fn(async () => {}),
}));

import {
  ALLOWED_ANSWER_KEYS,
  MAX_ANSWERS_JSON_BYTES,
  MAX_LIST_ITEMS,
  MAX_REFERRER_LENGTH,
  filterCropIds,
  filterRegionIds,
  normalizeReferrer,
  validateAnswers,
  validatePrograms,
} from "@/app/api/assess/validate-payload";
import { QUESTIONS as MATCH_QUESTIONS, TRACK_QUESTIONS } from "@/lib/data/match-questions";
import { QUESTIONS as ASSESS_QUESTIONS } from "@/lib/data/assessment";
import { QUICK_QUESTIONS } from "@/lib/data/quick-check";
import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import { POST as assessPost } from "@/app/api/assess/route";
import { POST as notesPost } from "@/app/api/community/notes/route";
import { POST as reportPost } from "@/app/api/community/notes/[id]/report/route";
import { POST as quickFeedbackPost } from "@/app/api/quick-feedback/route";
import { POST as searchLogPost } from "@/app/api/search-log/route";

const VALID_ID = "abcDEF123_-x";

let ipSeq = 0;
function post(url: string, body: unknown, contentType: string | null = "application/json") {
  // 요청마다 다른 IP — 라우트의 분당 제한(인메모리)에 걸리지 않게
  ipSeq += 1;
  const headers = new Headers({ "user-agent": "Mozilla/5.0 Chrome/124.0", "x-real-ip": `10.0.0.${ipSeq}` });
  if (contentType) headers.set("content-type", contentType);
  return new NextRequest(`https://irangfarm.com${url}`, {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("validateAnswers", () => {
  it("허용 키는 세 위저드의 실제 질문 id + assess 메타 3종", () => {
    for (const q of [...MATCH_QUESTIONS, ...ASSESS_QUESTIONS, ...QUICK_QUESTIONS]) {
      expect(ALLOWED_ANSWER_KEYS.has(q.id)).toBe(true);
    }
    expect(ALLOWED_ANSWER_KEYS.has("__track_answers")).toBe(true);
    expect(ALLOWED_ANSWER_KEYS.has("phone")).toBe(false);
  });

  it("세 위저드가 실제로 보내는 형태를 통과시킨다", () => {
    const match = Object.fromEntries(MATCH_QUESTIONS.map((q) => [q.id, [q.options[0].id]]));
    const assess = Object.fromEntries(ASSESS_QUESTIONS.map((q) => [q.id, 3]));
    const quick = Object.fromEntries(QUICK_QUESTIONS.map((q) => [q.id, q.options[0].id]));
    expect(validateAnswers(match).ok).toBe(true);
    expect(validateAnswers(quick).ok).toBe(true);
    expect(
      validateAnswers({
        ...assess,
        __assess_tier: "ready",
        __assess_total_score: 72,
        __track_answers: { [TRACK_QUESTIONS[0].id]: [TRACK_QUESTIONS[0].options[0].id] },
      }).ok,
    ).toBe(true);
  });

  it("모르는 키·긴 값·중첩 객체·8KB 초과는 거부", () => {
    expect(validateAnswers({ note: "상담 010-1234-5678" }).ok).toBe(false);
    expect(validateAnswers({ [QUICK_QUESTIONS[0].id]: "x".repeat(65) }).ok).toBe(false);
    expect(validateAnswers({ [QUICK_QUESTIONS[0].id]: { a: 1 } }).ok).toBe(false);
    expect(validateAnswers({ __track_answers: { evil: ["x"] } }).ok).toBe(false);
    expect(validateAnswers([]).ok).toBe(false);
    expect(validateAnswers(null).ok).toBe(false);
    const big = { [MATCH_QUESTIONS[0].id]: Array.from({ length: 20 }, () => "가".repeat(64)) };
    const many = Object.fromEntries(MATCH_QUESTIONS.map((q) => [q.id, big[MATCH_QUESTIONS[0].id]]));
    expect(new TextEncoder().encode(JSON.stringify(many)).length).toBeGreaterThan(MAX_ANSWERS_JSON_BYTES);
    expect(validateAnswers(many)).toEqual({ ok: false, error: "answers too large" });
  });
});

describe("지역·작물·지원사업·referrer", () => {
  it("모르는 id 를 버리고 최대 5개, 중복 제거", () => {
    const p = PROVINCES.map((x) => x.id);
    expect(filterRegionIds(["상담 010-1234", p[0], p[0], ...p.slice(1)])).toEqual(p.slice(0, MAX_LIST_ITEMS));
    expect(filterCropIds([CROPS[0].id, "<b>x</b>", 3])).toEqual([CROPS[0].id]);
    expect(filterRegionIds(undefined)).toEqual([]);
    expect(filterRegionIds("seoul")).toBeNull();
  });

  it("지원사업 id 는 형식만, 10개까지", () => {
    expect(validatePrograms(["SP-001", "SP-014"]).ok).toBe(true);
    expect(validatePrograms(["SP 001"]).ok).toBe(false);
    expect(validatePrograms(Array.from({ length: 11 }, (_, i) => `SP-${i}`)).ok).toBe(false);
  });

  it("referrer 는 문자열 200자까지 자르고, 다른 타입은 거부", () => {
    expect(normalizeReferrer("x".repeat(500))).toEqual({ ok: true, value: "x".repeat(MAX_REFERRER_LENGTH) });
    expect(normalizeReferrer(null)).toEqual({ ok: true, value: null });
    expect(normalizeReferrer({ a: 1 }).ok).toBe(false);
  });
});

describe("POST /api/assess", () => {
  const base = {
    id: VALID_ID,
    answers: { [QUICK_QUESTIONS[0].id]: QUICK_QUESTIONS[0].options[0].id },
    top_regions: [],
    top_crops: [],
    recommended_programs: [],
    referrer: null,
    source: "quick",
    persona: "balanced",
  };

  it("정상 형태는 검증을 통과해 DB 단계(mock: 미설정 503)까지 간다", async () => {
    const res = await assessPost(post("/api/assess", base));
    expect(res.status).toBe(503);
  });

  it("content-type 이 JSON 이 아니면 415", async () => {
    expect((await assessPost(post("/api/assess", base, "text/plain"))).status).toBe(415);
    expect((await assessPost(post("/api/assess", base, null))).status).toBe(415);
    expect((await assessPost(post("/api/assess", base, "application/json; charset=utf-8"))).status).toBe(503);
  });

  it("필수 필드 형식 오류만 400", async () => {
    const fullBase = { ...base, source: "full", farm_type_id: "guinong", persona: null };
    const bad = [
      { ...base, answers: { phone: "010" } },
      { ...base, id: "short" },
      { ...base, persona: "hacker" }, // quick 의 persona 는 필수
      { ...fullBase, farm_type_id: "evil" }, // full 의 farm_type_id 는 필수
      { ...fullBase, top_regions: "seoul" }, // full 의 배열은 필수
    ];
    for (const body of bad) {
      expect((await assessPost(post("/api/assess", body))).status, JSON.stringify(body)).toBe(400);
    }
  });

  it("선택 필드의 잘못된 값은 거부하지 않고 버린다 — 옛·외부 링크(?ageGroup=teen)로 온 결과도 저장된다 (2차 QA A4)", async () => {
    const fullBase = { ...base, source: "full", farm_type_id: "guinong", persona: null };
    const tolerated = [
      { ...base, referrer: 123 },
      { ...base, age_group: "teen" },
      { ...base, farm_type_id: "evil" }, // quick 은 farm_type_id 선택
      { ...base, top_regions: "seoul" }, // quick 은 배열 선택
      { ...base, recommended_programs: ["<script>"] },
      { ...fullBase, age_group: "teen", persona: "hacker", referrer: { a: 1 } },
    ];
    for (const body of tolerated) {
      const res = await assessPost(post("/api/assess", body));
      // 검증을 통과해 DB 단계(mock: 미설정 503)까지 간다 — 400 이 아니다
      expect(res.status, JSON.stringify(body)).not.toBe(400);
    }
  });

  it("본문이 16KB 를 넘으면 413", async () => {
    const res = await assessPost(post("/api/assess", { ...base, pad: "x".repeat(17 * 1024) }));
    expect(res.status).toBe(413);
  });
});

describe("공개 POST Content-Type 강제 (415)", () => {
  it("community notes·report, quick-feedback, search-log 는 text/plain 을 거부", async () => {
    expect((await notesPost(post("/api/community/notes", { body: "x" }, "text/plain"))).status).toBe(415);
    expect(
      (await reportPost(post("/api/community/notes/1/report", { reason: "x" }, "text/plain"), {
        params: Promise.resolve({ id: "1" }),
      })).status,
    ).toBe(415);
    // 아래 두 라우트는 dev(NODE_ENV≠production)면 내부 트래픽 게이트가 먼저 skip 한다 — production 으로 시험
    const prev = process.env.NODE_ENV;
    (process.env as Record<string, string>).NODE_ENV = "production";
    try {
      expect((await quickFeedbackPost(post("/api/quick-feedback", { rating: 5 }, "text/plain"))).status).toBe(415);
      expect((await searchLogPost(post("/api/search-log", { query: "x" }, "text/plain"))).status).toBe(415);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = prev;
    }
  });
});
