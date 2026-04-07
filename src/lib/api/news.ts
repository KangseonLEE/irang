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
const CACHE_TTL = 60 * 60 * 24; // 24시간

/** 검색 키워드 — 핵심 2어로 관련도 극대화 */
const SEARCH_QUERY = "귀농 귀촌";
const DISPLAY_COUNT = 5;

/** 카테고리별 검색 키워드 */
const CATEGORY_QUERIES: Record<string, string> = {
  education: "귀농 교육 농업 연수",
  event: "농촌 축제 체험 박람회",
  program: "귀농 지원사업 보조금 정착",
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
  date: string;   // "YYYY.MM" 형식
  url: string;
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

/** RFC 2822 날짜 → "YYYY.MM" */
function formatDate(rfc2822: string): string {
  const d = new Date(rfc2822);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}.${mm}`;
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
  category: "education" | "event" | "program"
): Promise<NewsArticle[] | null> {
  const query = CATEGORY_QUERIES[category];
  if (!query) return null;
  return fetchNewsByQuery(query);
}

/** 네이버 뉴스 검색 공통 로직 */
async function fetchNewsByQuery(query: string): Promise<NewsArticle[] | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("[news] NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 미설정 → 폴백 사용");
    return null;
  }

  try {
    const params = new URLSearchParams({
      query,
      display: String(DISPLAY_COUNT),
      sort: "sim",    // 관련도순 (품질 우선, 최신 뉴스도 상위 노출)
    });

    const res = await fetch(`${API_URL}?${params}`, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      next: { revalidate: CACHE_TTL },
    });

    if (!res.ok) {
      console.error(`[news] 네이버 API 응답 에러: ${res.status}`);
      return null;
    }

    const data: NaverNewsResponse = await res.json();

    if (!data.items?.length) {
      console.warn(`[news] "${query}" 검색 결과 0건`);
      return null;
    }

    return data.items.map((item) => ({
      title: stripHtml(item.title),
      source: extractSource(item.originallink),
      date: formatDate(item.pubDate),
      url: item.originallink || item.link,
    }));
  } catch (err) {
    console.error("[news] 뉴스 fetch 실패:", err);
    return null;
  }
}
