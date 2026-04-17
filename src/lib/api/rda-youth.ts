/**
 * RDA 청년농 사례 데이터 — 작물 매칭 + 로드맵 연동
 *
 * - fetchYouthCases() → 작물명 fuzzy matching → 크롭 페이지용
 * - fetchYouthCasesForRoadmap() → 로드맵 페이지용 (전체 사례)
 * - API 실패 시 빈 배열 반환 (폴백)
 */

import { CROPS } from "@/lib/data/crops";
import {
  fetchYouthCases,
  stripHtml,
  mapAreaName,
  type RdaYouthItem,
} from "@/lib/api/rda";

// ─── 작물 매칭 ───

/** 내부 크롭 ID + 매칭용 키워드 */
interface CropMatcher {
  id: string;
  name: string;
  keywords: string[];
}

/** 매칭 키워드 맵 — bbsInfo04 텍스트에서 이 키워드를 탐색 */
const EXTRA_KEYWORDS: Record<string, string[]> = {
  rice: ["벼", "쌀", "미곡"],
  strawberry: ["딸기"],
  apple: ["사과"],
  grape: ["포도", "샤인머스캣", "캠벨"],
  citrus: ["감귤", "한라봉", "천혜향", "레드향", "만감"],
  "chili-pepper": ["고추", "청양고추", "풋고추"],
  lettuce: ["상추", "잎채소", "엽채소"],
  "napa-cabbage": ["배추", "김장"],
  garlic: ["마늘"],
  onion: ["양파"],
  tomato: ["토마토", "방울토마토"],
  corn: ["옥수수"],
  soybean: ["콩", "대두"],
  "sweet-potato": ["고구마"],
  potato: ["감자"],
  ginseng: ["인삼", "산양삼"],
  sesame: ["참깨", "들깨"],
  pear: ["배"],
  mango: ["망고", "애플망고"],
  arugula: ["루꼴라", "로켓"],
  mushroom: ["표고버섯", "느타리", "새송이", "버섯"],
  blueberry: ["블루베리"],
  peach: ["복숭아", "천도복숭아"],
  watermelon: ["수박"],
  melon: ["멜론", "참외"],
  paprika: ["파프리카"],
  cucumber: ["오이"],
  zucchini: ["애호박", "호박"],
};

/** 매칭 테이블 초기화 */
const CROP_MATCHERS: CropMatcher[] = CROPS.map((crop) => ({
  id: crop.id,
  name: crop.name,
  keywords: [
    crop.name,
    ...(EXTRA_KEYWORDS[crop.id] ?? []),
  ],
}));

/**
 * RDA bbsInfo04 텍스트에서 작물 ID를 매칭
 * "딸기 체험농장" → "strawberry", "멜론, 딸기" → ["melon", "strawberry"]
 */
export function matchCropIds(cropText: string): string[] {
  if (!cropText) return [];
  const normalized = cropText.toLowerCase().trim();
  const matched: string[] = [];

  for (const matcher of CROP_MATCHERS) {
    for (const keyword of matcher.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        matched.push(matcher.id);
        break;
      }
    }
  }

  return matched;
}

// ─── 정제된 청년 사례 타입 ───

export interface YouthCaseCard {
  /** RDA 게시글 번호 */
  id: number;
  /** 농가명(이름) */
  farmerName: string;
  /** 제목 */
  title: string;
  /** 본문 요약 (HTML 제거, 200자 이내) */
  summary: string;
  /** 품목명 (원본) */
  cropName: string;
  /** 지역 (정식명) */
  region: string;
  /** 시군구 */
  subRegion: string;
  /** 외부 URL (RDA 또는 출처) */
  sourceUrl: string;
  /** 출처명 */
  sourceName: string;
  /** YouTube 비디오 ID (있을 때만) */
  youtubeId: string | null;
}

// ─── 비정상 항목 필터 ───

/** 개인 농가가 아닌 기관/채널/홍보 영상 — 이름 기준 */
const BLOCKED_NAMES = new Set([
  "대표영상",
  "4-H",
  "대한민국 청년",
  "익명",
]);

/** 작물이 아닌 품목명 */
const BLOCKED_CROPS = new Set([
  "대표영상",
  "민생토론회",
  "체육활동",
  "품목",
]);

/** 개인 농가 사례로 볼 수 없는 항목을 걸러냄 */
function isValidYouthCase(item: RdaYouthItem): boolean {
  const name = (item.bbsInfo03 || "").trim();
  const crop = (item.bbsInfo04 || "").trim();
  // 이름이 없거나 차단 목록
  if (!name || BLOCKED_NAMES.has(name)) return false;
  // 품목이 없거나 차단 목록
  if (!crop || BLOCKED_CROPS.has(crop)) return false;
  // YouTube URL이 없는 경우 제외
  if (!item.bbsInfo08) return false;
  return true;
}

/**
 * YouTube embed URL → video ID 추출
 * "https://www.youtube.com/embed/tYRisweu0tA?si=..." → "tYRisweu0tA"
 */
function extractYoutubeId(url: string): string | null {
  // embed URL: /embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];
  // watch URL: ?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];
  // short URL: youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

/** RDA 원본 → 정제된 카드 데이터로 변환 */
function toYouthCaseCard(item: RdaYouthItem): YouthCaseCard {
  const rawContent = item.contents ?? "";
  const plainText = stripHtml(rawContent);
  const summary = plainText.length > 200
    ? plainText.slice(0, 197) + "..."
    : plainText;

  const rawUrl = item.bbsInfo08 || "";
  const youtubeId = extractYoutubeId(rawUrl);
  // embed URL → 시청 가능한 watch URL로 변환
  const sourceUrl = youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : rawUrl || "https://www.rda.go.kr/young/main/sub01/youthList.do";

  return {
    id: item.bbsSeq,
    farmerName: stripHtml(item.bbsInfo03 || "익명"),
    title: stripHtml(item.title),
    summary,
    cropName: item.bbsInfo04 || "",
    region: mapAreaName(item.area1Nm),
    subRegion: item.area2Nm || "",
    sourceUrl,
    sourceName: item.bbsInfo07 || "농촌진흥청",
    youtubeId,
  };
}

// ─── YouTube 유효성 검증 ───

/**
 * YouTube 썸네일 HEAD 요청으로 영상 존재 여부 확인
 * - 200 → 유효, 404 → 삭제/비공개
 * - 타임아웃 3초, 실패 시 유효로 간주 (false negative 방지)
 */
async function isYoutubeVideoAlive(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      { method: "HEAD", signal: AbortSignal.timeout(3000) },
    );
    return res.ok; // 200 → true, 404 → false
  } catch {
    return true; // 네트워크 오류 시 일단 유효 처리
  }
}

/** 카드 배열에서 삭제된 YouTube 영상을 걸러냄 */
async function filterAliveVideos(cards: YouthCaseCard[]): Promise<YouthCaseCard[]> {
  const checks = await Promise.all(
    cards.map(async (card) => {
      if (!card.youtubeId) return true; // YouTube 아닌 경우 통과
      return isYoutubeVideoAlive(card.youtubeId);
    }),
  );
  return cards.filter((_, i) => checks[i]);
}

// ─── 작물 페이지용 ───

/**
 * 특정 작물과 매칭되는 청년농 사례를 가져옴
 * sCode=02(소개) + sCode=04(극복사례) 두 카테고리에서 검색
 * 삭제된 YouTube 영상은 자동 제외
 */
export async function fetchYouthCasesForCrop(
  cropId: string,
  maxItems = 6,
): Promise<YouthCaseCard[]> {
  // sCode=02 (소개, 가장 풍부) + sCode=04 (극복사례) 병렬 호출
  const [cases02, cases04] = await Promise.all([
    fetchYouthCases({ sCode: "02", pageSize: 50 }).catch(() => null),
    fetchYouthCases({ sCode: "04", pageSize: 50 }).catch(() => null),
  ]);

  const allCases: RdaYouthItem[] = [
    ...(cases02 ?? []),
    ...(cases04 ?? []),
  ].filter(isValidYouthCase);

  // 작물 매칭
  const matched = allCases.filter((item) => {
    const ids = matchCropIds(item.bbsInfo04);
    return ids.includes(cropId);
  });

  // 중복 제거 (bbsSeq 기준) — 여유분 포함하여 maxItems * 2
  const seen = new Set<number>();
  const unique: RdaYouthItem[] = [];
  for (const item of matched) {
    if (!seen.has(item.bbsSeq)) {
      seen.add(item.bbsSeq);
      unique.push(item);
    }
    if (unique.length >= maxItems * 2) break;
  }

  const cards = unique.map(toYouthCaseCard);
  const alive = await filterAliveVideos(cards);
  return alive.slice(0, maxItems);
}

// ─── 로드맵 페이지용 ───

/**
 * 청년농 사례 전체 조회 (로드맵 청년창업농 섹션용)
 * sCode=02 (소개) 위주, 삭제된 영상 자동 제외
 */
export async function fetchYouthCasesForRoadmap(
  maxItems = 9,
): Promise<YouthCaseCard[]> {
  const cases = await fetchYouthCases({ sCode: "02", pageSize: 30 }).catch(() => null);
  if (!cases || cases.length === 0) return [];

  const cards = cases.filter(isValidYouthCase).slice(0, maxItems * 2).map(toYouthCaseCard);
  const alive = await filterAliveVideos(cards);
  return alive.slice(0, maxItems);
}
