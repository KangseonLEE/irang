/**
 * SSR 되는 클라이언트 컴포넌트의 숫자 포맷은 로케일을 고정한다 (2026-10-03 QA)
 *
 * `n.toLocaleString()` 은 서버(Node 기본 로케일)와 브라우저(방문자 로케일)가 다르면 글자가 달라진다 —
 * de-DE 브라우저에서 서버 "6,219" vs 브라우저 "6.219" → React #418. 아래는 로케일 인자 없는 호출이
 * de-DE 로 포맷되도록 흉내 낸 상태에서 렌더해, 고친 자리가 전부 ko-KR(쉼표)로 나오는지 본다.
 * 인구 카드는 `formatPopulation`(src/lib/format.ts — 10/3 로케일 고정)을 거친다.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CostSimulator from "@/app/costs/cost-simulator";
import { RegionStats } from "@/app/regions/[id]/region-stats";
import { SigunguStats } from "@/app/regions/[id]/[sigungu]/sigungu-stats";

const realToLocaleString = Number.prototype.toLocaleString;

beforeEach(() => {
  vi.spyOn(Number.prototype, "toLocaleString").mockImplementation(function (
    this: number,
    locales?: Intl.LocalesArgument,
    options?: Intl.NumberFormatOptions,
  ) {
    // 로케일을 안 넘긴 호출 = 방문자 브라우저 기본 로케일(독일어)로 포맷되는 상황
    return realToLocaleString.call(this, locales ?? "de-DE", options);
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

const textOf = (html: string) =>
  new DOMParser().parseFromString(html, "text/html").body.textContent ?? "";

describe("숫자 포맷 로케일 고정 — de-DE 브라우저 흉내", () => {
  it("흉내가 실제로 걸려 있다 (로케일 없는 호출은 점 구분)", () => {
    expect((6219).toLocaleString()).toBe("6.219");
    expect((6219).toLocaleString("ko-KR")).toBe("6,219");
  });

  it("비용 시뮬레이터 — 결과 금액이 쉼표 구분", () => {
    const text = textOf(renderToStaticMarkup(<CostSimulator type="farming" />));
    expect(text).toMatch(/\d,\d{3}만 원/);
    expect(text).not.toMatch(/\d\.\d{3}(?!\d)/);
  });

  it("시·도 통계 카드 — 면적·의료·학교가 쉼표 구분", () => {
    const text = textOf(
      renderToStaticMarkup(
        <RegionStats
          provinceShortName="경기"
          provinceName="경기도"
          area={10540}
          population={{ population: 13914479, householdCount: 6012345, agingRate: 16.5 }}
          medical={{ totalCount: 6219 }}
          school={{ totalCount: 2419 }}
          climate={null}
          allStationNames={[]}
          sgisCode="31"
          hiraSidoCd="310000"
          eduCode="J10"
        />,
      ),
    );
    expect(text).toContain("10,540 km²");
    expect(text).toContain("13,914,479명");
    expect(text).toContain("6,219개");
    expect(text).toContain("2,419개");
    expect(text).not.toMatch(/\d\.\d{3}(?!\d)/);
  });

  it("시·군·구 통계 카드 — 면적·의료·학교·농가·귀농귀촌이 쉼표 구분", () => {
    const text = textOf(
      renderToStaticMarkup(
        <SigunguStats
          provinceShortName="경기"
          provinceName="경기도"
          sigunguName="양평군"
          area={1009}
          population={{ population: 121622, householdCount: 58321, agingRate: 30.1 }}
          isPopulationFallback={false}
          medical={{ totalCount: 1203 }}
          isMedicalFallback={false}
          school={{ totalCount: 1047 }}
          isSchoolFallback={false}
          returnFarm={{ returnFarmPerson: 1234, returnFarmHousehold: 1012, returnRuralPerson: 4567, year: 2024 }}
          climate={null}
          hasFallback={false}
          farm={{ farmCount: 9876, farmPopulation: 20000, avgPopulation: 2.1, isFallback: false }}
          sidoFarmAvgPopulation={null}
          farmRatioVsSido={null}
          populationTrend={[]}
          populationTrendYears={[]}
          populationChangePct={null}
          dimensionScores={null}
          sgisCode="31380"
          hiraSidoCd="310000"
          hiraSgguCd="310038"
          eduCode="J10"
          sigunguNameForNeis="양평군"
        />,
      ),
    );
    expect(text).toContain("1,009 km²");
    expect(text).toContain("121,622명");
    expect(text).toContain("1,203개");
    expect(text).toContain("9,876호");
    expect(text).toContain("1,234명");
    expect(text).toContain("4,567명");
    expect(text).not.toMatch(/\d\.\d{3}(?!\d)/);
  });
});
