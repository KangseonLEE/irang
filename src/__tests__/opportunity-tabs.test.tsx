import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { OpportunityTabs, type OpportunityPanel } from "@/components/start/opportunity-tabs";

/**
 * 정착 유형 상세 "지금 신청할 수 있어요" 탭 (10/3 QA)
 *  - 배지 = 상한 전 전체 건수(타일 "32건"과 같은 수), 목록 = 상한까지
 *  - 상한에 걸리면 "N건 중 M건" + 전체 목록 링크
 *  - Home/End 키
 *  - 페이지를 넘기면 패널로 스크롤·포커스(마지막 쪽에서 포커스가 body 로 빠지지 않게)
 */
function cards(n: number, prefix: string) {
  return Array.from({ length: n }, (_, i) => (
    <a key={i} href={`/programs/${prefix}-${i}`}>
      {prefix} 카드 {i + 1}
    </a>
  ));
}

function panels(): OpportunityPanel[] {
  return [
    {
      id: "programs",
      label: "지원사업",
      track: "programs",
      total: 32,
      items: cards(12, "p"),
      empty: <p>없어요</p>,
      moreHref: "/programs?persona=family",
      moreLabel: "지원사업 전체 보기",
    },
    {
      id: "education",
      label: "교육",
      track: "education",
      total: 3,
      items: cards(3, "e"),
      empty: <p>없어요</p>,
      moreHref: "/education",
      moreLabel: "교육 전체 보기",
    },
    {
      id: "events",
      label: "체험",
      track: "events",
      total: 0,
      items: [],
      empty: <p>지금 모집 중인 체험이 없어요</p>,
      moreHref: "/events",
      moreLabel: "체험 전체 보기",
    },
  ];
}

describe("OpportunityTabs", () => {
  it("탭 배지는 상한 전 전체 건수다 — 목록 길이(12)가 아니라 32", () => {
    render(<OpportunityTabs panels={panels()} laneId="guinong" gridClassName="grid" />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["지원사업32", "교육3", "체험0"]);
  });

  it("상한에 걸린 패널만 'N건 중 M건'을 밝히고, 전체 목록 링크는 항상 있다", () => {
    const { container } = render(<OpportunityTabs panels={panels()} laneId="guinong" gridClassName="grid" />);
    const [programs, education, events] = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    expect(programs.textContent).toContain("32건 중 12건");
    expect(within(programs).getByRole("link", { name: /지원사업 전체 보기/ })).toHaveAttribute(
      "href",
      "/programs?persona=family",
    );
    expect(education.textContent).not.toContain("건 중");
    expect(events.textContent).not.toContain("건 중");
    // 숨은 패널도 SSR 링크를 위해 렌더된다
    expect(container.querySelectorAll('a[href^="/programs/p-"]')).toHaveLength(12);
  });

  it("Home/End 로 첫·마지막 탭으로 간다 (←/→ 순환은 종전대로)", () => {
    render(<OpportunityTabs panels={panels()} laneId="guinong" gridClassName="grid" />);
    const [first, , last] = screen.getAllByRole("tab");
    first.focus();
    fireEvent.keyDown(first, { key: "End" });
    expect(last).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(last);
    fireEvent.keyDown(last, { key: "Home" });
    expect(first).toHaveAttribute("aria-selected", "true");
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(last).toHaveAttribute("aria-selected", "true");
  });

  it("페이지를 넘기면 패널 머리로 스크롤하고 패널에 포커스를 둔다 — 마지막 쪽에서도 body 로 빠지지 않는다", async () => {
    const { container } = render(<OpportunityTabs panels={panels()} laneId="guinong" gridClassName="grid" />);
    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]')!;
    expect(panel).toHaveAttribute("tabindex", "-1");
    // 패널 머리가 화면 위로 지나간 상태(375 실측 −900px)를 흉내 낸다
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({ top: -900 } as DOMRect);
    const scrollIntoView = vi.fn();
    panel.scrollIntoView = scrollIntoView;

    const next = within(panel).getByRole("button", { name: "다음 페이지" });
    next.focus();
    await act(async () => {
      fireEvent.click(next);
    });
    expect(panel.querySelector('ul[data-page="2"]')).not.toHaveAttribute("hidden");
    expect(panel.querySelector('ul[data-page="1"]')).toHaveAttribute("hidden");
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: "start" }));
    await waitFor(() => expect(document.activeElement).toBe(panel));
    // 12건 = 2쪽 → 마지막 쪽에서 "다음"은 비활성
    expect(next).toBeDisabled();
  });

  it("패널 머리가 이미 화면 안이면 스크롤하지 않는다 (포커스만)", async () => {
    const { container } = render(<OpportunityTabs panels={panels()} laneId="guinong" gridClassName="grid" />);
    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]')!;
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({ top: 240 } as DOMRect);
    const scrollIntoView = vi.fn();
    panel.scrollIntoView = scrollIntoView;
    await act(async () => {
      fireEvent.click(within(panel).getByRole("button", { name: "2페이지" }));
    });
    expect(scrollIntoView).not.toHaveBeenCalled();
    await waitFor(() => expect(document.activeElement).toBe(panel));
  });
});
