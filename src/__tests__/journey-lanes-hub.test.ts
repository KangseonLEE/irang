import { describe, expect, it } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  buildLaneCompare,
  buildLaneHub,
  HUB_LANE_IDS,
  isHubLaneId,
  type HubLaneId,
} from "@/lib/data/journey-lanes-hub";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";
import {
  matchLanePrograms,
  parseCostRangeMan,
} from "@/lib/data/journey-lanes-stats";
import { PROGRAMS } from "@/lib/data/programs";
import { CROP_COSTS_BY_TYPE } from "@/lib/data/cost-by-type";
import { getProgramPersonaFit } from "@/lib/data/persona-fit";
import { deriveStatus, isUnannounced } from "@/lib/program-status";
import {
  LIST_PAGE_NORMALIZE_OPTIONS,
  normalizeSearchParams,
} from "@/lib/search-params/normalize";

const APP_DIR = join(process.cwd(), "src", "app");
const hubs = HUB_LANE_IDS.map((id) => buildLaneHub(id));

/**
 * "/regions/ranking" · "/interviews/lee-gyuho" 같은 경로가 실제 라우트인지 src/app 트리로 확인.
 * 정적 디렉토리가 없으면 그 자리의 동적 세그먼트([id]·[lane])를 찾는다.
 */
function routeExists(pathname: string): boolean {
  let dir = APP_DIR;
  for (const seg of pathname.split("/").filter(Boolean)) {
    const staticDir = join(dir, seg);
    if (existsSync(staticDir)) {
      dir = staticDir;
      continue;
    }
    const dynamic = readdirSync(dir, { withFileTypes: true }).find(
      (e) => e.isDirectory() && e.name.startsWith("[") && e.name.endsWith("]"),
    );
    if (!dynamic) return false;
    dir = join(dir, dynamic.name);
  }
  return existsSync(join(dir, "page.tsx")) || existsSync(join(dir, "page.ts"));
}

/**
 * `/start`·`/start/<lane>` 은 같은 스프린트에서 프론트가 만드는 새 화면이다.
 * 아직 없으면 경로 **모양**만 확인하고, 라우트가 생긴 뒤에는 실존 검사로 자동 승격된다.
 */
const START_ROUTE_LANDED = existsSync(join(APP_DIR, "start"));

function expectHrefUsable(href: string, where: string) {
  const [path, query] = href.split("?");
  if (path.startsWith("/start") && !START_ROUTE_LANDED) {
    expect(path, `${where} — /start 경로 모양`).toMatch(
      new RegExp(`^/start(/(${HUB_LANE_IDS.join("|")}))?$`),
    );
  } else {
    expect(routeExists(path), `${where} — ${path} 라우트 없음`).toBe(true);
  }
  // 딥링크는 normalize 화이트리스트 안에서만 산다 — 밖이면 middleware 가 308 로 떼어낸다(6/16 박제)
  const options = LIST_PAGE_NORMALIZE_OPTIONS[path];
  if (!options || !query) return;
  const result = normalizeSearchParams(new URLSearchParams(query), options);
  expect(result.changed, `${where} — ${href} 가 normalize 에서 변형됨`).toBe(false);
}

describe("여정 레인 허브 — 레인 식별자", () => {
  it("허브 5종은 히어로 레인에서 undecided 만 뺀 것이고, 순서도 같다", () => {
    const fromHero = JOURNEY_LANES.map((l) => l.id).filter((id) => id !== "undecided");
    expect(HUB_LANE_IDS).toEqual(fromHero);
    expect(HUB_LANE_IDS).toHaveLength(5);
  });

  it("isHubLaneId 는 undecided·오타를 거른다", () => {
    expect(isHubLaneId("guinong")).toBe(true);
    expect(isHubLaneId("undecided")).toBe(false);
    expect(isHubLaneId("smart-farm")).toBe(false);
  });
});

describe("여정 레인 허브 — 레인마다 볼 것이 있다", () => {
  it.each(HUB_LANE_IDS)("%s 허브가 지원사업·작물·인터뷰·타일을 채운다", (id) => {
    const hub = hubs.find((h) => h.id === id)!;
    expect(hub.programs.length, `${id} 지원사업`).toBeGreaterThanOrEqual(1);
    expect(hub.programs.length, `${id} 지원사업 상한`).toBeLessThanOrEqual(12);
    expect(hub.crops.length, `${id} 작물`).toBeGreaterThanOrEqual(3);
    expect(hub.crops.length, `${id} 작물 상한`).toBeLessThanOrEqual(6);
    expect(hub.interviews.length, `${id} 인터뷰`).toBeGreaterThanOrEqual(3);
    expect(hub.interviews.length, `${id} 인터뷰 상한`).toBeLessThanOrEqual(6);
    expect(hub.tiles, `${id} 타일`).toHaveLength(4);
    expect(hub.trendKey, `${id} 추이 키`).not.toBeNull();
  });

  it("타일 값에는 출처가 따라붙는다 (CLAUDE.md '데이터에는 근거')", () => {
    for (const hub of hubs) {
      for (const tile of hub.tiles) {
        expect(tile.source.length, `${hub.id} · ${tile.label}`).toBeGreaterThan(0);
        expect(tile.value, `${hub.id} · ${tile.label}`).not.toBe("");
      }
    }
  });

  it("귀촌만 비용 유형이 null 이다 (village 작물 비용 0건)", () => {
    for (const hub of hubs) {
      const expected = CROP_COSTS_BY_TYPE.village.length === 0 && hub.id === "guichon";
      expect(hub.costType === null, `${hub.id} costType`).toBe(expected);
    }
  });

  it("작물·인터뷰에 중복이 없다", () => {
    for (const hub of hubs) {
      expect(new Set(hub.crops.map((c) => c.id)).size).toBe(hub.crops.length);
      expect(new Set(hub.interviews.map((i) => i.id)).size).toBe(hub.interviews.length);
      expect(new Set(hub.programs.map((p) => p.id)).size).toBe(hub.programs.length);
    }
  });

  it("인터뷰 카드는 본문 동의자만 상세로, 나머지는 원문으로 보낸다", () => {
    for (const hub of hubs) {
      for (const iv of hub.interviews) {
        if (iv.external) expect(iv.href, iv.id).toMatch(/^https?:\/\//);
        else expect(iv.href, iv.id).toBe(`/interviews/${iv.id}`);
        expect(iv.quote.length, iv.id).toBeGreaterThan(0);
        expect(iv.region.length, iv.id).toBeGreaterThan(0);
      }
    }
  });
});

describe("여정 레인 허브 — 지원사업 순서", () => {
  it("접수 중 → 정기 접수 → 접수 예정 순으로 놓인다", () => {
    const rank = (p: (typeof PROGRAMS)[number]) => {
      if (isUnannounced(p.applicationStart, p.applicationEnd)) return 1;
      return deriveStatus(p.applicationStart, p.applicationEnd) === "모집중" ? 0 : 2;
    };
    for (const hub of hubs) {
      const ranks = hub.programs.map(rank);
      expect([...ranks].sort((a, b) => a - b), `${hub.id} 순서`).toEqual(ranks);
      // 마감은 한 건도 없어야 한다
      for (const p of hub.programs) {
        expect(deriveStatus(p.applicationStart, p.applicationEnd), p.id).not.toBe("마감");
      }
    }
  });

  it("목록과 타일 건수가 같은 규칙에서 나온다 (SSOT)", () => {
    for (const hub of hubs) {
      const matched = matchLanePrograms(PROGRAMS, hub.id);
      const tile = hub.tiles.find((t) => t.label === "지금 볼 수 있는 지원사업")!;
      expect(tile.value, hub.id).toBe(`${matched.length}건`);
      expect(hub.programs.length, hub.id).toBe(Math.min(matched.length, 12));
    }
  });
});

describe("여정 레인 허브 — 목적지", () => {
  it("허브 안의 모든 링크가 실존 라우트이고 normalize 를 통과한다", () => {
    for (const hub of hubs) {
      expectHrefUsable(hub.programsHref, `${hub.id} programsHref`);
      expectHrefUsable(hub.cropsHref, `${hub.id} cropsHref`);
      expectHrefUsable(hub.interviewsHref, `${hub.id} interviewsHref`);
      for (const step of hub.nextSteps) expectHrefUsable(step.href, `${hub.id} nextStep ${step.label}`);
      for (const iv of hub.interviews) {
        if (!iv.external) expectHrefUsable(iv.href, `${hub.id} 인터뷰 ${iv.id}`);
      }
    }
  });

  it("?persona= 값은 normalize 화이트리스트 5종 안에서만 쓴다", () => {
    const allowed = ["family", "farmYouth", "elderRural", "commuter", "balanced"];
    const hrefs = hubs.flatMap((h) => [
      h.programsHref,
      h.cropsHref,
      ...h.nextSteps.map((s) => s.href),
    ]);
    for (const href of hrefs) {
      const persona = new URLSearchParams(href.split("?")[1] ?? "").get("persona");
      if (persona) expect(allowed, href).toContain(persona);
    }
  });

  it("다음 걸음은 3~4개이고 진단 진입을 항상 포함한다", () => {
    for (const hub of hubs) {
      expect(hub.nextSteps.length, hub.id).toBeGreaterThanOrEqual(3);
      expect(hub.nextSteps.length, hub.id).toBeLessThanOrEqual(4);
      expect(hub.nextSteps.map((s) => s.href), hub.id).toContain("/match?mode=assess");
      for (const step of hub.nextSteps) {
        // copywriting.md — "~합니다/입니다" 금지
        expect(step.desc, `${hub.id} ${step.label}`).not.toMatch(/합니다|입니다/);
      }
    }
  });
});

describe("여정 레인 비교 화면 (/start)", () => {
  const rows = buildLaneCompare();

  it("5행 순서가 히어로 카드 순서(undecided 제외)와 같다", () => {
    expect(rows.map((r) => r.id)).toEqual(
      JOURNEY_LANES.map((l) => l.id).filter((id) => id !== "undecided"),
    );
  });

  it("각 행이 라벨·소개글·타일·대표 작물·허브 링크를 갖는다", () => {
    for (const row of rows) {
      const lane = JOURNEY_LANES.find((l) => l.id === row.id)!;
      expect(row.label).toBe(lane.label);
      expect(row.intro).toBe(lane.intro);
      expect(row.tiles).toHaveLength(4);
      expect(row.topCrops.length, row.id).toBeGreaterThanOrEqual(3);
      expect(row.href).toBe(`/start/${row.id}`);
      expectHrefUsable(row.href, `${row.id} 비교 행`);
    }
  });

  it("비교 타일은 허브 타일과 같은 값이다 (화면마다 다른 수를 말하지 않는다)", () => {
    for (const row of rows) {
      const hub = hubs.find((h) => h.id === row.id)!;
      expect(row.tiles.map((t) => t.value), row.id).toEqual(hub.tiles.map((t) => t.value));
    }
  });
});

describe("여정 레인 허브 — 하드코딩 금지 가드 (값은 전부 데이터 파생)", () => {
  /**
   * 손계산 ①: 귀농 지원사업 건수.
   * 허브 코드를 거치지 않고 PROGRAMS 에서 직접 세어 타일 문자열과 맞춘다.
   * (마감 제외 · 일자 미확정 9999 페어는 접수 시기 문구가 있을 때만 · 자녀 양육 가구 적합도 4+)
   */
  it("귀농 '지금 볼 수 있는 지원사업' 건수가 PROGRAMS 직접 집계와 일치한다", () => {
    const counted = PROGRAMS.filter((p) => {
      if (deriveStatus(p.applicationStart, p.applicationEnd) === "마감") return false;
      if (isUnannounced(p.applicationStart, p.applicationEnd) && !p.applicationCycle) return false;
      return getProgramPersonaFit(p).family >= 4;
    }).length;

    const hub = hubs.find((h) => h.id === "guinong")!;
    const tile = hub.tiles.find((t) => t.label === "지금 볼 수 있는 지원사업")!;
    expect(tile.value).toBe(`${counted}건`);
    expect(counted).toBeGreaterThan(0);
  });

  /**
   * 손계산 ②: 귀산촌 초기 투자금 평균.
   * 임업 비용 표 6종의 범위 중앙값 평균을 테스트에서 다시 계산해 타일 문자열과 맞춘다.
   */
  it("귀산촌 '초기 투자금 평균'이 임업 비용 표 평균과 일치한다", () => {
    const values = CROP_COSTS_BY_TYPE.forestry
      .map((c) => parseCostRangeMan(c.initialCost))
      .filter((v): v is number => v !== null);
    expect(values).toHaveLength(CROP_COSTS_BY_TYPE.forestry.length);
    const avgMan = values.reduce((a, b) => a + b, 0) / values.length;
    const expected =
      avgMan >= 10_000
        ? `${Math.round((avgMan / 10_000) * 10) / 10}억 원`
        : `${(Math.round(avgMan / 100) * 100).toLocaleString()}만 원`;

    const hub = hubs.find((h) => h.id === "forest")!;
    const tile = hub.tiles.find((t) => t.label === "초기 투자금 평균")!;
    expect(tile.value).toBe(expected);
  });

  it("스마트팜 대표 작물은 시설 비용 표 ∩ 작물 DB 에서만 나온다", () => {
    const costNames = new Set(
      CROP_COSTS_BY_TYPE.smartfarm.map((c) => c.name.replace(/\s*\(.*\)\s*$/, "").trim()),
    );
    const hub = hubs.find((h) => h.id === "smartfarm")!;
    for (const crop of hub.crops) expect(costNames, crop.name).toContain(crop.name);
  });

  it("레인 id 를 그대로 넘겨도 타입이 좁혀진다", () => {
    const raw: string = "forest";
    expect(isHubLaneId(raw)).toBe(true);
    const id: HubLaneId = raw as HubLaneId;
    expect(buildLaneHub(id).id).toBe("forest");
  });
});
