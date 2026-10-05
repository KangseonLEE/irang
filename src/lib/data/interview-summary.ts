/**
 * 인터뷰 요약 — 카드 한 장에 필요한 값만 추린 직렬화 가능한 객체 (SSOT).
 *
 * 2026-10-05 회장 결재 B안: 랜딩의 인터뷰 다크 띠(캐러셀 6장)를 한 줄 진입점으로 줄이고,
 * 인터뷰를 맥락이 맞는 화면(작물·시·도·시·군·구 상세)에 붙인다. 근거는 GA4 28일 —
 * 랜딩 인터뷰 섹션 도달 12명·클릭 0명. 이야기는 "이 작물·이 지역에 정착한 사람"일 때 읽힌다.
 *
 * 이 모듈이 맡는 것:
 *  1. 요약 조립 {@link toInterviewSummary} — `/start/<lane>` 허브(journey-lanes-hub)와 상세 페이지가 같이 쓴다.
 *     본문 게재 동의자(hasFullStory)만 `/interviews/{id}` 상세로, 나머지는 원문 기사로 직결한다
 *     (5/9 인터뷰 동의 정책). 이 규칙이 두 곳에 있으면 한쪽만 고쳐져 미동의자 본문 링크가 새어 나간다.
 *  2. 맥락별 선택 {@link getContextInterviews} — 작물 id(`cropLinks`)·시·도 id·(시·도, 시·군·구) id(`regionUrl`).
 *  3. 랜딩 한 줄 진입점 {@link getInterviewTeaser} — 전체 인원 + 최근 인물 얼굴.
 *
 * UI 무관(lib 레이어) — components 를 import 하지 않는다.
 */

import { interviews, hasFullStory, sortInterviews, type InterviewCard } from "./landing";
import { getInterviewImageSrc } from "../interview-image";

export interface InterviewSummary {
  id: string;
  name: string;
  /** "28세"·"30대"·"31·30세". 기사에 나이가 없으면("(미상)") null — 화면에 "(미상)"을 찍지 않는다 */
  age: string | null;
  prevJob: string;
  currentJob: string;
  region: string;
  crop: string;
  /** 카드 한 줄 — 본인 발언 인용 */
  quote: string;
  /** 출처 언론사·게재 시점 — 원문 기사 기준 */
  sourceName: string;
  sourceDate: string;
  /** 본문 동의자는 상세 페이지, 미동의자는 원문 기사 */
  href: string;
  external: boolean;
  /** 일러스트 경로. 없으면 null → 호출자가 FarmerAvatar 로 폴백 */
  image: string | null;
}

export function toInterviewSummary(p: InterviewCard): InterviewSummary {
  const internal = hasFullStory(p);
  return {
    id: p.id,
    name: p.name,
    age: /미상/.test(p.age) ? null : p.age,
    prevJob: p.prevJob,
    currentJob: p.currentJob,
    region: p.region,
    crop: p.crop,
    quote: p.quote,
    sourceName: p.sourceName,
    sourceDate: p.sourceDate,
    href: internal ? `/interviews/${p.id}` : p.sourceUrl,
    external: !internal,
    image: getInterviewImageSrc(p.id),
  };
}

/* ── 맥락별 선택 ── */

/** 상세 페이지 한 섹션에 담는 최대 카드 수 — 넘치면 "모두 보기"로 목록(/interviews)에 보낸다 */
export const CONTEXT_INTERVIEW_LIMIT = 3;

export type InterviewContext =
  | { kind: "crop"; cropId: string }
  | { kind: "sido"; sidoId: string }
  | { kind: "sigungu"; sidoId: string; sigunguId: string };

export interface ContextInterviews {
  /** 카드로 보여 줄 사람 — 최근 기사 순, 최대 limit 명 */
  items: InterviewSummary[];
  /** 이 맥락에 연결된 전체 인원 (items 보다 많으면 "모두 보기") */
  total: number;
}

/** "/crops/strawberry" → "strawberry" */
function cropIdOf(href: string): string | null {
  const m = /^\/crops\/([^/?#]+)\/?$/.exec(href);
  return m ? m[1] : null;
}

/** "/regions/jeonnam/suncheon" → { sidoId: "jeonnam", sigunguId: "suncheon" } */
function regionIdsOf(url: string): { sidoId: string; sigunguId: string | null } | null {
  const m = /^\/regions\/([^/?#]+)(?:\/([^/?#]+))?\/?$/.exec(url);
  return m ? { sidoId: m[1], sigunguId: m[2] ?? null } : null;
}

function inContext(p: InterviewCard, ctx: InterviewContext): boolean {
  if (ctx.kind === "crop") return p.cropLinks.some((c) => cropIdOf(c.href) === ctx.cropId);
  const r = regionIdsOf(p.regionUrl);
  if (!r || r.sidoId !== ctx.sidoId) return false;
  // 시·도 상세 = 그 시·도 전체 / 시·군·구 상세 = 정확히 그 시·군·구만
  return ctx.kind === "sido" || r.sigunguId === ctx.sigunguId;
}

/**
 * 작물·지역 상세에 붙일 "정착한 사람". 최근 기사 순(`sortInterviews` recent 와 같은 규칙).
 * 0명이면 items 가 비고, 호출자는 섹션을 그리지 않는다.
 */
export function getContextInterviews(
  ctx: InterviewContext,
  limit: number = CONTEXT_INTERVIEW_LIMIT,
): ContextInterviews {
  const matched = sortInterviews(
    interviews.filter((p) => inContext(p, ctx)),
    "recent",
  );
  return { items: matched.slice(0, limit).map(toInterviewSummary), total: matched.length };
}

/* ── 랜딩 한 줄 진입점 ── */

export interface InterviewTeaser {
  /** 전체 인터뷰 수 — "먼저 떠난 {total}명의 이야기" (하드코딩 금지, 배열 길이) */
  total: number;
  /** 일러스트가 있는 최근 인물 — 겹친 원형 얼굴 */
  faces: { id: string; image: string }[];
}

export function getInterviewTeaser(faceCount = 3): InterviewTeaser {
  const faces: InterviewTeaser["faces"] = [];
  for (const p of sortInterviews(interviews, "recent")) {
    if (faces.length >= faceCount) break;
    const image = getInterviewImageSrc(p.id);
    if (image) faces.push({ id: p.id, image });
  }
  return { total: interviews.length, faces };
}
