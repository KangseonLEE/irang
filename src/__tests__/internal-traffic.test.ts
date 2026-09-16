import { describe, expect, it, afterEach, vi } from "vitest";
import {
  INTERNAL_TRAFFIC_COOKIE,
  INTERNAL_TRAFFIC_HEADER,
  internalSkipReason,
  isE2eRequest,
  type RequestLike,
} from "@/lib/internal-traffic";
import { INTERNAL_TRAFFIC_FLAG } from "@/lib/analytics-gate";

const NORMAL_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15";

function req(opts: {
  ua?: string;
  headers?: Record<string, string>;
  cookie?: string;
} = {}): RequestLike {
  const headers: Record<string, string> = {
    "user-agent": opts.ua ?? NORMAL_UA,
    ...(opts.headers ?? {}),
  };
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    cookies: {
      get: (name: string) =>
        name === INTERNAL_TRAFFIC_COOKIE && opts.cookie !== undefined
          ? { value: opts.cookie }
          : undefined,
    },
  };
}

/** 라우트는 프로덕션에서만 적재하므로 판정 테스트도 프로덕션을 기준으로 한다 */
function inProduction<T>(fn: () => T): T {
  vi.stubEnv("NODE_ENV", "production");
  try {
    return fn();
  } finally {
    vi.unstubAllEnvs();
  }
}

describe("internalSkipReason", () => {
  it("일반 방문자는 적재한다 (null)", () => {
    expect(inProduction(() => internalSkipReason(req()))).toBeNull();
  });

  it("UA에 irang-e2e 토큰이 있으면 e2e", () => {
    expect(
      inProduction(() => internalSkipReason(req({ ua: `${NORMAL_UA} irang-e2e/1.0` }))),
    ).toBe("e2e");
  });

  it("x-irang-e2e 헤더가 있으면 e2e (값 무관)", () => {
    expect(
      inProduction(() => internalSkipReason(req({ headers: { "x-irang-e2e": "" } }))),
    ).toBe("e2e");
  });

  it("운영자 쿠키(irang-internal=1)면 internal", () => {
    expect(inProduction(() => internalSkipReason(req({ cookie: "1" })))).toBe("internal");
  });

  it("운영자 헤더(x-irang-internal: 1)면 internal", () => {
    expect(
      inProduction(() =>
        internalSkipReason(req({ headers: { [INTERNAL_TRAFFIC_HEADER]: "1" } })),
      ),
    ).toBe("internal");
  });

  it("쿠키 값이 1이 아니면 일반 방문자", () => {
    expect(inProduction(() => internalSkipReason(req({ cookie: "0" })))).toBeNull();
  });

  it("프로덕션이 아니면 dev — 로컬 dev 서버가 프로덕션 DB에 쓰지 않는다", () => {
    // vitest 기본 NODE_ENV는 "test"
    expect(internalSkipReason(req())).toBe("dev");
  });

  it("e2e 판정이 운영자·dev보다 우선한다", () => {
    expect(
      inProduction(() =>
        internalSkipReason(req({ ua: `${NORMAL_UA} irang-e2e/1.0`, cookie: "1" })),
      ),
    ).toBe("e2e");
  });
});

describe("isE2eRequest", () => {
  it("운영자 쿠키는 e2e가 아니다 — 커뮤니티 작성은 막지 않는다", () => {
    expect(isE2eRequest(req({ cookie: "1" }))).toBe(false);
  });

  it("e2e UA는 true", () => {
    expect(isE2eRequest(req({ ua: `${NORMAL_UA} irang-e2e/1.0` }))).toBe(true);
  });
});

describe("플래그 이름", () => {
  it("쿠키와 GA localStorage 플래그는 같은 이름을 쓴다", () => {
    expect(INTERNAL_TRAFFIC_COOKIE).toBe(INTERNAL_TRAFFIC_FLAG);
    expect(INTERNAL_TRAFFIC_COOKIE).toBe("irang-internal");
  });
});

describe("markInternalBrowser", () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  afterEach(() => {
    if (originalWindow === undefined) delete (globalThis as { window?: unknown }).window;
    else (globalThis as { window?: unknown }).window = originalWindow;
    if (originalDocument === undefined)
      delete (globalThis as { document?: unknown }).document;
    else (globalThis as { document?: unknown }).document = originalDocument;
  });

  it("localStorage 플래그와 쿠키를 함께 심는다", async () => {
    const store: Record<string, string> = {};
    let written = "";
    (globalThis as { window?: unknown }).window = {
      localStorage: {
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
      },
      location: { protocol: "https:" },
    };
    (globalThis as { document?: unknown }).document = {
      set cookie(v: string) {
        written = v;
      },
      get cookie() {
        return written;
      },
    };

    const { markInternalBrowser } = await import("@/lib/internal-traffic");
    markInternalBrowser();

    expect(store[INTERNAL_TRAFFIC_FLAG]).toBe("1");
    expect(written).toContain(`${INTERNAL_TRAFFIC_COOKIE}=1`);
    expect(written).toContain("Path=/");
    expect(written).toContain("SameSite=Lax");
    expect(written).toContain("Secure");
  });
});
