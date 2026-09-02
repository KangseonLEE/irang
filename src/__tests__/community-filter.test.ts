import { describe, expect, it } from "vitest";
import { runRuleFilter, MIN_COMPOSE_MS } from "@/lib/community/filter";
import { isValidTargetId, isNoteTargetType } from "@/lib/community/types";

describe("community rule filter", () => {
  it("정상적인 귀농 의견은 통과한다", () => {
    const r = runRuleFilter({
      body: "겨울 바람이 세서 하우스 보강이 필요했어요. 3년째 사과 키우는데 일조량은 좋아요.",
      composeMs: 12_000,
    });
    expect(r.reject).toBe(false);
    expect(r.flags).toEqual([]);
  });

  it("농업 맥락 단어(부업·홍보·성인)는 오탐하지 않는다", () => {
    const r = runRuleFilter({
      body: "농사 부업으로 시작했는데 마을 홍보관에서 성인 대상 교육도 받았어요.",
      composeMs: 8_000,
    });
    expect(r.reject).toBe(false);
  });

  it("URL·전화번호·메신저 아이디는 각각 걸린다", () => {
    expect(runRuleFilter({ body: "자세한 건 https://example.com 참고하세요 좋아요" }).flags).toContain("url_count");
    expect(runRuleFilter({ body: "연락 주세요 010-1234-5678 상담 가능해요" }).flags).toContain("phone_number");
    expect(runRuleFilter({ body: "카톡 아이디 farmking 으로 연락해요" }).flags).toContain("messenger_id");
    expect(runRuleFilter({ body: "문의는 naver.com 으로" }).flags).toContain("url_count");
  });

  it("금지어(분양·리딩방·대출)는 걸린다", () => {
    expect(runRuleFilter({ body: "전원주택 분양 문의 받습니다 지금 바로" }).flags).toContain("banned_keyword");
    expect(runRuleFilter({ body: "귀농 자금 대 출 당일승인 가능" }).flags).toContain("banned_keyword");
    expect(runRuleFilter({ body: "수익 보장 리딩방 초대해 드려요" }).flags).toContain("banned_keyword");
  });

  it("반복 문자·비한글 비율 이상은 걸린다", () => {
    expect(runRuleFilter({ body: "ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ 최고" }).flags).toContain("repeated_chars");
    expect(runRuleFilter({ body: "asdkjh qwe zxcv poiu lkjh mnbv qwer tyui" }).flags).toContain("low_korean_ratio");
  });

  it("허니팟·2초 미만 제출은 봇으로 본다", () => {
    expect(runRuleFilter({ body: "정상 의견처럼 보이지만 봇이에요", honeypot: "http://spam" }).flags).toContain("honeypot");
    expect(runRuleFilter({ body: "정상 의견처럼 보이지만 봇이에요", composeMs: MIN_COMPOSE_MS - 1 }).flags).toContain("too_fast");
    expect(runRuleFilter({ body: "정상 의견처럼 보이지만 사람이에요", composeMs: MIN_COMPOSE_MS }).flags).not.toContain("too_fast");
  });

  it("길이 범위를 벗어나면 걸린다", () => {
    expect(runRuleFilter({ body: "좋아요" }).flags).toContain("too_short");
    expect(runRuleFilter({ body: "가".repeat(301) }).flags).toContain("too_long");
  });
});

describe("target validation", () => {
  it("허용 형식만 통과", () => {
    expect(isValidTargetId("gyeongbuk")).toBe(true);
    expect(isValidTargetId("gyeongbuk/yeongju")).toBe(true);
    expect(isValidTargetId("jung-gu-seoul")).toBe(true);
    expect(isValidTargetId("SP-001")).toBe(true);
    expect(isValidTargetId("cherry-tomato")).toBe(true);
    expect(isValidTargetId("")).toBe(false);
    expect(isValidTargetId("/etc/passwd")).toBe(false);
    expect(isValidTargetId("a".repeat(81))).toBe(false);
    expect(isValidTargetId("한글")).toBe(false);
  });

  it("target type", () => {
    expect(isNoteTargetType("region")).toBe(true);
    expect(isNoteTargetType("user")).toBe(false);
  });
});
