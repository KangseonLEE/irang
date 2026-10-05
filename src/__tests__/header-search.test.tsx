import { StrictMode } from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

/**
 * 헤더 검색 (2026-10-02 오후 회장) — 헤더 검색도 히어로 검색과 같은 `/search` 화면으로 간다.
 * /search 에서는 트리거 자리에 ✕(닫기)가 있고, 들어오기 직전 페이지로 **되돌아간다**(새 기록을 쌓지 않는다, 10/2 QA C-Y11).
 */
const push = vi.fn();
const back = vi.fn();
const replace = vi.fn();
const pathname = { current: "/regions" };
vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
  useRouter: () => ({ push, back, replace }),
}));

import { Header } from "@/components/layout/header";

const gtag = vi.fn();
const openCalls = () => gtag.mock.calls.filter((c) => c[1] === "search_overlay_open");

/** Navigation API 대역 — entries 는 url 만, currentEntry 는 index 만 쓴다 */
function mockNavigation(urls: string[], currentIndex = urls.length - 1) {
  (window as unknown as { navigation?: unknown }).navigation = {
    currentEntry: { index: currentIndex },
    entries: () => urls.map((u) => ({ url: `http://localhost${u}` })),
  };
}

beforeEach(() => {
  gtag.mockClear();
  push.mockClear();
  back.mockClear();
  replace.mockClear();
  pathname.current = "/regions";
  delete (window as unknown as { navigation?: unknown }).navigation;
  (window as unknown as { gtag: unknown }).gtag = gtag;
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: !q.includes("max-width"),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  delete (window as unknown as { navigation?: unknown }).navigation;
  vi.restoreAllMocks();
});

describe("헤더 검색", () => {
  it("트리거는 /search 링크 두 개(돋보기·입력창 모양), 패널 마크업은 없다", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "통합검색" })).toHaveAttribute("href", "/search");
    expect(screen.getByRole("link", { name: "통합검색 열기" })).toHaveAttribute("href", "/search");
    expect(document.querySelector("[role='dialog']")).toBeNull();
    expect(screen.queryByRole("button", { name: "검색 닫기" })).toBeNull();
  });

  it("트리거 클릭은 계측 1회(StrictMode)", () => {
    render(
      <StrictMode>
        <Header />
      </StrictMode>,
    );
    fireEvent.click(screen.getByRole("link", { name: "통합검색 열기" }));
    expect(openCalls()).toHaveLength(1);
  });

  it("⌘K 는 /search 로 이동한다", () => {
    render(<Header />);
    // 환경(mac 판정)에 따라 둘 중 하나가 단축키
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/search");
  });
});

describe("/search ✕ 닫기 — 기록을 늘리지 않는다 (10/2 QA C-Y11)", () => {
  // 10/3 재검증: Navigation API 가 없으면 기록 깊이를 몰라 back() 이 /search 안 직전 검색으로 갔다(검색 2회 뒤 ✕ →
  // /search?q=사과 에 남음). 들어오기 직전 경로로 교체한다 — 기록을 늘리지 않고 /search 에 남지도 않는다.
  it("앱 안에서 들어왔으면(Navigation API 없음) 들어오기 직전 경로로 교체 — push·back 하지 않는다", () => {
    window.history.replaceState(null, "", "/regions?sido=gyeonggi");
    const { rerender } = render(<Header />);
    pathname.current = "/search";
    window.history.replaceState(null, "", "/search");
    rerender(<Header />);
    expect(screen.queryByRole("link", { name: "통합검색 열기" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "검색 닫기" }));
    expect(replace).toHaveBeenCalledWith("/regions?sido=gyeonggi");
    expect(back).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("/search 로 바로 들어오면 홈으로 교체 — 사이트 밖으로 나가지 않는다", () => {
    pathname.current = "/search";
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "검색 닫기" }));
    expect(replace).toHaveBeenCalledWith("/");
    expect(back).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("Navigation API 가 있으면 /search 기록을 한 번에 거슬러 직전 페이지로 (검색을 여러 번 했어도)", () => {
    const go = vi.spyOn(window.history, "go").mockImplementation(() => {});
    mockNavigation(["/", "/regions", "/search?q=사과", "/search?q=배"]);
    pathname.current = "/search";
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "검색 닫기" }));
    expect(go).toHaveBeenCalledWith(-2);
    expect(push).not.toHaveBeenCalled();
    expect(back).not.toHaveBeenCalled();
  });

  it("Navigation API 기록에 /search 밖 페이지가 없으면(바로 들어옴) 홈으로 교체", () => {
    const go = vi.spyOn(window.history, "go").mockImplementation(() => {});
    mockNavigation(["/search?q=사과", "/search?q=배"]);
    pathname.current = "/search";
    render(<Header />);
    fireEvent.click(screen.getByRole("button", { name: "검색 닫기" }));
    expect(go).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/");
  });
});

describe("GNB 드롭다운 키보드 — 디스클로저 (10/2 QA)", () => {
  const firstGroup = () => screen.getAllByRole("button", { expanded: false })[0];
  /** jsdom 의 focus() 는 React onFocus 가 듣는 focusin 을 보내지 않는다 — 브라우저처럼 둘 다 */
  const focus = (el: HTMLElement) => {
    el.focus();
    fireEvent.focusIn(el);
  };

  it("포커스만으로는 열리지 않고, Enter(클릭)로 열고 다시 누르면 닫는다", () => {
    render(<Header />);
    const btn = firstGroup();
    focus(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(btn);
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("버튼은 드롭다운을 aria-controls 로 가리키고 aria-haspopup(메뉴 역할)은 쓰지 않는다", () => {
    render(<Header />);
    const btn = firstGroup();
    const id = btn.getAttribute("aria-controls");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).not.toBeNull();
    expect(btn).not.toHaveAttribute("aria-haspopup");
  });

  it("Esc 는 닫고 포커스를 그 그룹 버튼으로 돌린다 (body 로 날리지 않는다)", () => {
    render(<Header />);
    const btn = firstGroup();
    focus(btn);
    fireEvent.click(btn);
    const menu = document.getElementById(btn.getAttribute("aria-controls")!)!;
    const firstItem = menu.querySelector("a")!;
    focus(firstItem);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(btn).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(btn);
  });

  describe("마우스 hover 로 열면 aria-expanded 도 true — 화면(CSS :hover)과 같다 (10/3 QA)", () => {
    /** 버튼의 부모 = 드롭다운 그룹(.navGroup) — hover 는 그룹 단위로 잡힌다 */
    const groupOf = (btn: HTMLElement) => btn.parentElement as HTMLElement;

    it("마우스가 올라가면 true, 떠나면 false", () => {
      render(<Header />);
      const btn = firstGroup();
      fireEvent.pointerEnter(groupOf(btn), { pointerType: "mouse" });
      expect(btn).toHaveAttribute("aria-expanded", "true");
      fireEvent.pointerLeave(groupOf(btn), { pointerType: "mouse" });
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });

    it("hover 로 연 메뉴도 Esc 로 닫힌다(포인터를 옮기지 않아도 — WCAG 1.4.13)", () => {
      render(<Header />);
      const btn = firstGroup();
      fireEvent.pointerEnter(groupOf(btn), { pointerType: "mouse" });
      fireEvent.keyDown(window, { key: "Escape" });
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });

    it("터치 포인터는 hover 로 세지 않는다 — 탭은 클릭 토글이 맡는다", () => {
      render(<Header />);
      const btn = firstGroup();
      fireEvent.pointerEnter(groupOf(btn), { pointerType: "touch" });
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });

    it("클릭으로 고정한 그룹은 마우스가 다른 그룹에 들어가면 닫힌다 — 두 메뉴가 겹쳐 열리지 않는다", () => {
      render(<Header />);
      const [a, b] = screen.getAllByRole("button", { expanded: false });
      fireEvent.click(a);
      expect(a).toHaveAttribute("aria-expanded", "true");
      fireEvent.pointerEnter(groupOf(b), { pointerType: "mouse" });
      expect(a).toHaveAttribute("aria-expanded", "false");
      expect(b).toHaveAttribute("aria-expanded", "true");
    });
  });

  it("다른 그룹 버튼으로 포커스가 오면 열려 있던 그룹은 닫힌다", () => {
    render(<Header />);
    const [a, b] = screen.getAllByRole("button", { expanded: false });
    focus(a);
    fireEvent.click(a);
    expect(a).toHaveAttribute("aria-expanded", "true");
    focus(b);
    expect(a).toHaveAttribute("aria-expanded", "false");
    expect(b).toHaveAttribute("aria-expanded", "false");
  });
});
