import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { StatusToggle } from "@/app/admin/requests/status-toggle";

/**
 * 관리자 요청 상태 — 칩 클릭 즉시 순환 → 목록에서 고른 값만 PATCH (2026-09-26)
 */
beforeAll(() => {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
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
});

describe("admin StatusToggle", () => {
  beforeEach(() => {
    refresh.mockClear();
    vi.restoreAllMocks();
  });

  it("칩을 눌러도 상태가 바로 바뀌지 않고 목록이 열린다", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<StatusToggle id={18} currentStatus="pending" />);
    const trigger = screen.getByRole("button", { name: "요청 18 처리 상태" });
    expect(trigger).toHaveTextContent("대기");
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(trigger).toHaveTextContent("대기");
  });

  it("목록에서 고른 값만 PATCH 하고 라우터를 갱신한다", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true } as Response);
    render(<StatusToggle id={18} currentStatus="pending" />);
    fireEvent.click(screen.getByRole("button", { name: "요청 18 처리 상태" }));
    fireEvent.click(screen.getByRole("option", { name: "완료" }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("/admin/api/requests");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({ id: 18, status: "done" });
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "요청 18 처리 상태" })).toHaveTextContent("완료");
  });

  it("PATCH 실패 시 이전 값으로 되돌리고 안내를 띄운다", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 500 } as Response);
    render(<StatusToggle id={18} currentStatus="pending" />);
    fireEvent.click(screen.getByRole("button", { name: "요청 18 처리 상태" }));
    fireEvent.click(screen.getByRole("option", { name: "반려" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "요청 18 처리 상태" })).toHaveTextContent("대기");
    expect(refresh).not.toHaveBeenCalled();
  });
});
