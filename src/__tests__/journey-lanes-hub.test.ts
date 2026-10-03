import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
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

describe("여정 레인 허브 — 비용 카드·차트·교육·체험 (10/2)", () => {
  it("비용 카드 작물 id 는 실재 작물이고 일러스트가 있다 (없는 표기는 null)", async () => {
    const { CROPS } = await import("@/lib/data/crops");
    const { hasCropIllustration } = await import("@/lib/crop-image");
    const ids = new Set(CROPS.map((c) => c.id));
    for (const hub of hubs) {
      for (const c of hub.costCards) {
        if (c.cropId === null) continue;
        expect(ids.has(c.cropId), `${hub.id} ${c.name}`).toBe(true);
        expect(hasCropIllustration(c.cropId), `${hub.id} ${c.name} 일러스트`).toBe(true);
      }
    }
    // 산양삼은 작물 DB 에 없다 — 부분 일치로 다른 작물이 붙지 않아야 한다
    const forest = hubs.find((h) => h.id === "forest")!;
    expect(forest.costCards.find((c) => c.name === "산양삼")?.cropId).toBeNull();
  });

  it("비용 카드 수는 비용 표 행 수와 같다 (귀촌은 0)", () => {
    for (const hub of hubs) {
      const rows = hub.costType ? CROP_COSTS_BY_TYPE[hub.costType].length : 0;
      expect(hub.costCards.length, hub.id).toBe(rows);
    }
  });

  it("차트 시계열은 연도 오름차순·양수이고, 지표에 출처가 붙는다", () => {
    for (const hub of hubs) {
      const { points, indicators, source } = hub.trend;
      expect(points.length, hub.id).toBeGreaterThanOrEqual(5);
      for (let i = 1; i < points.length; i += 1) expect(points[i].year).toBeGreaterThan(points[i - 1].year);
      for (const p of points) expect(p.value).toBeGreaterThan(0);
      expect(source.length).toBeGreaterThan(0);
      expect(indicators.length).toBeGreaterThanOrEqual(1);
      for (const ind of indicators) {
        if (ind.kind === "gauge") {
          expect(ind.pct).toBeGreaterThan(0);
          expect(ind.pct).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("교육·체험 매칭은 마감을 빼고, 레인 규칙으로만 고른다", async () => {
    const { matchLaneEducation, matchLaneEvents } = await import("@/lib/data/journey-lanes-hub");
    const course = (title: string, status: "모집중" | "마감" = "모집중") =>
      ({ id: title, title, status, description: "", applicationEnd: "2026-12-31" }) as never;
    const event = (title: string, villageType?: string) =>
      ({ id: title, title, status: "접수중", villageType, date: "2026-10-01" }) as never;

    const courses = [
      course("예비귀농인 소득작물 재배"),
      course("예비귀촌인 가드닝 방법"),
      course("스마트팜의 이해와 도입"),
      course("목본류·산채류 재배"),
      course("청년창업농 교육농장 설계"),
      course("귀농 기초 과정", "마감"),
    ];
    const titles = (id: HubLaneId) => matchLaneEducation(courses, id).map((c) => c.title);
    expect(titles("guinong")).toContain("예비귀농인 소득작물 재배");
    expect(titles("guinong")).not.toContain("예비귀촌인 가드닝 방법");
    expect(titles("guinong")).not.toContain("귀농 기초 과정");
    expect(titles("guichon")).toEqual(["예비귀촌인 가드닝 방법"]);
    expect(titles("smartfarm")).toEqual(["스마트팜의 이해와 도입"]);
    expect(titles("forest")).toEqual(["목본류·산채류 재배"]);
    expect(titles("youth")).toEqual(["청년창업농 교육농장 설계"]);

    const events = [
      event("대실마을 농촌에서 살아보기 (귀농형)", "귀농형"),
      event("율곡마을 농촌에서 살아보기 (귀촌형)", "귀촌형"),
      event("춘천 귀농귀촌 팸투어_시설원예"),
      event("춘천 귀농귀촌 팸투어_시설원예"),
    ];
    const ev = (id: HubLaneId) => matchLaneEvents(events, id).map((e) => e.title);
    expect(ev("guinong")).toEqual(["대실마을 농촌에서 살아보기 (귀농형)", "춘천 귀농귀촌 팸투어_시설원예"]);
    expect(ev("guichon")).toEqual(["율곡마을 농촌에서 살아보기 (귀촌형)", "춘천 귀농귀촌 팸투어_시설원예"]);
    expect(ev("smartfarm")).toEqual(["춘천 귀농귀촌 팸투어_시설원예"]);
  });

  it("함께 보면 좋아요 카드는 아이콘을 갖고 '단계' 표현을 쓰지 않는다", () => {
    for (const hub of hubs) {
      for (const step of hub.nextSteps) {
        expect(["map", "wallet", "trend", "compass"]).toContain(step.icon);
        expect(`${step.label} ${step.desc}`, hub.id).not.toMatch(/단계|다음 걸음/);
      }
    }
  });
});

describe("여정 레인 허브 — 건수·원천·출처 (10/3 QA)", () => {
  it("탭 배지 건수(programsTotal) = 타일 'N건' = 규칙 전체, 목록은 상한까지", async () => {
    const { MAX_PROGRAMS } = await import("@/lib/data/journey-lanes-hub");
    for (const hub of hubs) {
      const matched = matchLanePrograms(PROGRAMS, hub.id);
      const tile = hub.tiles.find((t) => t.label === "지금 볼 수 있는 지원사업")!;
      expect(hub.programsTotal, hub.id).toBe(matched.length);
      expect(tile.value, hub.id).toBe(`${hub.programsTotal}건`);
      expect(hub.programs.length, hub.id).toBe(Math.min(hub.programsTotal, MAX_PROGRAMS));
    }
    // 귀농은 상한(12)을 넘는다 — 배지가 목록 길이를 쓰면 "32건" 옆에 "12"가 뜨던 사례
    const guinong = hubs.find((h) => h.id === "guinong")!;
    expect(guinong.programsTotal).toBeGreaterThan(guinong.programs.length);
  });

  it("교육·체험 매칭은 상한 없이 전부 돌려준다 — 배지는 전체, 목록은 페이지가 자른다", async () => {
    const { matchLaneEducation, matchLaneEvents, MAX_OPPORTUNITIES } = await import("@/lib/data/journey-lanes-hub");
    const n = MAX_OPPORTUNITIES + 9;
    const courses = Array.from(
      { length: n },
      (_, i) => ({ id: `c${i}`, title: `예비귀농인 재배 실습 ${i}`, status: "모집중", description: "", applicationEnd: "2026-12-31" }) as never,
    );
    const events = Array.from(
      { length: n },
      (_, i) => ({ id: `e${i}`, title: `귀농 살아보기 ${i}`, status: "접수중", villageType: "귀농형", date: "2026-10-01" }) as never,
    );
    expect(matchLaneEducation(courses, "guinong")).toHaveLength(n);
    expect(matchLaneEvents(events, "guinong")).toHaveLength(n);
  });

  it("DB 전용 활성 사업도 허브·비교 화면에 들어간다 (loadPrograms 원천)", () => {
    const dbOnly = {
      ...PROGRAMS[0],
      id: "crawl-rda-programs-test",
      title: "2027년 청년창업 스마트팜 지원사업",
      summary: "스마트팜 청년 창업 지원",
      applicationStart: "2026-01-01",
      applicationEnd: "2099-12-31",
      applicationCycle: undefined,
      linkStatus: undefined,
    };
    const hub = buildLaneHub("smartfarm", [...PROGRAMS, dbOnly]);
    expect(hub.programs.map((p) => p.id)).toContain(dbOnly.id);
    const base = buildLaneHub("smartfarm");
    expect(hub.programsTotal).toBe(base.programsTotal + 1);
    const row = buildLaneCompare([...PROGRAMS, dbOnly]).find((r) => r.id === "smartfarm")!;
    expect(row.tiles[0].value).toBe(`${hub.programsTotal}건`);
  });

  it("원문 링크가 깨진 DB 행은 '지금 볼 수 있는' 에서 뺀다 (/programs 목록과 같은 기준)", () => {
    const broken = {
      ...PROGRAMS[0],
      id: "crawl-broken",
      title: "스마트팜 깨진 링크 사업",
      applicationStart: "2026-01-01",
      applicationEnd: "2099-12-31",
      linkStatus: "broken" as const,
    };
    expect(matchLanePrograms([...PROGRAMS, broken], "smartfarm").map((p) => p.id)).not.toContain("crawl-broken");
  });

  it("출처 줄에 같은 조사가 두 번 나오지 않는다 (연도·괄호 표기만 다른 것)", async () => {
    const { joinSources } = await import("@/lib/data/journey-lanes-hub");
    expect(
      joinSources("통계청 · 농림축산식품부 2025 귀농귀촌 실태조사", "농림축산식품부 귀농귀촌 실태조사 (2024)"),
    ).toBe("통계청 · 농림축산식품부 2025 귀농귀촌 실태조사");
    // 조사명 안의 가운뎃점("귀농·귀촌")은 자르지 않는다
    expect(joinSources("농림축산식품부, 2023 귀농·귀촌 실태조사")).toBe("농림축산식품부, 2023 귀농·귀촌 실태조사");
    for (const hub of hubs) {
      const keys = hub.trend.source
        .split(" · ")
        .map((part) => part.replace(/\([^)]*\)|\d{4}년?|[\s·]/g, ""));
      expect(new Set(keys).size, `${hub.id}: ${hub.trend.source}`).toBe(keys.length);
    }
  });

  it("유형 수 문구는 배열 길이에서 만든다 (kindsLabel)", async () => {
    const { kindsLabel, START_LANES } = await import("@/lib/data/journey-lanes");
    expect(kindsLabel(5)).toBe("다섯 가지");
    expect(kindsLabel(1)).toBe("한 가지");
    expect(kindsLabel(10)).toBe("열 가지");
    expect(kindsLabel(12)).toBe("12 가지");
    const undecided = JOURNEY_LANES.find((l) => l.id === "undecided")!;
    expect(undecided.desc).toBe(`${kindsLabel(START_LANES.length)} 시작 비교`);
  });

  it("레인 데이터 모듈은 파일 시스템을 읽지 않는다 — 서버 번들이 public/ 전체를 추적하던 원인 (10/3)", () => {
    const dir = join(process.cwd(), "src", "lib", "data");
    for (const file of readdirSync(dir).filter((f) => f.startsWith("journey-lanes"))) {
      // 주석은 빼고 본다(이 사고를 설명하는 주석이 있다)
      const code = readFileSync(join(dir, file), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      expect(code, file).not.toMatch(/from\s+["'](node:)?fs["']|existsSync|readFileSync|process\.cwd\(\)/);
    }
  });
});
