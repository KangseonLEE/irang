/**
 * 작물 상세 KOSIS 소득 덮어쓰기 가드 (2026-10-10) — 종전엔 income > 0 하나였다
 */
import { describe, it, expect } from "vitest";
import { isPlausibleKosisIncome } from "@/lib/crops/kosis-income-guard";
import { parseRiceIncomeItems } from "@/lib/api/kosis";
import { CROP_DETAILS } from "@/lib/data/crops";

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

describe("쌀 — DT_1EC0010 도별 논벼 소득분석 (10/10, 종전 DT_1EA1501 은 농가경제조사 표)", () => {
  // 2026-10-10 KOSIS 실제 응답 발췌(전국평균 2025 · 10a당/농가당 · 도 행 하나)
  const row = (C1: string, C1_NM: string, C2_NM: string, ITM_NM: string, UNIT_NM: string, DT: string) => ({
    C1, C1_NM, C2_NM, ITM_NM, UNIT_NM, DT, PRD_DE: "2025",
  });
  const raw = [
    row("00", "전국평균", "총수입", "10a당", "원", "1348650.946"),
    row("00", "전국평균", "총수입", "농가당", "원", "20286485.5"),
    row("00", "전국평균", "생산비", "10a당", "원", "921394.758"),
    row("00", "전국평균", "순수익", "10a당", "원", "427256.188"),
    row("00", "전국평균", "경영비", "10a당", "원", "612346.461"),
    row("00", "전국평균", "소득", "10a당", "원", "736304.485"),
    row("00", "전국평균", "주산물", "10a당", "kg", "725"),
    row("31", "경기도", "소득", "10a당", "원", "999999"),
  ];
  const RICE_STATIC = CROP_DETAILS.find((d) => d.id === "rice")!.income.revenueRange;

  it("전국평균·10a당·원 행만 읽고 가드를 통과한다", () => {
    const parsed = parseRiceIncomeItems(raw, 2025);
    expect(parsed).toMatchObject({ grossRevenue: 1348650.946, operatingCost: 612346.461, income: 736304.485, year: 2025 });
    expect(isPlausibleKosisIncome(parsed, RICE_STATIC, 2026)).toBe(true);
    expect(Math.round(parsed!.income / 10000)).toBe(74); // 정적 값과 같은 숫자
  });
  it("정적 값은 2025년산 74만 원", () => {
    expect(RICE_STATIC).toContain("74만 원");
    expect(CROP_DETAILS.find((d) => d.id === "rice")!.income.source).toContain("2025년산");
  });
  it("항목이 빠지면 계산으로 메우지 않고 null", () => {
    expect(parseRiceIncomeItems(raw.filter((r) => r.C2_NM !== "소득"), 2025)).toBeNull();
    expect(parseRiceIncomeItems(raw, 2024)).toBeNull();
  });
});
