// @vitest-environment node
/**
 * 로그인 시도 기록 보존 정리가 **실제로 실행되는지** (2026-10-16 보안 QA 🟡9).
 * supabase-js 쿼리 빌더는 then 될 때 요청을 보낸다 — `void builder` 는 아무것도 안 보낸다.
 */

import { describe, expect, it, vi } from "vitest";

const executed: string[] = [];

/** then 이 불릴 때만 '실행'으로 기록하는 가짜 쿼리 빌더 */
function builder(kind: string, result: unknown) {
  const b: Record<string, unknown> = {};
  for (const m of ["insert", "select", "eq", "gte", "lt", "delete"]) {
    b[m] = () => b;
  }
  b.then = (resolve: (v: unknown) => void) => {
    executed.push(kind);
    resolve(result);
  };
  return b;
}

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => {
    let call = 0;
    return {
      from: () => {
        call += 1;
        if (call === 1) return builder("insert", { error: null });
        if (call === 2) return builder("count", { count: 1, error: null });
        return builder("delete", { error: null });
      },
    };
  },
}));

import { recordAndCheckLoginAttempt } from "@/lib/admin/login-throttle";

describe("recordAndCheckLoginAttempt", () => {
  it("기록·집계·보존 정리 세 요청이 모두 실행된다", async () => {
    const res = await recordAndCheckLoginAttempt("203.0.113.7");
    expect(res).toEqual({ limited: false, reason: "ok" });
    expect(executed).toEqual(["insert", "count", "delete"]);
  });
});
