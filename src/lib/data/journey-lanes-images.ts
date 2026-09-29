/**
 * 레인 일러스트 존재 판정 (서버 전용 — `node:fs`).
 *
 * `public/landing/lanes/*.webp` 가 아직 없어도 빌드·렌더가 깨지지 않아야 한다(회장이 codex 로 순차 생성).
 * 없으면 카드는 딥그린 그라데이션만 깔고, 파일이 들어오면 다음 렌더부터 자동 노출된다.
 * 데이터 모듈(`journey-lanes.ts`)과 분리한 이유: 그쪽은 클라이언트 컴포넌트가 **타입**으로 참조한다.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { JOURNEY_LANES, type JourneyLaneCard } from "./journey-lanes";

/** 파일 존재 판정은 프로세스당 1회 — ISR 재생성마다 stat 하지 않는다 */
let cached: readonly JourneyLaneCard[] | null = null;

export function resolveJourneyLanes(): readonly JourneyLaneCard[] {
  if (cached) return cached;
  const pub = (p: string) => existsSync(join(process.cwd(), "public", p));
  cached = JOURNEY_LANES.map((lane) => ({
    ...lane,
    hasImage: pub(lane.image),
    hasChar: pub(lane.charImage),
  }));
  return cached;
}
