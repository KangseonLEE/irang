/**
 * /api/return-farm-trend — KOSIS 실패는 502 + no-store, 성공·자료 없음만 하루 캐시 (2026-10-26 QA 🟡-3)
 *
 * 사고 형태: 실패해도 `{ data: [] }` 200 + `s-maxage=86400` 이라 빈 추이가 CDN 에 하루 굳었다(모달 '잠시 후 다시 시도'가 하루 내내).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/return-farm-trend/route";

const row = (tbl: string, itm: string, dt: string, year: number) => ({
  C1: "37320", C1_NM: "의성군", C2: "0", C2_NM: "계", ITM_ID: itm, ITM_NM: "", DT: dt, PRD_DE: String(year), TBL_ID: tbl,
});

function stubKosis(mode: "ok" | "fail-rural" | "nodata") {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const u = new URL(String(input));
      const tbl = u.searchParams.get("tblId")!;
      const year = Number(u.searchParams.get("endPrdDe"));
      if (mode === "nodata") return Response.json({ err: "30", errMsg: "데이터가 존재하지 않습니다." });
      if (mode === "fail-rural" && tbl === "DT_1A02015") return Response.json({ err: "20", errMsg: "필수요청변수값이 누락되었습니다." });
      return Response.json([row(tbl, tbl === "DT_1A02002" ? "T02" : "T01", "100", year)]);
    }),
  );
}

const req = (code = "37320") =>
  new NextRequest(`http://localhost/api/return-farm-trend?regionCode=${code}&years=10`, {
    headers: { "x-forwarded-for": `10.2.2.${Math.floor(Math.random() * 250)}` },
  });

beforeEach(() => {
  vi.stubEnv("KOSIS_API_KEY", "test-key");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("/api/return-farm-trend 캐시", () => {
  it("KOSIS 오류 응답(200 JSON err) → 502 + no-store", async () => {
    stubKosis("fail-rural");
    const res = await GET(req());
    expect(res.status).toBe(502);
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("성공 → 200 + 하루 캐시", async () => {
    stubKosis("ok");
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=86400");
    expect((await res.json()).data[0]).toMatchObject({ returnFarmPerson: 100, returnFarmHousehold: 100, returnRuralPerson: 100 });
  });

  it("자료 없음 → 200 빈 배열(실패 아님)", async () => {
    stubKosis("nodata");
    const res = await GET(req());
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
  });

  it("우리 시·군·구가 아닌 코드 → KOSIS 안 부르고 200 빈 배열", async () => {
    stubKosis("ok");
    const res = await GET(req("99999"));
    expect(res.status).toBe(200);
    expect((await res.json()).data).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
