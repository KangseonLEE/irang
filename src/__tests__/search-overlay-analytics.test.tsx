import { StrictMode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useSearchOverlay } from "@/lib/hooks/use-search-overlay";
import { SearchOverlayProvider } from "@/components/search/search-overlay";

/** SearchBar 는 useSearchParams 를 쓰므로 계측 검증에는 불필요한 무게 — 가볍게 대체 */
vi.mock("@/components/search/search-bar", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <button onClick={onClose}>닫기</button>
  ),
}));

const gtag = vi.fn();

function Consumer() {
  const { open, isOpen } = useSearchOverlay();
  return (
    <>
      <button onClick={() => open("shortcut")}>단축키</button>
      <button onClick={() => open("mobile_button")}>모바일버튼</button>
      <button onClick={() => open("search_page_bar")}>검색페이지바</button>
      <span data-testid="state">{isOpen ? "open" : "closed"}</span>
    </>
  );
}

const overlayCalls = () =>
  gtag.mock.calls.filter((c) => c[1] === "search_overlay_open");

describe("search_overlay_open 계측 (9/29)", () => {
  beforeEach(() => {
    gtag.mockClear();
    (window as unknown as { gtag: unknown }).gtag = gtag;
  });

  it("경로별 라벨로 발화한다", () => {
    const { unmount } = render(
      <SearchOverlayProvider>
        <Consumer />
      </SearchOverlayProvider>,
    );
    fireEvent.click(screen.getByText("단축키"));
    expect(overlayCalls()).toHaveLength(1);
    expect(overlayCalls()[0][2]).toMatchObject({
      event_category: "search",
      event_label: "shortcut",
    });
    unmount();

    gtag.mockClear();
    render(
      <SearchOverlayProvider>
        <Consumer />
      </SearchOverlayProvider>,
    );
    fireEvent.click(screen.getByText("검색페이지바"));
    expect(overlayCalls()[0][2]).toMatchObject({ event_label: "search_page_bar" });
  });

  it("이미 열린 상태에서 다시 열어도 추가 발화가 없다", () => {
    render(
      <SearchOverlayProvider>
        <Consumer />
      </SearchOverlayProvider>,
    );
    fireEvent.click(screen.getByText("모바일버튼"));
    fireEvent.click(screen.getByText("단축키"));
    fireEvent.click(screen.getByText("모바일버튼"));
    expect(overlayCalls()).toHaveLength(1);
    expect(overlayCalls()[0][2]).toMatchObject({ event_label: "mobile_button" });
  });

  it("닫았다가 다시 열면 새로 발화한다", () => {
    render(
      <SearchOverlayProvider>
        <Consumer />
      </SearchOverlayProvider>,
    );
    fireEvent.click(screen.getByText("단축키"));
    expect(screen.getByTestId("state").textContent).toBe("open");
    fireEvent.click(screen.getByText("닫기"));
    expect(screen.getByTestId("state").textContent).toBe("closed");
    fireEvent.click(screen.getByText("모바일버튼"));
    expect(overlayCalls().map((c) => c[2].event_label)).toEqual(["shortcut", "mobile_button"]);
  });

  /** 9/29 실측 회귀: setState 업데이터 안에서 발화하면 StrictMode 가 두 번 호출해 2건이 찍혔다 */
  it("StrictMode 에서도 한 번만 발화한다", () => {
    render(
      <StrictMode>
        <SearchOverlayProvider>
          <Consumer />
        </SearchOverlayProvider>
      </StrictMode>,
    );
    fireEvent.click(screen.getByText("단축키"));
    expect(overlayCalls()).toHaveLength(1);
  });
});
