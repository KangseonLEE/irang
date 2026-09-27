import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";

import { ApplicationTimeline } from "@/components/programs/application-timeline";
import { EligibilityCheck } from "@/components/programs/eligibility-check";
import { RelatedCropsCard, type RelatedCrop } from "@/components/programs/related-crops-card";
import { SourceLinkButton } from "@/components/programs/source-link-button";
import { analytics } from "@/lib/analytics";

/** Modal 은 열릴 때 matchMedia 로 모바일 여부를 본다 — jsdom 에는 없다 */
beforeAll(() => {
  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
        onchange: null,
      }),
    });
  }
});

// ---------------------------------------------------------------------------
// A. 원문 바로가기 버튼
// ---------------------------------------------------------------------------

describe("SourceLinkButton — 원문 바로가기 (9/27)", () => {
  it("정상 링크는 새 창 + noopener 로 원문으로 보낸다", () => {
    render(<SourceLinkButton href="https://www.jindo.go.kr/notice/1" title="진도군 공고" />);
    const link = screen.getByRole("link", { name: /원문 공고 보기/ });
    expect(link).toHaveAttribute("href", "https://www.jindo.go.kr/notice/1");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("broken 이면 ExternalLinkBlock 과 같은 site: 검색 목적지로 보낸다", () => {
    render(
      <SourceLinkButton
        href="https://www.example.go.kr/gone"
        linkStatus="broken"
        title="사라진 공고"
      />,
    );
    const link = screen.getByRole("link", { name: /원문 검색/ });
    expect(link.getAttribute("href")).toBe(
      `https://www.google.com/search?q=${encodeURIComponent("site:example.go.kr 사라진 공고")}`,
    );
  });

  it("http(s) 가 아닌 프로토콜은 링크로 렌더하지 않고 검색으로 돌린다", () => {
    // React 19 는 javascript: href 를 렌더 중 예외로 막는다 — 가용성이 먼저 깨진다
    render(<SourceLinkButton href="javascript:alert(1)" title="공고" />);
    expect(screen.queryByRole("link", { name: /원문 공고 보기/ })).toBeNull();
    expect(screen.getByRole("link", { name: /원문 검색/ }).getAttribute("href")).toContain(
      "google.com/search",
    );
  });
});

// ---------------------------------------------------------------------------
// B. 신청 기간 — 행 구조
// ---------------------------------------------------------------------------

describe("ApplicationTimeline — 상태·접수 시기·확인처 행 (9/27)", () => {
  const ALWAYS_OPEN = "9999-12-31";

  it("정기 접수(9999 페어 + applicationCycle)는 시기를 한 문장에 합치지 않는다", () => {
    render(
      <ApplicationTimeline
        applicationStart={ALWAYS_OPEN}
        applicationEnd={ALWAYS_OPEN}
        status="모집예정"
        statusLabel="정기 접수"
        applicationCycle="매년 4월 접수"
        organization="진도군 농업지원과"
      />,
    );
    expect(screen.getByText("상태")).toBeInTheDocument();
    expect(screen.getByText("정기 접수")).toBeInTheDocument();
    expect(screen.getByText("매년 4월 접수")).toBeInTheDocument();
    expect(screen.getByText("확인처")).toBeInTheDocument();
    expect(screen.getByText("진도군 농업지원과")).toBeInTheDocument();
    expect(screen.getByText("정확한 일자는 원문 공고에서 확인하세요")).toBeInTheDocument();
    // "—" 로 이어 붙인 한 문장이 남아 있지 않다
    expect(screen.queryByText(/매년 4월 접수 —/)).toBeNull();
  });

  it("공고 발표 전(cycle 없음)도 같은 3행 구조", () => {
    render(
      <ApplicationTimeline
        applicationStart={ALWAYS_OPEN}
        applicationEnd={ALWAYS_OPEN}
        status="모집예정"
        statusLabel="공고 발표 예정"
        organization="농림축산식품부"
      />,
    );
    expect(screen.getByText("공고 발표 예정")).toBeInTheDocument();
    expect(screen.getByText("공고 발표 전이에요")).toBeInTheDocument();
    expect(screen.getByText("농림축산식품부")).toBeInTheDocument();
  });

  it("상시 모집(end 만 9999)은 시작일부터 상시로 읽힌다", () => {
    render(
      <ApplicationTimeline
        applicationStart="2026-01-01"
        applicationEnd={ALWAYS_OPEN}
        status="모집중"
        statusLabel="모집중"
        organization="한국농어촌공사 농지은행"
      />,
    );
    expect(screen.getByText("1/1부터 상시 모집")).toBeInTheDocument();
    expect(screen.getByText("한국농어촌공사 농지은행")).toBeInTheDocument();
  });

  it("실일자는 행 구조 + 진행 막대·D-day 를 함께 유지한다", () => {
    const { container } = render(
      <ApplicationTimeline
        applicationStart="2026-01-12"
        applicationEnd="2026-02-13"
        status="마감"
        statusLabel="마감"
        organization="군산시"
      />,
    );
    // 날짜는 "1/12 ~ 2/13" 한 span 안에 구분자와 함께 들어간다
    expect(container.textContent).toContain("1/12");
    expect(container.textContent).toContain("2/13");
    expect(screen.getByText("군산시")).toBeInTheDocument();
    expect(screen.getByText("접수가 마감되었어요")).toBeInTheDocument();
    // 진행 막대는 width 인라인 스타일을 가진 자식으로 남아 있다
    expect(container.querySelector('[style*="width"]')).not.toBeNull();
    // 세 행 모두 dt/dd 쌍
    expect(container.querySelectorAll("dt")).toHaveLength(3);
    expect(container.querySelectorAll("dd")).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// C. 자격 셀프 체크 — 버튼 + 결과 모달
// ---------------------------------------------------------------------------

describe("EligibilityCheck — 버튼 + 결과 모달 (9/27)", () => {
  const props = {
    programTitle: "예산군 임대형 스마트팜 청년농업인 입주자 모집",
    ageMin: 18,
    ageMax: 39,
    eligibilityDetail: "만 18세 이상 40세 미만 청년농업인. 농업경영체를 등록한 세대주여야 해요.",
    organization: "예산군농업기술센터 스마트농업과",
    sourceUrl: "https://www.example.go.kr/notice/1",
  };

  it("카드는 버튼 하나만 — 체크리스트는 모달을 열어야 나온다", () => {
    render(<EligibilityCheck {...props} />);
    expect(screen.getByRole("button", { name: "자격 셀프 체크하기" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "자격 셀프 체크하기" }));
    expect(screen.getByRole("dialog", { name: "자격 셀프 체크" })).toBeInTheDocument();
  });

  it("전부 체크하면 pass — 결과 화면에 원문 보기가 있다", () => {
    const spy = vi.spyOn(analytics, "programSelfCheckResult");
    render(<EligibilityCheck {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "자격 셀프 체크하기" }));

    const dialog = screen.getByRole("dialog", { name: "자격 셀프 체크" });
    const checks = within(dialog)
      .getAllByRole("button", { pressed: false })
      .filter((b) => b.getAttribute("aria-label")?.endsWith("미확인"));
    expect(checks.length).toBeGreaterThanOrEqual(2);
    checks.forEach((b) => fireEvent.click(b));

    fireEvent.click(within(dialog).getByRole("button", { name: "결과 보기" }));
    expect(spy).toHaveBeenCalledWith("pass");
    expect(screen.getByText("신청 조건을 모두 충족해요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /원문 공고 보기/ })).toBeInTheDocument();
    spy.mockRestore();
  });

  it("하나를 빼면 miss:1 — 미확인 항목과 문의 안내가 남는다", () => {
    const spy = vi.spyOn(analytics, "programSelfCheckResult");
    render(<EligibilityCheck {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "자격 셀프 체크하기" }));

    const dialog = screen.getByRole("dialog", { name: "자격 셀프 체크" });
    const checks = within(dialog)
      .getAllByRole("button", { pressed: false })
      .filter((b) => b.getAttribute("aria-label")?.endsWith("미확인"));
    checks.slice(0, -1).forEach((b) => fireEvent.click(b));

    fireEvent.click(within(dialog).getByRole("button", { name: "결과 보기" }));
    expect(spy).toHaveBeenCalledWith("miss:1");
    expect(screen.getByText("아직 확인이 필요한 항목이에요")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(props.organization))).toBeInTheDocument();

    // "다시 체크"로 체크 화면으로 돌아간다 (체크 상태는 유지)
    fireEvent.click(screen.getByRole("button", { name: "다시 체크" }));
    expect(screen.getByRole("button", { name: "결과 보기" })).toBeInTheDocument();
    spy.mockRestore();
  });

  it("접수 안내·문의처 문장은 자격 항목이 아니다 (9/27)", () => {
    // 결과 화면이 미확인 항목을 나열하므로, 자격이 아닌 문장이 섞이면 "못 채운 조건"으로 읽힌다
    render(
      <EligibilityCheck
        {...props}
        eligibilityDetail={
          "농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 100시간 이상 이수. " +
          "접수 기간은 시군별로 달라요(예: 군산 1/12~2/13) — 우리 시군 일정은 담당 부서에 확인하세요."
        }
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "자격 셀프 체크하기" }));
    const dialog = screen.getByRole("dialog", { name: "자격 셀프 체크" });
    const labels = within(dialog)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? "")
      .filter((l) => l.endsWith("미확인") || l.endsWith("확인됨"));
    // 연령 + 자격 2줄 = 3개. 접수 기간·담당 부서 안내는 빠진다
    expect(labels).toHaveLength(3);
    expect(labels.some((l) => l.includes("접수 기간"))).toBe(false);
    expect(labels.some((l) => l.includes("담당 부서"))).toBe(false);
    expect(labels.some((l) => l.includes("전입일로부터"))).toBe(true);
  });

  it("저장·전송 없음 — 결과를 봐도 fetch 를 부르지 않는다", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<EligibilityCheck {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "자격 셀프 체크하기" }));
    fireEvent.click(screen.getByRole("button", { name: "결과 보기" }));
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// D. 관련 작물 — 5개 + 페이지네이션
// ---------------------------------------------------------------------------

describe("RelatedCropsCard — 5개씩 (9/27)", () => {
  const makeCrops = (n: number): RelatedCrop[] =>
    Array.from({ length: n }, (_, i) => ({
      name: `작물${i + 1}`,
      id: `crop-${i + 1}`,
      emoji: "🌾",
      category: "식량",
      difficulty: "보통",
    }));

  it("55개면 한 화면에 5개 · 11페이지 · 제목에 총 개수", () => {
    render(<RelatedCropsCard crops={makeCrops(55)} />);
    expect(screen.getAllByRole("link")).toHaveLength(5);
    expect(screen.getByText("55")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "관련 작물 페이지" });
    expect(nav.querySelector('[aria-label="11페이지"]')).not.toBeNull();
    expect(screen.getByRole("link", { name: /작물1/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /작물6/ })).toBeNull();
  });

  it("페이지를 넘기면 다음 5개로 바뀐다", () => {
    render(<RelatedCropsCard crops={makeCrops(55)} />);
    fireEvent.click(screen.getByRole("button", { name: "다음 페이지" }));
    expect(screen.getByRole("link", { name: /작물6/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /작물1$/ })).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("5개 이하면 페이저가 없다", () => {
    render(<RelatedCropsCard crops={makeCrops(2)} />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("작물 상세가 없으면 링크가 아닌 정적 표시", () => {
    render(<RelatedCropsCard crops={[{ name: "고사리" }]} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("고사리")).toBeInTheDocument();
  });
});
