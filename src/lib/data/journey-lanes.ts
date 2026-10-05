/**
 * 정착 유형(여정 레인) 데이터 — `/start` 비교·`/start/<id>` 허브·랜딩 히어로 유형 카드의 SSOT.
 *
 * 히어로는 3단이었다 (2026-09-29 S7 회장 구조, 10/1 히어로 A안 전환 후 보관):
 *   ① 게이트 — "목적이 있어요" / "아직 고르는 중" 2장 (`JOURNEY_GATES`)
 *   ② 레인 — 목적이 있는 사람에게 5장 (`START_LANES`)
 *   ③ 선택 — 고른 레인의 요약(소개글·데이터 타일) → 탐색하기로 `/start/<id>` 허브
 *
 * 계측: `data-track="journey_gate:<id>"` · `journey_lanes_pick:<id>` · `journey_lanes:<id>`
 * → LandingClickTracker 가 `landing_cta_click` 으로 수집(신규 이벤트 0).
 * 진단 진입(`data-assess-entry`)은 `/start` 비교 화면의 CTA 가 맡는다(라벨 `start_compare`).
 *
 * 이미지: 포스터는 **목적 레인 5장(`START_LANES`)에만** 있다 — `/start` 비교 썸네일·`/start/<id>` 허브 띠가 그린다.
 * 타입(`PurposeLane.image` 필수)이 그 두 화면의 포스터를 보장하고, 파일 실존은 CI `check-cross-reference` H-2 가 막는다
 * (런타임 fs 판정은 서버 번들이 public/ 전체를 추적하던 원인이라 10/3 제거). 예비 귀농·귀촌인(undecided)·게이트 카드는
 * 포스터를 그리는 화면이 없어(보관 히어로 10/3 삭제) 이미지 필드 자체가 없다 — 10/3 undecided.webp(242KB)·
 * 렌더 카드 변환(`journey-lanes-images.ts`)·캐릭터 일러스트 호환 필드 정리.
 */

/** 정착 유형 공통 — 히어로 유형 카드·검색 도크·비교 표·허브가 읽는 글 */
export interface JourneyLane {
  id: string;
  /** 카드 제목 */
  label: string;
  /** 한 줄 설명 — 카드에만 쓴다. 10/2 회장: 카드에서 한 줄로만 — 1280+ 그리드 카드(글 폭 ≈170px)에 맞게 12자 안팎 */
  desc: string;
  /** 선택 화면 소개글 — "이 길이 무엇인지" 3문장 (카드에는 안 쓴다, 9/29 S4) */
  intro: string;
  href: string;
}

/** 목적 레인 — 포스터를 그리는 화면(`/start`·`/start/<id>`)이 쓰므로 포스터가 반드시 있다 */
interface PurposeLane extends JourneyLane {
  /** 포스터(public 기준 경로) — 실존은 CI H-2 가 보장 */
  image: string;
  /** 스크린리더용 포스터 설명 */
  alt: string;
}

/** 1~10 → 고유어 수관형사 + "가지"("다섯 가지"), 그 밖은 숫자. 유형 수 문구는 배열 길이에서 만든다(하드코딩 금지) */
const NATIVE_COUNT = ["한", "두", "세", "네", "다섯", "여섯", "일곱", "여덟", "아홉", "열"] as const;

export function kindsLabel(n: number): string {
  return `${Number.isInteger(n) && n >= 1 && n <= NATIVE_COUNT.length ? NATIVE_COUNT[n - 1] : n} 가지`;
}

/** 목적이 있는 사람에게 보여 주는 5장 — 순서가 곧 히어로·비교 화면·사이트맵 순서 */
const PURPOSE_LANES: readonly PurposeLane[] = [
  {
    id: "guinong",
    label: "귀농",
    desc: "농사로 먹고사는 정착",
    intro:
      "농사를 생업으로 삼고 농촌에 뿌리내리는 길이에요. 농지·주택·창업자금처럼 지원사업이 가장 많고, 어떤 작물로 시작하느냐가 첫 3년을 좌우해요. 가족과 함께 정착하는 분이 많아요.",
    href: "/start/guinong",
    image: "/landing/lanes/guinong.webp",
    alt: "이른 아침 과수원에서 사과를 수확하는 부부",
  },
  {
    id: "guichon",
    label: "귀촌",
    desc: "일은 그대로, 집은 시골",
    intro:
      "일과 소득은 지금처럼 두고, 사는 곳만 시골로 옮기는 길이에요. 농사 부담 없이 통근·의료·주거 조건으로 지역을 고르면 돼요. 텃밭이나 주말농장으로 가볍게 시작하는 분이 많아요.",
    href: "/start/guichon",
    image: "/landing/lanes/guichon.webp",
    alt: "간이역 옆 돌담길을 걸어 마을로 들어서는 사람",
  },
  {
    id: "forest",
    label: "귀산촌",
    desc: "숲·임산물로 사는 산촌",
    intro:
      "숲과 임산물로 사는 산촌 정착이에요. 표고·더덕·산양삼처럼 손이 덜 가는 작목이 많고, 임업 전용 지원이 따로 있어요. 조용한 환경을 찾는 분에게 맞아요.",
    href: "/start/forest",
    image: "/landing/lanes/forest.webp",
    alt: "산촌 마을 숲에서 표고목의 버섯을 따 바구니에 담는 사람",
  },
  {
    id: "youth",
    label: "청년농",
    desc: "39세 이하 청년 지원",
    intro:
      "만 39세 이하만 받는 영농정착지원금·후계농 자금·농지은행 임대가 따로 있어요. 초기 자본이 적어도 시작할 수 있는 길이라, 어떤 지원부터 챙길지 순서가 중요해요.",
    href: "/start/youth",
    image: "/landing/lanes/youth.webp",
    alt: "밭 옆 트럭에 수확물을 싣고 드론을 바라보는 청년 농부",
  },
  {
    id: "smartfarm",
    label: "스마트팜",
    desc: "데이터로 짓는 농사",
    intro:
      "온실과 센서·데이터로 작물을 키우는 시설 농업이에요. 초기 투자금이 크지만 날씨 영향이 적고 노동 강도가 낮아요. 딸기·토마토·엽채류처럼 시설 재배가 자리 잡은 작물로 시작하는 분이 많아요.",
    href: "/start/smartfarm",
    image: "/landing/lanes/smartfarm.webp",
    alt: "센서가 달린 스마트 온실에서 태블릿으로 작물을 관리하는 모습",
  },
];

/** 아직 고르지 못한 사람 — 비교 화면(`/start`)으로 보낸다 */
const UNDECIDED_LANE: JourneyLane = {
  id: "undecided",
  // 10/2 회장: "아직 고르는 중" 대신 지칭하는 말로 — 정부·지자체 공고가 쓰는 "예비 귀농·귀촌인"
  label: "예비 귀농·귀촌인",
  desc: `${kindsLabel(PURPOSE_LANES.length)} 시작 비교`,
  intro:
    "아직 어떤 시작이 맞는지 정하지 못했다면 여기서부터예요. 2분 진단으로 내 유형을 알고, 그에 맞는 지역·작물·지원사업을 이어서 볼 수 있어요. 지금 고르지 않아도 괜찮아요.",
  href: "/start",
};

export const JOURNEY_LANES: readonly JourneyLane[] = [...PURPOSE_LANES, UNDECIDED_LANE];

/** 게이트 카드 1 — "이미 목적지가 있다" 쪽(보관 중인 히어로 화면 전용) */
const DECIDED_GATE: JourneyLane = {
  id: "decided",
  label: "목적이 있어요",
  desc: `${PURPOSE_LANES.map((l) => l.label).join("·")} 중에서 골라요`,
  intro:
    "어떤 시작인지 이미 정했다면 바로 그 길만 보면 돼요. 고른 여정의 지원사업·작물·비용·사람 이야기를 한 화면에 모아 드려요.",
  href: "/start",
};

/** 히어로 첫 화면의 두 갈래 — [목적이 있어요, 아직 고르는 중] (보관 중인 히어로 화면 전용) */
export const JOURNEY_GATES: readonly JourneyLane[] = [
  DECIDED_GATE,
  // 보관 중인 게이트 화면은 "목적이 있어요"와 짝을 이루는 문장형 라벨을 그대로 쓴다
  { ...UNDECIDED_LANE, label: "아직 고르는 중" },
];

/** 목적이 있는 사람에게 보여 주는 5장 (게이트 카드로 쓰는 undecided 제외) — 포스터(image·alt)가 타입으로 보장된다 */
export const START_LANES: readonly PurposeLane[] = PURPOSE_LANES;
