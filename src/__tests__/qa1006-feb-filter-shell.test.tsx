/**
 * 10/6 전체 QA 1차 — FE-B 회귀: FilterShell 이 만드는 URL
 *
 * - 복수 선택 값은 **선택지 순서**로 — middleware normalize 가 같은 순서로 재조립하므로 클릭 순서를 그대로 쓰면
 *   308 한 번을 더 거치고, 같은 선택이 다른 캐시 키가 된다.
 * - 필터를 바꾸면 쪽 번호(page)를 버린다 — 좁힌 결과에 3쪽이 없으면 빈 표가 나왔다(체험·교육은 currentFilters 에 page 를 싣는다).
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { FilterShell } from "@/components/filter/filter-shell";

const REGIONS = ["전국", "경기도", "강원도", "충청북도"] as const;
const TYPES = ["살아보기", "일일체험", "박람회"] as const;

function renderShell(currentFilters: Record<string, string | undefined> = {}) {
  return render(
    <FilterShell
      basePath="/events"
      currentFilters={currentFilters}
      params={[
        { paramKey: "type", label: "유형", options: TYPES, currentValue: currentFilters.type },
        { paramKey: "region", label: "지역", options: REGIONS, currentValue: currentFilters.region },
      ]}
    />,
  );
}

function pushedUrl(): URL {
  expect(push).toHaveBeenCalledTimes(1);
  return new URL(String(push.mock.calls[0][0]), "https://irangfarm.com");
}

describe("FilterShell URL", () => {
  beforeEach(() => push.mockClear());

  it("드롭다운: 클릭 순서와 무관하게 선택지 순서 CSV + page 버림", () => {
    renderShell({ page: "3", view: "table" });
    fireEvent.click(screen.getByRole("button", { name: /^지역/ }));
    const dialog = screen.getByRole("dialog", { name: "지역 필터" });
    fireEvent.click(within(dialog).getByRole("button", { name: "충청북도" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "경기도" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "적용" }));

    const url = pushedUrl();
    expect(url.pathname).toBe("/events");
    expect(url.searchParams.get("region")).toBe("경기도,충청북도");
    expect(url.searchParams.has("page")).toBe(false);
    expect(url.searchParams.get("view")).toBe("table");
  });

  it("활성 칩 하나를 지우면 남은 값만, 선택지 순서로", () => {
    renderShell({ type: "살아보기,박람회", region: "강원도" });
    fireEvent.click(screen.getByRole("button", { name: "살아보기 필터 제거" }));
    const url = pushedUrl();
    expect(url.searchParams.get("type")).toBe("박람회");
    expect(url.searchParams.get("region")).toBe("강원도");
  });
});
