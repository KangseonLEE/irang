/**
 * data.go.kr 프록시 Worker — 허용된 두 경로만, 공유 시크릿 헤더가 맞을 때만 전달한다.
 *
 * 요청:  GET https://<worker>/proxy/<upstream path>?<params>   (serviceKey 제외)
 *        헤더 x-irang-proxy-secret: <PROXY_SECRET>
 * 응답:  upstream 상태·본문 그대로 (+ 엣지 캐시 6h — ASOS 일자료·HIRA 기관 수는 하루 단위로만 바뀐다)
 *
 * 시크릿(wrangler secret): DATA_GO_KR_API_KEY, PROXY_SECRET
 */

interface Env {
  DATA_GO_KR_API_KEY: string;
  PROXY_SECRET: string;
}

const UPSTREAM_ORIGIN = "https://apis.data.go.kr";

/** 허용 경로 — 새 data.go.kr API를 붙일 때 여기에 추가 (그 외는 404) */
const ALLOWED_PATHS = new Set([
  "1360000/AsosDalyInfoService/getWthrDataList", // 기상청 ASOS 일자료
  "B551182/hospInfoServicev2/getHospBasisList", // 심평원 의료기관 기본정보
]);

const CACHE_TTL_SECONDS = 6 * 60 * 60;

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET") return json(405, { error: "GET only" });
    if (!env.PROXY_SECRET || !env.DATA_GO_KR_API_KEY) {
      // 어떤 시크릿이 비었는지 이름만 노출 (값 없음) — 바인딩 진단용
      const missing = ["PROXY_SECRET", "DATA_GO_KR_API_KEY"].filter((k) => !(env as unknown as Record<string, unknown>)[k]);
      return json(500, { error: "worker secrets not configured", missing, bound: Object.keys(env as unknown as object) });
    }
    if (!secretMatches(request.headers.get("x-irang-proxy-secret"), env.PROXY_SECRET)) {
      return json(401, { error: "unauthorized" });
    }

    const incoming = new URL(request.url);
    const match = incoming.pathname.match(/^\/proxy\/(.+)$/);
    const upstreamPath = match?.[1] ?? "";
    if (!ALLOWED_PATHS.has(upstreamPath)) return json(404, { error: "path not allowed" });

    const upstream = new URL(`${UPSTREAM_ORIGIN}/${upstreamPath}`);
    for (const [k, v] of incoming.searchParams) {
      if (k.toLowerCase() === "servicekey") continue; // 키는 Worker 시크릿만 사용
      upstream.searchParams.append(k, v);
    }
    upstream.searchParams.set("serviceKey", env.DATA_GO_KR_API_KEY);

    // 캐시 키는 키를 뺀 URL — 시크릿이 캐시 키·로그에 남지 않게
    const cacheKeyUrl = new URL(upstream.toString());
    cacheKeyUrl.searchParams.delete("serviceKey");
    const cache = caches.default;
    const cacheKey = new Request(cacheKeyUrl.toString(), { method: "GET" });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    let res: Response;
    try {
      res = await fetch(upstream.toString(), {
        headers: { "User-Agent": BROWSER_UA, Accept: "application/json,text/plain,*/*" },
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      return json(502, { error: "upstream fetch failed", detail: err instanceof Error ? err.message : String(err) });
    }

    const body = await res.text();
    const out = new Response(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json; charset=utf-8",
        "cache-control": res.ok ? `public, max-age=${CACHE_TTL_SECONDS}` : "no-store",
        "x-irang-proxy": "data.go.kr",
      },
    });
    if (res.ok) await cache.put(cacheKey, out.clone());
    return out;
  },
};
