// @vitest-environment node
/**
 * 미들웨어 보안 분기 통합 (2026-10-16 보안 QA 🔴1·🟡5·⚪8).
 * - 오리진 잠금: 기본 꺼짐 / log 는 통과 / enforce 는 403 no-store
 * - enforce 에서만 cf-ipcountry 없음 = KR 외
 * - /admin 가드가 RSC 분기보다 먼저, 미인증 redirect 는 private, no-store
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../../middleware";

const SECRET = "c".repeat(64);
const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function req(path: string, headers: Record<string, string> = {}, host = "irangfarm.com") {
  return new NextRequest(`https://${host}${path}`, {
    headers: { host, "user-agent": CHROME_UA, ...headers },
  });
}

afterEach(() => {
  delete process.env.ORIGIN_LOCK_MODE;
  delete process.env.ORIGIN_LOCK_SECRET;
  vi.restoreAllMocks();
});

describe("오리진 잠금", () => {
  it("기본(미설정): 비밀 헤더·국가 헤더가 없어도 지금처럼 통과", async () => {
    const res = await middleware(req("/about"));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("log: 불일치를 경고 한 줄로만 남기고 통과 — 시크릿 값은 로그에 없다", async () => {
    process.env.ORIGIN_LOCK_MODE = "log";
    process.env.ORIGIN_LOCK_SECRET = SECRET;
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = await middleware(req("/about", { "x-irang-edge-secret": "guess" }));
    expect(res.status).toBe(200);
    expect(warn).toHaveBeenCalledTimes(1);
    const line = String(warn.mock.calls[0][0]);
    expect(line).toContain("[origin-lock] mismatch");
    expect(line).toContain("cf-ray=no");
    expect(line).not.toContain(SECRET);
    expect(line).not.toContain("guess");
  });

  it("enforce: 헤더 불일치 403 + private, no-store / 일치하면 통과", async () => {
    process.env.ORIGIN_LOCK_MODE = "enforce";
    process.env.ORIGIN_LOCK_SECRET = SECRET;
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const blocked = await middleware(req("/about", { "cf-ipcountry": "KR" }));
    expect(blocked.status).toBe(403);
    expect(blocked.headers.get("cache-control")).toContain("no-store");
    expect(blocked.headers.get("cache-control")).toContain("private");

    const ok = await middleware(req("/about", { "x-irang-edge-secret": SECRET, "cf-ipcountry": "KR" }));
    expect(ok.status).toBe(200);
  });

  it("enforce 에서도 ACME 경로와 운영 외 호스트는 통과", async () => {
    process.env.ORIGIN_LOCK_MODE = "enforce";
    process.env.ORIGIN_LOCK_SECRET = SECRET;
    // 국가 헤더가 없어도(XX)·해외여도 ACME 는 지리 차단에서도 빠진다 — 인증서 자기잠금 방지
    expect((await middleware(req("/.well-known/acme-challenge/abc"))).status).toBe(200);
    expect((await middleware(req("/.well-known/acme-challenge/abc", { "cf-ipcountry": "US" }))).status).toBe(200);
    expect((await middleware(req("/about", {}, "irang-xyz.vercel.app"))).status).toBe(200);
  });

  it("enforce: Cloudflare 를 거친 요청인데 cf-ipcountry 가 없으면 KR 외로 보고 503", async () => {
    process.env.ORIGIN_LOCK_MODE = "enforce";
    process.env.ORIGIN_LOCK_SECRET = SECRET;
    const res = await middleware(req("/about", { "x-irang-edge-secret": SECRET }));
    expect(res.status).toBe(503);
  });

  it("off: 위조한 cf-ipcountry: KR 은 막을 수 없지만(직접 접속) 동작은 그대로 — enforce 가 해결책", async () => {
    expect((await middleware(req("/about", { "cf-ipcountry": "US" }))).status).toBe(503);
    expect((await middleware(req("/about", { "cf-ipcountry": "KR" }))).status).toBe(200);
  });
});

describe("/admin 가드", () => {
  it("RSC·prefetch 요청도 미인증이면 로그인으로 — RSC 분기보다 먼저 막는다", async () => {
    const variants: Record<string, string>[] = [{ rsc: "1" }, { "next-router-prefetch": "1" }, {}];
    for (const h of variants) {
      const res = await middleware(req("/admin/community", h));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("https://irangfarm.com/admin/login");
      expect(res.headers.get("cache-control")).toContain("private");
      expect(res.headers.get("cache-control")).toContain("no-store");
    }
  });

  it("로그인 화면·로그인 API 는 열어 둔다", async () => {
    expect((await middleware(req("/admin/login"))).status).toBe(200);
    expect((await middleware(req("/admin/api/auth"))).status).toBe(200);
  });
});
