/**
 * 10/6 QA 1차 수정 (FE-D2) — 진단(/match·/assess) 회귀 테스트.
 *
 * - Q2-W4: /match 는 서버가 그린다 — 모드는 URL 이 정하고(resolveGatewayMode), 선택 화면 제목·카드는 서버 컴포넌트
 * - Q4-W3: 빠른 점검 '기본 균등' 결과의 작물·지원사업 링크는 persona 없이 (빈 목록·0건 방지)
 * - Q4-W11: 적합도 진단 공유 = 결과 주소(/a/{code}), 세 진단 결과 모두 "이전 진단 결과"에 저장
 * - X7·X13·X5·X6: 인터뷰 상세 진짜 404, 404 화면 h1, /assess 링크 정리, /about 페르소나 링크
 */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { decodeAssessScore } from "@/lib/assess-share";
import { DIMENSIONS, RESULT_TIERS, type DimensionScore } from "@/lib/data/assessment";
import { QUICK_QUESTIONS, buildRecommendations, mapToPersona, type QuickAnswers } from "@/lib/data/quick-check";
import { PERSONAS } from "@/lib/data/personas";
import { assessSharePath, encodeAssessScore } from "@/app/assess/share-code";
import {
  HISTORY_MAX_ITEMS,
  addHistoryItem,
  parseHistory,
  type DiagnosisHistoryItem,
} from "@/app/match/diagnosis-history";
import { gatewayModeHref, resolveGatewayMode } from "@/app/match/gateway-mode";
import { quickRecommendationLinks } from "@/app/match/quick-links";
import { GatewayCards, GatewayIntro } from "@/app/match/gateway-select";
import NotFound from "@/app/not-found";

vi.mock("@/lib/analytics", () => ({ analytics: { modeSelectClicked: vi.fn() } }));

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("/match 모드 — URL 이 정한다", () => {
  const mode = (q: Record<string, string>) => resolveGatewayMode((k) => q[k] ?? null);

  it("?mode= 세 진단, 나머지는 선택 화면", () => {
    expect(mode({ mode: "quick" })).toBe("quick");
    expect(mode({ mode: "assess" })).toBe("assess");
    expect(mode({ mode: "match" })).toBe("match");
    expect(mode({})).toBe("select");
    expect(mode({ mode: "unknown" })).toBe("select");
    expect(mode({ persona: "family" })).toBe("select");
  });

  it("14문항 결과의 '맞춤 지역 찾기'(experience·lifestyle) → 정착 유형 진단", () => {
    expect(mode({ experience: "none", lifestyle: "farming" })).toBe("match");
    expect(mode({ lifestyle: "" })).toBe("match");
  });

  it("서버 searchParams 모양(배열 값)도 같은 규칙", () => {
    const sp: Record<string, string | string[] | undefined> = { mode: ["assess", "quick"] };
    expect(resolveGatewayMode((k) => sp[k])).toBe("assess");
  });

  it("page.tsx 는 searchParams 를 읽는 동적 페이지 — revalidate 없음, 게이트웨이를 Suspense 로 감추지 않는다", () => {
    const src = read("src/app/match/page.tsx");
    expect(src).toMatch(/await searchParams/);
    expect(src).not.toMatch(/export const revalidate/);
    expect(src).not.toMatch(/<Suspense/);
    // 로딩 스켈레톤은 h1 이 아니다 — 스트리밍 첫 조각과 실제 화면에 h1 이 둘이 되지 않게
    expect(read("src/app/match/loading.tsx")).not.toMatch(/<h1/);
  });
});

describe("/match 선택 화면 — 서버 컴포넌트", () => {
  it("제목 h1 하나 + 진단 카드 3개는 그 모드 주소로 가는 링크", () => {
    render(
      <>
        <GatewayIntro />
        <GatewayCards />
      </>,
    );
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual(["내 정착 유형을 찾아보세요"]);
    for (const m of ["quick", "assess", "match"] as const) {
      const link = document.querySelector(`a[href="${gatewayModeHref(m)}"]`);
      expect(link, m).not.toBeNull();
      expect(link?.querySelector("h2")).not.toBeNull();
    }
  });
});

describe("빠른 점검 결과 링크 — '기본 균등'", () => {
  /** 4문항 전 조합 (5×3×3×3 = 135) */
  const allAnswers: QuickAnswers[] = [];
  const [age, family, farming, capital] = QUICK_QUESTIONS.map((q) => q.options.map((o) => o.id));
  for (const a of age) for (const f of family) for (const fa of farming) for (const c of capital)
    allAnswers.push({ ageGroup: a, family: f, farming: fa, capital: c } as QuickAnswers);

  it("전제: 135조합 중 24개가 균등", () => {
    expect(allAnswers).toHaveLength(135);
    expect(allAnswers.filter((a) => mapToPersona(a) === "balanced")).toHaveLength(24);
  });

  it("균등 — 작물·지원사업은 전체 목록, 지역 순위는 균등 가중치 그대로", () => {
    const links = quickRecommendationLinks("balanced");
    expect(links.cropsUrl).toBe("/crops");
    expect(links.programsUrl).toBe("/programs");
    expect(links.rankingUrl).toBe("/regions/ranking?persona=balanced");
  });

  it("다른 페르소나는 기존 딥링크 그대로", () => {
    for (const p of PERSONAS.filter((x) => x.id !== "balanced")) {
      expect(quickRecommendationLinks(p.id)).toEqual(buildRecommendations(p.id));
    }
  });
});

describe("적합도 진단 공유 — 결과 주소 /a/{code}", () => {
  const dims = (percents: number[]): DimensionScore[] =>
    DIMENSIONS.map((d, i) => ({ id: d.id, label: d.label, score: Math.round((percents[i] / 100) * 8), percent: percents[i] }));

  it("인코딩 → decodeAssessScore 왕복 (등급 4종 × 연령대)", () => {
    const totals: Record<string, number> = { starter: 12, sprout: 22, seedling: 30, ready: 38 };
    for (const tier of RESULT_TIERS) {
      for (const age of [undefined, "youth", "30s", "40s", "50s", "60plus"]) {
        const percents = [50, 38, 75, 63, 25];
        const code = encodeAssessScore(tier.id, totals[tier.id], dims(percents), age);
        expect(code, `${tier.id}/${age}`).not.toBeNull();
        const decoded = decodeAssessScore(code!);
        expect(decoded?.tier.id).toBe(tier.id);
        expect(decoded?.totalScore).toBe(totals[tier.id]);
        expect(decoded?.dimensions.map((d) => d.percent)).toEqual(percents);
        expect(decoded?.ageGroup).toBe(age);
      }
    }
  });

  it("모르는 등급은 null, 공유 주소는 단축 경로", () => {
    expect(encodeAssessScore("nope", 20, dims([0, 0, 0, 0, 0]))).toBeNull();
    expect(assessSharePath("2-22-50-38-75-63-25-3")).toBe("/a/2-22-50-38-75-63-25-3");
  });

  it("위저드가 진단 첫 화면(/assess)이 아니라 결과 주소를 복사한다", () => {
    const src = read("src/app/assess/assessment-wizard.tsx");
    expect(src).toMatch(/assessSharePath\(shareCode\)/);
    expect(src).not.toMatch(/window\.location\.origin\}\/assess`/);
  });
});

describe("이전 진단 결과 — 세 진단 공용 저장", () => {
  const legacy = {
    resultId: "AAAAAAAAAAAA",
    farmTypeId: "guinong",
    farmTypeLabel: "귀농형",
    topRegions: ["전남"],
    topRegionIds: ["jeonnam"],
    savedAt: "2026-09-01T00:00:00.000Z",
  };

  it("예전 항목(kind 없음)은 정착 유형 진단으로 읽고, 모양이 어긋난 항목은 버린다", () => {
    const list = parseHistory([
      legacy,
      { kind: "quick", resultId: "q1", savedAt: "x", answers: { farming: "side" } },
      { kind: "assess", resultId: "a1", savedAt: "x", answers: { q1: 3 }, demo: { ageGroup: "40s" }, track: { t: ["x"] }, farmTypeId: "guichon", farmTypeLabel: "귀촌형" },
      { kind: "quick", resultId: "bad", savedAt: "x" },
      { kind: "assess", resultId: "bad2", savedAt: "x", answers: { q1: "3" } },
      { resultId: "bad3", savedAt: "x", farmTypeId: "nope", farmTypeLabel: "?", topRegions: [] },
      "garbage",
      null,
    ]);
    expect(list.map((h) => `${h.kind}:${h.resultId}`)).toEqual(["match:AAAAAAAAAAAA", "quick:q1", "assess:a1"]);
    expect(parseHistory("not-array")).toEqual([]);
  });

  it("맨 앞에 넣고 최대 5건, 같은 id 는 무시, 바로 앞과 같은 답이면 시각만 새로", () => {
    const answerSets: QuickAnswers[] = [
      { ageGroup: "youth", capital: "low" },
      { ageGroup: "30s", capital: "low" },
      { ageGroup: "40s", capital: "mid" },
      { ageGroup: "50s", capital: "mid" },
      { ageGroup: "60plus", capital: "high" },
      { ageGroup: "40s", capital: "high" },
    ];
    let list: DiagnosisHistoryItem[] = parseHistory([legacy]);
    answerSets.forEach((answers, i) => {
      list = addHistoryItem(list, { kind: "quick", resultId: `q${i}`, answers }, `t${i}`);
    });
    expect(list).toHaveLength(HISTORY_MAX_ITEMS);
    expect(list[0].resultId).toBe("q5");
    expect(addHistoryItem(list, { kind: "quick", resultId: "q5", answers: {} }, "later")).toEqual(list);
    const last = answerSets[5];
    const again = addHistoryItem(list, { kind: "quick", resultId: "new", answers: { ...last } }, "t9");
    expect(again).toHaveLength(HISTORY_MAX_ITEMS);
    expect(again[0]).toMatchObject({ resultId: "new", savedAt: "t9" });
    expect(again.filter((h) => h.kind === "quick" && JSON.stringify(h.answers) === JSON.stringify(last))).toHaveLength(1);
  });

  it("세 위저드가 같은 저장소 훅으로 남긴다 (예전엔 유형 진단만)", () => {
    for (const [file, kind] of [
      ["src/app/match/quick-wizard.tsx", "quick"],
      ["src/app/assess/assessment-wizard.tsx", "assess"],
      ["src/app/match/match-wizard.tsx", "match"],
    ] as const) {
      const src = read(file);
      expect(src, file).toMatch(/useDiagnosisHistory\(\)/);
      expect(src, file).toMatch(new RegExp(`kind: "${kind}"`));
      expect(src, file).toMatch(/useWizardBackGuard\(/);
    }
  });

  it("가이드 맞춤 배너는 정착 유형이 있는 가장 최근 결과를 쓴다 (빠른 점검 항목은 건너뜀)", () => {
    const src = read("src/app/guide/guide-personalize.tsx");
    expect(src).toMatch(/typeof item\.farmTypeId === "string"/);
  });
});

describe("링크·구조 정리 (X5·X6·X7·X13)", () => {
  it("내 지면에서 /assess 로 가는 링크가 없다 (넘기기만 하는 페이지)", () => {
    for (const f of ["src/app/about/page.tsx", "src/app/guide/guide-personalize.tsx", "src/app/assess/r/[data]/page.tsx"]) {
      expect(read(f), f).not.toMatch(/href="\/assess[?"]/);
    }
  });

  it("/about 페르소나 카드는 /match?persona= 가 아니라 그 유형의 순위·지원사업으로", () => {
    const src = read("src/app/about/page.tsx");
    // 링크 값으로 쓰지 않는다(주석 설명은 괜찮다) — 예전 코드: href={`/match?persona=${p.id}`}
    expect(src).not.toMatch(/[`"]\/match\?persona=/);
    for (const p of ["family", "elderRural", "commuter", "balanced"]) {
      expect(src).toContain(`/regions/ranking?persona=${p}`);
    }
    expect(src).toContain("/programs?persona=farmYouth");
  });

  it("인터뷰 상세 — 모르는 id 는 진짜 404 (정적 전집합), 미동의자도 정적 목록에 남아 원문으로 넘긴다", () => {
    const src = read("src/app/interviews/[id]/page.tsx");
    expect(src).toMatch(/export const dynamicParams = false/);
    expect(src).toMatch(/return interviews\.map\(\(i\) => \(\{ id: i\.id \}\)\)/);
    expect(src).not.toMatch(/308 redirect/);
  });

  it("404 화면 제목은 h1", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("페이지를 찾지 못했어요");
  });
});
