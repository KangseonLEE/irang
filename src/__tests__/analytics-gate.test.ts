import { describe, expect, it } from "vitest";
import { INTERNAL_TRAFFIC_FLAG, irangGaGate, type GateWindow } from "@/lib/analytics-gate";

const ID = "G-TEST123";
const NORMAL_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

function fakeWindow(opts: { ua?: string; storage?: Record<string, string> | "throw" }): GateWindow {
  const storage = opts.storage;
  return {
    navigator: { userAgent: opts.ua ?? NORMAL_UA },
    localStorage: {
      getItem(key: string) {
        if (storage === "throw") throw new Error("SecurityError");
        return storage?.[key] ?? null;
      },
    },
  };
}

describe("irangGaGate — GA 로드 게이트", () => {
  it("일반 방문자는 허용하고 ga-disable을 세우지 않는다", () => {
    const w = fakeWindow({});
    expect(irangGaGate(w, ID)).toBe(true);
    expect(w[`ga-disable-${ID}`]).toBeUndefined();
  });

  it("UA에 irang-e2e 토큰이 있으면 차단 + ga-disable", () => {
    const w = fakeWindow({ ua: `${NORMAL_UA} irang-e2e/1.0` });
    expect(irangGaGate(w, ID)).toBe(false);
    expect(w[`ga-disable-${ID}`]).toBe(true);
  });

  it("운영자 플래그(localStorage irang-internal=1)면 차단", () => {
    const w = fakeWindow({ storage: { [INTERNAL_TRAFFIC_FLAG]: "1" } });
    expect(irangGaGate(w, ID)).toBe(false);
    expect(w[`ga-disable-${ID}`]).toBe(true);
  });

  it("플래그 값이 1이 아니면 허용", () => {
    expect(irangGaGate(fakeWindow({ storage: { [INTERNAL_TRAFFIC_FLAG]: "0" } }), ID)).toBe(true);
  });

  it("스토리지 접근이 throw 하면 일반 방문자로 간주(허용)", () => {
    expect(irangGaGate(fakeWindow({ storage: "throw" }), ID)).toBe(true);
  });

  it("navigator/localStorage가 없어도 허용", () => {
    expect(irangGaGate({}, ID)).toBe(true);
  });

  // ── 인라인 스크립트 자기 완결성 ──
  // google-analytics.tsx 가 함수를 toString 으로 박아 넣는다. 모듈 스코프를 참조하면
  // 브라우저에서 ReferenceError 로 조용히 죽으므로, 문자열화 → 재평가 경로를 그대로 검사.
  it("toString 으로 재평가해도 동일하게 동작한다 (외부 참조 없음)", () => {
    const src = irangGaGate.toString();
    expect(src).not.toMatch(/\b(import|require|INTERNAL_TRAFFIC_FLAG|exports)\b/);
    const revived = new Function(`return (${src});`)() as typeof irangGaGate;
    expect(revived(fakeWindow({}), ID)).toBe(true);
    expect(revived(fakeWindow({ ua: "x irang-e2e/1.0" }), ID)).toBe(false);
    const w = fakeWindow({ storage: { [INTERNAL_TRAFFIC_FLAG]: "1" } });
    expect(revived(w, ID)).toBe(false);
    expect(w[`ga-disable-${ID}`]).toBe(true);
  });

  it("함수 본문의 플래그 리터럴이 export 상수와 같다", () => {
    expect(irangGaGate.toString()).toContain(`"${INTERNAL_TRAFFIC_FLAG}"`);
  });
});
