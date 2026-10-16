/**
 * 지원사업 대상 연령 ↔ 본문 근거 계약 (2026-10-16 데이터 정합성 1차 QA 🔴-2).
 *
 * 사고: `eligibilityAgeMin` 이 number 필수라 원문에 하한이 없는 큐레이션 사업 57건이 채움값 18 을 들고 있었다.
 * 화면 '대상 연령'은 '만 18세 이상', JSON-LD 는 suggestedMinAge 18 로 나갔고, 본문에 '연령 제한 없음'이라
 * 적힌 사업(SP-014·042·043)과 '연령 요건은 보도자료에 나와 있지 않아요'(SP-078)는 같은 화면 안에서 모순이었다.
 *
 * 규칙 (programs.ts `eligibilityAgeMin` 주석):
 *   1. 하한 > 0 이면 제목·요약·설명·자격 문장 어딘가에 그 나이가 "N세"·"N~" 꼴로 있어야 한다.
 *   2. 상한 < 99 이면 같은 문장들에 그 나이가 있어야 한다(“만 N세 이하”·“~N세”·“N세 미만” 등).
 *   3. 본문이 연령 제한이 없다고(또는 공고에 연령 조건이 없다고) 적으면 하한 0·상한 99 여야 한다.
 * 근거가 다른 곳(시행지침 등)에 있어 본문에 못 옮긴 경우만 ALLOW 에 사유와 함께 둔다.
 */
import { describe, expect, it } from "vitest";
import { PROGRAMS } from "@/lib/data/programs";

/** 본문에 나이가 없지만 원문에서 확인한 값 — id → 근거 (10/16 원문 curl 대조) */
const ALLOW_MIN: Record<string, string> = {
  // 군산시 2026 귀농 농업창업·주택구입 지원 공고: "연령 : 만 65세 이하 … *최저연령 : 만 18세이상"
  "SP-001": "군산시 공고 최저연령 만 18세",
};
const ALLOW_MAX: Record<string, string> = {
  "SP-001": "군산시 공고 만 65세 이하(1960.1.1. 이후 출생 세대주)",
  // GNN뉴스 168675: "65세 이하의 귀농을 희망하는 도시민이면 누구나 신청할 수 있다"
  "SP-024": "고성군 귀농인의 집 기사 65세 이하",
};

function evidenceText(p: (typeof PROGRAMS)[number]): string {
  return [p.title, p.summary, p.description ?? "", p.eligibilityDetail].join(" ");
}

function mentionsAge(text: string, age: number): boolean {
  return new RegExp(`(?<!\\d)${age}\\s*(세|~)`).test(text);
}

const NO_LIMIT = /연령\s*(제한|요건|조건)[^.。]{0,16}(없|나와 있지 않)/;

describe("지원사업 대상 연령은 본문 근거가 있을 때만 (10/16)", () => {
  const curated = PROGRAMS.filter((p) => p.id.startsWith("SP-"));

  it("큐레이션 사업이 있다", () => {
    expect(curated.length).toBeGreaterThan(50);
  });

  it("하한 > 0 이면 본문에 그 나이가 있다", () => {
    const missing = curated
      .filter((p) => p.eligibilityAgeMin > 0 && !ALLOW_MIN[p.id] && !mentionsAge(evidenceText(p), p.eligibilityAgeMin))
      .map((p) => `${p.id}(${p.eligibilityAgeMin})`);
    expect(missing).toEqual([]);
  });

  it("상한 < 99 이면 본문에 그 나이가 있다 (사유 있는 예외만 허용)", () => {
    const missing = curated
      .filter(
        (p) =>
          p.eligibilityAgeMax > 0 &&
          p.eligibilityAgeMax < 99 &&
          !ALLOW_MAX[p.id] &&
          // "40세 미만" 은 데이터에 39 로 적는다 — 둘 다 본다
          !mentionsAge(evidenceText(p), p.eligibilityAgeMax) &&
          !mentionsAge(evidenceText(p), p.eligibilityAgeMax + 1),
      )
      .map((p) => `${p.id}(${p.eligibilityAgeMax})`);
    expect(missing).toEqual([]);
  });

  it("본문이 연령 제한이 없다고 하면 하한 0·상한 99", () => {
    const contradicting = curated
      .filter((p) => NO_LIMIT.test(evidenceText(p)) && (p.eligibilityAgeMin > 0 || p.eligibilityAgeMax < 99))
      .map((p) => `${p.id}(${p.eligibilityAgeMin}~${p.eligibilityAgeMax})`);
    expect(contradicting).toEqual([]);
  });

  it("10/16 정정 대표 사업 — 하한이 없다", () => {
    for (const id of ["SP-014", "SP-042", "SP-043", "SP-078", "SP-055", "SP-005", "SP-046"]) {
      const p = PROGRAMS.find((x) => x.id === id);
      expect(p?.eligibilityAgeMin, id).toBe(0);
    }
  });

  it("허용 목록은 실제 사업만 가리킨다", () => {
    for (const id of [...Object.keys(ALLOW_MIN), ...Object.keys(ALLOW_MAX)]) expect(PROGRAMS.some((p) => p.id === id), id).toBe(true);
  });
});
