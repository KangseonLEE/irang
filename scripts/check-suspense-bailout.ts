/**
 * useSearchParams CSR bailout 정적 검사 — SSR 콘텐츠 누락(SEO) 재발 차단
 *
 * 배경 (2026-06-01 사고): 홈 `/`의 검색창 SearchBar(useSearchParams 사용) →
 *   HeroSearch → 이를 감싼 Suspense 경계 부재. Next.js에서 useSearchParams를
 *   Suspense 없이 쓰면 BAILOUT_TO_CLIENT_SIDE_RENDERING이 **페이지 루트까지 전파**되어
 *   히어로 h1·본문 전체가 SSR HTML에서 누락되고 RSC payload(script)에만 남는다.
 *   JS 미실행 크롤러(네이버 Yeti)는 빈 껍데기만 봄 → 색인 불가. 사용자(JS 실행)는
 *   정상이라 발견이 지연됨 (color: sitemap 373 URL 중 19개 색인 5% 정체).
 *
 * 핵심 규칙: **useSearchParams**만 bailout을 유발한다 (usePathname·useRouter는
 *   SSR 시점에 값이 확정되므로 Suspense 불필요). 따라서 이 검사는 useSearchParams만
 *   추적한다.
 *
 * 검사 (import 그래프 + JSX Suspense-깊이 파싱 — grep 휴리스틱 아님):
 *
 *   [P1] carries 전파 (fixpoint)
 *     - base : "use client" 파일이 useSearchParams()를 직접 호출 → carries
 *     - 귀납 : 어떤 파일이 carries 파일의 컴포넌트를 <X> 렌더하는데 그 <X> 위치의
 *              Suspense 깊이가 0(감싸지 않음) → 그 파일도 carries (bailout 전파)
 *
 *   [P2] page/layout 게이트
 *     - src/app 하위 page.tsx·layout.tsx가 carries 자식을 Suspense 없이 렌더 → FAIL
 *       (= 6/1 형태: bailout이 페이지 루트까지 전파 → SSR 통째 누락)
 *     - "use client" 페이지가 useSearchParams를 직접 쓰면서 파일에 <Suspense>가
 *       전혀 없음 → FAIL (검색 페이지처럼 hook을 Suspense 하위 서브컴포넌트로
 *       격리하는 패턴이 아니면 위험)
 *
 * 사용법:
 *   npx tsx scripts/check-suspense-bailout.ts             # 실검증 (CI)
 *   npx tsx scripts/check-suspense-bailout.ts --self-test # 6/1 사고 형태 시뮬레이션
 *
 * exit 0 = 안전 / exit 1 = bailout 위험 (Suspense 래핑 누락 위치 명시)
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const SRC_ROOT = resolve(REPO_ROOT, "src");

// ────────────────────────────────────────────────────────────────────────────
// 파일 레코드 — 디스크 스캔 또는 self-test 합성으로 생성
// ────────────────────────────────────────────────────────────────────────────

interface FileRec {
  /** 정규화 식별자 (디스크: 절대경로, self-test: 가상 경로) */
  path: string;
  /** 원본 소스 */
  source: string;
  /** import 로컬명 → 대상 파일 path (해석 가능한 것만) */
  imports: Record<string, string>;
}

/** 블록 주석(JSX 주석 포함) + 라인 주석 제거 — 태그/훅 오탐 방지 */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

/** "use client" 지시어 여부 */
function isClient(src: string): boolean {
  return /^\s*["']use client["']/m.test(src);
}

/** useSearchParams() 직접 호출 여부 (import 문만 있는 경우는 제외) */
function callsUseSearchParams(strippedSrc: string): boolean {
  return /useSearchParams\s*\(/.test(strippedSrc);
}

/** <Suspense> 존재 여부 */
function hasSuspense(strippedSrc: string): boolean {
  return /<Suspense[\s/>]/.test(strippedSrc);
}

/**
 * 페이지가 searchParams에 의존하는가 (= 동적 렌더). 서버 page의 `searchParams:` prop
 * 또는 useSearchParams 파생 변수(`const searchParams = ...`)를 읽으면 그 페이지는
 * 요청 시 동적 렌더되므로 useSearchParams bailout이 SSR을 파괴하지 않는다 (6/1의
 * SEO 참사는 정적 렌더 페이지에서만 발생). 소문자 `searchParams`는 `useSearchParams`
 * (대문자 S)와 구별된다.
 */
function consumesSearchParams(strippedSrc: string): boolean {
  return /searchParams/.test(strippedSrc);
}

/** export const dynamic = "force-dynamic" — 강제 동적 렌더 → bailout 무해 */
function isForceDynamic(strippedSrc: string): boolean {
  return /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/.test(strippedSrc);
}

function isPage(path: string): boolean {
  return /\/page\.tsx$/.test(path);
}

/**
 * 소스 텍스트의 각 위치에서 Suspense 중첩 깊이를 계산해,
 * `<Name` 등장 위치가 Suspense 하위(depth>0)인지 판정.
 *
 * 파싱 견고성: `<Suspense fallback={<Div/>}>`처럼 여는 태그의 attribute에 JSX가
 *   들어가 `>`가 중첩되면 정규식으로 태그 끝(`>`)을 정확히 잡기 어렵다. 따라서
 *   `<Suspense` 토큰 등장 위치에서 depth+1, `</Suspense>`에서 depth-1로 단순화한다.
 *   (self-closing `<Suspense/>`는 자식이 없어 무의미하므로 미사용 가정.) 여는 태그
 *   attribute 구간까지 depth>0로 과대 집계되지만, 이는 "감쌌다" 판정을 넓히는
 *   방향이라 false-positive(오탐 FAIL)를 만들지 않는다. 실제 bailout 대상(자식)은
 *   항상 여는 태그 이후에 온다.
 */
function suspenseWrappedPositions(strippedSrc: string): {
  isWrapped: (index: number) => boolean;
} {
  const events: Array<{ index: number; delta: number }> = [];
  const openRe = /<Suspense\b/g;
  const closeRe = /<\/Suspense>/g;
  let m: RegExpExecArray | null;
  while ((m = openRe.exec(strippedSrc)) !== null) {
    events.push({ index: m.index, delta: +1 });
  }
  while ((m = closeRe.exec(strippedSrc)) !== null) {
    events.push({ index: m.index, delta: -1 });
  }
  events.sort((a, b) => a.index - b.index);
  return {
    isWrapped(index: number): boolean {
      let depth = 0;
      for (const e of events) {
        if (e.index < index) depth += e.delta;
        else break;
      }
      return depth > 0;
    },
  };
}

/** import 문 파싱 → 로컬명 → 모듈 스펙 매핑 */
function parseImports(src: string): Array<{ name: string; spec: string }> {
  const out: Array<{ name: string; spec: string }> = [];
  const importRe = /import\s+([^;]+?)\s+from\s+["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(src)) !== null) {
    const clause = m[1].trim();
    const spec = m[2];
    // default: `Default` 또는 `Default, { ... }`
    const defaultMatch = clause.match(/^([A-Za-z_$][\w$]*)\s*(?:,|$)/);
    if (defaultMatch && !clause.startsWith("{") && !clause.startsWith("*")) {
      out.push({ name: defaultMatch[1], spec });
    }
    // named: `{ A, B as C }`
    const braceMatch = clause.match(/\{([^}]*)\}/);
    if (braceMatch) {
      for (const part of braceMatch[1].split(",")) {
        const p = part.trim();
        if (!p) continue;
        const asMatch = p.match(/\bas\s+([A-Za-z_$][\w$]*)$/);
        const local = asMatch ? asMatch[1] : p.split(/\s+/)[0];
        if (local) out.push({ name: local, spec });
      }
    }
  }
  return out;
}

/** 모듈 스펙(@/... 또는 상대경로)을 실제 파일 경로로 해석. 외부 패키지는 null. */
function resolveSpec(spec: string, fromFile: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = join(SRC_ROOT, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null; // 외부 패키지 (react, next/navigation, lucide-react ...)
  const candidates = [
    base + ".tsx",
    base + ".ts",
    join(base, "index.tsx"),
    join(base, "index.ts"),
  ];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/** src 트리의 모든 .tsx 파일 수집 */
function collectTsxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) collectTsxFiles(full, acc);
    else if (entry.endsWith(".tsx")) acc.push(full);
  }
  return acc;
}

function buildFileRecsFromDisk(): FileRec[] {
  const files = collectTsxFiles(SRC_ROOT);
  return files.map((path) => {
    const source = readFileSync(path, "utf8");
    const imports: Record<string, string> = {};
    for (const { name, spec } of parseImports(source)) {
      const resolved = resolveSpec(spec, path);
      if (resolved) imports[name] = resolved;
    }
    return { path, source, imports };
  });
}

// ────────────────────────────────────────────────────────────────────────────
// 핵심 분석 — 순수 함수 (self-test가 합성 FileRec[]로 호출)
// ────────────────────────────────────────────────────────────────────────────

interface Failure {
  file: string;
  kind: "PAGE_UNWRAPPED_CARRIER" | "CLIENT_PAGE_DIRECT_HOOK";
  message: string;
}

function isPageOrLayout(path: string): boolean {
  return /\/(page|layout)\.tsx$/.test(path);
}

function analyze(recs: FileRec[]): { failures: Failure[]; carries: Set<string> } {
  const byPath = new Map(recs.map((r) => [r.path, r]));
  const stripped = new Map(recs.map((r) => [r.path, stripComments(r.source)]));

  // ── P1: carries fixpoint ──
  const carries = new Set<string>();

  // base: client 파일이 useSearchParams() 직접 호출.
  //  단, page.tsx가 hook을 Suspense 하위 서브컴포넌트로 격리한 self-wrap 패턴
  //  (검색 페이지)은 base carrier로 보지 않음 — P2에서 별도 판정.
  for (const r of recs) {
    const s = stripped.get(r.path)!;
    if (isClient(r.source) && callsUseSearchParams(s)) {
      const selfWrapPage = isPageOrLayout(r.path) && hasSuspense(s);
      if (!selfWrapPage) carries.add(r.path);
    }
  }

  // 귀납: unwrapped carrier 자식을 렌더하면 carries. 안정될 때까지 반복.
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of recs) {
      if (carries.has(r.path)) continue;
      const s = stripped.get(r.path)!;
      const wrap = suspenseWrappedPositions(s);
      for (const [name, targetPath] of Object.entries(r.imports)) {
        if (!carries.has(targetPath)) continue;
        // 이 파일에서 <name ...> 등장 위치가 하나라도 Suspense 밖이면 전파
        const usageRe = new RegExp(`<${name}\\b`, "g");
        let um: RegExpExecArray | null;
        while ((um = usageRe.exec(s)) !== null) {
          if (!wrap.isWrapped(um.index)) {
            carries.add(r.path);
            changed = true;
            break;
          }
        }
        if (carries.has(r.path)) break;
      }
    }
  }

  // ── P2: page 게이트 ──
  // 6/1 사고 = **정적 렌더 서버 page**의 자체 트리가 unwrapped carrier를 렌더 →
  // static generation 시 페이지 루트까지 CSR bailout → SSR 콘텐츠(h1 등) 통째 누락.
  // 동적 렌더 페이지(searchParams 소비·force-dynamic)는 요청 시 서버 렌더되므로 무해.
  // layout / 클라이언트 컴포넌트 경계 하위 carrier는 client 경계에서 격리되어 서버
  // 렌더된 {children}를 파괴하지 않음(root layout→Header→SearchBar가 production
  // known-good으로 입증). 따라서 carrier 게이트는 **정적 서버 page.tsx**에만 적용.
  const failures: Failure[] = [];
  for (const r of recs) {
    if (!isPage(r.path)) continue;
    const s = stripped.get(r.path)!;
    const wrap = suspenseWrappedPositions(s);
    const client = isClient(r.source);
    const staticServerPage =
      !client && !consumesSearchParams(s) && !isForceDynamic(s);

    // (a) 정적 서버 page가 carries 자식을 Suspense 없이 렌더 (= 6/1 형태)
    if (staticServerPage) {
      for (const [name, targetPath] of Object.entries(r.imports)) {
        if (!carries.has(targetPath)) continue;
        const usageRe = new RegExp(`<${name}\\b`, "g");
        let um: RegExpExecArray | null;
        while ((um = usageRe.exec(s)) !== null) {
          if (!wrap.isWrapped(um.index)) {
            failures.push({
              file: rel(r.path),
              kind: "PAGE_UNWRAPPED_CARRIER",
              message: `정적 렌더 서버 page가 useSearchParams-전파 컴포넌트 <${name}>를 Suspense 없이 렌더 → static generation 시 CSR bailout이 페이지 루트까지 전파 → SSR 콘텐츠(h1 등) 누락(색인 불가). <${name}>를 <Suspense fallback={...}>로 감싸 bailout을 그 자리에 격리하세요. (import: ${rel(targetPath)})`,
            });
            break;
          }
        }
      }
    }

    // (b) client 페이지가 useSearchParams 직접 사용 + Suspense 전무
    if (client && callsUseSearchParams(s) && !hasSuspense(s)) {
      failures.push({
        file: rel(r.path),
        kind: "CLIENT_PAGE_DIRECT_HOOK",
        message: `"use client" 페이지가 useSearchParams()를 직접 호출하는데 파일에 <Suspense>가 없음 → 페이지 전체 CSR bailout. hook을 별도 서브컴포넌트로 분리하고 <Suspense>로 감싸세요 (검색 페이지 패턴 참조).`,
      });
    }
  }
  return { failures, carries };
}

function rel(path: string): string {
  return path.startsWith(REPO_ROOT) ? path.slice(REPO_ROOT.length + 1) : path;
}

// ────────────────────────────────────────────────────────────────────────────
// 실행
// ────────────────────────────────────────────────────────────────────────────

function runCheck(): number {
  const recs = buildFileRecsFromDisk();
  const { failures, carries } = analyze(recs);

  console.log("");
  console.log("=== useSearchParams CSR bailout 정적 검사 ===");
  console.log(`스캔 파일 : ${recs.length}개 (.tsx)`);
  console.log(`carries(bailout 전파) 컴포넌트 : ${carries.size}개`);
  console.log("");

  if (failures.length === 0) {
    console.log("안전 — 모든 useSearchParams 전파 컴포넌트가 page 루트 전에 Suspense로 격리됨. ✅");
    console.log("");
    return 0;
  }

  console.log(`bailout 위험 ${failures.length}건 발견:`);
  console.log("");
  for (const f of failures) {
    console.log(`  [${f.kind}] ${f.file}`);
    console.log(`      ${f.message}`);
  }
  console.log("");
  console.log("→ 해당 컴포넌트를 <Suspense fallback={...}>로 감싸 bailout을 격리하세요 (2026-06-01 홈 h1 누락 사고).");
  console.log("");
  return 1;
}

/**
 * --self-test: 6/1 사고 형태(page→HeroSearch→SearchBar(useSearchParams), unwrapped)를
 * in-memory 합성 파일로 재현해 checker가 잡는지, 그리고 Suspense로 감싼 fixed 버전을
 * 통과시키는지 검증. 디스크 무변경.
 */
function runSelfTest(): number {
  console.log("");
  console.log("=== self-test: 6/1 bailout 형태 시뮬레이션 (in-memory, 디스크 무변경) ===");
  console.log("");

  const searchBar: FileRec = {
    path: "/virtual/search-bar.tsx",
    source: `"use client";\nimport { useSearchParams } from "next/navigation";\nexport default function SearchBar() { const sp = useSearchParams(); return <input/>; }`,
    imports: {},
  };
  const heroSearch: FileRec = {
    path: "/virtual/hero-search.tsx",
    source: `"use client";\nimport SearchBar from "./search-bar";\nexport default function HeroSearch() { return <div><SearchBar/></div>; }`,
    imports: { SearchBar: "/virtual/search-bar.tsx" },
  };
  const brokenPage: FileRec = {
    path: "/virtual/broken/page.tsx",
    source: `import HeroSearch from "@/components/search/hero-search";\nexport default function Page() { return <main><h1>제목</h1><HeroSearch/></main>; }`,
    imports: { HeroSearch: "/virtual/hero-search.tsx" },
  };
  const fixedPage: FileRec = {
    path: "/virtual/fixed/page.tsx",
    source: `import { Suspense } from "react";\nimport HeroSearch from "@/components/search/hero-search";\nexport default function Page() { return <main><h1>제목</h1><Suspense fallback={<div/>}><HeroSearch/></Suspense></main>; }`,
    imports: { HeroSearch: "/virtual/hero-search.tsx" },
  };

  let ok = true;

  // 1) broken (6/1 형태) → PAGE_UNWRAPPED_CARRIER FAIL 기대
  const brokenResult = analyze([searchBar, heroSearch, brokenPage]);
  const brokenCaught = brokenResult.failures.some(
    (f) => f.file.includes("broken") && f.kind === "PAGE_UNWRAPPED_CARRIER",
  );
  console.log(`  [${brokenCaught ? "✅ 탐지" : "❌ 미탐지"}] 6/1 형태(page→HeroSearch→SearchBar, unwrapped) → FAIL`);
  if (!brokenCaught) ok = false;
  // 전이 전파 확인: hero-search도 carries에 들어가야 함
  const transitiveOk = brokenResult.carries.has("/virtual/hero-search.tsx");
  console.log(`  [${transitiveOk ? "✅" : "❌"}] 전이 전파: HeroSearch가 carries에 포함 = ${transitiveOk}`);
  if (!transitiveOk) ok = false;

  // 2) fixed (Suspense 래핑) → PASS 기대
  const fixedResult = analyze([searchBar, heroSearch, fixedPage]);
  const fixedPass = fixedResult.failures.length === 0;
  console.log(`  [${fixedPass ? "✅ 통과" : "❌ 오탐"}] fixed(HeroSearch를 Suspense로 감쌈) → PASS`);
  if (!fixedPass) ok = false;

  // 3) client 페이지 직접 hook + Suspense 전무 → FAIL 기대
  const clientPageNoSuspense: FileRec = {
    path: "/virtual/clientpage/page.tsx",
    source: `"use client";\nimport { useSearchParams } from "next/navigation";\nexport default function Page() { const sp = useSearchParams(); return <div/>; }`,
    imports: {},
  };
  const clientPageResult = analyze([clientPageNoSuspense]);
  const clientCaught = clientPageResult.failures.some((f) => f.kind === "CLIENT_PAGE_DIRECT_HOOK");
  console.log(`  [${clientCaught ? "✅ 탐지" : "❌ 미탐지"}] client 페이지 직접 hook + Suspense 전무 → FAIL`);
  if (!clientCaught) ok = false;

  // 4) client 페이지 직접 hook + Suspense 격리(검색 페이지 패턴) → PASS 기대
  const clientPageSelfWrap: FileRec = {
    path: "/virtual/search/page.tsx",
    source: `"use client";\nimport { Suspense } from "react";\nimport { useSearchParams } from "next/navigation";\nfunction Inner() { const sp = useSearchParams(); return <div/>; }\nexport default function Page() { return <Suspense fallback={<span/>}><Inner/></Suspense>; }`,
    imports: {},
  };
  const selfWrapResult = analyze([clientPageSelfWrap]);
  const selfWrapPass = selfWrapResult.failures.length === 0;
  console.log(`  [${selfWrapPass ? "✅ 통과" : "❌ 오탐"}] client 페이지 self-wrap(검색 페이지 패턴) → PASS`);
  if (!selfWrapPass) ok = false;

  // 5) 동적 서버 페이지(searchParams 소비)가 unwrapped carrier 렌더 → PASS 기대
  //    (요청 시 동적 렌더 → bailout 무해. programs·regions/ranking 등 실제 패턴)
  const dynamicPage: FileRec = {
    path: "/virtual/dynamic/page.tsx",
    source: `import HeroSearch from "@/components/search/hero-search";\ninterface P { searchParams: Promise<{ q?: string }>; }\nexport default async function Page({ searchParams }: P) { await searchParams; return <main><h1>제목</h1><HeroSearch/></main>; }`,
    imports: { HeroSearch: "/virtual/hero-search.tsx" },
  };
  const dynamicResult = analyze([searchBar, heroSearch, dynamicPage]);
  const dynamicPass = dynamicResult.failures.length === 0;
  console.log(`  [${dynamicPass ? "✅ 통과" : "❌ 오탐"}] 동적 서버 페이지(searchParams 소비)가 unwrapped carrier 렌더 → PASS`);
  if (!dynamicPass) ok = false;

  console.log("");
  if (ok) {
    console.log("self-test 통과 — 6/1 형태를 탐지하고, Suspense 격리(직접/self-wrap)는 통과. ✅");
    console.log("");
    return 0;
  }
  console.log("self-test 실패 — checker가 6/1 형태를 놓치거나 정상 패턴을 오탐.");
  console.log("");
  return 1;
}

function main(): number {
  if (process.argv.includes("--self-test")) return runSelfTest();
  return runCheck();
}

process.exit(main());
