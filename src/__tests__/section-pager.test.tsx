import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SectionPager } from "@/components/ui/section-pager";

/** 검색 결과 섹션 공용 페이저 (9/27) — 지역·지원사업이 같은 컴포넌트를 쓴다 */
describe("SectionPager", () => {
  it("1페이지면 렌더하지 않는다", () => {
    const { container } = render(<SectionPager page={0} total={1} onChange={() => {}} ariaLabel="지원사업 결과 페이지" />);
    expect(container.querySelector("nav")).toBeNull();
  });

  it("현재 페이지 aria-current, 이전/다음 비활성, 클릭은 0-based 로 전달", () => {
    const onChange = vi.fn();
    render(<SectionPager page={0} total={3} onChange={onChange} ariaLabel="지원사업 결과 페이지" />);
    const nav = screen.getByRole("navigation", { name: "지원사업 결과 페이지" });
    expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe("1");
    expect(screen.getByRole("button", { name: "이전 페이지" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "2페이지" }));
    expect(onChange).toHaveBeenCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("페이지가 많으면 처음·현재±1·마지막만 버튼, 사이는 …", () => {
    render(<SectionPager page={5} total={12} onChange={() => {}} ariaLabel="지원사업 결과 페이지" />);
    const nav = screen.getByRole("navigation", { name: "지원사업 결과 페이지" });
    const nums = [...nav.querySelectorAll("li > button")].map((b) => b.textContent);
    expect(nums).toEqual(["1", "5", "6", "7", "12"]);
    expect(nav.textContent).toContain("…");
  });

  /** 10/3 QA (WCAG 2.4.3) — 끝 쪽에서 이전·다음이 비활성이 되면 포커스가 body 로 빠졌다 */
  function Controlled({ total, start = 0 }: { total: number; start?: number }) {
    const [page, setPage] = useState(start);
    return <SectionPager page={page} total={total} onChange={setPage} ariaLabel="관련 작물 페이지" />;
  }

  it("다음으로 마지막 쪽에 닿으면 포커스가 현재 쪽 번호로 옮겨 간다", async () => {
    render(<Controlled total={2} />);
    const next = screen.getByRole("button", { name: "다음 페이지" });
    next.focus();
    await act(async () => {
      fireEvent.click(next);
    });
    expect(next).toBeDisabled();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "2페이지" })));
  });

  it("이전으로 첫 쪽에 닿아도 같다", async () => {
    render(<Controlled total={3} start={1} />);
    const prev = screen.getByRole("button", { name: "이전 페이지" });
    prev.focus();
    await act(async () => {
      fireEvent.click(prev);
    });
    expect(prev).toBeDisabled();
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "1페이지" })));
  });

  it("끝이 아니면(다음이 계속 활성) 포커스를 건드리지 않는다", async () => {
    render(<Controlled total={3} />);
    const next = screen.getByRole("button", { name: "다음 페이지" });
    next.focus();
    await act(async () => {
      fireEvent.click(next);
    });
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(document.activeElement).toBe(next);
  });
});
