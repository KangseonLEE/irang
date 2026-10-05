/**
 * agrix(uni.agrix.go.kr) 수집 — 접수 기간·상태 매핑 + 실패 판정 (2026-10-04 DE-A 후속)
 *
 * 배경: fetchAgrixPrograms 가 원천의 reqstpdBeginYm/EndYm(접수 시작·종료 월)을 쓰지 않아
 * 행 조립의 `dateStart || today` 폴백으로 crawl-agrix-* 30행이 전부 "수집일 ~ 수집일 / 마감"이었다.
 * 월 단위 원천 값을 그 달 1일~말일로 채우고, 값이 없으면 수집일 대신 9999 페어로 둔다.
 * 또 요청 실패·형식 변경을 0건으로 삼키지 않는다 ("성공·0건" 금지).
 *
 * fixture: src/__tests__/fixtures/agrix/saup-list-2025.json — 10/4 실제 응답에서 8건만 잘라 둔 것.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  UNKNOWN_DATE,
  agrixMonthDate,
  agrixOrganization,
  agrixWindow,
  crawlSlug,
  fetchAgrixPrograms,
  mapAgrixItem,
  uniqueAgrixResults,
  type AgrixResult,
} from "../../supabase/functions/_shared/crawl-utils";

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "src/__tests__/fixtures/agrix/saup-list-2025.json"), "utf8"),
) as { result: AgrixResult[]; lgvResult: AgrixResult[]; totCnt: number };

const TODAY = "2026-10-04";
const byName = (name: string) => {
  const raw = fixture.result.find((r) => r.sLawname === name);
  if (!raw) throw new Error(`fixture 에 ${name} 없음`);
  return raw;
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("agrix 접수 월 → 날짜", () => {
  it("시작은 그 달 1일, 종료는 그 달 말일 (윤년 포함)", () => {
    expect(agrixMonthDate("202505", "start")).toBe("2025-05-01");
    expect(agrixMonthDate("202505", "end")).toBe("2025-05-31");
    expect(agrixMonthDate("202502", "end")).toBe("2025-02-28");
    expect(agrixMonthDate("202402", "end")).toBe("2024-02-29");
    expect(agrixMonthDate("202512", "end")).toBe("2025-12-31");
  });

  it("YYYYMMDD·YYYY-MM 표기도 받고, 비었거나 달력에 없는 값은 버린다", () => {
    expect(agrixMonthDate("20250315", "start")).toBe("2025-03-15");
    expect(agrixMonthDate("2025-12", "end")).toBe("2025-12-31");
    expect(agrixMonthDate("202513", "start")).toBeUndefined();
    expect(agrixMonthDate("20250230", "end")).toBeUndefined();
    expect(agrixMonthDate("", "start")).toBeUndefined();
    expect(agrixMonthDate(null, "end")).toBeUndefined();
    expect(agrixMonthDate("상시", "end")).toBeUndefined();
  });

  it("종료 월을 모르면 9999 페어, 시작 월만 모르면 시작 미상 — 수집일로 채우지 않는다", () => {
    expect(agrixWindow("202505", "202506")).toEqual({ start: "2025-05-01", end: "2025-06-30" });
    expect(agrixWindow(null, null)).toEqual({ start: UNKNOWN_DATE, end: UNKNOWN_DATE });
    expect(agrixWindow("202501", null)).toEqual({ start: UNKNOWN_DATE, end: UNKNOWN_DATE });
    expect(agrixWindow(null, "202512")).toEqual({ start: UNKNOWN_DATE, end: "2025-12-31" });
    expect(agrixWindow("202512", "202501")).toEqual({ start: UNKNOWN_DATE, end: "2025-01-31" });
  });
});

describe("agrix 응답 → 항목 (fixture)", () => {
  it("result·lgvResult 가 같은 목록이라 sLawseq 로 한 번만 남긴다", () => {
    expect(fixture.lgvResult).toEqual(fixture.result);
    expect(uniqueAgrixResults(fixture)).toHaveLength(8);
    expect(uniqueAgrixResults({ totCnt: 0 })).toEqual([]);
  });

  /** 접수 월이 있는 항목은 반드시 매핑된다 — null 이면 테스트 실패 */
  const mapped = (raw: AgrixResult, today = TODAY, year = 2025) => {
    const item = mapAgrixItem(raw, today, year);
    if (!item) throw new Error(`${raw.sLawname} 이 null`);
    return item;
  };

  it("2025년 접수 기간은 원문 월로 채우고 10/4 기준 마감, 연도는 받은 목록 연도", () => {
    const item = mapped(byName("경관보전직불"));
    expect(item.dateStart).toBe("2025-05-01");
    expect(item.dateEnd).toBe("2025-06-30");
    expect(item.status).toBe("마감");
    expect(item.year).toBe(2025);
    expect(mapped(byName("농기계 등화장치 부착지원"))).toMatchObject({
      dateStart: "2024-12-01",
      dateEnd: "2025-12-31",
      status: "마감",
    });
  });

  it("접수 월이 없는 사업은 적재하지 않는다 — 작년 목록에 '공고 발표 예정'은 사실이 아니다 (10/4 CoS 결정)", () => {
    const noPeriod = fixture.result.filter((raw) => !raw.reqstpdEndYm);
    expect(noPeriod.map((raw) => raw.sLawname.trim())).toEqual([
      "피해보전직불",
      "노후 농업기계 미세먼지 저감대책 지원사업",
      "농업기계 신고관리시스템 구축·운영",
    ]);
    for (const raw of noPeriod) expect(mapAgrixItem(raw, TODAY, 2025)).toBeNull();
    // 시작 월만 없으면 시작 미상 + 마감일로 적재 (마감일을 아는 공고)
    expect(mapAgrixItem({ ...byName("피해보전직불"), reqstpdEndYm: "202512" }, TODAY, 2025)).toMatchObject({
      dateStart: UNKNOWN_DATE,
      dateEnd: "2025-12-31",
    });
    // 수집일이 들어가는 경로가 없다
    for (const raw of fixture.result) {
      const item = mapAgrixItem(raw, TODAY, 2025);
      expect(item?.dateStart).not.toBe(TODAY);
      expect(item?.dateEnd).not.toBe(TODAY);
    }
  });

  it("접수 기간 안이면 모집중 — 상태를 날짜로 판정한다", () => {
    expect(mapped(byName("농지이양은퇴직불"), "2025-07-01").status).toBe("모집중");
    expect(mapped(byName("경관보전직불"), "2025-04-30").status).toBe("모집예정");
  });

  it("주관 기관은 같은 레코드의 소관 부처 + 담당 과 (과 이름만으론 기관을 알 수 없다)", () => {
    expect(fixture.result.every((raw) => raw.deptOrgn === "농림축산식품부")).toBe(true);
    expect(mapped(byName("경관보전직불")).organization).toBe("농림축산식품부 농촌경제과");
    expect(
      agrixOrganization({ ...byName("경관보전직불"), chrgkwaNm: "축산환경자원과,전략작물육성팀" }),
    ).toBe("농림축산식품부 축산환경자원과·전략작물육성팀");
    expect(agrixOrganization({ ...byName("경관보전직불"), deptOrgn: null })).toBe("농촌경제과");
    expect(agrixOrganization({ ...byName("경관보전직불"), deptOrgn: null, chrgkwaNm: null })).toBe("농림축산식품부");
  });

  it("제목은 끝 공백까지 그대로 — slug 가 기존 행과 같아야 한다", () => {
    const raw = { ...byName("노후 농업기계 미세먼지 저감대책 지원사업 "), reqstpdBeginYm: "202501", reqstpdEndYm: "202512" };
    const item = mapped(raw);
    expect(item.title).toBe("노후 농업기계 미세먼지 저감대책 지원사업 ");
    expect(crawlSlug("agrix-programs", item.title)).toBe(crawlSlug("agrix-programs", raw.sLawname));
    expect(item.url).toBe(`https://uni.agrix.go.kr/guide/lmxsrv/law/lawFullView.do?SEQ=${raw.sLawseq}`);
    expect(item.organization).toBe("농림축산식품부 첨단기자재종자과");
    expect(item.capacity).toBe("농가,농업법인/농업기관");
  });
});

describe("fetchAgrixPrograms — 실패를 0건으로 삼키지 않는다", () => {
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

  it("올해 0건이면 작년으로 내려가 항목을 돌려준다 (정상)", async () => {
    vi.useFakeTimers({ now: new Date("2026-10-04T03:00:00Z"), toFake: ["Date"] });
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ totCnt: 0, lTotCnt: 0 }))
      .mockResolvedValueOnce(json(fixture));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchAgrixPrograms(1, 30);
    expect(result.errors).toEqual([]);
    expect(result.items).toHaveLength(5); // 8건 중 접수 월 없는 3건 제외
    expect(result.items.every((item) => item.year === 2025)).toBe(true); // 폴백한 목록 연도
    expect(String(fetchMock.mock.calls[0][1].body)).toContain("saupYear=2026");
    expect(String(fetchMock.mock.calls[1][1].body)).toContain("saupYear=2025");
    expect(fetchMock.mock.calls[0][1].headers["User-Agent"]).toContain("irang-datasync");
  });

  it("받은 목록이 전부 접수 월이 없어 0건이면 실패", async () => {
    const noPeriod = fixture.result.filter((raw) => !raw.reqstpdEndYm);
    vi.stubGlobal("fetch", vi.fn(async () => json({ totCnt: 3, result: noPeriod })));
    const result = await fetchAgrixPrograms(1, 30);
    expect(result.items).toEqual([]);
    expect(result.errors[0]).toMatch(/3건 모두 접수 월이 없어 적재 0건/);
  });

  it("totCnt 가 있는데 목록이 비면 형식 변경으로 본다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ totCnt: 371, result: [] })));
    const result = await fetchAgrixPrograms(1, 30);
    expect(result.items).toEqual([]);
    expect(result.errors[0]).toMatch(/totCnt 371인데 목록 0건/);
  });

  it("올해·작년 모두 0건도 실패 — 농식품부 사업 목록이 통째로 빌 수는 없다", async () => {
    // 호출마다 새 Response — 같은 객체를 두 번 읽으면 본문 재사용 오류가 난다
    const fetchMock = vi.fn(async () => json({ totCnt: 0 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchAgrixPrograms(1, 30);
    expect(result.items).toEqual([]);
    expect(result.errors[0]).toMatch(/모두 0건/);
    expect(fetchMock).toHaveBeenCalledTimes(2); // 올해 → 작년, 재시도 없음(정상 응답)
  });

  it("JSON 이 아닌 응답(점검 페이지)은 실패", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>점검 중</html>", { status: 200 })));
    const result = await fetchAgrixPrograms(1, 30);
    expect(result.errors[0]).toMatch(/요청 실패/);
  });

  it("네트워크 오류는 10초 뒤 한 번 더 받고, 그래도 실패면 errors", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);
    const pending = fetchAgrixPrograms(1, 30);
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.items).toEqual([]);
    expect(result.errors).toEqual(["agrix 2026년 목록 요청 실패(재시도 후) — fetch failed"]);
  });
});
