import { describe, it, expect } from "vitest";
import { resolveEligibilitySupport } from "@/lib/programs/eligibility-support";

describe("resolveEligibilitySupport", () => {
  it("교육·수료 조건은 /education 으로", () => {
    expect(resolveEligibilitySupport("영농 관련 교육 100시간 이상 이수")).toMatchObject({
      kind: "education",
      href: "/education",
    });
    expect(resolveEligibilitySupport("전북 청년창업보육센터 수료(예정)자")?.kind).toBe("education");
  });

  it("전입·거주 조건은 /regions 로", () => {
    expect(resolveEligibilitySupport("농촌지역 전입일로부터 만 6년 미경과 세대주")).toMatchObject({
      kind: "region",
      href: "/regions",
    });
    expect(resolveEligibilitySupport("완주군 주민등록 이전 완료")?.kind).toBe("region");
  });

  it("시·군·구를 고르는 조건은 순위 페이지로", () => {
    expect(resolveEligibilitySupport("거주 시군구 지정 필요")?.href).toBe("/regions/ranking");
  });

  it("청년 연령(상한 45세 이하)은 청년 지원사업으로", () => {
    expect(resolveEligibilitySupport("만 18~39세")).toMatchObject({
      kind: "youth",
      href: "/programs?persona=farmYouth",
    });
    expect(resolveEligibilitySupport("만 45세 미만 청년농업인")?.kind).toBe("youth");
  });

  it("상한이 넓은 연령 조건은 유형 진단으로 (청년 사업 오연결 방지)", () => {
    expect(resolveEligibilitySupport("만 18~65세")).toMatchObject({
      kind: "assess",
      href: "/match?mode=assess",
    });
  });

  it("영농 경력·경영체는 로드맵으로", () => {
    expect(resolveEligibilitySupport("총 영농경력 3년 이하")?.href).toBe("/guide");
    expect(resolveEligibilitySupport("독립경영 3년 이하")?.kind).toBe("career");
  });

  it("농지·부지는 농지 임대 상세로, 자금은 비용 가이드로", () => {
    expect(resolveEligibilitySupport("사업부지 확보")).toMatchObject({
      kind: "farmland",
      href: "/programs/SP-018",
    });
    expect(resolveEligibilitySupport("금융기관 여신제한 대상자 불가")?.href).toBe("/costs");
  });

  it("매핑이 없으면 null (기관 문의로 대체)", () => {
    expect(resolveEligibilitySupport("전공 무관")).toBeNull();
    expect(resolveEligibilitySupport("")).toBeNull();
    expect(resolveEligibilitySupport("6~10월")).toBeNull();
  });
});
