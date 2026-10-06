import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { axisDelta, documentDelta } from "@/lib/hooks/use-focus-reveal";
import { donutLabelRadius } from "@/components/charts/donut-label";
import { PROGRAMS_DUE_HREF, PROGRAMS_OPEN_HREF } from "@/components/landing/hero-search-hub";
import { NAV_ITEMS } from "@/lib/data/navigation";
import { LIST_PAGE_NORMALIZE_OPTIONS, normalizeSearchParams } from "@/lib/search-params/normalize";

/**
 * 10/6 전체 QA 1차 — FE-C(공통 UI·랜딩·통계·비용·용어집) 수정분 회귀 가드.
 * jsdom 은 레이아웃이 없어 실제 스크롤·가림은 Playwright 실측에서 보고, 여기서는 계산 규칙만 고정한다.
 */

const src = (...p: string[]) => readFileSync(join(process.cwd(), "src", ...p), "utf8");

describe("포커스 노출 계산 (use-focus-reveal)", () => {
  it("이미 다 보이면 움직이지 않는다", () => {
    expect(axisDelta(100, 200, 64, 760)).toBe(0);
  });

  it("nearest — 위로 잘리면 위 가장자리를, 아래로 잘리면 아래 가장자리를 맞춘다", () => {
    expect(axisDelta(10, 60, 64, 760)).toBe(-54);
    expect(axisDelta(740, 790, 64, 760)).toBe(30);
  });

  it("스냅 정렬 start·center·end — 스냅 위치로 맞춰 스냅이 되돌리지 않게", () => {
    // 가로 캐러셀 칸 [16, 359], 둘째 카드가 24% 만 보이는 자리 [296, 576]
    expect(axisDelta(296, 576, 16, 359, "start")).toBe(280);
    expect(axisDelta(296, 576, 16, 359, "end")).toBe(217);
    expect(axisDelta(296, 576, 16, 359, "center")).toBeCloseTo(248.5);
  });

  it("칸보다 큰 요소 — 시작 가장자리가 칸 안이면 그대로, 위로 넘어갔으면 시작을 맞춘다", () => {
    expect(axisDelta(120, 5000, 64, 760)).toBe(0);
    expect(axisDelta(-400, 5000, 64, 760)).toBe(-464);
  });

  it("역방향 Tab — 위로 미는 보정이면 다시 내려올 헤더 높이만큼 더 민다(헤더가 숨어 있을 때만 값이 온다)", () => {
    // 요소가 화면 위로 반쯤 넘어갔고(-30~10) 지금 띠는 0(헤더 숨김) → 헤더 56 이 내려오므로 띠 8 + 56 아래로
    expect(documentDelta({ top: -30, bottom: 10 }, 8, 792, 56)).toBe(-94);
    // 헤더가 이미 보이면(revealExtra 0) 띠(57+8) 기준만
    expect(documentDelta({ top: 20, bottom: 60 }, 65, 792, 0)).toBe(-45);
    // 10px 이하 미세 보정은 헤더가 다시 나오지 않으므로 예측을 더하지 않는다
    expect(documentDelta({ top: 2, bottom: 40 }, 8, 792, 56)).toBe(-6);
  });

  it("아래 고정 띠(모바일 탭바·하단 고정 바) 위로 올린다", () => {
    // 375×812, 탭바 56 + 통계 하단 바 57 + 간격 → 띠 아래 경계 683
    expect(documentDelta({ top: 684, bottom: 736 }, 65, 683, 0)).toBe(53);
  });
});

describe("글로벌 스타일 — html 에 scroll-padding-top 을 두지 않는다", () => {
  it("상시든 키보드 순간이든 위쪽 scroll-padding 없음 — 붙은 sticky 띠 안으로 Tab 하면 문서가 320~460px 튀었다(10/6 실측)", () => {
    const css = src("app", "globals.css");
    expect(css).not.toMatch(/scroll-padding-top/);
  });

  it("레이아웃에 FocusRevealGuard 가 한 번 걸려 있다", () => {
    const layout = src("app", "layout.tsx");
    expect(layout.match(/<FocusRevealGuard \/>/g)?.length).toBe(1);
  });
});

describe("도넛 바깥 라벨 — 차트 상자 안에", () => {
  const halfW = (t: string) => [...t].reduce((w, ch) => w + (ch === "%" ? 12 : ch === "." ? 4 : 8.5), 0) / 2;

  it("768 칸(300×280)에서 오른쪽 작은 조각 라벨이 SVG 밖으로 나가지 않는다 (10/6 QA: 8~9px 잘림)", () => {
    const cx = 150;
    const cy = 140;
    const or = 109; // 78% × min(300,280)/2
    for (const deg of [-10, -3, 0, 4, 12]) {
      const angle = (deg * Math.PI) / 180;
      const text = "6.4%";
      const r = donutLabelRadius({ cx, cy, outerRadius: or, angle, text });
      const x = cx + r * Math.cos(angle);
      expect(x + halfW(text)).toBeLessThanOrEqual(2 * cx);
      // 링과 겹치지 않는다
      expect(r - halfW(text) * Math.abs(Math.cos(angle))).toBeGreaterThan(or);
    }
  });

  it("넓은 칸(546)에서는 종전 거리(링 + 38) 그대로", () => {
    expect(donutLabelRadius({ cx: 273, cy: 140, outerRadius: 109, angle: 0, text: "6.4%" })).toBe(147);
  });
});

describe("랜딩 히어로 수치 목적지 — 숫자가 나오는 목록으로 (10/6 QA)", () => {
  it("신청 가능 = status 모집중, 7일 안에 마감·전체 보기 = 마감 가까운 순", () => {
    const open = new URL(PROGRAMS_OPEN_HREF, "https://irangfarm.com");
    expect(open.pathname).toBe("/programs");
    expect(open.searchParams.get("status")).toBe("모집중");
    const due = new URL(PROGRAMS_DUE_HREF, "https://irangfarm.com");
    expect(due.searchParams.get("status")).toBe("모집중");
    expect(due.searchParams.get("sort")).toBe("deadline");
  });

  it("두 주소 모두 /programs normalize 를 그대로 통과 — 308 strip(=미들웨어 리다이렉트) 되지 않는다", () => {
    const opts = LIST_PAGE_NORMALIZE_OPTIONS["/programs"];
    for (const href of [PROGRAMS_OPEN_HREF, PROGRAMS_DUE_HREF]) {
      const raw = new URL(href, "https://irangfarm.com").searchParams;
      const { cleaned, changed } = normalizeSearchParams(raw, opts);
      expect(changed, href).toBe(false);
      expect(cleaned.toString(), href).toBe(raw.toString());
    }
  });
});

describe("메뉴 SSOT — 작물 비교 최대 개수는 실제 선택 상한과 같다", () => {
  it("navigation desc '최대 N종' = crop-selector MAX_SELECTION", () => {
    const max = Number(src("app", "crops", "compare", "crop-selector.tsx").match(/MAX_SELECTION\s*=\s*(\d+)/)?.[1]);
    expect(max).toBeGreaterThan(0);
    const item = NAV_ITEMS.find((i) => i.href === "/crops/compare");
    expect(item?.desc).toContain(`최대 ${max}종`);
  });
});

describe("CSS 규칙 (체크리스트 C·G)", () => {
  it("CardGrid 열은 minmax(0, 1fr) — 320px 에서 카드가 칸을 넘지 않게", () => {
    const css = src("components", "ui", "card-grid.module.css");
    const decls = css.match(/grid-template-columns:[^;]+;/g) ?? [];
    expect(decls.length).toBe(3);
    for (const d of decls) expect(d).toContain("minmax(0, 1fr)");
  });

  it("히어로 마감 머리줄 — 기본 규칙이 1280+ 미디어쿼리보다 앞 (W12)", () => {
    const css = src("components", "landing", "hero-search-hub.module.css");
    const base = css.search(/\n\.deadlineHead\s*\{\s*\n\s*display: flex;\s*\n\s*align-items: baseline;/);
    // 1280+ 의 align-items: center 덮어쓰기(.statsBlock > .dataTitle, .deadlineHead { … })
    const override = css.search(/\.statsBlock > \.dataTitle,\s*\n\s*\.deadlineHead\s*\{[^}]*align-items: center/);
    expect(base).toBeGreaterThan(-1);
    expect(override).toBeGreaterThan(-1);
    expect(base).toBeLessThan(override);
  });

  it("마감 칩은 opacity 로 흐리게 하지 않는다 — 대비 4.5 미달(axe 44건)", () => {
    const css = src("components", "ui", "crawl-group-note.module.css");
    const closed = css.match(/\.chipClosed\s*\{[^}]*\}/)?.[0] ?? "";
    expect(closed).not.toContain("opacity");
  });

  it("도넛 범례 회색 글씨는 muted-foreground(4.83) — #9ca3af(2.53) 아님", () => {
    const tsx = src("components", "charts", "satisfaction-donut-chart.tsx");
    expect(tsx).not.toContain("#9ca3af");
    expect(tsx).not.toMatch(/role="button"/);
  });
});
