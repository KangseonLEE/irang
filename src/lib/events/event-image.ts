/**
 * 체험·행사 카드 이미지 해석 (2026-09-30, 행사 포스터 10/8)
 *
 * 우선순위: ① 큐레이션 행사 포스터(`EVENT_POSTERS`, 주최 측 원본) ② 수집된 마을 사진(`imageUrl`, 그린대로 원본 —
 *          반드시 next/image 최적화 경유, 원본 7MB) ③ 시·도 배경 일러스트(`public/images/regions/<id>.webp`, 17장).
 * 폴백은 "사진 없음"을 숨기는 가리개가 아니라 지역 맥락을 주는 배경이다 — `kind` 로 구분해 포스터는 잘리지 않게(contain)
 * 그리고, 외부 원본(사진·포스터)일 때만 출처를 붙인다.
 */
import { PROVINCES } from "@/lib/data/regions";
import { EVENT_POSTERS } from "@/lib/data/event-posters";
import type { FarmEvent } from "@/lib/data/events";

export interface EventImage {
  src: string;
  alt: string;
  /** photo = 마을 사진 / poster = 행사 포스터·홍보 이미지(잘리지 않게) / illustration = 시·도 배경 일러스트 */
  kind: "photo" | "poster" | "illustration";
  /** true = 외부 원본(마을 사진·포스터) / false = 시·도 배경 일러스트 폴백 */
  isPhoto: boolean;
  /** 외부 원본일 때만 출처 표기 */
  credit?: string;
  /** 포스터만 — 16:10 가운데 자르기에도 내용이 다 남는다(EVENT_POSTERS crop16x10) */
  crop16x10?: boolean;
  /** 포스터만 — 원본 가로 ÷ 세로(16:10 틀을 채울 때 그려지는 배율 계산용) */
  aspect?: number;
}

const REGION_ID_BY_NAME = new Map(PROVINCES.map((p) => [p.name, p.id]));
const DEFAULT_FALLBACK = "/images/regions/gangwon.webp";

/** 시·도 이름(SSOT) → 배경 일러스트 경로. 전국·미상은 기본값 */
export function regionFallbackImage(region: string | undefined): string {
  const id = region ? REGION_ID_BY_NAME.get(region) : undefined;
  return id ? `/images/regions/${id}.webp` : DEFAULT_FALLBACK;
}

export function getEventImage(
  event: Pick<FarmEvent, "imageUrl" | "region" | "title"> & { id?: string },
  { allowPoster = true }: { allowPoster?: boolean } = {},
): EventImage {
  const poster = allowPoster && event.id ? EVENT_POSTERS[event.id] : undefined;
  if (poster) {
    return {
      src: poster.url,
      alt: `${event.title} 홍보 이미지`,
      kind: "poster",
      isPhoto: true,
      credit: `이미지: ${poster.credit}`,
      crop16x10: poster.crop16x10 === true,
      aspect: poster.width / poster.height,
    };
  }
  if (event.imageUrl && /^https:\/\/www\.greendaero\.go\.kr\/svc\/common\/board\/img\//.test(event.imageUrl)) {
    // "OO마을 농촌에서 살아보기 (귀촌형)" → "OO마을 사진" (제목 꼬리는 카드 칩과 중복)
    const village = event.title.replace(/\s*농촌에서 살아보기.*$/, "").trim() || event.title;
    return { src: event.imageUrl, alt: `${village} 사진`, kind: "photo", isPhoto: true, credit: "사진: 그린대로" };
  }
  return { src: regionFallbackImage(event.region), alt: "", kind: "illustration", isPhoto: false };
}

/**
 * 카드 목록 아래 출처 한 줄 — 외부 원본(마을 사진·행사 포스터)이 하나라도 보일 때만 (/events·/start 체험 탭 공용).
 * 카드 안에는 출처를 싣지 않으므로 이 문장이 그 목록의 출처 표기다.
 */
export function eventImageCreditNote(events: readonly Parameters<typeof getEventImage>[0][]): string | null {
  const kinds = new Set(events.map((event) => getEventImage(event).kind));
  const parts: string[] = [];
  if (kinds.has("photo")) parts.push("마을 사진은 그린대로(농림축산식품부) 공고에서 가져왔어요.");
  if (kinds.has("poster")) parts.push("행사 포스터는 주최 측 누리집에서 가져왔어요.");
  if (parts.length === 0) return null;
  if (kinds.has("illustration")) parts.push("사진이 없는 곳은 시·도 그림으로 대신해요.");
  return parts.join(" ");
}

/**
 * 16:10 틀을 가운데 자르기(cover)로 채우는 포스터는 틀보다 넓게 그려진다 — 가로로 긴 배너(케이팜 2560×824 = 3.1:1)는
 * 틀 폭의 aspect ÷ 1.6 ≈ 1.94배. next/image `sizes` 가 틀 폭만 말하면 그만큼 작은 이미지를 받아 늘려 흐려진다
 * (10/8 랜딩 실측: 640px 를 1,044px 로 늘림). 그 배율 — 채우지 않는 이미지는 1.
 */
export function posterCoverFactor(image: EventImage, frameAspect = 16 / 10): number {
  if (image.kind !== "poster" || !image.crop16x10 || !image.aspect) return 1;
  const factor = image.aspect / frameAspect;
  return factor > 1.01 ? Math.round(factor * 100) / 100 : 1;
}

/** 괄호 밖의 구분자로만 나눈다 — calc()·min() 안의 쉼표·공백, 미디어 조건 괄호 안의 공백은 그대로 둔다 */
function splitTopLevel(text: string, isSeparator: (ch: string) => boolean): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(") depth += 1;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && isSeparator(ch)) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current);
  return parts;
}

/**
 * `sizes` 의 각 길이에 배율을 곱한다 — "(max-width: 639px) calc(100vw - 32px), 300px" → 각 항목 calc(… * f).
 * 항목의 마지막 값이 길이, 그 앞은 미디어 조건("(min-width: 640px) and (max-width: 1023px)"도 그대로)
 */
export function scaleSizes(sizes: string, factor: number): string {
  if (factor === 1) return sizes;
  return splitTopLevel(sizes, (ch) => ch === ",")
    .map((part) => {
      const tokens = splitTopLevel(part.trim(), (ch) => /\s/.test(ch)).filter(Boolean);
      const length = tokens.pop() ?? "";
      const media = tokens.join(" ");
      return `${media ? `${media} ` : ""}calc(${length} * ${factor})`;
    })
    .join(", ");
}
