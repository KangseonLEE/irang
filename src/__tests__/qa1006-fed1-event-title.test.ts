import { describe, expect, it } from "vitest";
import { distinctEventTitle } from "@/components/events/event-fields";

/**
 * 같은 제목 회차의 상세 제목 (10/6 QA Q2-X4).
 * 그린대로는 회차를 같은 제목·설명으로 올린다 — crawl-greendaero-education-a93bc66b(10/13)·-aa3bc7fe(10/14)의
 * `<title>`·설명·공유 카드가 글자 하나 다르지 않았다.
 */
const a = { id: "crawl-greendaero-education-a93bc66b", title: "2026 춘천시 귀농귀촌 팸투어_시설원예", date: "2026-10-13" };
const b = { id: "crawl-greendaero-education-aa3bc7fe", title: "2026 춘천시 귀농귀촌 팸투어_시설원예", date: "2026-10-14" };
const other = { id: "evt-001", title: "2026 수원 케이팜", date: "2026-10-29" };

describe("distinctEventTitle", () => {
  it("같은 제목이 있으면 시작일을 붙여 가른다", () => {
    const all = [a, b, other];
    expect(distinctEventTitle(a, all)).toBe("2026 춘천시 귀농귀촌 팸투어_시설원예 · 10월 13일");
    expect(distinctEventTitle(b, all)).toBe("2026 춘천시 귀농귀촌 팸투어_시설원예 · 10월 14일");
    expect(distinctEventTitle(a, all)).not.toBe(distinctEventTitle(b, all));
  });

  it("쌍둥이가 없으면 원문 제목 그대로", () => {
    expect(distinctEventTitle(other, [a, b, other])).toBe("2026 수원 케이팜");
    expect(distinctEventTitle(a, [a, other])).toBe(a.title);
  });

  it("날짜까지 같으면(날짜로도 못 가른다) 원문 제목 그대로", () => {
    const twin = { ...b, date: a.date };
    expect(distinctEventTitle(a, [a, twin])).toBe(a.title);
  });

  it("시작일이 미정(9999)·형식 밖이면 원문 제목 그대로", () => {
    expect(distinctEventTitle({ ...a, date: "9999-12-31" }, [a, b])).toBe(a.title);
    expect(distinctEventTitle({ ...a, date: "상시" }, [a, b])).toBe(a.title);
  });

  it("마을 유형 꼬리가 있는 살아보기 제목도 날짜만 덧붙인다", () => {
    const s1 = { id: "crawl-greendaero-live-d3cf7a9c", title: "도로줌마을 농촌에서 살아보기 (귀촌형)", date: "2026-10-01" };
    const s2 = { id: "crawl-greendaero-live-22b24588", title: "도로줌마을 농촌에서 살아보기 (귀촌형)", date: "2026-10-12" };
    expect(distinctEventTitle(s2, [s1, s2])).toBe("도로줌마을 농촌에서 살아보기 (귀촌형) · 10월 12일");
  });
});
