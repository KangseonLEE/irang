/**
 * 귀농·귀촌 지원사업 데이터
 * - RDA API(policyList) 연동 + 정적 폴백 데이터
 * - RDA_API_KEY 미설정 또는 API 실패 시 샘플 데이터로 폴백
 */

import {
  fetchPolicies,
  mapAreaName,
  stripHtml,
  type RdaPolicyItem,
} from "@/lib/api/rda";
import { deriveStatus } from "@/lib/program-status";
import { getSupabase, isSupabaseConfigured, type ProgramRow } from "@/lib/supabase";

export interface SupportProgram {
  id: string;
  title: string;
  summary: string;
  description?: string;
  region: string;
  organization: string;
  supportType: "보조금" | "융자" | "교육" | "현물" | "컨설팅";
  supportAmount: string;
  eligibilityAgeMin: number;
  eligibilityAgeMax: number;
  eligibilityDetail: string;
  applicationStart: string;
  applicationEnd: string;
  status: "모집중" | "모집예정" | "마감";
  relatedCrops: string[];
  sourceUrl: string;
  /** 원문 링크 상태 — 헬스체크 결과 반영 */
  linkStatus?: "active" | "broken" | "unverified";
  year: number;
  /** DB 등록일 — "신규" 뱃지 판정에 사용 */
  createdAt?: string;
}

export const REGIONS = [
  "전국",
  "서울특별시",
  "경기도",
  "강원도",
  "충청북도",
  "충청남도",
  "전라북도",
  "전라남도",
  "경상북도",
  "경상남도",
  "제주특별자치도",
] as const;

export const SUPPORT_TYPES = [
  "보조금",
  "융자",
  "교육",
  "현물",
  "컨설팅",
] as const;

export const PROGRAMS: SupportProgram[] = [
  {
    id: "SP-001",
    title: "귀농 농업창업 및 주택구입 지원사업",
    summary:
      "귀농인의 농업창업자금과 농촌주택 구입자금을 저금리 융자로 지원하는 농식품부 대표 정착사업.",
    description:
      "농업창업자금 최대 3억원, 주택구입자금 최대 7,500만원을 연 2% 이내 저금리로 융자받을 수 있습니다. 농촌 전입 후 6년 이내 세대주로서 영농교육 100시간 이상 이수가 필요하며, 각 시군 농업기술센터를 통해 매년 초 접수합니다. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업입니다.",
    region: "전국",
    organization: "농림축산식품부 / 각 시군 농업기술센터",
    supportType: "융자",
    supportAmount: "농업창업 최대 3억원 / 주택구입 최대 7,500만원 (5년 거치 10년 상환)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 100시간 이상 이수.",
    applicationStart: "2026-01-12",
    applicationEnd: "2026-02-13",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.gunsan.go.kr/farm/m2435/view/8495763",
    year: 2026,
  },
  {
    id: "SP-002",
    title: "청년농업인 영농정착지원사업 (청년창업형 후계농업경영인)",
    summary:
      "만 39세 이하 청년농업인에게 독립경영 초기 3년간 월 정착지원금을 지급하는 보조금 사업.",
    description:
      "독립경영 1년차 월 110만원부터 3년차 월 90만원까지 최대 3년간 정착지원금을 받을 수 있습니다. 만 18~39세 청년으로 영농경력 3년 이하이며 해당 지자체에 실거주해야 합니다. 연간 약 2,000명을 선발하며, 매년 11~12월경 다음 해 대상자를 모집합니다. 청년 귀농인의 초기 생활 안정에 실질적으로 도움이 되는 핵심 사업입니다.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "독립경영 1년차 월 110만원, 2년차 월 100만원, 3년차 월 90만원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18~39세. 총 영농경력 3년 이하. 신청 지자체 실거주 및 주민등록. 연간 약 2,000명 선발.",
    applicationStart: "2025-11-05",
    applicationEnd: "2025-12-11",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://agro.seoul.go.kr/archives/54938",
    year: 2026,
  },
  {
    id: "SP-003",
    title: "충남 스마트팜 청년창업 교육 및 창업지원 (제8기)",
    summary:
      "충남 청년농업인 대상 6개월 스마트팜 교육과정(이론+실습+현장)으로 창업역량을 지원.",
    description:
      "6개월 과정으로 이론교육, 시설 실습, 선도농가 현장실습을 체계적으로 이수합니다. 수강료 전액 지원에 현장실습 훈련비 월 최대 100만원까지 지급됩니다. 딸기·토마토·파프리카 등 시설원예 중심의 스마트팜 기술을 익힐 수 있으며, 충남 거주 또는 전입 예정 만 18~44세 청년이 대상입니다.",
    region: "충청남도",
    organization: "충청남도농업기술원",
    supportType: "교육",
    supportAmount: "교육 수강료 전액 지원 + 현장실습 훈련비 월 최대 100만원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 44,
    eligibilityDetail:
      "충남도내 청년농업인 또는 충남 전입 예정자. 6개월 과정(이론+실습+현장).",
    applicationStart: "2025-12-29",
    applicationEnd: "2026-01-02",
    status: "마감",
    relatedCrops: ["딸기", "토마토", "파프리카"],
    sourceUrl: "https://youth.chungnam.go.kr/web/main/bbs/cnyouth_notice/497",
    year: 2026,
  },
  {
    id: "SP-004",
    title: "완주군 청년창업 스마트팜 패키지 지원사업",
    summary:
      "전북 완주군 청년농업인에게 스마트팜 시설 설치비를 보조금으로 지원하는 패키지 사업.",
    description:
      "전북 청년창업보육센터 수료(예정)자로서 완주군에 주민등록을 이전하고 사업부지를 확보한 만 18~44세 청년이 신청할 수 있습니다. 스마트팜 시설 설치비를 보조금으로 지원받되, 자기부담금 1억 3,200만원 이상이 필요합니다. 보육센터 교육과 연계된 패키지형 지원으로 창업 실행력을 높이는 것이 특징입니다.",
    region: "전라북도",
    organization: "완주군농업기술센터 기술보급과",
    supportType: "보조금",
    supportAmount: "스마트팜 시설 설치비 지원 (자기부담 132백만원 이상)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 44,
    eligibilityDetail:
      "만 18~45세 미만 청년농업인. 전북 청년창업보육센터 수료(예정)자. 완주군 주민등록 이전 완료. 사업부지 확보.",
    applicationStart: "2025-09-01",
    applicationEnd: "2025-09-26",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.wanjuro.org/post/3168",
    year: 2026,
  },
  {
    id: "SP-005",
    title: "함평군 귀농어귀촌 체류형 지원센터 입교 (제6기)",
    summary:
      "함평군에서 귀농 희망자에게 주거공간·공동실습농지·시설하우스를 제공하는 체류형 교육.",
    description:
      "21세대 규모의 체류형 주거공간과 공동실습농지, 시설하우스, 작업장을 무상으로 이용할 수 있습니다. 도시에서 1년 이상 거주한 만 65세 이하 귀농 희망자가 대상이며, 함평군 전입 6개월 이내이거나 이주 예정인 예비귀농인도 신청 가능합니다. 실제 농촌에서 생활하며 영농기술을 익힐 수 있는 체류형 프로그램입니다.",
    region: "전라남도",
    organization: "함평군 귀농어귀촌 체류형 지원센터",
    supportType: "현물",
    supportAmount: "주거공간 제공 + 공동실습농지·시설하우스·작업장 이용 (21세대)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "만 65세 이하. 도시지역 1년 이상 거주 후 함평군 전입 6개월 이내 또는 이주 희망 예비귀농인.",
    applicationStart: "2026-01-10",
    applicationEnd: "2026-02-10",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.asiaa.co.kr/news/articleView.html?idxno=237422",
    year: 2026,
  },
  {
    id: "SP-006",
    title: "금산군 체류형 귀농교육센터 입교",
    summary:
      "금산군에서 1년간 체류하며 인삼·약초 중심 영농교육을 받을 수 있는 체류형 귀농 프로그램.",
    description:
      "금산군 특화작목인 인삼과 약초를 중심으로 1년간 체류하며 영농교육을 받습니다. 76㎡ 2세대, 69.4㎡ 1세대 등 총 3세대만 선발하므로 경쟁률이 높습니다. 체류 주택이 무상 제공되며, 금산 지역 특산물 재배 노하우를 현장에서 직접 배울 수 있는 것이 강점입니다.",
    region: "충청남도",
    organization: "금산군귀농교육센터",
    supportType: "현물",
    supportAmount: "체류형 주택 제공 (76㎡ 2세대, 69.4㎡ 1세대, 총 3세대 선발)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 희망자. 1년간 체류하며 영농 교육 참여.",
    applicationStart: "2026-01-15",
    applicationEnd: "2026-02-10",
    status: "마감",
    relatedCrops: ["인삼", "약초"],
    sourceUrl: "http://www.daejeontoday.com/news/articleView.html?idxno=722515",
    year: 2026,
  },
  {
    id: "SP-007",
    title: "무안군 체류형 귀농인의 집",
    summary:
      "무안군에서 약 10개월간 체류 주거를 제공하며 영농 이론 및 실습 교육을 지원하는 프로그램.",
    description:
      "약 10개월간 무안군 내 체류형 주거를 무상으로 제공받으며 영농 이론과 실습 교육을 병행합니다. 귀농 전 장기 체류를 통해 지역 환경과 농업 여건을 충분히 파악할 수 있습니다. 주거비 부담 없이 안정적으로 귀농 준비를 할 수 있어 초기 정착 실패 위험을 줄여줍니다.",
    region: "전라남도",
    organization: "무안군",
    supportType: "현물",
    supportAmount: "약 10개월간 체류 주거 제공 + 영농 이론·실습 교육",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 희망자. 10개월간 체류하며 영농 이론 및 실습 교육.",
    applicationStart: "2026-01-10",
    applicationEnd: "2026-02-06",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.smartbizn.com/news/articleView.html?idxno=132387",
    year: 2026,
  },
  {
    id: "SP-008",
    title: "연천군 신규농업인 선도농가 현장실습 교육",
    summary:
      "연천군 귀농귀촌인 대상 선도농가 현장실습 교육으로 월 80만원 교육훈련비를 지급.",
    description:
      "연수생에게 월 80만원 교육훈련비, 선도농가에게 월 40만원 교수수당을 지급하는 실습형 교육입니다. 최근 5년 이내 연천군으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년이 대상이며, 교육기간은 2026년 6~10월입니다. 숙련 농가에서 직접 기술을 전수받는 현장 중심 교육으로 실전 역량을 키울 수 있습니다.",
    region: "경기도",
    organization: "연천군 농업기술센터",
    supportType: "교육",
    supportAmount: "연수생 월 80만원 교육훈련비 + 선도농가 월 40만원 교수수당",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "최근 5년 이내 해당 지역 농촌으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년. 교육기간 2026.6~10월.",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-04-17",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.post24.kr/319532",
    year: 2026,
  },
  {
    id: "SP-009",
    title: "영월군 강원에서 살아보기 (귀농형)",
    summary:
      "영월군에서 3개월간 체류하며 주거·영농실습·지역교류를 체험하는 귀농형 살아보기 프로그램.",
    description:
      "3개월간 영월군에 체류하며 주거, 영농실습, 지역 주민 교류를 경험합니다. 5명만 선발하는 소규모 프로그램으로 밀착 지원이 가능하며, 주요 작물 재배기술을 현장에서 습득합니다. 귀농 전 실제 농촌생활을 미리 체험해볼 수 있어 정착 여부를 신중하게 판단하는 데 도움이 됩니다.",
    region: "강원도",
    organization: "영월군 / 요선농촌체험휴양마을",
    supportType: "현물",
    supportAmount: "3개월 체류 지원 (주거+영농실습+지역교류)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농 희망자. 3개월간 영월군에 체류하며 주요 작물 재배기술 습득. 5명 선발.",
    applicationStart: "2026-03-01",
    applicationEnd: "2026-03-31",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://gecpo.org/552867",
    year: 2026,
  },
  {
    id: "SP-010",
    title: "영암군 살아보기 (두 지역 살아보기 3기)",
    summary:
      "영암군에서 3개월간 체류하며 농업·관광·지역문화를 체험하는 귀농귀촌 살아보기 프로그램.",
    description:
      "3개월간 영암군에 체류하며 농업 체험뿐 아니라 관광, 지역문화까지 폭넓게 경험할 수 있습니다. 체류비용이 지원되어 경제적 부담 없이 참여할 수 있으며, 두 지역 살아보기 형태로 운영됩니다. 귀농과 귀촌 모두에 관심 있는 분들이 농촌 정착 가능성을 탐색하기에 적합한 프로그램입니다.",
    region: "전라남도",
    organization: "영암군 인구청년과",
    supportType: "현물",
    supportAmount: "농업·관광·지역문화 체험 + 체류비용 지원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농귀촌 관심자. 3개월간 영암군에 체류하며 농업·관광·지역문화 체험.",
    applicationStart: "2026-03-11",
    applicationEnd: "2026-03-20",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://www.newsro.kr/article243/1142350/",
    year: 2026,
  },
  {
    id: "SP-012",
    title: "스마트팜 청년창업 보육센터 교육생 모집 (9기)",
    summary:
      "스마트팜 혁신밸리 4개소(전북 김제·전남 고흥·경북 상주·경남 밀양)에서 20개월간 입문→교육형실습→경영형실습 과정을 운영하는 국비 무료 장기 교육.",
    description:
      "입문(2개월), 교육형실습(6개월), 경영형실습(12개월) 총 20개월 과정을 국비 무료로 이수합니다. 실습비 월 최대 70만원, 실습재료비 연 최대 360만원이 지원됩니다. 만 18~39세 대한민국 국적자라면 전공 무관하게 지원 가능하며, 전국 4개 혁신밸리에서 딸기·토마토·파프리카 등 시설원예 중심 스마트팜 창업역량을 체계적으로 키울 수 있습니다.",
    region: "전국",
    organization: "한국농업기술진흥원 / 농림축산식품부",
    supportType: "교육",
    supportAmount: "교육비 무료 + 실습비 월 최대 70만원 + 실습재료비 연 최대 360만원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18~39세 대한민국 국적. 전공 무관. 스마트팜 보육센터 기존 이수자 불가. 입문(2개월)→교육형실습(6개월)→경영형실습(12개월) 총 20개월 과정.",
    applicationStart: "2026-04-22",
    applicationEnd: "2026-05-29",
    status: "모집예정",
    relatedCrops: ["딸기", "토마토", "파프리카", "상추"],
    sourceUrl: "https://www.smartfarmkorea.net/edu/pnbsns/all.do?menuId=M01050701",
    year: 2026,
  },
  {
    id: "SP-013",
    title: "우수후계농업경영인 선발 및 육성자금 지원 (2026)",
    summary:
      "후계농업경영인 선정 후 5년 이상 영농 종사자를 대상으로 최대 2억원 저리 융자(연 1.5%)를 지원하는 육성자금 사업. 전국 500명 선발.",
    description:
      "후계농업경영인으로 선정된 지 5년 이상 경과한 영농 종사자가 대상이며, 최대 2억원을 연 1.5% 고정금리로 5년 거치 10년 상환 조건으로 융자받을 수 있습니다. 전국 약 500명을 선발하며, 거주지 읍면동사무소를 통해 신청합니다. 영농 규모 확대나 시설 현대화에 필요한 대규모 자금을 저리로 조달할 수 있는 사업입니다.",
    region: "전국",
    organization: "농림축산식품부 / 지자체 읍면동사무소",
    supportType: "융자",
    supportAmount: "최대 2억원 (연 1.5% 고정금리, 5년 거치 10년 상환)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "후계농업경영인 선정 후 5년 이상 영농 종사자(2021년 이전 선정자). 금융기관 여신제한 대상자 불가. 전국 약 500명 선발.",
    applicationStart: "2026-03-23",
    applicationEnd: "2026-04-15",
    status: "마감",
    relatedCrops: [],
    sourceUrl: "https://agro.seoul.go.kr/archives/55803",
    year: 2026,
  },
  {
    id: "SP-014",
    title: "서울 스마트팜 실용교육 (2026년 상반기)",
    summary:
      "서울시 농업기술센터 주관 3일(14시간) 교육. 식물공장·아쿠아포닉스·디지털농업·스마트팜 온실 구축 등 실용 과정과 현장 견학 포함. 무료.",
    description:
      "3일간 총 14시간의 집중 교육으로 식물공장, 아쿠아포닉스, 디지털농업, 스마트팜 온실 구축 등 실용적인 내용을 다룹니다. 서울시 주민등록 거주자 40명을 선착순 모집하며 교육비는 전액 무료입니다. 현장 견학이 포함되어 있어 단기간에 스마트팜 전반을 체험하고 창업 가능성을 판단하기에 적합합니다.",
    region: "서울특별시",
    organization: "서울특별시 농업기술센터",
    supportType: "교육",
    supportAmount: "교육비 무료 (총 14시간, 3일 과정, 40명 선착순)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "서울시 주민등록 거주자. 나이 제한 사실상 없음. 스마트팜 도입 또는 창업에 관심 있는 시민 대상.",
    applicationStart: "2026-04-06",
    applicationEnd: "2026-04-10",
    status: "마감",
    relatedCrops: ["상추", "토마토"],
    sourceUrl: "https://agro.seoul.go.kr/archives/55870",
    year: 2026,
  },
  {
    id: "SP-011",
    title: "귀농닥터 멘토링 (선도농가 현장실습 교육 지원)",
    summary:
      "귀농귀촌 희망자에게 무료 1:1 현장 컨설팅과 선도농가 기술 전수를 제공하는 상시 프로그램.",
    description:
      "귀농귀촌 희망자 또는 농촌 거주 1년 미만인 분이 무료로 1:1 현장 컨설팅을 받을 수 있는 상시 프로그램입니다. 각 지역 농업기술센터나 그린대로 플랫폼을 통해 수시로 신청하며, 경험 많은 선도농가가 직접 기술을 전수합니다. 별도의 모집기간 없이 연중 이용 가능하여 귀농 초기 시행착오를 줄이는 데 효과적입니다.",
    region: "전국",
    organization: "농촌진흥청 / 각 시군 농업기술센터",
    supportType: "컨설팅",
    supportAmount: "무료 1:1 현장 컨설팅 + 선도농가 기술 전수",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농귀촌 희망자 및 농촌 거주 1년 미만. 각 지역 농업기술센터 또는 그린대로에서 신청.",
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    status: "모집중",
    relatedCrops: [],
    sourceUrl: "https://www.rda.go.kr/young/content/content76.do",
    year: 2026,
  },
];

// --- 헬퍼 함수 ---

/** ID(slug)로 단일 프로그램 조회 — 정적 데이터만 (동기, 날짜 기반 상태) */
export function getProgramById(id: string): SupportProgram | undefined {
  const p = PROGRAMS.find((p) => p.id === id);
  if (!p) return undefined;
  return { ...p, status: deriveStatus(p.applicationStart, p.applicationEnd) };
}

/** ID(slug)로 단일 프로그램 조회 — Supabase → 정적 폴백 (비동기) */
export async function getProgramByIdAsync(
  id: string
): Promise<SupportProgram | undefined> {
  // 1️⃣ Supabase 시도
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("support_programs")
        .select("*")
        .eq("slug", id)
        .maybeSingle();

      if (!error && data) {
        const row = data as unknown as ProgramRow;
        return {
          id: row.slug,
          title: row.title,
          summary: row.summary,
          description: row.description || undefined,
          region: row.region,
          organization: row.organization,
          supportType: row.support_type as SupportProgram["supportType"],
          supportAmount: row.support_amount,
          eligibilityAgeMin: row.eligibility_age_min,
          eligibilityAgeMax: row.eligibility_age_max,
          eligibilityDetail: row.eligibility_detail,
          applicationStart: row.application_start,
          applicationEnd: row.application_end,
          status: deriveStatus(row.application_start, row.application_end),
          relatedCrops: row.related_crops ?? [],
          sourceUrl: row.source_url,
          linkStatus: (row.link_status ?? undefined) as SupportProgram["linkStatus"],
          year: row.year,
          createdAt: row.created_at,
        };
      }
    } catch {
      // Supabase 에러 → 정적 폴백
    }
  }

  // 2️⃣ 정적 폴백
  return getProgramById(id);
}

/** 조회 시점 옵션 생성 (프로그램 데이터의 연도 범위 기반) */
export function getPeriodOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  // 2026년 1~12월 (데이터가 모두 2026년이므로)
  const year = 2026;
  for (let m = 1; m <= 12; m++) {
    const value = `${year}-${String(m).padStart(2, "0")}`;
    options.push({ value, label: `${year}년 ${m}월` });
  }
  return options;
}

/** 현재 연월 문자열 (YYYY-MM) */
export function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** 연령대 필터 옵션 (19세~79세, 10살 간격) */
export const AGE_RANGES = [
  "19~29세",
  "30~39세",
  "40~49세",
  "50~59세",
  "60~69세",
  "70~79세",
] as const;

/** "19~29세" → { min: 19, max: 29 } */
function parseAgeRange(range: string): { min: number; max: number } | null {
  const match = range.match(/(\d+)~(\d+)/);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[2]) };
}

/** 필터 조건에 맞는 프로그램 목록 반환 */
export interface ProgramFilters {
  region?: string;
  age?: string;
  supportType?: string;
  status?: string;
  query?: string;
  includeClosed?: boolean;
  /** 조회 시점 "YYYY-MM" — 해당 월에 모집기간이 겹치는 사업만 표시 */
  period?: string;
}

/** 필터만 적용 (전체 반환) — 날짜 기반 상태 자동 산출 */
export function filterPrograms(filters: ProgramFilters): SupportProgram[] {
  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    // 해당 월의 마지막 날
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  // 날짜 기반으로 상태를 재계산한 프로그램 목록
  const livePrograms = PROGRAMS.map((p) => ({
    ...p,
    status: deriveStatus(p.applicationStart, p.applicationEnd),
  }));

  return livePrograms.filter((program) => {
    // 원문 링크 깨진 항목은 목록에서 숨김
    if (program.linkStatus === "broken") {
      return false;
    }

    // 마감 제외 (기본 동작: includeClosed가 true가 아니면 마감 숨김)
    if (!filters.includeClosed && program.status === "마감") {
      return false;
    }

    // 조회 시점 필터: 모집기간과 선택 월이 겹치는지 확인
    // includeClosed가 true이면 기간 필터를 적용하지 않음 (마감된 과거 프로그램도 표시)
    // 모집중·모집예정은 기간 필터와 무관하게 항상 표시
    if (!filters.includeClosed && periodStart && periodEnd) {
      if (program.status !== "모집중" && program.status !== "모집예정") {
        if (
          program.applicationStart > periodEnd ||
          program.applicationEnd < periodStart
        ) {
          return false;
        }
      }
    }

    // 텍스트 검색 (제목, 요약, 지역, 기관, 관련 작물)
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        program.title,
        program.summary,
        program.region,
        program.organization,
        ...program.relatedCrops,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) {
        return false;
      }
    }

    if (filters.region && filters.region !== "전체") {
      if (program.region !== "전국" && program.region !== filters.region) {
        return false;
      }
    }

    if (filters.age) {
      const range = parseAgeRange(filters.age);
      if (range && (range.min > program.eligibilityAgeMax || range.max < program.eligibilityAgeMin)) {
        return false;
      }
    }

    if (filters.supportType && filters.supportType !== "전체") {
      if (program.supportType !== filters.supportType) {
        return false;
      }
    }

    if (filters.status && filters.status !== "전체") {
      if (program.status !== filters.status) {
        return false;
      }
    }

    return true;
  });
}

/** 페이지 크기 (3열 × 2행) */
export const PAGE_SIZE = 6;

export interface PaginatedResult {
  programs: SupportProgram[];
  total: number;
  hasMore: boolean;
}

/** 필터 + 페이지네이션 (offset 기반) */
export function filterProgramsPaginated(
  filters: ProgramFilters,
  offset: number = 0,
  limit: number = PAGE_SIZE
): PaginatedResult {
  const all = filterPrograms(filters);
  const programs = all.slice(offset, offset + limit);
  return {
    programs,
    total: all.length,
    hasMore: offset + limit < all.length,
  };
}

// ─── RDA API 연동 레이어 ───

/** RDA API 응답 → SupportProgram 변환 */
function mapRdaPolicy(item: RdaPolicyItem): SupportProgram {
  const region = mapAreaName(item.area1Nm ?? "전국");
  const status = deriveStatus(item.applStDt, item.applEdDt);

  return {
    id: `rda-${item.seq}`,
    title: item.title,
    summary: stripHtml(item.contents).slice(0, 200),
    description: undefined,
    region,
    organization: item.chargeAgency || item.chargeDept || "농촌진흥청",
    supportType: "보조금",  // RDA API에 유형 필드 없음 → 기본값
    supportAmount: item.price || "상세 공고 참조",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail: item.eduTarget || "공고문 참조",
    applicationStart: item.applStDt,
    applicationEnd: item.applEdDt,
    status,
    relatedCrops: [],
    sourceUrl: item.infoUrl || "",
    year: new Date().getFullYear(),
  };
}

/**
 * RDA API에서 지원사업 데이터를 가져오고,
 * 실패 시 정적 샘플 데이터로 폴백
 *
 * @returns { programs, source } — source는 "api" 또는 "fallback"
 */
export async function loadPrograms(): Promise<{
  programs: SupportProgram[];
  source: "supabase" | "api" | "fallback";
}> {
  // 1️⃣ Supabase 시도
  if (isSupabaseConfigured) {
    try {
      const sb = getSupabase()!;
      const { data, error } = await sb
        .from("support_programs")
        .select("*")
        .order("application_end", { ascending: true });

      if (!error && data && data.length > 0) {
        const rows = data as unknown as ProgramRow[];
        const dbPrograms: SupportProgram[] = rows.map((row) => ({
          id: row.slug,
          title: row.title,
          summary: row.summary,
          description: row.description || undefined,
          region: row.region,
          organization: row.organization,
          supportType: row.support_type as SupportProgram["supportType"],
          supportAmount: row.support_amount,
          eligibilityAgeMin: row.eligibility_age_min,
          eligibilityAgeMax: row.eligibility_age_max,
          eligibilityDetail: row.eligibility_detail,
          applicationStart: row.application_start,
          applicationEnd: row.application_end,
          status: deriveStatus(row.application_start, row.application_end),
          relatedCrops: row.related_crops ?? [],
          sourceUrl: row.source_url,
          linkStatus: (row.link_status ?? undefined) as SupportProgram["linkStatus"],
          year: row.year,
          createdAt: row.created_at,
        }));
        // 정적 데이터 중 Supabase에 없는 항목 병합
        const dbIds = new Set(dbPrograms.map((p) => p.id));
        const staticOnly = PROGRAMS
          .filter((p) => !dbIds.has(p.id))
          .map((p) => ({ ...p, status: deriveStatus(p.applicationStart, p.applicationEnd) }));
        const programs = [...dbPrograms, ...staticOnly];
        return { programs, source: "supabase" };
      }
    } catch {
      // Supabase 에러 → 다음 소스로
    }
  }

  // 2️⃣ RDA API 시도
  const apiData = await fetchPolicies({ pageSize: 100 });
  if (apiData && apiData.length > 0) {
    const programs = apiData.map(mapRdaPolicy);
    return { programs, source: "api" };
  }

  // 3️⃣ 정적 폴백 — 하드코딩 status 대신 날짜 기반으로 재계산
  const programs = PROGRAMS.map((p) => ({
    ...p,
    status: deriveStatus(p.applicationStart, p.applicationEnd),
  }));
  return { programs, source: "fallback" };
}

/**
 * async 버전: API 데이터로 필터링
 * - 서버 컴포넌트에서 사용
 */
export async function filterProgramsAsync(
  filters: ProgramFilters
): Promise<{ programs: SupportProgram[]; source: "supabase" | "api" | "fallback" }> {
  const { programs: allPrograms, source } = await loadPrograms();

  // 조회 시점 기간 계산
  let periodStart: string | null = null;
  let periodEnd: string | null = null;
  if (filters.period && /^\d{4}-\d{2}$/.test(filters.period)) {
    const [y, m] = filters.period.split("-").map(Number);
    periodStart = `${y}-${String(m).padStart(2, "0")}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    periodEnd = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  const filtered = allPrograms.filter((program) => {
    // 원문 링크 깨진 항목은 목록에서 숨김
    if (program.linkStatus === "broken") return false;

    // 마감 제외 (includeClosed가 false이면 마감 숨김)
    if (!filters.includeClosed && program.status === "마감") return false;

    // 조회 시점 필터 (includeClosed가 true이면 기간 필터 스킵)
    // 모집중·모집예정은 기간 필터와 무관하게 항상 표시
    if (!filters.includeClosed && periodStart && periodEnd) {
      if (program.status !== "모집중" && program.status !== "모집예정") {
        if (
          program.applicationStart > periodEnd ||
          program.applicationEnd < periodStart
        ) {
          return false;
        }
      }
    }
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const searchable = [
        program.title,
        program.summary,
        program.region,
        program.organization,
        ...program.relatedCrops,
      ]
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(q)) return false;
    }
    if (filters.region && filters.region !== "전체") {
      if (program.region !== "전국" && program.region !== filters.region) return false;
    }
    if (filters.age) {
      const range = parseAgeRange(filters.age);
      if (range && (range.min > program.eligibilityAgeMax || range.max < program.eligibilityAgeMin)) return false;
    }
    if (filters.supportType && filters.supportType !== "전체") {
      if (program.supportType !== filters.supportType) return false;
    }
    if (filters.status && filters.status !== "전체") {
      if (program.status !== filters.status) return false;
    }
    return true;
  });

  return { programs: filtered, source };
}
