/**
 * 히어로 여정 레인 데이터 (2026-09-29 회장 결재 — "히어로부터 시작이 나와야 한다", 1안).
 *
 * 히어로는 3단이다 (2026-09-29 S7 회장 구조):
 *   ① 게이트 — "목적이 있어요" / "아직 고르는 중" 2장 (`JOURNEY_GATES`)
 *   ② 레인 — 목적이 있는 사람에게 5장 (`START_LANES`)
 *   ③ 선택 — 고른 레인의 요약(캐릭터·소개글·데이터 타일) → 탐색하기로 `/start/<id>` 허브
 *
 * 계측: `data-track="journey_gate:<id>"` · `journey_lanes_pick:<id>` · `journey_lanes:<id>`
 * → LandingClickTracker 가 `landing_cta_click` 으로 수집(신규 이벤트 0).
 * 진단 진입(`data-assess-entry`)은 `/start` 비교 화면의 CTA 가 맡는다(라벨 `start_compare`).
 */

export interface JourneyLane {
  id: string;
  /** 카드 제목 */
  label: string;
  /** 한 줄 설명 — 카드에만 쓴다 */
  desc: string;
  /** 선택 화면 소개글 — "이 길이 무엇인지" 3문장 (카드에는 안 쓴다, 9/29 S4) */
  intro: string;
  href: string;
  /** public 기준 경로 — 파일이 없으면 딥그린 그라데이션 플레이스홀더로 대체된다 */
  image: string;
  /** 스크린리더용 일러스트 설명 */
  alt: string;
  /** 선택 패널에 쓰는 캐릭터 일러스트(흰 배경 정사각). 없으면 원형 틴트만 */
  charImage: string;
}

/** 일러스트 존재 여부까지 판정된 렌더용 형태 */
export interface JourneyLaneCard extends JourneyLane {
  hasImage: boolean;
  hasChar: boolean;
}

export const JOURNEY_LANES: readonly JourneyLane[] = [
  {
    id: "guinong",
    label: "귀농",
    desc: "농사로 먹고사는 정착을 준비해요",
    intro:
      "농사를 생업으로 삼고 농촌에 뿌리내리는 길이에요. 농지·주택·창업자금처럼 지원사업이 가장 많고, 어떤 작물로 시작하느냐가 첫 3년을 좌우해요. 가족과 함께 정착하는 분이 많아요.",
    href: "/start/guinong",
    image: "/landing/lanes/guinong.webp",
    alt: "이른 아침 과수원에서 사과를 수확하는 부부",
    charImage: "/landing/lanes/char-guinong.webp",
  },
  {
    id: "guichon",
    label: "귀촌",
    desc: "일은 그대로, 사는 곳을 시골로",
    intro:
      "일과 소득은 지금처럼 두고, 사는 곳만 시골로 옮기는 길이에요. 농사 부담 없이 통근·의료·주거 조건으로 지역을 고르면 돼요. 텃밭이나 주말농장으로 가볍게 시작하는 분이 많아요.",
    href: "/start/guichon",
    image: "/landing/lanes/guichon.webp",
    alt: "간이역 옆 돌담길을 걸어 마을로 들어서는 사람",
    charImage: "/landing/lanes/char-guichon.webp",
  },
  {
    id: "forest",
    label: "귀산촌",
    desc: "숲·임산물로 사는 산촌 정착",
    intro:
      "숲과 임산물로 사는 산촌 정착이에요. 표고·더덕·산양삼처럼 손이 덜 가는 작목이 많고, 임업 전용 지원이 따로 있어요. 조용한 환경을 찾는 분에게 맞아요.",
    href: "/start/forest",
    image: "/landing/lanes/forest.webp",
    alt: "산촌 마을 숲에서 표고목의 버섯을 따 바구니에 담는 사람",
    charImage: "/landing/lanes/char-forest.webp",
  },
  {
    id: "youth",
    label: "청년농",
    desc: "만 39세 이하 청년 지원부터 봐요",
    intro:
      "만 39세 이하만 받는 영농정착지원금·후계농 자금·농지은행 임대가 따로 있어요. 초기 자본이 적어도 시작할 수 있는 길이라, 어떤 지원부터 챙길지 순서가 중요해요.",
    href: "/start/youth",
    image: "/landing/lanes/youth.webp",
    alt: "밭 옆 트럭에 수확물을 싣고 드론을 바라보는 청년 농부",
    charImage: "/landing/lanes/char-youth.webp",
  },
  {
    id: "smartfarm",
    label: "스마트팜",
    desc: "시설·데이터 농업으로 시작",
    intro:
      "온실과 센서·데이터로 작물을 키우는 시설 농업이에요. 초기 투자금이 크지만 날씨 영향이 적고 노동 강도가 낮아요. 딸기·토마토·엽채류처럼 시설 재배가 자리 잡은 작물로 시작하는 분이 많아요.",
    href: "/start/smartfarm",
    image: "/landing/lanes/smartfarm.webp",
    alt: "센서가 달린 스마트 온실에서 태블릿으로 작물을 관리하는 모습",
    charImage: "/landing/lanes/char-smartfarm.webp",
  },
  {
    id: "undecided",
    label: "아직 고르는 중",
    desc: "다섯 가지 시작을 한눈에 비교해요",
    intro:
      "아직 어떤 시작이 맞는지 정하지 못했다면 여기서부터예요. 2분 진단으로 내 유형을 알고, 그에 맞는 지역·작물·지원사업을 이어서 볼 수 있어요. 지금 고르지 않아도 괜찮아요.",
    href: "/start",
    image: "/landing/lanes/undecided.webp",
    alt: "언덕 위에서 들판을 내려다보며 지도를 펼친 사람",
    charImage: "/landing/lanes/char-undecided.webp",
  },
] as const;

/** 게이트 카드 1 — "이미 목적지가 있다" 쪽. 포스터가 없으면 딥그린 플레이스홀더로 뜬다 */
const DECIDED_GATE: JourneyLane = {
  id: "decided",
  label: "목적이 있어요",
  desc: "귀농·귀촌·귀산촌·청년농·스마트팜 중에서 골라요",
  intro:
    "어떤 시작인지 이미 정했다면 바로 그 길만 보면 돼요. 고른 여정의 지원사업·작물·비용·사람 이야기를 한 화면에 모아 드려요.",
  href: "/start",
  image: "/landing/lanes/decided.webp",
  alt: "들판 갈림길에서 한쪽 길을 골라 걸어가는 사람",
  charImage: "/landing/lanes/char-undecided.webp",
};

/** 히어로 첫 화면의 두 갈래 — [목적이 있어요, 아직 고르는 중] */
export const JOURNEY_GATES: readonly JourneyLane[] = [
  DECIDED_GATE,
  JOURNEY_LANES[JOURNEY_LANES.length - 1],
] as const;

/** 목적이 있는 사람에게 보여 주는 5장 (게이트 카드로 쓰는 undecided 제외) */
export const START_LANES: readonly JourneyLane[] = JOURNEY_LANES.filter(
  (l) => l.id !== "undecided",
);
