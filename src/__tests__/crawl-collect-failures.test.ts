/**
 * sync-crawl 수집기 "성공·0건" 금지 (2026-10-04 DE-A 후속)
 *
 * 배경: RDA 목록이 15초를 넘기면(10/3 실측 2회) 수집기가 빈 배열을 돌려주고 함수는 "0건 성공"으로
 * 끝났다 — sync-rda 가 6개월간 fetched 0 · "success" 였던 것과 같은 유형. 그린대로도 HTTP 오류·HTML
 * 응답·네트워크 오류를 전부 빈 배열로 삼켰다. 이제 수집기는 `{ items, errors }` 를 돌려주고,
 * errors 가 있으면 sync-crawl 이 그 타깃을 ok:false 로 집계한다 (sync-data.yml Phase B 실패 판정).
 *  · 네트워크·타임아웃·5xx 는 10초 뒤 한 번 더 받는다 (일시 지연 흡수) — 4xx·형식 이상은 바로 실패
 *  · 원천이 정상 응답한 0건("총 0건"·빈 목록)은 실패가 아니다
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  describeError,
  fetchRdaEvents,
  fetchRdaListing,
  fetchWithRetry,
} from "../../supabase/functions/_shared/crawl-utils";
import {
  fetchGreendaeroEducation,
  fetchGreendaeroLive,
} from "../../supabase/functions/_shared/greendaero";

const fixture = (name: string) =>
  readFileSync(join(process.cwd(), "src/__tests__/fixtures/rda", name), "utf8");
const html = (body: string, status = 200) => new Response(body, { status });
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const timeoutError = () => Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" });

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("fetchWithRetry — 일시 실패만 한 번 더", () => {
  it("5xx 다음 성공이면 그 응답을 돌려준다", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(html("", 503))
      .mockResolvedValueOnce(html("ok"));
    vi.stubGlobal("fetch", fetchMock);
    const res = await fetchWithRetry("https://x.test", {}, { timeoutMs: 1000, backoffMs: 0 });
    expect(await res.text()).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("4xx 는 다시 해도 같아 바로 실패", async () => {
    const fetchMock = vi.fn(async () => html("", 404));
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchWithRetry("https://x.test", {}, { timeoutMs: 1000, backoffMs: 0 })).rejects.toThrow("HTTP 404");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("네트워크 오류가 두 번이면 throw, retry:false 면 한 번만", async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchWithRetry("https://x.test", {}, { timeoutMs: 1000, backoffMs: 0 })).rejects.toThrow("fetch failed");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    fetchMock.mockClear();
    await expect(
      fetchWithRetry("https://x.test", {}, { timeoutMs: 1000, backoffMs: 0, retry: false }),
    ).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("타임아웃은 사람이 읽는 말로", () => {
    expect(describeError(timeoutError())).toBe("타임아웃");
    expect(describeError(new Error("HTTP 502"))).toBe("HTTP 502");
  });
});

describe("RDA 목록 — 실패를 0건으로 삼키지 않는다", () => {
  it("정상 목록(총 6건, 1페이지)은 오류 없음", async () => {
    const fetchMock = vi.fn(async () => html(fixture("listing-programs.html")));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchRdaListing({ search_category: "교육" });
    expect(result.items).toHaveLength(6);
    expect(result.errors).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("'총 0건' + '조회된 데이터가 없습니다'는 정상 0건", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      html('<p class="resTxt">총 0건</p><table><tbody><tr><td colspan="7">조회된 데이터가 없습니다.</td></tr></tbody></table>'),
    ));
    const result = await fetchRdaListing();
    expect(result).toEqual({ items: [], errors: [] });
  });

  it("'총 6건'인데 행을 하나도 못 읽으면 표 구조 변경", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html('<p class="resTxt">총 6건</p><table><tbody></tbody></table>')));
    const result = await fetchRdaListing();
    expect(result.items).toEqual([]);
    expect(result.errors).toEqual(["RDA 목록: 총 6건인데 해석한 행이 0건 — 표 구조 변경 의심"]);
  });

  it("총건수·표·빈 목록 안내가 다 없는 응답(점검 페이지)은 형식 변경", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html("<html><body>시스템 점검 중입니다</body></html>")));
    const result = await fetchRdaListing();
    expect(result.errors[0]).toMatch(/응답 형식 변경 의심/);
  });

  it("1페이지가 두 번 다 타임아웃이면 실패 (10초 쉬고 한 번 더)", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => {
      throw timeoutError();
    });
    vi.stubGlobal("fetch", fetchMock);
    const pending = fetchRdaListing();
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ items: [], errors: ["RDA 목록 요청 실패(재시도 후) — 타임아웃"] });
  });

  it("1페이지 첫 시도만 지연되면 재시도로 흡수 — 오류 없음", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(timeoutError())
      .mockImplementationOnce(async () => html(fixture("listing-programs.html")));
    vi.stubGlobal("fetch", fetchMock);
    const pending = fetchRdaListing();
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(result.items).toHaveLength(6);
    expect(result.errors).toEqual([]);
  });

  it("뒤 페이지 실패는 앞 페이지 항목을 살리고 오류로 남긴다 (재시도 없음)", async () => {
    const fetchMock = vi.fn()
      .mockImplementationOnce(async () => html(fixture("listing-all-p1.html"))) // 총 15건 → 2페이지
      .mockImplementationOnce(async () => html("", 500));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchRdaListing({ search_ingState: "진행중" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.items).toHaveLength(10);
    expect(result.errors).toEqual(["RDA 목록 2페이지 요청 실패 — HTTP 500 (앞 페이지 10건은 적재)"]);
  });

  it("행사 타깃은 목록 오류를 그대로 넘기고, 목록이 정상이면 행사 0건도 정상", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html('<p class="resTxt">총 3건</p><table><tbody></tbody></table>')));
    expect((await fetchRdaEvents()).errors).toHaveLength(1);
    vi.stubGlobal("fetch", vi.fn(async () => html(fixture("listing-programs.html"))));
    expect(await fetchRdaEvents()).toEqual({ items: [], errors: [] });
  });
});

describe("그린대로 — 같은 구멍을 막는다", () => {
  const GD_TODAY = "2026-10-04";
  /** greendaero-mapping.test.ts 와 같은 실측 샘플 (접수 9/1~9/29) */
  const EDU_ITEM = {
    ednstNm: "농협창업농지원센터",
    eduCrseId: "EDUCRSE_000000006060",
    eduDetailCrseId: "EDUDCRSE_00000013314",
    eduDetailCrseNm: "2026년 농업일자리 탐색교육(4h) (대면)",
    atpnCn: "(대면) 땅끝농협 농업일자리 탐색교육 1기 13:00 ~17:00",
    eduspntdBaddr: "전남광주통합특별시 해남군 송지면 산정1길 80",
    eduRcrtBgngDt: "2026-09-01",
    eduRcrtEndDt: "2026-09-29",
    eduBgngYmd: "20260930",
    eduEndYmd: "20260930",
    eduOperSeNm: "오프라인(대면교육)",
    eduSeNm: "농업일자리탐색(4h)",
    eduTypeNm: "농업일자리탐색",
    planNope: "30",
  };

  it("교육: 정상 응답은 항목, 오류 없음", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ page: 1, itemsPerPage: 200, totalItems: 1, list: [EDU_ITEM] })));
    const result = await fetchGreendaeroEducation("2026-09-20"); // KST 오늘은 sync-crawl 이 넘긴다
    expect(result.items).toHaveLength(1);
    expect(result.errors).toEqual([]);
  });

  it("교육: 상태는 넘겨받은 KST 날짜로 판정 — 06:00 KST(전날 21:00 UTC) 실행에서도 하루 밀리지 않는다", async () => {
    // 접수 마감 9/29 공고를 9/30 06:00 KST 에 수집하면 마감이라 버려야 한다. UTC 날짜(9/29)로 보면 모집중으로 남았다
    vi.stubGlobal("fetch", vi.fn(async () => json({ page: 1, itemsPerPage: 200, totalItems: 1, list: [EDU_ITEM] })));
    expect((await fetchGreendaeroEducation("2026-09-30")).items).toEqual([]);
    vi.stubGlobal("fetch", vi.fn(async () => json({ page: 1, itemsPerPage: 200, totalItems: 1, list: [EDU_ITEM] })));
    expect((await fetchGreendaeroEducation("2026-09-29")).items).toHaveLength(1);
  });

  it("교육: HTTP 404 는 재시도 없이 실패", async () => {
    const fetchMock = vi.fn(async () => html("", 404));
    vi.stubGlobal("fetch", fetchMock);
    const result = await fetchGreendaeroEducation(GD_TODAY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ items: [], errors: ["그린대로 교육 1페이지 요청 실패 — HTTP 404"] });
  });

  it("교육: 200 + HTML(경로 변경)은 형식 오류", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => html("<!DOCTYPE html><html>그린대로</html>")));
    const result = await fetchGreendaeroEducation(GD_TODAY);
    expect(result.errors[0]).toMatch(/JSON이 아님/);
  });

  it("교육: totalItems 가 있는데 목록이 비면 실패", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ page: 1, itemsPerPage: 200, totalItems: 2627, list: [] })));
    const result = await fetchGreendaeroEducation(GD_TODAY);
    expect(result.errors).toEqual(["그린대로 교육: totalItems 2627인데 목록 0건 — 파라미터·형식 변경 의심"]);
  });

  it("살아보기: list 가 없거나 cnt 와 어긋나면 실패, 네트워크 오류는 한 번 더 받고 실패", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ cnt: 0, list: null })));
    expect((await fetchGreendaeroLive(GD_TODAY)).errors[0]).toMatch(/list 가 없음/);

    vi.stubGlobal("fetch", vi.fn(async () => json({ cnt: 302, list: [] })));
    expect((await fetchGreendaeroLive(GD_TODAY)).errors[0]).toMatch(/cnt 302인데 목록 0건/);

    vi.stubGlobal("fetch", vi.fn(async () => json({ cnt: 0, list: [] })));
    expect(await fetchGreendaeroLive(GD_TODAY)).toEqual({ items: [], errors: [] });

    vi.useFakeTimers();
    const fetchMock = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    vi.stubGlobal("fetch", fetchMock);
    const pending = fetchGreendaeroLive(GD_TODAY);
    await vi.advanceTimersByTimeAsync(10_000);
    const result = await pending;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.errors).toEqual(["그린대로 살아보기 목록 요청 실패(재시도 후) — fetch failed"]);
  });
});
