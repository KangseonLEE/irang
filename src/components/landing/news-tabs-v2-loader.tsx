import {
  fetchLatestNews,
  fetchNewsByCategory,
  fetchOgImage,
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

function isSimilar(titleA: string, titleB: string): boolean {
  const a = getBigrams(titleA);
  const b = getBigrams(titleB);
  if (a.size === 0 || b.size === 0) return false;

  let intersection = 0;
  for (const g of a) {
    if (b.has(g)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return intersection / union >= 0.25;
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

function isDuplicate(a: UnifiedNewsItem, b: UnifiedNewsItem): boolean {
  if (normalizeUrl(a.url) === normalizeUrl(b.url)) return true;
  return isSimilar(a.title, b.title);
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── OG 이미지 일괄 페칭 ───

async function fetchAllOgImages(items: UnifiedNewsItem[]): Promise<void> {
  const CONCURRENCY = 3;
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (item) => {
        if (item.naverUrl) {
          const og = await fetchOgImage(item.naverUrl);
          if (og) return og;
        }
        return fetchOgImage(item.url);
      }),
    );
    results.forEach((result, j) => {
      if (result.status === "fulfilled" && result.value) {
        items[i + j].thumbnail = result.value;
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

  // 1) 모든 아이템에 OG 이미지 먼저 페칭
  const allRaw = [
    ...newsItems,
    ...eduItems,
    ...eventItems,
    ...programItems,
    ...policyItems,
  ];
  await fetchAllOgImages(allRaw);

  // 2) 이미지 확보된 상태에서 중복 제거 — 더 좋은 썸네일을 가진 기사 우선
  const unifiedNews = dedupKeepBest(allRaw)
    .sort((a, b) => (b._ts ?? 0) - (a._ts ?? 0));

  return <NewsTabsV2 items={unifiedNews} />;
}
