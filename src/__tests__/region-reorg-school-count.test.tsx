/**
 * 학교 수 정정 + 인천 행정구역 개편(B안) 회귀 테스트 (2026-10-07)
 *
 * 보호 대상:
 *   1) 학교 주소는 낱말이 시·군·구 이름과 같을 때만 센다 — '동구'가 남동구, '서구'가 달서구·강서구를 세던 것
 *   2) NEIS 학교 목록은 1,000건씩 나눠 전부 받는다 — 서울·경기·경남 시·군·구가 전부 적게 나오던 것
 *   3) 개편된 구(인천 중구·동구·서구)는 의료기관·학교가 '0개'가 아니라 '확인 불가' + 새 구청 안내
 *   4) 개편 정보와 센터 링크가 같은 새 구청을 가리킨다
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import {
  fetchEduSchoolRows,
  fetchSigunguSchoolCounts,
  isSchoolInDistrict,
} from "@/lib/api/education";
import {
  REGION_REORGANIZATIONS,
  getRegionReorganization,
  reorgNoticeText,
} from "@/lib/data/region-reorganizations";
import { SIGUNGUS } from "@/lib/data/sigungus";
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

describe("행정구역 개편 SSOT — region-reorganizations", () => {
  const ids = Object.keys(REGION_REORGANIZATIONS);

  it("키는 실재하는 시·군·구 id — 인천 3구는 '확인 불가', 군위는 대구 코드로 센다", () => {
    expect(ids.sort()).toEqual(["dong-gu-incheon", "gunwi", "jung-gu-incheon", "seo-gu-incheon"]);
    for (const id of ids) expect(SIGUNGUS.find((s) => s.id === id), id).toBeDefined();
    for (const id of ["dong-gu-incheon", "jung-gu-incheon", "seo-gu-incheon"]) {
      expect(SIGUNGUS.find((s) => s.id === id)!.sidoId).toBe("incheon");
      expect(REGION_REORGANIZATIONS[id].countsUnavailable).toBe(true);
    }
    expect(REGION_REORGANIZATIONS.gunwi.countsUnavailable).toBe(false);
    const gunwi = SIGUNGUS.find((s) => s.id === "gunwi")!;
    expect([gunwi.hiraSidoCd, gunwi.hiraSgguCd, gunwi.eduCode]).toEqual(["230000", "230200", "D10"]);
  });

  it("개편 안 된 곳은 null", () => {
    expect(getRegionReorganization("bupyeong")).toBeNull();
  });

  it("시행일·새 구청 주소 형식 — 나뉘거나 합쳐진 곳은 새 구청이 있어야", () => {
    for (const r of Object.values(REGION_REORGANIZATIONS)) {
      expect(r.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (r.countsUnavailable) expect(r.successors.length).toBeGreaterThan(0);
      for (const s of r.successors) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it("센터 링크가 새 구청 중 하나를 가리킨다 — 옛 중구청 주소(icjg)는 남지 않는다", () => {
    for (const [id, r] of Object.entries(REGION_REORGANIZATIONS)) {
      if (!r.successors.length) continue;
      const center = getSigunguCenter(id);
      expect(center, id).toBeDefined();
      expect(r.successors.map((s) => s.url)).toContain(center!.url);
      expect(center!.url).not.toContain("icjg.go.kr");
    }
  });

  it("상단 안내 문장 — 서술체, 밖으로 나가는 주소 없음", () => {
    const text = reorgNoticeText(REGION_REORGANIZATIONS["jung-gu-incheon"], "중구");
    expect(text).toContain("제물포구와 영종구로 나뉘었어요");
    expect(text).toContain("확인할 수 없어요");
    expect(text).not.toMatch(/합니다|https?:/);
  });

  it("군위 안내 — 대구 기준 수·대구 지원사업 확인", () => {
    const text = reorgNoticeText(REGION_REORGANIZATIONS.gunwi, "군위군");
    expect(text).toContain("대구광역시로 편입됐어요");
    expect(text).toContain("대구광역시 군위군 기준");
    expect(text).not.toMatch(/합니다|확인할 수 없어요/);
  });
});

describe("SigunguStats — 개편된 구는 '확인 불가' + 새 구청 안내", () => {
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
    render(<SigunguStats {...base} reorg={REGION_REORGANIZATIONS["jung-gu-incheon"]} />);
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
});
