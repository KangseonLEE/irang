import { describe, it, expect } from "vitest";
import {
  buildMonthMap,
  classifyStep,
  deriveCalendarRanges,
  parseAbsoluteMonths,
  parseRelativeOffset,
  summarizeSeason,
  type CalendarPhase,
  type MonthRange,
  describeCurrentPhase,
} from "@/lib/crops/calendar-ranges";
import { CROPS, getCropWithDetail } from "@/lib/data/crops";

/** 실데이터 그대로 도출 — 캘린더가 화면에서 쓰는 경로와 같다 */
function derive(id: string): MonthRange[] {
  const crop = CROPS.find((c) => c.id === id);
  if (!crop) throw new Error(`CROPS에 ${id}가 없어요`);
  const detail = getCropWithDetail(id);
  return deriveCalendarRanges({
    growingSeason: crop.growingSeason,
    cultivationSteps: detail?.detail.cultivationSteps,
  });
}

/** 해당 구간이 덮는 달 목록 */
function monthsOf(ranges: MonthRange[], phase: CalendarPhase): number[] {
  const months: number[] = [];
  const map = buildMonthMap(ranges);
  for (let m = 1; m <= 12; m++) if (map[m]?.phase === phase) months.push(m);
  return months;
}

describe("월 표기 파싱", () => {
  it("절대 표기를 모두 읽는다", () => {
    expect(parseAbsoluteMonths("3~4월")).toEqual([{ start: 3, end: 4 }]);
    expect(parseAbsoluteMonths("매년 9~11월")).toEqual([{ start: 9, end: 11 }]);
    expect(parseAbsoluteMonths("이듬해 3~4월")).toEqual([{ start: 3, end: 4 }]);
    expect(parseAbsoluteMonths("봄: 3~4월 / 가을: 9~10월")).toEqual([
      { start: 3, end: 4 },
      { start: 9, end: 10 },
    ]);
    expect(parseAbsoluteMonths("3~4월 또는 11월")).toEqual([
      { start: 3, end: 4 },
      { start: 11, end: 11 },
    ]);
    expect(parseAbsoluteMonths("5월 말~6월 중순")).toEqual([{ start: 5, end: 6 }]);
    expect(parseAbsoluteMonths("연중 (배지재배)")).toEqual([{ start: 1, end: 12 }]);
  });

  it("연도를 넘는 표기는 두 구간으로 나눈다", () => {
    expect(parseAbsoluteMonths("매년 12월~이듬해 5월")).toEqual([
      { start: 12, end: 12 },
      { start: 1, end: 5 },
    ]);
    expect(parseAbsoluteMonths("11~3월 (휴면기)")).toEqual([
      { start: 11, end: 12 },
      { start: 1, end: 3 },
    ]);
  });

  it("월이 아닌 숫자는 읽지 않는다", () => {
    expect(parseAbsoluteMonths("1~3년차")).toEqual([]);
    expect(parseAbsoluteMonths("식재 후 5~7년")).toEqual([]);
    expect(parseAbsoluteMonths("파종 후 40~50일")).toEqual([]);
    expect(parseAbsoluteMonths("정식 후 4~6개월")).toEqual([]);
    expect(parseAbsoluteMonths("본잎 2~3매 시")).toEqual([]);
  });

  it("숫자 월이 함께 적히면 연중보다 확정된 달을 남긴다", () => {
    expect(parseAbsoluteMonths("시설: 연중, 노지: 5월")).toEqual([
      { start: 5, end: 5 },
    ]);
  });
});

describe("상대 표기 → 경과 개월", () => {
  it("일·주·개월 단위를 개월로 환산한다", () => {
    expect(parseRelativeOffset("정식 후 60~70일")).toMatchObject({
      minMonths: 2,
      maxMonths: 3,
      text: "정식 후 60~70일",
    });
    expect(parseRelativeOffset("정식 후 4~6개월")).toMatchObject({
      minMonths: 4,
      maxMonths: 6,
    });
    expect(parseRelativeOffset("정식 후 30일부터 주 2~3회")).toMatchObject({
      minMonths: 1,
      maxMonths: 2,
    });
  });

  it("심는 시점이 아닌 기준은 도출하지 않는다", () => {
    expect(parseRelativeOffset("착과 후 40~45일")).toBeNull();
    expect(parseRelativeOffset("발생 후 5~7일")).toBeNull();
    expect(parseRelativeOffset("배양 완료 후")).toBeNull();
    expect(parseRelativeOffset("식재 후 5~7년")).toBeNull();
  });
});

describe("단계 분류", () => {
  it("제목 키워드로 세 구간을 나눈다", () => {
    expect(classifyStep("논 준비·이앙(모내기)")).toBe("sowing");
    expect(classifyStep("수확·건조")).toBe("harvest");
    expect(classifyStep("채화·선별·출하")).toBe("harvest");
    expect(classifyStep("수확(굴취)")).toBe("harvest");
    expect(classifyStep("못자리 준비·육묘")).toBe("growing");
    expect(classifyStep("육묘·정식 준비")).toBe("growing");
    expect(classifyStep("정식 준비·식재")).toBe("sowing");
  });
});

describe("작물별 도출 결과", () => {
  it("쌀 — 이앙 5~6월 파종, 수확 9~10월, 육묘 3~4월은 재배", () => {
    const ranges = derive("rice");
    expect(monthsOf(ranges, "sowing")).toEqual([5, 6]);
    expect(monthsOf(ranges, "harvest")).toEqual([9, 10]);
    expect(monthsOf(ranges, "growing")).toEqual(expect.arrayContaining([3, 4]));
    expect(summarizeSeason(ranges)).toBe("5~6월 파종·정식 → 9~10월 수확");
  });

  it("가지 — 상대 표기 수확을 정식 앵커에서 도출하고 근거를 남긴다", () => {
    const ranges = derive("eggplant");
    expect(monthsOf(ranges, "sowing")).toEqual([2, 3, 4, 5]);
    expect(monthsOf(ranges, "harvest")).toEqual([6, 7, 8]);

    const harvest = ranges.filter((r) => r.phase === "harvest");
    expect(harvest.every((r) => r.derived)).toBe(true);
    expect(harvest[0].sourceText).toBe("정식 후 60~70일");
  });

  it("사과 — 다년생 '매년 N~N월' 수확을 읽는다", () => {
    const ranges = derive("apple");
    expect(monthsOf(ranges, "harvest")).toEqual([9, 10, 11]);
    expect(ranges.some((r) => r.derived)).toBe(false);
  });

  it("딸기 — 연도를 넘는 수확을 '이듬해'로 읽는다", () => {
    const ranges = derive("strawberry");
    expect(monthsOf(ranges, "harvest")).toEqual([1, 2, 3, 4, 5, 12]);
    expect(summarizeSeason(ranges)).toBe(
      "9월 파종·정식 → 12월~이듬해 5월 수확"
    );
  });

  it("상추 — 연중 정식은 구분 정보가 없으므로 재배로 둔다", () => {
    const ranges = derive("lettuce");
    expect(monthsOf(ranges, "growing")).toHaveLength(12);
    expect(monthsOf(ranges, "sowing")).toEqual([]);
  });

  it("장미 — 연중 시설 작물은 열두 달 수확", () => {
    const ranges = derive("rose");
    expect(monthsOf(ranges, "harvest")).toHaveLength(12);
  });

  it("단계에서 월을 얻지 못하면 growingSeason으로 폴백한다", () => {
    const ranges = deriveCalendarRanges({
      growingSeason: "4월~10월",
      cultivationSteps: [
        { step: 1, title: "생육 관리", period: "정식 후 2~3주" },
      ],
    });
    expect(ranges).toEqual([{ start: 4, end: 10, phase: "growing" }]);
  });

  it("단계도 growingSeason도 못 읽으면 빈 배열", () => {
    expect(deriveCalendarRanges({ growingSeason: "품종별 상이" })).toEqual([]);
  });
});

describe("전수 sanity — 55종", () => {
  const all = CROPS.map((crop) => ({
    crop,
    steps: getCropWithDetail(crop.id)?.detail.cultivationSteps ?? [],
    ranges: derive(crop.id),
  }));

  it("모든 작물이 예외 없이 구간을 반환하고 1~12월 안에 있다", () => {
    for (const { crop, ranges } of all) {
      expect(ranges.length, `${crop.name} 구간 없음`).toBeGreaterThan(0);
      for (const r of ranges) {
        expect(r.start, `${crop.name} start`).toBeGreaterThanOrEqual(1);
        expect(r.end, `${crop.name} end`).toBeLessThanOrEqual(12);
        expect(r.start).toBeLessThanOrEqual(r.end);
      }
    }
  });

  it("수확 단계가 절대 월을 가진 작물은 반드시 수확 구간이 있다", () => {
    for (const { crop, steps, ranges } of all) {
      const hasAbsoluteHarvest = steps.some(
        (st) =>
          classifyStep(st.title) === "harvest" &&
          parseAbsoluteMonths(st.period).length > 0
      );
      if (!hasAbsoluteHarvest) continue;
      expect(
        monthsOf(ranges, "harvest").length,
        `${crop.name} 수확 구간 없음`
      ).toBeGreaterThan(0);
    }
  });

  it("도출 구간에는 근거 원문이 함께 남는다", () => {
    for (const { crop, ranges } of all) {
      for (const r of ranges) {
        if (!r.derived) continue;
        expect(r.phase, `${crop.name}`).toBe("harvest");
        expect(r.sourceText, `${crop.name} 근거 없음`).toBeTruthy();
      }
    }
  });
  it("생강 — '식부' 단계명도 파종·정식으로 분류 (4월 하순~5월 초 → 4~5월)", () => {
    const crop = getCropWithDetail("ginger")!;
    const ranges = deriveCalendarRanges({ growingSeason: crop.growingSeason, cultivationSteps: crop.detail.cultivationSteps });
    expect(ranges).toContainEqual(expect.objectContaining({ phase: "sowing", start: 4, end: 5 }));
    expect(ranges).toContainEqual(expect.objectContaining({ phase: "harvest", start: 10, end: 10 }));
  });

  it("describeCurrentPhase — 쌀 8월은 재배·관리, 11월은 쉬는 달 + 다음 시기(이듬해 3월 재배·관리)", () => {
    const crop = getCropWithDetail("rice")!;
    const ranges = deriveCalendarRanges({ growingSeason: crop.growingSeason, cultivationSteps: crop.detail.cultivationSteps });
    expect(describeCurrentPhase(ranges, 8).current?.phase).toBe("growing");
    expect(describeCurrentPhase(ranges, 9).current?.phase).toBe("harvest");
    const idle = describeCurrentPhase(ranges, 11);
    expect(idle.current).toBeNull();
    expect(idle.next?.month).toBe(3);
  });

  it("describeCurrentPhase — 구간이 전혀 없으면 current·next 모두 null", () => {
    expect(describeCurrentPhase([], 5)).toEqual({ current: null, next: null });
  });
});
