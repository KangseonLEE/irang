import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * 계약 테스트 (2026-09-19): 브라우저에서 `/api/*` 에 POST 하는 모든 호출처는
 * `internalRequestHeaders()` 를 headers 에 펼쳐야 한다.
 *
 * 왜: 내부·자동화 트래픽 차단은 서버 판정(`internalSkipReason`)이 SSOT 지만, 그 판정이
 * 보는 표식(쿠키·헤더)이 요청에 실려 가야 작동한다. 쿠키는 자동이지만 쿠키를 못 심은
 * Playwright 실측·쿠키 차단 브라우저는 헤더가 유일한 경로이고, 헤더는 호출처마다 손으로
 * 붙이는 것이라 새 엔드포인트에서 빠진다(5/11 logSearch 가 /search 한 곳에서만 불리던
 * 구조적 누락과 같은 결). 사람이 기억하는 대신 이 테스트가 잡는다.
 */
const SRC = join(process.cwd(), "src");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name === "__tests__" || name === "api") continue; // 서버 라우트·테스트 제외
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

describe("/api/* POST 호출처는 internalRequestHeaders() 를 붙인다", () => {
  const files = walk(SRC);
  const calls: { file: string; snippet: string }[] = [];
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const re = /fetch\(\s*[`"']\/api\//g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
      const window = src.slice(m.index, m.index + 700);
      if (/method:\s*["']POST["']/.test(window)) calls.push({ file: relative(process.cwd(), f), snippet: window });
    }
  }

  it("POST 호출처가 실제로 존재한다 (스캐너 자체 검증)", () => {
    expect(calls.length).toBeGreaterThanOrEqual(9);
  });

  it.each(calls.map((c) => [c.file, c]))("%s", (_file, c) => {
    const call = c as { file: string; snippet: string };
    expect(call.snippet, `${call.file} 의 POST 호출에 internalRequestHeaders() 가 없어요`).toMatch(/internalRequestHeaders\(\)/);
    const src = readFileSync(join(process.cwd(), call.file), "utf8");
    expect(src).toMatch(/import \{[^}]*internalRequestHeaders[^}]*\} from "@\/lib\/internal-traffic"/);
  });
});
