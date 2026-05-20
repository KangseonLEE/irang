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

/** 카테고리 — Sprint P P2-e (2026-05-20)
 *  치유농업·사회적 농업 같은 영역 태그. 일반 사업은 미설정(undefined).
 *  필터 chip(?category=healing|social) + 정렬·통계용. supportType과 직교.
 */
export type ProgramCategory = "healing" | "social";

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
  /** 카테고리 — 치유농업·사회적 농업 등 영역 태그 (optional) */
  category?: ProgramCategory;
}

/** 카테고리 필터 옵션 — FilterGroup paramKey="category" */
export const PROGRAM_CATEGORIES = ["healing", "social"] as const;

/** 카테고리 ID → 한글 라벨 매핑 (FilterGroup.optionLabels) */
export const PROGRAM_CATEGORY_LABELS: Record<ProgramCategory, string> = {
  healing: "치유농업",
  social: "사회적 농업",
};

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

/** 정적 원본 — status 없음. 외부에서는 PROGRAMS(status 주입됨)를 사용할 것 */
const PROGRAMS_RAW: Omit<SupportProgram, "status">[] = [
  {
    id: "SP-001",
    title: "귀농 농업창업 및 주택구입 지원사업",
    summary:
      "정착자의 농업창업자금과 농촌주택 구입자금을 저금리 융자로 지원하는 농식품부 대표 정착사업.",
    description:
      "농업창업자금 최대 3억원, 주택구입자금 최대 7,500만원을 연 2% 이내 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주로서 영농교육 100시간 이상 이수가 필요하며, 각 시군 농업기술센터를 통해 매년 초 접수해요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요.",
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
      "독립경영 1년차 월 110만원부터 3년차 월 90만원까지 최대 3년간 정착지원금을 받을 수 있어요. 만 18~39세 청년으로 영농경력 3년 이하이며 해당 지자체에 실거주해야 해요. 연간 약 2,000명을 선발하며, 매년 11~12월경 다음 해 대상자를 모집해요. 청년 정착자의 초기 생활 안정에 실질적으로 도움이 되는 핵심 사업이에요.",
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
      "6개월 과정으로 이론교육, 시설 실습, 선도농가 현장실습을 체계적으로 이수해요. 수강료 전액 지원에 현장실습 훈련비 월 최대 100만원까지 지급돼요. 딸기·토마토·파프리카 등 시설원예 중심의 스마트팜 기술을 익힐 수 있으며, 충남 거주 또는 전입 예정 만 18~44세 청년이 대상이에요.",
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
      "전북 청년창업보육센터 수료(예정)자로서 완주군에 주민등록을 이전하고 사업부지를 확보한 만 18~44세 청년이 신청할 수 있어요. 스마트팜 시설 설치비를 보조금으로 지원받되, 자기부담금 1억 3,200만원 이상이 필요해요. 보육센터 교육과 연계된 패키지형 지원으로 창업 실행력을 높이는 것이 특징이에요.",
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
    relatedCrops: [],
    sourceUrl: "https://www.wanjuro.org/post/3168",
    year: 2026,
  },
  {
    id: "SP-005",
    title: "함평군 귀농어귀촌 체류형 지원센터 입교 (제6기)",
    summary:
      "함평군에서 농촌 정착 희망자에게 주거공간·공동실습농지·시설하우스를 제공하는 체류형 교육.",
    description:
      "21세대 규모의 체류형 주거공간과 공동실습농지, 시설하우스, 작업장을 무상으로 이용할 수 있어요. 도시에서 1년 이상 거주한 만 65세 이하 농촌 정착 희망자가 대상이며, 함평군 전입 6개월 이내이거나 이주 예정인 예비정착자도 신청 가능해요. 실제 농촌에서 생활하며 영농기술을 익힐 수 있는 체류형 프로그램이에요.",
    region: "전라남도",
    organization: "함평군 귀농어귀촌 체류형 지원센터",
    supportType: "현물",
    supportAmount: "주거공간 제공 + 공동실습농지·시설하우스·작업장 이용 (21세대)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "만 65세 이하. 도시지역 1년 이상 거주 후 함평군 전입 6개월 이내 또는 이주 희망 예비정착자.",
    applicationStart: "2026-01-10",
    applicationEnd: "2026-02-10",
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
      "금산군 특화작목인 인삼과 약초를 중심으로 1년간 체류하며 영농교육을 받아요. 76㎡ 2세대, 69.4㎡ 1세대 등 총 3세대만 선발하므로 경쟁률이 높아요. 체류 주택이 무상 제공되며, 금산 지역 특산물 재배 노하우를 현장에서 직접 배울 수 있는 것이 강점이에요.",
    region: "충청남도",
    organization: "금산군귀농교육센터",
    supportType: "현물",
    supportAmount: "체류형 주택 제공 (76㎡ 2세대, 69.4㎡ 1세대, 총 3세대 선발)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 정착 희망자. 1년간 체류하며 영농 교육 참여.",
    applicationStart: "2026-01-15",
    applicationEnd: "2026-02-10",
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
      "약 10개월간 무안군 내 체류형 주거를 무상으로 제공받으며 영농 이론과 실습 교육을 병행해요. 귀농 전 장기 체류를 통해 지역 환경과 농업 여건을 충분히 파악할 수 있어요. 주거비 부담 없이 안정적으로 정착 준비를 할 수 있어 초기 정착 실패 위험을 줄여줍니다.",
    region: "전라남도",
    organization: "무안군",
    supportType: "현물",
    supportAmount: "약 10개월간 체류 주거 제공 + 영농 이론·실습 교육",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 정착 희망자. 10개월간 체류하며 영농 이론 및 실습 교육.",
    applicationStart: "2026-01-10",
    applicationEnd: "2026-02-06",
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
      "연수생에게 월 80만원 교육훈련비, 선도농가에게 월 40만원 교수수당을 지급하는 실습형 교육이에요. 최근 5년 이내 연천군으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년이 대상이며, 교육기간은 2026년 6~10월이에요. 숙련 농가에서 직접 기술을 전수받는 현장 중심 교육으로 실전 역량을 키울 수 있어요.",
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
      "3개월간 영월군에 체류하며 주거, 영농실습, 지역 주민 교류를 경험해요. 5명만 선발하는 소규모 프로그램으로 밀착 지원이 가능하며, 주요 작물 재배기술을 현장에서 습득해요. 정착 전 실제 농촌 생활을 미리 체험해볼 수 있어 정착 여부를 신중하게 판단하는 데 도움이 돼요.",
    region: "강원도",
    organization: "영월군 / 요선농촌체험휴양마을",
    supportType: "현물",
    supportAmount: "3개월 체류 지원 (주거+영농실습+지역교류)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 정착 희망자. 3개월간 영월군에 체류하며 주요 작물 재배기술 습득. 5명 선발.",
    applicationStart: "2026-03-01",
    applicationEnd: "2026-03-31",
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
      "3개월간 영암군에 체류하며 농업 체험뿐 아니라 관광, 지역문화까지 폭넓게 경험할 수 있어요. 체류비용이 지원되어 경제적 부담 없이 참여할 수 있으며, 두 지역 살아보기 형태로 운영돼요. 귀농·귀촌 모두에 관심 있는 분들이 농촌 정착 가능성을 탐색하기에 적합한 프로그램이에요.",
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
      "입문(2개월), 교육형실습(6개월), 경영형실습(12개월) 총 20개월 과정을 국비 무료로 이수해요. 실습비 월 최대 70만원, 실습재료비 연 최대 360만원이 지원돼요. 만 18~39세 대한민국 국적자라면 전공 무관하게 지원 가능하며, 전국 4개 혁신밸리에서 딸기·토마토·파프리카 등 시설원예 중심 스마트팜 창업역량을 체계적으로 키울 수 있어요.",
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
      "후계농업경영인으로 선정된 지 5년 이상 경과한 영농 종사자가 대상이며, 최대 2억원을 연 1.5% 고정금리로 5년 거치 10년 상환 조건으로 융자받을 수 있어요. 전국 약 500명을 선발하며, 거주지 읍면동사무소를 통해 신청해요. 영농 규모 확대나 시설 현대화에 필요한 대규모 자금을 저리로 조달할 수 있는 사업이에요.",
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
      "3일간 총 14시간의 집중 교육으로 식물공장, 아쿠아포닉스, 디지털농업, 스마트팜 온실 구축 등 실용적인 내용을 다룹니다. 서울시 주민등록 거주자 40명을 선착순 모집하며 교육비는 전액 무료이에요. 현장 견학이 포함되어 있어 단기간에 스마트팜 전반을 체험하고 창업 가능성을 판단하기에 적합해요.",
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
      "귀농귀촌 희망자 또는 농촌 거주 1년 미만인 분이 무료로 1:1 현장 컨설팅을 받을 수 있는 상시 프로그램이에요. 각 지역 농업기술센터나 그린대로 플랫폼을 통해 수시로 신청하며, 경험 많은 선도농가가 직접 기술을 전수해요. 별도의 모집기간 없이 연중 이용 가능하여 귀농 초기 시행착오를 줄이는 데 효과적이에요.",
    region: "전국",
    organization: "농촌진흥청 / 각 시군 농업기술센터",
    supportType: "컨설팅",
    supportAmount: "무료 1:1 현장 컨설팅 + 선도농가 기술 전수",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농귀촌 희망자 및 농촌 거주 1년 미만. 각 지역 농업기술센터 또는 그린대로에서 신청.",
    applicationStart: "2026-01-01",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.rda.go.kr/young/content/content76.do",
    year: 2026,
  },
  {
    id: "SP-015",
    title: "삼척시 지역특화 임대형 스마트팜 청년농 입주자 모집",
    summary:
      "삼척 원덕읍 산양리에 조성된 임대형 스마트팜에 청년농 9개 팀(26명)을 모집. 딸기·오이·토마토 첨단 온실에서 최대 6년간 실습 중심 영농.",
    description:
      "삼척시가 원덕읍 산양리 일원에 조성한 지역특화 임대형 스마트팜에 9개 팀, 총 26명의 청년농을 선발해요. 팀별 2~3인으로 구성해서 신청하며 만 18세 이상 40세 미만 청년 중 스마트팜 청년창업 보육사업 수료자 또는 독립경영 3년 이하인 분이 대상이에요. 딸기, 오이, 토마토 등 작목별 첨단 온실에서 실습 중심으로 영농할 수 있고, 2026년 7월부터 입주해 기본 3년·최대 6년까지 임대 가능해요. 1년차에는 경작특례방식으로 임대료가 인하되어 초기 부담이 낮아요.",
    region: "강원도",
    organization: "삼척시농업기술센터 기술보급과 스마트팜팀",
    supportType: "현물",
    supportAmount: "임대형 스마트팜 시설 임대 (기본 3년, 최대 6년) — 1년차 경작특례 임대료 인하",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18세 이상 40세 미만. 스마트팜 청년창업 보육사업 수료(예정)생 또는 독립경영 3년 이하 청년농업인. 팀별 2~3인 구성.",
    applicationStart: "2026-04-24",
    applicationEnd: "2026-05-29",
    relatedCrops: ["딸기", "오이", "토마토"],
    sourceUrl: "https://www.ajunews.com/view/20260424142857765",
    year: 2026,
  },
  {
    id: "SP-016",
    title: "2026년 영광에서 살아보기 (군남면 초록이마을)",
    summary:
      "전남 외 도시민 5명을 선발해 영광 군남면 초록이마을에서 2개월간 농촌 생활을 체험. 벼·보리농사·텃밭·향토음식 등 귀농 실습 중심.",
    description:
      "영광군이 귀농·귀촌을 희망하는 도시민의 안정적인 농촌 정착을 돕기 위해 운영하는 살아보기 프로그램이에요. 군남면 초록이마을에서 5명을 선발해 5월 18일부터 7월 16일까지 2개월간 진행해요. 농촌이해 교육, 지역교류·탐색, 영농실습과 함께 벼·보리농사 체험, 텃밭 가꾸기, 지역 탐방, 향토음식 만들기 등 귀농에 꼭 필요한 현장 체험으로 구성되어 있어요. 전남 외 지역에 거주하는 도시민이 대상이고, 신청은 그린대로 플랫폼에서 받아요.",
    region: "전라남도",
    organization: "영광군 농업기술센터",
    supportType: "교육",
    supportAmount: "임시 숙소 제공 + 연수비 지급 (2개월간 농촌 체험 프로그램)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "전남 외 지역 거주 도시민. 그린대로 누리집에서 신청. 5명 선발.",
    applicationStart: "2026-04-15",
    applicationEnd: "2026-05-15",
    relatedCrops: ["벼", "보리"],
    sourceUrl: "https://www.koreaunionnews.com/2140922",
    year: 2026,
  },
  {
    id: "SP-017",
    title: "농촌에서 살아보기 (그린대로 통합 플랫폼)",
    summary:
      "전국 마을에서 1~8개월간 농촌 생활을 체험. 임시 숙소 제공 + 연수비 월 30만원 지급. 귀농 전 실제 체험으로 의사결정.",
    description:
      "농림축산식품부와 귀농귀촌종합센터가 운영하는 귀농귀촌 통합 플랫폼 '그린대로'에서 신청할 수 있는 상시 프로그램이에요. 전국 마을에서 최소 1개월부터 최장 8개월까지 본인이 원하는 기간만큼 농촌에 머물 수 있어요. 참여 기간 동안 임시 숙소가 제공되고, 프로그램을 이수하면 참가 연수비도 지급돼요. 귀촌 로망을 갖고 집부터 사기 전에 먼저 살아보고 결정할 수 있어, 시행착오를 크게 줄이는 데 효과적이에요. 그린대로 누리집에서 마을별 모집 공고를 확인하고 신청해요.",
    region: "전국",
    organization: "농림축산식품부 / 귀농귀촌종합센터",
    supportType: "현물",
    supportAmount: "임시 숙소 제공 + 연수비 월 최대 30만원 (1~8개월)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농귀촌 희망자. 마을별 자격 요건 상이. 그린대로 누리집에서 마을별 공고 확인.",
    applicationStart: "2026-01-01",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.greendaero.go.kr/svc/rfph/edc/live/front/program.do",
    year: 2026,
  },
  {
    id: "SP-018",
    title: "농지은행 농지임대수탁사업",
    summary:
      "농사를 짓지 못하게 된 농지를 농지은행이 위탁받아 농지가 필요한 농업인에게 임대 중개. 2026년부터 위탁수수료 전액 폐지로 부담 제로.",
    description:
      "한국농어촌공사가 운영하는 농지은행이 농사를 짓지 못하게 된 농지 소유주로부터 농지를 위탁받아, 농지가 필요한 농업인에게 임대로 연결해 주는 사업이에요. 정착자 입장에서는 농지를 매입하지 않고도 안정적으로 농지를 빌릴 수 있어 초기 자본 부담이 크게 줄어요. 2026년 1월 1일부터 농지 소유주(위탁자)에 대한 위탁수수료가 완전히 폐지되어 농지를 내놓는 부담도 사라졌어요. 농지은행 통합포털에서 농지 검색·매물 등록·임대 신청이 모두 가능하고, 콜센터 1577-7770에서도 상담받을 수 있어요.",
    region: "전국",
    organization: "한국농어촌공사 농지은행",
    supportType: "현물",
    supportAmount: "농지 임대 중개 (위탁수수료 2026년 완전 폐지)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농지가 필요한 농업인 또는 농촌 정착 예정자. 농지은행 통합포털(fbo.or.kr) 신청 또는 콜센터 1577-7770 상담.",
    applicationStart: "2026-01-01",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.fbo.or.kr/",
    year: 2026,
  },
  {
    id: "SP-020",
    title: "2026년 청년농업인 영농정착지원사업 2차 추가모집",
    summary:
      "1차 모집(2025-11-05~12-11) 완료. 2차 추가모집은 2026년 하반기 예정 — 정확한 일자는 농식품부 공고 시 확정.",
    description:
      "농림축산식품부의 청년농업인 영농정착지원사업은 만 18세 이상 40세 미만, 독립경영 3년 이하 청년농을 대상으로 최장 3년간 월 최대 110만원의 정착지원금을 지급하는 핵심 사업이에요. 1차 모집은 2025년 11월 5일부터 12월 11일까지 진행돼 완료되었고, 2차 추가모집은 2026년 하반기 중 예산 범위에서 잔여 인원을 대상으로 진행할 예정이에요. 다만 정확한 모집 일자는 현재 미확정 상태이며, 농식품부 공고가 발표되어야 확정돼요. 선발되면 후계농자금, 농신보 우대보증, 농지 임대 우선지원 등 연계 혜택도 함께 받을 수 있어요. 농림사업정보시스템(uni.agrix.go.kr)과 농식품부 누리집을 주기적으로 확인하면 좋아요.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "월 최대 110만원 × 최장 3년 + 후계농자금·농신보 우대보증·농지 임대 우선지원 연계",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18세 이상 40세 미만(1985~2008년 출생), 독립 영농경력 3년 이하, 기준중위소득 140% 이하. 2차 추가모집은 2026년 하반기 예정 — 정확한 일자는 농식품부 공고 시 확정.",
    applicationStart: "9999-12-31",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.nongmin.com/article/20251104500065",
    year: 2026,
  },
  {
    id: "SP-021",
    title: "예산군 임대형 스마트팜 청년농업인 입주자 모집",
    summary:
      "충남 예산군이 2026년 하반기 준공 예정 임대형 스마트팜 2개소(역리 6팀·신양 4팀, 총 10팀)에 청년농 입주자를 9월 한 달간 모집해요.",
    description:
      "예산군농업기술센터가 2023년 충청남도 공모사업으로 선정·조성한 임대형 스마트팜 2개소(삽교읍 역리지구 6팀, 신양지구 4팀, 총 10팀) 입주 청년농을 모집해요. 팀별 2~3인으로 구성하며 만 18세 이상 40세 미만 청년농업인이 대상이에요. 신청은 2026년 9월 1일부터 9월 26일까지 4주간 진행되고, 신청서와 증빙자료를 농업기술센터 스마트농업과에 방문 제출하면 돼요. 임대 기간은 기본 3년이며 성과에 따라 최대 3년 더 연장 가능해요. 충남 권역 청년농 진입 장벽을 크게 낮춰 주는 사업이에요.",
    region: "충청남도",
    organization: "예산군농업기술센터 스마트농업과",
    supportType: "현물",
    supportAmount: "임대형 스마트팜 시설 임대 (2개소 총 10팀, 기본 3년 최대 6년)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18세 이상 40세 미만 청년농업인. 팀별 2~3인 구성. 신청서·증빙자료 농업기술센터 스마트농업과 방문 제출.",
    applicationStart: "2026-09-01",
    applicationEnd: "2026-09-26",
    relatedCrops: [],
    sourceUrl: "https://www.dominilbo.com/news/articleView.html?idxno=245110",
    year: 2026,
  },
  {
    id: "SP-022",
    title: "2026년 청년농업인 아이디어 사업화 공모사업",
    summary:
      "농촌진흥청이 청년농의 창의적 아이디어를 R&D 융복합으로 사업화하는 도단위 자율 공모. 시·도별 별도 공고로 진행돼요.",
    description:
      "농촌진흥청이 청년농업인의 창의적 아이디어를 농산물 고부가가치화로 연결하는 도단위 자율 공모사업이에요. 신기술과 청년 창업 아이디어를 융복합해 사업화하는 R&D 기반 지원이에요. 시·도별로 별도 공고가 진행되므로 본인이 거주하는 도(道) 농업기술원의 별도 공고를 확인해야 해요. 영농정착자금(SP-020)과는 명확히 다른 사업으로, 자금 지원이 아닌 R&D·창업 기반 매칭형 사업이에요. 정확한 모집 일자와 자금 규모는 시·도별 공고 발표 시 확정돼요.",
    region: "전국",
    organization: "농촌진흥청",
    supportType: "컨설팅",
    supportAmount: "도단위 자율 공모 (R&D 사업화 기반, 자금 규모 시·도 공고 시 확정)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "청년농업인 (도단위 별도 자격 적용). 시·도 농업기술원 공고 확인 필수.",
    applicationStart: "9999-12-31",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.rda.go.kr/young/custom/policy/view.do?sId=46438",
    year: 2026,
  },
  {
    id: "SP-023",
    title: "2026년 후계농업경영인 사업대상자 선발",
    summary:
      "만 18~49세 영농 10년 미만 농업인을 대상으로 농지·시설 자금 최대 5억원을 1.5% 저금리로 융자해 주는 농식품부 핵심 후계농 양성 사업.",
    description:
      "농림축산식품부의 후계농업경영인 사업은 만 18세 이상 49세 이하, 영농 종사 경력 10년 미만의 후계농을 대상으로 농지·시설 등 영농기반 마련 자금을 세대당 최대 5억원, 연 1.5% 저금리로 융자해 주는 핵심 양성사업이에요. 5년 거치 20년 분할 상환 조건으로 초기 자본 부담이 매우 낮아요. 농업e지(www.agriedu.net) 시스템을 통해서만 신청할 수 있고, 시·군 농업기술센터에서 접수와 심사를 진행해요. 우수후계농(SP-013) 대상이 되기 전 단계의 일반 후계농 선발 사업으로, 가족 정착·청년 본업 농가의 핵심 진입로예요. 상반기 선발은 1~2월에 종료되었고 시·군별 추가 모집 일정은 별도 공고를 확인하면 돼요.",
    region: "전국",
    organization: "농림축산식품부 / 각 시군 농업기술센터",
    supportType: "융자",
    supportAmount: "세대당 최대 5억원, 연 1.5% (5년 거치 20년 분할 상환)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 49,
    eligibilityDetail:
      "만 18세 이상 49세 이하, 영농 종사 경력 10년 미만. 농업e지(www.agriedu.net)를 통해서만 신청. 상반기 선발은 1~2월 종료, 시·군별 추가 모집 별도 공고.",
    applicationStart: "2026-01-12",
    applicationEnd: "2026-02-11",
    relatedCrops: [],
    sourceUrl: "https://agro.seoul.go.kr/archives/55168",
    year: 2026,
  },
  {
    id: "SP-024",
    title: "고성군 귀농인의 집 입주자 모집 (7~8월 입주)",
    summary:
      "경남 고성군이 7월·8월 입주 귀농인의 집 3개소 입주자를 5월 22일까지 모집. 6개월~1년 거주하며 정착 준비.",
    description:
      "경상남도 고성군농업기술센터가 운영하는 귀농인의 집 3개소(7월 입주 2개소·8월 입주 1개소)에 입주자를 모집해요. 신청은 5월 22일까지 받고, 입주 기간은 6개월부터 최대 1년까지 거주하며 지역을 직접 탐색하고 정착을 준비할 수 있어요. 가족 단위 정착 또는 노년 귀촌 페르소나에 적합한 체류형 사업이에요. 임시 주거지를 제공받아 본격 귀농 전 지역·작물·이웃을 충분히 파악할 수 있어 시행착오를 줄여줘요. 경남 권역에 추가된 첫 케이스로, 그동안 부족했던 경남 정보 보강에 큰 도움이 돼요.",
    region: "경상남도",
    organization: "고성군농업기술센터",
    supportType: "현물",
    supportAmount: "임시 주거지 제공 (3개소, 6개월~1년 거주 가능)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 정착 희망 도시민. 7월 입주 2개소·8월 입주 1개소. 신청 마감 2026-05-22. 고성군농업기술센터 신청.",
    applicationStart: "2026-05-01",
    applicationEnd: "2026-05-22",
    relatedCrops: [],
    sourceUrl: "https://www.gnnnews.kr/168675",
    year: 2026,
  },
  {
    id: "SP-025",
    title: "논산시 귀농인의 집 입주자 모집 (상월면 상도리)",
    summary:
      "충남 논산시가 상월면 상도리 리모델링 귀농인의 집 입주자를 7월 18일부터 8월 1일까지 모집. 보증금 100만원 + 월세 20만원 1년 거주.",
    description:
      "충청남도 논산시 농업기술센터가 상월면 상도리에 리모델링한 귀농인의 집 입주자를 모집해요. 모집 기간은 2026년 7월 18일부터 8월 1일까지이며, 입주자는 계약일로부터 1년간 거주할 수 있어요. 보증금 100만원 + 월세 20만원의 부담 적은 조건으로, 도시민이 일정 기간 농촌에 체류하며 지역 환경을 직접 체험하고 정착을 준비하기에 좋아요. 충남 권역 가족·반귀농 페르소나에 적합한 체류형 사업이에요. 논산시청 공식 페이지 URL은 추후 확보 시 교체 예정이고, 현재는 굿모닝충청 공식 보도 기사를 출처로 명시해요.",
    region: "충청남도",
    organization: "논산시 농업기술센터",
    supportType: "현물",
    supportAmount: "임시 주거지 제공 (보증금 100만원 + 월세 20만원, 1년 거주)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 정착 희망 도시민. 상월면 상도리 리모델링 주거지 1동. 논산시 농업기술센터 신청.",
    applicationStart: "2026-07-18",
    applicationEnd: "2026-08-01",
    relatedCrops: [],
    sourceUrl: "https://www.goodmorningcc.com/news/articleView.html?idxno=426265",
    year: 2026,
  },
  {
    id: "SP-026",
    title: "제주 신규농업인 현장실습 연수생·선도농가 모집",
    summary:
      "제주농업기술센터가 신규농업인 3명·선도농가 3명을 매칭해 1:1 현장실습. 연수생 월 80만원·선도농가 월 40만원 지원. 5월 25일까지 신청.",
    description:
      "제주특별자치도 농업기술원이 신규·청년농업인의 안정적인 영농 정착을 위해 운영하는 현장실습 매칭 사업이에요. 영농 경험이 부족한 신규농업인 3명과 선도농가 3명을 1:1로 연결해 재배기술·품질관리·경영·창업 단계까지 실습 중심으로 교육해요. 연수생에게 월 최대 80만원, 선도농가에게 월 최대 40만원의 교육비가 지원돼요. 신청은 5월 5일 오전 9시부터 25일 오후 6시까지 제주농업기술센터(제주시 애월읍 상귀리 173, 2층) 방문 접수로 받아요. 제주 권역에 추가된 첫 케이스로, 청년·균형형 페르소나 양쪽에 적합해요. 서류심사와 현지심사를 거쳐 최종 선정해요.",
    region: "제주특별자치도",
    organization: "제주특별자치도 농업기술원",
    supportType: "교육",
    supportAmount: "연수생 월 최대 80만원 + 선도농가 월 최대 40만원 (1:1 매칭 현장실습)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "신규농업인 3명·선도농가 3명. 신청 5월 5일~25일 (방문 접수). 제주농업기술센터(제주시 애월읍 상귀리 173, 2층).",
    applicationStart: "2026-05-05",
    applicationEnd: "2026-05-25",
    relatedCrops: [],
    sourceUrl: "https://www.koreatimenews.com/news/article.html?no=1064324",
    year: 2026,
  },
  // ─────────────────────────────────────────────────────────
  // Sprint K (2026-05-20) — 치유·사회적 농업 카탈로그 확장
  // 출처 ★★★: 농촌진흥청 · 농식품부 · 한국농업기술진흥원 · 서울시농업기술센터 공식 보도/공고
  // 가드 적용 (5/11 박제): #1 본문 무결성 / #2 중복 검색 0건 / #3 미발표 9999 페어
  // ─────────────────────────────────────────────────────────
  {
    id: "SP-027",
    title: "1급 치유농업사 양성과정 (서울시농업기술센터, 2026)",
    summary:
      "서울시농업기술센터가 운영하는 124시간 1급 치유농업사 양성과정. 모집 3월 9일~13일, 교육 4월 15일~6월 10일, 자기부담 120만원.",
    description:
      "서울시농업기술센터가 농촌진흥청 인증 양성기관으로 운영하는 1급 치유농업사 양성과정이에요. 총 124시간(이론 50시간·실습 74시간)으로, 2026년 1기는 4월 15일부터 6월 10일까지 매주 수·목 09:00~18:00 진행해요. 모집은 2026년 3월 9일 09:00부터 3월 13일 18:00까지 서울시 공공서비스예약 시스템에서 받아요. 정원 40명, 자기부담금 120만원(교재·재료·견학비 포함)이에요. 신청 대상은 주민등록상 만 18세 이상 서울·경기·강원·인천 거주자예요. 1급 자격시험 응시 자격을 충족시키는 양성과정이며, 치유농업·사회적 농업 페르소나에게 적합해요.",
    region: "서울특별시",
    organization: "서울시농업기술센터",
    supportType: "교육",
    supportAmount: "교육과정 운영 (자기부담금 120만원, 124시간)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "주민등록상 만 18세 이상 서울·경기·강원·인천 거주자. 정원 40명. 서울시 공공서비스예약 시스템 신청.",
    applicationStart: "2026-03-09",
    applicationEnd: "2026-03-13",
    relatedCrops: [],
    sourceUrl: "https://agro.seoul.go.kr/archives/55528",
    year: 2026,
    category: "healing",
  },
  {
    id: "SP-028",
    title: "치유농업사 자격시험 (한국농업기술진흥원)",
    summary:
      "농촌진흥청 주관 치유농업사 국가자격시험. 2급은 양성기관 교육 이수자, 1급은 2급 취득 후 5년 경력. 한국농업기술진흥원이 시험 운영.",
    description:
      "농촌진흥청 주관, 한국농업기술진흥원이 시행하는 치유농업사 국가자격시험이에요. 2급은 농진청 인증 양성기관 교육과정을 이수한 사람이 응시할 수 있어요. 1급은 2급 자격 취득 후 5년 이상 관련 업무 경력 등을 충족해야 해요. 시험은 1차 선택형(2급 3과목·1급 4과목)과 2차 주관식으로 구성되며, 1차는 과목당 40점 이상·평균 60점 이상, 2차는 60점 이상이면 합격이에요. 2026년 구체적인 시험 일정은 한국농업기술진흥원과 치유농업ON 포털에서 발표 시 확정되므로 미정으로 표기해요. 자격 취득 후 양성기관 강의, 치유농장 운영, 사회적 농업 프로그램 기획 등 다양한 경로로 활동할 수 있어요.",
    region: "전국",
    organization: "농촌진흥청 / 한국농업기술진흥원",
    supportType: "교육",
    supportAmount: "자격시험 운영 (응시료 별도, 양성기관 100~150만원)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "2급 — 농진청 인증 양성기관 교육과정 이수. 1급 — 2급 취득 후 5년 이상 관련 업무 경력. 한국농업기술진흥원 주관.",
    applicationStart: "9999-12-31",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.agrohealing.go.kr/sf/crfrmr/testGuid/retrieveTestGuid.do",
    year: 2026,
    category: "healing",
  },
  {
    id: "SP-029",
    title: "치유농업확산센터·치유농업센터 (광역거점)",
    summary:
      "농촌진흥청이 전국 광역단위 치유농업센터를 현재 13개소에서 2027년까지 17개소로 확대. 치유농업 연구·기술 보급·자격시험·인증제 운영의 중앙 거점.",
    description:
      "농촌진흥청이 광역단위로 운영하는 치유농업센터는 현재 경기·강원·충북·충남·전북·전남·경북·경남·제주 도 농업기술원과 서울·인천·광주·부산 특·광역시 농업기술센터 등 13개소예요. 2027년까지 17개소로 확대할 계획이에요. 중앙거점인 치유농업확산센터는 2025년 구축돼 치유농업 연구 성과 확산, 기술 보급, 치유농업사 자격시험과 인증제 운영, 사업화 지원 기능을 담당해요. 거주 지역의 광역 농업기술원·기술센터를 통해 치유농업 교육·체험·창업 컨설팅을 받을 수 있어요. 신청 시기는 센터별로 다르므로 거주지 센터에 직접 문의가 필요해요.",
    region: "전국",
    organization: "농촌진흥청 / 각 광역 농업기술원·농업기술센터",
    supportType: "컨설팅",
    supportAmount: "치유농업 교육·체험·창업 컨설팅 (센터별 차이)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "거주 광역 농업기술원·기술센터 이용. 13개 광역거점(2027년 17개소 확대 예정). 센터별 운영 일정 상이.",
    applicationStart: "9999-12-31",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.agrohealing.go.kr/sf/crfrmSprtInst/crfrmCnter/retrieveCrfrmCnter.do",
    year: 2026,
    category: "healing",
  },
  {
    id: "SP-030",
    title: "농촌돌봄서비스활성화지원사업 — 농촌돌봄농장 (2026 공모)",
    summary:
      "농식품부가 2026년 농촌돌봄농장 23개소 신규 모집(총 100개소 확대). 신청 12월 15일~31일, 2026년 1월 말 선정. 장애인·노약자 등 취약계층 대상 사회적 농업 프로그램 운영.",
    description:
      "농림축산식품부가 운영하는 농촌돌봄서비스활성화지원사업(舊 사회적농업 활성화 지원사업)의 농촌돌봄농장 부문이에요. 농촌 지역 복지시설이 부족한 곳에서 장애인·노약자 등 취약계층을 대상으로 농업활동을 통한 돌봄·교육·일자리를 제공하는 농장을 지원해요. 2026년에는 23개소를 신규 선정해 총 100개소로 확대해요. 신청은 매년 12월 15일부터 31일까지 받고, 서면·현장심사를 거쳐 1월 말 최종 선정해요. 2025년 10월 기준 97개소가 4,436명에게 돌봄 서비스를 제공해 전년 대비 10% 증가했어요. 사회적 농업·치유농업 페르소나에게 적합한 사업이에요.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "농촌돌봄농장 운영비 지원 (단가는 농식품부 시행지침 발표 시 확정)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "농촌 지역 사회적 농업 운영 의지가 있는 농가·법인. 장애인·노약자 등 취약계층 돌봄 프로그램 운영 가능. 매년 12월 15~31일 신청.",
    applicationStart: "2026-12-15",
    applicationEnd: "2026-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.nocutnews.co.kr/news/6441539",
    year: 2026,
    category: "social",
  },
  {
    id: "SP-031",
    title: "농촌돌봄서비스활성화지원사업 — 농촌주민생활돌봄공동체 (2026 공모)",
    summary:
      "농식품부가 2026년 농촌주민생활돌봄공동체 27개소 신규 모집(총 65개소 확대). 신청 12월 15일~31일, 2026년 1월 말 선정. 반찬배달·교통편의·소규모 집수리 등 생활서비스 제공.",
    description:
      "농림축산식품부가 운영하는 농촌돌봄서비스활성화지원사업의 주민생활돌봄공동체 부문이에요. 사회복지 인프라가 부족한 농촌 지역에서 반찬배달·교통편의·소규모 집수리 등 일상생활 서비스를 주민 공동체가 직접 제공해요. 2026년에는 27개소를 신규 선정해 총 65개소로 확대해요. 신청은 매년 12월 15일부터 31일까지 받고, 서면·현장심사를 거쳐 1월 말 최종 선정해요. 2025년 10월 기준 40개소가 39,864명에게 4,683건의 생활서비스를 제공해 전년 대비 46% 증가했어요. 농촌 정착 후 지역공동체 활동에 관심 있는 분에게 적합해요.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "주민생활돌봄공동체 운영비 지원 (단가는 농식품부 시행지침 발표 시 확정)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "농촌 지역 주민 공동체. 반찬배달·교통편의·소규모 집수리 등 생활서비스 제공 의지. 매년 12월 15~31일 신청.",
    applicationStart: "2026-12-15",
    applicationEnd: "2026-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.foodtoday.or.kr/news/article.html?no=200816",
    year: 2026,
    category: "social",
  },
];

/** 정적 데이터에 런타임 status를 주입한 배열 — 외부에서 사용하는 공식 export */
export const PROGRAMS: SupportProgram[] = PROGRAMS_RAW.map((p) => ({
  ...p,
  status: deriveStatus(p.applicationStart, p.applicationEnd),
}));

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
  // 당해 연도 기준 1~12월
  const year = new Date().getFullYear();
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
  /** 카테고리 — "healing" | "social" (Sprint P P2-e) */
  category?: string;
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

    // 일자 미정 사업 default hide (2026-05-11)
    // applicationStart/End 모두 9999-12-31 = "공고 발표 예정"이라 사용자 가치 낮음.
    // includeClosed=true 시 정보 카테고리로 표시.
    if (
      !filters.includeClosed &&
      program.applicationStart === "9999-12-31" &&
      program.applicationEnd === "9999-12-31"
    ) {
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

    if (filters.category && filters.category !== "전체") {
      if (program.category !== filters.category) {
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
    if (filters.category && filters.category !== "전체") {
      if (program.category !== filters.category) return false;
    }
    if (filters.status && filters.status !== "전체") {
      if (program.status !== filters.status) return false;
    }
    return true;
  });

  return { programs: filtered, source };
}
