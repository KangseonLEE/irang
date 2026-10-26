/**
 * 시·군·구 귀농·귀촌 카드 = 정적 return-farm-stats.ts (2026-10-26 #184).
 *
 * 사고: 화면이 빌드·재생성 때 KOSIS 를 직접 불러, 10/26 운영 빌드에서 시간 초과(빌드 3초)로 12쪽 카드가 숨은 채 굳었다.
 * 규칙: 연 1회 공표 숫자는 수집 때 고정(T16) — 화면은 정적 파일만 읽고, 짝은 admCode + 이름.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RETURN_FARM_SIGUNGU, getReturnFarmStat } from "@/lib/data/return-farm-stats";
import { SIGUNGUS } from "@/lib/data/sigungus";

describe("정적 귀농·귀촌 카드 값", () => {
  // #184 에서 카드가 숨었던 곳 — KOSIS 2025 공표값(귀농인, 명). 원천과 다르면 재수집 문제
  const EXPECTED_2025: [string, number][] = [
    ["용인시", 70], ["화성시", 114], ["영월군", 69], ["보은군", 64], ["괴산군", 87],
    ["부여군", 112], ["청양군", 77], ["진안군", 69], ["무주군", 40], ["장수군", 66],
  ];
  for (const [name, person] of EXPECTED_2025) {
    it(`${name} 2025년 귀농 ${person}명`, () => {
      const sg = SIGUNGUS.find((s) => s.name === name)!;
      const r = getReturnFarmStat(sg.admCode, sg.name);
      expect(r).toMatchObject({ returnFarmPerson: person, year: 2025 });
    });
  }

  it("모든 행: 우리 시·군·구와 코드·이름이 맞고 세 값이 다 있다(0 으로 채운 행 없음)", () => {
    const latest = Math.max(...RETURN_FARM_SIGUNGU.map((r) => r.year));
    for (const r of RETURN_FARM_SIGUNGU) {
      const sg = SIGUNGUS.find((s) => s.admCode === r.admCode);
      expect(sg?.name, r.admCode).toBe(r.name);
      expect(r.returnFarmHousehold, r.name).toBeGreaterThan(0);
      expect(r.returnRuralPerson, r.name).toBeGreaterThan(0);
      // 최신 해 또는 비공개로 빠진 곳의 전년도만
      expect([latest, latest - 1], r.name).toContain(r.year);
    }
    expect(new Set(RETURN_FARM_SIGUNGU.map((r) => r.admCode)).size).toBe(RETURN_FARM_SIGUNGU.length);
  });

  it("표에 없는 자치구·이름이 다른 코드는 null(카드 숨김)", () => {
    expect(getReturnFarmStat("11010", "종로구")).toBeNull();
    const any = RETURN_FARM_SIGUNGU[0];
    expect(getReturnFarmStat(any.admCode, `${any.name}x`)).toBeNull();
  });
});

describe("화면은 KOSIS 귀농 표를 직접 부르지 않는다", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|jsx?)$/.test(f) ? [p] : [];
    });

  it("src/app·src/components 에 fetchReturnFarmStats* import 0건", () => {
    const hits = [...walk("src/app"), ...walk("src/components")].filter((f) =>
      /fetchReturnFarmStats(Strict|OfYear)?\b/.test(readFileSync(f, "utf-8")),
    );
    expect(hits).toEqual([]);
  });

  it("시·군·구·구 화면 데이터는 getReturnFarmStat 을 쓴다", () => {
    for (const f of ["src/app/regions/[id]/[sigungu]/sigungu-data.tsx", "src/app/regions/[id]/[sigungu]/[gu]/gu-data.tsx"]) {
      expect(readFileSync(f, "utf-8"), f).toMatch(/getReturnFarmStat\(sigungu\.admCode, sigungu\.name\)/);
    }
  });
});
