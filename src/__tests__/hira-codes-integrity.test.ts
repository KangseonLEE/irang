/**
 * 심평원 의료기관 코드·집계 정합성 회귀 테스트 (2026-10-07 운영 전수 대조 후속)
 *
 * 보호 대상:
 *   1) 광주 = '전남광주'(360000) 아래 광주 5구 합, 전남 = 통합 코드 − 광주 5구, 세종 = 410000
 *   2) 시 아래 구는 구 코드 하나만 센다 — 시 대표 코드와 같은 구(영통·분당…)가 시 전체로 합쳐지던 것
 *   3) 합산 중 한 곳이라도 실패하면 숫자를 내지 않는다(덜 센 합 금지)
 *   4) 시 아래 구 코드표 — 심평원 응답 지역명으로 확인한 값 고정(뒤바뀐 16곳)
 *   5) 의료기관 목록은 조회 단위를 이어 붙여 30건씩
 *   6) 구 신설 뒤 시 단위 코드로 남은 기관(화성 312500)은 법정 읍·면·동으로 그 구에 더한다 — 카드·목록 같게 (10/7)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import {
  GU_HIRA_CODES_MAP,
  fetchGuMedicalFacilities,
  fetchMedicalFacilities,
  fetchSigunguMedicalFacilities,
  hiraListUnits,
  toHiraSidoCd,
} from "@/lib/api/hira";
import { GUS } from "@/lib/data/gus";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GET as medicalList } from "@/app/api/medical-list/route";

/** 심평원 흉내 — (sidoCd, sgguCd) 별 건수. 목록 요청이면 그만큼 행을 만든다(listed 에 있으면 그 행을 그대로) */
function stubHira(
  counts: Record<string, number>,
  fail: Set<string> = new Set(),
  listed: Record<string, Record<string, string>[]> = {},
) {
  const calls: URLSearchParams[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const q = new URL(input).searchParams;
      calls.push(q);
      const key = `${q.get("sidoCd")}/${q.get("sgguCd") ?? ""}`;
      if (fail.has(key)) return new Response("down", { status: 503 });
      const total = listed[key]?.length ?? counts[key] ?? 0;
      const rows = Number(q.get("numOfRows"));
      const page = Number(q.get("pageNo"));
      const n = Math.max(0, Math.min(rows, total - (page - 1) * rows));
      const item = listed[key]
        ? listed[key].slice((page - 1) * rows, (page - 1) * rows + n)
        : Array.from({ length: n }, (_, i) => ({
            yadmNm: `${key}#${(page - 1) * rows + i}`,
            clCdNm: "의원",
            addr: "",
            telno: "",
          }));
      return new Response(JSON.stringify({ response: { body: { totalCount: total, items: { item } } } }));
    }),
  );
  return calls;
}

beforeEach(() => {
  vi.stubEnv("DATA_GO_KR_API_KEY", "KEY");
  vi.stubEnv("DATA_GO_KR_PROXY_URL", "");
  vi.stubEnv("DATA_GO_KR_PROXY_SECRET", "");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const GWANGJU = ["360801", "360802", "360803", "360804", "360805"];

// 화성 312500 — 구 신설 뒤에도 시 단위 코드로 남은 2곳(송산보건지소 송산면·안석보건진료소 남양읍, 10/7 실측)
const RESIDUAL_312500 = [
  { yadmNm: "송산보건지소", clCdNm: "보건지소", addr: "경기도 화성시 송산면 사강로 1", emdongNm: "송산면", telno: "" },
  { yadmNm: "안석보건진료소", clCdNm: "보건진료소", addr: "경기도 화성시 남양읍 안석길 1", emdongNm: "남양읍", telno: "" },
];

describe("시·도 코드 → 심평원 조회 방식", () => {
  it("광주·전남은 통합 코드, 세종은 410000, 나머지는 그대로", () => {
    expect(toHiraSidoCd("240000")).toBe("360000");
    expect(toHiraSidoCd("360000")).toBe("360000");
    expect(toHiraSidoCd("290000")).toBe("410000");
    expect(toHiraSidoCd("110000")).toBe("110000");
  });

  it("광주 = 광주 5구 합, 전남 = 통합 전체 − 광주 5구, 세종 = 410000 전체", async () => {
    const counts: Record<string, number> = { "360000/": 4953, "410000/": 470 };
    GWANGJU.forEach((c, i) => (counts[`360000/${c}`] = [237, 642, 578, 523, 353][i]));
    stubHira(counts);
    const [gwangju, jeonnam, sejong] = await fetchMedicalFacilities(["240000", "360000", "290000"]);
    expect(gwangju).toMatchObject({ sidoCd: "240000", totalCount: 2333 });
    expect(jeonnam).toMatchObject({ sidoCd: "360000", totalCount: 4953 - 2333 });
    expect(sejong).toMatchObject({ sidoCd: "290000", sidoName: "세종특별자치시", totalCount: 470 });
  });

  it("광주 5구 중 하나라도 실패하면 광주 수를 내지 않는다", async () => {
    const counts: Record<string, number> = {};
    GWANGJU.forEach((c) => (counts[`360000/${c}`] = 100));
    stubHira(counts, new Set(["360000/360803"]));
    await expect(fetchMedicalFacilities(["240000"])).resolves.toEqual([]);
  });
});

describe("구가 있는 시·시 아래 구", () => {
  it("시(수원 310604)는 4구 합, 시 아래 구(영통 310604)는 그 구 하나만", async () => {
    const calls = stubHira({ "310000/310601": 378, "310000/310602": 354, "310000/310603": 525, "310000/310604": 549 });
    await expect(fetchSigunguMedicalFacilities("310000", "310604")).resolves.toMatchObject({ totalCount: 1806 });
    calls.length = 0;
    await expect(fetchGuMedicalFacilities("310000", "310604")).resolves.toMatchObject({ totalCount: 549 });
    expect(calls.map((q) => q.get("sgguCd"))).toEqual(["310604"]);
  });

  it("화성 만세구 = 구 코드 269 + 시 단위로 남은 송산면·남양읍 2곳, 동탄구엔 더하지 않는다", async () => {
    stubHira({ "310000/312501": 269, "310000/312504": 468 }, new Set(), { "310000/312500": RESIDUAL_312500 });
    await expect(fetchGuMedicalFacilities("310000", "312501")).resolves.toMatchObject({ totalCount: 271 });
    await expect(fetchGuMedicalFacilities("310000", "312504")).resolves.toMatchObject({ totalCount: 468 });
  });

  it("시 단위 기관 주소가 동 이름만 줄 때는 법정동으로, 어느 구인지 모르면 어느 구에도 넣지 않는다", async () => {
    const listed = {
      "310000/312500": [
        { yadmNm: "가", addr: "경기도 화성시 동탄대로 1 (반송동)", emdongNm: "", clCdNm: "의원", telno: "" },
        { yadmNm: "나", addr: "경기도 화성시 동탄원천로 1 (능동)", emdongNm: "능동", clCdNm: "의원", telno: "" },
      ],
    };
    stubHira({ "310000/312503": 159, "310000/312504": 468 }, new Set(), listed);
    await expect(fetchGuMedicalFacilities("310000", "312504")).resolves.toMatchObject({ totalCount: 469 });
    await expect(fetchGuMedicalFacilities("310000", "312503")).resolves.toMatchObject({ totalCount: 159 });
  });

  it("시 단위 코드 목록을 못 받으면 구 수를 내지 않는다 (덜 센 합 금지)", async () => {
    stubHira({ "310000/312501": 269 }, new Set(["310000/312500"]));
    await expect(fetchGuMedicalFacilities("310000", "312501")).resolves.toBeNull();
  });

  it("부천 원미구(시 대표 코드 310303 과 같음)는 그 구 하나만, 남는 시 단위 코드가 없다", async () => {
    const calls = stubHira({ "310000/310301": 400, "310000/310302": 300, "310000/310303": 700 });
    await expect(fetchGuMedicalFacilities("310000", "310303")).resolves.toMatchObject({ totalCount: 700 });
    expect(calls.map((q) => q.get("sgguCd"))).toEqual(["310303"]);
  });

  it("시 합산 중 한 구라도 실패하면 숫자를 내지 않는다", async () => {
    stubHira({ "310000/310601": 378, "310000/310602": 354, "310000/310603": 525 }, new Set(["310000/310604"]));
    await expect(fetchSigunguMedicalFacilities("310000", "310604")).resolves.toBeNull();
  });

  it("화성시는 2026년 신설 4구와 시 단위 코드를 모두 더한다 (동탄구 하나만 세던 것)", () => {
    const hwaseong = SIGUNGUS.find((s) => s.id === "hwaseong")!;
    expect(GU_HIRA_CODES_MAP[hwaseong.hiraSgguCd]).toEqual(["312500", "312501", "312502", "312503", "312504"]);
  });

  it("목록 조회 단위 — 시는 구 전부, 시 아래 구는 하나, 광주는 5구, 전남은 넘겨받은 시·군", () => {
    expect(hiraListUnits("310000", "310604")).toHaveLength(4);
    expect(hiraListUnits("310000", "310604", { single: true })).toEqual([{ sidoCd: "310000", sgguCd: "310604" }]);
    expect(hiraListUnits("240000", null).map((u) => u.sgguCd)).toEqual(GWANGJU);
    expect(hiraListUnits("240000", null).every((u) => u.sidoCd === "360000")).toBe(true);
    expect(hiraListUnits("360000", null, { provinceGuCodes: ["360500", "360400"] })).toEqual([
      { sidoCd: "360000", sgguCd: "360500" },
      { sidoCd: "360000", sgguCd: "360400" },
    ]);
    expect(hiraListUnits("110000", null)).toEqual([{ sidoCd: "110000" }]);
  });
});

describe("코드표 — 심평원 응답 지역명으로 확인한 값 (10/7)", () => {
  // 심평원이 그 코드로 돌려주는 지역명 기준 — 예전엔 SGIS 순서대로 붙여 16곳이 뒤바뀌어 있었다
  const HIRA_TRUTH: Record<string, string> = {
    "jangan-gu": "310602", "gwonseon-gu": "310601", "paldal-gu": "310603", "yeongtong-gu": "310604",
    "sujeong-gu": "310401", "jungwon-gu": "310402", "bundang-gu": "310403",
    "manan-gu": "310701", "dongan-gu": "310702",
    "sangnok-gu": "311102", "danwon-gu": "311101",
    "deogyang-gu": "311901", "ilsandong-gu": "311903", "ilsanseo-gu": "311902",
    "cheoin-gu": "312003", "giheung-gu": "312001", "suji-gu": "312002",
    "sangdang-gu": "330101", "heungdeok-gu": "330102", "cheongwon-gu": "330103", "seowon-gu": "330104",
    "dongnam-gu": "340202", "seobuk-gu": "340201",
    "wansan-gu": "350401", "deokjin-gu": "350402",
    "nam-gu-pohang": "370701", "buk-gu-pohang": "370702",
    "uichang-gu": "380704", "seongsan-gu": "380705", "masanhappo-gu": "380702", "masanhoewon-gu": "380701", "jinhae-gu": "380703",
    // 10/7 — 부천(2024 재설치)·화성(2026 신설), 응답 지역명 '부천원미구'·'화성만세구' 등으로 확인
    "wonmi-gu": "310303", "sosa-gu": "310301", "ojeong-gu": "310302",
    "manse-gu": "312501", "hyohaeng-gu": "312502", "byeongjeom-gu": "312503", "dongtan-gu": "312504",
  };

  it("시 아래 구 39곳의 심평원 코드", () => {
    expect(GUS).toHaveLength(Object.keys(HIRA_TRUTH).length);
    for (const g of GUS) expect(g.hiraSgguCd, g.id).toBe(HIRA_TRUTH[g.id]);
  });

  it("시 아래 구 코드는 모두 그 시의 구 코드 묶음 안에 있고 겹치지 않는다", () => {
    for (const g of GUS) {
      const city = SIGUNGUS.find((s) => s.id === g.parentSigunguId)!;
      expect(GU_HIRA_CODES_MAP[city.hiraSgguCd], g.id).toContain(g.hiraSgguCd);
    }
    const codes = GUS.map((g) => g.hiraSgguCd);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("청주 3구 통계청 코드 — 서원 33042·흥덕 33043·청원 33044", () => {
    const sgis = Object.fromEntries(GUS.filter((g) => g.parentSigunguId === "cheongju").map((g) => [g.id, g.sgisCode]));
    expect(sgis).toMatchObject({ "seowon-gu": "33042", "heungdeok-gu": "33043", "cheongwon-gu": "33044" });
  });

  it("광주 5구는 통합 코드 아래 새 코드, 세종은 410000", () => {
    const code = (id: string) => SIGUNGUS.find((s) => s.id === id)!.hiraSgguCd;
    expect(["dong-gu-gwangju", "buk-gu-gwangju", "seo-gu-gwangju", "gwangsan", "nam-gu-gwangju"].map(code)).toEqual(GWANGJU);
    expect(code("sejong-si")).toBe("410000");
  });
});

describe("/api/medical-list — 조회 단위 이어 붙이기", () => {
  const req = (q: string) => new NextRequest(`http://localhost/api/medical-list?${q}`, { headers: { "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` } });

  it("광주 시·도 목록은 광주 5구만 이어 붙여 전체 건수·30건씩", async () => {
    const counts: Record<string, number> = { "360000/": 9999 };
    GWANGJU.forEach((c) => (counts[`360000/${c}`] = 20));
    stubHira(counts);
    const res = await medicalList(req("sidoCd=240000&page=1"));
    const body = await res.json();
    expect(body.totalCount).toBe(100);
    expect(body.items).toHaveLength(30);
    const sources = new Set(body.items.map((i: { name: string }) => i.name.split("#")[0]));
    expect([...sources].sort()).toEqual(["360000/360801", "360000/360802"]);
  });

  it("시 아래 구(unit=gu)는 구 하나만", async () => {
    stubHira({ "310000/310601": 378, "310000/310602": 354, "310000/310603": 525, "310000/310604": 549 });
    const body = await (await medicalList(req("sidoCd=310000&sgguCd=310604&page=1&unit=gu"))).json();
    expect(body.totalCount).toBe(549);
    expect(body.items.every((i: { name: string }) => i.name.startsWith("310000/310604#"))).toBe(true);
  });

  it("화성 만세구(unit=gu) 목록 = 구 코드 269 뒤에 시 단위로 남은 2곳 — 상세 카드 271 과 같다", async () => {
    stubHira({ "310000/312501": 269 }, new Set(), { "310000/312500": RESIDUAL_312500 });
    const last = await (await medicalList(req("sidoCd=310000&sgguCd=312501&page=9&unit=gu"))).json();
    expect(last.totalCount).toBe(271);
    // 9쪽 = 240~269번째 — 구 코드 끝 29건 + 송산보건지소 1건
    expect(last.items).toHaveLength(30);
    expect(last.items.map((i: { name: string }) => i.name)).toContain("송산보건지소");
    const tail = await (await medicalList(req("sidoCd=310000&sgguCd=312501&page=10&unit=gu"))).json();
    expect(tail.items.map((i: { name: string }) => i.name)).toEqual(["안석보건진료소"]);
  });

  it("구가 있는 시는 구 전부 — 수원 전체 1,806", async () => {
    stubHira({ "310000/310601": 378, "310000/310602": 354, "310000/310603": 525, "310000/310604": 549 });
    const body = await (await medicalList(req("sidoCd=310000&sgguCd=310604&page=13"))).json();
    expect(body.totalCount).toBe(1806);
    // 13쪽 = 360~389번째 — 첫 구(378건) 끝 18건 + 둘째 구 앞 12건
    expect(body.items).toHaveLength(30);
  });
});
