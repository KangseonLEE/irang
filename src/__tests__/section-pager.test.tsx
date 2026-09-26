import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { SectionPager } from "@/components/search/section-pager";

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
});
