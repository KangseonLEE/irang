/**
 * 빌드는 데이터 캐시(.next/cache/fetch-cache)를 비우고 시작한다 (2026-10-08)
 *
 * Vercel 은 빌드마다 같은 브랜치의 직전 `.next/cache/**` 를 복원한다(빌드 캐시). 그 안의 fetch-cache 에는
 * 직전 빌드가 받은 Supabase 응답이 들어 있어 — 지원사업 상세 revalidate 86400(하루), 교육·행사 상세는 revalidate 가
 * 없어 1년 — DB 큐레이션 행을 SQL 로 고친 뒤 새로 빌드해도 상세가 옛 값으로 다시 만들어진다(10/8 독립 QA 로컬 재현:
 * 빌드 A → SQL → 빌드 B 옛 값 / fetch-cache 만 지운 빌드 C 새 값). Vercel 의 런타임 데이터 캐시는 "빌드 때 갱신되지
 * 않는다"(공식 문서)라 빌드는 복원된 파일 캐시를 쓴다. 그래서 빌드 명령이 fetch-cache 를 먼저 지운다 —
 * 컴파일(turbopack)·이미지 캐시는 남겨 빌드 속도 영향은 작다.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { scripts: Record<string, string> };

describe("빌드 명령", () => {
  it("next build 전에 .next/cache/fetch-cache 를 지운다", () => {
    const build = pkg.scripts.build;
    const clear = build.indexOf("rm -rf .next/cache/fetch-cache");
    const next = build.indexOf("next build");
    expect(clear, build).toBeGreaterThanOrEqual(0);
    expect(next, build).toBeGreaterThan(clear);
    // 지우기가 실패해도 빌드가 그냥 진행되면 옛 값이 다시 굳는다 — && 로 잇는다
    expect(build.slice(clear, next)).toContain("&&");
  });

  it("컴파일·이미지 캐시는 지우지 않는다(빌드 속도)", () => {
    expect(pkg.scripts.build).not.toMatch(/rm -rf \.next\/cache(\s|$|&)/);
    expect(pkg.scripts.build).not.toMatch(/rm -rf \.next(\s|$|&)/);
  });
});
