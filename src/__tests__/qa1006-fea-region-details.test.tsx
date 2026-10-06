/**
 * 10/6 QA1 — 지역 상세 부속 화면 정리.
 *  - 의료기관 모달: "병원" 칩이 종합병원까지 포함 매칭, 칩 숫자가 불러온 쪽만 센다는 표시 없음
 *  - 농가 모달: 같은 2020 총조사 값인데 "최신 데이터 호출에 실패" 문구
 *  - 모바일 요약 바: opacity 0 으로 숨은 동안 공유 버튼 2개가 Tab 포커스를 받음
 *  - /regions/centers: useSearchParams 로 목록 전체가 CSR 로 빠져 SSR HTML 에 센터가 없음
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { matchesMedicalType } from "@/app/regions/[id]/modals/medical-types";
import { PaginatedListModal } from "@/app/regions/[id]/modals/paginated-list-modal";
import { FarmHouseholdModal } from "@/app/regions/[id]/modals/farm-household-modal";
import { StickyRegionHeader } from "@/app/regions/[id]/sticky-region-header";
import { CentersSearch } from "@/app/regions/centers/centers-search";
import { CENTERS, getSigunguCentersBySido } from "@/lib/data/centers";
import { PROVINCES } from "@/lib/data/regions";

type IOCallback = (entries: Array<{ isIntersecting: boolean }>) => void;
const ioCallbacks: IOCallback[] = [];

beforeAll(() => {
  class IO {
    constructor(cb: IOCallback) {
      ioCallbacks.push(cb);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IO });
  Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: IO });
  Element.prototype.scrollIntoView = () => {};
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete document.documentElement.dataset.headerHidden;
  window.history.replaceState({}, "", "/");
});

describe("의료기관 유형 칩 — 칩끼리 겹치지 않는다", () => {
  it("'병원' 칩은 병원·요양병원·정신병원만 (종합병원·상급종합·치과병원·한방병원 제외)", () => {
    for (const t of ["병원", "요양병원", "정신병원"]) expect(matchesMedicalType(t, "병원")).toBe(true);
    for (const t of ["종합병원", "상급종합", "치과병원", "한방병원"]) expect(matchesMedicalType(t, "병원")).toBe(false);
  });

  it("'의원'은 의원만, 치과·한방은 각자 칩으로", () => {
    expect(matchesMedicalType("의원", "의원")).toBe(true);
    expect(matchesMedicalType("치과의원", "의원")).toBe(false);
    expect(matchesMedicalType("한의원", "의원")).toBe(false);
    expect(matchesMedicalType("치과의원", "치과")).toBe(true);
    expect(matchesMedicalType("치과병원", "치과")).toBe(true);
    expect(matchesMedicalType("한의원", "한방")).toBe(true);
    expect(matchesMedicalType("한방병원", "한방")).toBe(true);
    expect(matchesMedicalType("보건진료소", "보건")).toBe(true);
  });

  it("모르는 필터 값은 포함 매칭으로 둔다", () => {
    expect(matchesMedicalType("조산원", "조산")).toBe(true);
  });
});

describe("PaginatedListModal — 칩 숫자 규칙·불러온 건수 기준 안내", () => {
  const items = [
    { name: "가 종합병원", type: "종합병원", address: "주소", tel: "" },
    { name: "나 병원", type: "병원", address: "주소", tel: "" },
    { name: "다 요양병원", type: "요양병원", address: "주소", tel: "" },
    { name: "라 의원", type: "의원", address: "주소", tel: "" },
  ];

  function renderModal(totalCount: number) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ items, totalCount }) })),
    );
    render(
      <PaginatedListModal
        provinceShortName="경기"
        totalCount={totalCount}
        endpoint="/api/medical-list"
        params={{ sidoCd: "310000" }}
        filters={[
          { label: "전체", value: "" },
          { label: "종합병원", value: "종합병원" },
          { label: "병원", value: "병원" },
          { label: "의원", value: "의원" },
        ]}
        searchPlaceholder="검색"
        itemLabel="의료기관"
        renderItem={(item) => <span>{item.name}</span>}
        itemKey={(item, i) => `${item.name}-${i}`}
        matchesFilter={matchesMedicalType}
        dataSource="건강보험심사평가원"
      />,
    );
  }

  it("'병원' 칩 숫자에 종합병원이 섞이지 않는다", async () => {
    renderModal(4);
    const chip = await screen.findByRole("button", { name: /^병원/ });
    expect(chip).toHaveTextContent("병원2");
    expect(screen.getByRole("button", { name: /^종합병원/ })).toHaveTextContent("종합병원1");
  });

  it("아직 더 불러올 게 있으면 숫자가 불러온 건수 기준이라고 밝힌다", async () => {
    renderModal(120);
    expect(await screen.findByText(/지금까지 불러온 4건 기준이에요/)).toBeInTheDocument();
  });

  it("다 불러왔으면 그 안내는 없다", async () => {
    renderModal(4);
    await screen.findByRole("button", { name: /^병원/ });
    expect(screen.queryByText(/불러온 .*건 기준이에요/)).toBeNull();
  });
});

describe("FarmHouseholdModal — 실패 문구 대신 기준 연도", () => {
  it.each([true, false])("isFallback=%s 여도 '호출에 실패' 없이 2020 총조사 기준을 밝힌다", (isFallback) => {
    render(
      <FarmHouseholdModal
        sigunguName="가평군"
        provinceShortName="경기"
        farm={{ farmCount: 4000, farmPopulation: 9000, avgPopulation: 2.2, isFallback }}
        sidoAvgPopulation={2.3}
        ratioVsSido={-4}
      />,
    );
    expect(screen.queryByText(/호출에 실패/)).toBeNull();
    expect(screen.getByText(/2020년 농림어업총조사 값이에요/)).toBeInTheDocument();
  });
});

describe("StickyRegionHeader — 숨은 동안 inert", () => {
  function renderBar() {
    return render(
      <>
        <div id="hero">hero</div>
        <StickyRegionHeader
          overline="경기"
          shortName="가평군"
          watchTargetId="hero"
          chips={[{ label: "정착 점수 70", href: "#settlement-score" }]}
          actions={
            <>
              <button type="button">카카오</button>
              <button type="button">공유</button>
            </>
          }
        />
      </>,
    );
  }

  it("처음(hero 보임)엔 inert — 공유 버튼·칩이 Tab 순서에서 빠진다", () => {
    const { container } = renderBar();
    const bar = container.querySelector('[role="banner"]')!;
    expect(bar).toHaveAttribute("inert");
    expect(bar).toHaveAttribute("aria-hidden", "true");
  });

  it("hero 를 지나도 글로벌 헤더가 보이는 동안(CSS 상 opacity 0)은 여전히 inert", () => {
    const { container } = renderBar();
    act(() => ioCallbacks.at(-1)!([{ isIntersecting: false }]));
    expect(container.querySelector('[role="banner"]')).toHaveAttribute("inert");
  });

  it("hero 를 지나고 헤더가 숨으면(바가 실제로 보이면) inert 가 풀린다", async () => {
    const { container } = renderBar();
    act(() => ioCallbacks.at(-1)!([{ isIntersecting: false }]));
    act(() => {
      document.documentElement.dataset.headerHidden = "";
    });
    await waitFor(() => expect(container.querySelector('[role="banner"]')).not.toHaveAttribute("inert"));
    expect(container.querySelector('[role="banner"]')).toHaveAttribute("aria-hidden", "false");
  });
});

describe("CentersSearch — 목록이 서버 렌더에 실린다", () => {
  const sidoCenters = CENTERS.filter((c) => c.category === "sido");
  const sigunguGroups = PROVINCES.map((p) => ({
    id: p.id,
    shortName: p.shortName,
    centers: getSigunguCentersBySido(p.id),
  })).filter((g) => g.centers.length > 0);

  it("renderToString(서버) 결과에 광역 센터 카드와 시·도 묶음 버튼이 전부 있다", () => {
    // 붙여 쓴 기관명 사이의 줄바꿈 지점(<wbr>, 10/6 QA2)은 글자가 아니라 빼고 본다
    const html = renderToString(<CentersSearch sidoCenters={sidoCenters} sigunguGroups={sigunguGroups} />).replace(
      /<wbr\/>/g,
      "",
    );
    for (const c of sidoCenters) expect(html).toContain(c.name);
    for (const g of sigunguGroups) expect(html).toContain(`${g.shortName} 시·군 센터 ${g.centers.length}곳 보기`);
  });

  it("주소에 ?q= 가 있으면 브라우저에서 그 검색어로 거른다 (검색 결과 딥링크)", () => {
    const target = sigunguGroups.find((g) => g.centers.some((c) => c.sigungu))!;
    const sigungu = target.centers.find((c) => c.sigungu)!.sigungu!;
    window.history.replaceState({}, "", `/regions/centers?q=${encodeURIComponent(sigungu)}`);
    render(<CentersSearch sidoCenters={sidoCenters} sigunguGroups={sigunguGroups} />);
    expect(screen.getByRole("searchbox", { name: "시·군 센터 검색" })).toHaveValue(sigungu);
  });
});
