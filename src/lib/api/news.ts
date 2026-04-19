/**
 * 네이버 뉴스 검색 API
 * - 귀농·귀촌 관련 최신 뉴스를 매일 자동 갱신
 * - 24시간 캐시 (Next.js fetch revalidate)
 * - API 키 미설정 또는 장애 시 null 반환 → 호출측에서 폴백(정적 데이터) 처리
 *
 * 환경변수:
 *   NAVER_CLIENT_ID      — 네이버 개발자 Client ID
 *   NAVER_CLIENT_SECRET   — 네이버 개발자 Client Secret
 *
 * @see https://developers.naver.com/docs/serviceapi/search/news/news.md
 */

const API_URL = "https://openapi.naver.com/v1/search/news.json";
const NEWS_CACHE_TTL = 60 * 60;      // 1시간 — 페이지 ISR과 동일 주기
const OG_CACHE_TTL = 60 * 60 * 24;   // 24시간 — OG 이미지는 자주 안 바뀜

/** 검색 키워드 — 핵심 2어로 관련도 극대화 */
const SEARCH_QUERY = "귀농 귀촌";
const DISPLAY_COUNT = 10; // 중복 제거 후에도 충분한 기사 확보

/** 카테고리별 검색 키워드 */
const CATEGORY_QUERIES: Record<string, string> = {
  education: "귀농 교육 농업 연수",
  event: "농촌 축제 체험 박람회",
  program: "귀농 지원사업 보조금 정착",
  policy: "귀농 귀촌 정부 정책 발표",
};

// ─── 타입 ───

/** 네이버 API 원본 응답 아이템 */
interface NaverNewsItem {
  title: string;        // HTML 태그 포함 가능 (<b> 등)
  originallink: string; // 원본 기사 URL
  link: string;         // 네이버 뉴스 URL
  description: string;
  pubDate: string;      // RFC 2822 (예: "Thu, 03 Apr 2026 06:03:00 +0900")
}

interface NaverNewsResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverNewsItem[];
}

/** 앱 내부에서 사용하는 뉴스 아이템 */
export interface NewsArticle {
  title: string;
  source: string;
  date: string;   // "YYYY.MM.DD" 형식
  url: string;
  /** 기사 본문 요약 (HTML 제거 후) */
  description?: string;
  /** 네이버 뉴스 URL — OG 이미지 추출용 (네이버가 가장 안정적) */
  naverUrl?: string;
  /** OG 이미지 URL (선택) — Featured 카드 썸네일용 */
  thumbnail?: string;
  /** 정렬용 타임스탬프 (ms) */
  _ts?: number;
}

// ─── 유틸 ───

/** HTML 태그 제거 + HTML 엔티티 디코드 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

/** RFC 2822 날짜 → "YYYY.MM.DD" */
function formatDate(rfc2822: string): string {
  const d = new Date(rfc2822);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

/** RFC 2822 날짜 → 밀리초 타임스탬프 (정렬용) */
function toTimestamp(rfc2822: string): number {
  const d = new Date(rfc2822);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

/** 네이버 뉴스 link에서 언론사명 추출 시도 — 불가능하면 "뉴스" 반환 */
function extractSource(originallink: string): string {
  try {
    const host = new URL(originallink).hostname.replace("www.", "");
    const map: Record<string, string> = {
      "chosun.com": "조선일보",
      "donga.com": "동아일보",
      "hani.co.kr": "한겨레",
      "khan.co.kr": "경향신문",
      "joongang.co.kr": "중앙일보",
      "joins.com": "중앙일보",
      "mk.co.kr": "매일경제",
      "hankyung.com": "한국경제",
      "sedaily.com": "서울경제",
      "yna.co.kr": "연합뉴스",
      "yonhapnews.co.kr": "연합뉴스",
      "newsis.com": "뉴시스",
      "news1.kr": "뉴스1",
      "asiae.co.kr": "아시아경제",
      "mt.co.kr": "머니투데이",
      "edaily.co.kr": "이데일리",
      "etnews.com": "전자신문",
      "kyeonggi.com": "경기일보",
      "nongmin.com": "농민신문",
      "agrinet.co.kr": "한국농어민신문",
      "segye.com": "세계일보",
      "hankookilbo.com": "한국일보",
      "kmib.co.kr": "국민일보",
      "ohmynews.com": "오마이뉴스",
      "nocutnews.co.kr": "노컷뉴스",
      "imnews.imbc.com": "MBC",
      "news.kbs.co.kr": "KBS",
      "news.sbs.co.kr": "SBS",
    };
    // 정확 매치
    if (map[host]) return map[host];
    // 부분 매치 (서브도메인 포함)
    for (const [domain, name] of Object.entries(map)) {
      if (host.endsWith(domain)) return name;
    }
    // 호스트에서 추출 (예: news.example.com → example)
    const parts = host.split(".");
    return parts.length >= 2 ? parts[parts.length - 2] : "뉴스";
  } catch {
    return "뉴스";
  }
}

// ─── OG 이미지 추출 ───

/**
 * 기사 URL에서 Open Graph 이미지를 추출합니다.
 * - 5초 타임아웃으로 느린 사이트 대응
 * - og:image → twitter:image → <link rel="image_src"> 순으로 폴백
 * - 실패 시 undefined 반환 (페이지 렌더링 블로킹 방지)
 */
export async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      next: { revalidate: OG_CACHE_TTL },
    });
    clearTimeout(timer);

    if (!res.ok) return undefined;

    const text = await res.text();
    const head = text.slice(0, 25000);

    // 1. og:image (property="og:image" content="...") — 속성 순서 무관
    const ogPatterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ];

    for (const pattern of ogPatterns) {
      const m = head.match(pattern);
      if (m?.[1]) return resolveImageUrl(m[1].trim(), url);
    }

    // 2. twitter:image 폴백
    const twitterPatterns = [
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      /<meta[^>]+property=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    ];

    for (const pattern of twitterPatterns) {
      const m = head.match(pattern);
      if (m?.[1]) return resolveImageUrl(m[1].trim(), url);
    }

    // 3. <link rel="image_src"> 폴백
    const linkMatch = head.match(
      /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    );
    if (linkMatch?.[1]) return resolveImageUrl(linkMatch[1].trim(), url);

    return undefined;
  } catch {
    return undefined;
  }
}

/** HTML 엔티티 디코딩 (og:image URL에 &#x3D; 등이 포함되는 경우) */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/** 상대/프로토콜 상대 URL → 절대 URL 변환 + 엔티티 디코딩 */
function resolveImageUrl(imgUrl: string, pageUrl: string): string {
  const decoded = decodeHtmlEntities(imgUrl);
  if (decoded.startsWith("//")) return `https:${decoded}`;
  if (decoded.startsWith("/")) {
    const origin = new URL(pageUrl).origin;
    return `${origin}${decoded}`;
  }
  if (!decoded.startsWith("http")) {
    const base = new URL(pageUrl);
    return new URL(decoded, base).href;
  }
  return decoded;
}

// ─── 메인 ───

/**
 * 귀농 관련 최신 뉴스를 가져옵니다.
 * - 24시간 캐시 후 자동 갱신 (ISR)
 * - API 키 미설정 또는 에러 시 null 반환
 */
export async function fetchLatestNews(): Promise<NewsArticle[] | null> {
  return fetchNewsByQuery(SEARCH_QUERY);
}

/**
 * 카테고리별 뉴스를 가져옵니다.
 * - education: 귀농 교육 관련 기사
 * - event: 농촌 축제·체험 관련 기사
 * - program: 지원사업·보조금 관련 기사
 */
export async function fetchNewsByCategory(
  category: "education" | "event" | "program" | "policy"
): Promise<NewsArticle[] | null> {
  const query = CATEGORY_QUERIES[category];
  if (!query) return null;
  return fetchNewsByQuery(query);
}

/** 짧은 대기 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 네이버 뉴스 검색 공통 로직
 * - cache: 'no-store'로 설정하여 실패 결과가 Vercel Data Cache에 저장되는 것을 방지
 * - 대신 서버 컴포넌트의 ISR(revalidate)로 페이지 단위 캐시 관리
 * - 호출 간 500ms 딜레이로 Rate Limit 회피
 */
async function fetchNewsByQuery(query: string): Promise<NewsArticle[] | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  const MAX_RETRIES = 2;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) await sleep(500 * attempt);

      const params = new URLSearchParams({
        query,
        display: String(DISPLAY_COUNT),
        sort: "date",
      });

      const res = await fetch(`${API_URL}?${params}`, {
        headers: {
          "X-Naver-Client-Id": clientId,
          "X-Naver-Client-Secret": clientSecret,
        },
        // ISR(revalidate=3600)과 동일 주기로 Data Cache 갱신
        // — 실패 응답도 1시간 후 자동 만료되어 재시도
        next: { revalidate: NEWS_CACHE_TTL },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        if (attempt < MAX_RETRIES) continue;
        return null;
      }

      const data: NaverNewsResponse = await res.json();

      if (!data.items?.length) return null;

      return data.items
        .map((item) => ({
          title: stripHtml(item.title),
          description: stripHtml(item.description),
          source: extractSource(item.originallink),
          date: formatDate(item.pubDate),
          url: item.originallink || item.link,
          naverUrl: item.link || undefined,
          _ts: toTimestamp(item.pubDate),
        }))
        .sort((a, b) => b._ts - a._ts);
    } catch {
      if (attempt < MAX_RETRIES) continue;
      return null;
    }
  }
  return null;
}
