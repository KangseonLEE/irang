/**
 * 10/6 2차 QA R2-Q4 — "이전 진단 결과" 중복 칸.
 * 정착 유형 진단 항목은 답을 남기지 않아 같은 결과 판정이 늘 false 였다 → 같은 답으로 다시 마치면 두 칸.
 * 이제 유형 진단은 결과(유형 + 추천 지역·작물)로, 나머지는 답으로 같은지 보고, 목록 어디에 있든 한 칸만 남긴다.
 */
import { describe, expect, it } from "vitest";
import { addHistoryItem, parseHistory, type NewHistoryItem } from "@/lib/diagnosis/history";

const match = (resultId: string, over: Partial<Extract<NewHistoryItem, { kind?: "match" }>> = {}): NewHistoryItem => ({
  kind: "match",
  resultId,
  farmTypeId: "guinong",
  farmTypeLabel: "귀농형",
  topRegions: ["전남", "전북", "경남"],
  topRegionIds: ["jeonnam", "jeonbuk", "gyeongnam"],
  topCropIds: ["strawberry", "garlic"],
  ...over,
});

describe("정착 유형 진단 — 결과가 같으면 한 칸", () => {
  it("같은 유형·지역·작물이면 새 id 라도 한 칸(맨 앞, 시각만 새로)", () => {
    let list = addHistoryItem([], match("m1"), "t1");
    list = addHistoryItem(list, match("m2"), "t2");
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ resultId: "m2", savedAt: "t2" });
  });

  it("유형·지역·작물 중 하나라도 다르면 다른 결과", () => {
    let list = addHistoryItem([], match("m1"), "t1");
    list = addHistoryItem(list, match("m2", { farmTypeId: "guichon", farmTypeLabel: "귀촌형" }), "t2");
    list = addHistoryItem(list, match("m3", { topRegionIds: ["gangwon", "jeonbuk", "gyeongnam"] }), "t3");
    list = addHistoryItem(list, match("m4", { topCropIds: ["apple"] }), "t4");
    expect(list.map((h) => h.resultId)).toEqual(["m4", "m3", "m2", "m1"]);
  });

  it("예전 항목(kind 없음)과도 같은 결과로 본다", () => {
    const legacy = parseHistory([{ ...match("old"), kind: undefined, savedAt: "t0" }]);
    expect(legacy[0].kind).toBe("match");
    const list = addHistoryItem(legacy, match("new"), "t1");
    expect(list.map((h) => h.resultId)).toEqual(["new"]);
  });
});

describe("같은 결과는 목록 어디에 있든 한 칸", () => {
  it("사이에 다른 진단이 끼어 있어도 같은 결과는 맨 앞으로 옮긴다", () => {
    let list = addHistoryItem([], match("m1"), "t1");
    list = addHistoryItem(list, { kind: "quick", resultId: "q1", answers: { farming: "side" } }, "t2");
    list = addHistoryItem(list, match("m2"), "t3");
    expect(list.map((h) => h.resultId)).toEqual(["m2", "q1"]);
  });

  it("빠른 점검·적합도 진단은 답이 같아야 같은 결과 — 종류가 다르면 겹치지 않는다", () => {
    let list = addHistoryItem([], { kind: "quick", resultId: "q1", answers: { ageGroup: "40s" } }, "t1");
    list = addHistoryItem(
      list,
      { kind: "assess", resultId: "a1", answers: { m1: 3 }, demo: {}, track: {}, farmTypeId: "guinong", farmTypeLabel: "귀농형" },
      "t2",
    );
    list = addHistoryItem(list, { kind: "quick", resultId: "q2", answers: { ageGroup: "40s" } }, "t3");
    list = addHistoryItem(list, { kind: "quick", resultId: "q3", answers: { ageGroup: "50s" } }, "t4");
    expect(list.map((h) => h.resultId)).toEqual(["q3", "q2", "a1"]);
  });
});
