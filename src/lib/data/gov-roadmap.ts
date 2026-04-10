/* ==========================================================================
   정부사업 진입 가이드 데이터
   4개 핵심 사업의 자격 요건, 신청 절차, 필요 서류, 의무사항 등
   ========================================================================== */

import {
  UserCheck,
  Landmark,
  TreePine,
  type LucideIcon,
} from "lucide-react";
import { IrangSprout as Sprout } from "@/components/ui/irang-sprout";

/* ── 타입 ── */

export interface EligibilityItem {
  label: string;
  detail: string;
  required: boolean; // true면 필수, false면 우대
}

export interface StepInfo {
  order: number;
  title: string;
  description: string;
  duration: string;
  documents?: string[];
  tips?: string[];
}

export interface SubProgram {
  name: string;
  target: string;
  support: string;
  conditions: string[];
}

/** 공식 출처 정보 — 정책 데이터 검증용 */
export interface PolicySource {
  /** 출처 이름 (예: "찾기쉬운 생활법령") */
  label: string;
  /** 크롤링/확인 대상 URL */
  url: string;
  /** 이 출처에서 검증하는 데이터 필드 */
  covers: string[];
}

export interface GovProgramRoadmap {
  id: string;
  name: string;
  shortName: string;
  agency: string;
  icon: LucideIcon;
  summary: string;
  targetAudience: string;
  supportAmount: string;
  supportType: "보조금" | "융자" | "현물" | "혼합";
  eligibility: EligibilityItem[];
  applicationPeriod: {
    typical: string;
    frequency: string;
  };
  steps: StepInfo[];
  requiredDocuments: string[];
  obligations: string[];
  caution: string;
  relatedLinks: { label: string; href: string; external?: boolean }[];
  subPrograms?: SubProgram[];
  /** 공식 출처 목록 — 정책 데이터 검증 스크립트에서 사용 */
  sources?: PolicySource[];
  /** 마지막 공식 데이터 검증일 (YYYY-MM-DD) */
  lastVerified?: string;
}

/* ── 데이터 ── */

export const GOV_PROGRAMS: GovProgramRoadmap[] = [
  /* ═══════════════════════════════════════════
     1. 귀농귀촌 종합지원
     ═══════════════════════════════════════════ */
  {
    id: "return-farming",
    name: "귀농귀촌 종합 지원사업",
    shortName: "귀농귀촌",
    agency: "농림축산식품부 · 각 지자체",
    icon: Sprout,
    summary:
      "도시에서 농촌으로 이주하여 농업에 종사하려는 분을 위한 포괄적 정착 지원 사업입니다. 창업자금 최대 3억 원(연 2%, 5년 거치 10년 상환)과 주택구입비 최대 7,500만 원을 융자 지원합니다.",
    targetAudience: "귀농인 · 재촌비농업인 · 귀농희망자 (만 65세 이하)",
    supportAmount: "창업자금 최대 3억 원 + 주택자금 최대 7,500만 원 (융자)",
    supportType: "융자",
    eligibility: [
      {
        label: "귀농 교육 이수",
        detail: "농업교육기관 100시간 이상 이수 (온·오프라인 병행 가능)",
        required: true,
      },
      {
        label: "농촌 전입",
        detail: "농촌 지역 주민등록 전입 완료 (5년 이내)",
        required: true,
      },
      {
        label: "영농 계획",
        detail: "영농 계획서 제출 (작물·규모·투자 계획 포함)",
        required: true,
      },
      {
        label: "농업경영체 등록",
        detail: "농업경영체 등록 (AGRIX 시스템)",
        required: true,
      },
      {
        label: "연령 기준",
        detail: "신청연도 기준 만 65세 이하",
        required: true,
      },
      {
        label: "전입 전 거주",
        detail: "농촌 전입 전 1년 이상 타 지역 거주 이력",
        required: true,
      },
      {
        label: "영농 경력",
        detail: "영농 경력이 있으면 선정 시 가산점 부여",
        required: false,
      },
    ],
    applicationPeriod: {
      typical: "매년 1~3월 (지자체별 상이)",
      frequency: "연 1~2회",
    },
    steps: [
      {
        order: 1,
        title: "귀농 교육 이수",
        description:
          "농림수산식품교육문화정보원(농정원) 또는 각 시·도 농업기술원에서 운영하는 귀농 교육을 100시간 이상 이수합니다.",
        duration: "2~6개월",
        tips: [
          "온라인 교육은 최대 50시간까지 인정됩니다",
          "농업마이스터대학, 귀농귀촌종합센터 교육도 인정 대상",
          "교육 이수증은 신청 시 필수 제출 서류입니다",
        ],
      },
      {
        order: 2,
        title: "이주 지역 탐색 및 결정",
        description:
          "귀농 희망 지역을 방문하고, 지자체 귀농 담당자와 상담합니다. 임시 거주(농촌체험) 프로그램을 활용하면 좋습니다.",
        duration: "1~3개월",
        tips: [
          "귀농귀촌종합센터(1899-9097)에서 지역별 정보 상담 가능",
          "농촌 체험·체류형 프로그램으로 미리 생활 적응도를 확인하세요",
          "지역별 지원 규모와 조건이 다르니 복수 지역 비교 필수",
        ],
      },
      {
        order: 3,
        title: "주민등록 전입 + 농업경영체 등록",
        description:
          "선택한 농촌 지역으로 전입신고를 하고, 농업경영정보시스템(AGRIX)에 농업경영체 등록을 합니다.",
        duration: "1~2주",
        documents: [
          "전입신고서",
          "농업경영체 등록 신청서",
          "농지 임대차 계약서 또는 소유 증빙",
        ],
        tips: [
          "농업경영체 등록은 신청 자격의 핵심 조건입니다",
          "농지 확보(임대 또는 매입) 후 등록해야 합니다",
        ],
      },
      {
        order: 4,
        title: "지원사업 공고 확인 및 신청",
        description:
          "거주지 시·군·구 홈페이지 또는 귀농귀촌종합센터에서 공고를 확인하고 신청합니다.",
        duration: "공고 후 2~4주",
        documents: [
          "사업 신청서 (지자체 양식)",
          "농업창업계획서 (작물, 규모, 투자 계획)",
          "귀농 교육 이수 확인서 (100시간 이상)",
          "농업경영체 등록 확인서",
          "주민등록등본 (농촌 전입 확인)",
          "가족관계증명서",
          "금융기관 신용조사서",
          "사업자등록사실여부 증명서",
          "소득금액증명원 (직전 3년)",
        ],
        tips: [
          "지자체별 추가 서류가 있을 수 있으니 공고문을 반드시 확인하세요",
          "온라인 신청 시 농림사업통합정보시스템(AgriX)에서 접수",
        ],
      },
      {
        order: 5,
        title: "심사 및 선정",
        description:
          "서류 심사 → 현장 확인 → 심사위원회 평가를 거쳐 최종 선정됩니다. 결과는 개별 통보됩니다.",
        duration: "1~2개월",
        tips: [
          "영농 계획의 구체성과 실현 가능성이 핵심 평가 항목",
          "현장 확인 시 실제 영농 준비 상태를 점검합니다",
        ],
      },
    ],
    requiredDocuments: [
      "사업 신청서 (지자체 양식)",
      "농업창업계획서 (작물, 규모, 투자 계획)",
      "귀농 교육 이수 확인서 (100시간 이상)",
      "농업경영체 등록 확인서",
      "주민등록등본 (농촌 전입 확인)",
      "가족관계증명서",
      "금융기관 신용조사서",
      "사업자등록사실여부 증명서",
      "소득금액증명원 (직전 3년)",
      "농지 임대차 계약서 또는 소유 증빙",
      "견적서 등 투자 계획 증빙",
    ],
    obligations: [
      "선정 후 5년 이상 계속 영농 종사 의무",
      "융자금 상환: 연 2%, 5년 거치 10년 원금균등분할",
      "매년 영농 실적 보고 (시·군·구에 제출)",
      "사업 목적 외 자금 사용 시 전액 환수",
      "농촌 거주지 이탈(도시 전출) 시 지원금 반환",
    ],
    caution:
      "귀농 교육 이수 없이는 신청 자격이 부여되지 않습니다. 교육은 반드시 사전에 완료해야 하며, 일부 지자체는 해당 지역 교육만 인정하는 경우도 있으니 공고문을 꼼꼼히 확인하세요.",
    relatedLinks: [
      { label: "지역 비교하기", href: "/regions" },
      { label: "귀농 5단계 가이드", href: "/guide" },
      { label: "지원사업 검색", href: "/programs" },
      {
        label: "귀농귀촌 그린대로",
        href: "https://www.greendaero.go.kr",
        external: true,
      },
    ],
    sources: [
      {
        label: "찾기쉬운 생활법령 — 농업창업자금",
        url: "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1765&ccfNo=3&cciNo=2&cnpClsNo=1",
        covers: ["eligibility", "supportAmount", "requiredDocuments"],
      },
      {
        label: "농진청 청년농업인 지원정책",
        url: "https://www.rda.go.kr/young/content/custom0201.do",
        covers: ["eligibility", "supportAmount", "obligations", "steps"],
      },
      {
        label: "그린대로 귀농귀촌 절차안내",
        url: "https://www.greendaero.go.kr/svc/rfph/front/rfphStep.do",
        covers: ["steps", "applicationPeriod"],
      },
    ],
    lastVerified: "2026-04-08",
  },

  /* ═══════════════════════════════════════════
     2. 청년창업농 지원사업
     ═══════════════════════════════════════════ */
  {
    id: "youth-startup",
    name: "청년창업농 영농정착 지원사업",
    shortName: "청년창업농",
    agency: "농림축산식품부",
    icon: UserCheck,
    summary:
      "만 18~39세 청년이 새롭게 농업에 진입할 수 있도록 영농 정착금(월 최대 110만 원)을 최대 3년간 지원합니다. 전국 연간 5,000명 선발하며, 청년농업희망카드(바우처)로 지급됩니다.",
    targetAudience: "만 18~39세, 독립 경영 3년 이하의 청년 농업인",
    supportAmount: "월 최대 110만 원 (최대 3년, 매년 감액)",
    supportType: "보조금",
    eligibility: [
      {
        label: "연령 조건",
        detail: "만 18세 이상 ~ 39세 이하 (사업 시행연도 1월 1일 기준)",
        required: true,
      },
      {
        label: "독립 경영 기간",
        detail: "독립적 영농 경영을 시작한 지 3년 이하",
        required: true,
      },
      {
        label: "병역 요건",
        detail: "병역필 또는 면제자 (면접 심사 전일 기준)",
        required: true,
      },
      {
        label: "영농 교육 이수",
        detail: "농업 관련 교육 100시간 이상 이수",
        required: true,
      },
      {
        label: "농업경영체 등록",
        detail: "농업경영체 등록 완료 (AGRIX 시스템)",
        required: true,
      },
      {
        label: "경영 계획서",
        detail: "3년 이상 영농 경영 계획서 제출",
        required: true,
      },
      {
        label: "가구 소득",
        detail: "가구 소득이 도시근로자 평균의 130% 이하",
        required: true,
      },
      {
        label: "농업 관련 학위",
        detail: "농업계 대학 졸업자는 교육 이수 일부 면제 가능",
        required: false,
      },
    ],
    applicationPeriod: {
      typical: "전년도 11~12월 접수, 익년 1월 선발",
      frequency: "연 1회",
    },
    steps: [
      {
        order: 1,
        title: "자격 요건 확인",
        description:
          "연령, 독립경영 기간, 소득 기준 등 기본 요건을 확인합니다. 부모 농장을 이어받은 경우에도 독립 경영 인정 조건이 있습니다.",
        duration: "수시",
        tips: [
          "만 40세 미만은 사업 시행 연도 1월 1일 기준입니다",
          "부모 명의 농업경영체에서 독립해야 합니다",
          "소득 기준은 매년 변경되니 최신 공고를 확인하세요",
        ],
      },
      {
        order: 2,
        title: "교육 이수 및 경영 계획 수립",
        description:
          "농업교육기관에서 100시간 이상 교육을 이수하고, 3년 이상의 영농 경영 계획서를 작성합니다.",
        duration: "2~6개월",
        tips: [
          "농업 마이스터대학, 농업기술센터 교육 모두 인정",
          "경영 계획서에는 작물 선택 이유, 매출 목표, 투자 계획을 구체적으로",
          "멘토 매칭을 위한 희망 분야도 미리 정리하세요",
        ],
      },
      {
        order: 3,
        title: "신청서 접수",
        description:
          "거주지 시·군·구 농업 부서에 신청서와 구비 서류를 제출합니다. 온라인(AgriX)으로도 접수 가능합니다.",
        duration: "공고 후 2~3주",
        documents: [
          "사업 신청서 (소정 양식)",
          "영농 경영 계획서 (3년 이상)",
          "영농 교육 이수 확인서 (100시간 이상)",
          "농업경영체 등록 확인서",
          "소득금액증명원 (가구원 전원)",
          "주민등록등본",
          "졸업증명서 (농업계 학교 해당 시)",
          "건강보험자격득실확인서",
        ],
      },
      {
        order: 4,
        title: "심사 (서류 + 면접)",
        description:
          "1차 서류 심사 후 2차 면접 심사를 진행합니다. 영농 의지, 경영 계획의 실현 가능성, 지역 정착 의지가 주요 평가 항목입니다.",
        duration: "1~2개월",
        tips: [
          "면접에서는 '왜 농업인가'에 대한 명확한 비전이 중요",
          "경영 계획의 숫자(매출, 비용)를 구체적으로 설명할 수 있어야 합니다",
          "지역 농업 현황을 미리 조사해가면 좋은 인상을 줍니다",
        ],
      },
      {
        order: 5,
        title: "선정 및 정착금 지급",
        description:
          "선정 후 청년농업희망카드(바우처)로 매월 정착금이 지급됩니다. 1년차 월 110만 원, 2년차 월 100만 원, 3년차 월 90만 원으로 체감됩니다.",
        duration: "최대 3년",
        tips: [
          "분기별 영농 활동 보고서를 제출해야 합니다",
          "멘토와 정기적으로 상담하며 경영 역량을 강화하세요",
          "중도 포기 시 지급된 정착금 일부 반환 가능성 있습니다",
        ],
      },
    ],
    requiredDocuments: [
      "사업 신청서 (소정 양식)",
      "영농 경영 계획서 (3년 이상)",
      "영농 교육 이수 확인서 (100시간 이상)",
      "농업경영체 등록 확인서",
      "주민등록등본",
      "소득금액증명원 (가구원 전원)",
      "졸업증명서 (농업계 학교 해당 시)",
      "건강보험자격득실확인서",
    ],
    obligations: [
      "독립경영 이행: 다음 연도 3월 31일까지 경영주 등록",
      "경영장부 매월 25일까지 제출",
      "재해보험 · 의무자조금 가입 유지 (80% 이상)",
      "의무교육 과정 이수 (미이수 시 2개월 지급 중단)",
      "전업적 독립영농 유지 (상근직·학업 병행 불가)",
      "지급 완료 후 동일 기간 영농 종사 의무",
      "서류 거짓 작성 시 전액 환수 및 자격 박탈",
    ],
    caution:
      "청년창업농은 '독립 경영'이 핵심 조건입니다. 부모 농장에서 근무하더라도 별도 경영체를 등록해야 하며, 이중 취업(농업 외 정규직)은 지원 대상에서 제외될 수 있습니다.",
    relatedLinks: [
      { label: "작물 추천받기", href: "/match" },
      { label: "작물 정보", href: "/crops" },
      { label: "귀농 5단계 가이드", href: "/guide" },
      {
        label: "청년농 탄탄대로",
        href: "https://youngfarmer.greendaero.go.kr",
        external: true,
      },
    ],
    sources: [
      {
        label: "찾기쉬운 생활법령 — 청년후계농 지원",
        url: "https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1765&ccfNo=3&cciNo=4&cnpClsNo=2",
        covers: ["eligibility", "obligations", "supportAmount"],
      },
      {
        label: "서울시 2026 청년농업인 선발 공고",
        url: "https://agro.seoul.go.kr/archives/54938",
        covers: ["eligibility", "applicationPeriod", "requiredDocuments"],
      },
      {
        label: "농진청 청년농업인 지원정책",
        url: "https://www.rda.go.kr/young/content/custom0201.do",
        covers: ["eligibility", "supportAmount", "obligations"],
      },
      {
        label: "농림축산식품부 시행지침 공고",
        url: "https://www.mafra.go.kr/home/5108/subview.do",
        covers: ["eligibility", "applicationPeriod", "requiredDocuments", "obligations"],
      },
    ],
    lastVerified: "2026-04-08",
  },

  /* ═══════════════════════════════════════════
     3. 농지은행 지원사업
     ═══════════════════════════════════════════ */
  {
    id: "farmland-bank",
    name: "농지은행 지원사업",
    shortName: "농지은행",
    agency: "한국농어촌공사",
    icon: Landmark,
    summary:
      "농지를 확보하기 어려운 귀농인과 청년 농업인에게 임대수탁, 선임대후매도, 매매 등의 서비스를 제공합니다. 2026년부터 위탁 수수료가 전면 폐지되어 농업인 부담이 크게 줄었습니다.",
    targetAudience: "농업인, 귀농인, 청년 농업인, 농업법인",
    supportAmount: "임대 표준임차료 기준 · 매매 연리 1% (최장 30년)",
    supportType: "현물",
    eligibility: [
      {
        label: "농업인 자격",
        detail: "농업경영체 등록자 또는 등록 예정자",
        required: true,
      },
      {
        label: "영농 의지",
        detail: "직접 농업에 종사할 의사가 있는 자",
        required: true,
      },
      {
        label: "거주 요건",
        detail: "농지 소재지와 같은 시·군·구 거주 (전입 예정자 포함)",
        required: true,
      },
      {
        label: "청년 우대",
        detail: "만 18~40세 청년 농업인은 임대 시 우선 배정",
        required: false,
      },
      {
        label: "귀농인 우대",
        detail: "귀농 교육 이수 후 5년 이내 귀농인은 우선 배정",
        required: false,
      },
    ],
    applicationPeriod: {
      typical: "연중 수시 (농지 물량에 따라)",
      frequency: "수시",
    },
    steps: [
      {
        order: 1,
        title: "농지은행 포털 회원가입",
        description:
          "한국농어촌공사 농지은행 포털(farmbank.kr)에 회원가입하고, 희망 지역·면적·작물 조건을 설정합니다.",
        duration: "당일",
        tips: [
          "농지 알림 서비스를 등록하면 신규 농지 등록 시 알림을 받을 수 있습니다",
          "여러 지역을 관심 지역으로 등록해두세요",
        ],
      },
      {
        order: 2,
        title: "농지 탐색 및 현장 확인",
        description:
          "포털에서 임대·매매 가능 농지를 검색하고, 관심 농지가 있으면 현장을 직접 방문하여 토질, 수리 시설, 접근성 등을 확인합니다.",
        duration: "1~4주",
        tips: [
          "토양 정보는 흙토람(soil.rda.go.kr)에서 미리 확인 가능",
          "수리 시설(저수지, 관정)과 도로 접근성은 반드시 현장 확인",
          "인근 농업인에게 해당 필지의 이력을 확인하는 것도 좋습니다",
        ],
      },
      {
        order: 3,
        title: "임대·매매 신청",
        description:
          "원하는 농지를 선택하여 임대 또는 매매 신청서를 제출합니다. 한국농어촌공사 지사를 방문하거나 온라인으로 신청 가능합니다.",
        duration: "1~2주",
        documents: [
          "농지 임대(매매) 신청서",
          "농업경영체 등록 확인서",
          "영농계획서 (해당 농지 기준)",
          "주민등록등본",
          "신분증 사본",
          "소득금액증명원 (매매 시)",
          "농지원부 사본 (보유 농지가 있는 경우)",
        ],
      },
      {
        order: 4,
        title: "자격 심사 및 계약",
        description:
          "농어촌공사에서 신청자 자격과 영농 계획을 심사한 후, 임대차 또는 매매 계약을 체결합니다.",
        duration: "2~4주",
        tips: [
          "임대 기간은 보통 5년 단위이며 갱신 가능합니다",
          "계약 전 임대료·매매가 조건을 꼼꼼히 비교하세요",
          "계약서에 시설물 설치 조건을 확인하세요",
        ],
      },
      {
        order: 5,
        title: "영농 시작 및 관리",
        description:
          "계약 완료 후 해당 농지에서 영농을 시작합니다. 임대 농지는 계약 조건에 따라 관리 의무가 있습니다.",
        duration: "계약 기간",
        tips: [
          "임대 농지의 형질 변경(타 용도 전용)은 금지됩니다",
          "임대료는 매년 물가 변동에 따라 조정될 수 있습니다",
        ],
      },
    ],
    requiredDocuments: [
      "농지 임대(매매) 신청서",
      "농업경영체 등록 확인서",
      "영농계획서 (해당 농지 기준)",
      "주민등록등본",
      "신분증 사본",
      "소득금액증명원 (매매 시)",
      "농지원부 사본 (보유 농지가 있는 경우)",
    ],
    obligations: [
      "임대 농지는 직접 영농 종사 의무 (위탁 경영 불가)",
      "농지의 형질 변경·전용 금지",
      "임대료 기한 내 납부",
      "계약 해지 시 원상 복구 의무",
      "매년 영농 현황 보고 (농어촌공사 요청 시)",
    ],
    caution:
      "농지은행의 농지는 물량이 한정적이므로 원하는 지역·규모의 농지가 바로 나오지 않을 수 있습니다. 알림 서비스 등록 후 꾸준히 확인하세요. 또한 임대 농지에 영구 시설물을 설치하면 계약 해지 시 문제가 될 수 있습니다.",
    relatedLinks: [
      { label: "지역 비교하기", href: "/regions" },
      { label: "지원사업 검색", href: "/programs" },
      {
        label: "농지은행 포털",
        href: "https://www.fbo.or.kr",
        external: true,
      },
    ],
    subPrograms: [
      {
        name: "농지임대수탁사업",
        target: "직접 경작이 어려운 농지 소유자 → 경작 희망자에게 임대",
        support: "표준임차료 기준, 5~10년 임대 (2026년부터 위탁 수수료 폐지)",
        conditions: [
          "농업경영체 등록",
          "위탁자: 농지 취득 후 3년 이상 소유",
          "직접 경작 의무",
        ],
      },
      {
        name: "선임대후매도사업",
        target: "39세 이하 청년 농업인 대상, 희망 농지를 공사가 매입 후 임대",
        support: "최장 30년 임대, 원리금 상환 완료 시 소유권 이전 (연리 1%)",
        conditions: [
          "39세 이하 청년농",
          "1ha 이내 (경력 2년 이하 0.5ha)",
          "표준임차료 50~100%",
        ],
      },
      {
        name: "경영회생농지 매입사업",
        target: "경영 곤란 농가 농지를 공사가 매입 후 장기 임대",
        support: "감정평가액 기준 매입, 최대 10년 장기 임대 + 환매권 보장",
        conditions: [
          "부채·재해로 경영 곤란 농업인",
          "경영 회복 후 우선 매수권",
          "귀농인·청년 농업인 우선 배정",
        ],
      },
      {
        name: "농지매매사업",
        target: "영농규모 확대 희망 농업인·농업법인에게 농지 매도",
        support: "매입자금 최장 30년 상환 (연리 1%), 2년 거치 가능",
        conditions: [
          "매수자: 농업경영체 등록 필수",
          "매도자: 이농인·은퇴농 등",
          "중개 수수료 없음",
        ],
      },
    ],
    sources: [
      {
        label: "농지은행 통합포털",
        url: "https://www.fbo.or.kr",
        covers: ["subPrograms", "supportAmount", "eligibility"],
      },
      {
        label: "농지은행 임대사업 총정리",
        url: "https://youyounews.co.kr/%EB%86%8D%EC%A7%80%EC%9D%80%ED%96%89-%EC%9E%84%EB%8C%80%EC%82%AC%EC%97%85-%EC%B4%9D%EC%A0%95%EB%A6%AC/",
        covers: ["subPrograms", "obligations"],
      },
      {
        label: "정책브리핑 — 농지은행 제도 개선",
        url: "https://www.korea.kr/briefing/pressReleaseView.do?newsId=156681808",
        covers: ["subPrograms", "supportAmount"],
      },
    ],
    lastVerified: "2026-04-08",
  },

  /* ═══════════════════════════════════════════
     4. 귀산촌 자금
     ═══════════════════════════════════════════ */
  {
    id: "forest-village",
    name: "귀산촌 창업 지원자금",
    shortName: "귀산촌",
    agency: "산림청 · 한국임업진흥원",
    icon: TreePine,
    summary:
      "산촌 지역으로 이주하여 산림 자원을 활용한 창업을 하려는 분에게 창업 자금과 주거 지원을 제공합니다. 임산물 재배, 산촌 체험, 목재 가공 등이 대상입니다.",
    targetAudience: "산촌 이주 후 산림 자원 활용 창업 희망자",
    supportAmount: "최대 5억 원 (융자, 이자율 2% 이내)",
    supportType: "융자",
    eligibility: [
      {
        label: "산촌 전입",
        detail: "산촌진흥지역 전입 완료 (5년 이내)",
        required: true,
      },
      {
        label: "귀산촌 교육 이수",
        detail: "산림청 인정 귀산촌 교육 40시간 이상 이수",
        required: true,
      },
      {
        label: "창업 계획서",
        detail: "산림 자원 활용 창업 계획서 제출",
        required: true,
      },
      {
        label: "임업경영체 등록",
        detail: "임업경영체 등록 또는 등록 예정",
        required: true,
      },
      {
        label: "산림 관련 자격",
        detail: "관련 자격증 보유 시 가산점 부여 (산림기사 등)",
        required: false,
      },
    ],
    applicationPeriod: {
      typical: "매년 2~4월",
      frequency: "연 1회",
    },
    steps: [
      {
        order: 1,
        title: "귀산촌 교육 이수",
        description:
          "산림청 또는 한국임업진흥원이 인정하는 귀산촌 교육을 40시간 이상 이수합니다.",
        duration: "1~3개월",
        tips: [
          "한국임업진흥원 산림일자리발전소에서 교육 정보 확인",
          "산림복합경영, 임산물 가공 관련 교육 추천",
          "교육 이수증은 5년간 유효합니다",
        ],
      },
      {
        order: 2,
        title: "산촌 지역 선정 및 전입",
        description:
          "산촌진흥지역으로 지정된 지역을 탐색하고 전입합니다. 산림청 홈페이지에서 산촌진흥지역 목록을 확인할 수 있습니다.",
        duration: "1~2개월",
        tips: [
          "산촌진흥지역은 전국 약 3,500개 법정리가 지정되어 있습니다",
          "지역 선택 시 임산물 생산 여건과 교통 접근성을 고려하세요",
          "지자체 귀산촌 추가 지원이 있는 지역을 우선 검토하세요",
        ],
      },
      {
        order: 3,
        title: "창업 계획 수립 및 신청",
        description:
          "산림 자원 활용 창업 계획서를 작성하고, 관할 시·군·구에 지원 신청합니다.",
        duration: "공고 후 3~4주",
        documents: [
          "지원 신청서 (소정 양식)",
          "귀산촌 교육 이수 확인서 (40시간 이상)",
          "창업 사업 계획서 (산림 자원 활용)",
          "임업경영체 등록 확인서 (또는 등록 예정 확인서)",
          "주민등록등본 (산촌진흥지역 전입 확인)",
          "소득금액증명원",
          "산림(임야) 소유 또는 이용 계획 증빙",
          "관련 자격증 사본 (해당 시)",
        ],
      },
      {
        order: 4,
        title: "심사 및 선정",
        description:
          "서류 심사와 현장 확인을 거쳐 최종 선정됩니다. 창업 아이템의 독창성, 지역 경제 기여도, 실현 가능성이 핵심 평가 항목입니다.",
        duration: "1~2개월",
        tips: [
          "6차 산업화(생산+가공+체험)를 결합한 계획이 높은 점수를 받습니다",
          "지역 주민과 협업 계획이 있으면 가산점",
        ],
      },
      {
        order: 5,
        title: "자금 지급 및 창업",
        description:
          "선정 후 융자금이 지급되며, 계획서에 따라 창업을 진행합니다. 사후 관리로 정기 점검을 받습니다.",
        duration: "최대 5년 (상환 기간)",
        tips: [
          "자금 용도: 시설비, 운영비, 장비 구입 등",
          "용도 외 사용 적발 시 즉시 회수 및 제재",
          "거치 기간(2년) 후 3년간 분할 상환이 일반적입니다",
        ],
      },
    ],
    requiredDocuments: [
      "지원 신청서 (소정 양식)",
      "귀산촌 교육 이수 확인서 (40시간 이상)",
      "창업 사업 계획서 (산림 자원 활용)",
      "임업경영체 등록 확인서 (또는 등록 예정 확인서)",
      "주민등록등본 (산촌진흥지역 전입 확인)",
      "소득금액증명원",
      "산림(임야) 소유 또는 이용 계획 증빙",
      "관련 자격증 사본 (해당 시)",
    ],
    obligations: [
      "선정 후 5년 이상 산촌 지역 거주 및 영농(임업) 의무",
      "창업 자금은 계획서 상 용도에만 사용",
      "연 1회 이상 경영 실적 보고",
      "한국임업진흥원 정기 점검 수용",
      "거치 기간(2년) 후 융자금 분할 상환",
      "사업 중단 시 잔여 융자금 즉시 상환",
    ],
    caution:
      "귀산촌 자금은 융자(대출)이므로 반드시 상환해야 합니다. 무상 지원금이 아님에 유의하세요. 또한 산촌진흥지역이 아닌 곳으로 전입하면 지원 대상이 되지 않으니, 반드시 산촌진흥지역 지정 여부를 확인하세요.",
    relatedLinks: [
      { label: "지역 비교하기", href: "/regions" },
      { label: "지원사업 검색", href: "/programs" },
      {
        label: "산림청 귀산촌 안내",
        href: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_000434&mn=AR02_06_02_02",
        external: true,
      },
      {
        label: "한국임업진흥원",
        href: "https://www.kofpi.or.kr",
        external: true,
      },
    ],
    sources: [
      {
        label: "산림청 산촌/귀산촌 지원사업",
        url: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_000434&mn=AR02_06_02_02",
        covers: ["eligibility", "supportAmount", "steps"],
      },
      {
        label: "정부24 산림사업종합자금",
        url: "https://www.gov.kr/portal/service/serviceInfo/SD0000010823",
        covers: ["supportAmount", "obligations"],
      },
    ],
    lastVerified: "2026-04-08",
  },
];

/** ID로 프로그램 데이터 조회 */
export function findGovProgram(id: string): GovProgramRoadmap | undefined {
  return GOV_PROGRAMS.find((p) => p.id === id);
}
