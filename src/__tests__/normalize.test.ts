/**
 * search-params/normalize.ts 회귀 테스트 (2026-05-11)
 *
 * 배경: 2026-05-11 site-wide 308 무한 redirect 사고 — middleware의 normalize가
 * 빈 query에서 changed=true를 반환하면서 자기 자신으로 redirect 발생.
 * middleware는 `actuallyChanged = originalSearch !== cleanedSearch` 가드로
 * 우회했지만, normalize 자체에 회귀 테스트를 두어 cleaned 결과가 항상
 * "실제로 의미 있는 변경"만 반영하는지 검증한다.
 *
 * 검증 목표:
 *  1) 빈 query → cleaned 빈 + redirect 트리거되지 않는 조건
 *  2) allowedKeys 외 query → stripped (changed=true)
 *  3) enum 위반 → stripped
 *  4) 정상 query → 그대로 통과
 *  5) 빈 값(?q=) → 제거
 *  6) 중복 key → 첫 값만 채택, changed=true
 *  7) maxLengths 초과 → 잘라서 채택, changed=true
 *  8) minLengths 미만 → 제거
 *  9) numericRanges 위반 → 제거
 *  10) 정수 외 숫자 → 제거
 *  11) 정상 query 다중 → 순서 무관 cleaned에 모두 보존
 */

import { describe, it, expect } from "vitest";
import {
  normalizeSearchParams,
  LIST_PAGE_NORMALIZE_OPTIONS,
} from "@/lib/search-params/normalize";

describe("normalizeSearchParams — basic", () => {
  const programsOpts = LIST_PAGE_NORMALIZE_OPTIONS["/programs"];

  it("빈 query는 cleaned 빈 + originalSearch === cleanedSearch (redirect 안 함)", () => {
    const raw = new URLSearchParams("");
    const { cleaned } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.toString()).toBe("");
    // middleware의 actuallyChanged 판정: 둘 다 빈 문자열 → false
    expect(raw.toString()).toBe(cleaned.toString());
  });

  it("allowedKeys 외 key는 제거되고 changed=true", () => {
    const raw = new URLSearchParams("xyz=abc&foo=bar");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.toString()).toBe("");
    expect(changed).toBe(true);
  });

  it("정상 query는 그대로 통과 + changed=false", () => {
    const raw = new URLSearchParams("region=경기도&supportType=보조금");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.get("region")).toBe("경기도");
    expect(cleaned.get("supportType")).toBe("보조금");
    expect(changed).toBe(false);
  });

  it("enum 위반 값은 제거 + changed=true", () => {
    const raw = new URLSearchParams("region=DROP_TABLE&supportType=보조금");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("region")).toBe(false);
    expect(cleaned.get("supportType")).toBe("보조금");
    expect(changed).toBe(true);
  });

  it("빈 값(?q=)은 제거 + changed=true", () => {
    const raw = new URLSearchParams("q=&region=경기도");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("q")).toBe(false);
    expect(cleaned.get("region")).toBe("경기도");
    expect(changed).toBe(true);
  });

  it("중복 key는 첫 값만 채택 + changed=true", () => {
    const raw = new URLSearchParams("region=경기도&region=충청남도");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.get("region")).toBe("경기도");
    expect(changed).toBe(true);
  });
});

describe("normalizeSearchParams — minLengths / maxLengths", () => {
  const eventsOpts = LIST_PAGE_NORMALIZE_OPTIONS["/events"];

  it("q 길이가 minLengths 미만이면 제거", () => {
    const raw = new URLSearchParams("q=a"); // 1자
    const { cleaned, changed } = normalizeSearchParams(raw, eventsOpts);
    expect(cleaned.has("q")).toBe(false);
    expect(changed).toBe(true);
  });

  it("q 길이가 maxLengths 초과면 잘림", () => {
    const longQ = "a".repeat(100);
    const raw = new URLSearchParams({ q: longQ });
    const { cleaned, changed } = normalizeSearchParams(raw, eventsOpts);
    expect(cleaned.get("q")?.length).toBe(30); // /events maxLengths.q = 30
    expect(changed).toBe(true);
  });

  it("q regex (한글·영숫자·공백만) 위반 시 제거", () => {
    const raw = new URLSearchParams({ q: "test'; DROP" });
    const { cleaned, changed } = normalizeSearchParams(raw, eventsOpts);
    expect(cleaned.has("q")).toBe(false);
    expect(changed).toBe(true);
  });
});

describe("normalizeSearchParams — numericRanges", () => {
  const programsOpts = LIST_PAGE_NORMALIZE_OPTIONS["/programs"];

  it("page=1 (범위 내) 통과 + changed=false", () => {
    const raw = new URLSearchParams("page=1");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.get("page")).toBe("1");
    expect(changed).toBe(false);
  });

  it("page=0 (min 미만) 제거", () => {
    const raw = new URLSearchParams("page=0");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("page")).toBe(false);
    expect(changed).toBe(true);
  });

  it("page=999 (max 초과) 제거", () => {
    const raw = new URLSearchParams("page=999");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("page")).toBe(false);
    expect(changed).toBe(true);
  });

  it("page=abc (정수 아님) 제거", () => {
    const raw = new URLSearchParams("page=abc");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("page")).toBe(false);
    expect(changed).toBe(true);
  });

  it("page=1.5 (정수 아님) 제거", () => {
    const raw = new URLSearchParams("page=1.5");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("page")).toBe(false);
    expect(changed).toBe(true);
  });
});

describe("normalizeSearchParams — period regex (YYYY-MM)", () => {
  const programsOpts = LIST_PAGE_NORMALIZE_OPTIONS["/programs"];

  it("period=2026-05 통과", () => {
    const raw = new URLSearchParams("period=2026-05");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.get("period")).toBe("2026-05");
    expect(changed).toBe(false);
  });

  it("period=2026-13 (월 13) 제거", () => {
    const raw = new URLSearchParams("period=2026-13");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("period")).toBe(false);
    expect(changed).toBe(true);
  });

  it("period=invalid 제거", () => {
    const raw = new URLSearchParams("period=invalid");
    const { cleaned, changed } = normalizeSearchParams(raw, programsOpts);
    expect(cleaned.has("period")).toBe(false);
    expect(changed).toBe(true);
  });
});

describe("normalizeSearchParams — middleware actuallyChanged 가드", () => {
  /**
   * 5/11 무한 redirect 사고 핵심: middleware는
   * `originalSearch !== cleanedSearch` 비교로 actuallyChanged 판단.
   * 이 테스트는 normalize 출력이 middleware의 가드를 통과하는지 보증한다.
   */
  const programsOpts = LIST_PAGE_NORMALIZE_OPTIONS["/programs"];

  it("정상 query는 toString 비교에서 동일 (redirect 트리거 안 됨)", () => {
    const raw = new URLSearchParams("region=경기도&supportType=보조금");
    const { cleaned } = normalizeSearchParams(raw, programsOpts);
    expect(raw.toString()).toBe(cleaned.toString());
  });

  it("빈 query → cleaned 빈, toString 동일 (redirect 트리거 안 됨)", () => {
    const raw = new URLSearchParams("");
    const { cleaned } = normalizeSearchParams(raw, programsOpts);
    expect(raw.toString()).toBe(cleaned.toString());
  });

  it("봇 abuse query → cleaned 빈, toString 다름 (redirect 트리거됨)", () => {
    const raw = new URLSearchParams("xyz=abc&foo=bar");
    const { cleaned } = normalizeSearchParams(raw, programsOpts);
    expect(raw.toString()).not.toBe(cleaned.toString());
    expect(cleaned.toString()).toBe("");
  });

  it("정상 + 봇 abuse 혼합 → 정상만 남고 redirect 트리거됨", () => {
    const raw = new URLSearchParams("region=경기도&xyz=abc");
    const { cleaned } = normalizeSearchParams(raw, programsOpts);
    expect(raw.toString()).not.toBe(cleaned.toString());
    expect(cleaned.get("region")).toBe("경기도");
    expect(cleaned.has("xyz")).toBe(false);
  });
});

describe("LIST_PAGE_NORMALIZE_OPTIONS coverage", () => {
  it("주요 list 페이지가 모두 등록되어 있다", () => {
    const expected = [
      "/events",
      "/programs",
      "/education",
      "/crops",
      "/regions",
      "/stats",
      "/costs",
      "/programs/roadmap",
      // 2026-05-14 추가 (5/14 페르소나 칩 사고 lessons)
      "/regions/compare",
      "/regions/ranking",
      "/crops/compare",
    ];
    for (const p of expected) {
      expect(LIST_PAGE_NORMALIZE_OPTIONS[p]).toBeDefined();
      expect(LIST_PAGE_NORMALIZE_OPTIONS[p].allowedKeys.length).toBeGreaterThan(0);
    }
  });

  describe("/regions/compare — 정상 query 보존 + abuse strip", () => {
    const opts = LIST_PAGE_NORMALIZE_OPTIONS["/regions/compare"];

    it("정상 regions+tab 통과", () => {
      const raw = new URLSearchParams("regions=jeonnam:suncheon-si,gangwon&tab=infra");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.get("regions")).toBe("jeonnam:suncheon-si,gangwon");
      expect(cleaned.get("tab")).toBe("infra");
    });

    it("backward compat stations 숫자 CSV 통과", () => {
      const raw = new URLSearchParams("stations=108,119,259");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.get("stations")).toBe("108,119,259");
    });

    it("abuse query strip + tab enum 위반 strip", () => {
      const raw = new URLSearchParams("xyz=abc&tab=invalid&regions=seoul");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.has("xyz")).toBe(false);
      expect(cleaned.has("tab")).toBe(false);
      expect(cleaned.get("regions")).toBe("seoul");
    });
  });

  describe("/regions/ranking — persona/dim/sido/w 보존", () => {
    const opts = LIST_PAGE_NORMALIZE_OPTIONS["/regions/ranking"];

    it("persona+sido+w 모두 통과 (5/14 페르소나 칩 사고 회귀)", () => {
      const raw = new URLSearchParams("persona=family&sido=전남&w=20-15-15-35-15");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.get("persona")).toBe("family");
      expect(cleaned.get("sido")).toBe("전남");
      expect(cleaned.get("w")).toBe("20-15-15-35-15");
    });

    it("dim enum 통과", () => {
      const raw = new URLSearchParams("dim=medical");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.get("dim")).toBe("medical");
    });

    it("잘못된 persona / 잘못된 w 형식 strip", () => {
      const raw = new URLSearchParams("persona=hacker&w=abc");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.has("persona")).toBe(false);
      expect(cleaned.has("w")).toBe(false);
    });
  });

  describe("/crops/compare — ids 보존 (B안: tab 폐기)", () => {
    const opts = LIST_PAGE_NORMALIZE_OPTIONS["/crops/compare"];

    it("정상 ids 4개 통과", () => {
      const raw = new URLSearchParams("ids=apple,pear,grape,peach");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.get("ids")).toBe("apple,pear,grape,peach");
    });

    it("폐기된 tab param strip (2026-06-16 단일 스크롤 전환)", () => {
      const raw = new URLSearchParams("ids=rice,tomato&tab=economy");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(cleaned.get("ids")).toBe("rice,tomato");
      // tab 은 더 이상 allowedKeys 에 없음 → strip
      expect(cleaned.has("tab")).toBe(false);
    });

    it("ids 영숫자·하이픈 외 문자 strip", () => {
      const raw = new URLSearchParams("ids=apple,pe%20ar");
      const { cleaned } = normalizeSearchParams(raw, opts);
      // "apple,pe ar" 형식 → regex 위반 → strip
      expect(cleaned.has("ids")).toBe(false);
    });
  });

  it("각 옵션의 allowedKeys는 빈 query에서 cleaned도 빈 (redirect 안 됨)", () => {
    for (const [path, opts] of Object.entries(LIST_PAGE_NORMALIZE_OPTIONS)) {
      const raw = new URLSearchParams("");
      const { cleaned } = normalizeSearchParams(raw, opts);
      expect(
        cleaned.toString(),
        `path=${path} — 빈 query에서 cleaned도 빈 문자열이어야 함`,
      ).toBe("");
    }
  });
});
