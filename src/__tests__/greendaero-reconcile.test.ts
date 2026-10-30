/**
 * 그린대로 교육 수집 행 ↔ 원천 접수 상태 대조 (10/30).
 * 10/27~30 watchman §20 이 매일 잡아 SQL 로 고치던 실제 어긋남 5종을 그대로 고정한다
 * (b2f16d34·e944c1e4 날짜 변경 / 481af968 원천 마감 / 4f1d4304 조기 마감 / 0557e218 사라짐).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchGreendaeroSourceState,
  gdDetailIdOf,
  planGreendaeroReconcile,
  reconcileCap,
  type GdDbRow,
  type GdWindow,
} from "../../supabase/functions/_shared/greendaero";

const TODAY = "2026-10-30";
const YESTERDAY = "2026-10-29";
const url = (id: string) =>
  `https://www.greendaero.go.kr/svc/rfph/edc/offline/front/applicationDetail.do?seq1=EDUCRSE_1&seq2=${id}`;
const row = (
  table: GdDbRow["table"],
  id: string,
  start: string,
  end: string,
  linkStatus: string | null = "active",
): GdDbRow => ({ table, slug: `crawl-greendaero-education-${id}`, url: url(id), application_start: start, application_end: end, link_status: linkStatus });

const state = (open: Record<string, GdWindow>, closed: Record<string, GdWindow>) => ({
  open: new Map(Object.entries(open)),
  closed: new Map(Object.entries(closed)),
});

afterEach(() => vi.unstubAllGlobals());

describe("planGreendaeroReconcile — 원천 상태에 맞춰 바꿀 칸", () => {
  it("일치하는 행은 건드리지 않는다", () => {
    const rows = [row("education_courses", "A", "2026-10-01", "2026-11-05")];
    expect(planGreendaeroReconcile(rows, state({ A: { start: "2026-10-01", end: "2026-11-05" } }, {}), TODAY, YESTERDAY)).toEqual([]);
  });

  it("접수중 탭 날짜가 다르면 원천 날짜로 (e944c1e4 마감 연장 · b2f16d34 기간 이동)", () => {
    const rows = [
      row("education_courses", "E944", "2026-09-30", "2026-11-06"),
      row("education_courses", "B2F1", "2026-11-06", "2026-12-11"),
    ];
    const changes = planGreendaeroReconcile(
      rows,
      state({ E944: { start: "2026-09-30", end: "2026-11-09" }, B2F1: { start: "2026-10-16", end: "2026-10-30" } }, {}),
      TODAY,
      YESTERDAY,
    );
    expect(changes.map((c) => [c.slug.slice(-4), c.reason, c.patch])).toEqual([
      ["E944", "날짜 변경", { application_end: "2026-11-09" }],
      ["B2F1", "날짜 변경", { application_start: "2026-10-16", application_end: "2026-10-30" }],
    ]);
  });

  it("마감 탭에 있고 원천 마감일이 지났으면 그 날짜 (481af968 행사 11/4 → 10/28)", () => {
    const rows = [row("farm_events", "481A", "2026-10-09", "2026-11-04")];
    const [c] = planGreendaeroReconcile(rows, state({}, { "481A": { start: "2026-10-09", end: "2026-10-28" } }), TODAY, YESTERDAY);
    expect(c).toMatchObject({ table: "farm_events", reason: "원천 마감", patch: { application_end: "2026-10-28" } });
  });

  it("마감 탭에 있는데 원천 마감일이 아직이면 조기 마감 — 어제로 (4f1d4304 11/2)", () => {
    const rows = [row("education_courses", "4F1D", "2026-10-13", "2026-11-02")];
    const [c] = planGreendaeroReconcile(rows, state({}, { "4F1D": { start: "2026-10-13", end: "2026-11-02" } }), TODAY, YESTERDAY);
    expect(c).toMatchObject({ reason: "원천 조기 마감", patch: { application_end: YESTERDAY } });
  });

  it("마감 탭에 있고 원천 마감일이 오늘이면 아직 안 지난 것 — 어제로 (10/30 QA 🟡1 경계)", () => {
    const rows = [row("education_courses", "TDAY", "2026-10-01", TODAY)];
    const [c] = planGreendaeroReconcile(rows, state({}, { TDAY: { start: "2026-10-01", end: TODAY } }), TODAY, YESTERDAY);
    expect(c).toMatchObject({ reason: "원천 조기 마감", patch: { application_end: YESTERDAY } });
  });

  it("시작일 미상(9999)인 행은 화면에서 모집중이라 대조한다 — 원천에 없으면 broken (10/30 QA 🟡3)", () => {
    const rows = [row("education_courses", "UNK", "9999-12-31", "2026-11-20")];
    const [c] = planGreendaeroReconcile(rows, state({}, {}), TODAY, YESTERDAY);
    expect(c).toMatchObject({ reason: "원천에서 사라짐", patch: { link_status: "broken" } });
  });

  it("두 탭 어디에도 없으면 교육은 broken, 행사는 어제로 마감 (0557e218)", () => {
    const rows = [
      row("education_courses", "0557", "2026-10-20", "2026-11-15"),
      row("farm_events", "EVT1", "2026-10-20", "2026-11-15"),
    ];
    const changes = planGreendaeroReconcile(rows, state({}, {}), TODAY, YESTERDAY);
    expect(changes.map((c) => [c.table, c.reason, c.patch])).toEqual([
      ["education_courses", "원천에서 사라짐", { link_status: "broken" }],
      ["farm_events", "원천에서 사라짐", { application_end: YESTERDAY }],
    ]);
  });

  it("접수중 탭에 있는데 원천 마감일이 없으면 손대지 않는다 (G4)", () => {
    const rows = [row("education_courses", "NOEND", "2026-10-01", "2026-11-05")];
    expect(planGreendaeroReconcile(rows, state({ NOEND: { start: "2026-10-01" } }, {}), TODAY, YESTERDAY)).toEqual([]);
  });

  // ── 되돌림(2차 QA R1): 원천이 다시 열거나 늘린 과정 ──
  it("어제로 닫아 둔 행이 접수중 탭에 다시 있으면 원천 날짜로 되돌린다 (c0bd5148·a5488c12)", () => {
    const rows = [row("education_courses", "C0BD", "2026-09-28", "2026-10-25")];
    const [c] = planGreendaeroReconcile(rows, state({ C0BD: { start: "2026-09-28", end: "2026-11-01" } }, {}), TODAY, YESTERDAY);
    expect(c).toMatchObject({ reason: "원천 재개", patch: { application_end: "2026-11-01" } });
  });

  it("broken 으로 숨긴 교육이 접수중 탭에 다시 있으면 active 로 되돌린다", () => {
    const rows = [row("education_courses", "BRK", "2026-10-01", "2026-11-15", "broken")];
    const [c] = planGreendaeroReconcile(rows, state({ BRK: { start: "2026-10-01", end: "2026-11-15" } }, {}), TODAY, YESTERDAY);
    expect(c).toMatchObject({ reason: "원천 재개", patch: { link_status: "active" } });
    expect(c.patch.application_end).toBeUndefined(); // 날짜는 같으니 그대로
  });

  it("어제로 닫은 행사가 접수중 탭에 다시 있으면 원천 마감일로 되돌린다", () => {
    const rows = [{ ...row("farm_events", "EV", "2026-10-09", YESTERDAY), link_status: undefined }];
    const [c] = planGreendaeroReconcile(rows, state({ EV: { start: "2026-10-09", end: "2026-11-04" } }, {}), TODAY, YESTERDAY);
    expect(c).toMatchObject({ table: "farm_events", reason: "원천 재개", patch: { application_end: "2026-11-04" } });
  });

  it("이미 마감·숨김인 행이 두 탭 어디에도 없으면 아무것도 하지 않는다 — 마감 쪽으로는 더 갈 데가 없다", () => {
    const rows = [
      row("education_courses", "OLD", "2026-09-01", "2026-10-20"),
      row("education_courses", "BRK2", "2026-10-01", "2026-11-15", "broken"),
    ];
    expect(planGreendaeroReconcile(rows, state({}, { OLD: { start: "2026-09-01", end: "2026-10-20" } }), TODAY, YESTERDAY)).toEqual([]);
  });

  it("접수 시작 전 행은 접수중 탭에 없어도 건드리지 않는다", () => {
    const rows = [row("education_courses", "SOON", "2026-11-10", "2026-11-20")];
    expect(planGreendaeroReconcile(rows, state({}, {}), TODAY, YESTERDAY)).toEqual([]);
  });

  it("seq2 는 퍼센트 인코딩을 풀고, 깨진 인코딩은 원문 그대로 쓴다 (G5·Y3a)", () => {
    expect(gdDetailIdOf("https://x/y.do?seq1=A&seq2=EDUDCRSE%5F1")).toBe("EDUDCRSE_1");
    expect(gdDetailIdOf("https://x/y.do?seq2=%E0%A4%A")).toBe("%E0%A4%A");
    expect(gdDetailIdOf("https://x/y.do?seq2=ABC#frag")).toBe("ABC");
  });

  it("한도: 30% 에 최소 3 — 작은 대상에서도 전부 바꾸는 건 막는다 (Y4)", () => {
    expect([0, 1, 9, 10, 33, 40, 103].map(reconcileCap)).toEqual([3, 3, 3, 3, 10, 12, 31]);
  });

  it("원문 주소에 seq2 가 없으면 대조하지 않는다", () => {
    expect(gdDetailIdOf("https://www.greendaero.go.kr/svc/rfph/edc/live/front/apply/list.do")).toBeNull();
    const rows: GdDbRow[] = [{ ...row("farm_events", "X", "2026-10-01", "2026-11-01"), url: null }];
    expect(planGreendaeroReconcile(rows, state({}, {}), TODAY, YESTERDAY)).toEqual([]);
  });
});

describe("fetchGreendaeroSourceState — 덜 읽은 원천으로 판정하지 않는다", () => {
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
  const item = (id: string, end: string) => ({ eduDetailCrseId: id, eduRcrtBgngDt: "2026-10-01", eduRcrtEndDt: end });

  it("두 탭을 읽어 접수중 전부 + 마감 1쪽을 돌려준다", async () => {
    const fetchMock = vi.fn(async (u: string) =>
      u.includes("ddlnYn=N")
        ? json({ page: 1, itemsPerPage: 200, totalItems: 1, list: [item("A", "2026-11-05")] })
        : json({ page: 1, itemsPerPage: 200, totalItems: 2, list: [item("B", "2026-11-02"), item("C", "2026-09-10")] }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const s = await fetchGreendaeroSourceState();
    expect(s.errors).toEqual([]);
    expect([...s.open.keys()]).toEqual(["A"]);
    expect([...s.closed.keys()]).toEqual(["B", "C"]);
    expect(s.closedFloor).toBe("2026-09-10");
  });

  it("접수중 탭이 여러 쪽이면 끝까지 읽는다 (G6)", async () => {
    const page1 = Array.from({ length: 3 }, (_, i) => item(`P${i}`, "2026-11-05"));
    vi.stubGlobal("fetch", vi.fn(async (u: string) => {
      if (!u.includes("ddlnYn=N")) return json({ list: [item("B", "2026-11-02")] });
      return u.includes("page=1")
        ? json({ page: 1, itemsPerPage: 3, totalItems: 4, list: page1 })
        : json({ page: 2, itemsPerPage: 3, totalItems: 4, list: [item("P3", "2026-11-06")] });
    }));
    const s = await fetchGreendaeroSourceState(3);
    expect(s.errors).toEqual([]);
    expect([...s.open.keys()]).toEqual(["P0", "P1", "P2", "P3"]);
  });

  it("마감 탭에 같은 회차가 두 번이면 마감일이 늦은 쪽, 마감일 없는 행은 정렬 검사에서 뺀다 (G9·Y3b)", async () => {
    vi.stubGlobal("fetch", vi.fn(async (u: string) =>
      u.includes("ddlnYn=N")
        ? json({ page: 1, itemsPerPage: 200, totalItems: 1, list: [item("A", "2026-11-05")] })
        : json({ list: [{ eduDetailCrseId: "N", eduRcrtBgngDt: "2026-10-01", eduRcrtEndDt: null }, item("D", "2026-10-28"), item("D", "2026-10-20"), item("C", "2026-09-10")] }),
    ));
    const s = await fetchGreendaeroSourceState();
    expect(s.errors).toEqual([]);
    expect(s.closed.get("D")?.end).toBe("2026-10-28");
    expect(s.closedFloor).toBe("2026-09-10");
  });

  it("접수중 탭 totalItems 가 해석 불가면 오류 (Y3c)", async () => {
    vi.stubGlobal("fetch", vi.fn(async (u: string) =>
      u.includes("ddlnYn=N")
        ? json({ page: 1, itemsPerPage: 200, totalItems: "abc", list: [item("A", "2026-11-05")] })
        : json({ list: [item("B", "2026-11-02")] }),
    ));
    expect((await fetchGreendaeroSourceState()).errors[0]).toMatch(/totalItems 해석 불가/);
  });

  it("접수중 탭이 0건이면 오류 — 빈 원천을 믿으면 전부 '사라짐'이 된다 (10/30 QA 🟡4)", async () => {
    vi.stubGlobal("fetch", vi.fn(async (u: string) =>
      u.includes("ddlnYn=N")
        ? json({ page: 1, itemsPerPage: 200, totalItems: 0, list: [] })
        : json({ list: [item("B", "2026-11-02")] }),
    ));
    expect((await fetchGreendaeroSourceState()).errors).toContain("그린대로 접수중 탭: 0건 — 원천 이상 의심(대조 안 함)");
  });

  it("접수중 탭이 총건수보다 적으면 오류", async () => {
    vi.stubGlobal("fetch", vi.fn(async (u: string) =>
      u.includes("ddlnYn=N")
        ? json({ page: 1, itemsPerPage: 200, totalItems: 5, list: [item("A", "2026-11-05")] })
        : json({ list: [item("B", "2026-11-02")] }),
    ));
    expect((await fetchGreendaeroSourceState()).errors[0]).toMatch(/totalItems 5인데 1건만/);
  });

  it("마감 탭이 마감일 내림차순이 아니면 오류 — '최근 마감분이 1쪽에 다 있다'가 깨진다", async () => {
    vi.stubGlobal("fetch", vi.fn(async (u: string) =>
      u.includes("ddlnYn=N")
        ? json({ page: 1, itemsPerPage: 200, totalItems: 1, list: [item("A", "2026-11-05")] })
        : json({ list: [item("C", "2026-09-10"), item("B", "2026-11-02")] }),
    ));
    expect((await fetchGreendaeroSourceState()).errors).toContain("그린대로 마감 탭: 마감일 내림차순이 아님 — 정렬 변경 의심");
  });
});
