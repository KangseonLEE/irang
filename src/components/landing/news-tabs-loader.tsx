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
  const [liveNews, eduNews, eventNews, programNews] = await Promise.all([
    fetchLatestNews(),
    fetchNewsByCategory("education"),
    fetchNewsByCategory("event"),
    fetchNewsByCategory("program"),
  ]);

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

  // ── OG 이미지: 모든 기사에 썸네일 추출 (병렬) ──
  console.log(`[og] 총 ${unifiedNews.length}개 기사에서 OG 이미지 추출 시작`);

  const ogResults = await Promise.allSettled(
    unifiedNews.map(async (item) => {
      // 1차: 네이버 뉴스 URL (항상 og:image 존재, 가장 안정적)
      if (item.naverUrl) {
        const og = await fetchOgImage(item.naverUrl);
        if (og) return og;
      }
      // 2차: 원본 URL 폴백
      return fetchOgImage(item.url);
    }),
  );

  let ogCount = 0;
  ogResults.forEach((result, i) => {
    if (result.status === "fulfilled" && result.value) {
      unifiedNews[i].thumbnail = result.value;
      ogCount++;
    }
  });
  console.log(`[og] OG 이미지 추출 완료: ${ogCount}/${unifiedNews.length}개 성공`);

  return <NewsTabs items={unifiedNews} />;
}
