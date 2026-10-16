/**
 * 루트 loading.tsx 금지 + 로딩 화면 없는 라우트 명시 (2026-10-16, 모바일 첫 화면 LCP).
 *
 * 왜: `loading.tsx` 는 그 아래 페이지 전체를 `<Suspense>` 로 감싼다. React 19.2 는 다 그려진 경계라도
 * 12.8KB 를 넘으면 HTML 에서 따로 떼어(`<template id="B:0">` + `<div hidden id="S:0">`) 인라인 `$RC`
 * 스크립트가 붙여 넣을 때까지 숨기고, 그 공개를 300ms 단위로 묶는다. 루트에 있으면 정적(ISR) 랜딩까지
 * 히어로가 숨은 채 내려가 Lighthouse 모바일 LCP 9초대(렌더 지연 95%)였다.
 *
 * 규칙: 로딩 화면은 요청 때 데이터를 읽는(ƒ) 라우트에만 그 세그먼트에 둔다. 정적(○·●) 라우트는
 * Link 프리페치로 전체 RSC 를 미리 받으므로 로딩 화면이 필요 없다. 아래 목록 밖의 새 페이지가
 * 로딩 화면 없이 생기면 실패한다 — 동적이면 loading.tsx 를, 정적이면 이 목록에 사유와 함께 추가.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const APP = join(process.cwd(), "src/app");

/** 로딩 화면 없이 두는 페이지 — 전부 빌드 출력 ○/● (정적·ISR) */
const STATIC_WITHOUT_LOADING = new Set([
  ".", // 랜딩 — ISR 6h
  "about",
  "about/disclaimer",
  "about/updates",
  "about/updates/[date]",
  "guides",
  "guides/beginner-crops",
  "guides/budget-50s",
  "guides/failure-cases",
  "guides/preparation",
  "guides/solo-farming",
  "more",
  "start",
  "start/[lane]",
  "terms",
  "privacy", // 10/17 개인정보 처리방침 — 정적(데이터 조회 없음)
  // 10/17 LCP 2단계 — 상세는 ●(generateStaticParams). 목록 로딩은 각 (list) 그룹으로 옮겼다.
  // programs/[id] 의 수집 행(crawl-*)은 요청 때 렌더지만 상세 내비게이션은 이전 화면을 유지하다 바뀐다(빈 화면 없음).
  "crops/[id]",
  "crops/[id]/stories",
  "programs/[id]",
]);

function pageDirs(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...pageDirs(p));
    else if (name === "page.tsx") out.push(dir);
  }
  return out;
}

function hasLoadingAbove(dir: string): boolean {
  for (let d = dir; d.startsWith(APP); d = dirname(d)) {
    if (existsSync(join(d, "loading.tsx"))) return true;
    if (d === APP) break;
  }
  return false;
}

describe("로딩 경계", () => {
  it("루트 app/loading.tsx 가 없다 — 랜딩이 Suspense 경계 안으로 들어가면 첫 화면이 숨는다", () => {
    expect(existsSync(join(APP, "loading.tsx"))).toBe(false);
  });

  it("작물·지원사업 상세는 목록 로딩 경계 밖이다 — 목록 로딩은 (list) 그룹에만", () => {
    expect(existsSync(join(APP, "crops/loading.tsx"))).toBe(false);
    expect(existsSync(join(APP, "programs/loading.tsx"))).toBe(false);
    expect(existsSync(join(APP, "crops/(list)/loading.tsx"))).toBe(true);
    expect(existsSync(join(APP, "programs/(list)/loading.tsx"))).toBe(true);
    for (const d of ["crops/[id]", "crops/[id]/stories", "programs/[id]"]) {
      expect(hasLoadingAbove(join(APP, d)), d).toBe(false);
    }
  });

  it("로딩 화면 없는 페이지는 정적 목록에 있는 것뿐이다", () => {
    const uncovered = pageDirs(APP)
      .filter((d) => !hasLoadingAbove(d))
      .map((d) => relative(APP, d) || ".")
      .sort();
    expect(uncovered.filter((d) => !STATIC_WITHOUT_LOADING.has(d))).toEqual([]);
  });
});
