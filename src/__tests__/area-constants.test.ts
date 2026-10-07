/**
 * 면적 상수 = 지역 데이터 (10/8 2차 QA ⚪) — 지적통계로 면적을 바꾼 뒤에도 안내 창의 국토 면적(100,401)·서울
 * 면적(605)이 옛 값이라 경북 '전국 면적 비율'이 18.4%로 보였다(새 값이면 18.3%). 다음 갱신 때 같이 바뀌게 묶는다.
 */
import { describe, expect, it } from "vitest";

import { NATIONAL_AREA_KM2, SEOUL_AREA_KM2, seoulAreaCompare } from "@/lib/format";
import { PROVINCES } from "@/lib/data/regions";

describe("면적 상수", () => {
  it("서울 면적 = regions.ts 서울", () => {
    expect(SEOUL_AREA_KM2).toBe(PROVINCES.find((p) => p.id === "seoul")!.area);
  });
  it("국토 면적 = 시·도 17곳 합(소수 둘째 자리)", () => {
    const sum = Math.round(PROVINCES.reduce((a, p) => a + p.area, 0) * 100) / 100;
    expect(NATIONAL_AREA_KM2).toBe(sum);
  });
  it("경북 전국 면적 비율 18.3%", () => {
    const gb = PROVINCES.find((p) => p.id === "gyeongbuk")!.area;
    expect(((gb / NATIONAL_AREA_KM2) * 100).toFixed(1)).toBe("18.3");
  });
  it("서울 비교 문장은 그대로 — 서울 자신은 약 1.0배", () => {
    expect(seoulAreaCompare(SEOUL_AREA_KM2).ratio).toBe("약 1.0배");
  });
});
