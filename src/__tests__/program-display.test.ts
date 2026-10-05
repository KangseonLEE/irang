import { describe, expect, it } from "vitest";
import { displayAmount, displayText, meaningfulProgramSummary } from "@/lib/programs/display";
import { PROGRAMS } from "@/lib/data/programs";
import { EDUCATION_COURSES } from "@/lib/data/education";

/**
 * 지원사업 요약 표시 — 수집 행의 출처 문장은 카드에서 숨긴다 (10/3 QA).
 * 10/3 Supabase 수집 행 91건의 요약은 아래 세 문장뿐이었다(54·30·7건).
 */
describe("meaningfulProgramSummary", () => {
  it("수집 출처 문장뿐인 요약은 null — 실제 DB 표기 3종", () => {
    expect(meaningfulProgramSummary("똑똑!청년농부 지원사업에서 수집. 상세 내용은 원문을 확인하세요.")).toBeNull();
    expect(meaningfulProgramSummary("농림부 통합 지원사업에서 수집했어요.")).toBeNull();
    expect(meaningfulProgramSummary("똑똑!청년농부 지원사업에서 수집했어요.")).toBeNull();
  });

  it("빈 값·공백·안내 채움 문장만 있는 값은 null", () => {
    expect(meaningfulProgramSummary(undefined)).toBeNull();
    expect(meaningfulProgramSummary(null)).toBeNull();
    expect(meaningfulProgramSummary("   ")).toBeNull();
    expect(meaningfulProgramSummary("상세 공고 참조")).toBeNull();
    expect(meaningfulProgramSummary("자세한 사항은 공고문을 참고하세요.")).toBeNull();
  });

  it("출처 문장 뒤에 원문 내용이 붙어 있으면 내용만 남긴다 — 소수점은 자르지 않는다", () => {
    expect(meaningfulProgramSummary("농림부 통합 지원사업에서 수집했어요. 청년농에게 최대 1.5억 원을 융자해요.")).toBe(
      "청년농에게 최대 1.5억 원을 융자해요.",
    );
    expect(
      meaningfulProgramSummary("똑똑!청년농부 지원사업에서 수집. 만 18~39세 대상이에요. 상세 내용은 원문을 확인하세요."),
    ).toBe("만 18~39세 대상이에요.");
  });

  it("걷어 낼 문장이 없으면 원문 그대로 — '수집'이 들어 있어도 출처 문장이 아니면 둔다", () => {
    const text = "토종 종자를 농가에서 수집해 보존하는 사업이에요. 0.3ha 이상 경작자가 대상이에요.";
    expect(meaningfulProgramSummary(text)).toBe(text);
    expect(meaningfulProgramSummary("  최대 5,000만 원 지원  ")).toBe("최대 5,000만 원 지원");
  });

  it("교육 수집 행 설명 3종(10/4 운영 DB 그린대로 105·RDA 95건)도 정보량 0 이라 null", () => {
    expect(
      meaningfulProgramSummary(
        "그린대로 귀농귀촌 교육에서 수집했어요. 그린대로(농식품부) 집계 기준이에요. 접수 마감일·세부 조건은 원문 공고를 꼭 확인하세요.",
      ),
    ).toBeNull();
    expect(meaningfulProgramSummary("똑똑!청년농부 교육과정에서 수집된 교육과정입니다.")).toBeNull();
    expect(meaningfulProgramSummary("똑똑!청년농부 교육과정에서 수집했어요.")).toBeNull();
  });

  it("'원문 공고 확인' 안내가 아닌 '확인' 문장은 남긴다", () => {
    const text = "접수는 10월 31일까지이고 결과는 개별 문자로 확인해요.";
    expect(meaningfulProgramSummary(text)).toBe(text);
  });

  it("정적 교육 설명은 하나도 숨겨지지 않는다", () => {
    for (const c of EDUCATION_COURSES) {
      expect(meaningfulProgramSummary(c.description), c.id).toBe(c.description.trim());
    }
  });

  it("정적 지원사업 요약은 하나도 숨겨지지 않는다 (손으로 쓴 요약은 그대로)", () => {
    for (const p of PROGRAMS) {
      expect(meaningfulProgramSummary(p.summary), p.id).toBe(p.summary.trim());
    }
  });
});

describe("displayText — 상투문 걷어 내기는 수집 행에만 (10/4 QA SP-044)", () => {
  const notice = "자세한 조건과 집 상태는 공고에 붙은 설명 자료에서 확인할 수 있어요.";

  it("큐레이션 행의 안내 문장은 그대로", () => {
    expect(displayText("SP-044", notice)).toBe(notice);
  });

  it("수집 행이면 같은 문장도 채움 문장으로 걷어 낸다", () => {
    expect(displayText("crawl-rda-programs-0000", "상세 내용은 원문을 확인하세요.")).toBeNull();
    expect(displayText("crawl-greendaero-education-a2e7e766", "그린대로 귀농귀촌 교육에서 수집했어요.")).toBeNull();
  });

  it("빈 값은 null — 줄째 그리지 않는다", () => {
    expect(displayText("SP-001", "  ")).toBeNull();
    expect(displayText("SP-001", undefined)).toBeNull();
  });

  it("정적 지원사업의 요약·설명은 하나도 바뀌지 않는다", () => {
    for (const p of PROGRAMS) {
      expect(displayText(p.id, p.summary), p.id).toBe(p.summary.trim() || null);
      if (p.description) expect(displayText(p.id, p.description), p.id).toBe(p.description.trim());
    }
  });
});

describe("displayAmount — 비용·금액 채움값 비우기는 수집 행에만 (10/4 ED-008)", () => {
  it("큐레이션 값은 '확인 필요'가 들어 있어도 그대로", () => {
    expect(displayAmount("ED-008", "입교비 소정 (확인 필요)")).toBe("입교비 소정 (확인 필요)");
  });

  it("수집 행의 채움값은 null, 실제 금액은 그대로", () => {
    expect(displayAmount("crawl-rda-programs-0000", "상세 공고 참조")).toBeNull();
    expect(displayAmount("crawl-rda-programs-0000", "개소당 5억 원")).toBe("개소당 5억 원");
  });

  it("정적 지원사업 금액·정적 교육 비용은 하나도 바뀌지 않는다", () => {
    for (const p of PROGRAMS) expect(displayAmount(p.id, p.supportAmount), p.id).toBe(p.supportAmount.trim() || null);
    for (const c of EDUCATION_COURSES) expect(displayAmount(c.id, c.cost), c.id).toBe(c.cost.trim() || null);
  });
});

