import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render } from "@testing-library/react";

/**
 * 정착 유형 상세 추세 차트 — 동작 줄이기(prefers-reduced-motion) 존중 (10/3 QA).
 * Recharts 는 jsdom 에서 크기를 못 재 그리지 않으므로, Area 가 받는 애니메이션 prop 만 본다.
 */
const reduceMotion = vi.hoisted(() => ({ value: false }));

vi.mock("@/lib/hooks/use-media-query", () => ({
  useMediaQuery: (query: string) => (query.includes("prefers-reduced-motion") ? reduceMotion.value : false),
}));

vi.mock("recharts", () => {
  const Pass = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Empty = () => null;
  return {
    ResponsiveContainer: Pass,
    AreaChart: Pass,
    CartesianGrid: Empty,
    ReferenceLine: Empty,
    Tooltip: Empty,
    XAxis: Empty,
    YAxis: Empty,
    Area: ({ isAnimationActive }: { isAnimationActive?: boolean }) => (
      <i data-testid="area" data-animate={String(isAnimationActive)} />
    ),
  };
});

const { LaneTrendChart } = await import("@/components/start/lane-trend-chart");

const props = {
  points: [
    { year: 2022, value: 1.2 },
    { year: 2023, value: 1.1 },
  ],
  seriesLabel: "귀농 인구",
  unit: "만 명",
  decimals: 2,
  target: null,
};

describe("LaneTrendChart", () => {
  it("기본은 그리기 애니메이션을 켠다", () => {
    reduceMotion.value = false;
    const { getByTestId } = render(<LaneTrendChart {...props} />);
    expect(getByTestId("area").dataset.animate).toBe("true");
  });

  it("동작 줄이기 설정이면 애니메이션을 끈다", () => {
    reduceMotion.value = true;
    const { getByTestId } = render(<LaneTrendChart {...props} />);
    expect(getByTestId("area").dataset.animate).toBe("false");
  });
});
