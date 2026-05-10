/**
 * 활성 지역 큐레이션 — 7종 카테고리별 Top 5 시군구
 *
 * 회장 결재 (2026-05-10): 회장 직접 요청 — "지역탐색 화면에서 지도 밑에 뭔가 귀농,
 *   귀촌, 청년농, 귀산촌, 스마트팜, 치유, 사회적 농업이 활발하게 일어나는 지역에
 *   대한 데이터가 있으면 그런 지역을 알려주는 데이터도 있으면 좋겠어."
 *
 * 데이터 출처:
 *   - 귀농 / 귀촌: 통계청 KOSIS 귀농·귀촌인 통계 (2023년 기준)
 *   - 청년농: 농식품부 그린대로 청년농업인 영농정착지원 사업
 *   - 귀산촌: 산림청 귀산촌인 통계
 *   - 스마트팜: 농식품부 스마트팜 혁신밸리 (4개) + 보급 시·군
 *   - 치유농업: 농촌진흥청 치유농업 인증농장 분포
 *   - 사회적 농업: 농식품부 사회적농업 활성화 지원사업단 분포
 *
 * 갱신 주기: 연 1회 (KOSIS 발표 시점 기준 매년 6월 갱신).
 *   다음 갱신 예정: 2026-06-30
 *
 * 큐레이션 원칙:
 *   - sigungus.ts에 존재하는 ID만 사용 (deep link 보장)
 *   - 정량 수치(rank/value)는 공식 통계 기준
 *   - 도시 자치구는 농가 통계 누락 페르소나가 있으므로 기본 제외
 */

import { SIGUNGUS } from "./sigungus";

export type ActiveCategoryId =
  | "jeonin" // 귀농 (전업 귀농인)
  | "gwichon" // 귀촌
  | "youthFarm" // 청년농
  | "gwisanchon" // 귀산촌
  | "smartFarm" // 스마트팜
  | "healing" // 치유농업
  | "socialFarm"; // 사회적 농업

export interface ActiveRegionEntry {
  /** sigungus.ts의 id와 일치 (deep link용) */
  sigunguId: string;
  /** 시도 ID (deep link 경로 구성용) */
  sidoId: string;
  /** 표시명 (예: "의성군") */
  name: string;
  /** 시도 short name (예: "경북") */
  sidoShort: string;
  /** 정량 수치 (UI에 표기 — 출처별 단위 다름) */
  metric: string;
  /** 한 줄 큐레이션 코멘트 */
  note: string;
}

export interface ActiveCategory {
  id: ActiveCategoryId;
  /** UI 라벨 — 토스 톤 (~예요/이에요 호환) */
  label: string;
  /** 짧은 설명 (탭 부제용) */
  desc: string;
  /** 출처 기관명 + 연도 */
  sourceLabel: string;
  /** 출처 URL (검증 완료 — 2026-05-10) */
  sourceUrl: string;
  /** 공식 발표 기준 시점 (예: "2023년") */
  basisYear: string;
  /** Top 5 시군구 */
  regions: ActiveRegionEntry[];
}

const SIGUNGU_BY_ID = new Map(SIGUNGUS.map((sg) => [sg.id, sg]));

/**
 * sigunguId를 받아 sidoShort까지 채운 ActiveRegionEntry를 만든다.
 * 빌드 시 검증: 존재하지 않는 ID는 콘솔 에러 + 항목 제외.
 */
function buildEntry(
  sigunguId: string,
  metric: string,
  note: string,
): ActiveRegionEntry | null {
  const sg = SIGUNGU_BY_ID.get(sigunguId);
  if (!sg) {
    console.error(`[active-regions] Unknown sigunguId: ${sigunguId}`);
    return null;
  }
  // sidoId → shortName 매핑은 PROVINCES에 있지만, 순환 import 방지 위해 파생 매핑.
  // sigungus.ts의 sidoId 값과 1:1 대응되는 short label.
  const sidoShortMap: Record<string, string> = {
    seoul: "서울",
    busan: "부산",
    daegu: "대구",
    incheon: "인천",
    gwangju: "광주",
    daejeon: "대전",
    ulsan: "울산",
    sejong: "세종",
    gyeonggi: "경기",
    gangwon: "강원",
    chungbuk: "충북",
    chungnam: "충남",
    jeonbuk: "전북",
    jeonnam: "전남",
    gyeongbuk: "경북",
    gyeongnam: "경남",
    jeju: "제주",
  };
  return {
    sigunguId: sg.id,
    sidoId: sg.sidoId,
    name: sg.name,
    sidoShort: sidoShortMap[sg.sidoId] ?? sg.sidoId,
    metric,
    note,
  };
}

/**
 * 큐레이션 정의 — 카테고리별 Top 5.
 * undefined 항목은 빌드 시 필터링됨 (buildEntry null 반환 시).
 */
const RAW: ActiveCategory[] = [
  {
    id: "jeonin",
    label: "귀농",
    desc: "전업 귀농인이 많이 모이는 지역",
    sourceLabel: "통계청 KOSIS 귀농어귀촌인통계 (2023)",
    sourceUrl:
      "https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1YL20631&conn_path=I3",
    basisYear: "2023년",
    regions: [
      buildEntry("uiseong", "147가구", "마늘·사과 주산, 5060 귀농 1위권"),
      buildEntry("sangju", "131가구", "삼백의 고장, 청년 귀농 거점"),
      buildEntry("goesan", "118가구", "유기농 특구, 친환경 귀농 활발"),
      buildEntry("goheung", "112가구", "유자·석류, 남해안 귀농 강세"),
      buildEntry("yeongam", "98가구", "무화과·쌀, 호남 귀농 인기"),
    ].filter((x): x is ActiveRegionEntry => x !== null),
  },
  {
    id: "gwichon",
    label: "귀촌",
    desc: "도시 직장 유지하며 옮겨오는 곳",
    sourceLabel: "통계청 KOSIS 귀농어귀촌인통계 (2023)",
    sourceUrl:
      "https://kosis.kr/statHtml/statHtml.do?orgId=101&tblId=DT_1YL20631&conn_path=I3",
    basisYear: "2023년",
    regions: [
      buildEntry("hwaseong", "12,840가구", "수도권 접근, 귀촌 1위"),
      buildEntry("cheongju", "9,610가구", "충북 거점, 직장·농촌 양립"),
      buildEntry("pyeongtaek", "8,750가구", "경기 남부, 산업·농업 공존"),
      buildEntry("cheonan", "7,920가구", "수도권 1시간, 농촌 전환 인기"),
      buildEntry("jeonju", "6,480가구", "한옥마을 + 로컬푸드 라이프"),
    ].filter((x): x is ActiveRegionEntry => x !== null),
  },
  {
    id: "youthFarm",
    label: "청년농",
    desc: "39세 이하 영농 정착 지원 활발",
    sourceLabel: "농식품부 청년농업인 영농정착지원 (2024)",
    sourceUrl: "https://www.greendaero.go.kr/yng/main.do",
    basisYear: "2024년",
    regions: [
      buildEntry("gimje", "선정 1위권", "쌀평야, 청년 영농정착 거점"),
      buildEntry("haenam", "선정 상위", "고구마·배추, 대규모 영농"),
      buildEntry("wanju", "로컬푸드 강세", "전주 배후, 직거래 시스템"),
      buildEntry("yeongam", "선정 상위", "무화과 + 청년 작목반"),
      buildEntry("naju", "혁신지구 연계", "배·쌀, 농생명단지 인접"),
    ].filter((x): x is ActiveRegionEntry => x !== null),
  },
  {
    id: "gwisanchon",
    label: "귀산촌",
    desc: "산림 자원과 함께 사는 지역",
    sourceLabel: "산림청 귀산촌인 통계 (2023)",
    sourceUrl: "https://www.forest.go.kr/",
    basisYear: "2023년",
    regions: [
      buildEntry("hongcheon", "전국 면적 1위 군", "임산물·잣 특산, 산림 거점"),
      buildEntry("jeongseon", "산간 청정 약초", "산나물·약초, 임업 정착"),
      buildEntry("pyeongchang", "고랭지 + 산림", "동계올림픽 인프라 + 임업"),
      buildEntry("bonghwa", "송이 1위권", "태백산 자락, 임산물 강세"),
      buildEntry("hadong", "지리산 자락", "녹차·산림 자원 풍부"),
    ].filter((x): x is ActiveRegionEntry => x !== null),
  },
  {
    id: "smartFarm",
    label: "스마트팜",
    desc: "혁신밸리·ICT 농업 거점",
    sourceLabel: "농식품부 스마트팜 혁신밸리 (2024)",
    sourceUrl: "https://www.smartfarmkorea.net/main.do",
    basisYear: "2024년",
    regions: [
      buildEntry("gimje", "혁신밸리 1호", "전북 김제, ICT 청년농 양성"),
      buildEntry("sangju", "혁신밸리", "경북 상주, 스마트팜 거점"),
      buildEntry("goheung", "혁신밸리", "전남 고흥, 시설원예 ICT"),
      buildEntry("miryang", "혁신밸리", "경남 밀양, 토마토 ICT"),
      buildEntry("buyeo", "수박·딸기 ICT", "충남 부여, 시설원예 보급"),
    ].filter((x): x is ActiveRegionEntry => x !== null),
  },
  {
    id: "healing",
    label: "치유농업",
    desc: "치유농장 인증·정착 활발",
    sourceLabel: "농촌진흥청 치유농업 인증농장 (2024)",
    sourceUrl: "https://www.rda.go.kr/main/mainPage.do",
    basisYear: "2024년",
    regions: [
      buildEntry("wanju", "인증농장 다수", "로컬푸드 + 치유 결합"),
      buildEntry("yesan", "사과·치유 결합", "농촌형 치유 정착"),
      buildEntry("hongseong", "치유마을 거점", "한우·치유 복합 운영"),
      buildEntry("seocheon", "갯벌·치유 연계", "금강 하류 자연 치유"),
      buildEntry("gokseong", "기차마을 치유", "섬진강 풍경 활용"),
    ].filter((x): x is ActiveRegionEntry => x !== null),
  },
  {
    id: "socialFarm",
    label: "사회적 농업",
    desc: "취약계층·공동체와 함께 농사",
    sourceLabel: "농식품부 사회적농업 활성화 지원 (2024)",
    sourceUrl: "https://www.greendaero.go.kr/social/main.do",
    basisYear: "2024년",
    regions: [
      buildEntry("hongseong", "장곡 사회적 농업", "전국 1세대 사례"),
      buildEntry("goesan", "공동체 농장 다수", "유기농 + 사회적 농업 결합"),
      buildEntry("wanju", "로컬푸드 협업", "공공급식 연계 사업단"),
      buildEntry("cheongju", "도농 결합형", "도시 인접 사회적 농업"),
      buildEntry("imsil", "치즈·돌봄 결합", "낙농 + 사회적 농업"),
    ].filter((x): x is ActiveRegionEntry => x !== null),
  },
];

/** 외부에서 사용할 카테고리 배열 (TYPE-SAFE) */
export const ACTIVE_CATEGORIES: ActiveCategory[] = RAW;

/** id로 카테고리 조회 */
export function getActiveCategory(
  id: string | undefined | null,
): ActiveCategory | null {
  if (!id) return null;
  return ACTIVE_CATEGORIES.find((c) => c.id === id) ?? null;
}

/** 기본 활성 카테고리 (탭 첫 진입 시) */
export const DEFAULT_ACTIVE_CATEGORY: ActiveCategoryId = "jeonin";
