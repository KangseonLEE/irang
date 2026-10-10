/**
 * 작물 상세 '재배면적 상위 (시·도)' 자료 계약 (2026-10-09)
 *
 * 10/8: 17종 중 16종이 그 작물이 아닌 KOSIS 표를 보고 있었다(과실생산량 표를 항목 필터 없이 읽어 콩·마늘 상세에 과일 면적).
 * 지금은 작물 하나 = 표 하나 + 면적 항목 하나(crop-area-tables.ts)를 scripts/collect-crop-areas.ts 가 원천과 대조해
 * crop-areas.ts 로 고정한다. 이 테스트는 그 고정본이 설정과 어긋나지 않는지 본다.
 */
import { describe, it, expect } from "vitest";
import { CROP_AREAS } from "@/lib/data/crop-areas";
import { CROP_TABLES } from "@/lib/data/crop-area-tables";
import { CROPS } from "@/lib/data/crops";
import { PROVINCES } from "@/lib/data/regions";

describe("작물 시·도 재배면적", () => {
  it("설정의 작물은 전부 CROPS 에 있고, 한 작물에 표 하나", () => {
    const ids = CROP_TABLES.map((t) => t.cropId);
    expect(new Set(ids).size).toBe(ids.length);
    const cropIds = new Set(CROPS.map((c) => c.id));
    for (const id of ids) expect(cropIds.has(id), id).toBe(true);
  });

  it("같은 표·항목을 두 작물이 쓰지 않는다", () => {
    const keys = CROP_TABLES.map((t) => `${t.tblId}/${t.itmId}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("항목 이름이 그 작물의 면적이다 — 'OO:면적'·'OO:재배면적'", () => {
    const nameById = new Map(CROPS.map((c) => [c.id, c.name]));
    // KOSIS 항목 이름이 우리 작물명과 다른 경우만 명시(쌀 = 논벼)
    const kosisName: Record<string, string> = { rice: "논벼" };
    for (const t of CROP_TABLES) {
      const expected = kosisName[t.cropId] ?? nameById.get(t.cropId);
      expect(t.itemName, t.cropId).toMatch(new RegExp(`^${expected}:(재배)?면적$`));
    }
  });

  it("고정본이 설정과 같은 표·항목이고 시·도 합 = 전국", () => {
    expect(Object.keys(CROP_AREAS).sort()).toEqual(CROP_TABLES.map((t) => t.cropId).sort());
    const provinceIds = new Set(PROVINCES.map((p) => p.id));
    for (const t of CROP_TABLES) {
      const a = CROP_AREAS[t.cropId];
      expect(a.tblId, t.cropId).toBe(t.tblId);
      expect(a.itemName, t.cropId).toBe(t.itemName);
      expect(a.provinces).toHaveLength(PROVINCES.length);
      for (const p of a.provinces) expect(provinceIds.has(p.provinceId), p.provinceId).toBe(true);
      const sum = a.provinces.reduce((x, p) => x + p.areaHa, 0);
      expect(Math.abs(sum - a.totalHa), t.cropId).toBeLessThanOrEqual(a.totalHa * 0.005 + 1);
      // 큰 순 정렬
      for (let i = 1; i < a.provinces.length; i++) {
        expect(a.provinces[i - 1].areaHa).toBeGreaterThanOrEqual(a.provinces[i].areaHa);
      }
    }
  });

  it("두 작물이 같은 숫자 열을 갖지 않는다(10/8 과일 면적 복제 사고 재발 방지)", () => {
    const sig = Object.entries(CROP_AREAS).map(([id, a]) => [id, a.provinces.map((p) => p.areaHa).join(",")]);
    const seen = new Map<string, string>();
    for (const [id, s] of sig) {
      expect(seen.get(s), `${id} 와 ${seen.get(s)} 의 시·도 면적이 같다`).toBeUndefined();
      seen.set(s, id);
    }
  });
});

describe("작물 주산지(majorRegions) = 재배면적 순 (10/10 정정)", () => {
  // 규칙: 1위 시·도 + 전국의 5% 이상인 시·도를 큰 순으로, 최대 max(3, 그 작물 칸 수)
  it("KOSIS 면적이 있는 작물은 주산지가 면적 순 상위 시·도와 같다", async () => {
    const { CROP_DETAILS } = await import("@/lib/data/crops");
    for (const d of CROP_DETAILS) {
      const a = CROP_AREAS[d.id];
      if (!a) continue;
      const names = a.provinces.map((p) => PROVINCES.find((x) => x.id === p.provinceId)!.name);
      expect(d.majorRegions[0], `${d.id} 주산지 1위`).toBe(names[0]);
      expect(d.majorRegions, d.id).toEqual(names.slice(0, d.majorRegions.length));
      for (const r of d.majorRegions.slice(1)) {
        const p = a.provinces[names.indexOf(r)];
        expect(p.areaHa / a.totalHa, `${d.id} ${r} 비중`).toBeGreaterThanOrEqual(0.05);
      }
    }
  });
});
