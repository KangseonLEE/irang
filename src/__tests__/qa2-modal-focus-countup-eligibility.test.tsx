/**
 * 10/16 QA2 후속 3건
 *  1. 목록 안내 창 "다시 시도"·"더 보기"를 누르면 버튼이 사라지며 포커스가 BODY 로 떨어졌다 → 새로 받은 첫 항목으로
 *  2. 랜딩 트렌드·비용 — 섹션이 화면에 들어오기 전(카운트업 트리거 전) 탭을 바꾸면 직전 탭 숫자가 DOM 에 남았다
 *  3. 자격 셀프 체크 — useMediaQuery 껍데기 분기가 하이드레이션 직후 구조를 바꿔 640~1023px CLS 0.108
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

import { PaginatedListModal } from "@/app/regions/[id]/modals/paginated-list-modal";
import { TrendCostSection } from "@/components/landing/trend-cost-section";
import { EligibilityCheck } from "@/components/programs/eligibility-check";

type Item = { name: string; type: string; address: string };

function stubBrowser(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
  // 화면에 들어오지 않은 상태 — IntersectionObserver 콜백을 부르지 않는다
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: IO });
  Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: IO });
  const proto = HTMLElement.prototype as unknown as { scrollTo?: unknown; scrollIntoView?: unknown };
  proto.scrollTo = () => {};
  proto.scrollIntoView = () => {};
}

beforeEach(() => stubBrowser(false));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderModal() {
  return render(
    <PaginatedListModal<Item>
      provinceShortName="부천"
      totalCount={2}
      endpoint="/api/medical-list"
      params={{ sidoCd: "310000", sgguCd: "310303" }}
      filters={[{ label: "전체", value: "" }]}
      searchPlaceholder="검색"
      itemLabel="의료기관"
      renderItem={(item) => <span>{item.name}</span>}
      itemKey={(item) => item.name}
      dataSource="건강보험심사평가원"
    />,
  );
}

const ok = (items: Item[], totalCount: number) => ({ ok: true, status: 200, json: async () => ({ items, totalCount }) });

describe("목록 안내 창 — 포커스 유지", () => {
  it("다시 시도 → 받은 첫 항목 링크로 포커스", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) })
        .mockResolvedValueOnce(ok([{ name: "가나병원", type: "병원", address: "부천" }], 1)),
    );
    renderModal();
    const retry = await screen.findByRole("button", { name: "다시 시도" });
    retry.focus();
    fireEvent.click(retry);
    await waitFor(() => expect(document.activeElement?.textContent).toContain("가나병원"));
    expect(document.activeElement?.tagName).toBe("A");
  });

  it("다시 실패하면 새 '다시 시도' 버튼으로 포커스", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) }),
    );
    renderModal();
    fireEvent.click(await screen.findByRole("button", { name: "다시 시도" }));
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "다시 시도" })),
    );
  });

  it("더 보기 → 새로 받은 첫 항목(두 번째 줄)으로 포커스", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(ok([{ name: "가나병원", type: "병원", address: "부천" }], 2))
        .mockResolvedValueOnce(ok([{ name: "다라의원", type: "의원", address: "부천" }], 2)),
    );
    renderModal();
    fireEvent.click(await screen.findByRole("button", { name: "더 보기" }));
    await waitFor(() => expect(document.activeElement?.textContent).toContain("다라의원"));
  });
});

describe("트렌드·비용 — 화면에 들어오기 전 탭 전환", () => {
  it("탭마다 지금 탭 값이 DOM 에 있다(직전 탭 숫자가 남지 않는다)", () => {
    const { container } = render(<TrendCostSection />);
    const tablist = screen.getByRole("tablist", { name: "정착 유형 선택" });
    const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>("[role=tab]"));
    expect(tabs.length).toBeGreaterThan(1);
    const heroCost = new Set<string>();
    const heroTrend = new Set<string>();
    for (const tab of tabs) {
      fireEvent.click(tab);
      const cost = container.querySelector('[class*="costCardHero"] [class*="costCardNum"]');
      const trend = container.querySelector('[class*="heroValue"]');
      heroCost.add(cost?.textContent ?? "");
      heroTrend.add(trend?.textContent ?? "");
    }
    // 고치기 전엔 트리거 전 표시값이 첫 탭에 머물러 전부 같았다
    expect(heroCost.size).toBeGreaterThan(1);
    expect(heroTrend.size).toBeGreaterThan(1);
  });
});

describe("자격 셀프 체크 — 폭과 무관하게 같은 구조", () => {
  const props = {
    programTitle: "청년창업농",
    ageMin: 18,
    ageMax: 39,
    eligibilityDetail: "농업경영체를 등록한 세대주. 영농 경력 3년 이하. 교육 이수.",
    organization: "농림축산식품부",
    sourceUrl: "https://www.example.go.kr/notice/1",
  };

  it.each([false, true])("matchMedia(max-width:1023px)=%s 에서도 마크업이 서버와 같다", (mobile) => {
    const ssr = renderToStaticMarkup(<EligibilityCheck {...props} bare />);
    stubBrowser(mobile);
    const { container } = render(<EligibilityCheck {...props} bare />);
    expect(container.innerHTML).toBe(ssr);
    // 두 껍데기의 합집합 — 데스크탑 안내문과 모바일 조건 목록이 모두 들어 있고, 버튼은 하나
    expect(ssr).toContain("하나씩 짚어 보고");
    expect(ssr).toContain("농업경영체");
    expect(screen.getAllByRole("button", { name: "자격 셀프 체크하기" })).toHaveLength(1);
  });
});
