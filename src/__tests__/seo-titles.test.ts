import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { CROPS, getCropWithDetail } from "@/lib/data/crops";
import { PROGRAMS } from "@/lib/data/programs";
import { cropSeoDescription, cropSeoTitle } from "@/lib/crops/seo";
import { programSeoDescription, programSeoTitle } from "@/lib/programs/seo";
import { pageMetadata } from "@/lib/seo/share-metadata";

/**
 * 검색 결과 제목·설명 (2026-10-06, GSC 9월 — 회장 "1번 진행, 귀농은 다시 넣어").
 * 사람들은 "귀농 비용"·"블루베리 농사 난이도"·"농지은행 임대 조건"으로 검색하는데 제목엔 "정착"·산지 나열만 있었다.
 */

describe("작물 상세 — 55종 전부", () => {
  const all = CROPS.map((c) => getCropWithDetail(c.id)).filter((x): x is NonNullable<typeof x> => x !== null);

  it("모든 작물이 상세를 갖고, 제목은 '작물명 농사 난이도·수익 … | 귀농 작물'", () => {
    expect(all).toHaveLength(CROPS.length);
    for (const c of all) {
      const t = cropSeoTitle(c);
      expect(t.startsWith(`${c.name} 농사 난이도·수익`), c.id).toBe(true);
      expect(t, c.id).toContain("귀농");
    }
  });

  it("설명에 실제 난이도·재배 시기가 들어가고, 템플릿 구멍(undefined·null·NaN)이 없다", () => {
    for (const c of all) {
      const d = cropSeoDescription(c);
      expect(d, c.id).toContain(c.name);
      expect(d, c.id).toContain("재배 난이도가");
      expect(d, c.id).toContain(c.growingSeason);
      expect(d, c.id).not.toMatch(/undefined|null|NaN|이에요이에요|\(\)/);
      expect(d, c.id).toContain("귀농");
    }
  });

  it("소득 숫자는 공공기관 출처일 때만 — 블루베리(농촌진흥청)는 10a당 숫자, 출처 기관을 괄호로", () => {
    const blueberry = all.find((c) => c.id === "blueberry")!;
    expect(cropSeoDescription(blueberry)).toMatch(/^블루베리는 재배 난이도가 보통이고, 10a당 소득은 약 [\d,]+만 원이에요\(농촌진흥청\)\./);
    for (const c of all) {
      const d = cropSeoDescription(c);
      if (d.includes("10a당 소득")) {
        expect(d, c.id).toMatch(/\((농촌진흥청|통계청|산림청|농림축산식품부|한국농촌경제연구원)\)/);
      }
    }
  });

  it("주산지는 짧은 이름, 끝 글자 받침에 맞춰 이에요/예요", () => {
    const blueberry = all.find((c) => c.id === "blueberry")!;
    expect(cropSeoDescription(blueberry)).toContain("주산지는 전남·경남·충남이에요.");
  });
});

describe("지원사업 상세", () => {
  it("일반 사업: '사업명 — 조건·신청 방법 | (지역) 귀농 지원사업'", () => {
    for (const p of PROGRAMS.filter((x) => x.id !== "SP-018")) {
      const t = programSeoTitle(p);
      expect(t.startsWith(`${p.title} — 조건·신청 방법 | `), p.id).toBe(true);
      expect(t.endsWith("귀농 지원사업"), p.id).toBe(true);
      expect(t, p.id).not.toMatch(/\s{2,}|undefined/);
    }
  });

  it("SP-018 농지은행은 실제 검색어(임대·위탁 조건·수수료)로", () => {
    const sp018 = PROGRAMS.find((p) => p.id === "SP-018")!;
    expect(programSeoTitle(sp018)).toBe("농지은행 농지임대수탁사업 — 임대·위탁 조건과 수수료");
    const d = programSeoDescription(sp018, sp018.summary);
    expect(d.startsWith("농지은행 농지임대수탁사업의 임대 조건·위탁 조건·수수료를 확인하세요.")).toBe(true);
    // 검색 결과가 약속한 내용이 본문에 있다
    expect(sp018.description).toMatch(/위탁/);
    expect(sp018.description).toMatch(/수수료/);
  });

  it("지역이 비어도 공백이 겹치지 않는다", () => {
    const t = programSeoTitle({ id: "X", title: "테스트 사업", region: "" });
    expect(t).toBe("테스트 사업 — 조건·신청 방법 | 귀농 지원사업");
    expect(programSeoDescription({ id: "X", title: "테스트 사업", region: "" })).toBe(
      "테스트 사업의 자격 조건, 지원 금액, 신청 방법을 확인하세요.",
    );
  });
});

describe("허브 페이지 제목에 '귀농'", () => {
  const titleOf = (route: string) => {
    const src = readFileSync(join(process.cwd(), "src", "app", route, "page.tsx"), "utf8");
    const m = src.match(/export const metadata[\s\S]*?title:\s*"([^"]+)"/);
    return m?.[1] ?? "";
  };
  it.each([
    ["costs", "귀농 비용 가이드"],
    ["programs", "귀농·귀촌 지원사업"],
    ["guide", "귀농 절차 5단계"],
    ["crops", "귀농 작물 목록"],
    ["education", "귀농 교육"],
    ["events", "귀농 체험·행사"],
    ["interviews", "귀농·귀촌 인터뷰"],
    ["regions", "귀농 지역 탐색"],
  ])("/%s", (route, expected) => {
    expect(titleOf(route)).toContain(expected);
  });

  it("사이트 기본 제목·랜딩", () => {
    for (const f of ["layout.tsx", "page.tsx"]) {
      const src = readFileSync(join(process.cwd(), "src", "app", f), "utf8");
      expect(src, f).toContain("이랑 — 귀농·귀촌 정보 큐레이션 포탈");
      expect(src, f).not.toContain("농촌 정착 정보 큐레이션 포탈");
    }
  });
});

/**
 * 10/6 QA Q2-W2 — 문서 제목 끝 "| 이랑 | 이랑".
 * 레이아웃 템플릿("%s | 이랑")이 붙이는데 페이지 title 에도 접미를 적어 두 번 붙었다(가이드 8쪽·약관·진단 결과).
 * 전 라우트의 page·layout metadata 를 TypeScript 구문 트리로 읽어, 템플릿을 거치는 제목이 접미로 끝나지 않는지 본다.
 * 공유 카드 제목(openGraph·twitter·shareMetadata 인자)은 템플릿을 거치지 않아 접미가 맞다 — 검사 밖.
 */
describe("문서 제목에 사이트 접미를 직접 붙이지 않는다 (전 라우트)", () => {
  const APP_DIR = join(process.cwd(), "src", "app");
  /** 범위 밖 — 관리자 레이아웃("관리자 | 이랑")은 noindex·로그인 뒤라 FE-D2 가 CoS 에 따로 보고했다 */
  const EXCLUDE = [/^admin\//];
  const SUFFIX = /\|\s*이랑\s*$/;

  function collectRouteFiles(dir: string, rel = ""): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const relPath = rel ? `${rel}/${entry}` : entry;
      if (statSync(full).isDirectory()) out.push(...collectRouteFiles(full, relPath));
      else if (/^(page|layout)\.tsx$/.test(entry)) out.push(relPath);
    }
    return out;
  }

  /** 파일 안 `const X = "…"`·`` const X = `…` `` 선언 (함수 안 지역 상수 포함 — 이름이 같으면 모두) */
  type Consts = Map<string, ts.Expression[]>;
  function stringConsts(sf: ts.SourceFile): Consts {
    const map: Consts = new Map();
    const visit = (node: ts.Node) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
        const init = node.initializer;
        if (ts.isStringLiteralLike(init) || ts.isTemplateExpression(init)) {
          map.set(node.name.text, [...(map.get(node.name.text) ?? []), init]);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    return map;
  }

  /** title 값 → 비교할 문자열들(템플릿 리터럴은 원문 그대로 — 끝부분만 보면 된다). 모르면 빈 배열 */
  function titleTexts(node: ts.Expression, sf: ts.SourceFile, consts: Consts): string[] {
    if (ts.isStringLiteralLike(node)) return [node.text];
    if (ts.isTemplateExpression(node)) return [node.getText(sf).slice(1, -1)];
    if (ts.isIdentifier(node)) return (consts.get(node.text) ?? []).flatMap((e) => titleTexts(e, sf, new Map()));
    if (ts.isObjectLiteralExpression(node)) {
      // { absolute } 는 템플릿을 거치지 않는다. { default } 만 본다(하위 레이아웃의 기본 제목)
      const def = node.properties.find(
        (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && p.name.getText(sf) === "default",
      );
      return def ? titleTexts(def.initializer, sf, consts) : [];
    }
    return [];
  }

  /** metadata 객체(또는 pageMetadata 인자)에서 바로 아래 title 만 — openGraph·twitter 안쪽은 보지 않는다 */
  function titlesOf(obj: ts.ObjectLiteralExpression, sf: ts.SourceFile, consts: Consts, out: string[]) {
    for (const p of obj.properties) {
      if (ts.isPropertyAssignment(p) && p.name.getText(sf) === "title") {
        out.push(...titleTexts(p.initializer, sf, consts));
      }
      if (ts.isShorthandPropertyAssignment(p) && p.name.text === "title") {
        out.push(...titleTexts(p.name, sf, consts));
      }
      if (ts.isSpreadAssignment(p)) visitMetadataExpr(p.expression, sf, consts, out);
    }
  }

  function visitMetadataExpr(expr: ts.Expression, sf: ts.SourceFile, consts: Consts, out: string[]) {
    if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr)) {
      visitMetadataExpr(expr.expression, sf, consts, out);
      return;
    }
    if (ts.isObjectLiteralExpression(expr)) {
      titlesOf(expr, sf, consts, out);
      return;
    }
    // pageMetadata({ title }) — 문서 제목이 된다. shareMetadata(...) 는 공유 카드라 보지 않는다
    if (ts.isCallExpression(expr) && expr.expression.getText(sf) === "pageMetadata") {
      const arg = expr.arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) titlesOf(arg, sf, consts, out);
    }
  }

  function documentTitles(source: string, file: string): string[] {
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const consts = stringConsts(sf);
    const out: string[] = [];
    const visit = (node: ts.Node, inGenerateMetadata: boolean) => {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "metadata" && node.initializer) {
        visitMetadataExpr(node.initializer, sf, consts, out);
      }
      // generateMetadata + 반환 타입이 Metadata 인 공용 함수(storiesMetadata 등 — 10/7 '| 이랑 | 이랑' 이 여기서 샜다)
      const isGen =
        ts.isFunctionDeclaration(node) &&
        (node.name?.text === "generateMetadata" ||
          (!!node.type && /^(Promise<\s*)?Metadata(\s*>)?$/.test(node.type.getText(sf))));
      if (inGenerateMetadata && ts.isReturnStatement(node) && node.expression) {
        visitMetadataExpr(node.expression, sf, consts, out);
      }
      // 안쪽 함수(콜백)의 return 은 metadata 가 아니다
      const nested = !isGen && (ts.isFunctionLike(node) || ts.isClassLike(node));
      ts.forEachChild(node, (c) => visit(c, isGen || (inGenerateMetadata && !nested)));
    };
    visit(sf, false);
    return out;
  }

  const files = collectRouteFiles(APP_DIR).filter((f) => f !== "layout.tsx" && !EXCLUDE.some((re) => re.test(f)));

  it("스캐너가 실제로 제목을 읽는다 (가이드·약관·진단 결과·인터뷰 상세)", () => {
    const read = (f: string) => documentTitles(readFileSync(join(APP_DIR, f), "utf8"), f);
    expect(read("guide/shelter/page.tsx")).toEqual(["농촌체류형 쉼터 가이드"]);
    expect(read("terms/page.tsx")).toEqual(["이용약관"]);
    expect(read("assess/result/[id]/page.tsx")).toEqual(["결과를 찾지 못했어요", "${emoji} 나의 정착 유형: ${label}"]);
    expect(read("interviews/[id]/page.tsx").length).toBe(2);
    // 자기 검증 — 접미를 붙인 제목이면 잡힌다
    expect(documentTitles(`export const metadata = { title: "가이드 | 이랑", openGraph: { title: "x | 이랑" } };`, "x.tsx")).toEqual([
      "가이드 | 이랑",
    ]);
    expect(
      documentTitles(`export async function generateMetadata() { return { ...pageMetadata({ title: \`\${a} | 이랑\` }) }; }`, "y.tsx"),
    ).toEqual(["${a} | 이랑"]);
  });

  it(`page·layout ${files.length}개 — 템플릿을 거치는 제목이 " | 이랑"으로 끝나지 않는다`, () => {
    expect(files.length).toBeGreaterThan(50);
    const offenders: string[] = [];
    for (const f of files) {
      for (const t of documentTitles(readFileSync(join(APP_DIR, f), "utf8"), f)) {
        if (SUFFIX.test(t)) offenders.push(`${f}: ${t}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("라우트 밖 메타데이터 함수(components·lib)도 접미를 직접 붙이지 않는다 — 현장 이야기 화면", () => {
    const SRC = join(process.cwd(), "src");
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((e) => {
        const full = join(dir, e);
        if (statSync(full).isDirectory()) return walk(full);
        return /\.tsx?$/.test(e) ? [full] : [];
      });
    const read = (full: string) => documentTitles(readFileSync(full, "utf8"), full);
    // 스캐너 자기 검증 — 이 함수의 제목을 실제로 읽는다
    expect(read(join(SRC, "components", "community", "stories-page.tsx"))).toEqual(["${label} 현장 이야기"]);
    // 고치기 전 형태면 잡힌다
    expect(
      documentTitles(
        `export function xMetadata(label: string): Metadata { return { title: \`\${label} 현장 이야기 | 이랑\`, robots: { index: false } }; }`,
        "z.tsx",
      ),
    ).toEqual(["${label} 현장 이야기 | 이랑"]);
    const offenders: string[] = [];
    for (const full of [...walk(join(SRC, "components")), ...walk(join(SRC, "lib"))]) {
      for (const t of read(full)) if (SUFFIX.test(t)) offenders.push(`${full.slice(SRC.length + 1)}: ${t}`);
    }
    expect(offenders).toEqual([]);
  });

  it("pageMetadata — 문서 제목은 접미 없이, 공유 카드 제목엔 접미 한 번, canonical·og:url 은 같은 경로", () => {
    const m = pageMetadata({ title: "이용약관", description: "설명", path: "/terms" });
    expect(m.title).toBe("이용약관");
    expect(m.alternates?.canonical).toBe("/terms");
    expect(m.openGraph).toMatchObject({ title: "이용약관 | 이랑", description: "설명", url: "/terms", siteName: "이랑" });
    expect(m.twitter).toMatchObject({ title: "이용약관 | 이랑", description: "설명" });
  });
});

/** 10/6 QA Q2-W3 — 이 지면들은 공유 카드를 안 정해 사이트 기본 카드(og:title "이랑 — …", og:url 없음)가 나갔다 */
describe("공유 카드를 페이지마다 정한다 (진단·소개·약관·인터뷰·가이드)", () => {
  it.each([
    "match/page.tsx",
    "about/page.tsx",
    "about/corrections/page.tsx",
    "about/disclaimer/page.tsx",
    "about/updates/page.tsx",
    "about/updates/[date]/page.tsx",
    "terms/page.tsx",
    "interviews/page.tsx",
    "interviews/[id]/page.tsx",
    "guide/page.tsx",
    "guide/shelter/page.tsx",
    "guide/track-compare/page.tsx",
    "guides/page.tsx",
    "guides/preparation/page.tsx",
    "guides/solo-farming/page.tsx",
    "guides/budget-50s/page.tsx",
    "guides/beginner-crops/page.tsx",
    "guides/failure-cases/page.tsx",
    "assess/result/[id]/page.tsx",
    "assess/r/[data]/page.tsx",
  ])("%s", (f) => {
    const src = readFileSync(join(process.cwd(), "src", "app", f), "utf8");
    expect(src).toMatch(/\b(pageMetadata|shareMetadata)\(/);
    // openGraph 를 손으로 쓰면 og:image·site_name 을 빠뜨리기 쉽다(얕은 병합) — 헬퍼로만
    expect(src).not.toMatch(/\bopenGraph\s*:/);
  });

  it("공유 단축 주소·OG 카드는 irangfarm.com — 접속되지 않는 irang.info 를 문자열·화면 글자로 쓰지 않는다", () => {
    const hits: string[] = [];
    const scan = (file: string) => {
      const src = readFileSync(file, "utf8");
      if (!src.includes("irang.info")) return;
      const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visit = (node: ts.Node) => {
        const text =
          ts.isStringLiteralLike(node) ||
          ts.isJsxText(node) ||
          ts.isTemplateHead(node) ||
          ts.isTemplateMiddle(node) ||
          ts.isTemplateTail(node)
            ? node.text
            : "";
        if (text.includes("irang.info")) hits.push(`${file}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}`);
        ts.forEachChild(node, visit);
      };
      visit(sf);
    };
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry) && !entry.endsWith(".test.ts")) scan(full);
      }
    };
    walk(join(process.cwd(), "src"));
    expect(hits).toEqual([]);
  });
});
