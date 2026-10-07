/**
 * /api/population-trend — 못 받은 해는 한 번 더, 그래도 빠지면 짧게 캐시 (2026-10-07)
 *
 * 보호 대상: 10개 연도를 한꺼번에 물으면 몇 해가 일시 실패로 빠졌고, 그 빈 추이가 하루(s-maxage=86400) 동안
 * 캐시됐다(운영 실측: 부천 원미구 2016·2020 누락). 실패한 해는 다시 묻고, 그래도 빠지면 5분만 캐시한다.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/population-trend/route";

function stubSgis(failOnce: Set<number>, failAlways: Set<number>) {
  const calls = new Map<number, number>();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const url = new URL(input);
      if (url.pathname.endsWith("/authentication.json")) {
        return new Response(JSON.stringify({ errCd: 0, result: { accessToken: "T" } }));
      }
      const year = Number(url.searchParams.get("year"));
      const n = (calls.get(year) ?? 0) + 1;
      calls.set(year, n);
      if (failAlways.has(year) || (failOnce.has(year) && n === 1)) return new Response("busy", { status: 503 });
      return new Response(
        JSON.stringify({
          errCd: 0,
          result: [{ tot_ppltn: String(400000 - year), tot_family: "160000", oldage_suprt_per: "25", juv_suprt_per: "15" }],
        }),
      );
    }),
  );
  return calls;
}

const req = () =>
  new NextRequest("http://localhost/api/population-trend?sgisCode=31051", {
    headers: { "x-forwarded-for": `10.1.1.${Math.floor(Math.random() * 250)}` },
  });

beforeEach(() => {
  vi.stubEnv("SGIS_KEY", "K");
  vi.stubEnv("SGIS_SECRET", "S");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("인구 추이 API — 일시 실패한 해", () => {
  it("한 번 실패한 해는 다시 물어 10년을 다 채우고, 하루 캐시", async () => {
    const latest = new Date().getFullYear() - 2;
    const calls = stubSgis(new Set([latest - 8, latest - 4]), new Set());
    const res = await GET(req());
    const body = await res.json();
    expect(body.data).toHaveLength(10);
    expect(calls.get(latest - 8)).toBe(2);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=86400");
  });

  it("다시 물어도 빠진 해가 있으면 받은 해만 내고 5분만 캐시", async () => {
    const latest = new Date().getFullYear() - 2;
    stubSgis(new Set(), new Set([latest - 4]));
    const res = await GET(req());
    const body = await res.json();
    expect(body.data).toHaveLength(9);
    expect(body.data.map((d: { year: number }) => d.year)).not.toContain(latest - 4);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=300");
  });
});
