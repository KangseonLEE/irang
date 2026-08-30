import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, within } from "@testing-library/react";
import { FarmingCalendar } from "@/components/crops/farming-calendar";
import { CROPS } from "@/lib/data/crops";

/** jsdom 미구현 API 스텁 — 용어 툴팁이 마운트될 때 호출한다 */
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

afterEach(() => {
  cleanup();
  delete (window as { gtag?: unknown }).gtag;
});

/** 실제 정적 데이터에서 뽑아 쓴다 — 캘린더가 받는 props 모양 그대로 */
const CALENDAR_CROPS = ["strawberry", "rice"].map((id) => {
  const crop = CROPS.find((c) => c.id === id);
  if (!crop) throw new Error(`CROPS에 ${id}가 없어요`);
  return {
    id: crop.id,
    name: crop.name,
    emoji: crop.emoji,
    category: crop.category,
    growingSeason: crop.growingSeason,
  };
});

function renderCalendar() {
  return render(<FarmingCalendar crops={CALENDAR_CROPS} />);
}

describe("FarmingCalendar 행 확장", () => {
  it("행을 클릭하면 aria-expanded가 켜지고 상세 패널이 열린다", () => {
    renderCalendar();

    const row = screen.getByRole("button", { name: "딸기" });
    expect(row).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(row);

    expect(row).toHaveAttribute("aria-expanded", "true");
    const panel = screen.getByRole("region", { name: "딸기 상세" });
    expect(
      within(panel).getByRole("link", { name: /작물 상세 보기/ })
    ).toHaveAttribute("href", "/crops/strawberry");
  });

  it("다른 행을 열면 앞서 열린 행은 닫힌다", () => {
    renderCalendar();

    const strawberry = screen.getByRole("button", { name: "딸기" });
    const rice = screen.getByRole("button", { name: "쌀" });

    fireEvent.click(strawberry);
    fireEvent.click(rice);

    expect(strawberry).toHaveAttribute("aria-expanded", "false");
    expect(rice).toHaveAttribute("aria-expanded", "true");
    expect(screen.queryByRole("region", { name: "딸기 상세" })).toBeNull();
    expect(screen.getByRole("region", { name: "쌀 상세" })).toBeInTheDocument();
  });

  it("같은 행을 다시 누르면 닫히고, 열릴 때만 GA 이벤트를 보낸다", () => {
    const gtag = vi.fn();
    (window as { gtag?: unknown }).gtag = gtag;

    renderCalendar();
    const row = screen.getByRole("button", { name: "딸기" });

    fireEvent.click(row);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith(
      "event",
      "calendar_row_expand",
      expect.objectContaining({ event_label: "strawberry" })
    );

    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-expanded", "false");
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("검색으로 열린 행이 목록에서 사라지면 패널도 닫힌다", () => {
    renderCalendar();

    fireEvent.click(screen.getByRole("button", { name: "딸기" }));
    expect(screen.getByRole("region", { name: "딸기 상세" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("캘린더 작물 검색"), {
      target: { value: "쌀" },
    });

    expect(screen.queryByRole("region", { name: "딸기 상세" })).toBeNull();
  });
});
