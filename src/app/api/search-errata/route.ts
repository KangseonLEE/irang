/**
 * GET /api/search-errata?q=...
 *
 * 네이버 오타변환 API 프록시 — 한/영 키 잘못 누른 입력을 한글로 변환.
 *   예: "tkrhk" → "사과", "spdlqj" → "네이버"
 *
 * - 클라이언트(/search 페이지)에서 0건 결과일 때만 호출 권장.
 * - Vercel 인스턴스 단위 LRU 메모리 캐시(TTL 1h, max 200)로 동일 쿼리 재호출 차단.
 * - IP 기반 Rate Limit 분당 30건 — 봇 폭주 방지.
 * - 환경변수(NAVER_CLIENT_ID/SECRET) 없으면 빈 응답 반환 (앱 동작 영향 없음).
 *
 * 응답: { errata: string } — 오타 없거나 변환 실패 시 빈 문자열.
 */

import { NextRequest, NextResponse } from "next/server";

const NAVER_ENDPOINT = "https://openapi.naver.com/v1/search/errata.json";
const FETCH_TIMEOUT_MS = 10_000;

// ── 응답 캐시 (LRU-ish) ──

const CACHE_TTL_MS = 60 * 60 * 1000; // 1시간
const CACHE_MAX_ENTRIES = 200;
const cache = new Map<string, { value: string; expiry: number }>();

function getCached(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  // LRU touch — 최근 사용으로 이동
  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function setCached(key: string, value: string): void {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { value, expiry: Date.now() + CACHE_TTL_MS });
}

// ── Rate Limiter (인메모리, Serverless 인스턴스 단위) ──

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimit) {
    if (now > val.resetAt) rateLimit.delete(key);
  }
}, 60_000);

// ── 핸들러 ──

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  // 입력 길이 가드 — 너무 짧거나 길면 호출 의미 없음
  if (q.length < 2 || q.length > 50) {
    return NextResponse.json({ errata: "" });
  }

  // 캐시 적중
  const cached = getCached(q);
  if (cached !== null) {
    return NextResponse.json({ errata: cached, cached: true });
  }

  // Rate Limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ errata: "" }, { status: 429 });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json({ errata: "" });
  }

  try {
    const naverUrl = `${NAVER_ENDPOINT}?query=${encodeURIComponent(q)}`;
    const res = await fetch(naverUrl, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok) {
      // 429/500 등 일시 오류는 캐시하지 않음 (다음 호출 재시도)
      return NextResponse.json({ errata: "" });
    }

    const json = (await res.json()) as
      | { errata?: string }
      | { result?: { item?: { errata?: string } } };

    // 네이버 응답 형식 둘 다 대응
    const errata =
      (json as { errata?: string }).errata ??
      (json as { result?: { item?: { errata?: string } } }).result?.item
        ?.errata ??
      "";

    setCached(q, errata);
    return NextResponse.json({ errata });
  } catch {
    // 타임아웃/네트워크 오류 — 빈 응답
    return NextResponse.json({ errata: "" });
  }
}
