/**
 * 학교 수 정정 + 행정구역 개편 회귀 테스트 (2026-10-07)
 *
 * 보호 대상:
 *   1) 학교 주소는 낱말이 시·군·구 이름과 같을 때만 센다 — '동구'가 남동구, '서구'가 달서구·강서구를 세던 것
 *   2) NEIS 학교 목록은 1,000건씩 나눠 전부 받는다 — 서울·경기·경남 시·군·구가 전부 적게 나오던 것
 *   3) A안 — 인천 신설 4개 구·대구 군위가 우리 지역 단위이고, 옛 3개 구는 남지 않는다
 *   4) '확인 불가' 장치 — 원천만 새 구로 바뀐 곳은 '0개'가 아니라 '확인 불가' + 새 구청 안내 (지금은 쓰는 곳 없음)
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  fetchEduSchoolRows,
  fetchSigunguSchoolCounts,
  isSchoolInDistrict,
} from "@/lib/api/education";
import {
  GU_REORGANIZATIONS,
  REGION_REORGANIZATIONS,
  getGuReorganization,
  getRegionReorganization,
  reorgNoticeText,
  type RegionReorganization,
} from "@/lib/data/region-reorganizations";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { GUS } from "@/lib/data/gus";
import { PROVINCES } from "@/lib/data/regions";
import { getSigunguCenter } from "@/lib/data/centers";
import { SigunguStats, type SigunguStatsProps } from "@/app/regions/[id]/[sigungu]/sigungu-stats";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("isSchoolInDistrict — 주소 낱말 일치", () => {
  it("이름이 들어 있기만 한 다른 구는 세지 않는다", () => {
    expect(isSchoolInDistrict("인천광역시 남동구 구월로 1", "동구")).toBe(false);
    expect(isSchoolInDistrict("대구광역시 달서구 달구벌대로 1", "서구")).toBe(false);
    expect(isSchoolInDistrict("부산광역시 강서구 낙동북로 1", "서구")).toBe(false);
  });

  it("같은 이름의 낱말이면 센다 — 시·군·구, 시 아래 구 모두", () => {
    expect(isSchoolInDistrict("인천광역시 남동구 구월로 1", "남동구")).toBe(true);
    expect(isSchoolInDistrict("부산광역시 서구 구덕로 1", "서구")).toBe(true);
    expect(isSchoolInDistrict("경기도 수원시 장안구 정조로 1", "수원시")).toBe(true);
    expect(isSchoolInDistrict("경기도 수원시 장안구 정조로 1", "장안구")).toBe(true);
  });

  it("주소가 없으면 세지 않는다", () => {
    expect(isSchoolInDistrict(undefined, "동구")).toBe(false);
    expect(isSchoolInDistrict("", "동구")).toBe(false);
  });
});

/** NEIS 응답 흉내 — pSize=1 은 건수만, pSize=1000 은 그 쪽의 학교 행 */
function stubNeis(total: number, addressOf: (pIndex: number, i: number) => string) {
  const calls: URL[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: string) => {
      const url = new URL(input);
      calls.push(url);
      const pIndex = Number(url.searchParams.get("pIndex"));
      const pSize = Number(url.searchParams.get("pSize"));
      const n = pSize === 1 ? 1 : Math.max(0, Math.min(pSize, total - (pIndex - 1) * pSize));
      const row = Array.from({ length: n }, (_, i) => ({ ORG_RDNMA: addressOf(pIndex, i) }));
      return new Response(JSON.stringify({ schoolInfo: [{ head: [{ list_total_count: total }] }, { row }] }));
    }),
  );
  return calls;
}

describe("fetchEduSchoolRows — 1,000건씩 나눠 전부 받기", () => {
  it("2,500곳이면 3쪽을 받아 2,500행을 돌려준다", async () => {
    const calls = stubNeis(2500, (p, i) => `경기도 수원시 장안구 길 ${p}-${i}`);
    const rows = await fetchEduSchoolRows("KEY", "J10", 1000);
    expect(rows).toHaveLength(2500);
    const pages = calls
      .filter((u) => u.searchParams.get("pSize") === "1000")
      .map((u) => u.searchParams.get("pIndex"))
      .sort();
    expect(pages).toEqual(["1", "2", "3"]);
  });

  it("같은 교육청을 동시에 물으면 한 번만 받는다", async () => {
    const calls = stubNeis(1500, (p, i) => `서울특별시 종로구 길 ${p}-${i}`);
    const [a, b] = await Promise.all([fetchEduSchoolRows("KEY", "B10"), fetchEduSchoolRows("KEY", "B10")]);
    expect(a).toHaveLength(1500);
    expect(b).toBe(a);
    expect(calls).toHaveLength(2); // 1쪽(전체 건수 포함) + 2쪽
  });

  it("한 쪽이 한 번 실패해도 다시 받아 채운다", async () => {
    let failed = false;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        const url = new URL(input);
        const pIndex = Number(url.searchParams.get("pIndex"));
        if (pIndex === 2 && !failed) {
          failed = true;
          return new Response("busy", { status: 503 });
        }
        const n = pIndex === 1 ? 1000 : 200;
        const row = Array.from({ length: n }, (_, i) => ({ ORG_RDNMA: `경상남도 창원시 의창구 길 ${pIndex}-${i}` }));
        return new Response(JSON.stringify({ schoolInfo: [{ head: [{ list_total_count: 1200 }] }, { row }] }));
      }),
    );
    await expect(fetchEduSchoolRows("KEY", "S10")).resolves.toHaveLength(1200);
  });

  it("자료 없음(INFO-200)은 빈 배열", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ RESULT: { CODE: "INFO-200", MESSAGE: "해당하는 데이터가 없습니다." } }))),
    );
    await expect(fetchEduSchoolRows("KEY", "E10", 1000)).resolves.toEqual([]);
  });

  it("HTTP 오류는 예외 — 호출자가 null(시·도 대체값)로 바꾼다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("down", { status: 503 })));
    await expect(fetchEduSchoolRows("KEY", "E10", 1000)).rejects.toThrow("HTTP 503");
  });

  it("시·군·구 학교 수 — 1,000건 너머까지 세고, 이름 부분 일치는 빼고 센다", async () => {
    vi.stubEnv("NEIS_API_KEY", "KEY");
    // 1,200곳: 첫 쪽 600곳이 남동구, 나머지가 동구 → 동구는 600곳(1,000건 제한이면 400곳, 부분 일치면 1,200곳)
    stubNeis(1200, (p, i) => {
      const n = (p - 1) * 1000 + i;
      return n < 600 ? `인천광역시 남동구 길 ${n}` : `인천광역시 동구 길 ${n}`;
    });
    await expect(fetchSigunguSchoolCounts("E10", "동구")).resolves.toMatchObject({ totalCount: 600 });
  });
});

describe("행정구역 개편 SSOT — region-reorganizations (A안)", () => {
  const ids = Object.keys(REGION_REORGANIZATIONS);
  const NEW_DISTRICTS = ["geomdan", "jemulpo", "seohae", "yeongjong"];

  it("키는 실재하는 시·군·구 id — 인천 신설 4개 구 + 대구 군위, 셀 수 없는 곳은 없다", () => {
    expect(ids.sort()).toEqual([...NEW_DISTRICTS, "gunwi"].sort());
    for (const id of ids) {
      expect(SIGUNGUS.find((s) => s.id === id), id).toBeDefined();
      expect(REGION_REORGANIZATIONS[id].countsUnavailable, id).toBe(false);
    }
    for (const id of NEW_DISTRICTS) expect(SIGUNGUS.find((s) => s.id === id)!.sidoId).toBe("incheon");
  });

  it("옛 인천 중구·동구·서구는 지역 단위에서 빠졌고, 군위는 대구 소속이다", () => {
    for (const id of ["jung-gu-incheon", "dong-gu-incheon", "seo-gu-incheon"]) {
      expect(SIGUNGUS.find((s) => s.id === id), id).toBeUndefined();
    }
    const gunwi = SIGUNGUS.find((s) => s.id === "gunwi")!;
    expect([gunwi.sidoId, gunwi.sgisCode, gunwi.hiraSgguCd]).toEqual(["daegu", "22520", "230200"]);
    // 심평원·교육부는 군위를 대구 코드 아래에 둔다 — 소속 시·도 코드로 그대로 센다
    const daegu = PROVINCES.find((p) => p.id === "daegu")!;
    expect([daegu.hiraSidoCd, daegu.eduCode]).toEqual(["230000", "D10"]);
  });

  it("인천 신설 구 심평원 코드 — 응답 지역명으로 확인한 값 (10/7)", () => {
    const code = (id: string) => SIGUNGUS.find((s) => s.id === id)!.hiraSgguCd;
    expect(["jemulpo", "yeongjong", "seohae", "geomdan"].map(code)).toEqual(["220010", "220009", "220011", "220012"]);
  });

  it("개편 안 된 곳은 null", () => {
    expect(getRegionReorganization("bupyeong")).toBeNull();
  });

  it("시행일 형식 · 새 구청 주소는 https", () => {
    for (const r of Object.values(REGION_REORGANIZATIONS)) {
      expect(r.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const s of r.successors) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it("신설 구 센터는 각자의 새 구청 — 옛 중구청 주소(icjg)는 남지 않는다", () => {
    const expected: Record<string, string> = {
      jemulpo: "https://www.jemulpo.go.kr/",
      yeongjong: "https://www.yeongjong.go.kr/main/main.do",
      seohae: "https://www.seohae.go.kr/open_content/main/",
      geomdan: "https://www.geomdan.go.kr/",
    };
    for (const [id, url] of Object.entries(expected)) {
      const center = getSigunguCenter(id);
      expect(center?.url, id).toBe(url);
      expect(center?.sidoSlug, id).toBe("incheon");
    }
    expect(getSigunguCenter("gunwi")?.sidoSlug).toBe("daegu");
    for (const id of ["jung-gu-incheon", "dong-gu-incheon", "seo-gu-incheon"]) {
      expect(getSigunguCenter(id), id).toBeUndefined();
    }
  });

  it("상단 안내 문장 — 서술체, 밖으로 나가는 주소 없음, 자료 기준을 밝힌다", () => {
    const text = reorgNoticeText(REGION_REORGANIZATIONS.yeongjong, "영종구");
    expect(text).toContain("영종구가 됐어요");
    expect(text).toContain("2024년 행정동 통계");
    expect(text).not.toMatch(/합니다|https?:|확인할 수 없어요/);
  });

  it("화성 신설 4개 구 안내 (10/7) — 키는 화성의 구, 시행일·행정동 합 기준을 밝힌다", () => {
    const ids = Object.keys(GU_REORGANIZATIONS).sort();
    expect(ids).toEqual(["byeongjeom-gu", "dongtan-gu", "hyohaeng-gu", "manse-gu"]);
    for (const id of ids) expect(GUS.find((g) => g.id === id)?.parentSigunguId, id).toBe("hwaseong");
    expect(getGuReorganization("jangan-gu")).toBeNull();
    const text = reorgNoticeText(GU_REORGANIZATIONS["manse-gu"], "만세구");
    expect(text).toContain("2026년 2월 1일 화성시에 만세구·효행구·병점구·동탄구가 생겼어요");
    expect(text).toContain("2024년 행정동 통계");
    expect(text).not.toMatch(/합니다|https?:/);
  });

  it("군위 안내 — 대구 편입, 대구 기준", () => {
    const text = reorgNoticeText(REGION_REORGANIZATIONS.gunwi, "군위군");
    expect(text).toContain("대구광역시로 편입됐어요");
    expect(text).toContain("대구광역시 기준");
    expect(text).not.toMatch(/합니다|확인할 수 없어요/);
  });
});

describe("SigunguStats — 원천만 바뀐 구는 '확인 불가' + 새 구청 안내 (장치)", () => {
  const base: SigunguStatsProps = {
    provinceShortName: "인천",
    provinceName: "인천광역시",
    sigunguName: "중구",
    area: 140,
    population: { population: 150000, householdCount: 70000, agingRate: 15 },
    isPopulationFallback: false,
    medical: null,
    isMedicalFallback: false,
    school: null,
    isSchoolFallback: false,
    returnFarm: null,
    climate: null,
    hasFallback: false,
    farm: null,
    sidoFarmAvgPopulation: null,
    farmRatioVsSido: null,
    populationTrend: [],
    populationTrendYears: [],
    populationChangePct: null,
    dimensionScores: null,
    sgisCode: "23010",
    hiraSidoCd: "220000",
    hiraSgguCd: "220004",
    eduCode: "E10",
    sigunguNameForNeis: "중구",
    admCode: "23010",
  };

  it("의료기관·학교 카드가 '0개'가 아니라 '확인 불가'로 보이고, 누르면 새 구청 링크가 열린다", () => {
    // 공용 Modal 이 높이 계산에 matchMedia 를 쓴다 — jsdom 에는 없다
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
    // 지금은 데이터에 '확인 불가' 지역이 없다 — 10/7 B안 당시의 모양으로 장치만 시험한다
    const unavailable: RegionReorganization = {
      effectiveDate: "2026-07-01",
      summary: "2026년 7월 1일 인천 행정체제 개편으로 중구는 제물포구와 영종구로 나뉘었어요.",
      successors: [
        { name: "제물포구청", url: "https://www.jemulpo.go.kr/" },
        { name: "영종구청", url: "https://www.yeongjong.go.kr/main/main.do" },
      ],
      countsUnavailable: true,
    };
    render(<SigunguStats {...base} reorg={unavailable} />);
    expect(screen.getAllByText("확인 불가")).toHaveLength(2);
    expect(screen.queryByText(/^0개$/)).toBeNull();

    fireEvent.click(screen.getAllByText("확인 불가")[0].closest("button")!);
    const jemulpo = screen.getByRole("link", { name: "제물포구청 누리집 (새 창)" });
    expect(jemulpo).toHaveAttribute("href", "https://www.jemulpo.go.kr/");
    expect(jemulpo).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "영종구청 누리집 (새 창)" })).toHaveAttribute(
      "href",
      "https://www.yeongjong.go.kr/main/main.do",
    );
  });

  it("개편 안 된 곳은 기존대로 숫자 카드", () => {
    render(
      <SigunguStats
        {...base}
        sigunguName="부평구"
        medical={{ totalCount: 683 }}
        school={{ totalCount: 88 }}
      />,
    );
    expect(screen.queryByText("확인 불가")).toBeNull();
    expect(screen.getByText("683개")).toBeInTheDocument();
    expect(screen.getByText("88개")).toBeInTheDocument();
  });

  it("시 아래 구는 귀농·귀촌 카드가 시 전체 값임을 밝힌다 (10/7 — 처인구에 용인시 70명이 구 숫자처럼 보였다)", () => {
    const returnFarm = { returnFarmPerson: 114, returnFarmHousehold: 109, returnRuralPerson: 23790, year: 2025 };
    const { unmount } = render(
      <SigunguStats {...base} sigunguName="만세구" returnFarm={returnFarm} returnFarmScope="화성시" />,
    );
    expect(screen.getByText("화성시 귀농")).toBeInTheDocument();
    expect(screen.getByText("화성시 귀촌")).toBeInTheDocument();
    expect(screen.queryByText(/^귀농$/)).toBeNull();
    unmount();
    // 시·군·구 화면은 그대로
    render(<SigunguStats {...base} sigunguName="화성시" returnFarm={returnFarm} />);
    expect(screen.getByText("귀농")).toBeInTheDocument();
    expect(screen.getByText("귀촌")).toBeInTheDocument();
  });
});
