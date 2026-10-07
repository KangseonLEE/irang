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
  loadRegionListings,
  rankVenuesByRegion,
  regionScopeOf,
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

const GAPYEONG = { id: "gapyeong", name: "가평군", shortName: "가평" };

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

  it("지원사업: 시·군·구 상세는 이 시·군 → 시·도 공통 → 전국, 다른 시·군 전용은 뺀다 (QA2 R2-Q2 F1)", async () => {
    mocks.programs = [
      program({ id: "anseong", region: "경기도", sigungu: "안성", applicationStart: "2026-09-01", applicationEnd: "2026-10-10" }),
      program({ id: "SP-011", region: "전국", applicationStart: "2026-01-01", applicationEnd: "2026-12-31" }),
      program({ id: "gyeonggi-wide", region: "경기도", applicationStart: "2026-09-01", applicationEnd: "2026-11-30" }),
      program({ id: "gapyeong", region: "경기도", sigungu: "가평군", applicationStart: "2026-09-01", applicationEnd: "2026-12-15" }),
    ];
    const local = await loadRegionListings({ provinceName: "경기도", local: GAPYEONG });
    expect(local.programs.map((p) => p.id)).toEqual(["gapyeong", "gyeonggi-wide", "SP-011"]);

    // 시·도 상세: 시·도 공통 → 전국 → 도 안의 시·군 전용(마감 임박순)
    const sido = await loadRegionListings({ provinceName: "경기도" });
    expect(sido.programs.map((p) => p.id)).toEqual(["gyeonggi-wide", "SP-011", "anseong", "gapyeong"]);
  });

  it("rankVenuesByRegion 은 같은 범위 안의 입력 순서를 지킨다", () => {
    const row = (id: string, region: string) => ({ id, region, title: id, organization: "기관" });
    const rows = [row("a", "전국"), row("b", "경기도"), row("c", "전국"), row("d", "경기도")];
    expect(rankVenuesByRegion(rows, { provinceName: "경기도" }).map((r) => r.id)).toEqual(["b", "d", "a", "c"]);
  });
});

describe("regionScopeOf — 검색 패널과 같은 시·군 판정기(localSigunguIdsOf)", () => {
  const base = { title: "제목", organization: "기관" };

  it("시·군·구 칸의 정식·약칭·하위 구 표기를 잡는다", () => {
    const ctx = { provinceName: "경기도", local: GAPYEONG };
    expect(regionScopeOf({ ...base, region: "경기도", sigungu: "가평군" }, ctx)).toBe("own");
    expect(regionScopeOf({ ...base, region: "경기도", sigungu: "가평" }, ctx)).toBe("own");
    const suwon = { provinceName: "경기도", local: { id: "suwon", name: "수원시", shortName: "수원" } };
    expect(regionScopeOf({ ...base, region: "경기도", sigungu: "수원시 장안구" }, suwon)).toBe("own");
  });

  it("칸이 비어도 제목·주관 기관에서 시·군을 찾는다 (SP-035 공주 같은 큐레이션 사업)", () => {
    const ctx = { provinceName: "충청남도", local: { id: "cheonan", name: "천안시", shortName: "천안" } };
    expect(regionScopeOf({ region: "충청남도", title: "공주시 귀농인 정착 지원", organization: "공주시청" }, ctx)).toBe("other");
    expect(regionScopeOf({ region: "충청남도", title: "천안시 귀농 지원", organization: "천안시농업기술센터" }, ctx)).toBe("own");
  });

  it("포함 관계만으로는 같은 지역으로 보지 않는다 (대구 서구 ≠ 달서구)", () => {
    const ctx = { provinceName: "대구광역시", local: { id: "seo-gu-daegu", name: "서구", shortName: "서구" } };
    expect(regionScopeOf({ ...base, region: "대구광역시", sigungu: "달서구" }, ctx)).toBe("other");
    expect(regionScopeOf({ ...base, region: "대구광역시", sigungu: "서구" }, ctx)).toBe("own");
  });

  it("시·도 공통·전국·시·도 상세", () => {
    expect(regionScopeOf({ ...base, region: "경기도" }, { provinceName: "경기도", local: GAPYEONG })).toBe("shared");
    expect(regionScopeOf({ ...base, region: "전국" }, { provinceName: "경기도", local: GAPYEONG })).toBe("national");
    expect(regionScopeOf({ ...base, region: "경기도", sigungu: "안성" }, { provinceName: "경기도" })).toBe("local");
  });
});
