import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { highlightMatch } from "@/lib/highlight-match";

const marks = (text: string, q: string) => {
  const { container } = render(<span>{highlightMatch(text, q, "hl")}</span>);
  return [...container.querySelectorAll("mark")].map((m) => m.textContent);
};

/** 9/28 QA WARN 3 — 복합 검색어 하이라이트 */
describe("highlightMatch", () => {
  it("단일어는 종전과 같이 대소문자 무시 매칭", () => {
    expect(marks("사과 재배지와 사과 소득", "사과")).toEqual(["사과", "사과"]);
    expect(marks("Smart Farm", "farm")).toEqual(["Farm"]);
  });
  it("띄어 쓴 복합어는 어절마다 표시", () => {
    expect(marks("전남 순천시 — 귀농 정착 지원", "전남 귀농")).toEqual(["전남", "귀농"]);
    expect(marks("충북 서산? 충남 서산시", "충북 서산")).toEqual(["충북", "서산", "서산"]);
  });
  it("1자 어절은 복합어에서 제외해 조사 잡음을 막고, 긴 어절이 우선", () => {
    expect(marks("사과의 소득", "사과 의")).toEqual(["사과"]);
    expect(marks("사과즙과 사과", "사과 사과즙")).toEqual(["사과즙", "사과"]);
  });
  it("매칭이 없으면 원문 그대로, 빈 검색어도 원문", () => {
    expect(marks("도열병 방제", "감자")).toEqual([]);
    expect(highlightMatch("텍스트", "  ")).toBe("텍스트");
  });
});
