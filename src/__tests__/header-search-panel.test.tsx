import { StrictMode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

/**
 * 헤더 검색 패널 (2026-10-02) — 트리거 ↔ ✕ 전환, 닫힘 경로(Esc·✕·바깥 클릭·포커스 이탈), 계측 1회.
 * SearchBar 는 router·searchParams 무게가 커서 입력 하나짜리로 대체한다(열릴 때마다 새로 마운트되는지는 key 로 본다).
 */
let mounts = 0;
vi.mock("@/components/search/search-bar", () => ({
  default: function FakeSearchBar({ onClose }: { onClose: () => void }) {
    mounts += 1;
    return (
      <form role="search">
        <input aria-label="통합 검색" autoFocus />
        <button type="button" onClick={onClose}>이동 완료</button>
      </form>
    );
  },
}));

const pathname = { current: "/regions" };
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

import { Header } from "@/components/layout/header";

const gtag = vi.fn();
const openCalls = () => gtag.mock.calls.filter((c) => c[1] === "search_overlay_open");
const panel = () => document.getElementById("header-search-panel") as HTMLElement;
const isOpen = () => !panel().hasAttribute("inert");

beforeEach(() => {
  gtag.mockClear();
  mounts = 0;
  pathname.current = "/regions";
  (window as unknown as { gtag: unknown }).gtag = gtag;
  // matchMedia — 데스크탑(768+)
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes("max-width") ? false : true,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

describe("헤더 검색 패널", () => {
  it("닫힌 동안엔 SearchBar 를 마운트하지 않고 패널은 inert", () => {
    render(<Header />);
    expect(panel()).toHaveAttribute("role", "dialog");
    expect(panel()).toHaveAttribute("aria-modal", "false");
    expect(isOpen()).toBe(false);
    expect(mounts).toBe(0);
  });

  it("트리거 클릭 → 열림·✕ 노출·계측 1회(StrictMode), 다시 열면 SearchBar 새로 마운트", () => {
    render(
      <StrictMode>
        <Header />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("button", { name: "통합검색 열기" }));
    expect(isOpen()).toBe(true);
    expect(openCalls()).toHaveLength(1);
    expect(openCalls()[0][2]).toMatchObject({ event_label: "header_input" });
    const close = screen.getByRole("button", { name: "검색 닫기" });
    expect(close).toHaveAttribute("aria-expanded", "true");
    expect(close).toHaveAttribute("aria-controls", "header-search-panel");
    expect(screen.queryByRole("button", { name: "통합검색 열기" })).toBeNull();

    fireEvent.click(close);
    expect(isOpen()).toBe(false);
    const before = mounts;
    fireEvent.click(screen.getByRole("button", { name: "통합검색 열기" }));
    expect(mounts).toBeGreaterThan(before);
    expect(openCalls()).toHaveLength(2);
  });

  it("Esc 로 닫힌다 — 한글 조합 중 Esc 는 무시", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "통합검색 열기" }));
    fireEvent.keyDown(document, { key: "Escape", isComposing: true });
    expect(isOpen()).toBe(true);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(isOpen()).toBe(false);
  });

  it("확인 다이얼로그가 떠 있으면 Esc·다이얼로그 클릭으로 패널이 닫히지 않는다", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "통합검색 열기" }));
    const dlg = document.createElement("div");
    dlg.setAttribute("data-irang-dialog", "");
    const btn = document.createElement("button");
    dlg.appendChild(btn);
    document.body.appendChild(dlg);
    fireEvent.keyDown(btn, { key: "Escape" });
    fireEvent.pointerDown(btn);
    expect(isOpen()).toBe(true);
    dlg.remove();
  });

  it("헤더 바깥 클릭·바깥으로 포커스 이동 시 닫히고, 헤더 안 클릭은 유지", () => {
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "통합검색 열기" }));
    fireEvent.pointerDown(screen.getByRole("textbox", { name: "통합 검색" }));
    expect(isOpen()).toBe(true);
    fireEvent.pointerDown(outside);
    expect(isOpen()).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: "통합검색 열기" }));
    act(() => outside.focus());
    expect(isOpen()).toBe(false);
    outside.remove();
  });

  it("⌘K 로 열리고, 열린 상태의 ⌘K 는 계측을 다시 보내지 않는다", () => {
    render(<Header />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    // 환경(mac 판정)에 따라 둘 중 하나가 단축키 — 어느 쪽이든 열림 1회
    expect(isOpen()).toBe(true);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(openCalls()).toHaveLength(1);
    expect(openCalls()[0][2]).toMatchObject({ event_label: "shortcut" });
  });

  it("검색 실행 후(SearchBar onClose) 닫힌다", () => {
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "통합검색 열기" }));
    fireEvent.click(screen.getByText("이동 완료"));
    expect(isOpen()).toBe(false);
  });

  it("/search 에서는 트리거가 없고 ⌘K 도 패널을 열지 않는다(페이지 검색창이 주인 — 10/2)", () => {
    pathname.current = "/search";
    render(<Header />);
    expect(screen.queryByRole("button", { name: "통합검색 열기" })).toBeNull();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(isOpen()).toBe(false);
  });
});
