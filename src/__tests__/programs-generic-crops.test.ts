import { describe, expect, it } from "vitest";
import { ALL_CROP_NAMES, PROGRAMS } from "@/lib/data/programs";
import { CROPS } from "@/lib/data/crops";

/**
 * 작물 범용 지원사업 가드 (2026-09-26)
 * 9/25 사용자 요청 "[지원사업 요청] 사과" — 작물명으로 지원사업을 찾으면 0건이던 회귀 차단.
 * 창업자금·청년농·후계농·농지은행·귀농닥터는 작물을 가리지 않으므로 55종 전부를 대상 작물로 명시한다.
 */
const GENERIC_IDS = ["SP-001", "SP-002", "SP-011", "SP-018", "SP-020", "SP-023"];

describe("작물 범용 지원사업 relatedCrops", () => {
  it("ALL_CROP_NAMES 는 CROPS 55종 이름과 1:1", () => {
    expect(ALL_CROP_NAMES).toEqual(CROPS.map((c) => c.name));
    expect(new Set(ALL_CROP_NAMES).size).toBe(CROPS.length);
  });

  it.each(GENERIC_IDS)("%s 는 전 작물을 relatedCrops 로 가진다", (id) => {
    const p = PROGRAMS.find((x) => x.id === id);
    expect(p, `${id} 가 PROGRAMS 에 없음`).toBeDefined();
    expect(p!.relatedCrops).toEqual(ALL_CROP_NAMES);
  });

  it("모든 작물에 지원사업이 최소 1건 매칭된다 (작물 상세 추천·/programs?q= 0건 방지)", () => {
    const missing = CROPS.filter(
      (c) => !PROGRAMS.some((p) => p.relatedCrops.includes(c.name))
    ).map((c) => c.name);
    expect(missing).toEqual([]);
  });

  it("작물 특화 사업은 relatedCrops 가 55종보다 짧다 (범용/특화 구분이 정렬 기준)", () => {
    const specific = PROGRAMS.filter(
      (p) => p.relatedCrops.length > 0 && !GENERIC_IDS.includes(p.id)
    );
    expect(specific.length).toBeGreaterThan(0);
    for (const p of specific) expect(p.relatedCrops.length).toBeLessThan(CROPS.length);
  });
});
