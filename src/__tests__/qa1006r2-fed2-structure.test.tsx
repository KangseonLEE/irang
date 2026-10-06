/**
 * 10/6 2차 QA — FE-D2 범위 구조·접근성 회귀.
 * - R2-Q2: 공유 결과 화면 h1 2개(로딩 스켈레톤 h1) · 404 제목·canonical
 * - R2-Q1·Q2: 라우트 간 import(체크리스트 I) — 진단 기록·뒤로가기 훅은 lib/diagnosis, 적합도 위저드는 /match 로
 * - R2-Q3: 404 장식 숫자·추천 thumbs 대비, 정정 이력 페이지 '이전' 비활성 버튼이 포커스를 받던 것
 */
import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import CorrectionsPage from "@/app/about/corrections/page";
import { metadata as notFoundMetadata } from "@/app/not-found";

const read = (rel: string) => readFileSync(join(process.cwd(), rel), "utf8");

describe("로딩 스켈레톤에는 h1 이 없다 — 스트리밍 첫 조각으로 실제 h1 과 함께 HTML 에 실린다", () => {
  it.each(["src/app/assess/loading.tsx", "src/app/match/loading.tsx"])("%s", (f) => {
    expect(read(f)).not.toMatch(/<h1\b/);
  });
});

describe("404 화면", () => {
  it("제목은 '페이지를 찾지 못했어요'(레이아웃 템플릿이 접미), canonical 은 홈을 물려받지 않는다", () => {
    expect(notFoundMetadata.title).toBe("페이지를 찾지 못했어요");
    expect(notFoundMetadata.alternates).toEqual({ canonical: null });
  });

  it("장식 숫자는 큰 글자 대비 3:1 이상(70% 틴트) — 예전 20% 는 1.35:1", () => {
    expect(read("src/app/not-found.module.css")).toMatch(/\.code \{[^}]*color-mix\(in srgb, var\(--primary, #1b6b5a\) 70%, white\)/);
  });
});

describe("라우트 간 import 없음 (체크리스트 I)", () => {
  /** src/app/<route>/ 아래 파일이 다른 라우트 폴더를 상대 경로로 가져오지 않는다 — 진단 관련 두 라우트 */
  const files = (dir: string): string[] =>
    readdirSync(join(process.cwd(), dir)).flatMap((e) => {
      const rel = `${dir}/${e}`;
      return statSync(join(process.cwd(), rel)).isDirectory() ? files(rel) : /\.tsx?$/.test(e) ? [rel] : [];
    });

  it("/match·/assess 파일이 서로의 폴더나 다른 라우트를 '../' 로 가져오지 않는다", () => {
    const offenders = [...files("src/app/match"), ...files("src/app/assess")].filter((f) =>
      /from "\.\.\/(match|assess)\//.test(read(f)),
    );
    expect(offenders).toEqual([]);
  });

  it("적합도 위저드는 유일한 사용처 /match 에, 기록·뒤로가기 훅은 lib/diagnosis 에", () => {
    const src = read("src/app/match/assessment-wizard.tsx");
    expect(src).toContain('from "@/lib/diagnosis/use-diagnosis-history"');
    expect(src).toContain('from "@/lib/diagnosis/use-wizard-back-guard"');
    expect(src).toContain('from "@/lib/diagnosis/assess-share-code"');
    expect(read("src/app/match/service-gateway.tsx")).toContain('from "./assessment-wizard"');
  });
});

describe("추천 thumbs — 눌린 상태 글자 대비", () => {
  it("상태색을 어둡게 섞은 글자색(4.5:1 이상)", () => {
    const css = read("src/components/match/recommendation-thumbs.module.css");
    expect(css).toMatch(/\.thumbBtnActiveUp \{[^}]*color: color-mix\(in srgb, #059669 66%, #000\)/);
    expect(css).toMatch(/\.thumbBtnActiveDown \{[^}]*color: color-mix\(in srgb, #d97706 66%, #000\)/);
  });
});

describe("정정 이력 — 갈 곳 없는 '이전'·'다음'은 포커스를 받지 않는다", () => {
  it("첫 쪽: '이전'은 링크가 아닌 비활성 표시(role=link·aria-disabled, tabindex 없음), '다음'은 링크", async () => {
    render(await CorrectionsPage({ searchParams: Promise.resolve({}) }));
    const prev = screen.getByText("이전");
    expect(prev.tagName).toBe("SPAN");
    expect(prev).toHaveAttribute("role", "link");
    expect(prev).toHaveAttribute("aria-disabled", "true");
    expect(prev).not.toHaveAttribute("href");
    expect(prev).not.toHaveAttribute("tabindex");
    const next = screen.getByText("다음");
    expect(next.tagName).toBe("A");
    expect(next).toHaveAttribute("href", expect.stringContaining("page=2"));
  });
});
