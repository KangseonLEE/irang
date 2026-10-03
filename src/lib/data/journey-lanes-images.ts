/**
 * 레인 → 렌더용 카드(`JourneyLaneCard`) 변환.
 *
 * 10/3: 런타임 파일 존재 판정(`existsSync(public/…)`)을 없앴다. `process.cwd()/public` 을 읽는 코드가 있으면
 * Next 파일 추적이 `/start`·`/start/[lane]` 서버 번들에 public/ 전체(160파일·20MB)를 싣는다.
 * 포스터 실존은 CI `scripts/check-cross-reference.ts` H-2 가 보장하므로, 여기서는 "경로가 있으면 그린다"만 판단한다.
 * (`outputFileTracingExcludes` 로 public/ 만 빼는 우회는 쓰지 않는다 — 서버리스의 ISR 재생성에는 파일이 없어
 *  판정이 false 로 뒤집히고 포스터가 조용히 사라진다.)
 *
 * 데이터 모듈(`journey-lanes.ts`)과 분리한 이유: 그쪽은 클라이언트 컴포넌트가 **타입**으로 참조한다.
 */

import { JOURNEY_GATES, START_LANES, type JourneyGate, type JourneyLaneCard } from "./journey-lanes";

function toCard(lane: JourneyGate): JourneyLaneCard {
  return {
    ...lane,
    image: lane.image ?? "",
    alt: lane.alt ?? "",
    hasImage: Boolean(lane.image),
    // 캐릭터 일러스트는 10/3 정리 — 카드 형태 호환 필드만 남는다(그리던 화면도 10/3 삭제)
    hasChar: false,
    charImage: "",
  };
}

const LANE_CARDS: readonly JourneyLaneCard[] = START_LANES.map(toCard);
const GATE_CARDS: readonly JourneyLaneCard[] = JOURNEY_GATES.map(toCard);

/** 목적이 있는 사람에게 보여 주는 5장 */
export function resolveJourneyLanes(): readonly JourneyLaneCard[] {
  return LANE_CARDS;
}

/** 히어로 첫 화면의 두 갈래 (보관 중인 히어로 화면 전용) */
export function resolveJourneyGates(): readonly JourneyLaneCard[] {
  return GATE_CARDS;
}
