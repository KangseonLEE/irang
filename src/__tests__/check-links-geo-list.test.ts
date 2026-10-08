/**
 * check-links.sh 지역 차단 경고 목록(GEO_WARN_URLS) 파싱 계약 (2026-10-08)
 *
 * 10/7 에 넣은 메모 `"영양군청 | 대한민국 별천지 영양"` 의 큰따옴표가 큰따옴표 문자열을 끊어, 목록이 통째로
 * 빈 값이 되고 `set -euo pipefail` 때문에 스크립트가 시작하자마자 멈추는 상태였다(한 번도 실행되기 전에 발견).
 * 목록은 히어독(`read -d ''`)으로 바꿨고, 이 테스트가 실제 bash 로 파싱해 본다.
 *
 * 1) 목록 블록이 bash 에서 오류 없이 읽히고, 원문에 적힌 URL 줄 수만큼 들어온다
 * 2) 첫 칸은 모두 올바른 URL 이다
 * 3) 목록의 URL 은 전부 데이터 파일에 실제로 있다 — 주소를 바꾸면 옛 줄을 지운다(남은 옛 줄은 다른 실패를 경고로 묻는다)
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const SCRIPT = readFileSync(join(process.cwd(), "scripts/check-links.sh"), "utf8");

function geoBlock(): string {
  const start = SCRIPT.indexOf("IFS= read -r -d '' GEO_WARN_URLS <<'GEO'");
  expect(start, "GEO_WARN_URLS 는 read -d '' 히어독으로 정의한다").toBeGreaterThan(-1);
  const end = SCRIPT.indexOf("\nGEO\n", start);
  expect(end).toBeGreaterThan(start);
  return SCRIPT.slice(start, end + "\nGEO\n".length);
}

function rawUrlLines(block: string): string[] {
  return block
    .split("\n")
    .slice(1, -2)
    .filter((line) => line.startsWith("http"))
    .map((line) => line.split(/\s/)[0]);
}

describe("check-links.sh GEO_WARN_URLS", () => {
  it("bash 가 오류 없이 읽고, 적힌 URL 이 전부 들어온다", () => {
    const block = geoBlock();
    const run = spawnSync(
      "bash",
      ["-c", `set -euo pipefail\n${block}\nprintf '%s\\n' "$GEO_WARN_URLS"`],
      { encoding: "utf8" },
    );
    expect(run.stderr, run.stderr).toBe("");
    expect(run.status).toBe(0);
    const parsed = run.stdout
      .split("\n")
      .filter((line) => line.startsWith("http"))
      .map((line) => line.split(/\s/)[0]);
    const expected = rawUrlLines(block);
    expect(expected.length).toBeGreaterThanOrEqual(10);
    expect(parsed).toEqual(expected);
  });

  it("첫 칸은 올바른 URL", () => {
    for (const url of rawUrlLines(geoBlock())) {
      expect(() => new URL(url), url).not.toThrow();
    }
  });

  it("목록의 URL 은 전부 데이터 파일에 있다(옛 주소 줄 금지)", () => {
    const data = ["programs", "education", "events", "centers"]
      .map((name) => readFileSync(join(process.cwd(), `src/lib/data/${name}.ts`), "utf8"))
      .join("\n");
    for (const url of rawUrlLines(geoBlock())) {
      expect(data.includes(`"${url}"`), `${url} — 데이터에 없는 주소예요. 옛 줄을 지워 주세요`).toBe(true);
    }
  });
});
