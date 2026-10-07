import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupportProgram } from "@/lib/data/programs";
import type { FarmEvent } from "@/lib/data/events";

/**
 * 10/6 QA 회귀 — 지원사업 카드의 수집 기본값 배지(Q1-W4) · 같은 제목 체험 상세의 제목 중복(Q2-X4).
 */

const CRAWLED: SupportProgram = {
  id: "crawl-rda-programs-8db1ae3d",
  title: "제2회 청년 농산업 아이디어 경진대회 신청자 모집",
  summary: "",
  region: "충청남도",
  organization: "충청남도농업기술원",
  supportType: "보조금",
  supportAmount: "상세 공고 참조",
  eligibilityAgeMin: 18,
  eligibilityAgeMax: 65,
  eligibilityDetail: "상세 공고 참조",
  applicationStart: "2026-09-01",
  applicationEnd: "2026-09-30",
  status: "마감",
  relatedCrops: [],
  sourceUrl: "https://www.rda.go.kr/young/custom/policy/view.do?sId=1",
  year: 2026,
};

/** 그린대로 회차 — 같은 제목·설명으로 올라온 10/13·10/14 (10/6 DB 실측) */
const twin = (id: string, date: string): FarmEvent => ({
  id,
  title: "2026 춘천시 귀농귀촌 팸투어_시설원예",
  region: "강원도",
  sigungu: "춘천시",
  organization: "춘천시농업기술센터",
  type: "일일체험",
  date,
  dateEnd: date,
  applicationStart: "2026-09-25",
  applicationEnd: "2026-10-08",
  location: "강원도 춘천시",
  cost: "상세 공고 참조",
  description: "그린대로(농식품부) 집계 기준이에요. 접수 마감일·세부 조건은 원문 공고를 꼭 확인하세요.",
  capacity: 20,
  target: "지자체 귀농귀촌교육",
  url: "https://www.greendaero.go.kr/",
  status: "접수중",
});
const TWIN_A = twin("crawl-greendaero-education-a93bc66b", "2026-10-13");
const TWIN_B = twin("crawl-greendaero-education-aa3bc7fe", "2026-10-14");

vi.mock("@/lib/data/events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/events")>();
  const extra = new Map([TWIN_A, TWIN_B].map((e) => [e.id, e]));
  return {
    ...actual,
    getEventByIdAsync: vi.fn(async (id: string) => extra.get(id) ?? actual.getEventById(id)),
    filterEventsAsync: vi.fn(async () => ({ events: [...actual.EVENTS, TWIN_A, TWIN_B], source: "supabase" as const })),
  };
});

const { ProgramCard } = await import("@/app/programs/program-card");
const eventPage = await import("@/app/events/[id]/page");
const { PROGRAMS } = await import("@/lib/data/programs");

describe("ProgramCard — 수집 행은 지원 유형 배지가 없다", () => {
  it("수집 행: '보조금 지원' 배지·채움 금액이 없다", () => {
    const html = renderToStaticMarkup(<ProgramCard program={CRAWLED} today="2026-10-06" />);
    expect(html).not.toContain("보조금");
    expect(html).not.toContain("상세 공고 참조");
    expect(html).toContain("마감");
  });

  it("큐레이션 행: 지원 유형 배지 그대로", () => {
    const sp001 = PROGRAMS.find((p) => p.id === "SP-001")!;
    const html = renderToStaticMarkup(<ProgramCard program={sp001} today="2026-10-06" />);
    expect(html).toContain("융자 지원");
  });
});

describe("체험 상세 — 같은 제목 회차는 날짜로 가른다", () => {
  it("문서 제목·공유 제목·설명이 회차마다 다르다", async () => {
    const a = await eventPage.generateMetadata({ params: Promise.resolve({ id: TWIN_A.id }) });
    const b = await eventPage.generateMetadata({ params: Promise.resolve({ id: TWIN_B.id }) });
    expect(a.title).toBe("2026 춘천시 귀농귀촌 팸투어_시설원예 · 10월 13일 — 일일체험 | 강원도");
    expect(b.title).toBe("2026 춘천시 귀농귀촌 팸투어_시설원예 · 10월 14일 — 일일체험 | 강원도");
    expect(a.description).not.toBe(b.description);
    expect(a.openGraph?.title).not.toBe(b.openGraph?.title);
  });

  it("h1·JSON-LD 이름에도 날짜, JSON-LD 설명에 수집 상투 문구가 없다", async () => {
    const html = renderToStaticMarkup(await eventPage.default({ params: Promise.resolve({ id: TWIN_A.id }) }));
    expect(html).toMatch(/<h1[^>]*>2026 춘천시 귀농귀촌 팸투어_시설원예 · 10월 13일<\/h1>/);
    const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      .map((m) => JSON.parse(m[1]) as Record<string, unknown>)
      .find((d) => d["@type"] === "Event")!;
    expect(ld.name).toBe("2026 춘천시 귀농귀촌 팸투어_시설원예 · 10월 13일");
    expect(String(ld.description)).not.toContain("집계 기준");
  });
});
