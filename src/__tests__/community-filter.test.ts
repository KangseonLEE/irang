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

/**
 * 스크립트 인젝션 (2026-09-17 보안 점검).
 *
 * 렌더는 원래 안전하다 — 본문은 JSX 텍스트 노드로 들어가 React 가 이스케이프하고,
 * 노출 전에 관리자 승인도 거친다. 그런데 실측해 보니 **마크업을 막는 규칙이 없었고**,
 * `<img src=x onerror=...>` 가 걸린 건 마크업이라서가 아니라 한글 비율 때문이었다.
 * 한국어를 충분히 섞으면 그대로 통과했다 — 승인 큐에서 사람이 `<script>` 를 알아보는 데
 * 기대는 방어가 되면 안 되므로 규칙으로 고정한다.
 */
describe("스크립트 인젝션 차단", () => {
  const reject = (body: string) => runRuleFilter({ body, composeMs: 5000 }).reject;
  const flags = (body: string) => runRuleFilter({ body, composeMs: 5000 }).flags;

  it("한국어가 충분해도 태그가 있으면 거부한다 — 한글 비율에 기대지 않는다", () => {
    const body = "겨울 바람이 세서 <b>하우스</b> 보강이 필요했어요 정말로요";
    expect(reject(body)).toBe(true);
    expect(flags(body)).toContain("markup");
  });

  it("스크립트 태그·이벤트 핸들러·javascript: 를 잡는다", () => {
    expect(flags("</script><script>alert(1)</script> 겨울 바람이 세서 좋았어요 정말")).toContain("markup");
    expect(flags("우리 마을은 <img src=1 onerror=fetch('//x')> 이런 점이 좋아요 참고")).toContain("markup");
    expect(flags("여기 좋아요 링크는 javascript:alert(1) 입니다 참고하세요 정말로")).toContain("markup");
  });

  it("꺾쇠가 있어도 태그가 아니면 통과 — '<5도' 같은 정상 표기 오탐 방지", () => {
    const body = "겨울 아침 기온이 <5도까지 떨어져서 하우스 보강이 필요했어요";
    expect(reject(body)).toBe(false);
  });

  it("평범한 의견은 그대로 통과한다", () => {
    expect(reject("초보라 배추부터 시작했는데 물관리가 제일 어려웠어요")).toBe(false);
  });
});
