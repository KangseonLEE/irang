/**
 * 워크플로·스크립트 속 jq 프로그램 컴파일 검사 (2026-10-08)
 *
 * region-integrity.yml 의 이슈 본문 jq 프로그램(작은따옴표 문자열) 안에 ASCII 작은따옴표로 쓴 인용('문제 0')이
 * 프로그램을 중간에서 끊어, 대조는 깨끗했는데 판정 단계가 jq 컴파일 오류로 실패했다(첫 실행에서 발견).
 * 같은 날 check-links.sh 의 큰따옴표 목록도 같은 결로 깨져 있었다 — 문자열 경계 실수는 빌드·타입 검사가 못 잡는다.
 *
 * 셸이 읽는 그대로(작은따옴표 안은 다음 작은따옴표까지) jq 필터를 꺼내 `jq -n` 으로 컴파일만 해 본다.
 * 런타임 오류(입력이 null 이라 생기는 것)는 무시하고, 컴파일 오류(종료 코드 3)만 실패로 본다.
 * --arg/--argjson/--slurpfile/--rawfile 로 넘기는 변수는 빈 값으로 채운다.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();

function listFiles(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listFiles(p, ext));
    else if (ext.test(name)) out.push(p);
  }
  return out;
}

interface JqCall {
  file: string;
  line: number;
  filter: string;
  args: string[];
}

/** 셸 텍스트에서 `jq …'필터'` / `--jq '필터'` 호출을 셸 규칙대로 꺼낸다 */
function extractJqCalls(file: string, text: string): JqCall[] {
  const calls: JqCall[] = [];
  const re = /(?:^|[\s|(;$`])(?:--)?jq(?=\s)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    // 주석 줄은 건너뛴다
    const lineStart = text.lastIndexOf("\n", m.index) + 1;
    const lineText = text.slice(lineStart, text.indexOf("\n", m.index) === -1 ? undefined : text.indexOf("\n", m.index));
    if (/^\s*#/.test(lineText)) continue;

    let i = m.index + m[0].length;
    const args: string[] = [];
    let filter: string | null = null;
    // 토큰을 하나씩 본다: 옵션은 건너뛰고, 첫 비옵션 토큰이 필터
    for (let guard = 0; guard < 20; guard++) {
      while (i < text.length && /[ \t]/.test(text[i])) i++;
      if (text[i] === "\\" && text[i + 1] === "\n") {
        i += 2;
        continue;
      }
      if (i >= text.length || text[i] === "\n") break;
      if (text[i] === "'") {
        const end = text.indexOf("'", i + 1);
        if (end === -1) break;
        filter = text.slice(i + 1, end);
        break;
      }
      // 일반 토큰
      const tokEnd = (() => {
        let j = i;
        while (j < text.length && !/[\s]/.test(text[j])) j++;
        return j;
      })();
      const tok = text.slice(i, tokEnd);
      i = tokEnd;
      if (!tok.startsWith("-")) break; // 작은따옴표가 아닌 필터("$VAR", . 등)는 검사 밖
      if (["--arg", "--argjson", "--slurpfile", "--rawfile"].includes(tok)) {
        while (i < text.length && /[ \t]/.test(text[i])) i++;
        let nameEnd = i;
        while (nameEnd < text.length && /[A-Za-z0-9_]/.test(text[nameEnd])) nameEnd++;
        const name = text.slice(i, nameEnd);
        i = nameEnd;
        // 값 토큰 하나 건너뛰기(따옴표 고려)
        while (i < text.length && /[ \t]/.test(text[i])) i++;
        if (text[i] === "'" || text[i] === '"') {
          const q = text[i];
          const end = text.indexOf(q, i + 1);
          i = end === -1 ? text.length : end + 1;
        } else {
          while (i < text.length && !/\s/.test(text[i])) i++;
        }
        if (name) args.push(tok === "--argjson" ? "--argjson" : "--arg", name, tok === "--argjson" ? "null" : "");
      }
    }
    if (filter !== null) {
      calls.push({ file, line: text.slice(0, m.index).split("\n").length, filter, args });
    }
  }
  return calls;
}

const FILES = [
  ...listFiles(join(ROOT, ".github/workflows"), /\.ya?ml$/),
  ...listFiles(join(ROOT, "scripts"), /\.sh$/),
];

const CALLS = FILES.flatMap((f) => extractJqCalls(f.slice(ROOT.length + 1), readFileSync(f, "utf8")));

describe("워크플로·스크립트 jq 프로그램", () => {
  it("검사할 jq 호출을 실제로 찾는다", () => {
    expect(CALLS.length).toBeGreaterThan(20);
    expect(CALLS.some((c) => c.file.includes("region-integrity.yml"))).toBe(true);
  });

  it("전부 컴파일된다(작은따옴표 경계가 프로그램을 끊지 않는다)", () => {
    const broken: string[] = [];
    for (const call of CALLS) {
      const run = spawnSync("jq", ["-n", ...call.args, call.filter], { encoding: "utf8", input: "" });
      if (run.status === 3) {
        broken.push(`${call.file}:${call.line} — ${run.stderr.split("\n")[0]}`);
      }
    }
    expect(broken, broken.join("\n")).toEqual([]);
  });

  it("검사기 자기 검증 — 작은따옴표로 끊긴 프로그램을 잡는다", () => {
    const sample = `jq -r '\n  "건너뛴 대조는 '문제 0'으로 치지 않아요"\n' "$F"`;
    const [call] = extractJqCalls("sample.sh", sample);
    expect(call).toBeDefined();
    const run = spawnSync("jq", ["-n", call.filter], { encoding: "utf8" });
    expect(run.status).toBe(3);
  });
});
