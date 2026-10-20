// @vitest-environment node
/**
 * 어드민 피드백 정리 (2026-10-20) — 추천 평가 저장 검증 + 추천 id 이름 표기 + 의견 목록 필터.
 * 10/15 추천 평가 1건이 '미분류 · (메시지 없음)'으로 의견 목록에 섞여 보였다.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const inserts: Record<string, unknown>[] = [];
const filterCalls: Array<[string, ...unknown[]]> = [];

function chain() {
  const c: Record<string, unknown> = {};
  for (const m of ["select", "is", "or", "eq", "order"]) {
    c[m] = (...args: unknown[]) => {
      filterCalls.push([m, ...args]);
      return c;
    };
  }
  c.range = async () => ({ data: [], count: 0 });
  c.insert = async (payload: Record<string, unknown>) => {
    inserts.push(payload);
    return { error: null };
  };
  return c;
}

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({ from: () => chain() }),
  recordApiFallback: vi.fn(async () => {}),
}));

import { POST as quickFeedbackPost } from "@/app/api/quick-feedback/route";
import { describeRecommendation } from "@/lib/admin/recommendation-label";
import { fetchFeedbackList } from "@/lib/admin/queries";

let ipSeq = 0;
function post(body: unknown) {
  ipSeq += 1;
  return new NextRequest("https://irangfarm.com/api/quick-feedback", {
    method: "POST",
    headers: new Headers({
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0 Chrome/124.0",
      "x-real-ip": `10.2.0.${ipSeq}`,
    }),
    body: JSON.stringify(body),
  });
}

const prevEnv = process.env.NODE_ENV;
beforeEach(() => {
  // dev 면 내부 트래픽 게이트가 먼저 skip — 운영처럼 시험
  (process.env as Record<string, string>).NODE_ENV = "production";
  inserts.length = 0;
  filterCalls.length = 0;
});
afterEach(() => {
  (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
});

describe("추천 평가 저장 검증", () => {
  it("대상 id 와 페르소나가 있으면 저장한다", async () => {
    const res = await quickFeedbackPost(
      post({ thumbs: "up", recommendation_id: "crop:apple", persona: "commuter", page: "/match" }),
    );
    expect(res.status).toBe(200);
    expect(inserts[0]).toMatchObject({ thumbs: "up", recommendation_id: "crop:apple", persona: "commuter", rating: null });
  });

  it("대상 id 가 없거나 형식이 틀리면 400 — 무엇을 평가했는지 모르는 행을 막는다", async () => {
    for (const recommendation_id of [undefined, "", "apple", "crop:", "crop:<b>"]) {
      const res = await quickFeedbackPost(post({ thumbs: "down", recommendation_id, persona: "family", page: "/match" }));
      expect(res.status, String(recommendation_id)).toBe(400);
    }
    expect(inserts).toHaveLength(0);
  });

  it("페르소나가 없거나 5종 밖이면 400", async () => {
    for (const persona of [undefined, "", "hacker"]) {
      const res = await quickFeedbackPost(post({ thumbs: "up", recommendation_id: "crop:apple", persona, page: "/match" }));
      expect(res.status, String(persona)).toBe(400);
    }
    expect(inserts).toHaveLength(0);
  });

  it("평가도 추천 평가도 없으면 400 (기존)", async () => {
    const res = await quickFeedbackPost(post({ message: "hi", page: "/" }));
    expect(res.status).toBe(400);
  });
});

describe("추천 id → 이름", () => {
  it("작물·지원사업·지역은 이름과 링크로", () => {
    expect(describeRecommendation("crop:apple")).toEqual({ kind: "작물", name: "사과", href: "/crops/apple" });
    const program = describeRecommendation("program:SP-001");
    expect(program.kind).toBe("지원사업");
    expect(program.name).not.toBe("SP-001");
    expect(describeRecommendation("region:jeonnam").href).toBe("/regions/jeonnam");
  });

  it("모르는 id 는 이름을 지어내지 않고 그대로", () => {
    expect(describeRecommendation("crop:nope")).toEqual({ kind: "작물", name: "nope", href: null });
    expect(describeRecommendation("weird")).toEqual({ kind: "기타", name: "weird", href: null });
  });
});

describe("의견 목록 필터", () => {
  it("추천 평가·요청 행을 빼고 읽는다", async () => {
    await fetchFeedbackList(1, 20, "all");
    expect(filterCalls).toContainEqual(["is", "thumbs", null]);
    expect(filterCalls).toContainEqual(["is", "request_kind", null]);
    expect(filterCalls).toContainEqual(["or", "message.is.null,message.not.like.*요청*"]);
  });
});
