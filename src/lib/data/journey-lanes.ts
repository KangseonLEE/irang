/**
 * 히어로 여정 레인 데이터 (2026-09-29 회장 결재 — "히어로부터 시작이 나와야 한다", 1안).
 *
 * 랜딩 히어로 자체를 "어떤 시작인지" 고르는 화면으로 쓰고, 고른 기준 그대로
 * **기존 페르소나·검색 화면**으로 보낸다(A 단계 — 새 화면·새 필터를 만들지 않는다).
 * `persona` 값은 normalize 화이트리스트의 5종(family·farmYouth·elderRural·commuter·balanced)만 쓴다 —
 * 밖의 값은 middleware 가 308 로 떼어내 딥링크가 조용히 무력화된다(6/16 박제).
 *
 * 스마트팜은 `/programs?q=스마트팜` 이 2건뿐이라 26건이 나오는 `/search?q=스마트팜` 으로 보낸다(9/29 실측).
 *
 * 계측: `data-track="journey_lanes:<id>"` → LandingClickTracker → `landing_cta_click`(신규 이벤트 없음).
 * `undecided` 만 `data-assess-entry` 도 달아 진단 진입 지면을 가른다(9/16 AssessEntryTracker).
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
    href: "/programs?persona=family",
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
    href: "/regions/ranking?persona=commuter",
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
    href: "/guide/track-compare",
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
    href: "/programs?persona=farmYouth",
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
    href: "/search?q=스마트팜",
    image: "/landing/lanes/smartfarm.webp",
    alt: "센서가 달린 스마트 온실에서 태블릿으로 작물을 관리하는 모습",
    charImage: "/landing/lanes/char-smartfarm.webp",
  },
  {
    id: "undecided",
    label: "탐색 중",
    desc: "2분 진단으로 내 유형부터",
    intro:
      "아직 어떤 시작이 맞는지 정하지 못했다면 여기서부터예요. 2분 진단으로 내 유형을 알고, 그에 맞는 지역·작물·지원사업을 이어서 볼 수 있어요. 지금 고르지 않아도 괜찮아요.",
    href: "/match?mode=assess",
    image: "/landing/lanes/undecided.webp",
    alt: "언덕 위에서 들판을 내려다보며 지도를 펼친 사람",
    charImage: "/landing/lanes/char-undecided.webp",
  },
] as const;
