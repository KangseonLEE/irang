import { describe, it, expect } from "vitest";
import { parseIncome10a } from "@/lib/format";
import { parseIncome10a as parseIncome10aReexport } from "@/app/crops/crop-aggregate";
import { CROP_DETAILS } from "@/lib/data/crops";

/**
 * parseIncome10a 출력 고정 회귀 테스트.
 *
 * 배경: 과거 crop-aggregate.ts와 crops.ts에 동일 규칙 파서가 2벌 중복 정의돼 있었다.
 * @/lib/format의 단일 정의로 통합하면서, 대표 입력(실데이터 포맷)과 엣지 케이스에
 * 대한 출력을 고정해 향후 회귀를 차단한다.
 *
 * ⚠️ 정규식은 "만\s*원" — "만원"/"만 원" 표기를 모두 허용한다.
 *    (만원↔만 원 표기 통일 작업이 파서를 깨지 않음을 이 테스트가 보장)
 */
describe("parseIncome10a — 대표 입력 출력 고정", () => {
  // [입력 revenueRange, 기대 출력]
  const cases: Array<[string, number | null]> = [
    // 정상: 10a당 단일값
    ["10a당 약 171만 원 (노지재배 기준)", 171],
    ["10a당 약 1,259만 원 (시설재배 기준)", 1259],
    ["10a당 약 57만 원 (쌀 기준)", 57],
    // 정상: "시설" 수식어 삽입
    ["10a당 시설 약 1,764만 원 (방울토마토 기준)", 1764],
    // 정상: 범위 → (lo+hi)/2 반올림
    ["10a당 약 95~125만 원 (가을~봄감자 기준)", 110],
    ["10a당 약 548~705만 원 (노지~시설재배 기준)", 627], // (548+705)/2 = 626.5 → 627
    // 정상: 1ha당 → ÷10 환산
    ["1ha당 약 4,000~8,000만 원 (추정)", 600], // 평균 6000 ÷ 10
    ["1ha당 약 2,000만 원", 200],
    // 표기 통일 안전성: "만원"(붙임)도 동일 결과
    ["10a당 약 171만원 (붙임 표기)", 171],
    ["1ha당 약 2,000만원", 200],
    // 후행 보조 설명은 선두(^) 매칭에 영향 없음
    ["10a당 약 563만 원 (4년근 1기작 합계, 연평균 약 141만 원)", 563],
    // 엣지: 매칭 실패 → null
    ["", null],
    ["미상", null],
    ["임야 1,000평 기준 연 300만 원", null], // 선두가 10a/1ha당이 아님
    ["연 300만 원", null],
    ["약 500만 원", null], // 단위 접두 없음
    ["10a당 약 만 원", null], // 숫자 없음
  ];

  it.each(cases)("parseIncome10a(%j) === %j", (input, expected) => {
    expect(parseIncome10a(input)).toBe(expected);
  });

  it("crop-aggregate 재export가 동일 함수 참조", () => {
    expect(parseIncome10aReexport).toBe(parseIncome10a);
  });

  it("실 CROP_DETAILS 전체에 대해 예외 없이 number|null 반환", () => {
    for (const d of CROP_DETAILS) {
      const out = parseIncome10a(d.income.revenueRange);
      expect(out === null || typeof out === "number").toBe(true);
      if (typeof out === "number") {
        expect(Number.isFinite(out)).toBe(true);
        expect(Number.isInteger(out)).toBe(true);
      }
    }
  });
});
