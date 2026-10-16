// @vitest-environment node
/**
 * 관리자 화면 2차 인가 + 서명 키 fail-closed (2026-10-16 보안 QA 🟡5·⚪1·⚪2).
 *
 * 1) `src/app/admin/**\/page.tsx` 중 로그인 화면을 뺀 전부가 `requireAdminPage()` 를 부른다 —
 *    새 관리자 화면을 만들고 빠뜨리면 여기서 실패한다(미들웨어 한 겹 의존 재발 방지).
 * 2) 운영(VERCEL_ENV=production)에서 ADMIN_SECRET 이 없으면 토큰 발급·검증이 모두 실패한다(32자 미만은 경고만 — 10/16 잠김 방지).
 * 3) 비밀번호 비교는 길이가 달라도 같은 경로(sha256 다이제스트)로 판정한다.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  createToken,
  isAdminAuthConfigured,
  verifyPassword,
  verifyToken,
} from "@/lib/admin/auth";

const ADMIN_DIR = join(process.cwd(), "src/app/admin");

function findPages(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "api") continue; // 라우트 핸들러는 requireAdmin(9/16) 담당
      out.push(...findPages(full));
    } else if (name === "page.tsx") {
      out.push(full);
    }
  }
  return out;
}

describe("관리자 화면 requireAdminPage", () => {
  const pages = findPages(ADMIN_DIR);

  it("관리자 화면을 찾았다(경로 오탐 방지)", () => {
    expect(pages.length).toBeGreaterThanOrEqual(7);
  });

  for (const page of pages) {
    const rel = relative(process.cwd(), page);
    if (rel.endsWith("admin/login/page.tsx")) continue;
    it(`${rel} 은 데이터 조회 전에 requireAdminPage() 를 부른다`, () => {
      const src = readFileSync(page, "utf8");
      expect(src).toMatch(/import \{ requireAdminPage \} from "@\/lib\/admin\/session"/);
      const body = src.slice(src.indexOf("export default"));
      const guard = body.indexOf("await requireAdminPage()");
      expect(guard).toBeGreaterThan(-1);
      // 가드보다 앞에 다른 await(데이터 조회)가 없어야 한다
      const before = body.slice(0, guard);
      expect(before.match(/\bawait\b/g) ?? []).toHaveLength(0);
    });
  }
});

describe("ADMIN_SECRET fail-closed", () => {
  const saved = {
    secret: process.env.ADMIN_SECRET,
    password: process.env.ADMIN_PASSWORD,
    vercelEnv: process.env.VERCEL_ENV,
  };
  afterEach(() => {
    for (const [k, v] of [
      ["ADMIN_SECRET", saved.secret],
      ["ADMIN_PASSWORD", saved.password],
      ["VERCEL_ENV", saved.vercelEnv],
    ] as const) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("운영에서 키가 없으면 토큰 발급이 throw, 검증은 false, 로그인 설정은 미완", async () => {
    // 개발 폴백으로 만든 토큰이 운영에서 통하면 안 된다
    delete process.env.VERCEL_ENV;
    delete process.env.ADMIN_SECRET;
    const devToken = await createToken();
    expect(await verifyToken(devToken)).toBe(true);

    process.env.VERCEL_ENV = "production";
    process.env.ADMIN_PASSWORD = "pw";
    await expect(createToken()).rejects.toThrow();
    expect(await verifyToken(devToken)).toBe(false);
    expect(isAdminAuthConfigured()).toBe(false);
  });

  it("운영에서 32자 미만 키는 경고만 남기고 동작(배포 직후 관리자 잠김 방지), 32자 이상이면 정상", async () => {
    process.env.VERCEL_ENV = "production";
    process.env.ADMIN_PASSWORD = "pw";
    process.env.ADMIN_SECRET = "x".repeat(31);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(isAdminAuthConfigured()).toBe(true);
    expect(await verifyToken(await createToken())).toBe(true);
    warn.mockRestore();

    process.env.ADMIN_SECRET = "x".repeat(32);
    expect(isAdminAuthConfigured()).toBe(true);
    expect(await verifyToken(await createToken())).toBe(true);
  });

  it("verifyPassword: 같을 때만 true (길이가 달라도 같은 비교 경로)", async () => {
    process.env.ADMIN_PASSWORD = "correct horse";
    expect(await verifyPassword("correct horse")).toBe(true);
    expect(await verifyPassword("correct hors")).toBe(false);
    expect(await verifyPassword("correct horse!")).toBe(false);
    expect(await verifyPassword("")).toBe(false);
    delete process.env.ADMIN_PASSWORD;
    expect(await verifyPassword("")).toBe(false);
  });
});
