/**
 * 10/6 전체 QA 2차 — FE-D1: 체험 화면의 수집 누출 2건.
 *  - R2-Q1 🟡3: 체험 상세 "대상: 상세 공고 참조" — DB 정정·수집기 재배포 뒤 그린대로 교육발 체험 9행의 대상이
 *    채움값이 된다. 그 전엔 교육 구분("지자체 귀농귀촌교육")이 대상 칸에 들어가 있었다 — 어느 쪽도 원문 대상이 아니다.
 *  - R2-Q1 🟡4: 순수 비대면 강의("[비대면] … 농촌체험관광")가 '일일체험·서울 서초구'로 서울 상세 25쪽·/events 에 나왔다.
 *    DB 수정 SQL 은 결재 대기라 체험 로더에서 먼저 막는다.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return { ...actual, isSupabaseConfigured: true, getSupabase: vi.fn() };
});

import { getSupabase } from "@/lib/supabase";
import { filterEventsAsync, getEventByIdAsync, isOnlineOnlyLecture, type FarmEvent } from "@/lib/data/events";
import { buildEventFacts, distinctTarget } from "@/components/events/event-fields";
import { displayTarget } from "@/lib/programs/display";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { eventRow, makeSupabaseDouble } from "./fixtures/qa1006-feb-supabase";

/** 10/6 DB 실측 — 서울 서초구(교육기관 본사)로 들어간 비대면 강의 */
const ONLINE_LECTURE_TITLE =
  "유형특화과정-예비귀촌인 · [비대면] 10/31 (주말반 10시~12시) 농촌융복합 6차산업과 농촌체험관광";

beforeAll(() => {
  const rows = [
    eventRow("crawl-greendaero-education-2ca872c9", {
      title: ONLINE_LECTURE_TITLE,
      type: "일일체험",
      region: "서울특별시",
      sigungu: "서초구",
      target: "귀농귀촌아카데미",
      date_start: "2099-10-31",
      date_end: "2099-10-31",
    }),
    eventRow("crawl-greendaero-education-a93bc66b", {
      title: "2026 춘천시 귀농귀촌 팸투어_시설원예",
      type: "일일체험",
      region: "강원도",
      sigungu: "춘천시",
      target: "상세 공고 참조",
    }),
    eventRow("crawl-greendaero-education-mixed01", {
      title: "귀농귀촌 체험학교 · [비대면] 사전교육 + 현장실습 1기",
      type: "살아보기",
      region: "강원도",
    }),
  ];
  vi.mocked(getSupabase).mockReturnValue(
    makeSupabaseDouble({ farm_events: rows }) as unknown as ReturnType<typeof getSupabase>,
  );
});

describe("isOnlineOnlyLecture — 보수적 판정", () => {
  const ev = (id: string, title: string) => ({ id, title });

  it("수집 행 + 한 마디가 [비대면] 으로 시작 + 대면·현장·실습 표지 없음 → 강의", () => {
    expect(isOnlineOnlyLecture(ev("crawl-greendaero-education-2ca872c9", ONLINE_LECTURE_TITLE))).toBe(true);
    expect(isOnlineOnlyLecture(ev("crawl-x-1", "[비대면] 농촌체험농장 만들기"))).toBe(true);
  });

  it("혼합·현장·오프라인 표지가 있으면 체험으로 남는다", () => {
    expect(isOnlineOnlyLecture(ev("crawl-x-2", "체험학교 · [비대면] 사전교육 + 현장실습 1기"))).toBe(false);
    expect(isOnlineOnlyLecture(ev("crawl-x-3", "[비대면] 이론 · [대면] 농장 견학"))).toBe(false);
    expect(isOnlineOnlyLecture(ev("crawl-x-4", "[비대면] 강의 후 오프라인 팸투어"))).toBe(false);
  });

  it("[비대면] 이 마디 머리에 없으면(본문 속 언급) 판정하지 않는다", () => {
    expect(isOnlineOnlyLecture(ev("crawl-x-5", "귀농귀촌 팸투어 (비대면 설명회 포함)"))).toBe(false);
    expect(isOnlineOnlyLecture(ev("crawl-x-6", "2026 춘천시 귀농귀촌 팸투어_시설원예"))).toBe(false);
  });

  it("큐레이션 행은 제목과 무관하게 건드리지 않는다", () => {
    expect(isOnlineOnlyLecture(ev("evt-099", "[비대면] 귀농 설명회"))).toBe(false);
  });
});

describe("체험 로더 — 비대면 강의는 목록·상세 모두 빠진다", () => {
  it("filterEventsAsync(목록·지역 상세·사이트맵 공용)에 없다 — 혼합 체험학교는 남는다", async () => {
    const { events } = await filterEventsAsync({ includeClosed: true });
    const ids = events.map((e) => e.id);
    expect(ids).not.toContain("crawl-greendaero-education-2ca872c9");
    expect(ids).toContain("crawl-greendaero-education-a93bc66b");
    expect(ids).toContain("crawl-greendaero-education-mixed01");
    // 지역 필터(서울)로 골라도 안 나온다 — 서울 상세가 이 로더를 쓴다
    const { events: seoul } = await filterEventsAsync({ includeClosed: true, region: "서울특별시" });
    expect(seoul.map((e) => e.id)).not.toContain("crawl-greendaero-education-2ca872c9");
  });

  it("상세 조회도 undefined — 사이트맵에서 빠진 주소를 상세만 열어 두지 않는다", async () => {
    expect(await getEventByIdAsync("crawl-greendaero-education-2ca872c9")).toBeUndefined();
    expect((await getEventByIdAsync("crawl-greendaero-education-a93bc66b"))?.title).toBe("2026 춘천시 귀농귀촌 팸투어_시설원예");
  });
});

describe("대상 칸 — 채움값·대상 없는 원천은 싣지 않는다", () => {
  const base: FarmEvent = {
    id: "crawl-greendaero-live-22b24588",
    title: "도로줌마을 농촌에서 살아보기 (귀촌형)",
    region: "충청북도",
    sigungu: "청주시",
    organization: "청주시",
    type: "살아보기",
    date: "2026-10-12",
    dateEnd: "2026-11-27",
    location: "충청북도 청주시",
    cost: "상세 공고 참조",
    description: "",
    capacity: null,
    target: "상세 공고 참조",
    url: "https://www.greendaero.go.kr/",
    status: "접수중",
  };

  it("수집 행 '상세 공고 참조' → 대상 행 없음 (DB 정정 뒤 체험 9행)", () => {
    expect(distinctTarget(base)).toBeNull();
    expect(buildEventFacts(base, "detail").some((f) => f.label === "대상")).toBe(false);
  });

  it("그린대로 교육발 행의 교육 구분 값(정정 전) → 대상 행 없음", () => {
    const famtour = { ...base, id: "crawl-greendaero-education-a93bc66b", type: "일일체험" as const, target: "지자체 귀농귀촌교육" };
    expect(distinctTarget(famtour)).toBeNull();
    expect(buildEventFacts(famtour, "detail").some((f) => f.label === "대상")).toBe(false);
  });

  it("큐레이션 행의 대상은 그대로", () => {
    const expo = { ...base, id: "evt-001", type: "박람회" as const, target: "귀농·귀촌 희망자, 농업 관련 기업·기관" };
    expect(distinctTarget(expo)).toBe("귀농·귀촌 희망자, 농업 관련 기업·기관");
  });

  it("교육 상세 '교육 대상'도 같은 규칙 — 그린대로 교육 구분·RDA 채움값은 빠지고 큐레이션은 그대로", () => {
    expect(displayTarget("crawl-greendaero-education-1e8e5362", "귀농귀촌아카데미")).toBeNull();
    expect(displayTarget("crawl-rda-education-a2b161c3", "상세 공고 참조")).toBeNull();
    for (const c of EDUCATION_COURSES) expect(displayTarget(c.id, c.target), c.id).toBe(c.target.trim() || null);
  });
});
