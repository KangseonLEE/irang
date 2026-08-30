/**
 * data.go.kr 호출 경로 스위치 (2026-08-30, 회장 결재 B안)
 *
 * apis.data.go.kr 게이트웨이가 클라우드(AWS) 대역을 HTTP 400 "INVALID_REQUEST_PARAMETER"(code 10)로 위장
 * 차단해 Vercel(icn1·hnd1)에서 기상청·심평원 API를 직접 호출할 수 없다(8/30 실측 매트릭스: 로컬 200 /
 * 잘못된 키 403 code 30 / 진짜 파라미터 오류 200 resultCode 02 / Vercel 400 code 10).
 *
 * - `DATA_GO_KR_PROXY_URL`이 있으면 Cloudflare Worker(workers/datagokr-proxy)로 보낸다. 키는 Worker 시크릿에만
 *   있고, 공유 시크릿 헤더(`DATA_GO_KR_PROXY_SECRET`)로 프록시 남용을 막는다.
 * - 없으면(로컬 dev·CI) 기존처럼 직접 호출한다 — 한국 가정망은 차단되지 않는다.
 */

const DIRECT_ORIGIN = "https://apis.data.go.kr";

/** process.env 호환 — 테스트에서 부분 객체를 넘길 수 있게 느슨하게 */
export type EnvLike = Record<string, string | undefined>;

export interface DataGoKrRequest {
  url: string;
  headers: Record<string, string>;
}

/**
 * upstream path(예: "1360000/AsosDalyInfoService/getWthrDataList")와 파라미터로 실제 요청 URL·헤더를 만든다.
 * serviceKey는 직접 호출일 때만 붙는다. 키가 없으면 null.
 */
export function buildDataGoKrRequest(
  path: string,
  params: Record<string, string>,
  env: EnvLike = process.env,
): DataGoKrRequest | null {
  const proxy = env.DATA_GO_KR_PROXY_URL?.replace(/\/+$/, "");
  const proxySecret = env.DATA_GO_KR_PROXY_SECRET;

  if (proxy && proxySecret) {
    const url = new URL(`${proxy}/proxy/${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    return { url: url.toString(), headers: { "x-irang-proxy-secret": proxySecret } };
  }

  const apiKey = env.DATA_GO_KR_API_KEY;
  if (!apiKey) return null;
  const url = new URL(`${DIRECT_ORIGIN}/${path}`);
  url.searchParams.set("serviceKey", apiKey);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return { url: url.toString(), headers: {} };
}

/** 프록시 모드 여부 — 로그·진단용 */
export function isDataGoKrProxied(env: EnvLike = process.env): boolean {
  return Boolean(env.DATA_GO_KR_PROXY_URL && env.DATA_GO_KR_PROXY_SECRET);
}
