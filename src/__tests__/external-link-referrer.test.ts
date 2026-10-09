import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * 계약 테스트 (2026-10-09): 외부 링크는 상대 사이트에 "irangfarm.com 에서 왔다"는 사실을 남긴다.
 *
 * 왜: 외부 링크에 `rel="noreferrer"` 가 붙어 있으면 브라우저가 Referer 를 보내지 않아, 기관·언론사
 * 접속 통계에 우리 방문이 "직접 방문"으로 잡힌다(회장 10/9 "우리 사이트라는 존재를 정확히 알려줬으면").
 * 그래서 `rel="noopener"` + `referrerPolicy="origin"` 으로 통일한다 — origin 은 경로 없이
 * `https://irangfarm.com/` 만 보내고, 사이트 기본값(strict-origin-when-cross-origin)과 달리
 * https → http 기관 사이트에도 보낸다. 새 외부 링크에서 빠지지 않게 이 테스트가 잡는다.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "__tests__") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

// 관리자 화면의 우리 사이트 새 탭 링크(같은 출처)는 대상이 아니다.
const SAME_ORIGIN_ONLY = new Set(["src/components/admin/admin-shell.tsx"]);

describe("외부 링크는 출처(origin)를 전달한다", () => {
  const files = walk(SRC).map((f) => ({ rel: relative(process.cwd(), f), src: readFileSync(f, "utf8") }));

  it("noreferrer 를 쓰지 않는다", () => {
    const hits = files.filter((f) => /noreferrer/.test(f.src)).map((f) => f.rel);
    expect(hits).toEqual([]);
  });

  it('rel="noopener" 에는 referrerPolicy="origin" 이 함께 붙는다', () => {
    const missing: string[] = [];
    for (const f of files) {
      if (SAME_ORIGIN_ONLY.has(f.rel)) continue;
      const re = /rel(=|:\s*)"noopener"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(f.src))) {
        const after = f.src.slice(m.index, m.index + 80);
        if (!/referrerPolicy(=|:\s*)"origin"/.test(after)) {
          const line = f.src.slice(0, m.index).split("\n").length;
          missing.push(`${f.rel}:${line}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
