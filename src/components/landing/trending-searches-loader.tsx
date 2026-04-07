import { getTrendingSearches } from "@/lib/supabase";
import { TrendingSearches } from "./trending-searches";

/**
 * 비동기 서버 컴포넌트 — Supabase에서 인기 검색어를 가져와
 * TrendingSearches에 전달. Suspense 경계 안에서 사용.
 */
export async function TrendingSearchesLoader() {
  const trendingData = await getTrendingSearches(7, 12);
  return <TrendingSearches serverTrending={trendingData} />;
}
