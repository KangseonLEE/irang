import { StrictMode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

/**
 * 헤더 검색 (2026-10-02 오후 회장) — 헤더 검색도 히어로 검색과 같은 `/search` 화면으로 간다.
 * /search 에서는 트리거 자리에 ✕(닫기)가 있고, 들어오기 직전 페이지로 돌아간다(기록이 없으면 홈).
 */
const push = vi.fn();
const pathname = { current: "/regions" };
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ push }),
}));

import { Header } from "@/components/layout/header";

const gtag = vi.fn();
const openCalls = () => gtag.mock.calls.filter((c) => c[1] === "search_overlay_open");

beforeEach(() => {
  gtag.mockClear();
  push.mockClear();
  pathname.current = "/regions";
  (window as unknown as { gtag: unknown }).gtag = gtag;
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: !q.includes("max-width"),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

describe("헤더 검색", () => {
  it("트리거는 /search 링크 두 개(돋보기·입력창 모양), 패널 마크업은 없다", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "통합검색" })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: "통합검색 열기" })).toHaveAttribute("href", "/search");
    expect(document.querySelector("[role='dialog']")).toBeNull();
    expect(screen.queryByRole("button", { name: "검색 닫기" })).toBeNull();
  });

  it("트리거 클릭은 계측 1회(StrictMode)", () => {
    render(
      <StrictMode>
        <Header />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("link", { name: "통합검색 열기" }));
    expect(openCalls()).toHaveLength(1);
  });

  it("⌘K 는 /search 로 이동한다", () => {
    render(<Header />);
    // 환경(mac 판정)에 따라 둘 중 하나가 단축키
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/search");
  });

  it("/search 에서는 트리거 대신 ✕ — 직전 페이지로 돌아간다", () => {
    window.history.replaceState(null, "", "/regions?sido=gyeonggi");
    const { rerender } = render(<Header />);
    pathname.current = "/search";
    window.history.replaceState(null, "", "/search");
    rerender(<Header />);
    expect(screen.queryByRole("link", { name: "통합검색 열기" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "검색 닫기" }));
    expect(push).toHaveBeenCalledWith("/regions?sido=gyeonggi");
  });

  it("/search 로 바로 들어오면 ✕ 는 홈으로", () => {
    pathname.current = "/search";
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "검색 닫기" }));
    expect(push).toHaveBeenCalledWith("/");
  });
});
