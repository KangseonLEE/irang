/**
 * 10/6 FE-B 회귀 테스트용 Supabase 대역 — 테이블별 행을 돌려주는 체인형 쿼리 빌더.
 * `.from(table).select().order()…` 는 await 시 그 테이블 전체, `.eq("slug", id).maybeSingle()` 은 한 행.
 */
import { vi } from "vitest";

export type TableRows = Record<string, Record<string, unknown>[]>;

export function makeSupabaseDouble(tables: TableRows) {
  return {
    from: vi.fn((table: string) => {
      const rows = tables[table] ?? [];
      let slug: string | undefined;
      const chain: Record<string, unknown> = {};
      for (const m of ["select", "order", "or", "neq", "ilike", "in", "is", "filter", "limit"]) {
        chain[m] = vi.fn(() => chain);
      }
      chain.eq = vi.fn((col: string, value: string) => {
        if (col === "slug") slug = value;
        return chain;
      });
      chain.maybeSingle = vi.fn(() =>
        Promise.resolve({ data: rows.find((r) => r.slug === slug) ?? null, error: null }),
      );
      chain.then = (resolve: (v: { data: unknown[]; error: null }) => unknown) =>
        Promise.resolve({ data: rows, error: null }).then(resolve);
      return chain;
    }),
  };
}

/** support_programs 행 — 기본값은 수집기(sync-crawl)가 넣는 값과 같다 */
export function programRow(slug: string, over: Record<string, unknown> = {}) {
  return {
    slug,
    title: `제목 ${slug}`,
    summary: "요약",
    description: "",
    region: "전국",
    sigungu: null,
    organization: "기관",
    support_type: "보조금",
    support_amount: "상세 공고 참조",
    eligibility_age_min: 18,
    eligibility_age_max: 65,
    eligibility_detail: "상세 공고 참조",
    application_start: "2026-01-01",
    application_end: "2099-12-31",
    application_cycle: null,
    status: "모집중",
    related_crops: [],
    source_url: "https://example.com",
    link_status: "active",
    year: 2026,
    created_at: "2026-01-01T00:00:00Z",
    ...over,
  };
}

/** education_courses 행 — 수집 행 기본값(오프라인·초급) */
export function educationRow(slug: string, over: Record<string, unknown> = {}) {
  return {
    slug,
    title: `교육 ${slug}`,
    region: "전국",
    sigungu: null,
    organization: "기관",
    type: "오프라인",
    duration: "상세 공고 참조",
    schedule: "상세 공고 참조",
    target: "상세 공고 참조",
    cost: "상세 공고 참조",
    description: "설명",
    capacity: null,
    application_start: "2026-01-01",
    application_end: "2099-12-31",
    status: "모집중",
    level: "초급",
    url: "https://example.com",
    link_status: "active",
    ...over,
  };
}

/** farm_events 행 */
export function eventRow(slug: string, over: Record<string, unknown> = {}) {
  return {
    slug,
    title: `행사 ${slug}`,
    region: "경기도",
    sigungu: null,
    organization: "기관",
    type: "살아보기",
    date_start: "2099-01-01",
    date_end: "2099-01-31",
    application_start: "2026-01-01",
    application_end: "2099-12-31",
    location: "장소",
    cost: "무료",
    description: "설명",
    capacity: null,
    target: "누구나",
    url: "https://example.com",
    status: "접수중",
    ...over,
  };
}

/** 그룹핑(crawl-grouping)으로 대표 카드에 묶인 행까지 펼친 id 집합 */
export function expandIds(rows: { id: string; crawlGroup?: { others: { id: string }[] } }[]): string[] {
  const ids: string[] = [];
  for (const r of rows) {
    ids.push(r.id);
    for (const o of r.crawlGroup?.others ?? []) ids.push(o.id);
  }
  return ids.sort();
}
