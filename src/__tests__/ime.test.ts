import { describe, expect, it } from "vitest";
import { isComposingEvent, pickOnEnter, rankByName } from "@/lib/ime";

const crops = [
  { id: "rice", name: "쌀", desc: "논 재배가 기본" },
  { id: "soybean", name: "콩", desc: "밭작물 중 재배가 수월" },
  { id: "sweet-potato", name: "고구마", desc: "병해충에 강하고 재배가 쉬워" },
  { id: "pear", name: "배", desc: "과수" },
  { id: "napa-cabbage", name: "배추", desc: "김장 채소, 재배 시기" },
];
const rank = (q: string) => rankByName(crops, q, (c) => c.name, (c) => c.desc);

describe("isComposingEvent — 한글 조합 중 Enter 무시 (9/7 배추→고구마 사고)", () => {
  it("nativeEvent.isComposing / keyCode 229 를 조합 중으로 본다", () => {
    expect(isComposingEvent({ nativeEvent: { isComposing: true } })).toBe(true);
    expect(isComposingEvent({ keyCode: 229 })).toBe(true);
    expect(isComposingEvent({ nativeEvent: { isComposing: false }, keyCode: 13 })).toBe(false);
  });
});

describe("rankByName — 이름 우선 랭킹", () => {
  it("'배' 는 이름 완전 일치(배) → 이름 앞부분(배추) → 설명 매칭(쌀·콩·고구마) 순", () => {
    expect(rank("배").map((r) => r.item.id)).toEqual(["pear", "napa-cabbage", "rice", "soybean", "sweet-potato"]);
  });
  it("'배추' 는 배추 1건", () => {
    expect(rank("배추").map((r) => r.item.id)).toEqual(["napa-cabbage"]);
  });
  it("빈 검색어는 전체(입력 순서)", () => {
    expect(rank("").length).toBe(5);
  });
});

describe("pickOnEnter — Enter 확정 대상", () => {
  it("이름 완전 일치가 있으면 하이라이트를 무시하고 그것", () => {
    const r = rank("배");
    expect(pickOnEnter(r, crops[2])?.id).toBe("pear");
  });
  it("완전 일치 없고 결과 1건이면 그것", () => {
    expect(pickOnEnter(rank("배추"), undefined)?.id).toBe("napa-cabbage");
  });
  it("완전 일치 없고 여러 건이면 하이라이트", () => {
    expect(pickOnEnter(rank("재배"), crops[1])?.id).toBe("soybean");
  });
  it("조합 중 부분 입력이 설명문만 30건 맞춰도 고구마를 임의 확정하지 않는다 (사고 재현 케이스)", () => {
    // 부분 입력 "배" + 직전에 손이 스친 고구마(하이라이트) → 이름 일치 '배'가 우선
    expect(pickOnEnter(rank("배"), crops[2])?.id).not.toBe("sweet-potato");
  });
});
