import {
  fetchLatestNews,
  fetchNewsByCategory,
  fetchOgMeta,
  type NewsArticle,
} from "@/lib/api/news";
import {
  trendNews,
  trendEduNews,
  trendEventNews,
  trendProgramNews,
  trendPolicyNews,
} from "@/lib/data/landing";
import type { UnifiedNewsItem } from "./news-tabs";
import { NewsTabsV2 } from "./news-tabs-v2";

// ─── 중복 제거: 문자 바이그램 유사도 ───

function getBigrams(title: string): Set<string> {
  const clean = title.replace(/[^가-힣a-zA-Z0-9]/g, "");
  const bigrams = new Set<string>();
  for (let i = 0; i < clean.length - 1; i++) {
    bigrams.add(clean.slice(i, i + 2));
  }
  return bigrams;
}

function titleJaccard(titleA: string, titleB: string): number {
  const a = getBigrams(titleA);
  const b = getBigrams(titleB);
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const g of a) {
    if (b.has(g)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return intersection / union;
}

function isSimilar(titleA: string, titleB: string): boolean {
  return titleJaccard(titleA, titleB) >= 0.25;
}

/** URL 정규화 — 쿼리/해시 제거 후 도메인+경로만 비교 */
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}${u.pathname}`.replace(/\/+$/, "");
  } catch {
    return url;
  }
}

/**
 * 중복 판정 — 세 가지 신호 OR
 * 1) URL normalize 동일 (확실한 같은 기사)
 * 2) 타이틀 바이그램 ≥ 0.25 (서로 다른 발행처 재게재)
 * 3) thumbnail 동일 + 타이틀 ≥ 0.10 (같은 보도자료를 다른 카테고리 search query로
 *    fetch했을 때. 5/22 진단: 같은 기사가 교육·행사 두 카테고리 검색에 매칭되는
 *    케이스 빈번. URL/타이틀이 미세하게 달라 dedup 통과 위험.)
 */
function isDuplicate(a: UnifiedNewsItem, b: UnifiedNewsItem): boolean {
  if (normalizeUrl(a.url) === normalizeUrl(b.url)) return true;
  if (isSimilar(a.title, b.title)) return true;
  if (
    a.thumbnail &&
    a.thumbnail === b.thumbnail &&
    titleJaccard(a.title, b.title) >= 0.10
  ) {
    return true;
  }
  return false;
}

// ─── 마감/종료/Stale 필터 ───
// 5/9 추가 — 교육·행사 카테고리에서 마감된 공고나 12개월+ 지난 항목 자동 숨김

/**
 * 시제 종결 동사형 패턴만 매칭 — false positive 최소화
 * 예: "마감되었다"·"수료식 개최"는 차단, "마감 임박"·"신청 가능"은 통과
 */
const CLOSED_PATTERNS: RegExp[] = [
  /마감(되|됐|했|되었)/,
  /종료(되|됐|했|되었)/,
  /수료식/,            // 수료식 = 이미 끝난 행사
  /접수\s*(완료|종료|마감)/,
  /신청\s*(완료|종료|마감)/,
  /후기|현장을\s*가다/, // 박람회 사후 보도
];

function isClosedTitle(title: string): boolean {
  return CLOSED_PATTERNS.some((p) => p.test(title));
}

/** education·event 카테고리에서 12개월+ 지난 항목은 모집 공고 마감으로 간주 */
function isStaleByDate(date: string, category: UnifiedNewsItem["category"]): boolean {
  if (category !== "education" && category !== "event") return false;
  const m = date.match(/^(\d{4})\.(\d{1,2})/);
  if (!m) return false;
  const itemMs = Date.UTC(parseInt(m[1], 10), parseInt(m[2], 10) - 1);
  const cutoffMs = Date.now() - 365 * 24 * 60 * 60 * 1000; // 12개월 전
  return itemMs < cutoffMs;
}

function shouldHide(item: UnifiedNewsItem): boolean {
  return isClosedTitle(item.title) || isStaleByDate(item.date, item.category);
}

/**
 * 썸네일 품질 점수 — 높을수록 좋은 이미지
 * URL에 저해상도 힌트(thumb, small, 120x 등)가 있으면 감점
 */
function thumbnailScore(item: UnifiedNewsItem): number {
  if (!item.thumbnail) return 0;
  const url = item.thumbnail.toLowerCase();
  // 저해상도 힌트 감점
  if (/thumb|_s\.|_small|120x|160x|80x|tinyphoto/.test(url)) return 1;
  // 네이버 뉴스 OG는 일반적으로 고해상도
  if (url.includes("phinf.pstatic.net") || url.includes("imgnews.pstatic.net")) return 3;
  return 2;
}

/**
 * 중복 그룹에서 가장 좋은 썸네일을 가진 기사를 선택
 * 썸네일 점수가 같으면 먼저 들어온 기사 유지
 */
function dedupKeepBest(items: UnifiedNewsItem[]): UnifiedNewsItem[] {
  const accepted: UnifiedNewsItem[] = [];
  for (const item of items) {
    let dupIdx = -1;
    for (let i = 0; i < accepted.length; i++) {
      if (isDuplicate(item, accepted[i])) {
        dupIdx = i;
        break;
      }
    }
    if (dupIdx === -1) {
      // 새 기사
      accepted.push(item);
    } else if (thumbnailScore(item) > thumbnailScore(accepted[dupIdx])) {
      // 중복이지만 이미지가 더 좋으면 교체
      accepted[dupIdx] = { ...accepted[dupIdx], thumbnail: item.thumbnail };
    }
  }
  return accepted;
}

/** 빌드 시점에는 sleep을 건너뛴다 — 5번 fetch 사이 6초 누적 → / 페이지
 *  60초 빌드 초과 원인. 런타임에서는 네이버 rate limit 회피용으로 유지. */
const IS_BUILD_PHASE = process.env.NEXT_PHASE === "phase-production-build";

function sleep(ms: number) {
  if (IS_BUILD_PHASE) return Promise.resolve();
  return new Promise((r) => setTimeout(r, ms));
}

// ─── OG 이미지 일괄 페칭 ───

async function fetchAllOgMeta(items: UnifiedNewsItem[]): Promise<void> {
  const CONCURRENCY = 3;
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (item) => {
        // 네이버 URL이 있으면 그쪽 OG가 더 정확(요약·고해상도) — 우선 시도
        if (item.naverUrl) {
          const meta = await fetchOgMeta(item.naverUrl);
          if (meta.image || meta.description) return meta;
        }
        return fetchOgMeta(item.url);
      }),
    );
    results.forEach((result, j) => {
      if (result.status !== "fulfilled") return;
      const meta = result.value;
      const target = items[i + j];
      // 기존 데이터가 비어있을 때만 OG로 채움 (네이버 API description 우선)
      if (meta.image && !target.thumbnail) {
        target.thumbnail = meta.image;
      }
      if (meta.description && !target.description) {
        target.description = meta.description;
      }
    });
  }
}

export async function NewsTabsV2Loader() {
  const liveNews = await fetchLatestNews();
  await sleep(1500);
  const eduNews = await fetchNewsByCategory("education");
  await sleep(1500);
  const eventNews = await fetchNewsByCategory("event");
  await sleep(1500);
  const programNews = await fetchNewsByCategory("program");
  await sleep(1500);
  const policyNews = await fetchNewsByCategory("policy");

  const toItems = (
    articles: NewsArticle[] | null,
    fallback: NewsArticle[],
    category: UnifiedNewsItem["category"],
  ): UnifiedNewsItem[] =>
    (articles ?? fallback).map((n) => ({
      title: n.title,
      description: n.description,
      source: n.source,
      date: n.date,
      url: n.url,
      naverUrl: n.naverUrl,
      thumbnail: n.thumbnail,
      category,
      _ts: n._ts ?? 0,
    }));

  const newsItems = toItems(liveNews, trendNews, "news");
  const eduItems = toItems(eduNews, trendEduNews, "education");
  const eventItems = toItems(eventNews, trendEventNews, "event");
  const programItems = toItems(programNews, trendProgramNews, "program");
  const policyItems = toItems(policyNews, trendPolicyNews, "policy");

  // 1) 모든 아이템에 OG 메타(이미지+설명) 먼저 페칭 — 네이버 API에 description 누락 시 보강
  const allRaw = [
    ...newsItems,
    ...eduItems,
    ...eventItems,
    ...programItems,
    ...policyItems,
  ];
  await fetchAllOgMeta(allRaw);

  // 2) 이미지 확보된 상태에서 중복 제거 — 더 좋은 썸네일을 가진 기사 우선
  // 3) 마감/종료/Stale 항목 제거 — 교육·행사 카테고리에서 outdated 모집 공고 차단
  const unifiedNews = dedupKeepBest(allRaw)
    .filter((item) => !shouldHide(item))
    .sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0));

  return <NewsTabsV2 items={unifiedNews} />;
}
