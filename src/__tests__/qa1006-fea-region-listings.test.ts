/**
 * 10/6 QA1 Q1-F1 · Q1-W3 — 지역 상세의 지원사업·교육·체험·행사 목록.
 *
 * 시·군·구·구 상세가 정적 데이터의 손으로 적은 status 로 지난 행사·교육을 "접수중/모집중"으로 보였고,
 * DB 에만 있는 접수 중 행은 보이지 않았다. 이제 async 로더(DB ∪ 정적) → 날짜 파생 상태 → 마감 제외 →
 * 가까운 지역 먼저.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupportProgram } from "@/lib/data/programs";
import type { EducationCourse } from "@/lib/data/education";
import type { FarmEvent } from "@/lib/data/events";

const mocks = vi.hoisted(() => ({
  programs: [] as unknown[],
  education: [] as unknown[],
  events: [] as unknown[],
  programsArgs: [] as unknown[],
  educationArgs: [] as unknown[],
  eventsArgs: [] as unknown[],
  failEvents: false,
}));

vi.mock("@/lib/data/programs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/programs")>();
  return {
    ...actual,
    filterProgramsAsync: vi.fn(async (filters: unknown) => {
      mocks.programsArgs.push(filters);
      return { programs: mocks.programs, source: "supabase" };
    }),
  };
});
vi.mock("@/lib/data/education", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/education")>();
  return {
    ...actual,
    filterEducationAsync: vi.fn(async (filters: unknown) => {
      mocks.educationArgs.push(filters);
      return { courses: mocks.education, source: "supabase" };
    }),
  };
});
vi.mock("@/lib/data/events", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/events")>();
  return {
    ...actual,
    filterEventsAsync: vi.fn(async (filters: unknown) => {
      mocks.eventsArgs.push(filters);
      if (mocks.failEvents) throw new Error("supabase down");
      return { events: mocks.events, source: "supabase" };
    }),
  };
});

import {
  isLocalRow,
  loadRegionListings,
  rankByRegion,
} from "@/app/regions/[id]/region-listings";

function event(partial: Partial<FarmEvent> & Pick<FarmEvent, "id" | "region">): FarmEvent {
  return {
    title: partial.id,
    organization: "기관",
    type: "살아보기",
    date: "2026-10-20",
    dateEnd: "2026-11-20",
    location: "",
    cost: "",
    description: "",
    capacity: null,
    target: "",
    url: "",
    status: "접수중",
    ...partial,
  };
}

function course(
  partial: Partial<EducationCourse> & Pick<EducationCourse, "id" | "region" | "applicationStart" | "applicationEnd">,
): EducationCourse {
  return {
    title: partial.id,
    organization: "기관",
    type: "오프라인",
    duration: "",
    schedule: "",
    target: "",
    cost: "",
    description: "",
    capacity: null,
    status: "모집중",
    level: "입문",
    url: "",
    ...partial,
  };
}

function program(
  partial: Partial<SupportProgram> & Pick<SupportProgram, "id" | "region" | "applicationStart" | "applicationEnd">,
): SupportProgram {
  return {
    title: partial.id,
    summary: "",
    organization: "기관",
    supportType: "보조금",
    supportAmount: "",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail: "",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "",
    year: 2026,
    ...partial,
  } as SupportProgram;
}

const GAPYEONG = { name: "가평군", shortName: "가평" };

beforeEach(() => {
  vi.useFakeTimers();
  // KST 2026-10-06 12:00
  vi.setSystemTime(new Date("2026-10-06T03:00:00Z"));
  mocks.programs = [];
  mocks.education = [];
  mocks.events = [];
  mocks.programsArgs = [];
  mocks.educationArgs = [];
  mocks.eventsArgs = [];
  mocks.failEvents = false;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("loadRegionListings — 상태는 날짜에서 파생, 마감 제외", () => {
  it("손으로 적은 '접수중'이어도 접수가 끝난 행사는 빠진다 (Y-FARM EXPO 4/23 마감)", async () => {
    mocks.events = [
      event({ id: "evt-001", region: "경기도", status: "접수중", applicationStart: "2026-03-01", applicationEnd: "2026-04-23", date: "2026-04-24", dateEnd: "2026-04-26" }),
      event({ id: "gapyeong-16", region: "경기도", sigungu: "가평군", status: "접수중", applicationStart: "2026-09-02", applicationEnd: "2026-10-12" }),
    ];
    const { events } = await loadRegionListings({ provinceName: "경기도", local: GAPYEONG });
    expect(events.map((e) => e.id)).toEqual(["gapyeong-16"]);
    expect(events[0].status).toBe("접수중");
  });

  it("DB status 가 '모집중'이어도 지난 교육은 빠지고, '마감'이어도 아직 열린 교육은 남는다", async () => {
    mocks.education = [
      course({ id: "stale", region: "서울특별시", status: "모집중", applicationStart: "2026-03-01", applicationEnd: "2026-04-10" }),
      course({ id: "reopened", region: "서울특별시", status: "마감", applicationStart: "2026-10-01", applicationEnd: "2026-10-20" }),
      course({ id: "upcoming", region: "서울특별시", status: "모집중", applicationStart: "2026-11-01", applicationEnd: "2026-11-30" }),
    ];
    const { education } = await loadRegionListings({ provinceName: "서울특별시" });
    expect(education.map((c) => [c.id, c.status])).toEqual([
      ["reopened", "모집중"],
      ["upcoming", "모집예정"],
    ]);
  });

  it("로더에는 마감 포함으로 요청한다 — 로더 쪽 status 로 먼저 거르면 열린 행이 빠질 수 있다", async () => {
    await loadRegionListings({ provinceName: "충청북도" });
    for (const args of [mocks.programsArgs, mocks.educationArgs, mocks.eventsArgs]) {
      expect(args).toEqual([{ region: "충청북도", includeClosed: true }]);
    }
  });

  it("로더 하나가 실패해도 나머지 목록은 그대로, 실패한 목록은 빈 배열", async () => {
    mocks.failEvents = true;
    mocks.programs = [program({ id: "SP-011", region: "전국", applicationStart: "2026-01-01", applicationEnd: "2026-12-31" })];
    const listings = await loadRegionListings({ provinceName: "경기도" });
    expect(listings.events).toEqual([]);
    expect(listings.programs.map((p) => p.id)).toEqual(["SP-011"]);
  });
});

describe("가까운 지역 먼저 — 시·군·구 → 시·도 → 전국, 같은 범위는 마감 임박순", () => {
  it("교육·행사: 이 시·군·구 행이 맨 앞, 다른 시·군 행은 시·도 범위로", async () => {
    mocks.events = [
      event({ id: "national", region: "전국", applicationEnd: "2026-10-08" }),
      event({ id: "yeoju", region: "경기도", sigungu: "여주시", applicationEnd: "2026-10-09" }),
      event({ id: "gapyeong", region: "경기도", sigungu: "가평", applicationEnd: "2026-10-30" }),
      event({ id: "yeoncheon", region: "경기도", sigungu: "연천군", applicationEnd: "2026-10-07" }),
    ];
    const { events } = await loadRegionListings({ provinceName: "경기도", local: GAPYEONG });
    expect(events.map((e) => e.id)).toEqual(["gapyeong", "yeoncheon", "yeoju", "national"]);
  });

  it("지원사업: 다른 시·군 전용 사업은 전국 사업 뒤로 (시·군 사업은 그 주민만 신청 가능)", async () => {
    mocks.programs = [
      program({ id: "anseong", region: "경기도", sigungu: "안성", applicationStart: "2026-09-01", applicationEnd: "2026-10-10" }),
      program({ id: "SP-011", region: "전국", applicationStart: "2026-01-01", applicationEnd: "2026-12-31" }),
      program({ id: "gyeonggi-wide", region: "경기도", applicationStart: "2026-09-01", applicationEnd: "2026-11-30" }),
      program({ id: "gapyeong", region: "경기도", sigungu: "가평군", applicationStart: "2026-09-01", applicationEnd: "2026-12-15" }),
    ];
    const local = await loadRegionListings({ provinceName: "경기도", local: GAPYEONG });
    expect(local.programs.map((p) => p.id)).toEqual(["gapyeong", "gyeonggi-wide", "SP-011", "anseong"]);

    // 시·도 상세(지역 맥락 없음)에선 시·군 사업도 그 시·도 사업이다
    const sido = await loadRegionListings({ provinceName: "경기도" });
    expect(sido.programs.map((p) => p.id)).toEqual(["anseong", "gyeonggi-wide", "gapyeong", "SP-011"]);
  });

  it("rankByRegion 은 같은 범위 안의 입력 순서를 지킨다", () => {
    const rows = [
      { id: "a", region: "전국" },
      { id: "b", region: "경기도" },
      { id: "c", region: "전국" },
      { id: "d", region: "경기도" },
    ];
    expect(rankByRegion(rows, { provinceName: "경기도" }).map((r) => r.id)).toEqual(["b", "d", "a", "c"]);
  });
});

describe("isLocalRow — 이름이 같거나 하위 구가 붙은 경우만", () => {
  it("정식·약칭·하위 구 표기를 잡는다", () => {
    expect(isLocalRow("가평군", GAPYEONG)).toBe(true);
    expect(isLocalRow("가평", GAPYEONG)).toBe(true);
    expect(isLocalRow(" 가평군 ", GAPYEONG)).toBe(true);
    expect(isLocalRow("수원시 장안구", { name: "수원시", shortName: "수원" })).toBe(true);
  });

  it("포함 관계만으로는 같은 지역으로 보지 않는다 (인천 동구 ≠ 남동구)", () => {
    expect(isLocalRow("남동구", { name: "동구", shortName: "동구" })).toBe(false);
    expect(isLocalRow("강동구", { name: "동구", shortName: "동구" })).toBe(false);
    expect(isLocalRow("가평읍내", GAPYEONG)).toBe(false);
  });

  it("값이 없거나 지역 맥락이 없으면 false", () => {
    expect(isLocalRow(undefined, GAPYEONG)).toBe(false);
    expect(isLocalRow("", GAPYEONG)).toBe(false);
    expect(isLocalRow("가평군", undefined)).toBe(false);
  });
});
