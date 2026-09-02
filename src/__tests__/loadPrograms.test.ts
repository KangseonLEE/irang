/**
 * loadPrograms 회귀 테스트 (2026-05-11 · 2026-09-02 대상 교정)
 *
 * 배경: 2026-05-11 사고 — Supabase 성공 시 정적 데이터(PROGRAMS)의 신규
 * 추가 사업이 프로덕션에서 누락. dbIds 기반 병합 패치를 코드 layer 회귀 테스트로 영구 차단한다.
 *
 * 9/2 감사: 이 테스트가 프로덕션 호출 0건인 `lib/data/loader.ts::loadPrograms`(중복 구현)를
 * import 하고 있어 실제 경로(`lib/data/programs.ts::loadPrograms` → `filterProgramsAsync` → /programs)
 * 를 보호하지 못했다. 대상을 실제 경로로 교정하고 loader.ts 쪽 중복 구현은 삭제.
 *
 * 검증 목표 (CLAUDE.md "데이터 소스 병합 원칙"):
 *  1) Supabase 성공 + 정적 데이터에만 있는 ID → 결과에 포함되어야 한다
 *  2) Supabase 성공 + 양쪽에 같은 ID → Supabase 우선, dedup (중복 X)
 *  3) Supabase 실패 → 정적 fallback
 *  4) filters 적용 → 정적 부분에도 같은 필터 적용
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

// supabase 모듈을 모킹 — getSupabase + isSupabaseConfigured 제어
vi.mock("@/lib/supabase", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/supabase")>("@/lib/supabase");
  return {
    ...actual,
    isSupabaseConfigured: true,
    getSupabase: vi.fn(),
  };
});

// RDA API(2단계 소스)는 항상 실패시켜 Supabase → 정적 fallback 경로만 검증
vi.mock("@/lib/api/rda", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/rda")>("@/lib/api/rda");
  return { ...actual, fetchPolicies: vi.fn().mockResolvedValue(null) };
});

import { getSupabase } from "@/lib/supabase";
import { loadPrograms, filterProgramsAsync, PROGRAMS } from "@/lib/data/programs";

/**
 * Supabase chainable query builder mock 생성기.
 * .from(...).select(...).or(...).eq(...).neq(...).order(...) 등 모든 메서드가
 * this를 반환하도록 만들고, 최종 await 시 { data, error } 반환.
 */
function makeChainableQuery(result: {
  data: unknown[] | null;
  error: unknown;
}) {
  const chain: Record<string, unknown> = {};
  const methods = [
    "select",
    "or",
    "eq",
    "neq",
    "order",
    "ilike",
    "in",
    "is",
    "filter",
    "limit",
  ];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  // PostgREST 쿼리 빌더는 thenable
  chain.then = (resolve: (value: typeof result) => unknown) =>
    Promise.resolve(result).then(resolve);
  return chain;
}

/**
 * Supabase row → loader.ts의 ProgramRow 형태로 변환한 mock row.
 * loader.ts가 row.slug → SupportProgram.id로 매핑하므로 slug를 명시.
 */
function mockRow(slug: string, overrides: Record<string, unknown> = {}) {
  return {
    slug,
    title: `mock ${slug}`,
    summary: "mock summary",
    region: "전국",
    organization: "mock org",
    support_type: "보조금",
    support_amount: "1000만원",
    eligibility_age_min: 19,
    eligibility_age_max: 65,
    eligibility_detail: "mock",
    application_start: "2026-01-01",
    application_end: "2026-12-31",
    status: "모집중",
    related_crops: [],
    source_url: "https://example.com",
    link_status: "ok",
    year: 2026,
    ...overrides,
  };
}

describe("loadPrograms — Supabase + static data merge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("Supabase 성공 시, 정적 데이터에만 있는 ID도 결과에 병합된다", async () => {
    // Supabase에 SP-001만 있다고 가정 (정적은 SP-001 ~ SP-020 다수)
    const sbRow = mockRow("SP-001");
    const mockClient = {
      from: vi.fn().mockReturnValue(
        makeChainableQuery({ data: [sbRow], error: null }),
      ),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await loadPrograms();
    expect(result.source).toBe("supabase");

    const ids = result.programs.map((p) => p.id);
    // Supabase row 포함
    expect(ids).toContain("SP-001");
    // 정적 데이터에만 있는 신규 ID도 반드시 포함되어야 한다
    // (PROGRAMS에서 SP-001 외 다른 ID를 골라 검증)
    const staticOnlyId = PROGRAMS.find((p) => p.id !== "SP-001")?.id;
    expect(staticOnlyId).toBeDefined();
    expect(ids).toContain(staticOnlyId);
    // 데이터 갯수: 정적 전체 ≥ Supabase 단일 row 시
    expect(result.programs.length).toBeGreaterThanOrEqual(PROGRAMS.length);
  });

  it("Supabase와 정적 양쪽에 같은 ID가 있으면 Supabase 우선, dedup된다", async () => {
    // PROGRAMS의 첫 번째 ID를 골라 Supabase row로 흉내냄 — title을 변형해 식별
    const targetId = PROGRAMS[0].id;
    const sbRow = mockRow(targetId, {
      title: "FROM_SUPABASE_OVERRIDE_TITLE",
    });
    const mockClient = {
      from: vi.fn().mockReturnValue(
        makeChainableQuery({ data: [sbRow], error: null }),
      ),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await loadPrograms();
    const matching = result.programs.filter((p) => p.id === targetId);
    // 중복 없이 1건만 존재
    expect(matching.length).toBe(1);
    // 그 1건은 Supabase 값이어야 함 (정적 title이 아님)
    expect(matching[0].title).toBe("FROM_SUPABASE_OVERRIDE_TITLE");
  });

  it("Supabase 응답이 error 객체를 반환하면 정적 fallback으로 전환", async () => {
    const mockClient = {
      from: vi.fn().mockReturnValue(
        makeChainableQuery({
          data: null,
          error: { message: "boom" },
        }),
      ),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await loadPrograms();
    expect(result.source).toBe("fallback");
    // 마감 제외 기본 동작이 적용된 정적 데이터
    expect(result.programs.length).toBeGreaterThan(0);
  });

  it("Supabase가 throw하면 정적 fallback으로 전환", async () => {
    const mockClient = {
      from: vi.fn().mockImplementation(() => {
        throw new Error("network");
      }),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await loadPrograms();
    expect(result.source).toBe("fallback");
  });

  it("filters.region 적용 시, 병합된 정적 부분도 같은 region 필터를 만족한다", async () => {
    const sbRow = mockRow("SP-001", { region: "경기도" });
    const mockClient = {
      from: vi.fn().mockReturnValue(
        makeChainableQuery({ data: [sbRow], error: null }),
      ),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await filterProgramsAsync({ region: "경기도" });
    // 결과의 모든 row는 region이 "경기도" 또는 "전국"
    for (const p of result.programs) {
      expect(["경기도", "전국"]).toContain(p.region);
    }
  });

  it("명시적 filters 전달 시(includeClosed=false), 정적 병합분에 마감 항목 없음", async () => {
    // 일반 페이지 호출 패턴(filterProgramsAsync)에서 정적 병합분의 마감 제외가 작동하는지 보증.
    const sbRow = mockRow("SP-001");
    const mockClient = {
      from: vi.fn().mockReturnValue(
        makeChainableQuery({ data: [sbRow], error: null }),
      ),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await filterProgramsAsync({ includeClosed: false });
    // 정적 병합분도 날짜 기반 status 재계산 후 "마감" 제외됨
    const closed = result.programs.filter((p) => p.status === "마감");
    expect(closed.length).toBe(0);
  });

  it("filters.includeClosed=true 시 정적 병합분에 마감 항목 포함 가능", async () => {
    const sbRow = mockRow("SP-001");
    const mockClient = {
      from: vi.fn().mockReturnValue(
        makeChainableQuery({ data: [sbRow], error: null }),
      ),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await filterProgramsAsync({ includeClosed: true });
    // 마감 포함 시 정적 row 중 신청기간 끝난 사업도 결과에 포함 (broken 링크 항목만 숨김)
    const visibleStatic = PROGRAMS.filter((p) => p.linkStatus !== "broken").length;
    expect(result.programs.length).toBeGreaterThanOrEqual(visibleStatic);
  });
});
