import { describe, it, expect } from "vitest";
import { parseEligibilityItems } from "@/lib/programs/parse-eligibility";

const labels = (detail: string) => parseEligibilityItems(detail).map((i) => i.label);

describe("parseEligibilityItems — 문장 분리 함정 (9/28 QA)", () => {
  it("소수점(0.3ha)을 문장 끝으로 오인하지 않는다", () => {
    const out = labels("과수전업농육성대상자(과원 0.3ha 이상)인 농업인이에요.");
    expect(out).toEqual(["과수전업농육성대상자(과원 0.3ha 이상)인 농업인이에요"]);
    expect(out.some((l) => /\(과원 0$/.test(l))).toBe(false);
  });

  it("도메인에서 자르지 않는다", () => {
    const out = labels("농업e지(www.agrix.go.kr) 가입 농업인이어야 해요.");
    expect(out).toEqual(["농업e지(www.agrix.go.kr) 가입 농업인이어야 해요"]);
  });

  it("괄호 안 마침표로 라벨이 쪼개지지 않는다 (괄호 균형 유지)", () => {
    const out = labels("농업인(영농경력 3년 이상. 예외 있음)이 대상이에요.");
    expect(out).toHaveLength(1);
    const open = (out[0].match(/\(/g) ?? []).length;
    const close = (out[0].match(/\)/g) ?? []).length;
    expect(open).toBe(close);
  });

  it("접수 안내·온라인 전용 문장은 자격 항목이 아니라 제외한다", () => {
    const out = labels(
      "농촌 지역 전입 6개월 이내여야 해요. 2026년 접수는 1/5~2/11, 다음 회차는 시·군 공고 확인. 온라인 전용 — 오프라인 접수 불가.",
    );
    expect(out).toEqual(["농촌 지역 전입 6개월 이내여야 해요"]);
  });
});
