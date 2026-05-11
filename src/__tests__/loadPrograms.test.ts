/**
 * loadPrograms 회귀 테스트 (2026-05-11)
 *
 * 배경: 2026-05-11 사고 — Supabase 성공 시 정적 데이터(PROGRAMS)의 신규
 * 추가 사업이 프로덕션에서 누락. loader.ts에 dbIds 기반 병합 패치 적용했으나,
 * 코드 layer 회귀 테스트로 영구 차단한다.
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

import { getSupabase } from "@/lib/supabase";
import { loadPrograms } from "@/lib/data/loader";
import { PROGRAMS } from "@/lib/data/programs";

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

    const ids = result.data.map((p) => p.id);
    // Supabase row 포함
    expect(ids).toContain("SP-001");
    // 정적 데이터에만 있는 신규 ID도 반드시 포함되어야 한다
    // (PROGRAMS에서 SP-001 외 다른 ID를 골라 검증)
    const staticOnlyId = PROGRAMS.find((p) => p.id !== "SP-001")?.id;
    expect(staticOnlyId).toBeDefined();
    expect(ids).toContain(staticOnlyId);
    // 데이터 갯수: 정적 전체 ≥ Supabase 단일 row 시
    expect(result.data.length).toBeGreaterThanOrEqual(PROGRAMS.length);
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
    const matching = result.data.filter((p) => p.id === targetId);
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
    expect(result.source).toBe("static");
    // 마감 제외 기본 동작이 적용된 정적 데이터
    expect(result.data.length).toBeGreaterThan(0);
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
    expect(result.source).toBe("static");
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

    const result = await loadPrograms({ region: "경기도" });
    // 결과의 모든 row는 region이 "경기도" 또는 "전국"
    for (const p of result.data) {
      expect(["경기도", "전국"]).toContain(p.region);
    }
  });

  it("명시적 filters 전달 시(includeClosed=false), 정적 병합분에 마감 항목 없음", async () => {
    // 주의: filters를 인자 없이(`loadPrograms()`) 호출하면 loader는
    // 정적 fallback 분에 PROGRAMS를 그대로 사용(filterPrograms를 거치지 않음)하므로
    // 날짜 기반 status 재계산이 안 됨 → 결과에 신청기간 끝난 row가 섞일 수 있음.
    // (loader.ts L185 참조 — 별도 fix 검토 사안)
    //
    // 본 테스트는 일반 페이지 호출 패턴(filters 명시)에서 마감 제외가 정상 작동하는지 보증.
    const sbRow = mockRow("SP-001");
    const mockClient = {
      from: vi.fn().mockReturnValue(
        makeChainableQuery({ data: [sbRow], error: null }),
      ),
    };
    vi.mocked(getSupabase).mockReturnValue(
      mockClient as unknown as ReturnType<typeof getSupabase>,
    );

    const result = await loadPrograms({ includeClosed: false });
    // 정적 fallback 부분이 filterPrograms를 거치면서 status="마감" 제외됨
    const closed = result.data.filter((p) => p.status === "마감");
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

    const result = await loadPrograms({ includeClosed: true });
    // 마감 포함 시 정적 row 중 신청기간 끝난 사업도 결과에 포함
    expect(result.data.length).toBeGreaterThanOrEqual(PROGRAMS.length);
  });
});
