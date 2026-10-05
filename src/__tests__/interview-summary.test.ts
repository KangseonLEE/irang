import { describe, it, expect } from "vitest";
import { interviews, hasFullStory } from "@/lib/data/landing";
import { SIGUNGUS } from "@/lib/data/sigungus";
import { PROVINCES } from "@/lib/data/regions";
import { CROPS } from "@/lib/data/crops";
import {
  CONTEXT_INTERVIEW_LIMIT,
  getContextInterviews,
  getTypeInterviews,
  toInterviewSummary,
} from "@/lib/data/interview-summary";
import { TREND_BENTO_PROFILES, type TrendTypeId } from "@/lib/data/landing";

/**
 * 인터뷰 요약·맥락 선택 계약 (2026-10-05 회장 결재 B안 — 랜딩 띠 → 작물·지역 상세)
 *
 *  - 링크 규칙 SSOT: 본문 게재 동의자만 /interviews/{id}, 나머지는 원문 기사(5/9 동의 정책)
 *  - 맥락: 작물 = cropLinks, 시·도 = regionUrl 의 시·도, 시·군·구 = (시·도, 시·군·구) 정확 일치
 *  - 최근 기사 순 최대 3명 + 전체 인원
 */

const byId = (id: string) => {
  const p = interviews.find((x) => x.id === id);
  if (!p) throw new Error(`인터뷰 픽스처 없음: ${id}`);
  return p;
};

describe("toInterviewSummary — 링크 규칙 (동의자 내부 · 미동의자 외부)", () => {
  it("본문 동의자(김광훈)는 상세 페이지로, external=false", () => {
    const s = toInterviewSummary(byId("kim-gwanghun"));
    expect(s.href).toBe("/interviews/kim-gwanghun");
    expect(s.external).toBe(false);
  });

  it("미동의자(조성수)는 원문 기사로, external=true", () => {
    const p = byId("jo-sungsu");
    const s = toInterviewSummary(p);
    expect(s.href).toBe(p.sourceUrl);
    expect(s.external).toBe(true);
  });

  it("19명 전원 — external 은 hasFullStory 의 반대, 외부 href 는 http(s), 내부 href 는 /interviews/{id}", () => {
    for (const p of interviews) {
      const s = toInterviewSummary(p);
      expect(s.external, p.id).toBe(!hasFullStory(p));
      if (s.external) expect(s.href, p.id).toMatch(/^https?:\/\//);
      else expect(s.href, p.id).toBe(`/interviews/${p.id}`);
    }
  });

  it("나이 미상은 null — 화면에 '(미상)'을 찍지 않는다", () => {
    expect(toInterviewSummary(byId("bae-munyeol")).age).toBeNull();
    expect(toInterviewSummary(byId("jo-sungsu")).age).toBe("28세");
  });

  it("출처(언론사·날짜)·직업 변화·일러스트를 싣는다", () => {
    const s = toInterviewSummary(byId("jo-sungsu"));
    expect(s.sourceName).toBe("KBC광주방송");
    expect(s.sourceDate).toBe("2024.03");
    expect(s.prevJob).toBe("산업안전 분야 직장인");
    expect(s.currentJob).toBe("청년 농부");
    expect(s.image).toBe("/interviews/illustrations/jo-sungsu.webp");
  });
});

describe("getContextInterviews — 작물", () => {
  it("딸기 5명 → 카드 3장 + 전체 5명(모두 보기), 최근 기사 순", () => {
    const { items, total } = getContextInterviews({ kind: "crop", cropId: "strawberry" });
    expect(total).toBe(5);
    expect(items).toHaveLength(CONTEXT_INTERVIEW_LIMIT);
    expect(items[0].id).toBe("kim-gwanghun"); // 2026.03 — 가장 최근
    const dates = items.map((i) => i.sourceDate);
    expect([...dates].sort().reverse()).toEqual(dates);
    for (const i of items) {
      expect(byId(i.id).cropLinks.some((c) => c.href === "/crops/strawberry"), i.id).toBe(true);
    }
  });

  it("표고버섯 1명(이규호) — 모두 보기 없음", () => {
    const { items, total } = getContextInterviews({ kind: "crop", cropId: "shiitake" });
    expect(total).toBe(1);
    expect(items.map((i) => i.id)).toEqual(["lee-gyuho"]);
  });

  it("작물 연결은 정착한 작물 기준 — 이규호(표고버섯 전업농)는 쌀 상세에 뜨지 않는다 (10/5 QA)", () => {
    expect(getContextInterviews({ kind: "crop", cropId: "rice" }).total).toBe(0);
    expect(getContextInterviews({ kind: "crop", cropId: "cherry-tomato" }).total).toBe(1);
  });

  it("사과 0명 → 빈 목록 (섹션을 그리지 않는다)", () => {
    expect(getContextInterviews({ kind: "crop", cropId: "apple" })).toEqual({ items: [], total: 0 });
  });

  it("limit 인자로 상한을 바꿀 수 있다", () => {
    expect(getContextInterviews({ kind: "crop", cropId: "strawberry" }, 5).items).toHaveLength(5);
  });
});

describe("getContextInterviews — 지역", () => {
  it("시·도 = 그 시·도 전체 (전남 5명 → 3장)", () => {
    const { items, total } = getContextInterviews({ kind: "sido", sidoId: "jeonnam" });
    expect(total).toBe(5);
    expect(items).toHaveLength(3);
    for (const i of items) expect(byId(i.id).regionUrl, i.id).toMatch(/^\/regions\/jeonnam\//);
  });

  it("시·군·구 = 정확히 그 시·군·구만 (전남 신안 2명, 최근 순)", () => {
    const { items, total } = getContextInterviews({ kind: "sigungu", sidoId: "jeonnam", sigunguId: "sinan" });
    expect(total).toBe(2);
    expect(items.map((i) => i.id)).toEqual(["lee-jihoon", "park-jaeyoung"]);
  });

  it("전남 순천 1명(조성수)", () => {
    const { items } = getContextInterviews({ kind: "sigungu", sidoId: "jeonnam", sigunguId: "suncheon" });
    expect(items.map((i) => i.id)).toEqual(["jo-sungsu"]);
  });

  it("없는 지역은 0 — 시·도(서울)·시·군·구(전남 나주)", () => {
    expect(getContextInterviews({ kind: "sido", sidoId: "seoul" }).total).toBe(0);
    expect(getContextInterviews({ kind: "sigungu", sidoId: "jeonnam", sigunguId: "naju" }).total).toBe(0);
  });

  it("시·군·구 id 가 같아도 시·도가 다르면 매칭하지 않는다 (경남 + suncheon → 0)", () => {
    expect(getContextInterviews({ kind: "sigungu", sidoId: "gyeongnam", sigunguId: "suncheon" }).total).toBe(0);
  });
});

describe("인터뷰 링크 무결성 — 어긋나면 상세 섹션이 조용히 비어 버린다", () => {
  it("모든 regionUrl 이 실재 (시·도, 시·군·구) 로 해석된다", () => {
    for (const p of interviews) {
      const m = /^\/regions\/([^/]+)\/([^/]+)$/.exec(p.regionUrl);
      expect(m, `${p.id} ${p.regionUrl}`).not.toBeNull();
      const [, sidoId, sigunguId] = m!;
      expect(PROVINCES.some((x) => x.id === sidoId), `${p.id} 시·도`).toBe(true);
      expect(SIGUNGUS.some((x) => x.sidoId === sidoId && x.id === sigunguId), `${p.id} 시·군·구`).toBe(true);
      expect(getContextInterviews({ kind: "sigungu", sidoId, sigunguId }, 99).items.map((i) => i.id), p.id).toContain(p.id);
    }
  });

  it("모든 cropLinks 가 실재 작물 id 로 해석된다", () => {
    for (const p of interviews) {
      for (const c of p.cropLinks) {
        const id = c.href.replace(/^\/crops\//, "");
        expect(CROPS.some((x) => x.id === id), `${p.id} ${c.href}`).toBe(true);
        expect(getContextInterviews({ kind: "crop", cropId: id }, 99).items.map((i) => i.id), p.id).toContain(p.id);
      }
    }
  });
});

describe("getTypeInterviews — 랜딩 트렌드·비용 탭 사이 인터뷰 띠 (10/5)", () => {
  const TAB_TYPES = Object.keys(TREND_BENTO_PROFILES) as TrendTypeId[];

  it("대표 분류(category)만 본다 — 보조 태그 farming 이 붙은 스마트팜·치유농업 사람은 귀농 띠에 없다", () => {
    const { items, total } = getTypeInterviews("farming");
    expect(total).toBe(interviews.filter((p) => p.category === "farming").length);
    expect(total).toBeLessThan(interviews.filter((p) => p.category === "farming" || p.tags?.includes("farming")).length);
    for (const i of items) expect(byId(i.id).category, i.id).toBe("farming");
  });

  it("탭 5개끼리 사람이 겹치지 않는다 + 탭마다 1명 이상", () => {
    const seen = new Map<string, TrendTypeId>();
    for (const t of TAB_TYPES) {
      const { items, total } = getTypeInterviews(t, 99);
      expect(total, t).toBeGreaterThan(0);
      for (const i of items) {
        expect(seen.has(i.id), `${i.id} 가 ${seen.get(i.id)} 와 ${t} 에 동시`).toBe(false);
        seen.set(i.id, t);
      }
    }
  });

  it("최근 기사 순 최대 3명 — 스마트팜 6명은 3장, 귀산촌 1명(이춘복)은 1장", () => {
    const smart = getTypeInterviews("smartfarm");
    expect(smart.items).toHaveLength(CONTEXT_INTERVIEW_LIMIT);
    expect(smart.total).toBeGreaterThan(CONTEXT_INTERVIEW_LIMIT);
    const dates = smart.items.map((i) => i.sourceDate);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(getTypeInterviews("mountain").items.map((i) => i.id)).toEqual(["lee-chunbok"]);
  });

  it("치유농업은 탭이 없어 띠에 안 나온다(목록 /interviews 에서만)", () => {
    expect(TAB_TYPES).not.toContain("healing");
    expect(getTypeInterviews("healing").total).toBeGreaterThan(0);
  });
});
