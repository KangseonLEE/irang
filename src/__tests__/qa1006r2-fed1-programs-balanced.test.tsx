/**
 * 10/6 전체 QA 2차 — FE-D1 (R2-Q4 ⚪4): `/programs?persona=balanced` 는 일반 목록처럼 보인다.
 *
 * 1차에 '기본 균등'은 점수로 거르지 않고 일반 정렬을 하도록 고쳤지만(list-order scoringProgramPersona), 화면은
 * 여전히 "맞춤 정렬 중 · 기본 균등 기준으로 정렬했어요" 배너를 띄우고 정렬 선택을 숨겼다 — 실제로는 마감순 목록인데.
 */
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", async () => {
  const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...actual,
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/programs",
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
  };
});

vi.mock("@/lib/data/loader", async () => {
  const actual = await vi.importActual<typeof import("@/lib/data/loader")>("@/lib/data/loader");
  return { ...actual, loadSyncMeta: vi.fn().mockResolvedValue(null) };
});

vi.mock("@/lib/data/programs", async () => {
  const actual = await vi.importActual<typeof import("@/lib/data/programs")>("@/lib/data/programs");
  return {
    ...actual,
    filterProgramsAsync: vi.fn(async () => ({ programs: [...actual.PROGRAMS], source: "fallback" as const })),
  };
});

const { default: ProgramsPage } = await import("@/app/programs/page");

async function render(persona?: string): Promise<string> {
  const searchParams = Promise.resolve(persona ? { persona } : {});
  return renderToStaticMarkup(await ProgramsPage({ searchParams }));
}

const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");

describe("/programs?persona=balanced", () => {
  it("'맞춤 정렬 중' 배너가 아니라 일반 목록의 진단 안내가 뜬다", async () => {
    const t = text(await render("balanced"));
    expect(t).not.toContain("맞춤 정렬 중");
    expect(t).not.toContain("기본 균등 기준");
    expect(t).toContain("2분 진단 시작");
  });

  it("정렬 선택이 보이고, 카드에 점수 설명 줄이 없다 — 일반 목록과 같은 화면", async () => {
    const balanced = await render("balanced");
    const plain = await render();
    expect(text(balanced)).toContain("마감 임박순");
    expect(balanced).not.toContain("추천 사유");
    // 카드 순서도 일반 목록과 같다
    const ids = (html: string) => [...html.matchAll(/href="\/programs\/(SP-\d+)"/g)].map((m) => m[1]);
    expect(ids(balanced)).toEqual(ids(plain));
  });

  it("점수로 고르는 페르소나는 그대로 맞춤 정렬 배너·점수 설명", async () => {
    const html = await render("farmYouth");
    expect(text(html)).toContain("맞춤 정렬 중");
    expect(text(html)).not.toContain("마감 임박순");
    expect(html).toContain("추천 사유");
  });
});
