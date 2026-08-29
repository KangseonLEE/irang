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
import { groupCrawlRows, type CrawlGroupInfo } from "@/lib/crawl-grouping";

/** 카테고리 — Sprint P P2-e (2026-05-20) + Sprint Q 확장 (2026-05-20)
 *  성격 분류: 정착·창업 / 청년 / 시설·체류 / 치유농업 / 사회적 농업
 *  필터 chip(?category=settlement|youth|facility|healing|social) + 정렬·통계용. supportType과 직교.
 */
export type ProgramCategory =
  | "settlement"
  | "youth"
  | "facility"
  | "healing"
  | "social";

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
  /** 크롤 row 동일 모사업 그룹핑 결과 — 대표 카드에만 부착 (crawl-grouping.ts) */
  crawlGroup?: CrawlGroupInfo;
}

/** 카테고리 필터 옵션 — FilterGroup paramKey="category" */
export const PROGRAM_CATEGORIES = [
  "settlement",
  "youth",
  "facility",
  "healing",
  "social",
] as const;

/** 카테고리 ID → 한글 라벨 매핑 (FilterGroup.optionLabels) */
export const PROGRAM_CATEGORY_LABELS: Record<ProgramCategory, string> = {
  settlement: "정착·창업",
  youth: "청년 특화",
  facility: "시설·체류",
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
      "농업창업자금 최대 3억원, 주택구입자금 최대 7,500만 원을 연 2% 이내 저금리로 융자받을 수 있어요. 농촌 전입 후 6년 이내 세대주로서 영농교육 100시간 이상 이수가 필요하며, 각 시군 농업기술센터를 통해 매년 초 접수해요. 귀농 초기 정착비용 부담을 크게 줄여주는 대표적인 정부 지원사업이에요.",
    region: "전국",
    organization: "농림축산식품부 / 각 시군 농업기술센터",
    supportType: "융자",
    supportAmount: "농업창업 최대 3억원 / 주택구입 최대 7,500만 원 (5년 거치 10년 상환)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌지역 전입일로부터 만 6년 미경과 세대주. 영농 관련 교육 100시간 이상 이수.",
    applicationStart: "2026-01-12",
    applicationEnd: "2026-02-13",
    relatedCrops: [],
    sourceUrl: "https://www.gunsan.go.kr/farm/m2435/view/8495763",
    year: 2026,
    category: "settlement",
  },
  {
    id: "SP-002",
    title: "청년농업인 영농정착지원사업 (청년창업형 후계농업경영인)",
    summary:
      "만 39세 이하 청년농업인에게 독립경영 초기 3년간 월 정착지원금을 지급하는 보조금 사업.",
    description:
      "독립경영 1년차 월 110만 원부터 3년차 월 90만 원까지 최대 3년간 정착지원금을 받을 수 있어요. 만 18~39세 청년으로 영농경력 3년 이하이며 해당 지자체에 실거주해야 해요. 연간 약 2,000명을 선발하며, 매년 11~12월경 다음 해 대상자를 모집해요. 청년 정착자의 초기 생활 안정에 실질적으로 도움이 되는 핵심 사업이에요.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "독립경영 1년차 월 110만 원, 2년차 월 100만 원, 3년차 월 90만 원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18~39세. 총 영농경력 3년 이하. 신청 지자체 실거주 및 주민등록. 연간 약 2,000명 선발.",
    applicationStart: "2025-11-05",
    applicationEnd: "2025-12-11",
    relatedCrops: [],
    sourceUrl: "https://agro.seoul.go.kr/archives/54938",
    year: 2026,
    category: "youth",
  },
  {
    id: "SP-003",
    title: "충남 스마트팜 청년창업 교육 및 창업지원 (제8기)",
    summary:
      "충남 청년농업인 대상 6개월 스마트팜 교육과정(이론+실습+현장)으로 창업역량을 지원.",
    description:
      "6개월 과정으로 이론교육, 시설 실습, 선도농가 현장실습을 체계적으로 이수해요. 수강료 전액 지원에 현장실습 훈련비 월 최대 100만 원까지 지급돼요. 딸기·토마토·파프리카 등 시설원예 중심의 스마트팜 기술을 익힐 수 있으며, 충남 거주 또는 전입 예정 만 18~44세 청년이 대상이에요.",
    region: "충청남도",
    organization: "충청남도농업기술원",
    supportType: "교육",
    supportAmount: "교육 수강료 전액 지원 + 현장실습 훈련비 월 최대 100만 원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 44,
    eligibilityDetail:
      "충남도내 청년농업인 또는 충남 전입 예정자. 6개월 과정(이론+실습+현장).",
    applicationStart: "2025-12-29",
    applicationEnd: "2026-01-02",
    relatedCrops: ["딸기", "토마토", "파프리카"],
    sourceUrl: "https://youth.chungnam.go.kr/web/main/bbs/cnyouth_notice/497",
    year: 2026,
    category: "youth",
  },
  {
    id: "SP-004",
    title: "완주군 청년창업 스마트팜 패키지 지원사업",
    summary:
      "전북 완주군 청년농업인에게 스마트팜 시설 설치비를 보조금으로 지원하는 패키지 사업.",
    description:
      "전북 청년창업보육센터 수료(예정)자로서 완주군에 주민등록을 이전하고 사업부지를 확보한 만 18~44세 청년이 신청할 수 있어요. 스마트팜 시설 설치비를 보조금으로 지원받되, 자기부담금 1억 3,200만 원 이상이 필요해요. 보육센터 교육과 연계된 패키지형 지원으로 창업 실행력을 높이는 것이 특징이에요.",
    region: "전라북도",
    organization: "완주군농업기술센터 기술보급과",
    supportType: "보조금",
    supportAmount: "스마트팜 시설 설치비 지원 (자기부담 132백만 원 이상)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 44,
    eligibilityDetail:
      "만 18~45세 미만 청년농업인. 전북 청년창업보육센터 수료(예정)자. 완주군 주민등록 이전 완료. 사업부지 확보.",
    applicationStart: "2025-09-01",
    applicationEnd: "2025-09-26",
    relatedCrops: [],
    sourceUrl: "https://www.wanjuro.org/post/3168",
    year: 2026,
    category: "youth",
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
    category: "facility",
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
    relatedCrops: ["인삼", "도라지", "더덕"],
    sourceUrl: "http://www.daejeontoday.com/news/articleView.html?idxno=722515",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-007",
    title: "무안군 체류형 귀농인의 집",
    summary:
      "무안군에서 약 10개월간 체류 주거를 제공하며 영농 이론 및 실습 교육을 지원하는 프로그램.",
    description:
      "약 10개월간 무안군 내 체류형 주거를 무상으로 제공받으며 영농 이론과 실습 교육을 병행해요. 귀농 전 장기 체류를 통해 지역 환경과 농업 여건을 충분히 파악할 수 있어요. 주거비 부담 없이 안정적으로 정착 준비를 할 수 있어 초기 정착 실패 위험을 줄여줘요.",
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
    category: "facility",
  },
  {
    id: "SP-008",
    title: "연천군 신규농업인 선도농가 현장실습 교육",
    summary:
      "연천군 귀농귀촌인 대상 선도농가 현장실습 교육으로 월 80만 원 교육훈련비를 지급.",
    description:
      "연수생에게 월 80만 원 교육훈련비, 선도농가에게 월 40만 원 교수수당을 지급하는 실습형 교육이에요. 최근 5년 이내 연천군으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년이 대상이며, 교육기간은 2026년 6~10월이에요. 숙련 농가에서 직접 기술을 전수받는 현장 중심 교육으로 실전 역량을 키울 수 있어요.",
    region: "경기도",
    organization: "연천군 농업기술센터",
    supportType: "교육",
    supportAmount: "연수생 월 80만 원 교육훈련비 + 선도농가 월 40만 원 교수수당",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "최근 5년 이내 해당 지역 농촌으로 이주한 귀농귀촌인 또는 만 40세 미만 청장년. 교육기간 2026.6~10월.",
    applicationStart: "2026-04-01",
    applicationEnd: "2026-04-17",
    relatedCrops: [],
    sourceUrl: "https://www.post24.kr/319532",
    year: 2026,
    category: "facility",
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
    category: "facility",
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
    category: "facility",
  },
  {
    id: "SP-012",
    title: "스마트팜 청년창업 보육센터 교육생 모집 (9기)",
    summary:
      "스마트팜 혁신밸리 4개소(전북 김제·전남 고흥·경북 상주·경남 밀양)에서 20개월간 입문→교육형실습→경영형실습 과정을 운영하는 국비 무료 장기 교육.",
    description:
      "입문(2개월), 교육형실습(6개월), 경영형실습(12개월) 총 20개월 과정을 국비 무료로 이수해요. 실습비 월 최대 70만 원, 실습재료비 연 최대 360만 원이 지원돼요. 만 18~39세 대한민국 국적자라면 전공 무관하게 지원 가능하며, 전국 4개 혁신밸리에서 딸기·토마토·파프리카 등 시설원예 중심 스마트팜 창업역량을 체계적으로 키울 수 있어요.",
    region: "전국",
    organization: "한국농업기술진흥원 / 농림축산식품부",
    supportType: "교육",
    supportAmount: "교육비 무료 + 실습비 월 최대 70만 원 + 실습재료비 연 최대 360만 원",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18~39세 대한민국 국적. 전공 무관. 스마트팜 보육센터 기존 이수자 불가. 입문(2개월)→교육형실습(6개월)→경영형실습(12개월) 총 20개월 과정.",
    applicationStart: "2026-04-22",
    applicationEnd: "2026-05-29",
    relatedCrops: ["딸기", "토마토", "파프리카", "상추"],
    sourceUrl: "https://www.smartfarmkorea.net/edu/pnbsns/all.do?menuId=M01050701",
    year: 2026,
    category: "youth",
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
    category: "settlement",
  },
  {
    id: "SP-014",
    title: "서울 스마트팜 실용교육 (2026년 상반기)",
    summary:
      "서울시 농업기술센터 주관 3일(14시간) 교육. 식물공장·아쿠아포닉스·디지털농업·스마트팜 온실 구축 등 실용 과정과 현장 견학 포함. 무료.",
    description:
      "3일간 총 14시간의 집중 교육으로 식물공장, 아쿠아포닉스, 디지털농업, 스마트팜 온실 구축 등 실용적인 내용을 다뤄요. 서울시 주민등록 거주자 40명을 선착순 모집하며 교육비는 전액 무료이에요. 현장 견학이 포함되어 있어 단기간에 스마트팜 전반을 체험하고 창업 가능성을 판단하기에 적합해요.",
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
    category: "facility",
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
    category: "facility",
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
    category: "youth",
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
    relatedCrops: ["쌀"],
    sourceUrl: "https://www.koreaunionnews.com/2140922",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-017",
    title: "농촌에서 살아보기 (그린대로 통합 플랫폼)",
    summary:
      "전국 마을에서 1~8개월간 농촌 생활을 체험. 임시 숙소 제공 + 연수비 월 30만 원 지급. 귀농 전 실제 체험으로 의사결정.",
    description:
      "농림축산식품부와 귀농귀촌종합센터가 운영하는 귀농귀촌 통합 플랫폼 '그린대로'에서 신청할 수 있는 상시 프로그램이에요. 전국 마을에서 최소 1개월부터 최장 8개월까지 본인이 원하는 기간만큼 농촌에 머물 수 있어요. 참여 기간 동안 임시 숙소가 제공되고, 프로그램을 이수하면 참가 연수비도 지급돼요. 귀촌 로망을 갖고 집부터 사기 전에 먼저 살아보고 결정할 수 있어, 시행착오를 크게 줄이는 데 효과적이에요. 그린대로 누리집에서 마을별 모집 공고를 확인하고 신청해요.",
    region: "전국",
    organization: "농림축산식품부 / 귀농귀촌종합센터",
    supportType: "현물",
    supportAmount: "임시 숙소 제공 + 연수비 월 최대 30만 원 (1~8개월)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "귀농귀촌 희망자. 마을별 자격 요건 상이. 그린대로 누리집에서 마을별 공고 확인.",
    applicationStart: "2026-01-01",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.greendaero.go.kr/svc/rfph/edc/live/front/program.do",
    year: 2026,
    category: "facility",
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
    category: "settlement",
  },
  {
    id: "SP-020",
    title: "2026년 청년농업인 영농정착지원사업 2차 추가모집",
    summary:
      "1차 모집(2025-11-05~12-11) 완료. 2차 추가모집은 2026년 하반기 예정 — 정확한 일자는 농식품부 공고 시 확정.",
    description:
      "농림축산식품부의 청년농업인 영농정착지원사업은 만 18세 이상 40세 미만, 독립경영 3년 이하 청년농을 대상으로 최장 3년간 월 최대 110만 원의 정착지원금을 지급하는 핵심 사업이에요. 1차 모집은 2025년 11월 5일부터 12월 11일까지 진행돼 완료되었고, 2차 추가모집은 2026년 하반기 중 예산 범위에서 잔여 인원을 대상으로 진행할 예정이에요. 다만 정확한 모집 일자는 현재 미확정 상태이며, 농식품부 공고가 발표되어야 확정돼요. 선발되면 후계농자금, 농신보 우대보증, 농지 임대 우선지원 등 연계 혜택도 함께 받을 수 있어요. 농림사업정보시스템(uni.agrix.go.kr)과 농식품부 누리집을 주기적으로 확인하면 좋아요.",
    region: "전국",
    organization: "농림축산식품부",
    supportType: "보조금",
    supportAmount: "월 최대 110만 원 × 최장 3년 + 후계농자금·농신보 우대보증·농지 임대 우선지원 연계",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 39,
    eligibilityDetail:
      "만 18세 이상 40세 미만(1985~2008년 출생), 독립 영농경력 3년 이하, 기준중위소득 140% 이하. 2차 추가모집은 2026년 하반기 예정 — 정확한 일자는 농식품부 공고 시 확정.",
    applicationStart: "9999-12-31",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.nongmin.com/article/20251104500065",
    year: 2026,
    category: "youth",
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
    category: "youth",
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
    category: "youth",
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
    category: "settlement",
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
    category: "facility",
  },
  {
    id: "SP-025",
    title: "논산시 귀농인의 집 입주자 모집 (상월면 상도리)",
    summary:
      "충남 논산시가 상월면 상도리 리모델링 귀농인의 집 입주자를 7월 18일부터 8월 1일까지 모집. 보증금 100만 원 + 월세 20만 원 1년 거주.",
    description:
      "충청남도 논산시 농업기술센터가 상월면 상도리에 리모델링한 귀농인의 집 입주자를 모집해요. 모집 기간은 2026년 7월 18일부터 8월 1일까지이며, 입주자는 계약일로부터 1년간 거주할 수 있어요. 보증금 100만 원 + 월세 20만 원의 부담 적은 조건으로, 도시민이 일정 기간 농촌에 체류하며 지역 환경을 직접 체험하고 정착을 준비하기에 좋아요. 충남 권역 가족·반귀농 페르소나에 적합한 체류형 사업이에요. 논산시청 공식 페이지 URL은 추후 확보 시 교체 예정이고, 현재는 굿모닝충청 공식 보도 기사를 출처로 명시해요.",
    region: "충청남도",
    organization: "논산시 농업기술센터",
    supportType: "현물",
    supportAmount: "임시 주거지 제공 (보증금 100만 원 + 월세 20만 원, 1년 거주)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 정착 희망 도시민. 상월면 상도리 리모델링 주거지 1동. 논산시 농업기술센터 신청.",
    applicationStart: "2026-07-18",
    applicationEnd: "2026-08-01",
    relatedCrops: [],
    sourceUrl: "https://www.goodmorningcc.com/news/articleView.html?idxno=426265",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-026",
    title: "제주 신규농업인 현장실습 연수생·선도농가 모집",
    summary:
      "제주농업기술센터가 신규농업인 3명·선도농가 3명을 매칭해 1:1 현장실습. 연수생 월 80만 원·선도농가 월 40만 원 지원. 5월 25일까지 신청.",
    description:
      "제주특별자치도 농업기술원이 신규·청년농업인의 안정적인 영농 정착을 위해 운영하는 현장실습 매칭 사업이에요. 영농 경험이 부족한 신규농업인 3명과 선도농가 3명을 1:1로 연결해 재배기술·품질관리·경영·창업 단계까지 실습 중심으로 교육해요. 연수생에게 월 최대 80만 원, 선도농가에게 월 최대 40만 원의 교육비가 지원돼요. 신청은 5월 5일 오전 9시부터 25일 오후 6시까지 제주농업기술센터(제주시 애월읍 상귀리 173, 2층) 방문 접수로 받아요. 제주 권역에 추가된 첫 케이스로, 청년·균형형 페르소나 양쪽에 적합해요. 서류심사와 현지심사를 거쳐 최종 선정해요.",
    region: "제주특별자치도",
    organization: "제주특별자치도 농업기술원",
    supportType: "교육",
    supportAmount: "연수생 월 최대 80만 원 + 선도농가 월 최대 40만 원 (1:1 매칭 현장실습)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "신규농업인 3명·선도농가 3명. 신청 5월 5일~25일 (방문 접수). 제주농업기술센터(제주시 애월읍 상귀리 173, 2층).",
    applicationStart: "2026-05-05",
    applicationEnd: "2026-05-25",
    relatedCrops: [],
    sourceUrl: "https://www.koreatimenews.com/news/article.html?no=1064324",
    year: 2026,
    category: "facility",
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
      "서울시농업기술센터가 운영하는 124시간 1급 치유농업사 양성과정. 모집 3월 9일~13일, 교육 4월 15일~6월 10일, 자기부담 120만 원.",
    description:
      "서울시농업기술센터가 농촌진흥청 인증 양성기관으로 운영하는 1급 치유농업사 양성과정이에요. 총 124시간(이론 50시간·실습 74시간)으로, 2026년 1기는 4월 15일부터 6월 10일까지 매주 수·목 09:00~18:00 진행해요. 모집은 2026년 3월 9일 09:00부터 3월 13일 18:00까지 서울시 공공서비스예약 시스템에서 받아요. 정원 40명, 자기부담금 120만 원(교재·재료·견학비 포함)이에요. 신청 대상은 주민등록상 만 18세 이상 서울·경기·강원·인천 거주자예요. 1급 자격시험 응시 자격을 충족시키는 양성과정이며, 치유농업·사회적 농업 페르소나에게 적합해요.",
    region: "서울특별시",
    organization: "서울시농업기술센터",
    supportType: "교육",
    supportAmount: "교육과정 운영 (자기부담금 120만 원, 124시간)",
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
    supportAmount: "자격시험 운영 (응시료 별도, 양성기관 100~150만 원)",
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
  {
    id: "SP-032",
    title: "홍천군 귀농인의 집 입주자 모집 (서석면 풍암2리)",
    summary:
      "강원 홍천군이 서석면 풍암2리 단독주택 1동의 귀농인의 집 입주자를 6월 24일까지 모집. 65세 이하 도시민, 임대 1년(협의 시 3개월 연장).",
    description:
      "강원도 홍천군농업기술센터가 운영하는 귀농인의 집 입주자를 모집해요. 이번 대상은 서석면 풍암2리 단독주택 1동이에요. 농어촌 외 지역에 1년 이상 거주한 65세 이하 도시민이 신청할 수 있고, 신청은 6월 1일부터 24일까지 받아요. 임대 기간은 1년이고 협의에 따라 3개월 연장할 수 있어요. 귀농인의 집은 본격 귀농 전에 농촌 생활을 직접 경험하고 지역 주민과 교류하며 정착을 준비하는 임시 거주 시설이라, 가족 단위 정착이나 노년 귀촌을 준비하는 분께 잘 맞아요. 홍천군은 귀농인의 집 6개소를 운영하며 임시 주거·체험 인프라를 넓혀 가고 있어, 그동안 상대적으로 정보가 적었던 강원 권역 보강에도 도움이 돼요.",
    region: "강원도",
    organization: "홍천군농업기술센터",
    supportType: "현물",
    supportAmount: "임시 주거지 제공 (단독주택 1동, 임대 1년 + 협의 시 3개월 연장)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농어촌 외 지역 1년 이상 거주한 65세 이하 도시민. 서석면 풍암2리 단독주택 1동. 신청 마감 2026-06-24. 홍천군농업기술센터 신청.",
    applicationStart: "2026-06-01",
    applicationEnd: "2026-06-24",
    relatedCrops: [],
    sourceUrl: "https://www.webeconomy.co.kr/news/articleView.html?idxno=2188242",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-033",
    title: "하동군 귀농인의 집 입주 희망자 모집 (5가구)",
    summary:
      "경남 하동군이 진교·악양·화개·하동읍 귀농인의 집 5가구 입주자를 9월 9일까지 모집. 월 사용료 20만 원, 최소 6개월~최대 1년 거주.",
    description:
      "경상남도 하동군청 지역활력추진단이 운영하는 귀농인의 집 5가구 입주자를 모집해요. 대상은 진교면 구영마을, 악양면 상중대마을, 화개면 의신마을 이동식주택 B동, 하동읍 서동마을 101호·102호예요. 신청은 2026년 8월 26일부터 9월 9일까지 받고, 하동군청 별관 2층 지역활력추진단 방문·등기우편·이메일로 접수해요. 하동군 전입 직전에 농어촌 외 지역에서 1년 이상 살았고 2024년 1월 1일 이후 전입한 (예비)귀농귀촌인이면 신청할 수 있어요. 사용료는 월 20만 원이고, 입주자가 늘면 1명당 5만 원씩 최대 30만 원까지 붙어요. 입주 기간은 최소 6개월에서 최대 1년이라 본격 귀농 전에 지역과 이웃을 충분히 겪어볼 수 있어요. 신청 전에 해당 집을 직접 방문해 상태를 확인하는 게 필수예요. 그동안 정보가 적었던 경남 권역 체류형 사업이라 지리산·섬진강 자락 정착을 고민한다면 눈여겨볼 만해요.",
    region: "경상남도",
    organization: "하동군청 지역활력추진단 귀농귀촌부서",
    supportType: "현물",
    supportAmount: "임시 주거지 5가구 제공 (월 사용료 20만 원 · 입주 최소 6개월~최대 1년)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "하동군 전입 직전 농어촌 외 지역 1년 이상 거주 + 2024. 1. 1. 이후 전입한 (예비)귀농귀촌인. 선정 후 귀농인의 집으로 전입신고 가능해야 함. 대상 5가구(진교 구영·악양 상중대·화개 의신 이동식주택 B동·하동읍 서동 101호·102호). 월 사용료 20만 원(추가 1인당 5만 원, 최대 30만 원). 신청 마감 2026-09-09. 하동군청 지역활력추진단 귀농귀촌담당(055-880-2849) 방문·등기우편·이메일 접수.",
    applicationStart: "2026-08-26",
    applicationEnd: "2026-09-09",
    relatedCrops: [],
    sourceUrl: "https://www.hadong.go.kr/refarm/05040/04835.web?gcode=4027&idx=37811846&amode=view",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-034",
    title: "하동군 귀농귀촌 사관학교 하반기 교육생 추가모집 (찐하동 농부 첫걸음)",
    summary:
      "경남 하동군이 하반기 귀농귀촌 사관학교 교육생 10명을 9월 3일까지 추가 모집. 9월 8~18일 8회차 40시간 과정.",
    description:
      "경상남도 하동군청 지역활력추진단이 운영하는 '찐하동 농부 첫걸음' 귀농귀촌 사관학교의 하반기 추가모집이에요. 교육은 2026년 9월 8일부터 9월 18일까지 매주 화~금 8회차, 총 40시간으로 진행하고 농업·농촌의 이해와 품종별 현장 견학을 다뤄요. 하동군에 2019년 1월 1일 이후 전입한 귀농귀촌인은 물론, 아직 지역을 정하지 않은 도시민도 신청할 수 있어요. 신청은 8월 28일부터 9월 3일까지 하동군청 지역활력추진단으로 접수하고 입학원서와 주민등록초본을 내면 돼요. 기존 5명에 더해 10명을 추가로 뽑아요. 귀농 농업창업·주택구입 융자는 영농 관련 교육을 100시간 이상 이수해야 신청할 수 있어서, 이런 과정으로 교육 시간을 미리 쌓아두면 나중에 도움이 돼요.",
    region: "경상남도",
    organization: "하동군청 지역활력추진단 귀농귀촌부서",
    supportType: "교육",
    supportAmount: "8회차 40시간 교육 (농업·농촌의 이해, 품종별 현장 견학)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "하동군 전입 7년 이내(2019. 1. 1. 이후) 귀농귀촌인, 또는 하동군 귀농귀촌 희망자·지역을 정하지 않은 도시민. 교육 기간 2026-09-08~2026-09-18(매주 화~금, 8회차 40시간). 추가모집 10명(기 모집 5명). 신청 마감 2026-09-03. 하동군청 지역활력추진단 귀농귀촌부서(055-880-2428) 접수. 입학원서·주민등록초본 제출.",
    applicationStart: "2026-08-28",
    applicationEnd: "2026-09-03",
    relatedCrops: [],
    sourceUrl: "https://www.hadong.go.kr/refarm/05040/04835.web?gcode=4027&idx=37811903&amode=view",
    year: 2026,
    category: "settlement",
  },
  {
    id: "SP-035",
    title: "공주시 귀농귀촌인 주택수리비 지원사업 (2026년 26개소)",
    summary:
      "충남 공주시가 귀농귀촌인 주택 내부 수리비를 개소당 최대 500만 원 지원. 26개소 규모로 1월 5일부터 접수하며 예산 소진 시 조기 마감.",
    description:
      "충청남도 공주시 농업기술센터가 귀농귀촌인의 정착 초기 재정 부담을 덜어주려고 주택 내부 수리비를 지원해요. 도배와 장판 교체, 부엌·화장실 개량처럼 살면서 실제로 손봐야 하는 부분을 개소당 최대 500만 원까지 지원하고, 2026년 사업량은 26개소예요. 담장 설치 같은 주택 외부 수리는 빠져요. 신청 대상은 다른 도시 동지역에 1년 이상 살다가 공주시 농촌지역으로 전입한 지 1년이 안 된 만 20~65세 세대주예요. 대상 주택은 세대주가 살고 있는 본인 소유 주택이거나 5년 이상 임대차 계약을 맺은 10년 이상 된 집이어야 해요. 접수는 2026년 1월 5일에 시작해 마감일을 따로 정하지 않았지만 예산이 떨어지면 조기 마감이라, 읍면동 행정복지센터 산업개발팀에 남은 예산을 먼저 확인해 보세요.",
    region: "충청남도",
    organization: "공주시 농업기술센터 농촌진흥과",
    supportType: "보조금",
    supportAmount: "개소당 최대 500만 원 (2026년 사업량 26개소, 주택 내부 수리 한정)",
    eligibilityAgeMin: 20,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "타 도시 동지역 1년 이상 거주 직후 신청일 기준 공주시 농촌지역 전입 1년 이내 세대주, 만 20세 이상~만 65세 이하 귀농귀촌인. 대상 주택은 세대주가 거주하는 본인 소유 또는 임대차 계약 5년 이상인 10년 이상 된 주택. 지원기간 2026-01-05 ~ 예산 소진 시 조기 마감(마감일 미지정). 주소지 읍면동 행정복지센터 산업개발팀 신청. 공주시 농업기술센터 공고 제2026-1호(041-840-8748).",
    applicationStart: "2026-01-05",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.gongju.go.kr/prog/saeolGosi/GOSI_03/sub04_03_03/view.do?notAncmtMgtNo=56715",
    year: 2026,
    category: "settlement",
  },
  {
    id: "SP-036",
    title: "청도군 귀농귀촌인 임시거주공간 임대료 지원사업 (2026)",
    summary:
      "경북 청도군이 전입 3년 이내 귀농귀촌인에게 월세를 최대 10개월간 지원. 2인 이상 가구 월 15만 원, 1인 가구 월 10만 원. 예산 소진 시까지 접수.",
    description:
      "경상북도 청도군농업기술센터가 귀농귀촌인의 초기 주거비 부담을 덜어주는 임대료 지원사업이에요. 2인 이상 가구는 월 최대 15만 원, 1인 가구는 월 최대 10만 원을 최대 10개월까지 받을 수 있어요. 접수는 2026년 1월 8일에 시작해 예산 소진 시까지 이어지고, 매달 마지막 주에 대상자를 선정해요. 조건이 두 가지인데 둘 다 충족해야 해요. 먼저 다른 시군에서 1년 이상 살다가 2026년 1월 1일 기준 농업경영을 목적으로 청도군에 전입한 지 3년 이내(2023년 1월 1일 이후 전입)인 만 65세 이하 세대주여야 해요. 여기에 청도군 농민사관학교 귀농영농교육과정을 듣거나 수료했거나, 청도군 귀농귀촌 프로그램을 이수해야 해요. 교육 이수가 사실상 필수 조건이라 청도 정착을 생각한다면 교육 일정부터 챙기는 게 순서예요. 신청은 청도군농업기술센터 귀농귀촌팀이나 주소지 읍·면사무소 산업팀에서 받아요.",
    region: "경상북도",
    organization: "청도군 농촌기술지원과 귀농귀촌팀",
    supportType: "보조금",
    supportAmount: "2인 이상 가구 월 최대 15만 원 / 1인 가구 월 최대 10만 원 (지원기간 최대 10개월)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "아래 두 조건 모두 충족 필요. ① 타 시군에서 1년 이상 거주하다 기준일(2026. 1. 1.) 현재 농업경영 목적으로 청도군에 전입한 지 3년 이내(2023. 1. 1. 이후 전입)인 만 65세 이하(1960. 1. 1. 이후 출생) 세대주. ② 청도군 농민사관학교 귀농영농교육과정 교육생·수료생 또는 청도군 귀농귀촌 프로그램 이수자. 신청기간 2026-01-08 ~ 예산 소진 시까지(마감일 미지정), 매달 마지막 주 선정. 청도군농업기술센터 귀농귀촌팀 또는 주소지 읍·면사무소 산업팀 신청. 청도군 공고 제2026-40호(054-370-6523).",
    applicationStart: "2026-01-08",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.cheongdo.go.kr/portal/saeol/gosi/view.do?notAncmtMgtNo=23267&mid=0301020000",
    year: 2026,
    category: "settlement",
  },
  {
    id: "SP-037",
    title: "구미시 귀농인 정착지원사업 5차 모집",
    summary:
      "경북 구미시가 귀농인 영농 기반 구축비를 개소당 500만 원(보조 80%) 지원. 2개소 규모로 9월 16일까지 신청.",
    description:
      "경상북도 구미시 농촌활력과가 귀농인이 시행착오 없이 영농에 자리 잡도록 영농 기반 구축비를 지원하는 사업의 5차 모집이에요. 개소당 500만 원 규모로 보조 80%에 자부담 20%이고, 이번 차수 사업량은 2개소예요. 농지 확대나 시설 확충·개보수, 농기계 구입, 하우스 설치 같은 경종농업 기반은 물론 축산 시설 확충·개보수도 대상이에요. 신청 자격은 농촌 밖에서 농업 외 산업에 종사하며 1년 이상 살다가 2026년 1월 1일 기준 농업경영을 목적으로 가족(부부 이상)이 함께 구미시 농촌으로 전입한 지 5년 이내인 만 65세 이하(1960년 1월 1일 이후 출생) 세대주로, 실제로 영농에 종사해야 해요. 신청은 주소지 행정복지센터에서 9월 16일까지 받아요. 가족 단위로 이미 구미에 자리 잡았다면 초기 시설 투자 부담을 덜 수 있는 기회예요.",
    region: "경상북도",
    organization: "구미시 농촌활력과",
    supportType: "보조금",
    supportAmount: "개소당 500만 원 (보조 80% · 자부담 20%), 5차 사업량 2개소",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 이외 지역에서 농업 외 산업에 종사하며 1년 이상 거주하다 기준일(2026. 1. 1.) 현재 농업경영 목적으로 가족(부부 이상)이 함께 구미시 농촌으로 전입한 지 5년 이내인 만 65세 이하(1960. 1. 1. 이후 출생) 세대주로 실제 영농 종사자. 신청 마감 2026-09-16(공고 본문에 마감일만 명시, 시작일은 공고 등록일 2026-08-13 기준). 주소지 행정복지센터 신청. 구미시 공고 제2026-2327호(054-480-5802).",
    applicationStart: "2026-08-13",
    applicationEnd: "2026-09-16",
    relatedCrops: [],
    sourceUrl: "https://www.gumi.go.kr/portal/saeol/gosi/view.do?notAncmtMgtNo=73213&mid=0401040000",
    year: 2026,
    category: "settlement",
  },

  {
    id: "SP-038",
    title: "고령군 귀농인 정착지원금 지원 (2026년 하반기 공고)",
    summary:
      "경북 고령군이 귀농인 25가구에 분기별 정착지원금을 12개월간 지급. 2인 이상 60만 원, 1인 30만 원(1분기 기준)이고 예산이 떨어지면 마감돼요.",
    description:
      "경상북도 고령군 농업정책담당이 귀농 초기 생활을 받쳐 주려고 실거주 확인을 거쳐 분기마다 정착지원금을 주는 사업이에요. 2026년 사업량은 25가구, 사업비는 6,000만 원 전액 보조예요. 지원 신청일 다음 달부터 고령군에 살고 있으면 1분기 기준 2인 이상 가구는 60만 원, 1인 가구는 30만 원을 12개월간 분기별로 받아요. 지급은 3·6·9·12월에 나눠서 하고 매달 거주와 농업경영 여부를 확인해요. 대상은 농촌 밖에서 농업 외 산업에 종사하며 1년 이상 살다가 농업경영을 목적으로 가족과 함께 고령군에 전입한 지 1년이 지나고 3년은 안 된 만 65세 이하 세대주로, 실제로 농사를 짓고 있어야 해요. 여기에 고령군이 하는 귀농·귀촌 교육을 이수하고 고령군에 농업경영체를 등록해야 하며, 신청 전년도 농어업 외 종합소득이 3,700만 원 이하여야 해요. 청년농업인 영농정착지원금을 함께 받고 있으면 제외돼요. 신청은 거주지 읍·면사무소에서 연중 받지만 예산이 떨어지면 더 받지 않으니 남은 물량을 먼저 확인해 보세요.",
    region: "경상북도",
    organization: "고령군 농업정책과",
    supportType: "보조금",
    supportAmount:
      "분기별 정착지원금 12개월 지급 — 1분기 기준 2인 이상 60만 원 / 1인 30만 원 (2026년 사업량 25가구, 사업비 6,000만 원 전액 보조)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "농촌 외 지역에서 농업 외 산업에 종사하며 1년 이상 거주하다 농업경영을 목적으로 가족(부부 이상)과 함께 고령군에 전입한 지 1년 이후 3년 이내인 만 65세 이하(1960. 1. 1. 이후 출생) 세대주로 실제 영농 종사자(부부는 2명 중 1명만 지원, 가족관계증명서상 배우자가 없으면 1인도 지원 가능). 고령군이 실시하는 귀농·귀촌 교육 이수 + 고령군에 농업경영체 등록(농지 소재지도 고령) 필요. 신청 전년도 농어업 외 종합소득 3,700만 원 이하. 청년농업인 영농정착지원금 중복 수령자 제외, 농업 외 다른 직업 겸업자 제외. 지급 방식은 신청일 익월부터 1개월 거주 시 분기별 지급(1분기 12·1·2월분 3월 중, 2분기 3·4·5월분 6월 중, 3분기 6·7·8월분 9월 중, 4분기 9·10·11월분 12월 중). 신청기간 2026년 1월 ~ 12월(예산 소진 시 신청 불가 — 조기 마감 가능), 하반기 공고기간 2026. 6. 30. ~ 12. 31. 신청장소는 거주지 읍·면사무소. 고령군 공고 제2026-1062호(054-950-7304).",
    applicationStart: "2026-01-01",
    applicationEnd: "2026-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.goryeong.go.kr/kor/boardView.do?BRD_ID=1023&BOARD_IDX=41828&IDX=154",
    year: 2026,
    category: "settlement",
  },
  {
    id: "SP-039",
    title: "의성군 귀농인의 집 입주자 모집 (2026년 8월)",
    summary:
      "경북 의성군이 춘산·봉양·비안·다인·신평 5개소 귀농인의 집 입주자를 9월 25일까지 모집. 보증금 50만 원, 사용료 연 4만~14만 원대, 최대 12개월.",
    description:
      "경상북도 의성군농업기술센터 귀농귀촌팀이 의성 정착을 준비하는 도시민에게 살아 볼 집을 내주는 사업이에요. 이번 8월 모집 대상은 춘산 효선1길 4 B호(58.37㎡), 봉양 장대2길 34 A호(65.4㎡), 비안 산제2길 13-10 B호(23.67㎡), 다인 자미로 503-2 B호(22.76㎡), 신평 왜가리길 1388 A호(33.83㎡) 다섯 곳이에요. 보증금은 50만 원이고 연 사용료는 집마다 달라서 다인 4만 6,450원부터 춘산 14만 6,780원까지예요. 유상으로 운영되는 집은 의성군 귀농·귀촌인 지원 조례에 따라 임차료를 지원받아요. 입주 기간은 12개월 이내고, 꼭 필요하다고 인정되면 한 번 더 연장할 수 있어요. 신청 자격은 만 65세 이하로 시의 동지역에 1년 이상 계속 살고 있고, 읍·면에 주소가 없으며, 직업과 사업자등록이 없는 사람이에요. 의성군에 전입한 지 12개월 안이면서 군에 집이 없어도 신청할 수 있어요. 신청은 2026년 8월 27일부터 9월 25일까지 의성군농업기술센터 귀농귀촌팀에 본인이 직접 방문해서 접수해요. 선정은 점수표 고득점자 순으로 하고 마을운영위원회 동의를 거쳐요.",
    region: "경상북도",
    organization: "의성군농업기술센터 귀농귀촌팀",
    supportType: "현물",
    supportAmount:
      "귀농인의 집 5개소 임대 (보증금 50만 원 · 연 사용료 4만 6,450원~14만 6,780원, 입주기간 12개월 이내·1회 연장 가능)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "만 65세 이하(1960. 1. 1. 이후 출생) + 현재 도시 지역(시의 동지역)에서 1년 이상 지속 거주 + 현재 농어촌지역(읍·면)에 주소를 두지 않은 자 + 현재 직업이 없고 사업자등록을 하지 않은 자. 의성군으로 전입한 지 12개월 이내이며 의성군 내 무주택인 경우도 신청 가능. 대상 5개소 — 춘산 효선1길 4 B호(58.37㎡)·봉양 장대2길 34 A호(65.4㎡)·비안 산제2길 13-10 B호(23.67㎡)·다인 자미로 503-2 B호(22.76㎡)·신평 왜가리길 1388 A호(33.83㎡). 보증금 500,000원, 연 사용료 46,450원~146,780원(의성군공유재산관리조례에 따라 변경 가능). 입주기간 12개월 이하, 점수표 50점 이상 + 마을운영위원회 동의 시 1회(12개월 이하) 연장 가능. 수도·전기 등 공공요금 입주자 부담, 입주 후 귀농인의 집 주소지로 전입신고 필요. 신청기간 2026-08-27 ~ 2026-09-25, 신청자 본인 방문접수(경북 의성군 봉양면 경북대로 5225). 의성군농업기술센터 귀농귀촌팀(054-830-6726, 6729).",
    applicationStart: "2026-08-27",
    applicationEnd: "2026-09-25",
    relatedCrops: [],
    sourceUrl: "https://www.usc.go.kr/ko/page.do?mnu_uid=157&not_ancmt_mgt_no=40407&cmd=2",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-040",
    title: "옥천군 귀농인의 집 15호(안내면 동대리) 입주자 재모집",
    summary:
      "충북 옥천군이 안내면 동대리 귀농인의 집 15호에 1가구를 9월 23일까지 모집. 주택 38.85㎡, 임대기간 1년, 연 임차료 180만 원 일시납.",
    description:
      "충청북도 옥천군농업기술센터가 운영하는 귀농인의 집 15호 입주자를 다시 모집해요. 대상지는 안내면 동대1길 15-2(안내면 동대리 157-1)에 있는 주택 38.85㎡(12평)이고, 임대기간은 1년, 임차료는 연 180만 원 일시납이 원칙이에요. 모집은 1가구고 접수는 2026년 8월 27일부터 9월 23일까지 받아요. 공고일(2026년 8월 27일) 기준으로 1년 이상 연속해서 읍·면이 아닌 지역에 살고 있는 19세 이상 국민이면 신청할 수 있어요. 접수는 옥천군농업기술센터 농촌활력과 귀농귀촌팀 방문 또는 등기우편 둘 중 하나로 하고, 등기우편은 9월 23일 소인분까지 인정해요. 심사는 서류 30점과 면접 70점으로 나뉘는데, 서류 점수는 전입 가구원 수와 농업·귀농 교육 이수 시간으로 매겨요. 농업 관련 자격증 소지자, 다른 지자체 농촌에서 살아보기 3개월 이상 참가자, 청년 농업인, 학령기 자녀와 함께 전입하는 경우에는 각 5점씩 가점이 붙어요. 교육 이수 시간이 점수로 바로 이어지니 신청 전에 수료증부터 챙겨 두면 좋아요.",
    region: "충청북도",
    organization: "옥천군농업기술센터 농촌활력과 귀농귀촌팀",
    supportType: "현물",
    supportAmount: "주택 1가구 임대 (38.85㎡·12평, 임대기간 1년, 연 임차료 180만 원 일시납)",
    eligibilityAgeMin: 19,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "공고일(2026. 8. 27.) 기준 1년 이상 연속하여 농어촌(읍·면) 이외의 지역에 주민등록을 두고 거주 중인 19세 이상(2007. 12. 31. 이전 출생) 대한민국 국적자. 모집 1가구. 대상지 안내면 동대1길 15-2(안내면 동대리 157-1), 주택 38.85㎡, 임대기간 1년, 연 임차료 180만 원(일시납 원칙). 접수기간 2026-08-27 ~ 2026-09-23(09:00~18:00, 등기우편은 9. 23. 소인분까지 유효). 옥천군농업기술센터 농촌활력과 귀농귀촌팀 방문·등기우편 접수(29043 충북 옥천군 옥천읍 옥천동이로 234). 서류심사 30점 + 면접심사 70점, 서류 결과 통보 예정일 2026. 9. 29. 옥천군농업기술센터 공고 제2026-145호.",
    applicationStart: "2026-08-27",
    applicationEnd: "2026-09-23",
    relatedCrops: [],
    sourceUrl: "https://www.oc.go.kr/www/selectBbsNttView.do?key=236&bbsNo=40&nttNo=193437",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-041",
    title: "옥천군 귀농인의 집 11호(안남면 화학리) 입주자 5차 모집",
    summary:
      "충북 옥천군이 안남면 화학리 귀농인의 집 11호에 1가구를 9월 18일까지 모집. 방 2칸 52.14㎡, 임대기간 1년, 연 임대료 240만 원 일시납.",
    description:
      "충청북도 옥천군농업기술센터가 귀농인의 집 11호 입주자를 다섯 번째로 모집해요. 대상지는 안남면 화학4길 102-7(안남면 화학리 47)에 있는 경량철골구조 주택으로, 1층에 방 2칸이 있는 52.14㎡ 규모예요. 임대기간은 1년이고 연 임대료는 240만 원 일시납이 원칙이에요. 중도에 나가면 임대료는 돌려받지 못하고, 보증금은 계약할 때 협의해요. 모집은 1가구고 접수는 2026년 8월 19일부터 9월 18일까지예요. 공고일(2026년 8월 19일) 기준으로 1년 이상 연속해서 읍·면이 아닌 지역에 살고 있는 19세 이상 국민이면 신청할 수 있어요. 접수는 옥천군농업기술센터 농촌활력과 귀농귀촌팀에 방문하거나 등기우편으로 보내면 되고, 토·일요일과 공휴일, 점심시간에는 방문 접수를 받지 않아요. 4차 모집에서는 면접심사 지원자가 전원 불참해 다시 공고가 났어요. 같은 옥천군 15호(안내면 동대리)와는 위치·면적·임대료가 다른 별개 대상지예요.",
    region: "충청북도",
    organization: "옥천군농업기술센터 농촌활력과 귀농귀촌팀",
    supportType: "현물",
    supportAmount: "주택 1가구 임대 (52.14㎡ 경량철골·방 2, 임대기간 1년, 연 임대료 240만 원 일시납)",
    eligibilityAgeMin: 19,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "공고일(2026. 8. 19.) 기준 1년 이상 연속하여 귀농어·귀촌법에 따른 농어촌(읍·면) 이외의 지역에 주민등록을 두고 거주 중인 19세 이상 대한민국 국적자. 모집 1가구. 대상지 안남면 화학4길 102-7(안남면 화학리 47), 경량철골구조 주택 52.14㎡(1층·방 2). 임대기간 1년, 연 임대료 240만 원(일시납 원칙, 중도 퇴거 시 미환급), 보증금은 계약 시 협의. 접수기간 2026-08-19 ~ 2026-09-18(토·일·공휴일 및 점심시간 방문 접수 불가). 옥천군농업기술센터 농촌활력과 귀농귀촌팀 방문·등기우편 접수(29043 충북 옥천군 옥천읍 옥천동이로 234). 4차 모집 면접심사 지원자 전원 불참으로 재공고. 옥천군 농업기술센터 공고 제2026-143호.",
    applicationStart: "2026-08-19",
    applicationEnd: "2026-09-18",
    relatedCrops: [],
    sourceUrl: "https://www.oc.go.kr/www/selectBbsNttView.do?key=236&bbsNo=40&nttNo=193120",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-042",
    title: "장수군 계남면 귀농귀촌 임시거주시설 2차 입주자 모집",
    summary:
      "전북 장수군이 계남면 임시거주시설 원룸 1세대를 9월 10일까지 모집. 37.9㎡, 보증금 50만 원·임대료 연 143만 7,120원, 거주 12개월.",
    description:
      "전라북도 장수군 농산업정책과가 계남면 사곡1길 20에 있는 귀농귀촌 임시거주시설의 2차 입주자를 모집해요. 숙소동 원룸 37.9㎡(11.4평) 1세대가 대상이고 보증금 50만 원에 임대료는 연 143만 7,120원이에요. 입주기간은 2026년 9월부터 2027년 9월까지 12개월이고 사정에 따라 1년까지 연장할 수 있어요. 신청은 2026년 8월 24일 9시부터 9월 10일 17시까지 우편이나 방문으로 받는데, 우편은 마감 안에 찍힌 우체국 소인만 인정해요. 공고일 기준으로 다른 도시 지역에서 1년 이상 살고 있거나 장수군으로 전입한 지 1년이 안 된 (예비)귀농귀촌인이면 신청할 수 있고 연령 제한은 없어요. 귀농귀촌 교육 이수 시간이 많거나 장수군에 농지를 마련해 둔 사람은 우대해요. 단순한 농촌 살아보기나 여행 목적은 신청을 받지 않아요. 심사는 서류 40%와 면접 60%로 하고 합격자는 9월 17일까지 개별 통보해요. TV·냉장고·세탁기·에어컨 같은 가전과 침대·옷장 등 가구가 갖춰져 있어 몸만 들어가도 생활할 수 있어요.",
    region: "전라북도",
    organization: "장수군 농산업정책과 귀농귀촌팀",
    supportType: "현물",
    supportAmount: "숙소동 원룸 1세대 임대 (37.9㎡·11.4평, 보증금 50만 원 · 임대료 연 143만 7,120원, 거주 12개월)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "공고일 현재 장수군으로 귀농귀촌 의사가 있는 (예비)귀농귀촌인(농어촌 외 지역에서 장수군으로 전입하려는 자)으로, 타 도시의 농촌 이외 도시지역에서 1년 이상 거주 중이거나 장수군으로 전입한 지 1년 이내인 자. 연령 제한 없음. 귀농귀촌 교육 이수 시간이 많은 신청자·장수군 귀농귀촌 교육 이수자·장수군 농지 구입 등 기반 마련자 우대. 단순 농촌 살아보기·관광·여행 목적 신청 제외. 모집 1세대(동거는 가족관계증명서상 가족만 가능). 시설 위치 장수군 계남면 사곡1길 20, 숙소동 원룸 37.9㎡, 보증금 500,000원·임대료 1,437,120원/연(공과금 개별 부담). 입주기간 2026. 9. ~ 2027. 9.(12개월, 1년까지 연장 가능), 선정 후 15일 이내 장수군 전입 의무. 신청기간 2026-08-24 09:00 ~ 2026-09-10 17:00, 우편(기한 내 소인분)·방문 접수. 접수처 장수군청 3층 농산업정책과 귀농귀촌팀(063-350-2396). 서류심사 40%(2026. 9. 14.) + 면접심사 60%(2026. 9. 16.), 합격자 발표 2026. 9. 17.까지 개별 통보. 장수군 공고 제2026-850호.",
    applicationStart: "2026-08-24",
    applicationEnd: "2026-09-10",
    relatedCrops: [],
    sourceUrl:
      "https://eminwon.jangsu.go.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do?jndinm=OfrNotAncmtEJB&context=NTIS&method=selectOfrNotAncmt&methodnm=selectOfrNotAncmtRegst&not_ancmt_mgt_no=33028&homepage_pbs_yn=Y&subCheck=Y",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-043",
    title: "장수군 청년주택 모람 임시거주시설 2차 입주자 모집",
    summary:
      "전북 장수군이 청년주택 모람 단독주택 1세대를 9월 10일까지 모집. 50㎡ + 텃밭 33㎡, 보증금 50만 원·임대료 연 175만 4,400원, 거주 12개월.",
    description:
      "전라북도 장수군 농산업정책과가 장수읍 두산리에 있는 청년주택 모람의 2차 입주자를 모집해요. 모람은 단독주택 18호로 이뤄진 단지인데 이번에는 거실과 방 1개 구조의 50㎡(15평) 1세대를 뽑아요. 호마다 33㎡ 텃밭이 딸려 있어 소규모 농사를 바로 시작해 볼 수 있어요. 보증금은 50만 원, 임대료는 연 175만 4,400원이고 입주기간은 2026년 9월부터 2027년 9월까지 12개월이에요. 신청은 2026년 8월 24일 9시부터 9월 10일 17시까지 받아요. (예비)귀농귀촌인은 물론 장수군 농군사관학교 입교생이나 장수군 임대형 스마트팜 농업인도 신청할 수 있어요. 40세 미만 청년 귀농귀촌 세대는 우대 항목이지 자격 제한은 아니라서 연령과 상관없이 지원할 수 있어요. 귀농귀촌 교육 이수 시간이 많거나 장수군에 농지를 마련해 둔 사람도 우대해요. 최종 선정자는 추첨으로 주택을 배정하고, 입주 기간에는 장수귀농학교 같은 군 프로그램에 참여해야 해요. 같은 날 마감하는 계남면 임시거주시설과는 위치·면적·임대료가 다른 별개 시설이에요.",
    region: "전라북도",
    organization: "장수군 농산업정책과 귀농귀촌팀",
    supportType: "현물",
    supportAmount:
      "단독주택 1세대 임대 (거실+방1 50㎡·15평 + 텃밭 33㎡, 보증금 50만 원 · 임대료 연 175만 4,400원, 거주 12개월)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "① (귀농귀촌인) 공고일 현재 장수군으로 귀농귀촌 의사가 있는 (예비)귀농귀촌인으로 타 도시의 농촌 이외 도시지역에서 1년 이상 거주 중이거나 장수군 전입 1년 이내인 자, 또는 ② 장수군 농군사관학교 입교생·장수군 임대형 스마트팜 농업인. 연령 제한 없음(40세 미만 청년 귀농귀촌 세대는 우대 항목). 귀농귀촌 교육 이수 시간이 많은 신청자·장수군 교육 이수자·농지 구입 등 기반 마련자 우대. 단순 농촌 살아보기·관광·여행 목적 신청 제외. 모집 1세대. 시설 위치 장수군 장수읍 두산리 41번지 일원(단독주택 18호, 호당 50㎡ + 텃밭 33㎡), 보증금 500,000원·임대료 1,754,400원/연(공과금 개별 부담). 입주기간 2026. 9. ~ 2027. 9.(12개월, 1년까지 연장 가능), 선정 후 15일 이내 장수군 전입 의무, 최종 선정자는 추첨으로 주택 배정. 신청기간 2026-08-24 09:00 ~ 2026-09-10 17:00(토·일·공휴일 제외), 우편(기한 내 소인분)·방문 접수. 접수처 장수군청 3층 농산업정책과 귀농귀촌팀(063-350-2396). 장수군 공고 제2026-849호.",
    applicationStart: "2026-08-24",
    applicationEnd: "2026-09-10",
    relatedCrops: [],
    sourceUrl:
      "https://eminwon.jangsu.go.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do?jndinm=OfrNotAncmtEJB&context=NTIS&method=selectOfrNotAncmt&methodnm=selectOfrNotAncmtRegst&not_ancmt_mgt_no=33027&homepage_pbs_yn=Y&subCheck=Y",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-044",
    title: "괴산군 귀농귀촌 희망둥지 입주자 재모집 (청안면 금신리)",
    summary:
      "충북 괴산군이 청안면 단독주택 1세대에 귀농귀촌인을 모집. 임대료 월 25만 원에 2~3년 거주. 7월 14일부터 접수하고 모집이 끝나면 마감돼요.",
    description:
      "충청북도 괴산군농업기술센터가 귀농·귀촌인의 주거 안정을 위해 운영하는 '귀농귀촌 희망둥지 만들기' 사업의 입주자 재모집이에요. 대상지는 괴산군 청안면 광장로 634에 있는 단독주택 1개소이고 1세대를 뽑아요. 임대료는 월 25만 원 정도이고 2~3년 살 수 있어서, 집을 사기 전에 지역을 충분히 겪어 보기에 알맞아요. 신청 자격은 도시지역에서 1년 이상 주민등록을 두고 살다가 괴산군에 정착하려고 전입해 실제로 거주할 사람이에요. 지금 주민등록상 주소가 도시지역이고 그곳에서 1년 이상 살고 있어야 해요. 접수는 2026년 7월 14일에 시작해 모집이 끝나면 마감하니 신청 전에 남은 자리를 먼저 확인해 보세요. 접수는 괴산군농업기술센터 귀농귀촌지원팀에 방문하거나 우편으로 보내면 돼요. 자세한 조건과 집 상태는 공고에 붙은 설명 자료에서 확인할 수 있어요.",
    region: "충청북도",
    organization: "괴산군농업기술센터 기술지원과 귀농귀촌지원팀",
    supportType: "현물",
    supportAmount: "단독주택 1세대 임대 (임대료 월 25만 원 정도, 2~3년 거주)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "도시지역에서 1년 이상 주민등록상 거주하다가 괴산군에 정착하기 위해 전입하여 실거주하려는 자로, 현재 주민등록상 주소가 도시지역이고 그곳에서 1년 이상 거주 중인 자. 공고 본문에 연령 제한 명시 없음. 모집 1세대. 대상지 괴산군 청안면 광장로 634(단독주택) 1개소. 임대조건 임대료 월 25만 원 정도, 2~3년 거주. 공고 및 접수기간 2026년 7월 14일 ~ 모집완료 시까지(마감일 미지정 — 모집이 완료되면 조기 마감). 접수처 괴산군농업기술센터 귀농귀촌지원팀 방문·우편 접수. 문의 괴산군농업기술센터 기술지원과 귀농귀촌지원팀(043-830-2776, 2735). 상세 조건·주택 상태는 공고 첨부 자료 참조.",
    applicationStart: "2026-07-14",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.goesan.go.kr/rfarm/selectBbsNttView.do?key=1662&bbsNo=326&nttNo=134164",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-045",
    title: "괴산군 농촌빈집 활용 주거지원 입주자 재모집 (소수면 옥현리)",
    summary:
      "충북 괴산군이 소수면 빈집을 고쳐 단독주택 1세대를 내줘요. 임대료 월 30만 원에 2~3년 거주. 7월 14일부터 접수하고 모집이 끝나면 마감돼요.",
    description:
      "충청북도 괴산군농업기술센터가 비어 있던 농촌 주택을 정비해 귀농·귀촌인에게 내주는 '농촌빈집 활용 주거지원 사업'의 입주자 재모집이에요. 대상지는 괴산군 소수면 옥현리 383에 있는 단독주택 1개소이고 1세대를 뽑아요. 임대료는 월 30만 원이고 2~3년 살 수 있어요. 신청 자격은 도시지역에서 1년 이상 주민등록을 두고 살다가 괴산군에 정착하려고 전입해 실제로 거주할 사람이에요. 지금 주민등록상 주소가 도시지역이고 그곳에서 1년 이상 살고 있어야 해요. 접수는 2026년 7월 14일에 시작해 모집이 끝나면 마감하니 남은 자리를 먼저 확인해 보세요. 접수는 괴산군농업기술센터 귀농귀촌지원팀에 방문하거나 우편으로 보내면 돼요. 같은 괴산군의 청안면 희망둥지와는 대상지·임대료가 다른 별개 사업이라 조건을 견줘 보고 고르면 좋아요.",
    region: "충청북도",
    organization: "괴산군농업기술센터 기술지원과 귀농귀촌지원팀",
    supportType: "현물",
    supportAmount: "단독주택 1세대 임대 (임대료 월 30만 원, 2~3년 거주)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "도시지역에서 1년 이상 주민등록상 거주하다가 괴산군에 정착하기 위해 전입하여 실거주하려는 자로, 현재 주민등록상 주소가 도시지역이고 그곳에서 1년 이상 거주 중인 자. 공고 본문에 연령 제한 명시 없음. 모집 1세대. 대상지 괴산군 소수면 옥현리 383(단독주택) 1개소. 임대조건 임대료 월 30만 원, 2~3년 거주. 공고 및 접수기간 2026년 7월 14일 ~ 모집완료 시까지(마감일 미지정 — 모집이 완료되면 조기 마감). 접수처 괴산군농업기술센터 귀농귀촌지원팀 방문·우편 접수. 문의 괴산군농업기술센터 기술지원과 귀농귀촌지원팀(043-830-2776, 2735). 상세 조건·주택 상태는 공고 첨부 자료 참조.",
    applicationStart: "2026-07-14",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl: "https://www.goesan.go.kr/rfarm/selectBbsNttView.do?key=1662&bbsNo=326&nttNo=134163",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-046",
    title: "안동시 귀농인 주택수리비(소규모) 지원사업 추가신청",
    summary:
      "경북 안동시가 귀농인 주택 수리비를 가구당 500만 원(보조 50%) 지원. 9가구 규모로 10월 30일까지 접수하고 사업량이 차면 마감돼요.",
    description:
      "경상북도 안동시농업기술센터 영농지원과가 귀농 초기 주거 환경을 손볼 수 있게 주택 수리비를 지원하는 사업의 추가 신청이에요. 지원 범위는 보일러 교체, 지붕·부엌·화장실 개량처럼 주택시설 수리에 한정돼요. 가구당 사업비는 500만 원이고 보조 비율은 50%(시비 50%·자부담 50%)라 실제로 받는 보조금은 250만 원이에요. 추가 신청 사업량은 9가구고 사업량이 차면 마감해요. 신청 대상은 안동시 밖 도시지역에서 농업 외 산업에 종사하며 1년 이상 살다가 안동시 농촌지역에 가족(부부 이상)이 함께 전입한 지 5년이 안 된 만 65세 이하 세대주예요. 직전 거주지가 읍·면이거나 안동에 주소를 뒀던 경우, 도시지역에 주민등록을 두고 농지원부·농업경영체를 등록한 지 2년이 지난 경우, 농촌에 살면서 농업에 종사하지 않는 경우는 빠져요. 아파트·빌라·다가구·다세대 주택과 무허가 건물, 2023년 1월 1일 이후 지은 집도 대상이 아니에요. 접수는 2026년 3월 12일부터 10월 30일까지 주소지 관할 읍·면·동 행정복지센터에서 받아요.",
    region: "경상북도",
    organization: "안동시농업기술센터 영농지원과",
    supportType: "보조금",
    supportAmount:
      "가구당 사업비 500만 원 (보조 50% — 시비 50%·자부담 50%, 추가신청 사업량 9가구·소진 시 마감)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "안동시 이외의 도시지역에서 농업 외 타 산업 분야에 종사하며 1년 이상 거주한 귀농인이 안동시 농촌지역에 가족(부부 이상)과 함께 전입한 지 5년 이내인 세대주로, 만 65세 이하만 신청 가능. 지원제외 — 직전 거주지가 읍·면지역이거나 안동시에 주소를 둔 자, 도시지역에 주민등록을 두고 농지원부·농업경영체를 등록한 지 2년이 경과한 자, 재촌 비농업인, 무허가 건물·불법 증개축·아파트·빌라·다가구·다세대 주택, 2023. 1. 1. 이후 신축주택. 지원범위는 보일러 교체, 지붕·부엌·화장실 개량 등 주택시설 수리에 한함. 추가신청 사업량 9가구(사업량 소진 시 마감), 사업비 5,000천원/가구, 보조 50%(시비 50%/자부담 50%). 신청기간 2026. 3. 12. ~ 2026. 10. 30., 신청장소는 지원대상자의 주소지 관할 읍·면·동 행정복지센터. 안동시농업기술센터 영농지원과(054-840-5854).",
    applicationStart: "2026-03-12",
    applicationEnd: "2026-10-30",
    relatedCrops: [],
    sourceUrl: "https://www.andong.go.kr/agritec/bbs/view.do?bIdx=775393&ptIdx=156&mId=0601000000",
    year: 2026,
    category: "settlement",
  },
  {
    id: "SP-047",
    title: "안동시 귀농인 농가주택 설계비 지원사업",
    summary:
      "경북 안동시가 귀농인이 농가주택을 새로 지을 때 설계비 75만 원을 전액 보조. 5가구 규모로 11월 30일까지 접수해요.",
    description:
      "경상북도 안동시농업기술센터 영농지원과가 귀농인이 농가주택을 새로 지을 때 설계비를 대주는 사업이에요. 2026년 사업량은 5가구고 사업비는 375만 원, 가구당 75만 원을 시비 100%로 전액 보조해요. 신청 대상은 안동시 밖 도시지역에서 농업 외 산업에 종사하며 1년 이상 살다가 기준일인 2026년 1월 1일 현재 안동시 농촌지역에 가족(부부 이상)이 함께 전입한 지 5년이 안 되고 농업에 종사하거나 종사하려는 만 65세 이하 세대주예요. 직전 거주지가 읍·면이거나 안동에 주소를 뒀던 경우, 도시지역에 주민등록을 두고 농지원부·농업경영체를 등록한 지 2년이 지난 경우, 농촌에 살면서 농업에 종사하지 않는 경우는 빠져요. 접수는 2026년 1월부터 11월 30일까지 주소지 관할 읍·면·동 행정복지센터에서 받아요. 다만 2026년 1월 1일 이후에 건축설계와 건축인허가를 받고 11월 30일까지 준공한 경우만 지원하니 일정을 먼저 맞춰 보세요.",
    region: "경상북도",
    organization: "안동시농업기술센터 영농지원과",
    supportType: "보조금",
    supportAmount: "가구당 설계비 75만 원 전액 보조 (시비 100%, 2026년 사업량 5가구·사업비 375만 원)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 65,
    eligibilityDetail:
      "안동시 이외의 도시지역에서 농업 외 타 산업 분야에 종사하며 1년 이상 거주한 귀농인이 기준일(2026. 1. 1.) 현재 안동시 농촌지역에 가족(부부 이상)과 함께 전입한 지 5년 이내이고 농업에 종사하는(하려는) 세대주로, 만 65세 이하만 신청 가능. 지원제외 — 직전 거주지가 읍·면지역이거나 안동시에 주소를 둔 자, 도시지역에 주민등록을 두고 농지원부·농업경영체를 등록한 지 2년이 경과한 자, 재촌 비농업인. 지원내용은 귀농인이 농가주택을 신축할 때의 설계비. 사업량 5가구, 사업비 3,750천원(750천원/가구), 보조 100%(시비 100%). 2026. 1. 1. 이후 건축설계 및 건축인허가를 득하고 2026. 11. 30.까지 준공된 경우만 지원. 신청기간 2026. 1. ~ 2026. 11. 30.(공고 본문 월 단위 표기), 신청장소는 지원대상자의 주소지 관할 읍·면·동 행정복지센터. 안동시농업기술센터 영농지원과(054-840-5854).",
    applicationStart: "2026-01-01",
    applicationEnd: "2026-11-30",
    relatedCrops: [],
    sourceUrl: "https://www.andong.go.kr/agritec/bbs/view.do?bIdx=773398&ptIdx=156&mId=0601000000",
    year: 2026,
    category: "settlement",
  },
  {
    id: "SP-048",
    title: "2026년 고향에서 살아보기 「다시, 진안에서」 참가자 모집 (진안 출향민 한정)",
    summary:
      "전북 진안군이 진안 출신 출향민과 그 가족 5가구를 9월 6일까지 모집. 9월 10일부터 2주간 교육·체험·탐방, 참가비 1인 5만 원.",
    description:
      "전북특별자치도 진안군 농촌활력과가 고향으로 돌아오는 길을 함께 그려 보려고 여는 2주짜리 살아보기 프로그램이에요. 모집 대상이 귀향에 관심 있는 진안군 출신 출향민과 그 가족(친척 포함)으로 한정되어 있어서, 진안과 연고가 없으면 신청할 수 없어요. 모집은 5가구(부부 또는 가족)고 1인 가구도 신청할 수 있지만 부부·가족 단위를 먼저 뽑아요. 모집은 2026년 9월 6일까지 받고 선정 결과는 9월 7일에 알려 줘요. 운영은 9월 10일부터 9월 23일까지 평일(월~금)에 이어져요. 진안의 명소와 마을, 자연·생활환경을 둘러보고 지역 주민·활동 멘토를 만나며, 농업기술센터를 찾아 농업과 농촌 생활을 이해하는 시간이 있어요. 농가 체험과 농기계 안전·운용 교육, 지역 역사·문화 탐방, 로컬 일자리와 귀향 정착 여건 알아보기, 고향살이 경험 나누기까지 이어져요. 참가비는 1인 5만 원 자부담이고 신청은 공고에 안내된 네이버 신청 링크나 QR코드로 해요.",
    region: "전라북도",
    organization: "진안군 농산촌미래국 농촌활력과 마을귀농촌",
    supportType: "교육",
    supportAmount: "2주간 교육·체험·탐방 프로그램 운영 (5가구 모집, 참가비 1인 5만 원 자부담)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "귀향에 관심 있는 진안군 출신 출향민 및 그 가족(친척 포함)만 신청 가능 — 진안 연고가 없는 일반 도시민은 대상 아님. 모집인원 5가구(부부 또는 가족), 1인 가구도 신청 가능하나 부부·가족 단위 우선 선발. 연령 제한 공고 본문에 명시 없음. 참가비 1인 50,000원 자부담. 모집기간 2026. 9. 6.(일)까지, 선정안내 2026. 9. 7.(월), 운영기간 2026. 9. 10.(목) ~ 9. 23.(수) 2주간 평일(월~금). 신청 시작일은 공고 본문에 명시되지 않아 공고 게시일(2026-08-24)을 시작일로 표기함. 신청은 공고에 안내된 네이버폼 링크·QR코드로 접수. 진안군 농산촌미래국 농촌활력과 마을귀농촌(063-430-8072).",
    applicationStart: "2026-08-24",
    applicationEnd: "2026-09-06",
    relatedCrops: [],
    sourceUrl:
      "https://www.jinan.go.kr/board/view.jinan?boardId=BBS_0000026&menuCd=DOM_000000107001001000&paging=ok&startPage=1&dataSid=214764",
    year: 2026,
    category: "facility",
  },
  {
    id: "SP-049",
    title: "2026년 슬기로운 진안생활 참가자 모집 (진안 신규 전입 5년 이내)",
    summary:
      "전북 진안군이 신규 전입 5년 이내 군민에게 귀농귀촌 정책 안내와 1:1 상담을 무료로 제공. 9월 16일부터 매주 수요일 6회, 회차별 10명 선착순.",
    description:
      "전북특별자치도 진안군 농촌활력과가 진안에 갓 자리 잡은 주민을 위해 여는 무료 교육이에요. 대상은 진안군민 가운데 전입한 지 5년이 안 된 신규 전입자라, 아직 진안으로 옮기지 않았다면 신청할 수 없어요. 진안군 귀농귀촌 정책을 짚어 주고 맞춤형 1:1 상담까지 이어 줘서, 어떤 지원을 어떤 순서로 신청해야 하는지 감을 잡기 좋아요. 교육은 2026년 9월 16일부터 11월 25일까지 매주 수요일에 모두 6회 열리고 장소는 진안군귀농귀촌종합지원센터예요. 회차별 정원은 10명이고 정원이 차면 마감해요. 모집은 2026년 8월 28일에 시작해 선착순으로 받고 마감일은 따로 정해 두지 않았어요. 신청은 공고에 안내된 네이버폼이나 QR코드로 하고, 자세한 내용은 진안군 귀농귀촌종합지원센터로 물어보면 돼요.",
    region: "전라북도",
    organization: "진안군 농산촌미래국 농촌활력과 마을귀농촌",
    supportType: "교육",
    supportAmount: "귀농귀촌 정책 안내 + 맞춤형 1:1 상담 교육 6회 무료 (회차별 정원 10명)",
    eligibilityAgeMin: 18,
    eligibilityAgeMax: 99,
    eligibilityDetail:
      "진안군민(신규 전입 5년 이내)만 신청 가능 — 진안군 전입 전인 예비 귀농귀촌인은 대상 아님. 연령 제한 공고 본문에 명시 없음. 모집인원 회차별 10명(정원 모집 시 마감). 교육비 무료. 모집기간 2026년 8월 28일(금) ~ 선착순 마감(마감일 미지정 — 정원이 차면 마감). 교육기간 2026년 9월 16일(수) ~ 11월 25일(수) 매주 수요일 총 6회, 교육장소는 진안군귀농귀촌종합지원센터. 신청은 공고에 안내된 네이버폼·QR코드로 접수. 문의 진안군 귀농귀촌종합지원센터(063-433-0243), 게시 부서 진안군 농산촌미래국 농촌활력과 마을귀농촌(063-430-8072).",
    applicationStart: "2026-08-28",
    applicationEnd: "9999-12-31",
    relatedCrops: [],
    sourceUrl:
      "https://www.jinan.go.kr/board/view.jinan?boardId=BBS_0000026&menuCd=DOM_000000107001001000&paging=ok&startPage=1&dataSid=214939",
    year: 2026,
    category: "settlement",
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

    // ─── 4 chip 그룹 복수 선택(CSV) 지원 (5/20 Sprint P) ───
    // 단일값 / CSV 모두 처리. 같은 그룹 내 OR (선택 중 하나라도 매치), 다른 그룹 간 AND.

    if (filters.region && filters.region !== "전체") {
      const regions = filters.region.split(",").map((s) => s.trim()).filter(Boolean);
      // 프로그램 region이 "전국"이면 모든 선택 region에 매치
      if (program.region !== "전국" && !regions.includes(program.region)) {
        return false;
      }
    }

    if (filters.age) {
      const ageList = filters.age.split(",").map((s) => s.trim()).filter(Boolean);
      // 다중 연령대 중 하나라도 프로그램 자격 범위와 겹치면 통과
      const anyMatch = ageList.some((ageStr) => {
        const range = parseAgeRange(ageStr);
        if (!range) return true; // 파싱 실패는 무시 (안전)
        return !(range.min > program.eligibilityAgeMax || range.max < program.eligibilityAgeMin);
      });
      if (!anyMatch) return false;
    }

    if (filters.supportType && filters.supportType !== "전체") {
      const types = filters.supportType.split(",").map((s) => s.trim()).filter(Boolean);
      if (!types.includes(program.supportType)) {
        return false;
      }
    }

    if (filters.category && filters.category !== "전체") {
      const cats = filters.category.split(",").map((s) => s.trim()).filter(Boolean);
      if (!program.category || !cats.includes(program.category)) {
        return false;
      }
    }

    if (filters.status && filters.status !== "전체") {
      // 5/22 Sprint — status CSV 복수 선택 지원 ("모집중,모집예정")
      const statuses = filters.status.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0 && !statuses.includes(program.status)) {
        return false;
      }
    }

    return true;
  });
}

/** 정렬 키 — 5/22 회장 결재 옵션 A (마감 임박 + 최근 등록)
 *  deadline: 모집중·모집예정 우선 + applicationEnd asc (임박 우선)
 *  recent: createdAt desc (없으면 array index 폴백 — 정적 순서 유지)
 *  인기순은 현 데이터 부재로 제외 (다음 sprint). */
export type ProgramSortKey = "deadline" | "recent";

export const PROGRAM_SORT_OPTIONS: readonly {
  value: ProgramSortKey;
  label: string;
}[] = [
  { value: "deadline", label: "마감 임박순" },
  { value: "recent", label: "최근 등록순" },
];

export const DEFAULT_PROGRAM_SORT: ProgramSortKey = "deadline";

/**
 * 지원사업 정렬.
 * - deadline: 마감(status="마감")은 후순위로 밀고, 그 안에서 applicationEnd asc (임박 우선).
 *   동률 시 9999-12-31(일자 미정) 가장 뒤로.
 * - recent: createdAt desc. 같은 날짜 또는 미설정 시 원본 배열 인덱스 보존 (안정 정렬).
 */
export function sortPrograms(
  programs: SupportProgram[],
  sort: ProgramSortKey,
): SupportProgram[] {
  if (sort === "recent") {
    // 원본 인덱스 기억해 stable sort 보장 (Array.prototype.sort는 v8에서 stable이지만 명시적 보호)
    // createdAt 없을 때 id desc fallback — 정적 데이터가 createdAt을 채우기 전이라도 동작.
    // (5/22 회장 라이브 — 정적 PROGRAMS 30건 모두 createdAt 누락으로 recent 정렬 무동작 사고)
    const indexed = programs.map((p, i) => ({ p, i }));
    indexed.sort((a, b) => {
      const ad = a.p.createdAt ?? "";
      const bd = b.p.createdAt ?? "";
      if (ad && bd) {
        if (ad === bd) return a.i - b.i;
        return bd.localeCompare(ad);
      }
      // 한쪽만 createdAt 있으면 그 항목 우선 (DB 등록일 신뢰)
      if (ad && !bd) return -1;
      if (!ad && bd) return 1;
      // 둘 다 없으면 id desc — SP-030 같이 큰 번호가 최근 큐레이션 (정적 데이터 관행)
      const aid = a.p.id ?? "";
      const bid = b.p.id ?? "";
      if (aid === bid) return a.i - b.i;
      return bid.localeCompare(aid);
    });
    return indexed.map((x) => x.p);
  }
  // deadline (default)
  const indexed = programs.map((p, i) => ({ p, i }));
  indexed.sort((a, b) => {
    const aClosed = a.p.status === "마감" ? 1 : 0;
    const bClosed = b.p.status === "마감" ? 1 : 0;
    if (aClosed !== bClosed) return aClosed - bClosed;
    // 일자 미정(9999-12-31)은 뒤로
    const ae = a.p.applicationEnd || "9999-12-31";
    const be = b.p.applicationEnd || "9999-12-31";
    if (ae === be) return a.i - b.i;
    return ae.localeCompare(be);
  });
  return indexed.map((x) => x.p);
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
      // 5/22 Sprint — status CSV 복수 선택 지원
      const statuses = filters.status.split(",").map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0 && !statuses.includes(program.status)) return false;
    }
    return true;
  });

  // 크롤 row 동일 모사업 그룹핑 (대표 1건 + "외 N개 지역"). 정적·API row는 통과.
  // 목록 조립 단계에서 적용해 SSR·loadMore·테이블 뷰가 동일하게 collapse된다.
  return { programs: groupCrawlRows(filtered), source };
}
