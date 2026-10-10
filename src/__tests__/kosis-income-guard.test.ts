/**
 * 작물 상세 KOSIS 소득 덮어쓰기 가드 (2026-10-10) — 종전엔 income > 0 하나였다
 */
import { describe, it, expect } from "vitest";
import { isPlausibleKosisIncome } from "@/lib/crops/kosis-income-guard";

const STATIC = "10a당 약 295만 원 (3,000평 재배 시 연 약 2,949만 원)"; // 마늘 2025년산
const ok = { grossRevenue: 5_847_033, operatingCost: 2_897_737, income: 2_949_296, year: 2025 };

describe("isPlausibleKosisIncome", () => {
  it("2026년에 2025년산 실제 응답(마늘)은 통과", () => {
    expect(isPlausibleKosisIncome(ok, STATIC, 2026)).toBe(true);
    expect(isPlausibleKosisIncome({ ...ok, year: 2024 }, STATIC, 2026)).toBe(true);
  });
  it("null·연도 밖은 정적 유지", () => {
    expect(isPlausibleKosisIncome(null, STATIC, 2026)).toBe(false);
    expect(isPlausibleKosisIncome({ ...ok, year: 2023 }, STATIC, 2026)).toBe(false);
    expect(isPlausibleKosisIncome({ ...ok, year: 2026 }, STATIC, 2026)).toBe(false);
  });
  it("항목을 잘못 짚으면(소득 ≠ 총수입 − 경영비) 정적 유지", () => {
    expect(isPlausibleKosisIncome({ ...ok, income: 1_311_607 }, STATIC, 2026)).toBe(false); // 순수익을 소득으로
    expect(isPlausibleKosisIncome({ ...ok, operatingCost: 0 }, STATIC, 2026)).toBe(false);
  });
  it("단위·표 오독(정적 값의 1/2 미만·2배 초과)은 정적 유지", () => {
    const k = 1000; // 천원 단위로 읽은 경우
    expect(
      isPlausibleKosisIncome({ grossRevenue: ok.grossRevenue / k, operatingCost: ok.operatingCost / k, income: ok.income / k, year: 2025 }, STATIC, 2026),
    ).toBe(false);
    expect(isPlausibleKosisIncome({ grossRevenue: 30_000_000, operatingCost: 10_000_000, income: 20_000_000, year: 2025 }, STATIC, 2026)).toBe(false);
  });
  it("정적 값이 숫자가 아니면 바꾸지 않는다", () => {
    expect(isPlausibleKosisIncome(ok, "추정 10a당 약 300만 원", 2026)).toBe(false);
  });
});
