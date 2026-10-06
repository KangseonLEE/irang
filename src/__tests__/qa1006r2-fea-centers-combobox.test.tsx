/**
 * 10/6 QA2 R2-Q3 — /regions/centers 광역 센터 카드 + 비교·지역 콤보박스.
 *  - F2·"3줄": 붙여 쓴 기관명("경기도귀농귀촌지원센터")이 2단 카드 밖으로 넘치거나 "…지원센 / 터"로 한 글자만 남았다
 *    → 기관명 낱말 앞에 줄바꿈 지점(<wbr>)
 *  - F6: 키보드 하이라이트가 보조기기에 전달되지 않았다(aria-activedescendant 없음)
 */
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { CROPS } from "@/lib/data/crops";
import { CENTERS } from "@/lib/data/centers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));
vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { centerNameSegments } from "@/components/region/center-name";
import { CenterCard } from "@/components/region/center-card";
import { RegionCardsSelector } from "@/app/regions/compare/region-cards-selector";
import { CropSelector } from "@/app/crops/compare/crop-selector";
import { CropSuitabilitySelector } from "@/app/regions/compare/crop-suitability-selector";
import { RegionSearch } from "@/components/region/region-search";

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.scrollTo = () => {};
});
afterEach(() => cleanup());

describe("centerNameSegments — 붙여 쓴 기관명의 줄바꿈 지점", () => {
  it.each([
    ["경기도귀농귀촌지원센터", ["경기도", "귀농귀촌", "지원센터"]],
    ["경상북도 귀농귀촌종합지원센터", ["경상북도 귀농귀촌", "종합지원센터"]],
    ["충청북도농업기술원 (정착 교육·정책 주무)", ["충청북도", "농업기술원 (정착 교육·정책 주무)"]],
    ["완주귀농귀촌지원센터", ["완주", "귀농귀촌", "지원센터"]],
    ["가평군농업기술센터", ["가평군", "농업기술센터"]],
  ])("%s", (name, expected) => {
    expect(centerNameSegments(name)).toEqual(expected);
    expect(centerNameSegments(name).join("")).toBe(name);
  });

  it("띄어 쓴 이름·짧은 이름은 그대로 한 조각", () => {
    expect(centerNameSegments("전라남도 귀농산어촌 종합지원센터")).toEqual(["전라남도 귀농산어촌 종합지원센터"]);
    expect(centerNameSegments("귀농귀촌지원센터")).toEqual(["귀농귀촌", "지원센터"]);
  });

  it("모든 센터 이름: 조각을 이으면 원래 이름 (글자를 더하거나 빼지 않는다)", () => {
    for (const c of CENTERS) expect(centerNameSegments(c.name).join("")).toBe(c.name);
  });

  it("카드는 조각 사이에 <wbr> 를 넣고 글자는 그대로", () => {
    const center = CENTERS.find((c) => c.name === "경기도귀농귀촌지원센터")!;
    const html = renderToStaticMarkup(<CenterCard center={center} showSidoLabel />);
    expect(html).toContain("경기도<wbr/>귀농귀촌<wbr/>지원센터");
  });
});

/** 입력창의 aria-activedescendant 가 aria-selected 옵션을 가리키는가 */
function expectActiveDescendantMatches(input: HTMLElement) {
  const id = input.getAttribute("aria-activedescendant");
  expect(id).toBeTruthy();
  const el = document.getElementById(id!);
  expect(el).not.toBeNull();
  expect(el).toHaveAttribute("role", "option");
  expect(el).toHaveAttribute("aria-selected", "true");
}

describe("aria-activedescendant — 키보드 하이라이트를 보조기기에", () => {
  it("지역 비교 셀렉터", () => {
    render(<RegionCardsSelector selectedRegionIds={[]} />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    expect(input).not.toHaveAttribute("aria-activedescendant");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "충" } });
    expectActiveDescendantMatches(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expectActiveDescendantMatches(input);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  it("작물 비교 셀렉터", () => {
    const crops = CROPS.map((c) => ({ id: c.id, name: c.name, category: c.category, difficulty: c.difficulty, description: c.description }));
    render(<CropSelector crops={crops} selectedIds={[]} />);
    const input = screen.getByRole("combobox", { name: "작물 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "배" } });
    expectActiveDescendantMatches(input);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expectActiveDescendantMatches(input);
  });

  it("작물 적합도 셀렉터", () => {
    render(<CropSuitabilitySelector crops={CROPS} selectedId={null} />);
    const input = screen.getByRole("combobox", { name: "작물 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "배" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expectActiveDescendantMatches(input);
  });

  it("지역 검색 — 트리(빈 입력)와 검색 결과 둘 다", () => {
    render(<RegionSearch />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    expectActiveDescendantMatches(input); // 시·도 패널
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expectActiveDescendantMatches(input); // 시·군·구 패널
    fireEvent.change(input, { target: { value: "가평" } });
    expectActiveDescendantMatches(input); // 검색 결과
  });
});
