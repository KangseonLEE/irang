/**
 * env.ts 유닛 테스트
 *
 * 환경변수 검증 레이어 동작 확인
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateEnv } from "@/lib/env";

describe("validateEnv", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // console.warn 모킹
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    // 환경변수 복원
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("필수 환경변수가 모두 있으면 오류 없이 통과한다", () => {
    // 현재 모든 환경변수가 required: false이므로 항상 통과해야 함
    expect(() => validateEnv()).not.toThrow();
  });

  it("선택 환경변수가 없으면 개발 환경에서 경고를 출력한다", () => {
    // 개발 환경에서만 경고 출력
    process.env.NODE_ENV = "development";
    // 선택 변수들을 모두 제거
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.UNSPLASH_ACCESS_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    validateEnv();

    expect(console.warn).toHaveBeenCalled();
    const warnCall = (console.warn as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(warnCall[0]).toContain("[env]");
    expect(warnCall[0]).toContain("선택 환경변수");
  });

  it("빈 문자열도 미설정으로 간주한다", () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_SENTRY_DSN = "";

    validateEnv();

    expect(console.warn).toHaveBeenCalled();
  });
});
