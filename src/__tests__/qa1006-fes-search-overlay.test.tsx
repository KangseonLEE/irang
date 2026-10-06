// @vitest-environment jsdom
/**
 * 10/6 전체 QA 1차 — 결과 화면 검색창(모바일)이 여는 오버레이는 현재 검색어를 채워서 연다.
 * 헤더 단축키·모바일 버튼 등 다른 경로는 종전처럼 빈 검색창(최근 검색·바로 탐색)으로 연다.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import { SearchOverlayProvider } from "@/components/search/search-overlay";

vi.mock("@/components/search/search-bar", () => ({
  default: ({ onClose, syncQueryFromUrl }: { onClose: () => void; syncQueryFromUrl?: boolean }) => (
    <div data-testid="overlay-bar" data-sync={syncQueryFromUrl ? "1" : "0"}>
      <button onClick={onClose}>닫기</button>
    </div>
  ),
}));

function Consumer() {
  const { open } = useSearchOverlay();
  return (
    <>
      <button onClick={() => open("search_page_bar")}>결과바</button>
      <button onClick={() => open("shortcut")}>단축키</button>
    </>
  );
}

beforeEach(() => {
  (window as unknown as { gtag: unknown }).gtag = vi.fn();
});
afterEach(() => cleanup());

describe("SearchOverlayProvider — 여는 경로별 검색어 채움", () => {
  it("결과 화면 검색창에서 열면 현재 검색어를 채운다", () => {
    render(
      <SearchOverlayProvider>
        <Consumer />
      </SearchOverlayProvider>,
    );
    fireEvent.click(screen.getByText("결과바"));
    expect(screen.getByTestId("overlay-bar")).toHaveAttribute("data-sync", "1");
  });

  it("다른 경로로 열면 빈 검색창 — 닫았다 다시 열어도 직전 경로가 남지 않는다", () => {
    render(
      <SearchOverlayProvider>
        <Consumer />
      </SearchOverlayProvider>,
    );
    fireEvent.click(screen.getByText("결과바"));
    fireEvent.click(screen.getByText("닫기"));
    fireEvent.click(screen.getByText("단축키"));
    expect(screen.getByTestId("overlay-bar")).toHaveAttribute("data-sync", "0");
  });
});
