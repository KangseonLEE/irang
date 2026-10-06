/**
 * 10/6 전체 QA 1차 — FE-B 회귀(Q4-F1 🔴): 목록 4종 복수 선택 필터
 *
 * 성질 검사 — 각 그룹에서 값 두 개를 고른 결과는 그 값을 하나씩 고른 결과들의 **합집합**과 같고(그룹 안 OR),
 * 다른 그룹의 값을 함께 고른 결과는 **교집합**과 같다(그룹 사이 AND).
 * 10/6 전에는 데이터 쪽이 값 하나만 `!==` 로 비교해 "보조금,융자"·"settlement,youth" 가 0건, "경기도,강원도" 는
 * 전국 사업만, 연령 2구간은 첫 구간만 해석됐다. 체험·교육·작물은 정규화가 단일 값이라 필터가 통째로 풀렸다.
 *
 * 크롤 행은 목록에서 대표 1건으로 묶이므로(crawl-grouping) 묶인 행까지 펼친 id 로 비교한다.
 */
import { describe, it, expect, vi, beforeAll } from "vitest";

vi.mock("@/lib/supabase", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return { ...actual, isSupabaseConfigured: true, getSupabase: vi.fn() };
});
vi.mock("@/lib/api/rda", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/rda")>("@/lib/api/rda");
  return {
    ...actual,
    fetchPolicies: vi.fn().mockResolvedValue(null),
    fetchEducation: vi.fn().mockResolvedValue(null),
  };
});

import { getSupabase } from "@/lib/supabase";
import {
  AGE_RANGES,
  PROGRAM_CATEGORIES,
  REGIONS,
  SUPPORT_TYPES,
  filterProgramsAsync,
  type ProgramFilters,
} from "@/lib/data/programs";
import {
  EDUCATION_LEVELS,
  EDUCATION_REGIONS,
  EDUCATION_TYPES,
  filterEducationAsync,
  type EducationFilters,
} from "@/lib/data/education";
import { EVENT_REGIONS, EVENT_TYPES, filterEvents, filterEventsAsync, type EventFilters } from "@/lib/data/events";
import { CROPS } from "@/lib/data/crops";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  filterCropList,
  scoringPersonaOf,
} from "@/app/crops/crop-list-filter";
import {
  educationRow,
  eventRow,
  expandIds,
  makeSupabaseDouble,
  programRow,
} from "./fixtures/qa1006-feb-supabase";

/** 지역·유형·연령이 고루 섞인 DB 행 — 정적 큐레이션 행은 로더가 병합한다 */
beforeAll(() => {
  const regions = ["경기도", "강원도", "전라남도", "전국"];
  const programs = [
    ...regions.map((region, i) =>
      programRow(`crawl-rda-programs-u${i}`, { region, title: `수집 사업 ${i} 영농` }),
    ),
    programRow("SP-001", { support_type: "융자", application_start: "9999-12-31", application_end: "9999-12-31", application_cycle: "매년 초" }),
    programRow("SP-002", { eligibility_age_max: 39, application_start: "9999-12-31", application_end: "9999-12-31", application_cycle: "전년 11~12월" }),
    programRow("SP-022", { support_type: "컨설팅", eligibility_age_max: 39, application_start: "9999-12-31", application_end: "9999-12-31" }),
    programRow("SP-024", { support_type: "현물", region: "경상남도", application_start: "2026-05-01", application_end: "2026-05-22" }),
  ];
  const education = [
    ...regions.map((region, i) =>
      educationRow(`crawl-greendaero-education-u${i}`, { region, type: i % 2 ? "온라인" : "혼합", title: `그린대로 교육 ${i}` }),
    ),
    ...regions.map((region, i) => educationRow(`crawl-rda-education-u${i}`, { region, title: `RDA 교육 ${i}` })),
    educationRow("ED-001", { region: "서울특별시", level: "입문", application_start: "2026-02-10", application_end: "2026-04-17" }),
  ];
  const events = [
    eventRow("crawl-greendaero-live-u1", { region: "전라남도", type: "살아보기" }),
    eventRow("crawl-greendaero-live-u2", { region: "강원도", type: "살아보기" }),
    eventRow("crawl-greendaero-education-u3", { region: "강원도", type: "일일체험" }),
    eventRow("crawl-greendaero-education-u4", { region: "경기도", type: "일일체험" }),
    eventRow("evt-001", { type: "박람회", region: "경기도", application_start: "2026-03-01", application_end: "2026-04-23", date_start: "2026-04-24", date_end: "2026-04-26" }),
  ];
  vi.mocked(getSupabase).mockReturnValue(
    makeSupabaseDouble({ support_programs: programs, education_courses: education, farm_events: events }) as unknown as ReturnType<typeof getSupabase>,
  );
});

/** a·b 두 값 쌍 — 선택지 앞쪽·뒤쪽을 섞어 고른다 */
function pairs(options: readonly string[]): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length; j++) out.push([options[i], options[j]]);
  }
  return out;
}

function union(a: string[], b: string[]): string[] {
  return [...new Set([...a, ...b])].sort();
}

function intersect(a: string[], b: string[]): string[] {
  const set = new Set(b);
  return a.filter((x) => set.has(x)).sort();
}

describe("/programs — 그룹 안 합집합", () => {
  // 마감까지 넓혀 모집단을 키운다(상태 그룹 자체는 아래에서 따로 본다)
  const BASE: ProgramFilters = { includeClosed: true, status: "모집중,정기 접수,모집예정,마감" };
  const ids = async (f: ProgramFilters) => expandIds((await filterProgramsAsync({ ...BASE, ...f })).programs);

  const GROUPS: [keyof ProgramFilters, readonly string[]][] = [
    ["region", REGIONS],
    ["supportType", SUPPORT_TYPES],
    ["category", PROGRAM_CATEGORIES],
    ["age", AGE_RANGES],
  ];
  for (const [key, options] of GROUPS) {
    it(`${key}: 두 값 CSV = 각각의 합집합 (모든 쌍)`, async () => {
      for (const [a, b] of pairs(options)) {
        const multi = await ids({ [key]: `${a},${b}` });
        expect(multi, `${key}=${a},${b}`).toEqual(union(await ids({ [key]: a }), await ids({ [key]: b })));
      }
    });
  }

  it("status: 두 값 CSV = 각각의 합집합", async () => {
    const statuses = ["모집중", "정기 접수", "모집예정", "마감"];
    for (const [a, b] of pairs(statuses)) {
      const one = async (s: string) => expandIds((await filterProgramsAsync({ includeClosed: true, status: s })).programs);
      expect(expandIds((await filterProgramsAsync({ includeClosed: true, status: `${a},${b}` })).programs)).toEqual(
        union(await one(a), await one(b)),
      );
    }
  });

  it("QA 재현 사례가 0건·전국 사업만이 아니다", async () => {
    expect((await ids({ supportType: "보조금,융자" })).length).toBeGreaterThan(0);
    expect((await ids({ category: "settlement,youth" })).length).toBeGreaterThan(0);
    const both = await ids({ region: "경기도,강원도" });
    expect(both).toContain("crawl-rda-programs-u0"); // 경기도
    expect(both).toContain("crawl-rda-programs-u1"); // 강원도
  });

  it("그룹 사이는 교집합 — 지역 × 카테고리, 지원 유형 × 연령", async () => {
    expect(await ids({ region: "경상남도", category: "facility" })).toEqual(
      intersect(await ids({ region: "경상남도" }), await ids({ category: "facility" })),
    );
    expect(await ids({ supportType: "융자,보조금", age: "19~29세,70~79세" })).toEqual(
      intersect(await ids({ supportType: "융자,보조금" }), await ids({ age: "19~29세,70~79세" })),
    );
  });
});

describe("/events — 그룹 안 합집합 (DB + 정적, 정적 전용 filterEvents 도)", () => {
  const ids = async (f: EventFilters) =>
    (await filterEventsAsync({ includeClosed: true, ...f })).events.map((e) => e.id).sort();
  const staticIds = (f: EventFilters) => filterEvents({ includeClosed: true, ...f }).map((e) => e.id).sort();

  const GROUPS: [keyof EventFilters, readonly string[]][] = [
    ["type", EVENT_TYPES],
    ["region", EVENT_REGIONS],
  ];
  for (const [key, options] of GROUPS) {
    it(`${key}: 두 값 CSV = 각각의 합집합 (모든 쌍)`, async () => {
      for (const [a, b] of pairs(options)) {
        expect(await ids({ [key]: `${a},${b}` }), `${key}=${a},${b}`).toEqual(
          union(await ids({ [key]: a }), await ids({ [key]: b })),
        );
        expect(staticIds({ [key]: `${a},${b}` })).toEqual(union(staticIds({ [key]: a }), staticIds({ [key]: b })));
      }
    });
  }

  it("유형 × 지역은 교집합", async () => {
    expect(await ids({ type: "살아보기,일일체험", region: "강원도" })).toEqual(
      intersect(await ids({ type: "살아보기,일일체험" }), await ids({ region: "강원도" })),
    );
  });
});

describe("/education — 그룹 안 합집합", () => {
  const ids = async (f: EducationFilters) =>
    expandIds((await filterEducationAsync({ includeClosed: true, ...f })).courses);

  const GROUPS: [keyof EducationFilters, readonly string[]][] = [
    ["region", EDUCATION_REGIONS],
    ["type", EDUCATION_TYPES],
    ["level", EDUCATION_LEVELS],
  ];
  for (const [key, options] of GROUPS) {
    it(`${key}: 두 값 CSV = 각각의 합집합 (모든 쌍)`, async () => {
      for (const [a, b] of pairs(options)) {
        expect(await ids({ [key]: `${a},${b}` }), `${key}=${a},${b}`).toEqual(
          union(await ids({ [key]: a }), await ids({ [key]: b })),
        );
      }
    });
  }

  it("지역 × 방식 × 수준은 교집합", async () => {
    const f = { region: "경기도,강원도", type: "온라인,혼합", level: "입문,초급" };
    const expected = intersect(
      intersect(await ids({ region: f.region }), await ids({ type: f.type })),
      await ids({ level: f.level }),
    );
    expect(await ids(f)).toEqual(expected);
  });
});

describe("/crops — 그룹 안 합집합 · 균등 페르소나", () => {
  const ids = (categories: string[], difficulties: string[], persona?: Parameters<typeof scoringPersonaOf>[0]) =>
    filterCropList(CROPS, {
      categories: CATEGORY_OPTIONS.filter((c) => categories.includes(c)),
      difficulties: DIFFICULTY_OPTIONS.filter((d) => difficulties.includes(d)),
      query: "",
      persona,
      sort: "name",
    })
      .map((c) => c.id)
      .sort();

  it("카테고리: 두 값 = 각각의 합집합 (모든 쌍)", () => {
    for (const [a, b] of pairs(CATEGORY_OPTIONS)) {
      expect(ids([a, b], [])).toEqual(union(ids([a], []), ids([b], [])));
    }
  });

  it("난이도: 두 값 = 각각의 합집합 (모든 쌍)", () => {
    for (const [a, b] of pairs(DIFFICULTY_OPTIONS)) {
      expect(ids([], [a, b])).toEqual(union(ids([], [a]), ids([], [b])));
    }
  });

  it("카테고리 × 난이도는 교집합", () => {
    expect(ids(["과수", "채소"], ["쉬움"])).toEqual(intersect(ids(["과수", "채소"], []), ids([], ["쉬움"])));
  });

  it("기본 균등(balanced) 페르소나는 거르지 않는다 — 전체 55종 (10/6 전엔 0건)", () => {
    expect(ids([], [], "balanced")).toEqual(ids([], []));
    expect(ids([], [], "balanced").length).toBe(CROPS.length);
    // 적합도 페르소나는 여전히 4점 이상만
    expect(ids([], [], "commuter").length).toBeLessThan(CROPS.length);
  });
});
