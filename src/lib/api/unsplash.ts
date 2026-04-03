/**
 * Unsplash API 유틸리티
 * - 지역/작물 대표 이미지 검색
 * - 서버 컴포넌트에서만 호출 (API Key 보호)
 * - 7일 캐시로 Demo 제한(50 req/hr) 대응
 * - API 실패 시 null 반환 (graceful degradation)
 */

const UNSPLASH_API = "https://api.unsplash.com/search/photos";

export interface UnsplashPhoto {
  id: string;
  url: string; // regular (1080w)
  thumbUrl: string; // thumb (200w)
  smallUrl: string; // small (400w)
  alt: string;
  photographer: string;
  photographerUrl: string;
  blurHash: string | null;
}

/**
 * Unsplash에서 이미지 검색 (1건만 반환)
 * @param query  검색어 (영문 권장 — "Jeju Korea", "rice paddy" 등)
 * @param orientation "landscape" | "portrait" | "squarish"
 */
export async function fetchUnsplashPhoto(
  query: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn("UNSPLASH_ACCESS_KEY is not set — skipping image fetch");
    return null;
  }

  const url = new URL(UNSPLASH_API);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("content_filter", "high"); // safe content only

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 604800 }, // 7일 캐시
    });

    if (!res.ok) {
      throw new Error(`Unsplash HTTP ${res.status}`);
    }

    const json = await res.json();
    const photo = json.results?.[0];
    if (!photo) return null;

    return {
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      smallUrl: photo.urls.small,
      alt: photo.alt_description || query,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      blurHash: photo.blur_hash || null,
    };
  } catch (error) {
    console.error(`Unsplash search failed for "${query}":`, error);
    return null;
  }
}

/**
 * 여러 검색어에 대해 이미지를 병렬로 가져온다.
 * 키 → 검색어 매핑을 받아, 키 → 이미지 결과 Map을 반환한다.
 */
export async function fetchUnsplashPhotos(
  queries: Record<string, string>,
  orientation: "landscape" | "portrait" | "squarish" = "landscape"
): Promise<Map<string, UnsplashPhoto>> {
  const entries = Object.entries(queries);
  const results = await Promise.allSettled(
    entries.map(([, q]) => fetchUnsplashPhoto(q, orientation))
  );

  const map = new Map<string, UnsplashPhoto>();
  for (let i = 0; i < entries.length; i++) {
    const result = results[i];
    if (result.status === "fulfilled" && result.value) {
      map.set(entries[i][0], result.value);
    }
  }
  return map;
}

// ── 지역별 Unsplash 검색 키워드 (영문) ──
// 한국 지명은 영문이 Unsplash에서 검색 품질이 높음
const REGION_SEARCH_QUERIES: Record<string, string> = {
  // 수도권
  "108": "Seoul South Korea cityscape",
  "119": "Suwon Hwaseong Fortress Korea",
  // 강원도
  "101": "Chuncheon Nami Island Korea",
  "211": "Inje Seorak mountain Korea nature",
  "217": "Jeongseon Korea mountain village",
  // 충청도
  "131": "Cheongju Korea countryside",
  "133": "Daejeon Korea city",
  "238": "Geumsan Korea ginseng field",
  // 전라도
  "146": "Jeonju Hanok Village Korea",
  "156": "Gwangju Korea city",
  "262": "South Korea tea plantation",
  "259": "South Korea tea plantation",
  // 경상도
  "143": "Daegu Korea city",
  "192": "Jinju lantern festival Korea",
  "289": "South Korea countryside village",
  "271": "Gyeongju Korea temple",
  "272": "Gyeongju Korea temple",
  // 제주
  "184": "Jeju Island Korea landscape",
  "189": "Seogwipo Jeju Korea coast",
};

/**
 * 관측소 ID 목록에 대한 지역 이미지를 병렬로 가져온다.
 */
export async function fetchRegionPhotos(
  stationIds: string[]
): Promise<Map<string, UnsplashPhoto>> {
  const queries: Record<string, string> = {};
  for (const id of stationIds) {
    const q = REGION_SEARCH_QUERIES[id];
    if (q) queries[id] = q;
  }
  return fetchUnsplashPhotos(queries, "landscape");
}
