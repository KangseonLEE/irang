/**
 * Sentry 리플레이는 첫 로드 뒤 별도 청크로 붙인다 (2026-10-17, 모바일 LCP 2단계).
 * - 초기화(instrumentation-client)에는 리플레이를 정적으로 넣지 않는다 — 넣으면 rrweb 가 첫 로드 청크로 돌아온다
 * - 지연 모듈은 replayIntegration 을 같은 마스킹 옵션으로 만들고, 오류 시 비율 옵션은 초기화에 남아 있다
 * (@sentry/nextjs 는 vitest 에서 import 되지 않아 소스로 확인한다)
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (rel: string) => readFileSync(join(process.cwd(), "src", rel), "utf8");

describe("Sentry 리플레이 지연 로드", () => {
  it("초기화 파일은 replayIntegration 을 직접 부르지 않고 지연 모듈을 동적 import 한다", () => {
    const src = read("instrumentation-client.ts");
    expect(src).not.toMatch(/Sentry\.replayIntegration\(/);
    expect(src).toContain('import("@/lib/sentry-replay")');
    expect(src).toContain("replaysOnErrorSampleRate: REPORTABLE ? 0.1 : 0");
  });

  it("지연 모듈이 replayIntegration 을 마스킹 옵션 그대로 만든다", () => {
    const src = read("lib/sentry-replay.ts");
    expect(src).toContain("export function createReplayIntegration()");
    expect(src).toContain("replayIntegration({");
    for (const opt of ["maskAllText: true", "blockAllMedia: true", "maskAllInputs: true"]) expect(src).toContain(opt);
  });
});
