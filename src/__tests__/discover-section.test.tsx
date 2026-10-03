import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ExperienceSection, OpportunitySection } from "@/components/landing/discover-section";
import type { FarmEvent } from "@/lib/data/events";
import type { EducationCourse } from "@/lib/data/education";
import type { SupportProgram } from "@/lib/data/programs";
import { kstToday, type ProgramStatus } from "@/lib/program-status";

/**
 * 오늘(KST)로부터 N일 뒤 — 마감 임박 배지처럼 "지금"에 의존하는 규칙을 고정 없이 검증한다.
 * 마감 일수는 KST 날짜로 센다(daysUntilDeadline) — UTC 날짜(toISOString)로 만들면 KST 0~9시에 하루 어긋나
 * "D-3" 이 "D-2" 로 나와 깨졌다(10/3 00시대 실측).
 */
function inDays(days: number): string {
  return kstToday(Date.now() + days * 86_400_000);
}

/* ── 실데이터와 같은 모양의 최소 행 ───────────────────────── */

function stay(over: Partial<FarmEvent> & { id: string }): FarmEvent {
  return {
    title: "대티골마을 농촌에서 살아보기 (귀농형)",
    region: "경상북도",
    sigungu: "영양군",
    organization: "영양군",
    type: "살아보기",
    date: "2026-10-01",
    dateEnd: "2026-11-30",
    applicationStart: "2026-09-09",
    applicationEnd: inDays(90),
    location: "경북 영양군",
    cost: "무료",
    description: "마을에서 살아보는 프로그램이에요.",
    capacity: 5,
    target: "귀농 희망자",
    url: "https://www.greendaero.go.kr/",
    status: "접수중",
    ...over,
  };
}

function course(over: Partial<EducationCourse> & { id: string }): EducationCourse {
  return {
    title: "2026년 하반기 공주시 귀농귀촌인 역량강화교육(귀촌과정) · 하반기 귀촌과정",
    region: "충청남도",
    sigungu: "공주시",
    organization: "공주시농업기술센터",
    type: "오프라인",
    duration: "상세 공고 참조",
    schedule: "2026-10-19 ~ 2026-10-21",
    target: "귀촌 희망 도시민",
    cost: "상세 공고 참조",
    description: "귀촌 준비 교육이에요.",
    capacity: 25,
    applicationStart: "2026-09-14",
    applicationEnd: inDays(90),
    status: "모집중",
    level: "초급",
    url: "https://www.greendaero.go.kr/",
    ...over,
  };
}

function program(over: Partial<SupportProgram> & { id: string }): SupportProgram & {
  programStatus: ProgramStatus;
} {
  return {
    title: "귀농 농업창업 및 주택구입 지원사업",
    category: "settlement",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "융자",
    supportAmount: "최대 3억원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibility: "귀농 5년 이내",
    applicationStart: "2026-01-01",
    applicationEnd: inDays(90),
    summary: "창업자금과 주택구입 자금을 융자로 지원해요.",
    sourceUrl: "https://www.mafra.go.kr/",
    programStatus: "모집중",
    ...over,
  } as SupportProgram & { programStatus: ProgramStatus };
}

const programs = [program({ id: "SP-001" }), program({ id: "SP-002" })];
const courses = [course({ id: "ED-A" }), course({ id: "ED-B", title: "연암대학교 귀촌 탐색 과정(51기)" })];
/** 마을 이름이 다른 3건 — 제목이 같으면 같은 모사업으로 보고 하나로 묶인다(아래 dedupe 테스트) */
const stays = [
  stay({ id: "e1" }),
  stay({ id: "e2", title: "청해진마을 농촌에서 살아보기 (귀촌형)" }),
  stay({ id: "e3", title: "율곡마을 농촌에서 살아보기 (귀촌형)" }),
];

interface RenderProps {
  activePrograms: Parameters<typeof OpportunitySection>[0]["activePrograms"];
  ongoingPrograms: Parameters<typeof OpportunitySection>[0]["ongoingPrograms"];
  courses: EducationCourse[];
  events: FarmEvent[];
}

/** 랜딩과 같은 순서로 두 섹션을 이어 렌더한다 (지원사업·교육 → 체험·행사) */
function renderHtml(over: Partial<RenderProps> = {}) {
  const p: RenderProps = {
    activePrograms: programs,
    ongoingPrograms: [],
    courses,
    events: stays,
    ...over,
  };
  return renderToStaticMarkup(
    <>
      <OpportunitySection activePrograms={p.activePrograms} ongoingPrograms={p.ongoingPrograms} courses={p.courses} />
      <ExperienceSection events={p.events} />
    </>,
  );
}

describe("OpportunitySection·ExperienceSection — 랜딩 지원사업·교육 / 체험·행사 (9/30 → 10/1 분리)", () => {
  it("네 유형이 전부 비면 두 섹션 모두 렌더하지 않는다", () => {
    expect(renderHtml({ activePrograms: [], courses: [], events: [] })).toBe("");
  });

  it("이미지 유무로 섹션이 갈린다 — 지원사업·교육은 그리드(이미지 0), 체험은 사진 캐러셀", () => {
    const html = renderHtml();
    const opp = html.slice(0, html.indexOf('aria-label="직접 가 보는 농촌"'));
    const exp = html.slice(html.indexOf('aria-label="직접 가 보는 농촌"'));
    expect(opp).toContain('aria-label="지금 열린 기회"');
    expect(opp).not.toContain("<img");
    expect(opp).not.toContain("슬라이드 제어"); // 자동 넘김·페이저 없음
    expect(exp).toContain('data-track="discover:experience:card"');
    expect(exp).toContain("<img");
  });

  it("카드가 있는 탭만 만든다 — 행사 0건이면 탭·패널 모두 없다", () => {
    const html = renderHtml();
    expect(html).toContain('data-track="discover:programs:card"');
    expect(html).toContain('data-track="discover:education:card"');
    expect(html).toContain('data-track="discover:experience:card"');
    expect(html).not.toContain('data-track="discover:festival:card"');
    // 탭 = 지원사업·교육 2개 (체험 섹션은 탭 1개라 탭 바를 그리지 않는다)
    expect(html.match(/role="tab"/g)?.length).toBe(2);
  });

  it("비활성 패널도 SSR 에 남는다 — 탭별 링크 수 = 카드 수 (조건부 렌더 금지)", () => {
    const html = renderHtml();
    expect(html.match(/href="\/programs\/SP-\d+"/g)?.length).toBe(2);
    expect(html.match(/href="\/education\/ED-[AB]"/g)?.length).toBe(2);
    expect(html.match(/href="\/events\/e\d"/g)?.length).toBe(3);
    // 첫 패널만 보이고 나머지는 hidden — display 를 이기도록 CSS 에 [hidden] 규칙이 있다
    expect(html.match(/role="tabpanel"/g)?.length).toBe(2);
    expect(html.match(/hidden=""/g)?.length).toBe(1);
  });

  it("탭 라벨은 짧게(2~4자)이고 건수 배지는 없다(10/2 QA — 상한 8장 수가 히어로 수치와 어긋나 보였다), 기본 탭은 지원사업", () => {
    const html = renderHtml();
    for (const label of ["지원사업", "교육", "체험"]) expect(html).toContain(label);
    // 탭 버튼 안에는 라벨 글자만
    const tabs = [...html.matchAll(/<button[^>]*role="tab"[^>]*>(.*?)<\/button>/g)].map((m) => m[1]);
    expect(tabs).toEqual(["지원사업", "교육"]);
    // 첫 탭만 aria-selected="true"
    expect(html.match(/aria-selected="true"/g)?.length).toBe(1);
    const firstTab = html.slice(html.indexOf('role="tab"'));
    expect(firstTab.slice(0, 400)).toContain("지원사업");
  });

  it("모두 보기는 활성 탭 목적지(지원사업 → /programs)이고 라우트가 실존한다", () => {
    const html = renderHtml();
    expect(html).toContain('data-track="discover:programs:view_all"');
    expect(html).toContain('href="/programs"');
    for (const route of [["programs"], ["education"], ["events"], ["events", "[id]"], ["education", "[id]"], ["programs", "[id]"]]) {
      expect(existsSync(join(process.cwd(), "src", "app", ...route, "page.tsx"))).toBe(true);
    }
  });

  it("지원사업 카드 — 금액이 첫 줄, 신청 기간·연령이 둘째 줄, 이미지 없음(텍스트 카드)", () => {
    const html = renderHtml();
    expect(html).toContain("최대 3억원");
    expect(html).toContain("신청 1.1 ~");
    expect(html).toContain("만 18~65세");
    expect(html).toContain("농림축산식품부");
    // 지원사업 패널엔 배경 이미지가 없다 (getEventImage/일러스트 경로가 섞이지 않는다)
    const panel = html.slice(html.indexOf('data-track="discover:programs:card"'));
    expect(panel.slice(0, 900)).not.toContain("/images/regions/");
  });

  it("상시·연중 건은 진행·예정 뒤에 붙고 '상시 모집' 으로 표기된다", () => {
    const html = renderHtml({
      ongoingPrograms: [program({ id: "SP-900", applicationEnd: "9999-12-31" })],
    });
    expect(html).toContain("상시 모집");
    // 9999-12-31 이 날짜로 새지 않는다 — 상시 카드만 잘라 본다(다른 카드의 마감일 inDays(90)이
    // 10/2 기준 정확히 12.31 이라 페이지 전체로 보면 날짜에 따라 깨졌다)
    const ongoingCard = html.slice(html.indexOf('href="/programs/SP-900"'), html.indexOf("</a>", html.indexOf('href="/programs/SP-900"')));
    expect(ongoingCard).not.toContain("12.31");
    expect(html.indexOf('href="/programs/SP-001"')).toBeLessThan(html.indexOf('href="/programs/SP-900"'));
  });

  it("교육 카드 — 모사업명만 남기고, 일정·접수 마감·정원을 두 줄로", () => {
    const html = renderHtml();
    expect(html).toContain("2026년 하반기 공주시 귀농귀촌인 역량강화교육(귀촌과정)");
    expect(html).not.toContain("역량강화교육(귀촌과정) · 하반기");
    expect(html).toContain("10.19 ~ 10.21"); // schedule 에서 도출
    expect(html).toContain("25명 모집");
    expect(html).toContain("충남 공주시"); // shortName + 시·군·구
    expect(html).toContain("오프라인"); // 유형 칩
    // 10/1 분리 후 교육은 정보 카드 — 시·도 배경 일러스트를 붙이지 않는다
    expect(html).not.toContain("chungnam");
  });

  it("교육 — 같은 모사업의 시간대별 중복은 1건만, 전국(온라인)은 일러스트 없이 텍스트 카드", () => {
    const html = renderHtml({
      courses: [
        course({
          id: "ED-1",
          title: "유형특화과정-예비귀농인 · [비대면] 10/1 (10시~12시)",
          region: "전국",
          sigungu: undefined,
          type: "온라인",
        }),
        course({
          id: "ED-2",
          title: "유형특화과정-예비귀농인 · [비대면] 10/1 (13시~15시)",
          region: "전국",
          sigungu: undefined,
          type: "온라인",
        }),
        course({
          id: "ED-3",
          title: "유형특화과정-예비귀농인 · [비대면] 10/1 (15시~17시)",
          region: "전국",
          sigungu: undefined,
          type: "온라인",
        }),
      ],
    });
    expect(html.match(/href="\/education\/ED-\d"/g)?.length).toBe(1);
    // 전국은 regionFallbackImage 가 강원 일러스트를 돌려주므로 이미지를 붙이지 않는다
    expect(html).not.toContain("/images/regions/gangwon");
  });

  it("교육 — 예비 귀농·귀촌 과정이 현직 농업인 기술교육보다 앞", () => {
    const html = renderHtml({
      courses: [
        course({
          id: "ED-TECH",
          title: "2026년 병해충 진단 및 방제 교육",
          target: "농업인",
          applicationEnd: inDays(1),
        }),
        course({
          id: "ED-SETTLE",
          title: "연암대학교 귀촌 탐색 과정(51기)",
          applicationEnd: inDays(30),
        }),
      ],
    });
    expect(html.indexOf('href="/education/ED-SETTLE"')).toBeLessThan(html.indexOf('href="/education/ED-TECH"'));
  });

  it("체험(살아보기) 카드 문구 — 마을명·지역 축약·유형 칩·운영 기간·짧은 마감 표기", () => {
    const html = renderHtml();
    expect(html).toContain("대티골마을"); // "농촌에서 살아보기 (귀농형)" 보일러플레이트 제거
    expect(html).not.toContain("대티골마을 농촌에서");
    expect(html).toContain("경북 영양군");
    expect(html).toContain("귀농형"); // village_type 이 비어도 제목에서 도출
    expect(html).toContain("10.1부터 2개월 살아보기");
    expect(html).toContain("5명 모집");
  });

  it("체험(살아보기 아님) — 첫 줄이 '언제·며칠' 로 바뀐다", () => {
    const html = renderHtml({
      events: [
        stay({
          id: "t1",
          type: "일일체험",
          title: "2026 춘천시 귀농귀촌 팸투어_시설원예",
          date: "2026-10-13",
          dateEnd: "2026-10-13",
          villageType: undefined,
        }),
      ],
    });
    expect(html).toContain("10.13 하루");
    expect(html).toContain("일일체험"); // 유형 칩
    // 머리말("살아보기·체험부터…")은 빼고 카드 안만 본다
    expect(html.slice(html.indexOf('data-track="discover:experience:card"'))).not.toContain("살아보기");
  });

  it("마감 임박(7일 이내)일 때만 D-N 배지, 접수예정은 신청 시작일 표기", () => {
    const html = renderHtml({
      events: [
        stay({ id: "u1", applicationEnd: inDays(3) }),
        stay({ id: "u2", title: "청해진마을 농촌에서 살아보기 (귀촌형)" }), // 90일 뒤 → 배지 없음
        stay({
          id: "u3",
          title: "율곡마을 농촌에서 살아보기 (귀촌형)",
          status: "접수예정",
          applicationStart: "2026-12-01",
          applicationEnd: "2026-12-20",
        }),
      ],
    });
    expect((html.match(/D-\d+|오늘 마감/g) ?? []).length).toBe(1);
    expect(html).toContain("D-3");
    expect(html).toContain("12.1부터 신청");
    expect(html).toContain("접수예정");
  });

  it("행사 탭 — 박람회·설명회가 들어오면 탭이 생기고 장소·기간이 표기된다", () => {
    const html = renderHtml({
      events: [
        ...stays,
        stay({
          id: "f1",
          type: "박람회",
          title: "2026 수원 케이팜 (KFARM SUWON)",
          region: "경기도",
          sigungu: "수원시",
          date: "2026-10-29",
          dateEnd: "2026-10-31",
          villageType: undefined,
        }),
      ],
    });
    expect(html).toContain('data-track="discover:festival:card"');
    expect(html.match(/role="tab"/g)?.length).toBe(4); // 지원사업·교육 + 체험·행사
    expect(html.match(/aria-selected="true"/g)?.length).toBe(2); // 섹션마다 첫 탭
    expect(html).toContain("10.29 ~ 10.31");
    expect(html).toContain("박람회");
  });

  it("마감 건은 어느 탭에도 올라가지 않는다", () => {
    const html = renderHtml({
      courses: [course({ id: "ED-CLOSED", status: "마감" })],
      events: [stay({ id: "x1", status: "마감" })],
    });
    expect(html).not.toContain("ED-CLOSED");
    expect(html).not.toContain("/events/x1");
  });

  it("체험 — 같은 제목의 회차별 중복(팸투어 2건)은 1장으로 묶인다", () => {
    const html = renderHtml({
      events: [
        stay({
          id: "d1",
          type: "일일체험",
          title: "2026 춘천시 귀농귀촌 팸투어_시설원예",
          date: "2026-10-13",
          dateEnd: "2026-10-13",
        }),
        stay({
          id: "d2",
          type: "일일체험",
          title: "2026 춘천시 귀농귀촌 팸투어_시설원예",
          date: "2026-10-14",
          dateEnd: "2026-10-14",
        }),
      ],
    });
    expect(html.match(/href="\/events\/d\d"/g)?.length).toBe(1);
  });

  it("탭 상한 8장 — 9건을 주면 8장만 카드가 된다", () => {
    const many = Array.from({ length: 9 }, (_, i) => stay({ id: `m${i}`, title: `${i}번마을 농촌에서 살아보기 (귀촌형)` }));
    const html = renderHtml({ events: many });
    expect(html.match(/href="\/events\/m\d"/g)?.length).toBe(8);
  });
});

/* ══════════════ 클라이언트 동작 (10/2 QA) ══════════════ */

function mockMedia(desktop: boolean) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: q.includes("min-width: 1024px") ? desktop : false,
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

/** jsdom 은 :focus-visible 을 늘 false 로 답한다 — 키보드 포커스를 흉내 내려면 지금 포커스된 요소만 true */
function fakeKeyboardFocusVisible() {
  const orig = Element.prototype.matches;
  vi.spyOn(Element.prototype, "matches").mockImplementation(function (this: Element, sel: string) {
    if (sel === ":focus-visible") return this === document.activeElement;
    return orig.call(this, sel);
  });
}

const festival = stay({
  id: "f1",
  type: "박람회",
  title: "2026 수원 케이팜 (KFARM SUWON)",
  region: "경기도",
  sigungu: "수원시",
  date: "2026-10-29",
  dateEnd: "2026-10-31",
  villageType: undefined,
});

describe("체험·행사 캐러셀 — 클라이언트 동작 (10/2 QA)", () => {
  // jsdom 에는 요소 scrollTo 가 없다 — 트랙 이동은 레이아웃이 있는 실측(Playwright)에서 본다
  const proto = HTMLElement.prototype as unknown as { scrollTo?: unknown };
  const hadScrollTo = "scrollTo" in proto;
  if (!hadScrollTo) proto.scrollTo = () => {};
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("행사 탭의 '모두 보기'는 /events — 박람회만 거르면 탭에서 본 설명회·축제가 목록에 없다 (A⚪12)", () => {
    mockMedia(true);
    render(<ExperienceSection events={[...stays, festival]} />);
    expect(screen.getByRole("link", { name: /모두 보기/ })).toHaveAttribute("href", "/events");
    fireEvent.click(screen.getByRole("tab", { name: "행사" }));
    expect(screen.getByRole("link", { name: /모두 보기/ })).toHaveAttribute("href", "/events");
  });

  it("데스크탑 — 비활성 카드를 마우스로 누르면 그 카드로 옮기기만(이동 막음), 키보드 Enter(click detail 0)는 막지 않는다 (A⚪8)", () => {
    mockMedia(true);
    render(<ExperienceSection events={stays} />);
    const cards = document.querySelectorAll<HTMLAnchorElement>('a[data-track="discover:experience:card"]');
    expect(cards.length).toBe(3);
    // dispatchEvent 반환값 false = preventDefault 됨
    expect(fireEvent.click(cards[1], { detail: 1 })).toBe(false);
    expect(fireEvent.click(cards[1], { detail: 0 })).toBe(true);
    // 활성 카드(첫 장)는 마우스로도 그대로 이동
    expect(fireEvent.click(cards[0], { detail: 1 })).toBe(true);
  });

  it("키보드 포커스가 캐러셀 안에 있으면 마우스가 나가도 자동 넘김이 멈춘 채다 (C-Y10)", () => {
    mockMedia(true);
    fakeKeyboardFocusVisible();
    render(<ExperienceSection events={stays} />);
    const progress = () => document.querySelector("[style*='--dc-interval']");
    expect(progress()).not.toHaveAttribute("data-paused"); // 자동 넘김 중
    const card = document.querySelector<HTMLAnchorElement>('a[data-track="discover:experience:card"]')!;
    const carousel = card.closest("ul")!.parentElement!.parentElement!;
    act(() => {
      card.focus();
      fireEvent.focusIn(card);
    });
    expect(progress()).toHaveAttribute("data-paused");
    fireEvent.mouseEnter(carousel);
    fireEvent.mouseLeave(carousel);
    expect(progress()).toHaveAttribute("data-paused"); // 예전엔 여기서 다시 돌았다
    // 포커스가 캐러셀 밖으로 나가면 다시 돈다
    act(() => {
      card.blur();
      fireEvent.focusOut(card, { relatedTarget: document.body });
    });
    expect(progress()).not.toHaveAttribute("data-paused");
  });

  it("정지 버튼은 상태를 라벨로만 알린다 — aria-pressed 와 라벨을 같이 바꾸지 않는다 (APG)", () => {
    mockMedia(true);
    render(<ExperienceSection events={stays} />);
    const btn = screen.getByRole("button", { name: "자동 넘김 멈추기" });
    expect(btn).not.toHaveAttribute("aria-pressed");
    fireEvent.click(btn);
    expect(screen.getByRole("button", { name: "자동 넘김 다시 시작" })).not.toHaveAttribute("aria-pressed");
  });
});
