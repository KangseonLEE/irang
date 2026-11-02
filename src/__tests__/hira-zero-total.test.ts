/**
 * 심평원 totalCount 0 은 실패다 (2026-11-02 #197)
 *
 * 안양 만안구 상세가 '의료기관 0개' 로 22시간 캐시(ISR 1일)돼 있었다 — 심평원이 간헐적으로 resultCode 00 + totalCount 0 을
 * 돌려준 것을 그대로 숫자로 믿은 탓. 시·군·구(구 포함)는 보건소가 있어 0 곳일 수 없으므로 0 은 null(상위 대체값)로 넘긴다(T17).
 * 단, 구가 생긴 시의 시 단위 코드(화성 312500)는 기관이 다 옮겨 가 0 이어도 되고, 합만 0 이 아니면 된다.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchSigunguMedicalFacilities } from "@/lib/api/hira";

function stubHira(totals: Record<string, number>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const sggu = new URL(String(input)).searchParams.get("sgguCd") ?? "";
      const totalCount = totals[sggu];
      if (totalCount === undefined) throw new Error(`stub 에 없는 sgguCd ${sggu}`);
      return new Response(JSON.stringify({ response: { body: { totalCount } } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }),
  );
}

describe("fetchSigunguMedicalFacilities — totalCount 0 처리", () => {
  const saved = { ...process.env };
  beforeEach(() => {
    delete process.env.DATA_GO_KR_PROXY_URL;
    delete process.env.DATA_GO_KR_PROXY_SECRET;
    process.env.DATA_GO_KR_API_KEY = "test-key";
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...saved };
  });

  it("단일 코드(안양 만안구 310701) 0 → null (상위 대체값으로)", async () => {
    stubHira({ "310701": 0 });
    await expect(fetchSigunguMedicalFacilities("31", "310701")).resolves.toBeNull();
  });

  it("단일 코드 311 → 311 그대로", async () => {
    stubHira({ "310701": 311 });
    await expect(fetchSigunguMedicalFacilities("31", "310701")).resolves.toMatchObject({ totalCount: 311 });
  });

  it("구가 있는 시(화성 312504): 시 단위 코드 312500 이 0 이어도 합 1,033 은 그대로", async () => {
    stubHira({ "312500": 0, "312501": 269, "312502": 137, "312503": 158, "312504": 469 });
    await expect(fetchSigunguMedicalFacilities("31", "312504")).resolves.toMatchObject({ totalCount: 1033 });
  });

  it("구가 있는 시(안양 310702): 구 전부 0 → null", async () => {
    stubHira({ "310701": 0, "310702": 0 });
    await expect(fetchSigunguMedicalFacilities("31", "310702")).resolves.toBeNull();
  });
});
