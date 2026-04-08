import {
  fetchLatestNews,
  fetchNewsByCategory,
  fetchOgImage,
  type NewsArticle,
} from "@/lib/api/news";
import { trendNews } from "@/lib/data/landing";
import { NewsTabs, type UnifiedNewsItem } from "./news-tabs";

// ─── 중복 제거: 문자 바이그램 유사도 ───

/**
 * 문자열에서 연속 2글자(바이그램)를 추출합니다.
 * 한글 형태소 분석 없이도 유사 제목을 정확히 판별.
 */
function getBigrams(title: string): Set<string> {
  const clean = title.replace(/[^가-힣a-zA-Z0-9]/g, "");
  const bigrams = new Set<string>();
  for (let i = 0; i < clean.length - 1; i++) {
    bigrams.add(clean.slice(i, i + 2));
  }
  return bigrams;
}

/**
 * 두 제목의 바이그램 유사도(자카드 계수)를 계산합니다.
 * 0.35 이상이면 동일 이벤트로 판단.
 */
function isSimilar(titleA: string, titleB: string): boolean {
  const a = getBigrams(titleA);
  const b = getBigrams(titleB);
  if (a.size === 0 || b.size === 0) return false;

  let intersection = 0;
  for (const g of a) {
    if (b.has(g)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return intersection / union >= 0.35;
}

/**
 * 카테고리 내부에서만 중복 제거합니다.
 * - 전체 탭과 개별 탭 사이의 중복은 허용 (사용자 요구)
 * - 같은 탭 내에서만 유사 기사를 필터링
 */
function dedupWithin(items: UnifiedNewsItem[]): UnifiedNewsItem[] {
  const accepted: UnifiedNewsItem[] = [];
  return items.filter((item) => {
    for (const existing of accepted) {
      if (isSimilar(item.title, existing.title)) return false;
    }
    accepted.push(item);
    return true;
  });
}

// ─── 메인 ───

export async function NewsTabsLoader() {
  // 순차 호출 — 네이버 API 초당 호출 제한(Rate Limit) 회피
  // Promise.all 병렬 호출 시 Vercel 빌드 환경에서 일부 요청이 거부됨
  const liveNews = await fetchLatestNews();
  const eduNews = await fetchNewsByCategory("education");
  const eventNews = await fetchNewsByCategory("event");
  const programNews = await fetchNewsByCategory("program");

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
    }));

  console.log(
    `[news-tabs] API 결과: news=${liveNews?.length ?? "null"}, edu=${eduNews?.length ?? "null"}, event=${eventNews?.length ?? "null"}, program=${programNews?.length ?? "null"}`,
  );

  // 각 카테고리 독립적으로 중복 제거
  const newsItems = dedupWithin(toItems(liveNews, trendNews, "news"));
  const eduItems = dedupWithin(toItems(eduNews, [], "education"));
  const eventItems = dedupWithin(toItems(eventNews, [], "event"));
  const programItems = dedupWithin(toItems(programNews, [], "program"));

  const unifiedNews: UnifiedNewsItem[] = [
    ...newsItems,
    ...eduItems,
    ...eventItems,
    ...programItems,
  ];

  // ── OG 이미지: 동시 3개씩 병렬 추출 (너무 많으면 타임아웃) ──
  console.log(`[og] 총 ${unifiedNews.length}개 기사에서 OG 이미지 추출 시작`);

  const CONCURRENCY = 3;
  let ogCount = 0;

  for (let i = 0; i < unifiedNews.length; i += CONCURRENCY) {
    const batch = unifiedNews.slice(i, i + CONCURRENCY);
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
        unifiedNews[i + j].thumbnail = result.value;
        ogCount++;
      }
    });
  }

  console.log(`[og] OG 이미지 추출 완료: ${ogCount}/${unifiedNews.length}개 성공`);

  return <NewsTabs items={unifiedNews} />;
}
