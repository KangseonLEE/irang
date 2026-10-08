/**
 * 10/6 전체 QA 1차 — FE-B 회귀: 데이터 로더 병합·상태 파생·수집기 기본값
 *
 * - Q1-W1: DB 매핑이 category 를 버려 DB 우선 12행이 분류를 잃었다 → youth 3건 중 1건만(SP-002·SP-022 누락).
 * - Q1-W3: 체험·교육 로더에 정적 병합이 없어 정적 전용 행(evt-004 수원 케이팜, ED-003~005)이 목록에 0회 노출.
 * - Q1-W19: 교육 목록만 DB status 칸을 그대로 썼다(지원사업·체험은 날짜 파생).
 * - 정적 배열의 손으로 적은 status(ED-001 "모집중", evt-001~003 "접수중")가 낡아 있었다 → 칸 자체를 없애고 파생.
 * - Q1-W4·Q4-W4: 수집 행의 기본값(지원 유형 "보조금"·연령 18~65·교육 "초급"·RDA "오프라인")이 필터에서 사실처럼 동작.
 * - Q1-W5: SP-030·031 이 추정 일자(2026-12-15~31)로 "모집예정" — 연례 12월 창구라 9999 페어 + 접수 시기.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
  PROGRAMS,
  filterProgramsAsync,
  getProgramByIdAsync,
  loadPrograms,
} from "@/lib/data/programs";
import {
  EDUCATION_COURSES,
  filterEducationAsync,
  getEducationById,
  getEducationByIdAsync,
} from "@/lib/data/education";
import { EVENTS, filterEventsAsync, getEventById, getEventByIdAsync } from "@/lib/data/events";
import {
  CYCLE_LABEL,
  deriveEventStatus,
  deriveStatus,
  programStatusLabel,
} from "@/lib/program-status";
import {
  educationRow,
  eventRow,
  expandIds,
  makeSupabaseDouble,
  programRow,
  type TableRows,
} from "./fixtures/qa1006-feb-supabase";

function useTables(tables: TableRows) {
  vi.mocked(getSupabase).mockReturnValue(
    makeSupabaseDouble(tables) as unknown as ReturnType<typeof getSupabase>,
  );
}

const WIDE = { includeClosed: true, status: "모집중,정기 접수,모집예정,마감" } as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("지원사업 — DB 행에 정적 category·접수 시기 병합 (Q1-W1)", () => {
  beforeEach(() => {
    useTables({
      support_programs: [
        // DB 에 있는 큐레이션 행 — category 칸이 DB 에 없다
        programRow("SP-001", { support_type: "융자", application_start: "9999-12-31", application_end: "9999-12-31", application_cycle: "매년 초 시·군 접수" }),
        programRow("SP-002", { eligibility_age_max: 39, application_start: "9999-12-31", application_end: "9999-12-31", application_cycle: "전년 11~12월 Agrix 접수" }),
        // DB 의 접수 시기가 비어 있는 큐레이션 행 — 정적 applicationCycle 로 채운다
        programRow("SP-022", { support_type: "컨설팅", eligibility_age_max: 39, application_start: "9999-12-31", application_end: "9999-12-31", application_cycle: null }),
        programRow("SP-023", { support_type: "융자", application_start: "9999-12-31", application_end: "9999-12-31", application_cycle: "1~2월 농업e지 온라인 접수" }),
      ],
    });
  });

  it("목록: DB 우선 행도 정적 category 를 갖는다", async () => {
    const { programs } = await loadPrograms();
    const byId = new Map(programs.map((p) => [p.id, p]));
    expect(byId.get("SP-001")?.category).toBe("settlement");
    expect(byId.get("SP-002")?.category).toBe("youth");
    expect(byId.get("SP-022")?.category).toBe("youth");
    expect(byId.get("SP-023")?.category).toBe("settlement");
  });

  it("category=youth 에 DB 우선 행(SP-002·SP-022)과 정적 행(SP-020)이 함께 나온다", async () => {
    const { programs } = await filterProgramsAsync({ ...WIDE, category: "youth" });
    const ids = expandIds(programs);
    for (const id of ["SP-002", "SP-020", "SP-022"]) expect(ids).toContain(id);
    // 정적 youth 전부가 빠짐없이
    const staticYouth = PROGRAMS.filter((p) => p.category === "youth" && p.linkStatus !== "broken").map((p) => p.id);
    for (const id of staticYouth) expect(ids).toContain(id);
  });

  it("DB 접수 시기가 비면 정적 값 — SP-022 는 '공고 발표 예정'이 아니라 '정기 접수'", async () => {
    const { programs } = await loadPrograms();
    const sp022 = programs.find((p) => p.id === "SP-022")!;
    expect(sp022.applicationCycle).toBe("매년 6~7월 경기 시·군 접수 (2027년 사업은 2026년 6월 하순~7월 24일)");
    expect(programStatusLabel(sp022)).toBe(CYCLE_LABEL);
    // DB 값이 있으면 DB 우선
    expect(programs.find((p) => p.id === "SP-001")?.applicationCycle).toBe("매년 초 시·군 접수");
  });

  it("상세(getProgramByIdAsync)도 같은 매핑 — category·접수 시기", async () => {
    expect((await getProgramByIdAsync("SP-002"))?.category).toBe("youth");
    expect((await getProgramByIdAsync("SP-022"))?.applicationCycle).toBe("매년 6~7월 경기 시·군 접수 (2027년 사업은 2026년 6월 하순~7월 24일)");
  });
});

describe("지원사업 — 수집 행 기본값은 필터에서 '모름' (Q1-W4·Q4-W4)", () => {
  const CRAWL = "crawl-rda-programs-test0001";
  beforeEach(() => {
    useTables({ support_programs: [programRow(CRAWL, { region: "경기도" })] });
  });

  it("전체 보기(유형·연령 미선택)에는 나온다", async () => {
    expect(expandIds((await filterProgramsAsync({ ...WIDE })).programs)).toContain(CRAWL);
    expect(expandIds((await filterProgramsAsync({ ...WIDE, region: "경기도" })).programs)).toContain(CRAWL);
  });

  it("지원 유형을 고르면 빠진다 — 기본값 '보조금'을 골라도", async () => {
    for (const supportType of ["보조금", "보조금,융자", "융자"]) {
      expect(expandIds((await filterProgramsAsync({ ...WIDE, supportType })).programs)).not.toContain(CRAWL);
    }
  });

  it("연령대를 고르면 빠진다 — 기본값 18~65 와 겹치는 구간이어도", async () => {
    for (const age of ["19~29세", "30~39세,60~69세"]) {
      expect(expandIds((await filterProgramsAsync({ ...WIDE, age })).programs)).not.toContain(CRAWL);
    }
  });

  it("큐레이션 행은 연령 구간 합집합으로 걸린다 — SP-002(18~39)는 19~29 또는 60~69 중 하나만 겹쳐도", async () => {
    useTables({ support_programs: [programRow("SP-002", { eligibility_age_max: 39, application_start: "9999-12-31", application_end: "9999-12-31", application_cycle: "x" })] });
    const ids = expandIds((await filterProgramsAsync({ ...WIDE, age: "60~69세,19~29세" })).programs);
    expect(ids).toContain("SP-002");
    const only60 = expandIds((await filterProgramsAsync({ ...WIDE, age: "60~69세" })).programs);
    expect(only60).not.toContain("SP-002");
  });
});

describe("체험·행사 — 정적 전용 행 병합 + 상태 파생 (Q1-W3)", () => {
  beforeEach(() => {
    useTables({
      farm_events: [
        eventRow("evt-001", { type: "박람회", date_start: "2026-04-24", date_end: "2026-04-26", application_start: "2026-03-01", application_end: "2026-04-23", status: "접수중" }),
        eventRow("crawl-greendaero-live-test0001"),
      ],
    });
  });

  it("DB 에 없는 정적 행사(evt-004 수원 케이팜)도 목록 모집단에 있다", async () => {
    const { events } = await filterEventsAsync({ includeClosed: true });
    const ids = events.map((e) => e.id);
    expect(ids).toContain("evt-004");
    expect(ids).toContain("crawl-greendaero-live-test0001");
    // DB 와 정적 양쪽에 있는 evt-001 은 한 번만 (DB 우선)
    expect(ids.filter((id) => id === "evt-001")).toHaveLength(1);
  });

  it("DB status 칸이 아니라 날짜 파생 — 지난 행사는 '마감'", async () => {
    const { events } = await filterEventsAsync({ includeClosed: true });
    const evt001 = events.find((e) => e.id === "evt-001")!;
    expect(evt001.status).toBe(deriveEventStatus(evt001.applicationStart, evt001.applicationEnd, evt001.dateEnd));
    expect((await getEventByIdAsync("evt-001"))?.status).toBe(evt001.status);
  });
});

describe("교육 — 정적 전용 행 병합 + DB status 대신 날짜 파생 (Q1-W3·W19)", () => {
  beforeEach(() => {
    useTables({
      education_courses: [
        // DB status 칸은 "모집중"이지만 신청 기간은 이미 끝났다
        educationRow("ED-001", { type: "오프라인", level: "입문", application_start: "2026-02-10", application_end: "2026-04-17", status: "모집중" }),
        educationRow("crawl-rda-education-test0001", { region: "경기도" }),
        educationRow("crawl-greendaero-education-test0001", { region: "강원도", type: "온라인" }),
      ],
    });
  });

  it("DB 에 없는 정적 과정(ED-003~005)도 모집단에 있다", async () => {
    const ids = expandIds((await filterEducationAsync({ includeClosed: true })).courses);
    for (const id of ["ED-003", "ED-004", "ED-005"]) expect(ids).toContain(id);
    expect(ids.filter((id) => id === "ED-001")).toHaveLength(1);
  });

  it("status 는 신청 기간에서 파생 — 목록·상세 모두", async () => {
    const { courses } = await filterEducationAsync({ includeClosed: true });
    const ed001 = courses.find((c) => c.id === "ED-001")!;
    expect(ed001.status).toBe(deriveStatus("2026-02-10", "2026-04-17"));
    expect((await getEducationByIdAsync("ED-001"))?.status).toBe(ed001.status);
  });

  it("수준(level) 필터: 수집 행 '초급'은 기본값이라 빠지고, 전체 보기에는 나온다", async () => {
    const all = expandIds((await filterEducationAsync({ includeClosed: true })).courses);
    expect(all).toContain("crawl-rda-education-test0001");
    const beginner = expandIds((await filterEducationAsync({ includeClosed: true, level: "초급" })).courses);
    expect(beginner).not.toContain("crawl-rda-education-test0001");
    expect(beginner).not.toContain("crawl-greendaero-education-test0001");
  });

  it("방식(type) 필터: RDA 수집 행의 '오프라인'은 기본값이라 빠지고, 그린대로 수집 행은 원문 값으로 걸린다", async () => {
    const offline = expandIds((await filterEducationAsync({ includeClosed: true, type: "오프라인" })).courses);
    expect(offline).not.toContain("crawl-rda-education-test0001");
    const online = expandIds((await filterEducationAsync({ includeClosed: true, type: "온라인" })).courses);
    expect(online).toContain("crawl-greendaero-education-test0001");
  });
});

describe("정적 배열 — 손으로 적은 status 0건 (파생값만)", () => {
  const ROOT = path.resolve(__dirname, "../..");

  it("EVENTS·EDUCATION_COURSES·PROGRAMS 의 status 가 전부 파생값과 같다", () => {
    for (const e of EVENTS) {
      expect(e.status, e.id).toBe(deriveEventStatus(e.applicationStart, e.applicationEnd, e.dateEnd));
    }
    for (const c of EDUCATION_COURSES) {
      expect(c.status, c.id).toBe(deriveStatus(c.applicationStart, c.applicationEnd));
    }
    for (const p of PROGRAMS) {
      expect(p.status, p.id).toBe(deriveStatus(p.applicationStart, p.applicationEnd));
    }
  });

  it("단건 조회(getEventById·getEducationById)도 파생값", () => {
    for (const e of EVENTS) expect(getEventById(e.id)?.status).toBe(e.status);
    for (const c of EDUCATION_COURSES) expect(getEducationById(c.id)?.status).toBe(c.status);
  });

  it("정적 원본 배열 소스에 status 칸을 손으로 적지 않는다", () => {
    const cases: [string, string][] = [
      ["src/lib/data/events.ts", "const EVENTS_RAW"],
      ["src/lib/data/education.ts", "const EDUCATION_COURSES_RAW"],
      ["src/lib/data/programs.ts", "const PROGRAMS_RAW"],
    ];
    for (const [file, marker] of cases) {
      const src = readFileSync(path.join(ROOT, file), "utf8");
      const start = src.indexOf(marker);
      expect(start, `${file} ${marker}`).toBeGreaterThan(-1);
      const end = src.indexOf("\n];", start);
      const body = src.slice(start, end);
      expect(body, `${file} 원본 배열에 status 칸`).not.toMatch(/^\s+status:\s*"/m);
    }
  });
});

describe("SP-030·031 — 연례 12월 창구 (Q1-W5)", () => {
  it("추정 일자 대신 9999 페어 + 접수 시기 → '정기 접수'", () => {
    for (const id of ["SP-030", "SP-031"]) {
      const p = PROGRAMS.find((x) => x.id === id)!;
      expect(p.applicationStart).toBe("9999-12-31");
      expect(p.applicationEnd).toBe("9999-12-31");
      expect(p.applicationCycle).toMatch(/^매년 12월/);
      expect(programStatusLabel(p)).toBe(CYCLE_LABEL);
    }
  });
});
