/**
 * data.go.kr 프록시 Worker — 허용된 두 경로만, 공유 시크릿 헤더가 맞을 때만 전달한다.
 *
 * 요청:  GET https://<worker>/proxy/<upstream path>?<params>   (serviceKey 제외)
 *        헤더 x-irang-proxy-secret: <PROXY_SECRET>
 * 응답:  upstream 상태·본문 그대로. 성공 응답은 KV(전역, 경로별 TTL) + 엣지 캐시.
 * 예열:  GET /warm?offset=N (같은 시크릿) 또는 cron — hira-warm-list.json을 40건씩 순환해 KV를 채운다.
 *        HIRA는 콜드 7~13초라 사용자 요청 전에 채워 두는 것이 이 Worker의 두 번째 목적(8/30).
 *
 * 시크릿(wrangler secret): DATA_GO_KR_API_KEY, PROXY_SECRET / KV: DATAGOKR_CACHE
 */

import WARM_LIST from "./hira-warm-list.json";

interface Env {
  DATA_GO_KR_API_KEY: string;
  PROXY_SECRET: string;
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

/** 한 조회를 upstream에서 받아 KV에 저장. 성공 본문 또는 null */
async function fetchAndStore(env: Env, path: string, params: URLSearchParams): Promise<{ status: number; body: string; ok: boolean }> {
  const res = await fetchUpstream(env, path, params);
  const body = await res.text();
  if (res.ok) {
    await env.DATAGOKR_CACHE.put(cacheKeyFor(path, params), body, { expirationTtl: PATH_TTL[path] });
  }
  return { status: res.status, body, ok: res.ok };
}

async function handleProxy(request: Request, env: Env, upstreamPath: string): Promise<Response> {
  if (!(upstreamPath in PATH_TTL)) return json(404, { error: "path not allowed" });
  const params = new URL(request.url).searchParams;
  const key = cacheKeyFor(upstreamPath, params);

  const hit = await env.DATAGOKR_CACHE.get(key, "text");
  if (hit !== null) {
    return new Response(hit, {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8", "cache-control": `public, max-age=${PATH_TTL[upstreamPath]}`, "x-irang-proxy": "kv-hit" },
    });
  }

  let result: { status: number; body: string; ok: boolean };
  try {
    result = await fetchAndStore(env, upstreamPath, params);
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
    if (!secretMatches(request.headers.get("x-irang-proxy-secret"), env.PROXY_SECRET)) {
      return json(401, { error: "unauthorized" });
    }

    const url = new URL(request.url);
    if (url.pathname === "/warm") {
      const offset = Number(url.searchParams.get("offset") ?? "0") || 0;
      const r = await warmBatch(env, offset);
      return json(200, { offset, ...r });
    }
    const match = url.pathname.match(/^\/proxy\/(.+)$/);
    return handleProxy(request, env, match?.[1] ?? "");
  },

  /** cron: 커서를 KV에 두고 40건씩 순환 — 5분 간격 트리거로 한 시간 안에 전체 예열 */
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const cursor = Number((await env.DATAGOKR_CACHE.get(WARM_CURSOR_KEY, "text")) ?? "0") || 0;
    const r = await warmBatch(env, cursor);
    await env.DATAGOKR_CACHE.put(WARM_CURSOR_KEY, String(r.next));
  },
};
