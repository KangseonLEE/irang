import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  SelectCombobox,
  type SelectComboboxOption,
} from "@/components/ui/select-combobox";

/** jsdom 미구현 API 스텁 — 컴포넌트가 열릴 때 호출한다 */
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
});

afterEach(() => cleanup());

const SIGUNGU_OPTIONS: SelectComboboxOption[] = [
  { value: "", label: "전체 (시·도 단위)" },
  { value: "cheongju", label: "청주시" },
  { value: "chungju", label: "충주시" },
  { value: "jecheon", label: "제천시" },
  { value: "boeun", label: "보은군" },
  { value: "okcheon", label: "옥천군" },
  { value: "yeongdong", label: "영동군" },
  { value: "jeungpyeong", label: "증평군" },
  { value: "jincheon", label: "진천군" },
];

function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: "시·군·구 선택" }));
}

describe("SelectCombobox", () => {
  it("옵션 9개면 검색창이 열리고, 타이핑하면 목록이 걸러진다", () => {
    render(
      <SelectCombobox
        value=""
        onChange={() => {}}
        options={SIGUNGU_OPTIONS}
        ariaLabel="시·군·구 선택"
      />,
    );

    openPanel();
    const search = screen.getByPlaceholderText("검색");
    expect(screen.getAllByRole("option")).toHaveLength(9);

    fireEvent.change(search, { target: { value: "충주" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("충주시");
  });

  it("검색 후 ↓·Enter로 선택하면 onChange가 그 값으로 불린다", () => {
    const onChange = vi.fn();
    render(
      <SelectCombobox
        value=""
        onChange={onChange}
        options={SIGUNGU_OPTIONS}
        ariaLabel="시·군·구 선택"
      />,
    );

    openPanel();
    const search = screen.getByPlaceholderText("검색");
    fireEvent.change(search, { target: { value: "충주" } });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "Enter" });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("chungju");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("matchKeys에 준 약칭으로도 검색된다", () => {
    render(
      <SelectCombobox
        value=""
        onChange={() => {}}
        options={SIGUNGU_OPTIONS}
        ariaLabel="시·군·구 선택"
        matchKeys={(opt) => (opt.value === "boeun" ? ["보은"] : [])}
      />,
    );

    openPanel();
    fireEvent.change(screen.getByPlaceholderText("검색"), {
      target: { value: "보은" },
    });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("보은군");
  });

  it("검색 결과가 없으면 안내 문구를 보여준다", () => {
    render(
      <SelectCombobox
        value=""
        onChange={() => {}}
        options={SIGUNGU_OPTIONS}
        ariaLabel="시·군·구 선택"
      />,
    );

    openPanel();
    fireEvent.change(screen.getByPlaceholderText("검색"), {
      target: { value: "없는지역" },
    });
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("찾는 항목이 없어요")).toBeInTheDocument();
  });

  it("Esc를 누르면 닫힌다", () => {
    render(
      <SelectCombobox
        value=""
        onChange={() => {}}
        options={SIGUNGU_OPTIONS}
        ariaLabel="시·군·구 선택"
      />,
    );

    openPanel();
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(screen.getByPlaceholderText("검색"), { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("button", { name: "시·군·구 선택" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("옵션이 7개면(auto 기준 8 미만) 검색창이 없다", () => {
    render(
      <SelectCombobox
        value=""
        onChange={() => {}}
        options={SIGUNGU_OPTIONS.slice(0, 7)}
        ariaLabel="시·군·구 선택"
      />,
    );

    openPanel();
    expect(screen.getAllByRole("option")).toHaveLength(7);
    expect(screen.queryByPlaceholderText("검색")).toBeNull();
  });

  it("선택값이 있으면 트리거에 그 라벨이 뜨고 aria-selected가 붙는다", () => {
    render(
      <SelectCombobox
        value="jecheon"
        onChange={() => {}}
        options={SIGUNGU_OPTIONS}
        ariaLabel="시·군·구 선택"
      />,
    );

    const trigger = screen.getByRole("button", { name: "시·군·구 선택" });
    expect(trigger).toHaveTextContent("제천시");

    fireEvent.click(trigger);
    const selected = screen
      .getAllByRole("option")
      .filter((el) => el.getAttribute("aria-selected") === "true");
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent("제천시");
  });
});
