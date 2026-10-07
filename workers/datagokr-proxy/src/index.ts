/**
 * data.go.kr 프록시 Worker — 허용된 두 경로만, 공유 시크릿 헤더가 맞을 때만 전달한다.
 *
 * 요청:  GET https://<worker>/proxy/<upstream path>?<params>   (serviceKey 제외)
 *        헤더 x-irang-proxy-secret: <PROXY_SECRET>
 * 응답:  upstream 상태·본문 그대로. 성공 응답은 KV(전역, 경로별 TTL) + 엣지 캐시.
 * 예열:  GET /warm?offset=N (같은 시크릿) 또는 cron — hira-warm-list.json을 40건씩 순환해 KV를 채운다.
 *        HIRA는 콜드 7~13초라 사용자 요청 전에 채워 두는 것이 이 Worker의 두 번째 목적(8/30).
 *
 * 시크릿(wrangler secret): DATA_GO_KR_API_KEY, PROXY_SECRET(앱·Vercel) / KV: DATAGOKR_CACHE
 *   PROXY_SECRET_CI(선택, 10/7): GitHub 자동 대조(region-integrity) 전용 키 — 조회(/proxy)만, 예열(/warm)은 안 된다.
 *   앱 키를 CI 에 복사하지 않고 따로 둬서 한쪽만 바꾸거나 끊을 수 있다. 값은 GitHub 시크릿 DATAGOKR_PROXY_CI_KEY 가
 *   원본이고 deploy-datagokr-proxy.yml 이 Worker 에 넣는다.
 */

import WARM_LIST from "./hira-warm-list.json";

interface Env {
  DATA_GO_KR_API_KEY: string;
  PROXY_SECRET: string;
  PROXY_SECRET_CI?: string;
  DATAGOKR_CACHE: KVNamespace;
}

interface KVNamespace {
  get(key: string, type: "text"): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
}

interface ScheduledController {
  scheduledTime: number;
}

const UPSTREAM_ORIGIN = "https://apis.data.go.kr";
const ASOS_PATH = "1360000/AsosDalyInfoService/getWthrDataList"; // 기상청 ASOS 일자료
const HIRA_PATH = "B551182/hospInfoServicev2/getHospBasisList"; // 심평원 의료기관 기본정보

/** 허용 경로 → KV/엣지 TTL(초). 새 data.go.kr API를 붙일 때 여기에 추가 (그 외는 404) */
const PATH_TTL: Record<string, number> = {
  [ASOS_PATH]: 6 * 60 * 60, // 일자료는 하루 단위 갱신, endDt가 매일 바뀌어 키도 매일 바뀜
  [HIRA_PATH]: 7 * 24 * 60 * 60, // 기관 수는 주 단위로도 거의 안 변함
};

const WARM_BATCH = 40; // Free 플랜 서브요청 50/호출 — 여유 두고 40
const WARM_CURSOR_KEY = "__warm_cursor";

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/** 길이 노출 없는 상수 시간 비교 */
function secretMatches(given: string | null, expected: string): boolean {
  if (!given || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** 파라미터를 정렬해 키로 — 앱이 붙이는 순서와 무관하게 같은 조회는 같은 키 */
function cacheKeyFor(path: string, params: URLSearchParams): string {
  const pairs = [...params.entries()].filter(([k]) => k.toLowerCase() !== "servicekey").sort(([a], [b]) => a.localeCompare(b));
  return `${path}?${new URLSearchParams(pairs).toString()}`;
}

async function fetchUpstream(env: Env, path: string, params: URLSearchParams): Promise<Response> {
  const upstream = new URL(`${UPSTREAM_ORIGIN}/${path}`);
  for (const [k, v] of params) {
    if (k.toLowerCase() === "servicekey") continue; // 키는 Worker 시크릿만 사용
    upstream.searchParams.append(k, v);
  }
  upstream.searchParams.set("serviceKey", env.DATA_GO_KR_API_KEY);
  return fetch(upstream.toString(), {
    headers: { "User-Agent": BROWSER_UA, Accept: "application/json,text/plain,*/*" },
    signal: AbortSignal.timeout(20_000),
  });
}

/**
 * KV 저장은 덤이다 — 실패해도 응답은 그대로 돌려준다. Free 플랜 KV 쓰기는 하루 1,000회(00:00 UTC 초기화)라
 * 넘기면 put 이 예외를 던지는데, 10/7 밤 그 예외가 응답을 502 로 바꿔 저장분에 없는 의료기관·기상 조회가 전부
 * 실패했다(주간 대조 CI 가 'KV put() limit exceeded for the day' 로 발견).
 */
async function storeBestEffort(env: Env, key: string, body: string, ttl: number): Promise<void> {
  try {
    await env.DATAGOKR_CACHE.put(key, body, { expirationTtl: ttl });
  } catch (err) {
    console.warn(`KV put 실패 — 응답은 그대로: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/** KV 읽기 실패는 저장분 없음으로 본다 */
async function readCache(env: Env, key: string): Promise<string | null> {
  try {
    return await env.DATAGOKR_CACHE.get(key, "text");
  } catch (err) {
    console.warn(`KV get 실패 — 저장분 없음으로: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

/**
 * 한 조회를 upstream에서 받아 KV에 저장. `skipIfSame` 이면 저장분과 같을 때 쓰지 않는다 — 정합성 대조(fresh)는
 * 하루에 수백 건을 새로 받는데 값은 대부분 그대로라, 쓰기 한도를 대조가 다 쓰지 않게(10/7).
 * 예열은 TTL 을 늘리려고 같아도 쓴다.
 */
async function fetchAndStore(
  env: Env,
  path: string,
  params: URLSearchParams,
  opts: { skipIfSame?: boolean } = {},
): Promise<{ status: number; body: string; ok: boolean }> {
  const res = await fetchUpstream(env, path, params);
  const body = await res.text();
  if (res.ok) {
    const key = cacheKeyFor(path, params);
    const same = opts.skipIfSame ? (await readCache(env, key)) === body : false;
    if (!same) await storeBestEffort(env, key, body, PATH_TTL[path]);
  }
  return { status: res.status, body, ok: res.ok };
}

async function handleProxy(request: Request, env: Env, upstreamPath: string): Promise<Response> {
  if (!(upstreamPath in PATH_TTL)) return json(404, { error: "path not allowed" });
  const params = new URL(request.url).searchParams;
  const key = cacheKeyFor(upstreamPath, params);

  // 정합성 대조(region-integrity)는 기준값을 원천에서 새로 받아야 한다 — 저장분(KV)을 건너뛰고 upstream 을 부른 뒤
  // 성공하면 KV 도 새 값으로 갱신한다(예열과 같은 효과). 10/7: 저장 시점이 다른 시·도 합계와 구별 건수를 비교해
  // 대구 4,236 ≠ 4,235 가 '불일치'로 잡혔다 — 앱 요청은 이 헤더를 보내지 않는다
  const fresh = request.headers.get("x-irang-proxy-fresh") === "1";
  const hit = fresh ? null : await readCache(env, key);
  if (hit !== null) {
    return new Response(hit, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${PATH_TTL[upstreamPath]}`, "x-irang-proxy": "kv-hit" },
    });
  }

  let result: { status: number; body: string; ok: boolean };
  try {
    result = await fetchAndStore(env, upstreamPath, params, { skipIfSame: fresh });
  } catch (err) {
    return json(502, { error: "upstream fetch failed", detail: err instanceof Error ? err.message : String(err) });
  }
  return new Response(result.body, {
    status: result.status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": result.ok ? `public, max-age=${PATH_TTL[upstreamPath]}` : "no-store",
      "x-irang-proxy": "upstream",
    },
  });
}

/** 예열 1회분: offset부터 WARM_BATCH건, 8개 동시. 다음 offset을 돌려준다(끝이면 0). */
async function warmBatch(env: Env, offset: number): Promise<{ done: number; failed: number; next: number; total: number }> {
  const list = WARM_LIST as { sidoCd: string; sgguCd?: string }[];
  const slice = list.slice(offset, offset + WARM_BATCH);
  let done = 0;
  let failed = 0;
  for (let i = 0; i < slice.length; i += 8) {
    const chunk = slice.slice(i, i + 8);
    const results = await Promise.allSettled(
      chunk.map((e) => {
        const p = new URLSearchParams({ sidoCd: e.sidoCd, pageNo: "1", numOfRows: "1", _type: "json" });
        if (e.sgguCd) p.set("sgguCd", e.sgguCd);
        return fetchAndStore(env, HIRA_PATH, p);
      }),
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.ok) done += 1;
      else failed += 1;
    }
  }
  const next = offset + WARM_BATCH >= list.length ? 0 : offset + WARM_BATCH;
  return { done, failed, next, total: list.length };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET") return json(405, { error: "GET only" });
    if (!env.PROXY_SECRET || !env.DATA_GO_KR_API_KEY) {
      const missing = ["PROXY_SECRET", "DATA_GO_KR_API_KEY"].filter((k) => !(env as unknown as Record<string, unknown>)[k]);
      return json(500, { error: "worker secrets not configured", missing });
    }
    const given = request.headers.get("x-irang-proxy-secret");
    const isApp = secretMatches(given, env.PROXY_SECRET);
    const isCi = !isApp && !!env.PROXY_SECRET_CI && secretMatches(given, env.PROXY_SECRET_CI);
    if (!isApp && !isCi) {
      return json(401, { error: "unauthorized" });
    }

    const url = new URL(request.url);
    if (url.pathname === "/warm") {
      if (!isApp) return json(403, { error: "warm needs the app key" });
      const offset = Number(url.searchParams.get("offset") ?? "0") || 0;
      const r = await warmBatch(env, offset);
      return json(200, { offset, ...r });
    }
    const match = url.pathname.match(/^\/proxy\/(.+)$/);
    return handleProxy(request, env, match?.[1] ?? "");
  },

  /**
   * cron: 커서를 KV에 두고 40건씩 순환 — 하루 한 바퀴(wrangler.toml 7회 × 40 = 280 ≥ 목록 273).
   * 10/7 까지는 5분 간격 2시간(24회 ≈ KV 쓰기 984회)이라 예열만으로 하루 쓰기 한도(1,000)를 거의 다 썼다.
   * HIRA 저장분 TTL 이 7일이라 하루 한 바퀴면 만료되기 전에 늘 다시 채워진다.
   */
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const cursor = Number((await readCache(env, WARM_CURSOR_KEY)) ?? "0") || 0;
    const r = await warmBatch(env, cursor);
    await storeBestEffort(env, WARM_CURSOR_KEY, String(r.next), 30 * 24 * 60 * 60);
  },
};
