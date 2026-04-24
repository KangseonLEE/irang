/**
 * 귀농 유형별 맞춤 로드맵 단계 정의
 *
 * 매칭(match) 결과에서 분류된 FarmTypeId에 따라
 * 개인화된 단계별 가이드를 제공합니다.
 */
import type { FarmTypeId } from "./match-questions";

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  duration: string; // 예상 소요 기간
  /** 관련 이랑 페이지 링크 */
  link?: { href: string; label: string };
  /** 체크리스트 항목 */
  checklist: string[];
}

export interface FarmTypeRoadmap {
  farmTypeId: FarmTypeId;
  totalDuration: string; // 전체 예상 기간
  steps: RoadmapStep[];
}

export const ROADMAPS: FarmTypeRoadmap[] = [
  {
    farmTypeId: "guinong",
    totalDuration: "12~18개월",
    steps: [
      {
        step: 1,
        title: "정보 수집·동기 정리",
        description:
          "귀농 관련 정보를 모으고, 왜 귀농을 하고 싶은지 구체적으로 정리해요. 가족과의 합의도 이 단계에서 이루어져야 해요.",
        duration: "1~2개월",
        link: { href: "/guide", label: "귀농 가이드 보기" },
        checklist: [
          "귀농 동기와 목표 정리",
          "가족 동의 및 역할 논의",
          "귀농 성공·실패 사례 조사",
          "예상 생활비·초기 자금 산출",
        ],
      },
      {
        step: 2,
        title: "교육·체험 참여",
        description:
          "귀농귀촌종합센터, 지자체 교육 프로그램에 참여해 기초 농업 기술과 현실적인 정보를 얻으세요.",
        duration: "2~3개월",
        link: { href: "/education", label: "교육 프로그램 찾기" },
        checklist: [
          "귀농귀촌종합센터 온라인 교육 수강",
          "지자체 귀농 교육 프로그램 신청",
          "주말 농장·체험 행사 참여",
          "선배 귀농인 멘토링 연결",
        ],
      },
      {
        step: 3,
        title: "지역·작물 선정",
        description:
          "기후, 토양, 접근성, 지원 정책 등을 비교해 정착할 지역과 재배할 작물을 결정해요.",
        duration: "1~2개월",
        link: { href: "/regions", label: "지역 비교하기" },
        checklist: [
          "3개 이상 후보 지역 현장 방문",
          "지역별 지원 정책 비교",
          "작물별 수익성·난이도 비교",
          "기후·토양 적합성 확인",
        ],
      },
      {
        step: 4,
        title: "농지·주거 확보",
        description:
          "농지은행, 지자체 임대, 직거래 등을 통해 농지를 확보하고, 주거 공간을 마련해요.",
        duration: "2~4개월",
        link: { href: "/costs", label: "비용 가이드 보기" },
        checklist: [
          "농지은행·공유 농지 검색",
          "현지 부동산·이장님 미팅",
          "임대 vs 매입 비용 비교",
          "주거 형태 결정 (빈집·신축·리모델링)",
        ],
      },
      {
        step: 5,
        title: "지원사업 신청",
        description:
          "정착 지원금, 영농 자금, 교육비 등 활용 가능한 정부 지원사업에 신청해요.",
        duration: "1~2개월",
        link: { href: "/programs", label: "지원사업 찾기" },
        checklist: [
          "신청 자격 요건 확인",
          "필요 서류 준비 (사업계획서 등)",
          "지자체 담당자 사전 상담",
          "복수 사업 병행 신청 가능 여부 확인",
        ],
      },
      {
        step: 6,
        title: "이주·영농 시작",
        description:
          "주민등록 이전 후 본격적인 영농을 시작해요. 첫해는 소규모로 시작하는 게 안전해요.",
        duration: "상시",
        checklist: [
          "전입신고 및 농업경영체 등록",
          "첫해 소규모 시험 재배",
          "농협·영농조합 가입",
          "지역 주민 관계 형성",
        ],
      },
    ],
  },
  {
    farmTypeId: "guichon",
    totalDuration: "6~12개월",
    steps: [
      {
        step: 1,
        title: "원격 근무 환경 점검",
        description:
          "현재 직장의 원격 근무 가능 여부, 프리랜서 전환 가능성을 먼저 확인해요.",
        duration: "1개월",
        checklist: [
          "회사 원격 근무 정책 확인",
          "인터넷 품질 기준 정리 (화상회의 등)",
          "프리랜서·1인 사업 전환 가능성 검토",
          "소득 변화 시뮬레이션",
        ],
      },
      {
        step: 2,
        title: "지역 선정·체험",
        description:
          "교통 접근성, 인터넷 인프라, 생활 편의시설을 기준으로 후보 지역을 골라 체험해요.",
        duration: "1~2개월",
        link: { href: "/regions", label: "지역 비교하기" },
        checklist: [
          "KTX·고속도로 접근성 확인",
          "인터넷 속도 현장 측정",
          "의료·교육·마트 접근성 확인",
          "주말 체류 체험 (2주 이상)",
        ],
      },
      {
        step: 3,
        title: "주거 확보",
        description:
          "빈집 수리, 귀촌 주택 지원, 전원주택 등 주거 형태를 결정하고 마련해요.",
        duration: "2~3개월",
        link: { href: "/costs", label: "비용 가이드 보기" },
        checklist: [
          "빈집 정보 시스템 검색",
          "지자체 귀촌 주택 지원 확인",
          "리모델링 비용 견적",
          "작업 공간(홈오피스) 설계",
        ],
      },
      {
        step: 4,
        title: "지원사업 활용",
        description:
          "귀촌 정착 지원금, 농촌 체류형 쉼터 등 활용 가능한 사업을 신청해요.",
        duration: "1개월",
        link: { href: "/programs", label: "지원사업 찾기" },
        checklist: [
          "귀촌 정착 지원금 신청",
          "농촌 체류형 쉼터 프로그램 확인",
          "지역 창업 지원 사업 검토",
        ],
      },
      {
        step: 5,
        title: "이주·정착",
        description:
          "주소 이전 후 지역 커뮤니티에 합류하고, 텃밭·주말농장으로 농촌 생활을 시작해요.",
        duration: "상시",
        checklist: [
          "전입신고",
          "주민자치센터·마을 모임 참여",
          "텃밭·주말농장 시작",
          "지역 동호회·봉사활동 참여",
        ],
      },
    ],
  },
  {
    farmTypeId: "guisanchon",
    totalDuration: "12~18개월",
    steps: [
      {
        step: 1,
        title: "산촌 생활 이해",
        description:
          "산촌은 일반 농촌과 다른 환경이에요. 임업·산림자원 활용에 대한 이해가 먼저 필요해요.",
        duration: "1~2개월",
        link: { href: "/guide", label: "가이드 보기" },
        checklist: [
          "산촌 생활 현실 조사 (접근성, 의료 등)",
          "임산물·특용작물 시장 조사",
          "산림청 귀산촌 지원 정책 확인",
          "선배 귀산촌인 인터뷰",
        ],
      },
      {
        step: 2,
        title: "교육·자격 취득",
        description:
          "임업 기술, 산림 경영, 약용식물 재배 등 전문 교육을 이수해요.",
        duration: "3~6개월",
        link: { href: "/education", label: "교육 프로그램 찾기" },
        checklist: [
          "산림청 귀산촌 교육 프로그램 수강",
          "임업 후계자 과정 신청",
          "약용식물·버섯 재배 기술 교육",
          "산림 체험 관광 운영 교육",
        ],
      },
      {
        step: 3,
        title: "지역·산지 선정",
        description:
          "임야 확보 가능 지역, 관광 자원, 접근성을 기준으로 정착 지역을 결정해요.",
        duration: "1~2개월",
        link: { href: "/regions", label: "지역 비교하기" },
        checklist: [
          "산림청 임야 정보 확인",
          "후보 지역 현장 답사",
          "임야 매입·임대 조건 비교",
          "산촌 체류 체험 참여",
        ],
      },
      {
        step: 4,
        title: "임야·주거 확보 및 지원사업 신청",
        description:
          "임야를 확보하고, 귀산촌 전용 지원사업을 신청해요.",
        duration: "2~3개월",
        link: { href: "/programs", label: "지원사업 찾기" },
        checklist: [
          "임야 매입 또는 장기 임대 계약",
          "산촌생태마을 입주 신청",
          "산림청 귀산촌 창업 지원 신청",
          "주거 마련 (산촌 빈집·펜션형)",
        ],
      },
      {
        step: 5,
        title: "정착·사업 운영",
        description:
          "임산물 채취·가공, 산림 체험 관광, 약초 재배 등 산림 자원 기반 소득 활동을 시작해요.",
        duration: "상시",
        checklist: [
          "임업경영체 등록",
          "임산물 채취·가공 시작",
          "산림 체험 관광 프로그램 기획",
          "지역 산림조합 가입",
        ],
      },
    ],
  },
  {
    farmTypeId: "smartfarm",
    totalDuration: "12~24개월",
    steps: [
      {
        step: 1,
        title: "스마트팜 이해·조사",
        description:
          "스마트팜의 종류(유리온실, 비닐하우스, 수경재배 등), 투자 규모, 기술 수준을 파악해요.",
        duration: "1~2개월",
        link: { href: "/guide", label: "가이드 보기" },
        checklist: [
          "스마트팜 유형별 장단점 비교",
          "초기 투자 비용 시뮬레이션",
          "성공 사례·실패 사례 조사",
          "관련 기술(IoT, 센서, 자동화) 기초 학습",
        ],
      },
      {
        step: 2,
        title: "전문 교육·기술 습득",
        description:
          "스마트팜 혁신밸리, 농업기술센터의 전문 교육을 이수해요. 실습 중심 과정을 추천해요.",
        duration: "3~6개월",
        link: { href: "/education", label: "교육 프로그램 찾기" },
        checklist: [
          "스마트팜 혁신밸리 입교 신청",
          "ICT 융복합 농업 교육 수강",
          "현장 실습 (선도농가 파견)",
          "데이터 분석·환경 제어 기술 학습",
        ],
      },
      {
        step: 3,
        title: "시설·장비 계획",
        description:
          "재배할 작물, 시설 규모, 자동화 수준을 결정하고, 설비 업체 견적을 받아요.",
        duration: "2~3개월",
        link: { href: "/crops", label: "작물 정보 비교" },
        checklist: [
          "시설 규모·구조 설계",
          "자동화 장비 선정 (관수, 환경 제어 등)",
          "3개 이상 업체 견적 비교",
          "운영 비용 시뮬레이션",
        ],
      },
      {
        step: 4,
        title: "자금 확보·지원사업",
        description:
          "스마트팜은 초기 투자가 큰 편이에요. 정부 지원사업과 융자를 적극 활용하세요.",
        duration: "2~3개월",
        link: { href: "/programs", label: "지원사업 찾기" },
        checklist: [
          "스마트팜 보급 사업 신청",
          "청년 창업 농 영농정착금 확인",
          "농업 정책자금 융자 신청",
          "사업계획서 작성",
        ],
      },
      {
        step: 5,
        title: "시설 구축·시험 운영",
        description:
          "시설을 설치하고 소규모 시험 재배로 시스템을 안정화해요.",
        duration: "3~4개월",
        checklist: [
          "시설 설치 및 장비 세팅",
          "환경 제어 시스템 테스트",
          "시험 재배 시작 (1~2개 작물)",
          "데이터 수집·분석 체계 구축",
        ],
      },
      {
        step: 6,
        title: "본격 운영·판로 개척",
        description:
          "안정적인 생산 체계를 갖춘 후 온라인 직거래, 로컬푸드 매장 등 판로를 확보해요.",
        duration: "상시",
        checklist: [
          "생산량 데이터 기반 최적화",
          "온라인 직거래 채널 개설",
          "로컬푸드 매장·학교 급식 납품",
          "스마트팜 커뮤니티 참여",
        ],
      },
    ],
  },
  {
    farmTypeId: "cheongnyeon",
    totalDuration: "6~12개월",
    steps: [
      {
        step: 1,
        title: "창업 아이템 발굴",
        description:
          "청년농은 농업을 '창업'으로 접근해요. 차별화된 아이템과 비즈니스 모델을 먼저 구상하세요.",
        duration: "1~2개월",
        link: { href: "/crops", label: "작물 정보 비교" },
        checklist: [
          "트렌드 작물·틈새 시장 조사",
          "6차 산업 (생산+가공+체험) 가능성 검토",
          "비즈니스 모델 캔버스 작성",
          "선배 청년농 멘토 연결",
        ],
      },
      {
        step: 2,
        title: "청년농 전용 교육",
        description:
          "청년 귀농 장기 교육, 스마트팜 혁신밸리 등 청년 맞춤형 교육에 참여해요.",
        duration: "2~4개월",
        link: { href: "/education", label: "교육 프로그램 찾기" },
        checklist: [
          "청년 귀농 장기 교육 신청",
          "농업 마이스터 대학 검토",
          "선도농가 현장 실습",
          "농업 경영·마케팅 교육 수강",
        ],
      },
      {
        step: 3,
        title: "영농정착금·창업 지원 확보",
        description:
          "청년 전용 영농정착금(월 최대 110만 원, 3년)과 창업 지원 사업을 신청해요.",
        duration: "1~2개월",
        link: { href: "/programs", label: "지원사업 찾기" },
        checklist: [
          "청년 창업농 영농정착금 신청",
          "농식품 창업 지원 사업 확인",
          "지자체 청년농 추가 지원 확인",
          "농업 정책자금 융자 신청",
        ],
      },
      {
        step: 4,
        title: "농지·시설 확보",
        description:
          "임대 농지, 공유 가공시설, 창업보육센터 등을 활용해 초기 비용을 줄여요.",
        duration: "1~2개월",
        link: { href: "/costs", label: "비용 가이드 보기" },
        checklist: [
          "농지은행 임대 농지 검색",
          "공유 가공시설·창업보육센터 확인",
          "초기 장비 리스·공동 구매 검토",
          "사업장 주소 확보",
        ],
      },
      {
        step: 5,
        title: "창업·브랜딩",
        description:
          "농업경영체 등록 후 SNS 마케팅, 직거래 플랫폼을 활용해 브랜드를 만들어요.",
        duration: "상시",
        checklist: [
          "농업경영체 등록",
          "브랜드 네이밍·패키지 디자인",
          "인스타그램·네이버 스마트스토어 개설",
          "청년농 네트워크·동아리 참여",
        ],
      },
    ],
  },
];

/** farmTypeId로 로드맵 조회 */
export function getRoadmap(farmTypeId: FarmTypeId): FarmTypeRoadmap | undefined {
  return ROADMAPS.find((r) => r.farmTypeId === farmTypeId);
}
