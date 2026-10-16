/**
 * 자격 셀프 체크 파서 — 문장 첫머리 "신청일 기준·현재"는 자격의 기준 시점 (10/16 2차 QA ⚪-1).
 * SP-071(진도 겨울배추)은 하한 18 → 0 정정 뒤 연령 항목이 빠지자 파서 항목이 0개라 셀프 체크 탭째 사라졌다.
 * 첫 문장 "신청일 기준 진도군에 주소를 두고 …"가 '신청' 키워드에 걸려 빠졌던 것.
 */
import { describe, expect, it } from "vitest";
import { parseEligibilityItems } from "@/lib/programs/parse-eligibility";
import { PROGRAMS } from "@/lib/data/programs";

describe("parseEligibilityItems — 신청일 기준", () => {
  it("SP-071 자격 문장을 항목으로 읽는다", () => {
    const p = PROGRAMS.find((x) => x.id === "SP-071")!;
    expect(parseEligibilityItems(p.eligibilityDetail).map((i) => i.label)).toEqual([
      "신청일 기준 진도군에 주소를 두고 농업경영체를 등록한 겨울배추 재배 농업인",
    ]);
  });

  it("첫머리가 아닌 신청 안내 문장은 여전히 뺀다", () => {
    expect(parseEligibilityItems("신청은 읍·면사무소에서 받아요. 신청일 기준 접수는 2주예요.")).toEqual([]);
  });
});
