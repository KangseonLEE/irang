/**
 * 작물 소득 = 농촌진흥청 「2025년도 농산물 소득 조사」 원표 (2026-10-10)
 *
 * 10/1 소득 32종 갱신은 PDF 를 한 번 파싱해 대조했지만 원표 추출본이 리포에 없어 다시 대조할 수단이 없었다.
 * crop-income-source.ts 에 51작목 원표를 고정하고, 작물 상세의 숫자가 거기서 나왔는지 여기서 본다.
 * 원표에 없는 작물은 '추정'이어야 하고 정렬·검색 결과 설명에 숫자로 들어가면 안 된다.
 */
import { describe, it, expect } from "vitest";
import {
  CROP_INCOME_SURVEY,
  CROP_INCOME_SURVEY_ROWS,
  CROP_INCOME_ITEMS,
  CROP_INCOME_VARIETY_ITEMS,
  incomeManwon,
} from "@/lib/data/crop-income-source";
import { CROPS, CROP_DETAILS } from "@/lib/data/crops";
import { parseIncome10a } from "@/lib/format";
import { officialIncomeAgency, officialIncome10a } from "@/lib/crops/income";
import { cropSeoDescription } from "@/lib/crops/seo";

const fmt = (n: number) => n.toLocaleString("ko-KR");
/** 품목들 소득(만 원)의 최솟값~최댓값 → "A" 또는 "A~B" */
function rangeText(items: string[]): string {
  const vals = items.map(incomeManwon);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return lo === hi ? fmt(lo) : `${fmt(lo)}~${fmt(hi)}`;
}
/** "10a당 약 1,260~1,642만 원 (…)" → "1,260~1,642" */
function head(revenueRange: string): string | null {
  return revenueRange.match(/^10a당\s*약\s*([\d,]+(?:\s*~\s*[\d,]+)?)\s*만\s*원/)?.[1].replace(/\s+/g, "") ?? null;
}
/** "(3,000평 재배 시 연 약 1,797만 원)" → 1797 */
function per3000(revenueRange: string): number | null {
  const m = revenueRange.match(/3,000평[^\d]*연 약 ([\d,]+)만 원/);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

describe("소득 원표 (2025년도 농산물 소득 조사)", () => {
  it("51작목, 품목 이름 중복 없음, 총수입 − 경영비 = 소득(±1천원), 소득률 = 소득/총수입", () => {
    expect(CROP_INCOME_SURVEY_ROWS).toHaveLength(51);
    expect(new Set(CROP_INCOME_SURVEY_ROWS.map((r) => r.item)).size).toBe(51);
    for (const r of CROP_INCOME_SURVEY_ROWS) {
      expect(Math.abs(r.totalRevenue - r.operatingCost - r.income), r.item).toBeLessThanOrEqual(1);
      expect(Math.abs((r.income / r.totalRevenue) * 100 - r.incomeRate), r.item).toBeLessThanOrEqual(0.1);
      expect([3, 4, 5]).toContain(r.page);
    }
  });

  it("작물 매핑의 품목은 전부 원표에 있고 작물은 CROPS 에 있다", () => {
    const items = new Set(CROP_INCOME_SURVEY_ROWS.map((r) => r.item));
    const ids = new Set(CROPS.map((c) => c.id));
    for (const [id, list] of Object.entries(CROP_INCOME_ITEMS)) {
      expect(ids.has(id), id).toBe(true);
      for (const it of list) expect(items.has(it), `${id} ${it}`).toBe(true);
    }
    for (const [id, vs] of Object.entries(CROP_INCOME_VARIETY_ITEMS)) {
      for (const list of Object.values(vs)) for (const it of list) expect(items.has(it), `${id} ${it}`).toBe(true);
    }
  });
});

describe("작물 상세 소득 = 원표", () => {
  it("매핑한 작물: 출처가 소득 조사이고 머리 숫자 = 원표 품목 소득 최솟값~최댓값, 3,000평 환산 = 원표 천원 값", () => {
    for (const [id, items] of Object.entries(CROP_INCOME_ITEMS)) {
      const d = CROP_DETAILS.find((x) => x.id === id)!;
      expect(d.income.source?.startsWith(CROP_INCOME_SURVEY.source), `${id} 출처`).toBe(true);
      expect(head(d.income.revenueRange), `${id} ${d.income.revenueRange}`).toBe(rangeText(items));
      const p = per3000(d.income.revenueRange);
      if (p !== null) {
        expect(items, `${id} 3,000평 환산은 품목 하나일 때만`).toHaveLength(1);
        expect(p, id).toBe(CROP_INCOME_SURVEY_ROWS.find((r) => r.item === items[0])!.income);
      }
    }
  });

  it("품종·재배방식 금액도 원표 품목과 같다", () => {
    for (const [id, vs] of Object.entries(CROP_INCOME_VARIETY_ITEMS)) {
      const d = CROP_DETAILS.find((x) => x.id === id)!;
      for (const [name, items] of Object.entries(vs)) {
        const v = d.income.varieties?.find((x) => x.name === name);
        expect(v, `${id} ${name}`).toBeDefined();
        expect(head(v!.revenueRange ?? ""), `${id} ${name}`).toBe(rangeText(items));
      }
    }
  });

  it("소득 조사를 출처로 단 작물은 전부 매핑돼 있다(매핑 없이 이름만 빌리지 않는다)", () => {
    for (const d of CROP_DETAILS) {
      if (d.income.source?.startsWith(CROP_INCOME_SURVEY.source)) {
        expect(CROP_INCOME_ITEMS[d.id], `${d.id} 매핑 없음`).toBeDefined();
      }
    }
  });

  it("금액이 있는 품종은 매핑돼 있거나 '추정'으로 시작한다", () => {
    for (const d of CROP_DETAILS) {
      for (const v of d.income.varieties ?? []) {
        if (!v.revenueRange) continue;
        const mapped = CROP_INCOME_VARIETY_ITEMS[d.id]?.[v.name];
        expect(Boolean(mapped) || v.revenueRange.startsWith("추정"), `${d.id} ${v.name}`).toBe(true);
      }
    }
  });
});

describe("공식 소득이 없는 작물 = 추정 (10/10)", () => {
  const official = new Set([...Object.keys(CROP_INCOME_ITEMS), "rice", "soybean", "garlic", "onion"]);
  const others = CROP_DETAILS.filter((d) => !official.has(d.id));

  it("쌀·콩·마늘·양파는 통계청 농축산물생산비조사", () => {
    for (const id of ["rice", "soybean", "garlic", "onion"]) {
      const d = CROP_DETAILS.find((x) => x.id === id)!;
      expect(officialIncomeAgency(d.income.source), id).toBe("통계청");
    }
  });

  it("나머지는 공식 기관 이름을 달지 않고, 금액이 있으면 '추정'으로 시작한다", () => {
    expect(others.length).toBeGreaterThan(0);
    for (const d of others) {
      expect(officialIncomeAgency(d.income.source), d.id).toBeNull();
      if (/만\s*원/.test(d.income.revenueRange)) expect(d.income.revenueRange.startsWith("추정"), d.id).toBe(true);
    }
  });

  it("추정 작물은 정렬·대시보드 숫자(parseIncome10a·officialIncome10a)와 검색 결과 설명에서 빠진다", () => {
    for (const d of others) {
      expect(parseIncome10a(d.income.revenueRange), d.id).toBeNull();
      expect(officialIncome10a(d.income), d.id).toBeNull();
      const c = CROPS.find((x) => x.id === d.id)!;
      expect(cropSeoDescription({ ...c, detail: d }), d.id).not.toContain("10a당 소득");
    }
  });

  it("공식 작물의 검색 결과 설명 숫자 = 원표 머리 숫자(가운데 값으로 바꾸지 않는다)", () => {
    for (const id of Object.keys(CROP_INCOME_ITEMS)) {
      const d = CROP_DETAILS.find((x) => x.id === id)!;
      const c = CROPS.find((x) => x.id === id)!;
      expect(cropSeoDescription({ ...c, detail: d }), id).toContain(`10a당 소득은 약 ${head(d.income.revenueRange)}만 원이에요(농촌진흥청)`);
    }
  });
});
