import {
  fetchLatestNews,
  fetchNewsByCategory,
  type NewsArticle,
} from "@/lib/api/news";
import { trendNews } from "@/lib/data/landing";
import { NewsTabs, type UnifiedNewsItem } from "./news-tabs";

/**
 * 비동기 서버 컴포넌트 — 뉴스 API를 호출하고 NewsTabs에 전달.
 * Suspense 경계 안에서 사용하여 페이지 초기 렌더링을 블로킹하지 않음.
 */
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
      source: n.source,
      date: n.date,
      url: n.url,
      category,
    }));

  const unifiedNews: UnifiedNewsItem[] = [
    ...toItems(liveNews, trendNews, "news"),
    ...toItems(eduNews, [], "education"),
    ...toItems(eventNews, [], "event"),
    ...toItems(programNews, [], "program"),
  ];

  return <NewsTabs items={unifiedNews} />;
}
