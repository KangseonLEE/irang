import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { RegionPicker } from "@/components/region/region-picker";
import { PROVINCES } from "@/lib/data/regions";
import { SIGUNGUS } from "@/lib/data/sigungus";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; prefetch?: boolean }) => {
    const attrs: Record<string, unknown> = { ...rest };
    delete attrs.prefetch;
    return (
      <a href={href} {...attrs}>
        {children}
      </a>
    );
  },
}));

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

const provinces = PROVINCES.map((p) => ({ id: p.id, shortName: p.shortName }));
const sigungus = SIGUNGUS.map((sg) => ({ sidoId: sg.sidoId, id: sg.id, name: sg.name, shortName: sg.shortName }));

function setup() {
  render(<RegionPicker provinces={provinces} sigungus={sigungus} trackPrefix="region_map" />);
}

describe("RegionPicker (랜딩 모바일 시·도 → 시·군·구 2단 선택)", () => {
  it("처음엔 시·군·구 선택과 이동이 비활성", () => {
    setup();
    expect(screen.getByRole("button", { name: /시·군·구 선택/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "시·도를 먼저 골라 주세요" })).toBeDisabled();
  });

  it("시·도만 고르면 시·도 페이지로, 시·군·구까지 고르면 시·군·구 페이지로 이동 링크가 바뀐다", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "시·도 선택" }));
    fireEvent.click(screen.getByRole("option", { name: "경기" }));
    const sidoLink = screen.getByRole("link", { name: "경기 전체 보기" });
    expect(sidoLink).toHaveAttribute("href", "/regions/gyeonggi");

    fireEvent.click(screen.getByRole("button", { name: "경기 시·군·구 선택" }));
    // 첫 옵션은 "경기 전체", 이어서 경기 시·군·구만
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveTextContent("경기 전체");
    expect(options).toHaveLength(1 + SIGUNGUS.filter((sg) => sg.sidoId === "gyeonggi").length);
    fireEvent.click(screen.getByRole("option", { name: "가평군" }));

    const link = screen.getByRole("link", { name: "경기 가평군 보기" });
    expect(link).toHaveAttribute("href", "/regions/gyeonggi/gapyeong");
    expect(link).toHaveAttribute("data-track", "region_map:pick:gyeonggi/gapyeong");
  });

  it("시·도를 바꾸면 시·군·구 선택이 초기화된다", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "시·도 선택" }));
    fireEvent.click(screen.getByRole("option", { name: "경기" }));
    fireEvent.click(screen.getByRole("button", { name: "경기 시·군·구 선택" }));
    fireEvent.click(screen.getByRole("option", { name: "가평군" }));
    fireEvent.click(screen.getByRole("button", { name: "시·도 선택" }));
    fireEvent.click(screen.getByRole("option", { name: "강원" }));
    expect(screen.getByRole("link", { name: "강원 전체 보기" })).toHaveAttribute("href", "/regions/gangwon");
  });
});
