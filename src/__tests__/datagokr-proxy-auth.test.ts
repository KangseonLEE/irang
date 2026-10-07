// @vitest-environment node
/**
 * data.go.kr 프록시 Worker 인증 — 앱 키·CI 전용 키 (2026-10-07)
 *
 * 앱(Vercel)은 PROXY_SECRET, GitHub 자동 대조(region-integrity)는 PROXY_SECRET_CI.
 * 앱 키 값은 Vercel(sensitive)·Worker 시크릿 어디서도 다시 볼 수 없어(10/7) CI 에 복사하지 않고 따로 뒀다.
 * CI 키는 조회(/proxy)만 — 예열(/warm)은 앱 키로만.
 * upstream 을 부르지 않는 응답(허용 밖 경로 404, /warm 403)으로 인증 단계만 본다.
 */
import { describe, expect, it } from "vitest";
import worker from "../../workers/datagokr-proxy/src/index";

const APP = "a".repeat(64);
const CI = "c".repeat(64);
const kv = { get: async () => null, put: async () => {} };
const env = (extra: Record<string, unknown> = {}) => ({
  DATA_GO_KR_API_KEY: "k",
  PROXY_SECRET: APP,
  DATAGOKR_CACHE: kv,
  ...extra,
});
const call = (path: string, secret: string | null, e: Record<string, unknown> = env({ PROXY_SECRET_CI: CI })) =>
  worker.fetch(
    new Request(`https://proxy.test${path}`, { headers: secret ? { "x-irang-proxy-secret": secret } : {} }),
    e as never,
  );

describe("data.go.kr 프록시 Worker 인증", () => {
  it("키 없음·틀린 키 → 401", async () => {
    expect((await call("/proxy/not-allowed", null)).status).toBe(401);
    expect((await call("/proxy/not-allowed", "x".repeat(64))).status).toBe(401);
  });

  it("앱 키·CI 키 모두 인증 통과 — 허용 밖 경로라 404 (upstream 미호출)", async () => {
    expect((await call("/proxy/not-allowed", APP)).status).toBe(404);
    expect((await call("/proxy/not-allowed", CI)).status).toBe(404);
  });

  it("CI 키로는 예열(/warm) 불가 → 403", async () => {
    expect((await call("/warm", CI)).status).toBe(403);
  });

  it("CI 키가 없는 Worker 는 CI 키를 거절하고, 빈 값끼리도 일치로 보지 않는다", async () => {
    expect((await call("/proxy/not-allowed", CI, env())).status).toBe(401);
    expect((await call("/proxy/not-allowed", "", env({ PROXY_SECRET_CI: "" }))).status).toBe(401);
  });

  it("앱 키가 빠진 Worker 는 500 + 누락 이름(값은 응답하지 않음)", async () => {
    const r = await call("/proxy/not-allowed", APP, env({ PROXY_SECRET: "" }));
    expect(r.status).toBe(500);
    expect(await r.json()).toMatchObject({ missing: ["PROXY_SECRET"] });
  });
});
