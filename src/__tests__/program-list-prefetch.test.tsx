/**
 * /programs 무한 스크롤 — 다음 쪽을 얼마나 앞서 불러오나 (10/8 CLS)
 *
 * rootMargin 200px 이면 응답(운영 0.24~0.34초)이 오기 전에 목록 끝 아래 의견 요청·푸터가 먼저 화면에 들어왔다가
 * 새 카드에 밀려 내려갔다 — 스크롤 중 CLS 0.14~0.53(1280)·0.39~0.94(375). 두 화면(200%) 앞서 받자 0(dev, 응답 지연 250ms 덧붙여
 * 초당 860~2,600px 스크롤). 아래만 넓히면 End 키처럼 센티넬을 한 번에 지나친 경우 다음 쪽을 영영 안 불렀다(모바일 6건에서 멈춤)
 * — 위쪽도 넓힌다. 실제 레이아웃 이동은 jsdom 이 못 재므로 옵저버 설정을 고정한다.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import type { SupportProgram } from "@/lib/data/programs";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/programs",
}));
const loadMorePrograms = vi.fn(async () => ({ programs: [], total: 1, hasMore: false }));
vi.mock("@/app/programs/actions", () => ({ loadMorePrograms: (...a: unknown[]) => loadMorePrograms(...(a as [])) }));

import { ProgramList } from "@/app/programs/program-list";

const program: SupportProgram = {
  id: "SP-TEST",
  title: "미리 받기 테스트 사업",
  summary: "요약",
  region: "전국",
  organization: "테스트 기관",
  supportType: "보조금",
  supportAmount: "최대 100만 원",
  eligibilityAgeMin: 18,
  eligibilityAgeMax: 99,
  eligibilityDetail: "누구나",
  applicationStart: "2026-09-01",
  applicationEnd: "2026-12-05",
  status: "모집중",
  relatedCrops: [],
  sourceUrl: "https://www.example.go.kr/notice/1",
  year: 2026,
};

let created: { cb: IntersectionObserverCallback; opts?: IntersectionObserverInit }[] = [];
const realIO = globalThis.IntersectionObserver;

beforeEach(() => {
  created = [];
  loadMorePrograms.mockClear();
  class IO {
    constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
      created.push({ cb, opts });
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", { configurable: true, writable: true, value: IO });
  Object.defineProperty(globalThis, "IntersectionObserver", { configurable: true, writable: true, value: IO });
});

afterEach(() => {
  Object.defineProperty(window, "IntersectionObserver", { configurable: true, writable: true, value: realIO });
  Object.defineProperty(globalThis, "IntersectionObserver", { configurable: true, writable: true, value: realIO });
});

/** "200% 0px 200% 0px" → 위·아래 여백(퍼센트) */
function verticalMargins(rootMargin: string | undefined): { top: string; bottom: string } {
  const parts = (rootMargin ?? "0px").trim().split(/\s+/);
  const [top, , bottom = top] = parts.length === 1 ? [parts[0], parts[0], parts[0]] : parts;
  return { top, bottom };
}

describe("ProgramList 무한 스크롤 — 미리 받기 범위", () => {
  it("센티넬 옵저버는 위·아래로 두 화면(200%) 넓힌다 — 200px(예전)·아래만 넓히기는 안 된다", () => {
    render(<ProgramList initialPrograms={[program]} initialHasMore total={7} filters={{}} asOf="2026-10-08" />);
    expect(created.length).toBeGreaterThan(0);
    const { top, bottom } = verticalMargins(created.at(-1)!.opts?.rootMargin);
    expect(bottom).toMatch(/%$/);
    expect(top).toMatch(/%$/);
    expect(parseFloat(bottom)).toBeGreaterThanOrEqual(200);
    expect(parseFloat(top)).toBeGreaterThanOrEqual(200);
  });

  it("범위 안에 들어오면 다음 쪽을 부른다, 다 받았으면(hasMore false) 옵저버를 걸지 않는다", async () => {
    const { unmount } = render(
      <ProgramList initialPrograms={[program]} initialHasMore total={7} filters={{}} asOf="2026-10-08" />,
    );
    await act(async () => {
      created.at(-1)!.cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    });
    expect(loadMorePrograms).toHaveBeenCalledTimes(1);
    unmount();

    created = [];
    render(<ProgramList initialPrograms={[program]} initialHasMore={false} total={1} filters={{}} asOf="2026-10-08" />);
    expect(created).toHaveLength(0);
  });
});
