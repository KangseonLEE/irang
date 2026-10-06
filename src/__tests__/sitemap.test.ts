import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 사이트맵 (2026-10-06 개편 — GSC 9월: 431개 중 422개 lastmod 가 배포 시각, /sitemap.xml 404,
 * 수집 행·가이드 2종·교육/치유농업·구 상세 누락, /assess(넘기기 전용) 포함).
 * DB 로더는 대역으로 바꾼다 — 수집 행 중 마감 안 된 것만 들어가는지 본다.
 */
vi.mock("@/lib/data/programs", async (orig) => {
  const actual = await orig<typeof import("@/lib/data/programs")>();
  const closedStatic = { ...actual.PROGRAMS[0], status: "마감" as const };
  return {
    ...actual,
    loadPrograms: async () => ({
      programs: [
        closedStatic, // 큐레이션 정적은 마감이어도 남는다
        { ...actual.PROGRAMS[1], id: "crawl-rda-programs-open", status: "모집중" as const },
        { ...actual.PROGRAMS[1], id: "crawl-rda-programs-closed", status: "마감" as const },
      ],
      source: "supabase" as const,
    }),
  };
});
vi.mock("@/lib/data/education", async (orig) => {
  const actual = await orig<typeof import("@/lib/data/education")>();
  return {
    ...actual,
    filterEducationAsync: async () => ({
      courses: [{ ...actual.EDUCATION_COURSES[0], id: "crawl-greendaero-education-open" }],
      source: "supabase" as const,
    }),
  };
});
vi.mock("@/lib/data/events", async (orig) => {
  const actual = await orig<typeof import("@/lib/data/events")>();
  return {
    ...actual,
    filterEventsAsync: async () => ({
      events: [{ ...actual.EVENTS[0], id: "crawl-greendaero-live-open" }],
      source: "supabase" as const,
    }),
  };
});

const { default: sitemap, generateSitemaps } = await import("@/app/sitemap");
const { GET: sitemapIndex } = await import("@/app/sitemap-index.xml/route");
const { PROGRAMS } = await import("@/lib/data/programs");
const { GUS } = await import("@/lib/data/gus");
const { SITEMAP_IDS } = await import("@/lib/seo/sitemap-ids");

const build = (id: string) => sitemap({ id: Promise.resolve(id) });
const paths = (entries: Awaited<ReturnType<typeof build>>) => entries.map((e) => e.url.replace("https://irangfarm.com", "") || "/");

describe("사이트맵 분할·목록", () => {
  it("generateSitemaps 는 공용 id 목록과 같다", async () => {
    expect((await generateSitemaps()).map((x) => x.id)).toEqual([...SITEMAP_IDS]);
  });

  it("/sitemap.xml 목록(sitemapindex)이 세 파일을 가리킨다", async () => {
    const res = sitemapIndex();
    expect(res.headers.get("content-type")).toContain("application/xml");
    const xml = await res.text();
    expect(xml).toContain("<sitemapindex");
    for (const id of SITEMAP_IDS) expect(xml).toContain(`<loc>https://irangfarm.com/sitemap/${id}.xml</loc>`);
  });

  it("next.config 가 /sitemap.xml 을 파일 라우팅 전에 목록으로 넘기고, robots 가 목록을 먼저 알린다", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    expect(config).toMatch(/beforeFiles:\s*\[\{\s*source:\s*"\/sitemap\.xml",\s*destination:\s*"\/sitemap-index\.xml"\s*\}\]/);
    const robots = readFileSync(join(process.cwd(), "src", "app", "robots.ts"), "utf8");
    expect(robots).toContain("`${BASE_URL}/sitemap.xml`");
  });
});

describe("core", () => {
  it("넘기기 전용 /assess 는 빼고, 빠져 있던 정적 페이지 3개는 넣는다", async () => {
    const p = paths(await build("core"));
    expect(p).not.toContain("/assess");
    expect(p).toContain("/match");
    for (const x of ["/education/therapy", "/guide/shelter", "/guide/track-compare"]) expect(p).toContain(x);
    expect(new Set(p).size).toBe(p.length);
  });

  it("lastmod 는 날짜를 아는 업데이트 소식·정정 이력에만", async () => {
    for (const e of await build("core")) {
      const isDated = /\/about\/(updates|corrections)/.test(e.url);
      expect(Boolean(e.lastModified), e.url).toBe(isDated);
    }
  });
});

describe("regions", () => {
  it("시·도 + 시·군·구 + 구(區) 상세, lastmod 없음", async () => {
    const entries = await build("regions");
    const p = paths(entries);
    for (const g of GUS) expect(p).toContain(`/regions/${g.sidoId}/${g.parentSigunguId}/${g.id}`);
    expect(entries.every((e) => !e.lastModified)).toBe(true);
    expect(new Set(p).size).toBe(p.length);
  });
});

describe("content", () => {
  it("큐레이션 정적 지원사업은 전부(마감 포함), 수집 행은 마감 안 된 것만", async () => {
    const p = paths(await build("content"));
    for (const prog of PROGRAMS) expect(p, prog.id).toContain(`/programs/${prog.id}`);
    expect(p).toContain("/programs/crawl-rda-programs-open");
    expect(p).not.toContain("/programs/crawl-rda-programs-closed");
  });

  it("수집 교육·체험(마감 안 된 것)이 들어가고 중복이 없다", async () => {
    const entries = await build("content");
    const p = paths(entries);
    expect(p).toContain("/education/crawl-greendaero-education-open");
    expect(p).toContain("/events/crawl-greendaero-live-open");
    expect(new Set(p).size).toBe(p.length);
    expect(entries.every((e) => !e.lastModified)).toBe(true);
  });
});
