/**
 * watchman §9 — 표기만 바뀐 데이터 변경은 정정 후보가 아니다 (2026-10-16 데이터 정합성 1차 QA, #178 365bae3 오탐).
 * 오탐(표기만인데 후보)과 누락(사실이 바뀌었는데 표기로 오인) 양쪽을 고정한다.
 */
import { describe, expect, it } from "vitest";
import { changedLinesFromDiff, isOrthographyOnlyChange } from "../../scripts/watchman/correction-diff";

const line = (s: string) => `      "${s}",`;

describe("표기만 — 후보에서 뺀다 (오탐 방지)", () => {
  it("365bae3 실제 변경: 받침 어미 '이에요 → 예요' 6곳", () => {
    const pairs = [
      ["찰옥수수, 초당옥수수 등 고부가가치 품종도 인기이에요.", "찰옥수수, 초당옥수수 등 고부가가치 품종도 인기예요."],
      ["소규모 시설재배에 적합한 입문용 채소이에요.", "소규모 시설재배에 적합한 입문용 채소예요."],
      ["수확까지 4~6년이 걸리므로, 그 기간 동안의 생활비 계획이 필수이에요.", "수확까지 4~6년이 걸리므로, 그 기간 동안의 생활비 계획이 필수예요."],
    ];
    expect(isOrthographyOnlyChange(pairs.map((p) => line(p[0])), pairs.map((p) => line(p[1])))).toBe(true);
  });

  it("띄어쓰기·문장 부호·천 단위 쉼표", () => {
    expect(isOrthographyOnlyChange([line("최대 3억원, 연 2.0%")], [line("최대 3억 원 · 연 2.0%")])).toBe(true);
    expect(isOrthographyOnlyChange([line("1000만 원")], [line("1,000만 원")])).toBe(true);
  });

  it("주석만 바뀐 변경", () => {
    expect(isOrthographyOnlyChange(["  // 옛 설명 (5/1)"], ["  // 새 설명 (10/16)"])).toBe(true);
    expect(isOrthographyOnlyChange([" * 출처 2024"], [" * 출처 2025", " * 한 줄 더"])).toBe(true);
  });

  it("git show -U0 출력에서 줄을 꺼낸다(머리 줄 제외)", () => {
    const diff = [
      "diff --git a/src/lib/data/crops.ts b/src/lib/data/crops.ts",
      "--- a/src/lib/data/crops.ts",
      "+++ b/src/lib/data/crops.ts",
      "@@ -10 +10 @@",
      `-${line("과수이에요.")}`,
      `+${line("과수예요.")}`,
    ].join("\n");
    const { removed, added } = changedLinesFromDiff(diff);
    expect(removed).toHaveLength(1);
    expect(added).toHaveLength(1);
    expect(isOrthographyOnlyChange(removed, added)).toBe(true);
  });
});

describe("사실이 바뀐 변경 — 후보로 남긴다 (누락 방지)", () => {
  it("숫자", () => {
    expect(isOrthographyOnlyChange([line("10a당 약 57만 원")], [line("10a당 약 74만 원")])).toBe(false);
    expect(isOrthographyOnlyChange([line("면적 3.5ha")], [line("면적 35ha")])).toBe(false);
    expect(isOrthographyOnlyChange(["    eligibilityAgeMin: 18,"], ["    eligibilityAgeMin: 0,"])).toBe(false);
  });

  it("낱말·지역명 (낱말 끝 글자 하나도)", () => {
    expect(isOrthographyOnlyChange([line("주산지 충청남도")], [line("주산지 충청북도")])).toBe(false);
    expect(isOrthographyOnlyChange([line("작물: 사과")], [line("작물: 사와")])).toBe(false);
    expect(isOrthographyOnlyChange([line("신청은 Agrix")], [line("신청은 농업e지")])).toBe(false);
  });

  it("줄이 늘거나 줄면(지운 줄 수 ≠ 넣은 줄 수)", () => {
    expect(isOrthographyOnlyChange([line("A예요.")], [line("A예요."), line("B예요.")])).toBe(false);
  });

  it("주석과 함께 사실 줄이 바뀌면 후보", () => {
    expect(
      isOrthographyOnlyChange(["  // 2024", line("소득 57만 원")], ["  // 2025", line("소득 74만 원")]),
    ).toBe(false);
  });
});
