/* ────────────────────────────────────────────────────────────────
   비용 가이드 — 카테고리별 데이터 (5종 분기)
   /costs?type={farming|village|youth|forestry|smartfarm}

   출처 (코드 변경 시 갱신 필수):
   - 농림축산식품부 2025 귀농귀촌 실태조사
   - 농촌진흥청(RDA) 2024 농축산물 표준소득자료집
   - 농촌진흥청 ICT 스마트팜 시설 단가 자료
   - 산림청 2024 임업경영실태조사 / 임업통계연보
   - 산림청 임산물 표준소득
   - 농식품부 스마트팜 혁신밸리 사업 안내(상주·고흥·김제·밀양)
   - 청년창업농 영농정착 시행지침 2025

   원칙:
   - 모든 작물 데이터에 source 필수
   - 단가는 범위(min~max)로 표기, 단일값 금지
   - 손익분기 7년+ 작물(산양삼·호두 등)은 difficulty="어려움"
   - 정적 폴백/참고값 — 실시간 시세 아님
   ──────────────────────────────────────────────────────────────── */

import type { CostTypeId } from "./landing";

/* ── 타입 정의 ── */

export interface CropCost {
  /** 카드 표시용 ID (slug) */
  id: string;
  /** 작물명 (한글) */
  name: string;
  /** 초기 투자금 범위 (만원 단위, 텍스트) */
  initialCost: string;
  /** 연 운영비 범위 (만원, 텍스트) */
  annual: string;
  /** 손익분기 도달 연차 */
  breakEven: string;
  /** 연간 노동일수 */
  labor: string;
  /** 난이도 */
  difficulty: "쉬움" | "보통" | "어려움";
  /** 데이터 출처 (필수) */
  source: string;
  /** 시설 형태 */
  facilityType?: "노지" | "비닐하우스" | "유리온실" | "임산물 시설" | "원목" | "소규모";
  /**
   * 작물 상세 페이지 ID — 존재하지 않으면 카드는 Link가 아닌 div로 렌더링.
   * id와 cropPageId가 같으면 /crops/{id}로 이동.
   */
  cropPageId?: string;
  /** 참고값임을 표시 (range-only 카테고리) */
  isReference?: boolean;
}

export interface CostStrategy {
  title: string;
  desc: string;
  saving: string;
  /** 내부 라우트 또는 외부 정부 사이트 URL */
  href: string;
  type?: string;
  programId?: string;
  /** true면 외부 링크 — 새 탭으로 열고 a 태그로 렌더링 */
  external?: boolean;
  /**
   * 카드 성격 분류 — 비용 페이지에서 두 섹션으로 분리 렌더링
   * - "system": 상시 의미 있는 제도 안내 (한도·금리·자격이 핵심 정보, 매년 정기 모집되더라도 안내 자체가 가치)
   * - "round": 특정 회차 모집 사업 (현재 진행 중일 때만 신청 가능, 마감 시 다음 회차 안내)
   */
  kind: "system" | "round";
}

/* ────────────────────────────────────────────────────────────────
   1. CROP_COSTS_BY_TYPE — 카테고리별 작물별 투자비용
   ──────────────────────────────────────────────────────────────── */

/* 출처 약어 */
const SRC_RDA = "농촌진흥청 2024 농축산물 표준소득자료집";
const SRC_RDA_FOREST = "산림청 2024 임산물 표준소득";
const SRC_FOREST_REPORT = "산림청 2024 임업경영실태조사";
const SRC_RDA_ICT = "농촌진흥청 ICT 스마트팜 시설 단가 (2024)";
const SRC_MAFRA_VALLEY = "농식품부 스마트팜 혁신밸리 사업 안내";
const SRC_RDA_YOUTH = "농촌진흥청 표준소득자료집 + 청년창업농 인기품목 통계";

export const CROP_COSTS_BY_TYPE: Record<CostTypeId, CropCost[]> = {
  /* ── 귀농 일반 — 노지 밭작물 + 대표 과수 ── */
  farming: [
    {
      id: "soybean",
      cropPageId: "soybean",
      name: "콩",
      initialCost: "300만~500만 원",
      annual: "150만~250만 원",
      breakEven: "1~2년",
      labor: "연 30~50일",
      difficulty: "쉬움",
      facilityType: "노지",
      source: SRC_RDA,
    },
    {
      id: "corn",
      cropPageId: "corn",
      name: "옥수수",
      initialCost: "500만~1,000만 원",
      annual: "200만~400만 원",
      breakEven: "1~2년",
      labor: "연 30~50일",
      difficulty: "쉬움",
      facilityType: "노지",
      source: SRC_RDA,
    },
    {
      id: "sweet-potato",
      cropPageId: "sweet-potato",
      name: "고구마",
      initialCost: "1,000만~2,000만 원",
      annual: "300만~500만 원",
      breakEven: "1~2년",
      labor: "연 60~90일",
      difficulty: "쉬움",
      facilityType: "노지",
      source: SRC_RDA,
    },
    {
      id: "chili-pepper",
      cropPageId: "chili-pepper",
      name: "고추",
      initialCost: "2,000만~4,000만 원",
      annual: "600만~1,000만 원",
      breakEven: "2~3년",
      labor: "연 80~120일",
      difficulty: "어려움",
      facilityType: "노지",
      source: SRC_RDA,
    },
    {
      id: "perilla-seed",
      cropPageId: "perilla-seed",
      name: "들깨",
      initialCost: "300만~600만 원",
      annual: "150만~300만 원",
      breakEven: "1~2년",
      labor: "연 30~50일",
      difficulty: "쉬움",
      facilityType: "노지",
      source: SRC_RDA,
    },
    {
      id: "apple",
      cropPageId: "apple",
      name: "사과",
      initialCost: "3,000만~6,000만 원",
      annual: "1,000만~1,500만 원",
      breakEven: "5~7년",
      labor: "연 150~200일",
      difficulty: "어려움",
      facilityType: "노지",
      source: SRC_RDA,
    },
  ],

  /* ── 청년농 — 시설 작물 + 고소득 품목 ── */
  youth: [
    {
      id: "strawberry",
      cropPageId: "strawberry",
      name: "딸기 (시설)",
      initialCost: "5,000만~1억 원",
      annual: "1,500만~2,500만 원",
      breakEven: "3~5년",
      labor: "연 250일+",
      difficulty: "어려움",
      facilityType: "비닐하우스",
      source: SRC_RDA_YOUTH,
    },
    {
      id: "tomato",
      cropPageId: "tomato",
      name: "토마토 (시설)",
      initialCost: "4,000만~8,000만 원",
      annual: "1,200만~2,000만 원",
      breakEven: "3~4년",
      labor: "연 200~280일",
      difficulty: "어려움",
      facilityType: "비닐하우스",
      source: SRC_RDA_YOUTH,
    },
    {
      id: "blueberry",
      cropPageId: "blueberry",
      name: "블루베리",
      initialCost: "2,500만~5,000만 원",
      annual: "800만~1,500만 원",
      breakEven: "4~5년",
      labor: "연 100~150일",
      difficulty: "보통",
      facilityType: "노지",
      source: SRC_RDA_YOUTH,
    },
    {
      id: "shiitake-bag",
      cropPageId: "shiitake",
      name: "표고 (소규모)",
      initialCost: "1,500만~3,000만 원",
      annual: "500만~900만 원",
      breakEven: "2~3년",
      labor: "연 120~180일",
      difficulty: "보통",
      facilityType: "소규모",
      source: SRC_RDA_FOREST,
    },
    {
      id: "ginseng",
      cropPageId: "ginseng",
      name: "인삼",
      initialCost: "3,000만~5,000만 원",
      annual: "800만~1,200만 원",
      breakEven: "5~6년",
      labor: "연 100~160일",
      difficulty: "어려움",
      facilityType: "노지",
      source: SRC_RDA_YOUTH,
    },
    {
      id: "chili-pepper",
      cropPageId: "chili-pepper",
      name: "고추",
      initialCost: "2,000만~4,000만 원",
      annual: "600만~1,000만 원",
      breakEven: "2~3년",
      labor: "연 80~120일",
      difficulty: "어려움",
      facilityType: "노지",
      source: SRC_RDA,
    },
  ],

  /* ── 귀촌 — visibleSections에 'crop' 미포함이지만 안전 빈 배열 ── */
  village: [],

  /* ── 귀산촌 — 임산물 (손익분기 7년+ 품목 다수) ── */
  forestry: [
    {
      id: "shiitake-log",
      cropPageId: "shiitake",
      name: "표고 (원목)",
      initialCost: "1,500만~3,500만 원",
      annual: "500만~1,000만 원",
      breakEven: "3~4년",
      labor: "연 120~200일",
      difficulty: "보통",
      facilityType: "원목",
      source: SRC_RDA_FOREST,
      isReference: true,
    },
    {
      id: "wild-ginseng",
      name: "산양삼",
      initialCost: "2,000만~5,000만 원",
      annual: "300만~600만 원",
      breakEven: "7~10년",
      labor: "연 60~100일",
      difficulty: "어려움",
      facilityType: "임산물 시설",
      source: SRC_RDA_FOREST,
      isReference: true,
    },
    {
      id: "bellflower",
      cropPageId: "bellflower",
      name: "도라지",
      initialCost: "500만~1,500만 원",
      annual: "200만~400만 원",
      breakEven: "3~4년",
      labor: "연 50~90일",
      difficulty: "보통",
      facilityType: "노지",
      source: SRC_RDA_FOREST,
      isReference: true,
    },
    {
      id: "chestnut",
      name: "밤",
      initialCost: "1,500만~3,000만 원",
      annual: "400만~800만 원",
      breakEven: "5~7년",
      labor: "연 60~100일",
      difficulty: "보통",
      facilityType: "노지",
      source: SRC_RDA_FOREST,
      isReference: true,
    },
    {
      id: "omija",
      name: "오미자",
      initialCost: "1,500만~3,500만 원",
      annual: "500만~900만 원",
      breakEven: "4~5년",
      labor: "연 80~140일",
      difficulty: "보통",
      facilityType: "노지",
      source: SRC_RDA_FOREST,
      isReference: true,
    },
    {
      id: "walnut",
      name: "호두",
      initialCost: "2,000만~4,000만 원",
      annual: "400만~800만 원",
      breakEven: "7~10년",
      labor: "연 50~80일",
      difficulty: "어려움",
      facilityType: "노지",
      source: SRC_FOREST_REPORT,
      isReference: true,
    },
  ],

  /* ── 스마트팜 — ICT 시설 작물 (1,000㎡ 기준 단가) ── */
  smartfarm: [
    {
      id: "strawberry-ict",
      cropPageId: "strawberry",
      name: "딸기 (ICT)",
      initialCost: "8,000만~1.5억 원",
      annual: "2,000만~3,500만 원",
      breakEven: "3~5년",
      labor: "연 220~280일",
      difficulty: "어려움",
      facilityType: "비닐하우스",
      source: SRC_RDA_ICT,
      isReference: true,
    },
    {
      id: "tomato-ict",
      cropPageId: "tomato",
      name: "토마토 (ICT)",
      initialCost: "7,000만~1.2억 원",
      annual: "1,800만~2,800만 원",
      breakEven: "3~4년",
      labor: "연 200~260일",
      difficulty: "어려움",
      facilityType: "비닐하우스",
      source: SRC_RDA_ICT,
      isReference: true,
    },
    {
      id: "paprika-glass",
      name: "파프리카 (유리온실)",
      initialCost: "1.5억~2.5억 원",
      annual: "3,000만~5,000만 원",
      breakEven: "4~6년",
      labor: "연 240~300일",
      difficulty: "어려움",
      facilityType: "유리온실",
      source: SRC_RDA_ICT,
      isReference: true,
    },
    {
      id: "rose-flower",
      name: "장미 (화훼)",
      initialCost: "1.2억~2억 원",
      annual: "2,500만~4,000만 원",
      breakEven: "4~5년",
      labor: "연 250일+",
      difficulty: "어려움",
      facilityType: "유리온실",
      source: SRC_RDA_ICT,
      isReference: true,
    },
    {
      id: "lettuce-hydro",
      cropPageId: "lettuce",
      name: "엽채 (수경)",
      initialCost: "5,000만~1억 원",
      annual: "1,200만~2,000만 원",
      breakEven: "3~4년",
      labor: "연 180~220일",
      difficulty: "보통",
      facilityType: "비닐하우스",
      source: SRC_MAFRA_VALLEY,
      isReference: true,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────
   2. STRATEGIES_BY_TYPE — 카테고리별 비용 절감 전략
   ──────────────────────────────────────────────────────────────── */

export const STRATEGIES_BY_TYPE: Record<CostTypeId, CostStrategy[]> = {
  /* ── 귀농 일반 ── */
  farming: [
    {
      title: "농업창업자금 융자",
      desc: "농지·시설·장비 구입에 최대 3억 원을 연 2% 저금리로 융자받을 수 있어요.",
      saving: "최대 3억 원",
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "청년창업농 영농정착",
      desc: "만 18~39세 청년 창업농에게 월 110·100·90만 원을 3년간 지급해요. (매년 감액)",
      saving: "최대 3,600만 원",
      href: "/programs/SP-002",
      type: "보조금",
      programId: "SP-002",
      kind: "system",
    },
    {
      title: "소규모로 시작하기",
      desc: "임대 농지 + 노지 재배로 시작하면 초기 투자를 크게 줄일 수 있어요.",
      saving: "투자금 50%↓",
      href: "/crops",
      kind: "system",
    },
    {
      title: "체류형 귀농 프로그램",
      desc: "주거+농지+시설을 무상 제공받으며 수개월간 귀농을 체험할 수 있어요.",
      saving: "체류 기간 무상",
      href: "/programs/SP-005",
      type: "현물",
      programId: "SP-005",
      kind: "round",
    },
  ],

  /* ── 청년농 ── */
  youth: [
    {
      title: "영농정착지원금",
      desc: "만 18~39세 청년 창업농에게 월 110·100·90만 원을 3년간 지급해요. (매년 감액)",
      saving: "최대 3,600만 원",
      href: "/programs/SP-002",
      type: "보조금",
      programId: "SP-002",
      kind: "system",
    },
    {
      title: "농업창업·주택구입 융자",
      desc: "농업창업 최대 3억 원, 주택구입 최대 7,500만 원을 연 2% 저금리로 융자해요. 영농교육 100시간 이상 이수 필요.",
      saving: "최대 3.75억 원",
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "후계농업경영인 육성자금",
      desc: "후계농 선정 5년 이상 영농 종사자가 대상. 연 1.5% 고정금리·5년 거치 10년 상환.",
      saving: "최대 2억 원",
      href: "/programs/SP-013",
      type: "융자",
      programId: "SP-013",
      kind: "system",
    },
    {
      title: "농지은행 농지임대수탁",
      desc: "직접 농지를 사기 어려울 때 농지은행이 임대를 중개해요. 매입 부담 없이 임차로 시작 가능해요.",
      saving: "매입 부담 없음",
      href: "https://www.fbo.or.kr/",
      type: "현물",
      external: true,
      kind: "system",
    },
  ],

  /* ── 귀촌 ── */
  village: [
    {
      title: "귀농귀촌종합센터 상담",
      desc: "1899-9097 종합센터에서 시·군별 정착지원 사업·교육·상담을 안내받을 수 있어요.",
      saving: "상담 무료",
      href: "https://www.gov.kr/portal/service/serviceInfo/154300000321",
      type: "기타",
      external: true,
      kind: "system",
    },
    {
      title: "임차로 시작하기",
      desc: "구입 대신 전·월세로 시작하면 초기 부담을 1억 원 이상 줄일 수 있어요. 지역별 시세를 비교해보세요.",
      saving: "초기비용 70%↓",
      href: "/regions",
      kind: "system",
    },
    {
      title: "주택구입 융자",
      desc: "귀촌인에게 주택 구입·신축에 최대 7,500만 원을 연 2%로 융자해요.",
      saving: "최대 7,500만 원",
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "체류형 귀농인의 집",
      desc: "10개월간 무상 체류 주거 + 영농 교육으로 귀촌 전 지역을 충분히 체험할 수 있어요. (예: 무안군)",
      saving: "10개월 주거 무상",
      href: "/programs/SP-007",
      type: "현물",
      programId: "SP-007",
      kind: "round",
    },
  ],

  /* ── 귀산촌 ── */
  forestry: [
    {
      title: "산림청 귀산촌 창업자금",
      desc: "임야 매입·시설 투자·임산물 생산에 최대 3억 원을 저금리로 융자해요.",
      saving: "최대 3억 원",
      href: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_000434&mn=AR02_06_02_02",
      type: "융자",
      external: true,
      kind: "system",
    },
    {
      title: "산촌공동체 활성화 사업",
      desc: "산림청이 산촌마을 공동체에 사업화 컨설팅·제품 상품화를 지원해요. 마을 단위 협업으로 비용 분담 가능.",
      saving: "공동체 단위 지원",
      href: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_001573&mn=AR02_06_01_03",
      type: "현물",
      external: true,
      kind: "system",
    },
    {
      title: "단기소득임산물 가공 지원",
      desc: "표고·산양삼 등 임산물 2차 가공 시설·장비 투자를 산림청이 지원해요. (국비 10억원 한도)",
      saving: "국비 최대 10억 원",
      href: "https://www.forest.go.kr/kfsweb/kfi/kfs/cms/cmsView.do?cmsId=FC_001047&mn=AR01_05_01_01",
      type: "보조금",
      external: true,
      kind: "system",
    },
    {
      title: "산림복지전문업 등록",
      desc: "산림복지전문가 자격 취득 후 진흥원 시스템에 전문업으로 등록·운영할 수 있어요. 임산물 외 추가 수입원이 돼요.",
      saving: "자격 등록·운영 안내",
      href: "https://forestjobs.fowi.or.kr/jobs/contents/kindRegistStdrView.do",
      type: "기타",
      external: true,
      kind: "system",
    },
  ],

  /* ── 스마트팜 ── */
  smartfarm: [
    {
      title: "스마트팜 ICT 융복합 확산사업",
      desc: "농식품부 보조사업으로 ICT 시설·환경제어 장비를 국비+지방비+자부담으로 지원받아요.",
      saving: "국비·지방비 보조",
      href: "https://smartfarmkorea.net/charge/supBusinessList.do?menuId=M11020301",
      type: "보조금",
      external: true,
      kind: "system",
    },
    {
      title: "ICT 융자 (3억)",
      desc: "스마트팜 설비·농지 확보를 위한 농업창업자금 융자 한도예요.",
      saving: "최대 3억 원",
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "귀농닥터 1:1 멘토링 (무료)",
      desc: "농촌진흥청·시군 농업기술센터에서 선도농가 1:1 현장 컨설팅을 무료로 제공해요. 상시 신청 가능.",
      saving: "컨설팅 무료",
      href: "/programs/SP-011",
      type: "컨설팅",
      programId: "SP-011",
      kind: "system",
    },
    {
      title: "혁신밸리 청년 보육센터 교육",
      desc: "상주·고흥·김제·밀양 4개 혁신밸리에서 20개월 입문→실습 교육을 국비 무료로 받아요. 만 18~39세 대상.",
      saving: "교육비 무료 + 실습비 월 70만 원",
      href: "/programs/SP-012",
      type: "교육",
      programId: "SP-012",
      kind: "round",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────
   3. COMPARE_LABELS_BY_TYPE — 카테고리별 도시 vs 농촌 비교 행 화이트리스트
   landing.ts cityVsRural 배열에서 label로 필터링됨
   ──────────────────────────────────────────────────────────────── */

export const COMPARE_LABELS_BY_TYPE: Record<CostTypeId, string[]> = {
  farming: ["월 생활비", "주거비 (3.3㎡당)", "5년차 소득", "생활 만족도"],
  youth: ["월 생활비", "주거비 (3.3㎡당)", "5년차 소득", "생활 만족도"],
  village: ["월 생활비", "주거비 (3.3㎡당)", "주거 형태", "생활 만족도"],
  forestry: [
    "주거비 (3.3㎡당)",
    "미세먼지 (PM2.5)",
    "주거 형태",
    "생활 만족도",
    "산림소득",
  ],
  smartfarm: [
    "주거비 (3.3㎡당)",
    "5년차 소득",
    "시설농 매출",
    "생활 만족도",
  ],
};
