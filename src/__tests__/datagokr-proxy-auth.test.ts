// @vitest-environment node
/**
 * data.go.kr 프록시 Worker 인증 — 앱 키·CI 전용 키 (2026-10-07)
 *
 * 앱(Vercel)은 PROXY_SECRET, GitHub 자동 대조(region-integrity)는 PROXY_SECRET_CI.
 * 앱 키 값은 Vercel(sensitive)·Worker 시크릿 어디서도 다시 볼 수 없어(10/7) CI 에 복사하지 않고 따로 뒀다.
 * CI 키는 조회(/proxy)만 — 예열(/warm)은 앱 키로만.
 * upstream 을 부르지 않는 응답(허용 밖 경로 404, /warm 403)으로 인증 단계만 본다.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import worker from "../../workers/datagokr-proxy/src/index";

afterEach(() => {
  vi.unstubAllGlobals();
});

const APP = "a".repeat(64);
const CI = "c".repeat(64);
const kv = { get: async () => null, put: async () => {} };
const env = (extra: Record<string, unknown> = {}) => ({
  DATA_GO_KR_API_KEY: "k",
  PROXY_SECRET: APP,
  DATAGOKR_CACHE: kv,
  ...extra,
});
const call = (path: string, secret: string | null, e: Record<string, unknown> = env({ PROXY_SECRET_CI: CI })) =>
  worker.fetch(
    new Request(`https://proxy.test${path}`, { headers: secret ? { "x-irang-proxy-secret": secret } : {} }),
    e as never,
  );

describe("data.go.kr 프록시 Worker 인증", () => {
  it("키 없음·틀린 키 → 401", async () => {
    expect((await call("/proxy/not-allowed", null)).status).toBe(401);
    expect((await call("/proxy/not-allowed", "x".repeat(64))).status).toBe(401);
  });

  it("앱 키·CI 키 모두 인증 통과 — 허용 밖 경로라 404 (upstream 미호출)", async () => {
    expect((await call("/proxy/not-allowed", APP)).status).toBe(404);
    expect((await call("/proxy/not-allowed", CI)).status).toBe(404);
  });

  it("CI 키로는 예열(/warm) 불가 → 403", async () => {
    expect((await call("/warm", CI)).status).toBe(403);
  });

  it("CI 키가 없는 Worker 는 CI 키를 거절하고, 빈 값끼리도 일치로 보지 않는다", async () => {
    expect((await call("/proxy/not-allowed", CI, env())).status).toBe(401);
    expect((await call("/proxy/not-allowed", "", env({ PROXY_SECRET_CI: "" }))).status).toBe(401);
  });

  it("앱 키가 빠진 Worker 는 500 + 누락 이름(값은 응답하지 않음)", async () => {
    const r = await call("/proxy/not-allowed", APP, env({ PROXY_SECRET: "" }));
    expect(r.status).toBe(500);
    expect(await r.json()).toMatchObject({ missing: ["PROXY_SECRET"] });
  });
});

/**
 * 저장분 건너뛰기(x-irang-proxy-fresh) — 정합성 대조 기준값 (10/7)
 * 저장분(KV)끼리 비교하면 시·도 합계와 구별 건수의 저장 시점이 달라 대구 4,236 ≠ 4,235 가 '불일치'로 잡혔다.
 * 대조는 원천에서 새로 받고, 받은 새 값은 저장분에도 써서 앱도 최신이 된다. 앱 요청(헤더 없음)은 종전대로 저장분.
 */
describe("data.go.kr 프록시 Worker 저장분 건너뛰기", () => {
  const HIRA = "/proxy/B551182/hospInfoServicev2/getHospBasisList?sidoCd=230000&pageNo=1&numOfRows=1&_type=json";

  it("헤더 없으면 저장분, 있으면 원천에서 새로 받아 저장분도 갱신", async () => {
    const store = new Map<string, string>();
    const kv = {
      get: vi.fn(async (k: string) => store.get(k) ?? null),
      put: vi.fn(async (k: string, v: string) => void store.set(k, v)),
    };
    let upstreamBody = '{"v":1}';
    const upstream = vi.fn(async () => new Response(upstreamBody, { status: 200 }));
    vi.stubGlobal("fetch", upstream);
    const req = (fresh: boolean) =>
      worker.fetch(
        new Request(`https://proxy.test${HIRA}`, {
          headers: { "x-irang-proxy-secret": CI, ...(fresh ? { "x-irang-proxy-fresh": "1" } : {}) },
        }),
        env({ PROXY_SECRET_CI: CI, DATAGOKR_CACHE: kv }) as never,
      );

    expect(await (await req(false)).text()).toBe('{"v":1}'); // 처음 — 원천에서 받아 저장
    upstreamBody = '{"v":2}'; // 원천이 바뀜
    const cached = await req(false);
    expect(cached.headers.get("x-irang-proxy")).toBe("kv-hit");
    expect(await cached.text()).toBe('{"v":1}'); // 앱 요청은 저장분
    expect(upstream).toHaveBeenCalledTimes(1);

    const fresh = await req(true);
    expect(fresh.headers.get("x-irang-proxy")).toBe("upstream");
    expect(await fresh.text()).toBe('{"v":2}'); // 대조는 원천의 새 값
    expect(upstream).toHaveBeenCalledTimes(2);
    expect(await (await req(false)).text()).toBe('{"v":2}'); // 저장분도 새 값으로
  });
});

/**
 * KV 저장은 덤 — 쓰기 한도 초과에도 응답은 그대로 (10/7 밤)
 * Free 플랜 KV 쓰기 하루 1,000회를 넘기자 put 예외가 응답을 502 로 바꿔, 저장분에 없는 의료기관·기상 조회가
 * 전부 실패했다(주간 대조 CI 'KV put() limit exceeded for the day'). 대조(fresh)는 값이 같으면 쓰지 않는다.
 */
describe("data.go.kr 프록시 Worker — KV 쓰기 실패·한도", () => {
  const HIRA = "/proxy/B551182/hospInfoServicev2/getHospBasisList?sidoCd=310000&pageNo=1&numOfRows=1&_type=json";
  const req = (e: Record<string, unknown>, fresh = false) =>
    worker.fetch(
      new Request(`https://proxy.test${HIRA}`, {
        headers: { "x-irang-proxy-secret": APP, ...(fresh ? { "x-irang-proxy-fresh": "1" } : {}) },
      }),
      e as never,
    );

  it("put 이 한도 초과로 실패해도 원천 응답을 200 으로 돌려준다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"n":7}', { status: 200 })));
    const kv = {
      get: async () => null,
      put: vi.fn(async () => {
        throw new Error("KV put() limit exceeded for the day.");
      }),
    };
    const r = await req(env({ DATAGOKR_CACHE: kv }));
    expect(r.status).toBe(200);
    expect(await r.text()).toBe('{"n":7}');
    expect(kv.put).toHaveBeenCalledTimes(1);
  });

  it("get 이 실패하면 저장분 없음으로 보고 원천에서 받는다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response('{"n":8}', { status: 200 })));
    const kv = {
      get: async () => {
        throw new Error("KV get failed");
      },
      put: async () => {},
    };
    const r = await req(env({ DATAGOKR_CACHE: kv }));
    expect(r.status).toBe(200);
    expect(await r.text()).toBe('{"n":8}');
  });

  it("대조(fresh)는 저장분과 같으면 쓰지 않고, 다르면 쓴다", async () => {
    const store = new Map<string, string>();
    const kv = {
      get: vi.fn(async (k: string) => store.get(k) ?? null),
      put: vi.fn(async (k: string, v: string) => void store.set(k, v)),
    };
    let body = '{"n":1}';
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status: 200 })));
    await req(env({ DATAGOKR_CACHE: kv })); // 앱 요청 — 저장
    expect(kv.put).toHaveBeenCalledTimes(1);
    await req(env({ DATAGOKR_CACHE: kv }), true); // 대조 — 같은 값
    expect(kv.put).toHaveBeenCalledTimes(1);
    body = '{"n":2}';
    await req(env({ DATAGOKR_CACHE: kv }), true); // 대조 — 바뀐 값
    expect(kv.put).toHaveBeenCalledTimes(2);
    expect([...store.values()]).toEqual(['{"n":2}']);
  });

  it("cron 예열은 커서 저장이 실패해도 예외를 던지지 않는다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
    const kv = {
      get: async () => null,
      put: async () => {
        throw new Error("KV put() limit exceeded for the day.");
      },
    };
    await expect(worker.scheduled({ scheduledTime: Date.now() } as never, env({ DATAGOKR_CACHE: kv }) as never)).resolves.toBeUndefined();
  });
});
