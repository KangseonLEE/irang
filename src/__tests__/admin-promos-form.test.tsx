import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const confirmMock = vi.fn(async () => true);
const alertMock = vi.fn(async () => {});

vi.mock("@/components/ui/confirm-dialog", () => ({
  useDialog: () => ({ confirm: confirmMock, alert: alertMock }),
}));
// 미리보기는 실제 랜딩 팝업을 띄운다 — 여기서는 폼 동작만 보므로 자리만 잡는다
vi.mock("@/components/landing/promo-popup", () => ({
  PromoPopup: ({ items }: { items: { title: string }[] }) => <div data-testid="preview">{items[0]?.title}</div>,
}));

import { PromoForm } from "@/app/admin/promos/promo-form";
import type { PromoRecord } from "@/lib/promos/types";

const record: PromoRecord = {
  id: "gafi-masil-2026",
  org: "경기도 귀농귀촌지원센터",
  title: "재능으로 잇는 마실짝꿍",
  tagline: "도시민의 재능 × 주민의 삶",
  image: "/promo/gafi-masil-2026.webp",
  imageWidth: 600,
  imageHeight: 851,
  alt: "포스터",
  facts: [{ label: "문의", value: "1800-8114", href: "tel:18008114" }],
  recruitClosed: false,
  note: "",
  href: "https://www.refarmgg.or.kr/",
  startsAt: "2026-10-01",
  until: "2026-11-15",
  active: true,
  sortOrder: 0,
  updatedAt: "2026-09-29T00:00:00.000Z",
};

describe("admin PromoForm", () => {
  beforeEach(() => {
    confirmMock.mockClear();
    alertMock.mockClear();
    vi.restoreAllMocks();
  });

  it("필수값이 비면 저장 요청을 보내지 않고 안내만 띄운다", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<PromoForm initial={null} onCancel={() => {}} onSaved={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /저장/ }));

    await waitFor(() => expect(alertMock).toHaveBeenCalled());
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(confirmMock).not.toHaveBeenCalled();
    expect(screen.getByText("기관 이름을 적어 주세요")).toBeTruthy();
  });

  it("수정 저장은 확인을 거쳐 PUT 하고 결과를 넘긴다", async () => {
    const saved = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ item: { ...record, title: "새 제목" } }),
    } as Response);

    render(<PromoForm initial={record} onCancel={() => {}} onSaved={saved} />);
    fireEvent.change(screen.getByDisplayValue(record.title), { target: { value: "새 제목" } });
    fireEvent.click(screen.getByRole("button", { name: /저장/ }));

    await waitFor(() => expect(saved).toHaveBeenCalled());
    expect(confirmMock).toHaveBeenCalled();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/admin/api/promos/gafi-masil-2026");
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toMatchObject({ title: "새 제목", startsAt: "2026-10-01", active: true });
  });

  it("종료가 시작보다 빠르면 막고, 포스터가 없으면 미리보기를 못 연다", async () => {
    const { unmount } = render(<PromoForm initial={record} onCancel={() => {}} onSaved={() => {}} />);
    fireEvent.change(screen.getByDisplayValue("2026-11-15"), { target: { value: "2026-09-01" } });
    fireEvent.click(screen.getByRole("button", { name: /저장/ }));
    await waitFor(() => expect(screen.getByText(/종료 날짜가 시작 날짜보다 빨라요/)).toBeTruthy());
    unmount();

    render(<PromoForm initial={null} onCancel={() => {}} onSaved={() => {}} />);
    expect(screen.getByRole("button", { name: /미리보기/ })).toHaveProperty("disabled", true);
  });

  it("포스터가 있으면 미리보기에 지금 입력한 제목이 그대로 보인다", () => {
    render(<PromoForm initial={record} onCancel={() => {}} onSaved={() => {}} />);
    fireEvent.change(screen.getByDisplayValue(record.title), { target: { value: "미리보기 제목" } });
    fireEvent.click(screen.getByRole("button", { name: /미리보기/ }));
    expect(screen.getByTestId("preview").textContent).toBe("미리보기 제목");
  });
});
