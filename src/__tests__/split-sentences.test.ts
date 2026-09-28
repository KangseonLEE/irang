import { describe, it, expect } from "vitest";
import { splitSentences } from "@/lib/format";

describe("splitSentences", () => {
  it("종결 부호 뒤 공백에서 문장을 나눈다", () => {
    expect(splitSentences("첫 문장이에요. 둘째 문장이에요.")).toEqual([
      "첫 문장이에요.",
      "둘째 문장이에요.",
    ]);
  });

  it("물음표·느낌표도 문장 끝으로 본다", () => {
    expect(splitSentences("얼마나 들까요? 생각보다 적어요!")).toEqual([
      "얼마나 들까요?",
      "생각보다 적어요!",
    ]);
  });

  it("소수점은 자르지 않는다", () => {
    expect(splitSentences("융자 한도는 2.5억 원이에요. 금리는 1.5%예요.")).toEqual([
      "융자 한도는 2.5억 원이에요.",
      "금리는 1.5%예요.",
    ]);
  });

  it("번호 마커(1.)는 뒤 문장에 붙여 둔다", () => {
    expect(splitSentences("1. 신청서 접수. 2. 서류 심사.")).toEqual([
      "1. 신청서 접수.",
      "2. 서류 심사.",
    ]);
  });

  it("도메인·URL 에서 자르지 않는다", () => {
    expect(splitSentences("농지은행 통합포털(www.fbo.or.kr)에서 신청해요.")).toEqual([
      "농지은행 통합포털(www.fbo.or.kr)에서 신청해요.",
    ]);
    expect(splitSentences("gunsan.go.kr 공고를 확인하세요. 접수는 방문이에요.")).toEqual([
      "gunsan.go.kr 공고를 확인하세요.",
      "접수는 방문이에요.",
    ]);
  });

  it("괄호 안 마침표는 문장 끝이 아니다", () => {
    expect(
      splitSentences("최대 3억 원을 지원해요(자부담 20%. 예산 범위 내). 금리는 연 2%예요."),
    ).toEqual([
      "최대 3억 원을 지원해요(자부담 20%. 예산 범위 내).",
      "금리는 연 2%예요.",
    ]);
  });

  it("한 글자 약어 뒤에서는 자르지 않는다", () => {
    expect(splitSentences("주관은 ○. 농업기술센터예요.")).toEqual([
      "주관은 ○. 농업기술센터예요.",
    ]);
  });

  it("열거 마커 앞에서 나눈다", () => {
    expect(splitSentences("지원 내용 ① 교육비 ② 체류비")).toEqual([
      "지원 내용",
      "① 교육비",
      "② 체류비",
    ]);
    expect(splitSentences("절차 1) 접수 2) 심사")).toEqual(["절차", "1) 접수", "2) 심사"]);
  });

  it("마지막 문장에 마침표가 없어도 포함한다", () => {
    expect(splitSentences("첫 문장이에요. 마침표 없는 끝")).toEqual([
      "첫 문장이에요.",
      "마침표 없는 끝",
    ]);
  });

  it("한 문장이면 그대로 하나로", () => {
    expect(splitSentences("귀농 창업자금을 융자로 지원해요.")).toEqual([
      "귀농 창업자금을 융자로 지원해요.",
    ]);
  });

  it("빈 문자열·공백은 빈 배열", () => {
    expect(splitSentences("")).toEqual([]);
    expect(splitSentences("   ")).toEqual([]);
  });

  it("앞뒤 공백을 정리하고 빈 조각을 남기지 않는다", () => {
    expect(splitSentences("  첫 문장.   둘째 문장.  ")).toEqual(["첫 문장.", "둘째 문장."]);
  });
});
