/**
 * 10/6 QA1 Q3-🟡8 · Q4-W9 — 비교 셀렉터 키보드·한글 입력.
 *
 * 1) 검색창 포커스로 열린 목록이 Tab 으로 빠져나가도 닫히지 않아 다음 포커스("작물 추가" 카드 등)를 덮었다.
 * 2) 지역 셀렉터는 한글 조합 중 Enter 에 지역이 추가됐다(작물 셀렉터는 9/7 에 막음).
 * 3) ↑↓로 고른 항목보다 이름 완전 일치가 우선해 "배" 입력 후 ↓로 "배추"를 골라도 "배"가 추가됐다.
 */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CROPS } from "@/lib/data/crops";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { RegionCardsSelector } from "@/app/regions/compare/region-cards-selector";
import { CropSelector } from "@/app/crops/compare/crop-selector";
import { CropSuitabilitySelector } from "@/app/regions/compare/crop-suitability-selector";
import { RegionSearch } from "@/components/region/region-search";

beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
  Element.prototype.scrollIntoView = () => {};
  Element.prototype.scrollTo = () => {};
});

beforeEach(() => push.mockClear());
afterEach(() => cleanup());

const cropItems = CROPS.map((c) => ({
  id: c.id,
  name: c.name,
  category: c.category,
  difficulty: c.difficulty,
  description: c.description,
}));
const idOf = (name: string) => CROPS.find((c) => c.name === name)!.id;

/** 마지막 router.push 의 쿼리 파라미터 */
function lastPushParam(key: string): string | null {
  const url = push.mock.calls.at(-1)?.[0] as string | undefined;
  if (!url) return null;
  return new URL(url, "https://irangfarm.com").searchParams.get(key);
}

function withOutsideButton(ui: React.ReactElement) {
  return render(
    <>
      {ui}
      <button type="button">바깥 버튼</button>
    </>,
  );
}

describe("RegionCardsSelector (/regions/compare)", () => {
  it("Tab 으로 검색창을 벗어나면 목록이 닫힌다", () => {
    render(<RegionCardsSelector selectedRegionIds={[]} />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("포커스가 검색 영역 밖으로 나가면 닫히고, 안쪽(지우기 버튼)으로 옮기면 열린 채로 둔다", () => {
    withOutsideButton(<RegionCardsSelector selectedRegionIds={[]} />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "충" } });
    const clear = screen.getByRole("button", { name: "검색어 지우기" });
    fireEvent.focusOut(input, { relatedTarget: clear });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.focusOut(input, { relatedTarget: screen.getByRole("button", { name: "바깥 버튼" }) });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("relatedTarget 이 없는 blur(Safari 버튼 클릭)로는 닫지 않는다 — 옵션 click 이 먹히도록", () => {
    render(<RegionCardsSelector selectedRegionIds={[]} />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    fireEvent.focusOut(input, { relatedTarget: null });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("한글 조합 중 Enter 는 무시하고, 조합이 끝난 Enter 로 추가한다", () => {
    render(<RegionCardsSelector selectedRegionIds={[]} />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "충" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
    expect(push).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "충주" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lastPushParam("regions")).toBe("chungbuk:chungju");
  });

  it("↑↓로 고른 항목이 이름 완전 일치보다 우선한다", () => {
    render(<RegionCardsSelector selectedRegionIds={[]} />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "충북" } });
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("충북");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const picked = screen.getAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true")!;
    expect(picked).toHaveTextContent("충북 ");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lastPushParam("regions")).toMatch(/^chungbuk:/);
  });

  it("옮기지 않았으면 이름 완전 일치를 고른다 (이미 고른 지역이 위로 올라와 있어도)", () => {
    render(<RegionCardsSelector selectedRegionIds={["gyeonggi:gwangju-gg"]} />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "광주" } });
    // 이미 고른 경기 광주시가 맨 위(하이라이트 0)로 올라와 있다
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("경기 광주시");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lastPushParam("regions")).toBe("gyeonggi:gwangju-gg,gwangju");
  });
});

describe("CropSelector (/crops/compare)", () => {
  it("Tab 으로 검색창을 벗어나면 목록이 닫힌다", () => {
    render(<CropSelector crops={cropItems} selectedIds={[]} />);
    const input = screen.getByRole("combobox", { name: "작물 검색" });
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("포커스가 바깥 요소로 나가면 닫힌다", () => {
    withOutsideButton(<CropSelector crops={cropItems} selectedIds={[]} />);
    const input = screen.getByRole("combobox", { name: "작물 검색" });
    fireEvent.focus(input);
    fireEvent.focusOut(input, { relatedTarget: screen.getByRole("button", { name: "바깥 버튼" }) });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("'배' 입력 후 ↓로 옮긴 항목을 Enter 로 고른다 (완전 일치 '배'로 되돌아가지 않음)", () => {
    render(<CropSelector crops={cropItems} selectedIds={[]} />);
    const input = screen.getByRole("combobox", { name: "작물 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "배" } });
    // 첫 하이라이트는 이름 우선 랭킹 1위(완전 일치 "배")
    expect(screen.getAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true")).toHaveTextContent("배");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    const picked = screen.getAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true")!;
    const pickedName = CROPS.find((c) => picked.textContent?.includes(c.name) && c.name !== "배")!.name;
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lastPushParam("ids")).toBe(idOf(pickedName));
    expect(lastPushParam("ids")).not.toBe(idOf("배"));
  });

  it("그냥 Enter 면 이름 완전 일치를 고른다", () => {
    render(<CropSelector crops={cropItems} selectedIds={[]} />);
    const input = screen.getByRole("combobox", { name: "작물 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "배" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lastPushParam("ids")).toBe(idOf("배"));
  });
});

describe("CropSuitabilitySelector (/regions/compare 작물 적합도)", () => {
  it("Tab 으로 벗어나면 닫힌다", () => {
    render(<CropSuitabilitySelector crops={CROPS} selectedId={null} />);
    const input = screen.getByRole("combobox", { name: "작물 검색" });
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("RegionSearch (/regions 검색창)", () => {
  it("Tab 으로 벗어나면 닫히고, 바깥으로 포커스가 나가도 닫힌다", () => {
    withOutsideButton(<RegionSearch />);
    const input = screen.getByRole("combobox", { name: "지역 검색" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "가평" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(screen.queryByRole("listbox")).toBeNull();

    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    act(() => {
      fireEvent.focusOut(input, { relatedTarget: screen.getByRole("button", { name: "바깥 버튼" }) });
    });
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
