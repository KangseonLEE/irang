import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupportProgram } from "@/lib/data/programs";

/**
 * `/start` 는 `/programs` 와 같은 로더(loadPrograms: DB 우선 + 정적 병합)를 쓴다(10/3).
 * 테스트는 네트워크 없이 — 로더를 정적 데이터 + DB 전용 행 1건으로 고정한다.
 */
const DB_ONLY_SMARTFARM: SupportProgram = {
  id: "crawl-rda-programs-test-smartfarm",
  title: "2027년 청년창업 스마트팜 지원사업",
  summary: "스마트팜 청년 창업 시설 지원",
  region: "전국",
  organization: "농촌진흥청",
  supportType: "보조금",
  supportAmount: "상세 공고 참조",
  eligibilityAgeMin: 18,
  eligibilityAgeMax: 39,
  eligibilityDetail: "공고문 참조",
  applicationStart: "2026-01-01",
  applicationEnd: "2099-12-31",
  status: "모집중",
  relatedCrops: [],
  sourceUrl: "https://example.com/smartfarm",
  year: 2026,
};

vi.mock("@/lib/data/programs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/programs")>();
  return {
    ...actual,
    loadPrograms: vi.fn(async () => ({
      programs: [...actual.PROGRAMS, DB_ONLY_SMARTFARM],
      source: "supabase" as const,
    })),
  };
});

const { default: StartComparePage, metadata, revalidate } = await import("@/app/start/page");
const { buildLaneCompare } = await import("@/lib/data/journey-lanes-hub");
const { PROGRAMS } = await import("@/lib/data/programs");
const { START_LANES } = await import("@/lib/data/journey-lanes");

/**
 * 비교 표의 행 라벨은 **레인 값과 무관하게 고정**이어야 한다 (9/29 S7-2).
 * 첫 열(귀농) 타일의 label 을 행 라벨로 쓰면 "2024년 귀농 인구" 행에 귀촌 인구·귀산촌 가구가
 * 나란히 오고, "초기 투자금 평균" 행에 귀촌의 "비교할 시·군·구"가 들어온다.
 */
describe("/start 비교 표 — 행 라벨 고정 (9/29 S7-2)", () => {
  let html = "";
  const rows = buildLaneCompare([...PROGRAMS, DB_ONLY_SMARTFARM]);

  beforeAll(async () => {
    html = renderToStaticMarkup(await StartComparePage());
  });

  it("행 라벨 4개가 일반 명칭으로 고정된다", () => {
    for (const label of ["지금 볼 수 있는 지원사업", "진입 난이도", "최근 추세", "규모 · 초기 투자금"]) {
      expect(html).toContain(`>${label}</th>`);
    }
  });

  it("레인마다 다른 지표명이 행 라벨로 새지 않는다", () => {
    // 귀농 3·4번 타일의 label 은 귀농 전용 문구 — 행 헤더(<th>)로는 절대 나오면 안 된다
    const guinong = rows.find((r) => r.id === "guinong")!;
    for (const t of guinong.tiles.slice(2)) {
      expect(html).not.toContain(`>${t.label}</th>`);
    }
  });

  it("각 레인의 실제 지표명은 셀 안에 병기된다", () => {
    for (const row of rows) {
      for (const tile of row.tiles) {
        expect(html, `${row.id}/${tile.label}`).toContain(tile.label);
        expect(html, `${row.id}/${tile.value}`).toContain(tile.value);
      }
    }
  });

  it("레인 5종이 열과 카드 양쪽에 모두 링크로 남는다", () => {
    for (const row of rows) {
      expect(html.match(new RegExp(`href="/start/${row.id}"`, "g"))?.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("/start — 지원사업 원천·ISR·메타 (10/3 QA)", () => {
  let html = "";
  beforeAll(async () => {
    html = renderToStaticMarkup(await StartComparePage());
  });

  it("DB 전용 활성 사업이 건수에 들어간다 (정적 PROGRAMS 만 세지 않는다)", () => {
    const staticOnly = buildLaneCompare(PROGRAMS).find((r) => r.id === "smartfarm")!.tiles[0].value;
    const withDb = buildLaneCompare([...PROGRAMS, DB_ONLY_SMARTFARM]).find((r) => r.id === "smartfarm")!.tiles[0].value;
    expect(Number.parseInt(withDb, 10)).toBe(Number.parseInt(staticOnly, 10) + 1);
    // 화면은 로더 결과(DB 포함)로 그린다
    expect(html).toContain(`>${withDb}<`);
  });

  it("6시간 ISR — 날짜 집계가 배포 시점에 굳지 않는다", () => {
    expect(revalidate).toBe(21600);
  });

  it("유형 수·이름은 레인 배열에서 센다 (\"다섯 가지\" 하드코딩 금지)", () => {
    expect(START_LANES).toHaveLength(5);
    expect(html).toContain("다섯 가지 시작을 같은 기준으로");
    expect(String(metadata.description)).toContain(START_LANES.map((l) => l.label).join("·"));
  });

  it("공유 카드(og·twitter)가 이 화면 제목·설명을 쓰고, 사이트 OG 이미지를 잃지 않는다", () => {
    const og = metadata.openGraph as { title?: string; description?: string; images?: unknown[]; siteName?: string };
    expect(og.title).toContain("어떤 시작이 나에게 맞을까요?");
    expect(og.description).toBe(metadata.description);
    expect(og.siteName).toBe("이랑");
    expect(og.images?.length).toBe(1);
    expect((metadata.twitter as { title?: string }).title).toBe(og.title);
  });

  it("BreadcrumbList JSON-LD (이랑 → 정착 유형)", () => {
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain('"name":"정착 유형"');
  });

  it("소개글에 용어 툴팁(AutoGlossary)이 붙는다", () => {
    // 청년농 소개글의 "영농정착지원금" — TermTooltip 트리거(role=button)로 렌더
    expect(html).toMatch(/role="button"[^>]*>영농정착지원금</);
  });
});
