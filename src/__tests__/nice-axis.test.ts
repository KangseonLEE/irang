import { describe, expect, it } from "vitest";
import { axisTickLabel, niceAxis } from "@/components/charts/nice-axis";

/**
 * 공용 Y축 — 1·2·5 단위 눈금. `/start` 추세 차트의 최상단 눈금이 "17.1천"·"54.7천"·"9.1천"
 * (최댓값 × 1.18) 이던 것을 정리했다 (10/3 QA).
 */
const labels = (values: number[]) => {
  const axis = niceAxis(values, { zero: true });
  const step = axis.ticks[1] - axis.ticks[0];
  return axis.ticks.map((t) => axisTickLabel(t, step));
};

describe("niceAxis — 0 기준 축", () => {
  it("0 에서 시작하고 최댓값을 덮는 1·2·5 단위 눈금으로 끝난다", () => {
    for (const values of [[13_019, 14_461, 9_134], [40_350, 46_347], [4_010, 7_716], [9.6, 13.1], [41.3, 49.7]]) {
      const { domain, ticks } = niceAxis(values, { zero: true });
      const step = ticks[1] - ticks[0];
      expect(ticks[0]).toBe(0);
      expect(domain).toEqual([0, ticks[ticks.length - 1]]);
      expect(domain[1]).toBeGreaterThanOrEqual(Math.max(...values));
      expect(ticks.length).toBeGreaterThanOrEqual(3);
      expect(ticks.length).toBeLessThanOrEqual(6);
      const mantissa = step / 10 ** Math.floor(Math.log10(step));
      expect([1, 2, 5]).toContain(Number(mantissa.toFixed(6)));
    }
  });

  it("정착 유형 추세 5종의 실제 범위 — 어중간한 눈금이 없다", () => {
    expect(labels([13_019, 14_461, 9_134])).toEqual(["0", "5천", "1만", "1.5만"]); // 귀농인(명)
    expect(labels([40_350, 46_347])).toEqual(["0", "2만", "4만", "6만"]); // 귀산촌 가구
    expect(labels([4_010, 7_716])).toEqual(["0", "2천", "4천", "6천", "8천"]); // 스마트온실 ha
    expect(labels([9.6, 13.1])).toEqual(["0", "5", "10", "15"]); // 청년농 비율 %
    expect(labels([41.3, 49.7])).toEqual(["0", "20", "40", "60"]); // 귀촌인 만 명
  });

  it("기본(zero 없음)은 그대로 — 최솟값 아래에서 시작하는 확대 축 (인구·스마트팜 차트)", () => {
    expect(niceAxis([0.84, 1.29]).ticks).toEqual([0.6, 0.8, 1, 1.2, 1.4]);
    expect(niceAxis([0.84, 1.29]).ticks[0]).toBeGreaterThan(0);
  });
});

describe("axisTickLabel", () => {
  it("1만 이상 '만', 1천 이상 '천', 그 아래는 눈금 간격의 소수 자릿수", () => {
    expect(axisTickLabel(15_000, 5_000)).toBe("1.5만");
    expect(axisTickLabel(20_000, 5_000)).toBe("2만");
    expect(axisTickLabel(5_000, 5_000)).toBe("5천");
    expect(axisTickLabel(0, 5_000)).toBe("0");
    expect(axisTickLabel(0.5, 0.5)).toBe("0.5");
    expect(axisTickLabel(1, 0.5)).toBe("1.0");
    expect(axisTickLabel(40, 20)).toBe("40");
  });
});
