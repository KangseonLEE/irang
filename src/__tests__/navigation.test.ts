/**
 * 메뉴 SSOT 회귀 가드 (2026-09-06 GNB 5그룹 재편)
 *
 * 지키는 것:
 *   1. 재편 전 20개 진입점이 하나도 사라지지 않았다 (손실 0)
 *   2. href 중복 0 · basePath 중복 0
 *   3. 모든 href 가 실제 라우트로 존재한다 (죽은 링크 차단)
 *   4. deriveMorePaths 가 하단 탭이 담당하는 축을 빼고 파생한다
 *   5. prefix 가 겹치는 그룹에서 활성 그룹이 정확히 하나로 결정된다
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";
import {
  NAV_GROUPS,
  NAV_ITEMS,
  EXTRA_MORE_PATHS,
  deriveMorePaths,
  isNavItemActive,
  resolveActiveGroupId,
} from "@/lib/data/navigation";

/** 재편 전(2026-09-05) 헤더·/more 에 있던 진입점 20개 — 하나라도 빠지면 손실 */
const LEGACY_HREFS = [
  "/regions",
  "/regions/compare",
  "/regions/ranking",
  "/regions/centers",
  "/crops",
  "/crops/compare",
  "/guide",
  "/guides",
  "/guide/track-compare",
  "/guide/shelter",
  "/costs",
  "/interviews",
  "/programs",
  "/programs/roadmap",
  "/education",
  "/education/therapy",
  "/events",
  "/stats",
  "/glossary",
  "/about",
] as const;

const MOBILE_TAB_HREFS = ["/", "/regions", "/match", "/programs"];

describe("메뉴 SSOT — 구성", () => {
  it("여정형 5그룹", () => {
    expect(NAV_GROUPS.map((g) => g.id)).toEqual([
      "explore",
      "compare",
      "prepare",
      "apply",
      "reference",
    ]);
    expect(NAV_GROUPS.map((g) => g.label)).toEqual([
      "탐색",
      "비교·진단",
      "준비",
      "신청",
      "참고자료",
    ]);
  });

  it("기존 20개 진입점이 전부 남아 있다 (손실 0)", () => {
    const hrefs = new Set(NAV_ITEMS.map((item) => item.href));
    for (const legacy of LEGACY_HREFS) {
      expect(hrefs.has(legacy), `${legacy} 누락`).toBe(true);
    }
  });

  it("/match 를 더해 21개 — 항목 수 고정", () => {
    expect(NAV_ITEMS).toHaveLength(LEGACY_HREFS.length + 1);
    expect(NAV_ITEMS.some((item) => item.href === "/match")).toBe(true);
  });

  it("href 중복 0", () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("basePath 중복 0 (겹치면 활성 그룹이 흔들린다)", () => {
    const bases = NAV_GROUPS.flatMap((g) => g.basePaths);
    expect(new Set(bases).size).toBe(bases.length);
  });

  it("모든 항목이 라벨·설명·아이콘 이름을 갖는다", () => {
    for (const item of NAV_ITEMS) {
      expect(item.label.length, `${item.href} label`).toBeGreaterThan(0);
      expect(item.desc.length, `${item.href} desc`).toBeGreaterThan(0);
      expect(item.iconName.length, `${item.href} iconName`).toBeGreaterThan(0);
    }
  });

  it("모든 href 가 실제 라우트(page.tsx)로 존재한다", () => {
    const appDir = path.resolve(process.cwd(), "src/app");
    for (const href of [...NAV_ITEMS.map((i) => i.href), ...EXTRA_MORE_PATHS]) {
      const file = path.join(appDir, href, "page.tsx");
      expect(existsSync(file), `${href} → ${file} 없음`).toBe(true);
    }
  });

  it("모든 항목이 자기 그룹의 basePath 아래에 있다", () => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        expect(
          resolveActiveGroupId(item.href),
          `${item.href} 는 ${group.id} 그룹이어야 한다`,
        ).toBe(group.id);
      }
    }
  });
});

describe("resolveActiveGroupId — 겹치는 prefix 에서 그룹 1개만", () => {
  const cases: Array<[string, string | null]> = [
    ["/regions", "explore"],
    ["/regions/jeonnam", "explore"],
    ["/regions/jeonnam/suncheon", "explore"],
    ["/regions/centers", "explore"],
    ["/crops", "explore"],
    ["/crops/tomato", "explore"],
    ["/interviews", "explore"],
    ["/regions/compare", "compare"],
    ["/regions/ranking", "compare"],
    ["/crops/compare", "compare"],
    ["/guide/track-compare", "compare"],
    ["/match", "compare"],
    ["/assess", "compare"],
    ["/guide", "prepare"],
    ["/guide/shelter", "prepare"],
    ["/guides", "prepare"],
    ["/guides/fifties", "prepare"],
    ["/costs", "prepare"],
    ["/education/therapy", "prepare"],
    ["/education", "apply"],
    ["/programs", "apply"],
    ["/programs/roadmap", "apply"],
    ["/programs/SP-017", "apply"],
    ["/events", "apply"],
    ["/stats", "reference"],
    ["/glossary", "reference"],
    ["/about", "reference"],
    ["/about/updates", "reference"],
    ["/", null],
    ["/search", null],
    ["/more", null],
  ];

  for (const [pathname, expected] of cases) {
    it(`${pathname} → ${expected ?? "없음"}`, () => {
      expect(resolveActiveGroupId(pathname)).toBe(expected);
    });
  }

  it("어떤 경로에서도 활성 그룹은 최대 1개", () => {
    for (const [pathname] of cases) {
      const matched = NAV_GROUPS.filter((g) => g.id === resolveActiveGroupId(pathname));
      expect(matched.length, `${pathname} 활성 그룹 수`).toBeLessThanOrEqual(1);
    }
  });
});

describe("isNavItemActive — 그룹 경계 넘어 가장 구체적인 항목만", () => {
  it("/regions/compare 에서 /regions 는 비활성", () => {
    expect(isNavItemActive("/regions/compare", "/regions")).toBe(false);
    expect(isNavItemActive("/regions/compare", "/regions/compare")).toBe(true);
  });

  it("/education/therapy 에서 /education 은 비활성", () => {
    expect(isNavItemActive("/education/therapy", "/education")).toBe(false);
    expect(isNavItemActive("/education/therapy", "/education/therapy")).toBe(true);
  });

  it("/regions/jeonnam 에서는 /regions 만 활성", () => {
    expect(isNavItemActive("/regions/jeonnam", "/regions")).toBe(true);
    expect(isNavItemActive("/regions/jeonnam", "/regions/centers")).toBe(false);
  });

  it("/guides 는 /guide 를 활성화하지 않는다 (세그먼트 비교)", () => {
    expect(isNavItemActive("/guides", "/guide")).toBe(false);
    expect(isNavItemActive("/guides", "/guides")).toBe(true);
  });

  it("어떤 경로에서도 활성 항목은 최대 1개", () => {
    const paths = [
      "/regions",
      "/regions/compare",
      "/regions/ranking",
      "/regions/centers",
      "/regions/jeonnam/suncheon",
      "/crops",
      "/crops/compare",
      "/guide",
      "/guide/shelter",
      "/guide/track-compare",
      "/guides",
      "/education",
      "/education/therapy",
      "/programs",
      "/programs/roadmap",
      "/match",
      "/about/updates",
    ];
    for (const pathname of paths) {
      const active = NAV_ITEMS.filter((item) => isNavItemActive(pathname, item.href));
      expect(active.length, `${pathname} 활성 항목: ${active.map((a) => a.href).join(",")}`)
        .toBeLessThanOrEqual(1);
    }
  });
});

describe("deriveMorePaths — 하단 탭이 담당하는 축 제외", () => {
  const morePaths = deriveMorePaths(MOBILE_TAB_HREFS);

  it("탭 href 와 그 하위 경로는 포함하지 않는다", () => {
    for (const tab of MOBILE_TAB_HREFS) {
      expect(morePaths).not.toContain(tab);
    }
    expect(morePaths).not.toContain("/regions/compare");
    expect(morePaths).not.toContain("/programs/roadmap");
  });

  it("상위 경로에 흡수되는 하위 경로는 접힌다", () => {
    expect(morePaths).toContain("/guide");
    expect(morePaths).not.toContain("/guide/shelter");
    expect(morePaths).toContain("/education");
    expect(morePaths).not.toContain("/education/therapy");
  });

  it("GNB 밖 더보기 축(/more · /search · /assess)을 포함한다", () => {
    for (const extra of EXTRA_MORE_PATHS) {
      expect(morePaths).toContain(extra);
    }
  });

  it("재편 전 하드코딩 목록과 동일한 집합", () => {
    const legacyMorePaths = [
      "/more",
      "/assess",
      "/guide",
      "/guides",
      "/costs",
      "/crops",
      "/education",
      "/events",
      "/interviews",
      "/search",
      "/stats",
      "/glossary",
      "/about",
    ];
    expect([...morePaths].sort()).toEqual([...legacyMorePaths].sort());
  });

  it("홈('/') 은 정확히 일치할 때만 제외 대상이다", () => {
    expect(morePaths.length).toBeGreaterThan(0);
    expect(morePaths).not.toContain("/");
  });
});
