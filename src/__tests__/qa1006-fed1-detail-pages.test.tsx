import { beforeAll, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, fireEvent, within } from "@testing-library/react";
import type { SupportProgram } from "@/lib/data/programs";
import type { EducationCourse } from "@/lib/data/education";

/**
 * 상세 화면에 수집기 기본값·채움값이 사실처럼 나가지 않는다 (10/6 QA Q1-F2·Q1-W4·Q2-W1).
 * 네트워크 없이 — 상세 조회 함수를 수집 행 고정값으로 바꾸고, 큐레이션 행은 정적 데이터 그대로 쓴다.
 */

/** 10/6 DB 실측 crawl-rda-programs-aaacd312 그대로 — 본문은 만 45세 미만 청년, 수집기 기본값은 18~65·보조금 */
const CRAWLED_PROGRAM: SupportProgram = {
  id: "crawl-rda-programs-aaacd312",
  title: "2027년 청년창업 스마트팜 지원사업 신청접수",
  summary:
    "지원대상 : 만18세 이상 ~ 만45세 미만 청년농업인(1982.1.1. ~ 2009.12.31. 출생자) · 사 업 비 : 개소당 500백만원(도비 21%, 군비 49%, 자부담 30%)",
  region: "경상북도",
  sigungu: "봉화",
  organization: "봉화군농업기술센터",
  supportType: "보조금",
  supportAmount: "상세 공고 참조",
  eligibilityAgeMin: 18,
  eligibilityAgeMax: 65,
  eligibilityDetail: "상세 공고 참조",
  applicationStart: "2026-09-21",
  applicationEnd: "2026-10-06",
  status: "모집중",
  relatedCrops: [],
  sourceUrl: "https://www.rda.go.kr/young/custom/policy/view.do?sId=47040",
  linkStatus: "active",
  year: 2026,
};

/** agrix 수집 행 — 자격 조건은 원천이 준 신청 대상 구분값(농가 등)이라 남긴다 */
const CRAWLED_AGRIX: SupportProgram = {
  ...CRAWLED_PROGRAM,
  id: "crawl-agrix-programs-df9c14cd",
  title: "친환경농업직불제",
  summary: "",
  region: "전국",
  eligibilityDetail: "농가,농업법인/농업기관",
};

/** 10/6 DB 실측 crawl-rda-education-a2b161c3 — RDA 원천이라 방식 기본값 오프라인, 난이도 기본값 초급 */
const CRAWLED_RDA_COURSE: EducationCourse = {
  id: "crawl-rda-education-a2b161c3",
  title: "2026년 신규농업인(귀농·귀촌)교육생 모집",
  region: "경상남도",
  organization: "의령군농업기술센터",
  type: "오프라인",
  duration: "상세 공고 참조",
  schedule: "상세 공고 참조",
  target: "상세 공고 참조",
  cost: "상세 공고 참조",
  description:
    "교육내용: 귀농정책 소개 및 주요 품목별(초피, 밭미나리, 블루베리) 영농체험 및 현장견학 등 · 신청대상: 귀농귀촌희망인, 전입 6년 이내 관내 귀농귀촌인",
  capacity: null,
  applicationStart: "2026-04-02",
  applicationEnd: "2026-04-07",
  status: "마감",
  level: "초급",
  url: "https://www.rda.go.kr/young/custom/education/view.do?sId=1",
};

vi.mock("@/lib/data/programs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/programs")>();
  const extra = new Map([CRAWLED_PROGRAM, CRAWLED_AGRIX].map((p) => [p.id, p]));
  return {
    ...actual,
    getProgramByIdAsync: vi.fn(async (id: string) => extra.get(id) ?? actual.getProgramById(id)),
  };
});

vi.mock("@/lib/data/education", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/data/education")>();
  return {
    ...actual,
    getEducationByIdAsync: vi.fn(async (id: string) =>
      id === CRAWLED_RDA_COURSE.id ? CRAWLED_RDA_COURSE : actual.getEducationById(id),
    ),
  };
});

const programPage = await import("@/app/programs/[id]/page");
const educationPage = await import("@/app/education/[id]/page");
const { EligibilityCheck } = await import("@/components/programs/eligibility-check");

/** Modal·useMediaQuery 가 matchMedia 를 본다 — jsdom 에는 없다 */
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

/** JSON-LD 중 해당 @type 블록 */
function jsonLd(html: string, type: string): Record<string, unknown> {
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]) as Record<string, unknown>;
    if (data["@type"] === type) return data;
  }
  throw new Error(`JSON-LD ${type} 없음`);
}

/** 화면 글자만 (스크립트 제거) */
function visibleText(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ");
}

async function renderProgram(id: string): Promise<string> {
  return renderToStaticMarkup(await programPage.default({ params: Promise.resolve({ id }) }));
}

describe("지원사업 상세 — 수집 행 (crawl-rda-programs-aaacd312)", () => {
  let html = "";
  beforeAll(async () => {
    html = await renderProgram(CRAWLED_PROGRAM.id);
  });

  it("대상 연령·지원 유형·지원 금액 채움값이 화면에 없다", () => {
    const text = visibleText(html);
    expect(text).not.toContain("만 18~65세");
    expect(text).not.toContain("대상 연령");
    expect(text).not.toContain("지원 유형");
    expect(text).not.toContain("보조금");
    expect(text).not.toContain("상세 공고 참조");
  });

  it("짚을 조건이 없으면 자격 셀프 체크 탭·자격 조건 섹션을 그리지 않는다", () => {
    const text = visibleText(html);
    expect(text).not.toContain("자격 체크");
    expect(text).not.toContain("자격 셀프 체크");
    expect(text).not.toContain("자격 조건");
  });

  it("JSON-LD 에 serviceType·연령·채움값 audience 가 없다", () => {
    const ld = jsonLd(html, "GovernmentService");
    expect(ld.serviceType).toBeUndefined();
    expect(ld.audience).toBeUndefined();
    expect(JSON.stringify(ld)).not.toContain("suggestedMaxAge");
    expect(JSON.stringify(ld)).not.toContain("상세 공고 참조");
  });

  it("지역 칸은 시·도 상세로 간다 — ?stations= 는 308 strip 돼 지도 첫 화면이 됐다", () => {
    expect(html).toContain('href="/regions/gyeongbuk"');
    expect(html).not.toContain("/regions?stations=");
  });
});

describe("지원사업 상세 — agrix 수집 행은 원천 구분값으로 자격 체크가 남는다", () => {
  it("연령 항목 없이 '농가,농업법인/농업기관' 한 줄", async () => {
    const html = await renderProgram(CRAWLED_AGRIX.id);
    const text = visibleText(html);
    expect(text).toContain("자격 조건");
    expect(text).toContain("농가,농업법인/농업기관");
    expect(text).toContain("자격 셀프 체크하기");
    expect(text).not.toContain("만 18~65세");
    const ld = jsonLd(html, "GovernmentService");
    expect(ld.audience).toEqual({ "@type": "Audience", audienceType: "농가,농업법인/농업기관" });
  });
});

describe("지원사업 상세 — 큐레이션 행은 그대로 (SP-001·SP-018·SP-044)", () => {
  it("SP-001: 지원 유형·대상 연령·자격 체크·JSON-LD 연령", async () => {
    const html = await renderProgram("SP-001");
    const text = visibleText(html);
    expect(text).toContain("지원 유형");
    expect(text).toContain("융자");
    expect(text).toContain("대상 연령");
    expect(text).toContain("자격 셀프 체크하기");
    const ld = jsonLd(html, "GovernmentService");
    expect(ld.serviceType).toBe("융자");
    expect((ld.audience as Record<string, unknown>).suggestedMinAge).toBe(18);
  });

  it("SP-018: 금액 문구 그대로", async () => {
    const html = await renderProgram("SP-018");
    expect(visibleText(html)).toContain("농업인 위탁자 수수료 면제");
  });

  it("SP-044: 큐레이션 자격 문장은 채움값 규칙에 걸리지 않는다", async () => {
    const html = await renderProgram("SP-044");
    const text = visibleText(html);
    expect(text).toContain("자격 조건");
    expect(text).toContain("대상 연령");
    // SP-044 지역은 충청북도 → 시·도 상세
    expect(html).toContain('href="/regions/chungbuk"');
  });
});

describe("교육 상세 — 수집 행 (crawl-rda-education-a2b161c3)", () => {
  it("제목·설명에 기본값(오프라인·초급)이 없다", async () => {
    const meta = await educationPage.generateMetadata({ params: Promise.resolve({ id: CRAWLED_RDA_COURSE.id }) });
    expect(meta.title).toBe("2026년 신규농업인(귀농·귀촌)교육생 모집 — 정착 교육");
    expect(String(meta.description)).not.toMatch(/초급|오프라인/);
  });

  it("기본 정보 표에 채움값·기본값 행이 없다", async () => {
    const html = renderToStaticMarkup(
      await educationPage.default({ params: Promise.resolve({ id: CRAWLED_RDA_COURSE.id }) }),
    );
    const text = visibleText(html);
    for (const label of ["교육 유형", "교육 기간", "일정", "비용", "정원", "교육 대상"]) {
      expect(text, label).not.toContain(label);
    }
    expect(text).not.toContain("상세 공고 참조");
    expect(text).not.toContain("제한 없음");
    expect(text).not.toContain("초급");
    const ld = jsonLd(html, "Course");
    expect(ld.about).toBe("경상남도 귀농 정착 교육");
  });

  it("큐레이션 ED-008 은 그대로 — 제목 꼬리·비용 문구", async () => {
    const meta = await educationPage.generateMetadata({ params: Promise.resolve({ id: "ED-008" }) });
    expect(meta.title).toBe("영주 소백산귀농드림타운 체류형 농업창업교육 — 오프라인·초급 정착 교육");
    const html = renderToStaticMarkup(await educationPage.default({ params: Promise.resolve({ id: "ED-008" }) }));
    const text = visibleText(html);
    // 10/8 원문 대조 값 — 비용 문구가 수집 행 규칙에 지워지지 않는다
    expect(text).toContain("교육비 선납 원룸형 120만 원·투룸형 240만 원");
    expect(text).toContain("초급");
    // 정원은 30세대라 '명'으로 싣지 않는다(본문에 세대로 적음) — '제한 없음'도 아니다
    expect(text).toContain("30세대");
    expect(text).not.toContain("제한 없음");
  });
});

describe("EligibilityCheck — 연령 항목 숨김·빈 체크 방지", () => {
  const base = {
    programTitle: "친환경농업직불제",
    ageMin: 18,
    ageMax: 65,
    eligibilityDetail: "",
    organization: "농림축산식품부",
    sourceUrl: "https://www.example.go.kr/notice/1",
  };

  it("hideAge + 조건 0개면 아무것도 그리지 않는다 ('0개 중 0개 → 모두 충족' 방지)", () => {
    const { container } = render(<EligibilityCheck {...base} hideAge />);
    expect(container.innerHTML).toBe("");
  });

  it("hideAge 면 연령 항목 없이 공고 조건만 체크한다", () => {
    render(<EligibilityCheck {...base} hideAge eligibilityDetail="농가,농업법인/농업기관" />);
    fireEvent.click(screen.getByRole("button", { name: "자격 셀프 체크하기" }));
    const dialog = screen.getByRole("dialog", { name: "자격 셀프 체크" });
    const labels = within(dialog)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? "")
      .filter((l) => l.endsWith("미확인"));
    expect(labels).toEqual(["농가,농업법인/농업기관 미확인"]);
  });

  it("기본(큐레이션)은 연령 항목이 첫 줄로 남는다", () => {
    render(<EligibilityCheck {...base} eligibilityDetail="농촌지역 전입일로부터 만 6년 미경과 세대주." />);
    fireEvent.click(screen.getByRole("button", { name: "자격 셀프 체크하기" }));
    const dialog = screen.getByRole("dialog", { name: "자격 셀프 체크" });
    const labels = within(dialog)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? "")
      .filter((l) => l.endsWith("미확인"));
    expect(labels[0]).toBe("만 18~65세 미확인");
    expect(labels).toHaveLength(2);
  });
});
