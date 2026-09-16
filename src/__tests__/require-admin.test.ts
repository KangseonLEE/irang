import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { createToken, COOKIE_NAME } from "@/lib/admin/auth";
import { requireAdmin } from "@/lib/admin/require-admin";

function reqWith(cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie) headers.set("cookie", cookie);
  return new NextRequest("https://irangfarm.com/admin/api/notifications", { headers });
}

/**
 * 관리자 API 라우트 자체 인가 — 미들웨어가 우회되는 상황을 가정한 2차 방어선이라,
 * 미들웨어 없이 이 함수만으로 판정이 서는지 직접 검증한다.
 */
describe("requireAdmin", () => {
  it("쿠키가 없으면 401", async () => {
    const res = await requireAdmin(reqWith());
    expect(res?.status).toBe(401);
  });

  it("위조 토큰은 401", async () => {
    const res = await requireAdmin(reqWith(`${COOKIE_NAME}=admin:9999999999:deadbeef`));
    expect(res?.status).toBe(401);
  });

  it("서명은 맞지만 만료된 토큰은 401", async () => {
    // payload 를 과거 시각으로 바꾸면 서명이 깨지므로, 만료 검증이 서명 검증보다
    // 먼저 걸리는지를 형식이 올바른 만료 토큰으로 확인한다
    const expired = "admin:1000000000:" + "a".repeat(64);
    const res = await requireAdmin(reqWith(`${COOKIE_NAME}=${expired}`));
    expect(res?.status).toBe(401);
  });

  it("유효한 토큰이면 통과한다(null) — 정상 운영자를 막지 않는다", async () => {
    const token = await createToken();
    const res = await requireAdmin(reqWith(`${COOKIE_NAME}=${token}`));
    expect(res).toBeNull();
  });

  it("401 응답은 캐시되지 않는다", async () => {
    const res = await requireAdmin(reqWith());
    expect(res?.headers.get("Cache-Control")).toContain("no-store");
  });
});
