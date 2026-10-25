import { describe, expect, it } from "vitest";
import { findClosureMarker, htmlToText } from "@/lib/programs/closure-markers";

describe("원문 '모집 끝남' 표시 판정 (10/26 SP-044)", () => {
  it("괄호 머리표가 붙은 제목은 끝남으로 본다 — 괴산 게시판 원문 형태", () => {
    const html =
      "<h3>&lt;모집완료&gt; 2026년 귀농귀촌 희망둥지 입주자 모집 재공고(청안면 금신리)</h3>";
    expect(findClosureMarker(htmlToText(html))).toContain("<모집완료>");
    expect(findClosureMarker("[마감] 2026년 빈집 입주자 모집")).not.toBeNull();
    expect(findClosureMarker("2026년 귀농인의 집 (접수마감)")).not.toBeNull();
  });

  it("완료형 문장은 끝남으로 본다", () => {
    expect(findClosureMarker("신청자가 많아 모집이 완료되었습니다.")).not.toBeNull();
    expect(findClosureMarker("올해 예산이 소진되어 접수를 받지 않아요")).not.toBeNull();
    expect(findClosureMarker("사업량이 차서 조기 마감되었습니다")).not.toBeNull();
  });

  it("접수 기간을 말하는 조건문은 끝남이 아니다 — 열린 공고 본문에 늘 있는 말", () => {
    // SP-044·045 본문, SP-035 공주, SP-036 청도 원문 그대로
    expect(findClosureMarker("4. 공고 및 접수기간: 2026년 7월 14일 ~ 모집완료 시까지 5. 임대조건")).toBeNull();
    expect(findClosureMarker("지원기간: 2026. 1. 5.(월) ~ 예산 소진 시 조기 마감 5. 신청방법")).toBeNull();
    expect(findClosureMarker("신청기간 : 2026. 1. 8. ~ 예산 소진 시까지 ※ 매달 마지막 주 대상자 선정예정")).toBeNull();
    expect(findClosureMarker("모집이 완료되면 조기 마감해요")).toBeNull();
    expect(findClosureMarker("사업량이 차면 마감해요")).toBeNull();
  });

  it("이전글·다음글에 걸린 남의 공고 머리표는 보지 않는다", () => {
    const page =
      "2026년 괴산군 빈집 입주자모집 재공고(소수면 옥현리) 접수기간: 2026년 7월 14일 ~ 모집완료 시까지 " +
      "이전글 <모집완료>2026년 괴산군 빈집 입주자 모집 공고(불정면) 다음글 <모집완료> 2026년 귀농귀촌 희망둥지";
    expect(findClosureMarker(page)).toBeNull();
  });
});
