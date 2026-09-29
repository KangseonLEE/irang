import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { JourneyLanes } from "@/components/landing/journey-lanes";
import { JOURNEY_LANES } from "@/lib/data/journey-lanes";
import { resolveJourneyLanes } from "@/lib/data/journey-lanes-images";
import { buildLaneStats, parseCostRangeMan } from "@/lib/data/journey-lanes-stats";
import { normalizeSearchParams, LIST_PAGE_NORMALIZE_OPTIONS } from "@/lib/search-params/normalize";

const LANE_IDS = JOURNEY_LANES.map((l) => l.id);
const stats = buildLaneStats(LANE_IDS);

describe("히어로 여정 레인 6종 (9/29 S·S2)", () => {
  const html = renderToStaticMarkup(<JourneyLanes lanes={resolveJourneyLanes()} stats={stats} />);

  it("카드 6장이 전부 SSR <a> 로 남는다 (유입 61% Organic)", () => {
    expect(JOURNEY_LANES.length).toBe(6);
    const track = html.slice(html.indexOf("<ul"), html.indexOf("</ul>"));
    expect(track.match(/<a /g)?.length).toBe(6);
    for (const lane of JOURNEY_LANES) expect(track).toContain(`data-track="journey_lanes_pick:${lane.id}"`);
  });

  it("귀산촌·스마트팜을 포함한 6종 순서·이름이 유지된다", () => {
    expect(LANE_IDS).toEqual(["guinong", "guichon", "forest", "youth", "smartfarm", "undecided"]);
    // 9/29 S4 회장: "아직 시작 전" → 탐색 중(탐색하는 사람이라는 의미)
    expect(JOURNEY_LANES.map((l) => l.label)).toEqual([
      "귀농", "귀촌", "귀산촌", "청년농", "스마트팜", "탐색 중",
    ]);
  });

  it("레인마다 선택 화면 소개글(intro)이 있고 카피 톤을 지킨다", () => {
    for (const lane of JOURNEY_LANES) {
      expect(lane.intro.length, lane.id).toBeGreaterThan(60);
      expect(lane.intro, lane.id).not.toMatch(/합니다|입니다/); // copywriting.md
      expect(lane.intro, lane.id).not.toBe(lane.desc); // 카드 한 줄과 다른 글
    }
    // 카드 화면(초기 SSR)에는 소개글이 안 나온다 — 선택 화면 전용
    for (const lane of JOURNEY_LANES) expect(html).not.toContain(lane.intro);
  });

  it("난이도 타일은 '진입 난이도' 로 부른다 (재배가 아닌 길의 난이도)", () => {
    for (const id of LANE_IDS) {
      const labels = stats[id].map((t) => t.label);
      expect(labels, id).toContain("진입 난이도");
      expect(labels.join(" "), id).not.toContain("재배 난이도");
    }
  });

  it("href 6종이 그대로 SSR 되고, persona 값은 normalize 화이트리스트를 통과한다", () => {
    for (const lane of JOURNEY_LANES) {
      expect(html).toContain(`href="${lane.href}"`);
      const [path, query] = lane.href.split("?");
      const options = LIST_PAGE_NORMALIZE_OPTIONS[path];
      if (!options) continue; // 정규화 대상이 아닌 경로(/match·/search·/guide/*)는 미들웨어가 건드리지 않는다
      const result = normalizeSearchParams(new URLSearchParams(query ?? ""), options);
      expect(result.changed, `${lane.href} 가 normalize 에서 변형됨`).toBe(false);
    }
  });

  it("라우트가 실제로 존재한다", () => {
    for (const lane of JOURNEY_LANES) {
      const path = lane.href.split("?")[0];
      expect(existsSync(join(process.cwd(), "src", "app", path.slice(1), "page.tsx")), path).toBe(true);
    }
  });

  it("카드는 링크이자 공개 토글 — aria-expanded + aria-controls", () => {
    expect(html.match(/aria-expanded="false"/g)?.length).toBe(6);
    expect(html.match(/aria-controls="hero-lane-panel"/g)?.length).toBe(6);
  });

  it("선택 화면은 닫힌 채 SSR 된다 (hidden) — 히어로 높이를 밀지 않게", () => {
    expect(html).toMatch(/id="hero-lane-panel"[^>]*hidden/);
    // 선택 전에는 뒤로 버튼·큰 포스터·타일이 DOM 에 없다(카드 화면만)
    expect(html).not.toContain("뒤로");
    expect(html).not.toContain("탐색하기");
    // 초기 SSR 에는 이동 링크·이전/다음도 없다 — 카드 라벨(pick)만 나온다
    expect(html).not.toContain('data-track="journey_lanes:');
    expect(html).not.toContain("journey_lanes_nav:"); // 선택 화면 전용 (9/29 S5)
    expect(html).not.toContain("이전:");
    expect(html.match(/journey_lanes_pick:/g)?.length).toBe(6);
  });

  it("일러스트·캐릭터가 있으면 next/image 로, 없으면 안 그린다 (빌드·렌더 안 깨짐)", () => {
    for (const lane of resolveJourneyLanes()) {
      expect(lane.hasImage, lane.id).toBe(existsSync(join(process.cwd(), "public", lane.image)));
      expect(lane.hasChar, lane.id).toBe(existsSync(join(process.cwd(), "public", lane.charImage)));
      expect(html.includes(encodeURIComponent(lane.image)), lane.id).toBe(lane.hasImage);
    }
    const bare = renderToStaticMarkup(
      <JourneyLanes lanes={JOURNEY_LANES.map((l) => ({ ...l, hasImage: false, hasChar: false }))} stats={stats} />,
    );
    expect(bare).not.toContain("<img");
    expect(bare.match(/<a /g)?.length).toBe(6);
  });

  it("히어로 스와이프가 카드 제스처를 건너뛸 표식이 있다", () => {
    expect(html).toContain("data-hero-lanes");
  });

  it("출처 문구는 타일 폭 안에서 읽히도록 약칭으로 줄인다", () => {
    const sources = Object.values(stats).flatMap((tiles) => tiles.map((t) => t.source));
    expect(sources.some((s) => s.includes("농진청"))).toBe(true);
    for (const s of sources) {
      expect(s, s).not.toMatch(/농촌진흥청|농림축산식품부|행정안전부/);
      expect(s.length, s).toBeLessThanOrEqual(30);
    }
  });
});

describe("레인 데이터 타일 — 서버 계산 (9/29 S2)", () => {
  it("레인마다 타일 3~4개, 값·라벨·근거·출처가 모두 채워진다", () => {
    for (const id of LANE_IDS) {
      const tiles = stats[id];
      expect(tiles.length, id).toBeGreaterThanOrEqual(3);
      expect(tiles.length, id).toBeLessThanOrEqual(4);
      for (const t of tiles) {
        for (const k of ["value", "label", "source"] as const) {
          expect(t[k].length, `${id}.${k}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("지원사업 건수는 같은 산식을 다시 돌려도 일치하고, 마감 건은 빠진다", async () => {
    const { PROGRAMS } = await import("@/lib/data/programs");
    const { getProgramPersonaFit } = await import("@/lib/data/persona-fit");
    const { deriveStatus, isUnannounced } = await import("@/lib/program-status");
    const active = PROGRAMS.filter((p) => {
      if (deriveStatus(p.applicationStart, p.applicationEnd) === "마감") return false;
      if (isUnannounced(p.applicationStart, p.applicationEnd)) return Boolean(p.applicationCycle);
      return true;
    });
    const expected = active.filter((p) => getProgramPersonaFit(p)["family"] >= 4).length;
    expect(stats.guinong[0].value).toBe(`${expected}건`);
    expect(stats.undecided[0].value).toBe(`${active.length}건`);
    // 마감 건이 섞이면 전체 건수보다 커진다
    expect(active.length).toBeLessThan(PROGRAMS.length);
  });

  it("추세 타일은 stats.ts 의 최근 2년으로 계산된다", async () => {
    const { populationData, mountainData, smartfarmData } = await import("@/lib/data/stats");
    const yoy = (a: number, b: number) => `${((a / b - 1) * 100).toFixed(1)}`;
    const pop = populationData.slice(-2);
    const mtn = mountainData.slice(-2);
    const sf = smartfarmData.slice(-2);
    expect(stats.guinong[2].value).toBe(`+${yoy(pop[1].farming, pop[0].farming)}%`);
    expect(stats.guichon[2].value).toBe(`+${yoy(pop[1].rural, pop[0].rural)}%`);
    expect(stats.forest[2].value).toBe(`+${yoy(mtn[1].households, mtn[0].households)}%`);
    expect(stats.smartfarm[2].value).toBe(`+${yoy(sf[1].farms, sf[0].farms)}%`);
  });

  it("레인 판정은 제목·요약만 본다 — 오탐 2건 회귀 (9/29 QA)", async () => {
    const { PROGRAMS } = await import("@/lib/data/programs");
    const { deriveStatus, isUnannounced } = await import("@/lib/program-status");
    const active = PROGRAMS.filter((p) => {
      if (deriveStatus(p.applicationStart, p.applicationEnd) === "마감") return false;
      if (isUnannounced(p.applicationStart, p.applicationEnd)) return Boolean(p.applicationCycle);
      return true;
    });
    // 판정 규칙을 테스트가 다시 구현하지 않도록, 건수 대신 집합을 직접 재현한다
    const forest = active.filter(
      (p) => !/스마트\s?팜|ICT/.test(p.title) && (/산촌|임업|임산물|산림|산양삼/.test(`${p.title} ${p.summary}`) || /버섯|표고/.test(p.title)),
    );
    const smartfarm = active.filter(
      (p) => /스마트\s?팜|ICT/.test(p.title) || (/온실|시설원예/.test(`${p.title} ${p.summary}`) && !/노지/.test(p.summary)),
    );
    const ids = (list: typeof active) => list.map((p) => p.id);
    expect(ids(forest)).toContain("SP-057"); // 임산물생산단지
    expect(ids(forest)).not.toContain("SP-060"); // 스마트팜 에너지절감 — summary 의 "버섯" 오탐
    expect(ids(smartfarm)).not.toContain("SP-061"); // 전남 연작장해 — 제목 괄호 "시설원예" 오탐(실체 노지)
    expect(ids(forest).filter((id) => ids(smartfarm).includes(id))).toEqual([]); // 교집합 0
    // 타일 건수가 위 집합과 일치해야 규칙이 한 곳에만 있다
    expect(stats.forest[0].value).toBe(`${forest.length}건`);
    expect(stats.smartfarm[0].value).toBe(`${smartfarm.length}건`);
  });

  it("추세 출처는 해당 통계의 출처를 그대로 쓴다", async () => {
    const { youthSummary, mountainSummary } = await import("@/lib/data/stats");
    expect(stats.youth[2].source).toBe(youthSummary.source.replace(/농림축산식품부/, "농식품부"));
    expect(stats.forest[2].source).toBe(mountainSummary.source);
  });

  it("타일은 화면에 그리는 필드만 갖는다 — 안 쓰는 note 가 RSC 페이로드에 실리지 않게", () => {
    for (const tiles of Object.values(stats)) {
      for (const t of tiles) expect(Object.keys(t).sort()).toEqual(["label", "source", "value"]);
    }
  });

  it("초기 투자금 출처는 섞인 출처 수를 드러낸다", async () => {
    const { CROP_COSTS_BY_TYPE } = await import("@/lib/data/cost-by-type");
    const n = new Set(CROP_COSTS_BY_TYPE.youth.map((c) => c.source)).size;
    expect(n).toBeGreaterThan(1);
    expect(stats.youth[3].source).toContain(`외 ${n - 1}`);
    expect(stats.guinong[3].source).not.toContain("외 "); // farming 은 단일 출처
  });

  it("비용 범위 파서 — 만·억·콤바인 표기", () => {
    expect(parseCostRangeMan("300만~500만 원")).toBe(400);
    expect(parseCostRangeMan("5,000만~1억 원")).toBe(7500);
    expect(parseCostRangeMan("1.5억~2.5억 원")).toBe(20000);
    expect(parseCostRangeMan("1억 5,000만 원")).toBe(15000);
    expect(parseCostRangeMan("미정")).toBeNull();
  });

  it("초기 투자금 타일은 cost-by-type 평균과 일치하고, 데이터 없는 레인엔 안 뜬다", async () => {
    const { CROP_COSTS_BY_TYPE } = await import("@/lib/data/cost-by-type");
    const vals = CROP_COSTS_BY_TYPE.farming.map((c) => parseCostRangeMan(c.initialCost)!);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    expect(stats.guinong[3].value).toBe(`${(Math.round(avg / 100) * 100).toLocaleString()}만 원`);
    // village(귀촌)은 작물 비용 데이터가 0건 → 시·군·구 타일로 대체
    expect(CROP_COSTS_BY_TYPE.village.length).toBe(0);
    expect(stats.guichon[3].label).toBe("비교할 시·군·구");
  });
});
