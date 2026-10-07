/**
 * 10/6 전체 QA 1차 — 통합 검색(FE-S) 회귀 가드
 *
 *  - Q1-F1  교육 상태는 접수 기간에서 파생 (정적 status "모집중"이 4/17 마감 과정에 남아 있었다)
 *  - Q2-W1  기상 관측소 링크는 소속 시·도 상세 — `/regions?stations=` 는 normalize 308 로 잘렸다
 *  - Q2-X5  `/assess`(넘기기 전용) 링크 대신 `/match?mode=assess`
 *  - Q4-W5  시·군 지식 패널에 다른 시·군 전용 지원사업·교육이 서지 않는다
 *  - Q4-W6  직답(FAQ·작물 hoist) 적대 입력 가드 — "난이도" 일반어화, 작물 접두 분리는 나머지 2자 이상만
 *  - Q4-W7  한 글자 검색어는 정확 일치·단어 경계만
 *  - Q4     같은 페이지 카드 중복("귀농 비용" /costs 2장), 동음("가지"→전정·도장지, "신고배"→정보 수정 요청)
 */
import { describe, it, expect } from "vitest";

import {
  searchAll,
  searchAllGrouped,
  getNoResultSuggestions,
  buildCropPanel,
  buildSearchAnswer,
  type SearchItem,
} from "@/lib/data/search-index";
import { buildEntityPanel, localSigunguIdsOf } from "@/lib/data/entity-panel";
import { SEARCH_FAQS } from "@/lib/data/search-faq";
import { CROPS } from "@/lib/data/crops";
import { EDUCATION_COURSES } from "@/lib/data/education";
import { SIGUNGUS, getSigungusBySidoId } from "@/lib/data/sigungus";
import { STATIONS } from "@/lib/data/stations";
import { deriveStatus } from "@/lib/program-status";
import { lookupRegionItem } from "@/components/search/region-lookup";
import { NO_DIRECT_ANSWER } from "./fixtures/search-adversarial-corpus";

const WORD_SPLIT = /[\s·•,、/()[\]{}「」『』<>〈〉《》"'‘’“”:;!?.~+&|=—–-]+/;
const words = (text: string) => text.toLowerCase().split(WORD_SPLIT).filter(Boolean);

/** 검색 결과 전부 — 같은 검색어를 여러 번 쓰는 단언용 */
const all = (q: string): SearchItem[] => searchAll(q);

// ─── Q1-F1 교육 상태 ───

describe("교육 상태는 접수 기간에서 파생한다 (Q1-F1)", () => {
  it("검색 인덱스 교육 배지 = deriveStatus(접수 시작, 접수 마감) — 손으로 적은 status 를 쓰지 않는다", () => {
    for (const course of EDUCATION_COURSES) {
      const hit = all(course.title).find((r) => r.type === "education" && r.id === course.id);
      if (!hit) continue; // 제목이 다른 항목에 가려져도 배지 규칙만 본다
      expect(hit.badge, course.id).toBe(deriveStatus(course.applicationStart, course.applicationEnd));
    }
  });
});

// ─── Q2-W1 관측소 링크 ───

describe("기상 관측소 결과는 지역 비교(관측소 선택)로 간다 (Q2-W1 → 10/6 2차)", () => {
  it("어떤 결과도 normalize 가 잘라 내는 `/regions?stations=` 로 링크하지 않는다", () => {
    for (const q of ["보성", "순천", "광주", "전남 귀농", "서귀포", "금산", "영주", "제주"]) {
      expect(all(q).filter((r) => r.href.startsWith("/regions?")).map((r) => r.title), q).toEqual([]);
    }
  });

  it("관측소 항목은 `/regions/compare?stations={지점번호}` 이고, 렌더러 판정은 관측소다", () => {
    for (const st of STATIONS) {
      const item = all(st.name).find((r) => r.type === "region" && r.id === st.stnId);
      if (!item) continue;
      expect(item.href, st.name).toBe(`/regions/compare?stations=${st.stnId}`);
      expect(lookupRegionItem(item).kind, st.name).toBe("station");
    }
  });

  it("'제주' 바로 찾은 결과의 관측소는 시·도 카드와 다른 곳으로 간다", () => {
    const { pinned } = searchAllGrouped("제주");
    const station = pinned.find((p) => p.type === "region" && STATIONS.some((st) => st.stnId === p.id));
    const province = pinned.find((p) => p.id === "province-jeju");
    expect(station?.href).toBe("/regions/compare?stations=184");
    expect(province?.href).toBe("/regions/jeju");
  });

  it("관측소가 아닌 시·도 카드는 시·도로 판정한다", () => {
    expect(lookupRegionItem({ id: "province-jeonnam", href: "/regions/jeonnam" }).kind).toBe("province");
  });
});

// ─── Q2-X5 /assess ───

describe("`/assess`(넘기기 전용) 대신 `/match?mode=assess` 로 직행한다 (Q2-X5)", () => {
  it("FAQ 데이터에 `/assess` 링크가 없다", () => {
    expect(SEARCH_FAQS.filter((f) => f.href === "/assess").map((f) => f.title)).toEqual([]);
  });

  it("진단 관련 검색 결과에 `/assess` 가 없다", () => {
    for (const q of ["진단", "적합도", "테스트", "준비도", "작물 추천 받고 싶어", "정착 유형 테스트"]) {
      const hrefs = all(q).map((r) => r.href);
      expect(hrefs.filter((h) => h === "/assess"), q).toEqual([]);
    }
    expect(all("적합도").some((r) => r.href === "/match?mode=assess")).toBe(true);
  });
});

// ─── Q4-W7 한 글자 ───

describe("한 글자 검색어는 정확 일치·단어 경계만 (Q4-W7)", () => {
  /** 그 글자가 제목·배지·키워드·부제 중 어딘가에 **낱말 전체**로 있는가 */
  const hasWord = (r: SearchItem, ch: string) =>
    r.title.toLowerCase() === ch ||
    (r.badge ?? "").toLowerCase() === ch ||
    [r.title, r.subtitle, ...r.keywords].some((f) => words(f).includes(ch));

  it.each(["배", "감", "무", "밤", "콩", "쌀"])("'%s' 결과는 전부 그 글자를 낱말로 담는다 (작물 hoist 포함)", (ch) => {
    const rs = all(ch);
    expect(rs.length).toBeGreaterThan(0);
    // 동의어 확장("쌀"→벼)은 낱말 "벼"로 맞은 것도 인정
    const syn: Record<string, string[]> = { 쌀: ["벼"] };
    const strangers = rs.filter((r) => ![ch, ...(syn[ch] ?? [])].some((c) => hasWord(r, c)));
    expect(strangers.map((r) => `${r.type}:${r.title}`)).toEqual([]);
  });

  it("'배'에 배추·배동주·재배(용어 배지)·배수가, '감'에 감자·감귤이, '무'에 무주·무안·무농약이 섞이지 않는다", () => {
    const bae = all("배").map((r) => r.title);
    expect(bae).toContain("배");
    for (const t of ["배추", "배수", "시설재배"]) expect(bae).not.toContain(t);
    expect(bae.some((t) => t.startsWith("배동주"))).toBe(false);
    const gam = all("감").map((r) => r.title);
    expect(gam).toContain("감");
    expect(gam).not.toContain("감자");
    expect(gam).not.toContain("감귤");
    const mu = all("무").map((r) => r.title);
    expect(mu).toContain("무");
    for (const t of ["무주군", "무안군", "무농약"]) expect(mu).not.toContain(t);
  });

  it("지식 패널은 그대로 — '배'·'감'·'무' 작물 패널", () => {
    for (const ch of ["배", "감", "무"]) expect(buildCropPanel(ch)?.cropName).toBe(ch);
  });

  it("'삼'은 인삼 뜻으로 — 삼척은 섞이지 않는다", () => {
    const titles = all("삼").map((r) => r.title);
    expect(titles).toContain("인삼");
    expect(titles.some((t) => t.startsWith("삼척"))).toBe(false);
  });

  it("'집'에 '대표 누리집' 센터·'정보 수집' 단계가 섞이지 않는다", () => {
    const titles = all("집").map((r) => r.title);
    expect(titles.some((t) => t.includes("누리집"))).toBe(false);
    expect(titles.some((t) => t.includes("수집"))).toBe(false);
  });
});

// ─── Q4-W6 직답 적대 입력 ───

describe("직답(FAQ·작물 hoist) 적대 입력 가드 (Q4-W6)", () => {
  it(`NO_DIRECT_ANSWER ${NO_DIRECT_ANSWER.length}건 — 다른 뜻의 복합어에는 직답·히어로가 없다`, () => {
    const leaked = NO_DIRECT_ANSWER.flatMap((q) => {
      const { pinned } = searchAllGrouped(q);
      const heroes = [
        buildCropPanel(q) ? "작물 패널" : null,
        buildSearchAnswer(q) ? "답변 카드" : null,
        buildEntityPanel(q) ? "엔티티 패널" : null,
      ].filter(Boolean);
      return [...pinned.map((p) => `${q}→${p.type}:${p.title}`), ...heroes.map((h) => `${q}→${h}`)];
    });
    expect(leaked).toEqual([]);
  });

  it("'X 난이도·소득·재배지'(연관 검색어)에 다른 작물의 재배 FAQ 가 직답으로 서지 않는다", () => {
    const cropHref = new Map(CROPS.map((c) => [`/crops/${c.id}`, c.name]));
    const leaked: string[] = [];
    for (const crop of CROPS) {
      for (const ctx of ["난이도", "소득", "재배지"]) {
        const q = `${crop.name} ${ctx}`;
        for (const p of searchAllGrouped(q).pinned) {
          const other = cropHref.get(p.href.split("#")[0]);
          if (p.id.startsWith("faq-") && other && other !== crop.name) leaked.push(`${q}→${p.title}`);
        }
      }
    }
    expect(leaked).toEqual([]);
  });

  it("답변 카드(직답 히어로)도 같은 가드 — 다른 뜻 복합어 + 문맥어에는 답변 카드가 없다", () => {
    for (const q of ["사과문 난이도", "고추장 소득", "여러가지 난이도", "대국민사과 재배지", "차량대파 가격"]) {
      expect(buildSearchAnswer(q), q).toBeNull();
    }
    // 품종·산지 복합어는 그 작물로 — "청양고추 소득" → 고추
    expect(buildSearchAnswer("청양고추 소득")?.cropName).toBe("고추");
  });

  it("조사 붙은 작물 + 문맥어는 그 작물 — 예전엔 '재배지'의 '배'를 먼저 잡아 '포도를 재배지'가 배 답변이었다", () => {
    const wrong: string[] = [];
    for (const crop of CROPS) {
      for (const ctx of ["재배지", "재배법", "수익", "난이도"]) {
        for (const q of [`${crop.name}를 ${ctx}`, `${crop.name}은 ${ctx}`]) {
          const got = buildSearchAnswer(q)?.cropName;
          if (got !== crop.name) wrong.push(`${q}→${got ?? "-"}`);
        }
      }
    }
    expect(wrong).toEqual([]);
    expect(buildSearchAnswer("방울토마토를 키우는 법")?.cropName).toBe("방울토마토");
  });

  it("작물 접두 분리는 나머지가 2자 이상일 때만 — '사과문'·'고추장'은 한 낱말, '사과재배지'는 분리", () => {
    expect(all("사과문")).toEqual([]);
    expect(all("고추장").some((r) => r.type === "crop")).toBe(false);
    expect(all("사과재배지").length).toBeGreaterThan(3);
  });

  it("예외는 농사 맥락의 알려진 한 글자 — '사과밭'·'고추묘'는 작물로, 나뉜 한 글자는 와일드카드가 아니다", () => {
    const apple = searchAllGrouped("사과밭");
    expect(apple.pinned[0]?.title).toBe("사과");
    // "밭" 부분 일치(밭농업직불금·밭작물·텃밭)가 섞이지 않는다
    expect([...apple.pinned, ...apple.rest].some((r) => /밭농업|밭작물|텃밭/.test(r.title))).toBe(false);
    expect(searchAllGrouped("고추묘").pinned[0]?.title).toBe("고추");
  });

  it("품종·산지 복합어는 FAQ 1건에 막히지 않고 자동 대체로 넘어간다 — 미니사과·영주사과·신고배", () => {
    for (const [q, crop] of [["미니사과", "사과"], ["영주사과", "사과"], ["신고배", "배"], ["김천포도", "포도"]] as const) {
      expect(all(q), q).toEqual([]);
      expect(getNoResultSuggestions(q), q).toContain(crop);
    }
  });

  it("실재 이름 키워드는 낱말 첫머리 + 조사·문맥어·행정 접미만 — 전남귀농·제주시·제주특별자치도는 그대로", () => {
    const faqTitles = (q: string) => searchAllGrouped(q).pinned.filter((p) => p.id.startsWith("faq-")).map((p) => p.title);
    expect(faqTitles("전남귀농")).toContain("전남 지역 정보");
    expect(faqTitles("제주시")).toContain("제주 지역 정보");
    expect(faqTitles("제주특별자치도")).toContain("제주 지역 정보");
    expect(faqTitles("사과를")).toContain("사과 재배 정보");
    expect(faqTitles("제주공항")).toEqual([]);
    // 비용 FAQ 의 "예산"(budget)이 예산군에 붙지 않는다
    expect(faqTitles("예산군")).not.toContain("정착 비용 가이드");
  });

  it("자연어 질문의 일반 키워드 매칭은 그대로 — '돈 얼마나 들어'·'농지은행이 뭐야'", () => {
    expect(searchAllGrouped("귀농 비용 얼마나 들어").pinned.some((p) => p.href === "/costs")).toBe(true);
    expect(searchAllGrouped("농지은행이 뭐야").pinned.some((p) => p.title === "농지은행 안내")).toBe(true);
  });
});

// ─── Q4 같은 페이지 카드 중복 ───

describe("같은 페이지로 가는 카드는 한 장 (Q4)", () => {
  it("'귀농 비용' — /costs 카드가 한 장뿐", () => {
    expect(all("귀농 비용").filter((r) => r.href === "/costs")).toHaveLength(1);
  });

  it.each(["귀농 비용", "비용", "농지은행", "청년농", "귀촌", "선배", "맞춤 추천", "진단", "적합도"])(
    "'%s' — 직답 FAQ 와 같은 페이지의 가이드 카드가 목록에 다시 서지 않고, FAQ id 도 겹치지 않는다",
    (q) => {
      const { pinned, rest } = searchAllGrouped(q);
      const faqHrefs = pinned.filter((p) => p.id.startsWith("faq-")).map((p) => p.href);
      expect(new Set(faqHrefs).size).toBe(faqHrefs.length);
      const dup = rest.filter((r) => r.type === "guide" && faqHrefs.includes(r.href));
      expect(dup.map((r) => r.title)).toEqual([]);
      const keys = [...pinned, ...rest].map((r) => `${r.type}-${r.id}`);
      expect(new Set(keys).size).toBe(keys.length);
    },
  );
});

// ─── Q4 동음 ───

describe("동음 — 작물명 검색에 다른 뜻의 낱말이 붙지 않는다 (Q4)", () => {
  it("'가지'·'가지 난이도'·'가지 소득'에 전정·도장지·결과지·간작·혼작이 없다", () => {
    for (const q of ["가지", "가지 난이도", "가지 소득", "가지 재배지", "가지재배"]) {
      const titles = all(q).map((r) => r.title);
      for (const t of ["전정", "도장지", "결과지", "간작", "혼작", "이모작"]) expect(titles, q).not.toContain(t);
    }
    expect(all("가지").some((r) => r.type === "program")).toBe(true); // 가지 관련 지원사업(작물 키워드 정확 일치)은 그대로
  });

  it("작물명 검색에서 용어 별칭 부분 일치 제외 — 체리→방울토마토(체리토마토)·쌀→메밀(메밀쌀), 토마토→방울토마토(용어명)는 유지", () => {
    expect(all("체리").filter((r) => r.type === "glossary").map((r) => r.title)).not.toContain("방울토마토");
    expect(all("쌀").filter((r) => r.type === "glossary").map((r) => r.title)).not.toContain("메밀");
    expect(all("토마토").filter((r) => r.type === "glossary").map((r) => r.title)).toContain("방울토마토");
  });

  it("'신고배'에 '정보 수정 요청'이 서지 않는다", () => {
    expect(all("신고배").map((r) => r.title)).not.toContain("정보 수정 요청");
  });

  it("장소 아닌 말의 동의어가 지명이면 버린다 — '돈'→예산(budget)이 예산군을 끌어오지 않고, '충북'은 충청북도를 찾는다", () => {
    expect(all("돈").some((r) => r.title.startsWith("예산군"))).toBe(false);
    expect(all("충북").some((r) => r.type === "region")).toBe(true);
  });
});

// ─── Q4-W5 시·군 지식 패널 ───

describe("시·군 지식 패널 — 다른 시·군 전용 사업·교육은 빼고 이 시·군 것을 앞에 (Q4-W5)", () => {
  /** 제목이 같은 시·도의 다른 시·군 정식 명칭으로 시작하는가 */
  const otherSigunguPrefix = (title: string, sidoId: string, selfId: string) =>
    getSigungusBySidoId(sidoId).find((sg) => sg.id !== selfId && title.startsWith(sg.name));

  it("모든 시·군·구 패널의 지원사업·교육 묶음에 다른 시·군 이름으로 시작하는 항목이 없다", () => {
    const leaked: string[] = [];
    for (const sg of SIGUNGUS) {
      const panel = buildEntityPanel(sg.name);
      if (panel?.kind !== "sigungu") continue;
      for (const group of panel.groups) {
        if (group.label === "체험·행사") continue; // 박람회·살아보기는 다른 시·군 사람도 찾아간다
        for (const item of group.items) {
          const other = otherSigunguPrefix(item.title, sg.sidoId, sg.id);
          if (other) leaked.push(`${sg.name} → ${item.title} (${other.name})`);
        }
      }
    }
    expect(leaked).toEqual([]);
  });

  it.each([
    ["예천", ["청도군", "고령군", "안동시"]],
    ["의성", ["청도군", "고령군", "안동시"]],
    ["옥천", ["괴산군"]],
    ["무주", ["진안"]],
    ["서산", ["공주시"]],
  ])("'%s' 패널에 %j 사업이 없다", (q, others) => {
    const panel = buildEntityPanel(q);
    expect(panel?.kind).toBe("sigungu");
    const titles = panel!.groups.flatMap((g) => g.items.map((i) => i.title));
    for (const o of others) expect(titles.some((t) => t.includes(o)), o).toBe(false);
  });

  it("이 시·군 전용 사업이 맨 앞 — 서산(SP-074)·진안(SP-049)·영주 교육(체류형)", () => {
    const first = (q: string, label: string) =>
      buildEntityPanel(q)?.groups.find((g) => g.label === label)?.items[0]?.title ?? "";
    expect(first("서산", "신청할 수 있는 지원사업")).toContain("서산시");
    const jinan = buildEntityPanel("진안")?.groups.find((g) => g.label === "신청할 수 있는 지원사업");
    if (jinan?.items.some((i) => i.title.includes("진안"))) {
      expect(jinan.items[0].title).toContain("진안");
    }
    const yeongju = buildEntityPanel("영주")?.groups.find((g) => g.label === "정착 교육");
    if (yeongju?.items.some((i) => i.title.startsWith("영주"))) {
      expect(yeongju.items[0].title.startsWith("영주")).toBe(true);
    }
  });

  it("시·군 판정 규칙 — 접미 붙은 정식 명칭·약칭(+조사)만, 시·도와 같은 약칭·괄호 속 문의처·우연한 접두는 제외", () => {
    const of = (region: string, title: string, organization: string) =>
      localSigunguIdsOf({ region, title, organization });
    expect(of("경상북도", "청도군 귀농귀촌인 임시거주공간 임대료 지원사업", "청도군 농촌기술지원과")).toEqual(["cheongdo"]);
    expect(of("경상북도", "귀농인의 집 입주자 모집", "의성군농업기술센터 귀농귀촌팀")).toEqual(["uiseong"]);
    expect(of("전라남도", "2026년 영광에서 살아보기", "농촌 체험 마을")).toEqual(["yeonggwang"]);
    // "제주"는 시·도 약칭과 같아 시·도 전체로 본다 + 괄호 속 문의처(제주시청)는 대상 지역이 아니다
    expect(of("제주특별자치도", "제주 경작지 암반제거 지원", "제주특별자치도 / 읍·면·동 주민센터 (문의 제주시청 감귤유통과)")).toEqual([]);
    // "영양제"는 영양군이 아니다 (9/23 오탐과 같은 결)
    expect(of("경상북도", "작물 영양제 지원사업", "경상북도 농업기술원")).toEqual([]);
    expect(of("전국", "귀농닥터 멘토링", "농촌진흥청 / 각 시군 농업기술센터")).toEqual([]);
  });

  it("시·도 전체 사업은 제주시·서귀포시 어느 쪽에서도 빠지지 않는다 — 패널 건수 > 0", () => {
    const count = (q: string) =>
      Number(buildEntityPanel(q)?.facts.find((f) => f.label === "신청 가능 지원사업")?.value.replace(/[^0-9]/g, "") ?? 0);
    expect(count("서귀포")).toBeGreaterThan(0);
    expect(count("제주시")).toBeGreaterThan(0);
  });

  it("시·도 패널은 시·군 전용 사업도 그대로 센다 (시·도 목록과 같은 집합)", () => {
    const gyeongbuk = buildEntityPanel("경상북도");
    const programs = gyeongbuk?.groups.find((g) => g.label === "신청할 수 있는 지원사업");
    expect(programs?.more?.label).toMatch(/\d+건/);
  });
});
