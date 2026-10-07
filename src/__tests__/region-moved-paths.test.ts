/**
 * 행정구역 개편으로 옮긴 지역 주소 — 옛 링크가 끊기지 않는다 (2026-10-07 A안)
 *
 * 보호 대상:
 *   1) next.config.ts redirects 의 /regions 이전 표 = region-reorganizations.ts MOVED_REGION_PATHS (한쪽만 고치면 실패)
 *   2) 옛 주소는 우리 지역 단위에 없고, 새 주소는 실재한다
 *   3) 공유된 비교 링크(?regions=incheon:jung-gu-incheon)가 조용히 빠지지 않고 새 자리로 간다
 *   4) 시·도 지도 = 그 시·도의 시·군·구 (군위가 경북·대구 두 지도에 있거나 신설 구가 빠지면 실패)
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { MOVED_REGION_PATHS } from "@/lib/data/region-reorganizations";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { PROVINCES } from "@/lib/data/regions";
import { parseRegions } from "@/app/regions/compare/region-item";

const exists = (path: string) => {
  const [sido, sigungu] = path.split("/");
  if (!PROVINCES.some((p) => p.id === sido)) return false;
  return !sigungu || SIGUNGUS.some((s) => s.id === sigungu && s.sidoId === sido);
};

describe("옛 지역 주소 → 새 주소", () => {
  it("next.config.ts redirects 가 MOVED_REGION_PATHS 와 같은 표다", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    const found: Record<string, string> = {};
    for (const m of config.matchAll(
      /source:\s*"\/regions\/([a-z-]+\/[a-z0-9-]+)\/:path\*",\s*destination:\s*"\/regions\/([a-z0-9/-]+?)(?:\/:path\*)?",\s*permanent:\s*true/g,
    )) {
      found[m[1]] = m[2];
    }
    expect(found).toEqual(MOVED_REGION_PATHS);
  });

  it("통째로 옮긴 곳은 하위 경로(stories 등)까지 넘기고, 나뉜 곳은 시·도 화면으로", () => {
    const config = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");
    for (const [from, to] of Object.entries(MOVED_REGION_PATHS)) {
      const keepsPath = to.includes("/");
      const line = config.split("\n").find((l) => l.includes(`"/regions/${from}/:path*"`))!;
      expect(line.includes(`"/regions/${to}/:path*"`), from).toBe(keepsPath);
    }
  });

  it("옛 주소는 지역 단위에 없고, 새 주소는 실재한다", () => {
    for (const [from, to] of Object.entries(MOVED_REGION_PATHS)) {
      expect(exists(from), from).toBe(false);
      expect(exists(to), to).toBe(true);
    }
  });

  it("공유된 비교 링크의 옛 id 는 새 자리로 바뀐다", () => {
    const items = parseRegions({ regions: "incheon:jung-gu-incheon,gyeongbuk:gunwi,incheon:dong-gu-incheon" });
    expect(items.map((r) => r.id)).toEqual(["incheon", "daegu:gunwi", "incheon:jemulpo"]);
    expect(items[1].label).toBe("대구 군위군");
  });
});

const MAPS = import.meta.glob(["../lib/data/province-maps/*.ts", "!../lib/data/province-maps/index.ts"], {
  eager: true,
}) as unknown as Record<
  string,
  { SIGUNGUS: { sigunguId: string }[] }
>;

describe("시·도 지도 = 그 시·도의 시·군·구", () => {
  for (const p of PROVINCES) {
    it(p.id, () => {
      const mod = MAPS[`../lib/data/province-maps/${p.id}.ts`];
      expect(mod, p.id).toBeDefined();
      const mapIds = mod.SIGUNGUS.map((s) => s.sigunguId).sort();
      const ours = SIGUNGUS.filter((s) => s.sidoId === p.id).map((s) => s.id).sort();
      expect(mapIds).toEqual(ours);
    });
  }
});

describe("통합검색 — 옛 이름으로 찾으면 새 지역 안내", () => {
  it("'인천 중구'·'인천중구'·'인천광역시 중구'는 제물포구·영종구, '인천 서구'는 서해구·검단구, '경북 군위'는 대구 군위군", async () => {
    const { searchAll } = await import("@/lib/data/search-index");
    const hints = (q: string) =>
      (searchAll(q) as unknown as { href: string; badge?: string }[]).filter((x) => x.badge === "안내").map((x) => x.href);
    for (const q of ["인천 중구", "인천중구", "인천광역시 중구"]) {
      expect(hints(q), q).toEqual(["/regions/incheon/jemulpo", "/regions/incheon/yeongjong"]);
    }
    expect(hints("인천 동구")).toEqual(["/regions/incheon/jemulpo"]);
    expect(hints("인천 서구")).toEqual(["/regions/incheon/seohae", "/regions/incheon/geomdan"]);
    expect(hints("경북 군위")).toEqual(["/regions/daegu/gunwi"]);
    expect(hints("경상북도 군위군")).toEqual(["/regions/daegu/gunwi"]);
    expect(hints("중구")).toEqual([]); // 시·도 없이 '중구'만 치면 여러 도시의 중구 — 안내하지 않는다
  });
});
