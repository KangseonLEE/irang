/**
 * KOSIS 귀농·귀촌 조회 — 실패와 '자료 없음(공표 전)'을 가른다 (2026-10-16 데이터 정합성 1차 QA 🟡-1).
 *
 * 사고: 5초 시간 초과도 빈 배열이라 '2025 자료 없음'으로 읽혀 조용히 2024 로 내려갔다
 *       (수집기가 ACTIVE_RETURN_YEAR 2025 → 2024 로 다시 씀, 화면은 7일 캐시로 1년 묵은 값 가능).
 * 규칙: err 30(데이터가 존재하지 않습니다)일 때만 전년도. 시간 초과·HTTP 오류·다른 err·세 표 중 하나라도 실패면
 *       화면용은 빈 배열(카드 숨김), 스크립트용(Strict)은 재시도 후 throw.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  KosisFetchError,
  fetchCropIncome,
  fetchRiceIncome,
  fetchReturnFarmStats,
  fetchReturnFarmStatsOfYear,
  fetchReturnFarmStatsStrict,
  fetchReturnFarmTrend,
} from "@/lib/api/kosis";

const YEAR = new Date().getFullYear();
const row = (tbl: string, year: number, itm: string, dt: string, c1 = "47730", nm = "의성군") => ({
  C1: c1, C1_NM: nm, C2: "0", C2_NM: "계", ITM_ID: itm, ITM_NM: "", DT: dt, PRD_DE: String(year), TBL_ID: tbl,
});
const NO_DATA = { err: "30", errMsg: "데이터가 존재하지 않습니다." };

type Behavior = "ok" | "nodata" | "timeout" | "http500" | "err21";
/** (표, 연도) → 동작. 기본: Y-1 자료 없음, Y-2 정상 */
function mockKosis(plan: (tbl: string, year: number) => Behavior, values = { person: "138", household: "132", rural: "1162" }) {
  const calls: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string | URL) => {
      const u = new URL(String(input));
      const tbl = u.searchParams.get("tblId")!;
      const year = Number(u.searchParams.get("startPrdDe"));
      calls.push(`${tbl}:${year}`);
      const b = plan(tbl, year);
      if (b === "timeout") throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
      if (b === "http500") return new Response("boom", { status: 500 });
      if (b === "err21") return Response.json({ err: "21", errMsg: "잘못된 요청 변수" });
      if (b === "nodata") return Response.json(NO_DATA);
      const body =
        tbl === "DT_1A02002"
          ? [row(tbl, year, "T02", values.person)]
          : tbl === "DT_1A02008"
            ? [row(tbl, year, "T01", values.household)]
            : [row(tbl, year, "T01", values.rural)];
      return Response.json(body);
    }),
  );
  return calls;
}

beforeEach(() => {
  vi.stubEnv("KOSIS_API_KEY", "test-key");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("자료 없음(err 30)일 때만 전년도", () => {
  it("올해−1 이 공표 전이면 올해−2 값", async () => {
    mockKosis((_, y) => (y === YEAR - 1 ? "nodata" : "ok"));
    const rows = await fetchReturnFarmStats("47730", "의성군");
    expect(rows).toEqual([
      { regionCode: "47730", regionName: "의성군", returnFarmPerson: 138, returnFarmHousehold: 132, returnRuralPerson: 1162, year: YEAR - 2 },
    ]);
  });

  it("비공개('X')뿐인 해는 전년도 (2025 울릉)", async () => {
    let n = 0;
    // 올해−1 은 X, 올해−2 는 숫자
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const u = new URL(String(input));
        const tbl = u.searchParams.get("tblId")!;
        const year = Number(u.searchParams.get("startPrdDe"));
        n++;
        const dt = year === YEAR - 1 ? "X" : "5";
        return Response.json([row(tbl, year, tbl === "DT_1A02002" ? "T02" : "T01", dt, "47940", "울릉군")]);
      }),
    );
    const rows = await fetchReturnFarmStats("47940", "울릉군");
    expect(rows[0]?.year).toBe(YEAR - 2);
    expect(n).toBe(6);
  });
});

describe("실패는 전년도로 내려가지 않는다", () => {
  for (const b of ["timeout", "http500", "err21"] as const) {
    it(`화면용 — 올해−1 귀농인 표 ${b} → 빈 배열(카드 숨김), 올해−2 를 묻지 않는다`, async () => {
      const calls = mockKosis((tbl, y) => (y === YEAR - 1 && tbl === "DT_1A02002" ? b : "ok"));
      expect(await fetchReturnFarmStats("47730", "의성군")).toEqual([]);
      expect(calls.some((c) => c.endsWith(`:${YEAR - 2}`))).toBe(false);
    });
  }

  it("화면용 — 가구·귀촌 표만 실패해도 0 으로 채우지 않고 빈 배열", async () => {
    mockKosis((tbl, y) => (y === YEAR - 1 && tbl === "DT_1A02015" ? "timeout" : "ok"));
    expect(await fetchReturnFarmStats("47730", "의성군")).toEqual([]);
  });

  it("화면용 — 귀농인은 있는데 가구 표가 자료 없음이면 빈 배열", async () => {
    mockKosis((tbl) => (tbl === "DT_1A02008" ? "nodata" : "ok"));
    expect(await fetchReturnFarmStats("47730", "의성군")).toEqual([]);
  });

  it("스크립트용(Strict) — 재시도 후에도 실패면 KosisFetchError", async () => {
    const calls = mockKosis((tbl, y) => (y === YEAR - 1 && tbl === "DT_1A02002" ? "timeout" : "ok"));
    await expect(fetchReturnFarmStatsStrict(undefined, undefined, { retries: 2 })).rejects.toBeInstanceOf(KosisFetchError);
    expect(calls.filter((c) => c === `DT_1A02002:${YEAR - 1}`)).toHaveLength(3);
  });

  it("스크립트용(Strict) — 한 번 시간 초과 뒤 재시도에 성공하면 그 해 값", async () => {
    let first = true;
    mockKosis((tbl, y) => {
      if (y === YEAR - 1 && tbl === "DT_1A02002" && first) {
        first = false;
        return "timeout";
      }
      return "ok";
    });
    const rows = await fetchReturnFarmStatsStrict(undefined, undefined, { retries: 2 });
    expect(rows[0]?.year).toBe(YEAR - 1);
  });

  it("fetchReturnFarmStatsOfYear — 자료 없음은 빈 배열, 실패는 throw", async () => {
    mockKosis(() => "nodata");
    expect(await fetchReturnFarmStatsOfYear(YEAR - 1)).toEqual([]);
    mockKosis(() => "http500");
    await expect(fetchReturnFarmStatsOfYear(YEAR - 1)).rejects.toBeInstanceOf(KosisFetchError);
  });

  it("Strict — 키가 없으면 throw (화면용은 빈 배열)", async () => {
    vi.stubEnv("KOSIS_API_KEY", "");
    await expect(fetchReturnFarmStatsStrict()).rejects.toBeInstanceOf(KosisFetchError);
    expect(await fetchReturnFarmStats()).toEqual([]);
  });
});

describe("추이 — 세 표 중 하나라도 실패하면 그리지 않는다", () => {
  it("귀촌 표 실패 → 빈 배열(가구·귀촌 0 인 해를 그리지 않는다)", async () => {
    mockKosis((tbl) => (tbl === "DT_1A02015" ? "http500" : "ok"));
    expect(await fetchReturnFarmTrend("47730", 10, "의성군")).toEqual([]);
  });
  it("세 표 정상 → 값", async () => {
    mockKosis(() => "ok");
    const t = await fetchReturnFarmTrend("47730", 10, "의성군");
    expect(t[0]).toMatchObject({ returnFarmPerson: 138, returnFarmHousehold: 132, returnRuralPerson: 1162 });
  });
});

describe("err 21(표에 없는 지역 코드) — '그 지역 행 없음' (10/16 2차 QA)", () => {
  it("지역 하나 조회의 err 21 → 빈 배열, 재시도·다른 해·경고 없음", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const calls = mockKosis(() => "err21");
    expect(await fetchReturnFarmStatsStrict("11010", "종로구", { retries: 2 })).toEqual([]);
    expect(await fetchReturnFarmStats("11010", "종로구")).toEqual([]);
    // 표 3개 × 1회 × 2번 호출 — 재시도(×3)·다른 해(×3) 없음
    expect(calls).toHaveLength(6);
    expect(calls.every((c) => c.endsWith(`:${YEAR - 1}`))).toBe(true);
    expect(warn).not.toHaveBeenCalled();
  });

  it("전체(ALL) 조회의 err 21 은 진짜 요청 오류 — 실패", async () => {
    mockKosis(() => "err21");
    await expect(fetchReturnFarmStatsStrict()).rejects.toBeInstanceOf(KosisFetchError);
  });

  it("추이 — err 21 은 빈 추이(실패 경고 아님)", async () => {
    mockKosis(() => "err21");
    expect(await fetchReturnFarmTrend("11010", 10, "종로구")).toEqual([]);
  });
});

describe("작물 소득 — 실패는 전년산으로 내려가지 않는다 (10/16 2차 QA 🟡-④)", () => {
  const incomeRows = (year: number) =>
    [
      ["총수입", "1500000"],
      ["경영비", "760000"],
      ["소득", "740000"],
    ].map(([c2, dt]) => ({ C1: "00", C1_NM: "전국평균", C2_NM: c2, ITM_NM: "10a당", UNIT_NM: "원", DT: dt, PRD_DE: String(year) }));
  function mockIncome(plan: (year: number) => Behavior) {
    const years: number[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL) => {
        const year = Number(new URL(String(input)).searchParams.get("startPrdDe"));
        years.push(year);
        const b = plan(year);
        if (b === "timeout") throw new DOMException("timeout", "TimeoutError");
        if (b === "http500") return new Response("boom", { status: 500 });
        if (b === "nodata") return Response.json(NO_DATA);
        if (b === "err21") return Response.json({ err: "21" });
        return Response.json(incomeRows(year));
      }),
    );
    return years;
  }

  it("쌀 — 올해−1 시간 초과 → null(정적 유지), 올해−2 를 묻지 않는다", async () => {
    const years = mockIncome((y) => (y === YEAR - 1 ? "timeout" : "ok"));
    expect(await fetchRiceIncome()).toBeNull();
    expect(years).toEqual([YEAR - 1]);
  });

  it("쌀 — 올해−1 공표 전(err 30)이면 올해−2 값", async () => {
    mockIncome((y) => (y === YEAR - 1 ? "nodata" : "ok"));
    expect((await fetchRiceIncome())?.year).toBe(YEAR - 2);
  });

  it("작물(마늘) — HTTP 오류 → null, 전년산으로 내려가지 않는다", async () => {
    const years = mockIncome((y) => (y === YEAR - 1 ? "http500" : "ok"));
    expect(await fetchCropIncome("DT_1EC0044")).toBeNull();
    expect(years).toEqual([YEAR - 1]);
  });
});
