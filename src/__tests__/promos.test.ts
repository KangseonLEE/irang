/**
 * 홍보 팝업 데이터 층 (2026-09-29)
 *  - row ↔ 레코드 매핑 왕복
 *  - 노출 판정(KST 경계 · starts_at null · active false)
 *  - 저장 입력 검증 규칙
 *  - DB 실패 시 정적 폴백 (5/26 silent 202 교훈: 폴백은 로그를 남긴다)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Supabase 체인 mock ───────────────────────────────────────
// from().select().eq().gte().or().order().order() 처럼 이어지다가 await 되는 형태.
type QueryResult = { data: unknown; error: { message: string } | null };

let queryResult: QueryResult = { data: [], error: null };
let adminClient: unknown = {};

function makeChain(result: () => QueryResult) {
  const chain: Record<string, unknown> = {};
  const passthrough = () => chain;
  for (const key of ["select", "eq", "gte", "lte", "or", "order", "limit", "upsert", "delete", "insert", "update"]) {
    chain[key] = vi.fn(passthrough);
  }
  chain.single = vi.fn(async () => result());
  chain.maybeSingle = vi.fn(async () => result());
  chain.then = (resolve: (v: QueryResult) => unknown) => Promise.resolve(result()).then(resolve);
  return chain;
}

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => adminClient,
}));

import {
  rowToRecord,
  recordToRow,
  toPopupItem,
  validatePromoInput,
  type PromoRow,
  type PromoRecord,
} from "@/lib/promos/types";
import {
  isRecordVisible,
  kstDate,
  fetchActivePromos,
  loadActivePromos,
  listPromos,
  readImageSize,
} from "@/lib/promos/queries";
import { getActivePromos } from "@/lib/data/promo-popup";

const ROW: PromoRow = {
  id: "gafi-masil-2026",
  org: "경기도 귀농귀촌지원센터",
  title: "재능으로 잇는 마실짝꿍",
  tagline: "도시민의 재능 × 주민의 삶",
  image_url: "/promo/gafi-masil-2026.webp",
  image_width: 600,
  image_height: 851,
  alt: "포스터",
  facts: [
    { label: "모집 기간", value: "9. 28.(일) 18:00 마감" },
    { label: "문의", value: "1800-8114", href: "tel:18008114" },
  ],
  recruit_closed: true,
  note: "이번 모집은 끝났어요.",
  href: "https://www.refarmgg.or.kr/x",
  starts_at: null,
  until: "2026-11-15",
  active: true,
  sort_order: 0,
  updated_at: "2026-09-29T00:00:00Z",
};

const RECORD: PromoRecord = rowToRecord(ROW);

beforeEach(() => {
  adminClient = { from: vi.fn(() => makeChain(() => queryResult)) };
  queryResult = { data: [], error: null };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("row ↔ 레코드 매핑", () => {
  it("왕복해도 값이 보존된다", () => {
    const back = recordToRow(RECORD);
    expect(back).toMatchObject({
      id: ROW.id,
      image_url: ROW.image_url,
      image_width: ROW.image_width,
      recruit_closed: ROW.recruit_closed,
      starts_at: null,
      until: ROW.until,
      sort_order: 0,
      active: true,
    });
    expect(rowToRecord({ ...ROW, ...back, updated_at: ROW.updated_at })).toEqual(RECORD);
  });

  it("null 컬럼은 화면 계약(문자열)으로 좁힌다", () => {
    const rec = rowToRecord({ ...ROW, tagline: null, alt: null, note: null, updated_at: null });
    expect(rec.tagline).toBe("");
    expect(rec.alt).toBe("");
    expect(rec.note).toBe("");
    expect(rec.updatedAt).toBe("");
  });

  it("facts 가 배열이 아니거나 형태가 깨진 행은 건너뛴다", () => {
    expect(rowToRecord({ ...ROW, facts: "not-an-array" }).facts).toEqual([]);
    expect(rowToRecord({ ...ROW, facts: [{ label: "주최" }, { label: "문의", value: "1800" }] }).facts).toEqual([
      { label: "문의", value: "1800" },
    ]);
  });

  it("toPopupItem 은 관리 전용 필드를 내보내지 않는다", () => {
    const item = toPopupItem(RECORD) as unknown as Record<string, unknown>;
    expect(item.active).toBeUndefined();
    expect(item.startsAt).toBeUndefined();
    expect(item.sortOrder).toBeUndefined();
    expect(item.updatedAt).toBeUndefined();
    expect(item.id).toBe(ROW.id);
  });
});

describe("노출 판정 (KST)", () => {
  it("until 당일 23:30 KST 는 활성, 다음 날 00:30 KST 는 비활성", () => {
    // 2026-11-15T14:30Z = 11/15 23:30 KST
    expect(isRecordVisible(RECORD, new Date("2026-11-15T14:30:00Z"))).toBe(true);
    // 2026-11-15T15:30Z = UTC 로는 15일이지만 KST 는 16일
    expect(isRecordVisible(RECORD, new Date("2026-11-15T15:30:00Z"))).toBe(false);
  });

  it("startsAt 이 null 이면 즉시, 값이 있으면 그날부터", () => {
    const scheduled = { ...RECORD, startsAt: "2026-10-01" };
    expect(isRecordVisible(scheduled, new Date("2026-09-30T14:30:00Z"))).toBe(false); // KST 9/30 23:30
    expect(isRecordVisible(scheduled, new Date("2026-09-30T15:30:00Z"))).toBe(true); // KST 10/1 00:30 — UTC 로는 아직 9/30
    expect(isRecordVisible(scheduled, new Date("2026-10-01T05:00:00Z"))).toBe(true);
    expect(isRecordVisible(RECORD, new Date("2026-01-01T00:00:00Z"))).toBe(true);
  });

  it("active false 면 기간 안이어도 노출하지 않는다", () => {
    expect(isRecordVisible({ ...RECORD, active: false }, new Date("2026-10-01T05:00:00Z"))).toBe(false);
  });

  it("kstDate 는 UTC 자정~오전 9시에도 한국 날짜를 준다", () => {
    expect(kstDate(new Date("2026-09-29T15:30:00Z"))).toBe("2026-09-30");
    expect(kstDate(new Date("2026-09-29T14:30:00Z"))).toBe("2026-09-29");
  });
});

describe("저장 입력 검증", () => {
  const base = {
    ...RECORD,
    tagline: "도시민의 재능과 주민의 삶",
    note: "센터에 문의해 보세요.",
  };

  it("정상 입력은 통과한다", () => {
    const r = validatePromoInput(base);
    expect(r.ok).toBe(true);
  });

  it("id 는 소문자 슬러그만", () => {
    for (const bad of ["Gafi-2026", "가피", "a", "x_y", "-lead"]) {
      const r = validatePromoInput({ ...base, id: bad });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.some((e) => e.field === "id")).toBe(true);
    }
  });

  it("until 은 startsAt 보다 앞설 수 없다", () => {
    const r = validatePromoInput({ ...base, startsAt: "2026-12-01", until: "2026-11-15" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.field === "until")).toBe(true);
  });

  it("href 는 https, 정보 행 링크는 https 또는 tel", () => {
    expect(validatePromoInput({ ...base, href: "http://x.kr" }).ok).toBe(false);
    expect(
      validatePromoInput({ ...base, facts: [{ label: "문의", value: "1800", href: "javascript:alert(1)" }] }).ok,
    ).toBe(false);
    expect(validatePromoInput({ ...base, facts: [{ label: "문의", value: "1800", href: "tel:1800" }] }).ok).toBe(
      true,
    );
  });

  it("facts 는 label·value 가 모두 있어야 한다", () => {
    const r = validatePromoInput({ ...base, facts: [{ label: "주최", value: "" }] as never });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0].field).toBe("facts[0]");
  });

  it("'~합니다/입니다' 카피는 400", () => {
    const r = validatePromoInput({ ...base, tagline: "도시민의 재능을 잇습니다" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.some((e) => e.field === "tagline")).toBe(true);

    const f = validatePromoInput({ ...base, facts: [{ label: "주최", value: "경기도입니다" }] });
    expect(f.ok).toBe(false);
  });

  it("빈 startsAt 은 null 로 정규화한다", () => {
    const r = validatePromoInput({ ...base, startsAt: "" as never });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.startsAt).toBeNull();
  });

  it("partial 모드는 들어온 필드만 본다", () => {
    const r = validatePromoInput({ active: false }, { partial: true });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value.active).toBe(false);
  });
});

describe("조회와 폴백", () => {
  it("행이 있으면 DB 결과를 화면 형태로 돌려준다", async () => {
    queryResult = { data: [ROW], error: null };
    const r = await fetchActivePromos(new Date("2026-10-01T00:00:00Z"));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data).toHaveLength(1);
      expect(r.data[0].id).toBe("gafi-masil-2026");
      expect((r.data[0] as unknown as Record<string, unknown>).active).toBeUndefined();
    }
  });

  it("테이블 미적용은 migration-pending", async () => {
    queryResult = { data: null, error: { message: 'relation "public.promo_popups" does not exist' } };
    const r = await fetchActivePromos();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("migration-pending");
  });

  it("그 외 오류는 db-error", async () => {
    queryResult = { data: null, error: { message: "timeout" } };
    const r = await listPromos();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("db-error");
  });

  it("Supabase 미설정은 no-supabase", async () => {
    adminClient = null;
    const r = await fetchActivePromos();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe("no-supabase");
  });

  it("loadActivePromos 는 실패해도 throw 하지 않고 정적으로 떨어지며 로그를 남긴다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    queryResult = { data: null, error: { message: "could not find the table" } };
    const now = new Date("2026-10-01T00:00:00Z");

    const items = await loadActivePromos(now);

    expect(items).toEqual(getActivePromos(now));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[promo] fallback: migration-pending"));
  });

  it("정상 조회면 폴백 로그가 없다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    queryResult = { data: [ROW], error: null };
    await loadActivePromos(new Date("2026-10-01T00:00:00Z"));
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("이미지 헤더 크기 읽기 (sharp 없을 때의 최소 경로)", () => {
  it("PNG IHDR 에서 폭·높이를 읽는다", () => {
    const buf = Buffer.alloc(24);
    buf[0] = 0x89;
    buf.write("PNG", 1, "ascii");
    buf.writeUInt32BE(600, 16);
    buf.writeUInt32BE(851, 20);
    expect(readImageSize(buf)).toEqual({ width: 600, height: 851 });
  });

  it("알 수 없는 바이트는 null", () => {
    expect(readImageSize(Buffer.from([1, 2, 3, 4]))).toBeNull();
  });
});
