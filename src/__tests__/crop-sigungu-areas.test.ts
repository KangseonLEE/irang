/**
 * 작물 '주요 산지 (시·군·구)' 칩 자료 계약 (2026-10-10)
 *
 * crop-sigungu-areas.ts 는 scripts/collect-crop-sigungu-areas.ts 가 2025 농림어업총조사 원천과 대조해 만든 생성본이다.
 * 이 테스트는 생성본이 설정(crop-sigungu-tables.ts)과 어긋나지 않는지, 시·군·구 짝이 실재하는지, 순서가 면적 순인지 본다.
 */
import { describe, it, expect } from "vitest";
import { CROP_SIGUNGU_AREAS, CROP_SIGUNGU_RESIDENCE_SKEW } from "@/lib/data/crop-sigungu-areas";
import { MAIN_CROPS_RESIDENCE_SKEW } from "@/lib/data/sigungu-main-crops";
import { CROP_SIGUNGU_TABLES } from "@/lib/data/crop-sigungu-tables";
import { CROPS } from "@/lib/data/crops";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { PROVINCES } from "@/lib/data/regions";

describe("작물 시·군·구 재배면적 (2025 농림어업총조사)", () => {
  it("설정의 작물 = 생성본의 작물, 전부 CROPS 에 있다", () => {
    expect(Object.keys(CROP_SIGUNGU_AREAS).sort()).toEqual(Object.keys(CROP_SIGUNGU_TABLES).sort());
    const cropIds = new Set(CROPS.map((c) => c.id));
    for (const id of Object.keys(CROP_SIGUNGU_TABLES)) expect(cropIds.has(id), id).toBe(true);
  });

  it("생성본 항목이 설정과 같은 표·항목이고 단위는 ha", () => {
    for (const [id, items] of Object.entries(CROP_SIGUNGU_TABLES)) {
      const a = CROP_SIGUNGU_AREAS[id];
      expect(a.items, id).toEqual(items.map((i) => `${i.tblId} ${i.itemName}`));
      expect(a.unit, id).toBe("ha");
      // 항목 이름이 그 작물의 면적이다(논벼 표는 '재배 면적' 하나)
      const name = CROPS.find((c) => c.id === id)!.name;
      for (const it of items) {
        if (id === "rice") continue;
        expect(it.itemName.endsWith("_면적"), `${id} ${it.itemName}`).toBe(true);
        const kosisAlias: Record<string, string[]> = {
          melon: ["참외"], tomato: ["토마토(일반)"], "cherry-tomato": ["토마토(방울)"], persimmon: ["단감", "떫은감"],
          grape: ["노지 포도", "시설 포도"], citrus: ["노지 감귤", "시설 감귤"],
        };
        const expected = kosisAlias[id] ?? [name];
        expect(expected.some((e) => it.itemName === `${e}_면적`), `${id} ${it.itemName}`).toBe(true);
      }
    }
  });

  it("같은 표·항목을 두 작물이 쓰지 않는다", () => {
    const keys = Object.values(CROP_SIGUNGU_TABLES).flat().map((i) => `${i.tblId}/${i.itmId}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("상위 시·군·구는 실재하고 면적 큰 순, 중복 없음", () => {
    const sgIds = new Set(SIGUNGUS.map((s) => s.id));
    for (const [id, a] of Object.entries(CROP_SIGUNGU_AREAS)) {
      expect(a.top.length, id).toBeGreaterThan(0);
      expect(a.top.length, id).toBeLessThanOrEqual(10);
      expect(new Set(a.top.map((t) => t.sigunguId)).size, id).toBe(a.top.length);
      for (const t of a.top) {
        expect(sgIds.has(t.sigunguId), `${id} ${t.sigunguId}`).toBe(true);
        expect(t.area, `${id} ${t.sigunguId}`).toBeGreaterThan(0);
      }
      for (let i = 1; i < a.top.length; i++) expect(a.top[i - 1].area, id).toBeGreaterThanOrEqual(a.top[i].area);
    }
  });

  it("시·도 행은 17개 전부, 큰 순, 합 = totalArea, 1위 시·군·구는 상위 시·도 안", () => {
    const provinceIds = new Set(PROVINCES.map((p) => p.id));
    for (const [id, a] of Object.entries(CROP_SIGUNGU_AREAS)) {
      expect(a.provinces, id).toHaveLength(PROVINCES.length);
      for (const p of a.provinces) expect(provinceIds.has(p.provinceId), `${id} ${p.provinceId}`).toBe(true);
      for (let i = 1; i < a.provinces.length; i++) expect(a.provinces[i - 1].area, id).toBeGreaterThanOrEqual(a.provinces[i].area);
      const sum = a.provinces.reduce((x, p) => x + p.area, 0);
      expect(Math.abs(sum - a.totalArea), id).toBeLessThanOrEqual(1);
      // 1위 시·군·구 면적이 그 시·도 행보다 클 수 없다(시·도 행 = 그 아래 시·군·구 합)
      const sg = SIGUNGUS.find((s) => s.id === a.top[0].sigunguId)!;
      const sido = a.provinces.find((p) => p.provinceId === sg.sidoId)!;
      expect(a.top[0].area, `${id} ${sg.name}`).toBeLessThanOrEqual(sido.area + 0.5);
    }
  });

  it("두 작물이 같은 상위 숫자 열을 갖지 않는다(표 오독 재발 방지)", () => {
    const seen = new Map<string, string>();
    for (const [id, a] of Object.entries(CROP_SIGUNGU_AREAS)) {
      const sig = a.top.map((t) => `${t.sigunguId}:${t.area}`).join(",");
      expect(seen.get(sig), `${id} 와 ${seen.get(sig)}`).toBeUndefined();
      seen.set(sig, id);
    }
  });

  it("주소지 쏠림 단위는 상위 목록에 없다(벼는 벼 판정, 그 밖은 전체 판정) — 주요 작물과 같은 판정", () => {
    for (const [id, a] of Object.entries(CROP_SIGUNGU_AREAS)) {
      for (const t of a.top) {
        const j = CROP_SIGUNGU_RESIDENCE_SKEW[t.sigunguId];
        if (!j) continue;
        expect(j.all, `${id} ${t.sigunguId}`).toBe(false);
        if (id === "rice") expect(j.rice, `${id} ${t.sigunguId}`).toBe(false);
      }
    }
    for (const id of ["anyang", "seongnam", "mokpo", "suwon"]) expect(CROP_SIGUNGU_RESIDENCE_SKEW[id]?.all, id).toBe(true);
    // 두 생성기가 같은 판정을 썼다(scripts/lib/residence-skew.ts)
    for (const sg of SIGUNGUS) {
      const m = MAIN_CROPS_RESIDENCE_SKEW[sg.id];
      expect(CROP_SIGUNGU_RESIDENCE_SKEW[sg.id] ?? null, sg.id).toEqual(m ? { rice: m.rice, all: m.all } : null);
    }
  });
});
