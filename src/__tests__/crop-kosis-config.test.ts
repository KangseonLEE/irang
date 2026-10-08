/**
 * 작물 상세 '재배면적 상위' 차트의 KOSIS 표 — 원천에서 확인한 표만 (2026-10-08)
 *
 * 17종에 kosisConfig 가 있었는데 원천과 맞는 건 쌀(DT_1ET0034 「시군별 논벼 생산량」) 하나뿐이었다.
 * - DT_1ET0292 = 「과실생산량(성과수+미과수)」: 사과·배·복숭아·포도 면적이 한 표에 섞여 있어, 작물 항목 필터 없이
 *   읽으면 지역마다 마지막 과일 면적이 남는다 — 콩·고구마·감자·옥수수·고추·배추·마늘·양파·인삼·참깨 상세가 전부
 *   같은 과일 숫자를 자기 재배면적처럼 그릴 상태였다(빌드는 해외에서 시간 초과로 비어 운영엔 안 보였지만,
 *   배포 없이 하루가 지나 다시 만들어지면 노출될 수 있었다)
 * - DT_1AG20411(사과·배·포도·감귤): 2024·2025 err 30 / DT_1ET0017(상추·딸기): objL 없이 err 20
 * 새 표를 붙일 땐 표 이름(TBL_NM)·항목(ITM_NM)이 그 작물인지 원천에서 확인한 뒤 아래 허용 목록에 근거와 함께 올린다.
 */
import { describe, it, expect } from "vitest";
import { CROP_DETAILS } from "@/lib/data/crops";

/** 작물 id → 원천에서 확인한 KOSIS 표 (표 이름·항목이 그 작물 하나) */
const VERIFIED: Record<string, { tblId: string; note: string }> = {
  rice: { tblId: "DT_1ET0034", note: "시군별 논벼 생산량(정곡92.9%) — 항목 논벼:재배면적·10a당 생산량·생산량 (10/8 조회)" },
};

describe("작물 KOSIS 재배면적 표", () => {
  const withConfig = Object.values(CROP_DETAILS).filter((d) => d.kosisConfig);

  it("원천에서 확인한 표만 쓴다", () => {
    for (const d of withConfig) {
      const v = VERIFIED[d.id];
      expect(v, `${d.id} — 허용 목록에 없는 kosisConfig(${d.kosisConfig?.tblId})`).toBeDefined();
      expect(d.kosisConfig?.tblId, d.id).toBe(v.tblId);
    }
  });

  it("여러 작물이 한 표를 같이 쓰지 않는다(항목 필터 없는 다작물 표 재발 방지)", () => {
    const byTable = new Map<string, string[]>();
    for (const d of withConfig) {
      const t = d.kosisConfig!.tblId;
      byTable.set(t, [...(byTable.get(t) ?? []), d.id]);
    }
    for (const [t, ids] of byTable) expect(ids, t).toHaveLength(1);
  });

  it("과실생산량 표(DT_1ET0292)는 쓰지 않는다", () => {
    expect(withConfig.some((d) => d.kosisConfig?.tblId === "DT_1ET0292")).toBe(false);
  });
});
