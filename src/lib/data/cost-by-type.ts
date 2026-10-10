/* ────────────────────────────────────────────────────────────────
   비용 가이드 — 카테고리별 데이터 (5종 분기)
   /costs?type={farming|village|youth|forestry|smartfarm}

   원칙 (10/10 정정):
   - 작물 행의 숫자는 작물 상세(crops.ts CROP_DETAILS)에서 읽는다 — 여기서 숫자를 다시 적지 않는다.
   - 소득은 공식 통계(농촌진흥청 「2025년도 농산물 소득 조사」·통계청 농축산물생산비조사)가 출처인 10a당 값만.
     그 밖의 작물은 "자료 없음"으로 둔다(지어내지 않는다).
   - 정책 금액(한도·금리·지원금)은 policy-facts.ts 에서 가져온다.

   10/10 에 지운 것 — 초기 투자금·연 운영비·손익분기 범위(23행 × 3칸)와 노동일수: 출처로 적은 "농진청 표준소득자료집"은
   10a당 경영비·소득 자료라 총 투자액·손익분기 칸과 대응하지 않았고, 노동일수는 같은 작물의 작물 상세 값과 20행 중 17행이 달랐다.
   귀산촌 임산물 6행은 공식 소득 통계 출처가 확인되지 않아 뺐다.
   ──────────────────────────────────────────────────────────────── */

import type { CostTypeId } from "./landing";
import { CROPS, CROP_DETAILS } from "./crops";
import {
  RETURN_FARM_LOAN,
  YOUTH_SETTLEMENT,
  EXCELLENT_SUCCESSOR,
  formatManwon,
} from "./policy-facts";

/* ── 타입 정의 ── */

export interface CropCost {
  /** 카드 표시용 ID (slug) */
  id: string;
  /** 작물 상세 페이지 ID — CROPS 에 있는 id 만 쓴다 */
  cropPageId: string;
  /** 작물명 (한글) — 작물 DB 이름 */
  name: string;
  /** 10a당 소득 — "약 180만 원"(단위 면적은 표 머리·라벨이 '10a당'으로 밝힌다). 공식 통계가 없으면 "자료 없음" */
  income: string;
  /** 10a당 소득 범위 (만 원) — [하한, 상한], 단일값이면 둘이 같다. 공식 통계가 없으면 null */
  incomeManwon10a: readonly [number, number] | null;
  /** 소득 기준 — "시설재배 기준" 같은 원문 괄호. 없으면 생략 */
  basis?: string;
  /** 연간 노동일수 — "연 100~130일" (작물 상세 annualWorkdays). 없으면 "자료 없음" */
  labor: string;
  /** 난이도 (작물 DB) */
  difficulty: "쉬움" | "보통" | "어려움";
  /** 소득 출처 */
  source: string;
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
   1. CROP_COSTS_BY_TYPE — 카테고리별 대표 작물 (값은 작물 상세에서)
   ──────────────────────────────────────────────────────────────── */

/** 공식 소득 통계로 인정하는 출처 — 작물 상세 income.source 에 이 이름이 있어야 소득을 보여 준다 */
const OFFICIAL_INCOME_SOURCE = /2025년도 농산물 소득 조사|농축산물생산비조사/;

/** "10a당 약 1,260~1,642만 원 (토경~수경재배 기준)" → { amount: "약 1,260~1,642만 원", basis: "토경~수경재배 기준" } */
function splitRevenue(
  revenueRange: string,
): { amount: string; range: readonly [number, number]; basis?: string } | null {
  const m = revenueRange.match(/^10a당\s*(약\s*([\d,]+)(?:\s*~\s*([\d,]+))?\s*만\s*원)\s*(?:\(([^)]*)\))?/);
  if (!m) return null;
  const lo = Number(m[2].replace(/,/g, ""));
  const hi = m[3] ? Number(m[3].replace(/,/g, "")) : lo;
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;
  const basis = m[4]?.trim();
  // "3,000평 재배 시 연 약 571만 원" 같은 환산 괄호는 기준이 아니라 계산 예시라 뺀다
  return { amount: m[1].replace(/\s+/g, " "), range: [lo, hi], basis: basis && !/[\d,]+평/.test(basis) ? basis : undefined };
}

/** "약 100~130일 (수확·건조 포함)" → "연 100~130일" */
function toLaborLabel(annualWorkdays: string | undefined): string {
  const m = annualWorkdays?.match(/([\d,]+(?:\s*~\s*[\d,]+)?)\s*일/);
  return m ? `연 ${m[1].replace(/\s+/g, "")}일` : "자료 없음";
}

/** 작물 id → 비용 화면 행. 작물 DB 에 없는 id 는 만들지 않는다(테스트가 잡는다) */
export function cropCostRow(cropId: string, id: string = cropId): CropCost | null {
  const crop = CROPS.find((c) => c.id === cropId);
  const detail = CROP_DETAILS.find((d) => d.id === cropId);
  if (!crop || !detail) return null;
  const official = OFFICIAL_INCOME_SOURCE.test(detail.income.source ?? "");
  const revenue = official ? splitRevenue(detail.income.revenueRange) : null;
  return {
    id,
    cropPageId: crop.id,
    name: crop.name,
    income: revenue?.amount ?? "자료 없음",
    incomeManwon10a: revenue?.range ?? null,
    basis: revenue?.basis,
    labor: toLaborLabel(detail.income.annualWorkdays),
    difficulty: crop.difficulty,
    source: revenue ? (detail.income.source ?? "") : "작물 상세",
  };
}

const rows = (ids: readonly string[]): CropCost[] =>
  ids.map((id) => cropCostRow(id)).filter((r): r is CropCost => r !== null);

export const CROP_COSTS_BY_TYPE: Record<CostTypeId, CropCost[]> = {
  /* 정착 일반 — 노지 밭작물 + 대표 과수 */
  farming: rows(["soybean", "corn", "sweet-potato", "chili-pepper", "perilla-seed", "apple"]),
  /* 청년농 — 시설 작물 + 고소득 품목 */
  /* 10/10: 표고버섯은 공식 소득 통계(2025 소득조사)에 없어 같은 시설 작물인 오이로 바꿨다 */
  youth: rows(["strawberry", "tomato", "blueberry", "cucumber", "ginseng", "chili-pepper"]),
  /* 귀촌 — visibleSections 에 'crop' 미포함 */
  village: [],
  /* 귀산촌 — 임산물 소득은 공식 통계 출처를 확인하지 못해 비워 둔다(10/10) */
  forestry: [],
  /* 스마트팜 — 시설원예 주력 품목(국회예산정책처 2020 보급 면적 비중 상위 + 엽채) */
  smartfarm: rows(["strawberry", "tomato", "paprika", "rose", "lettuce"]),
};

/* ────────────────────────────────────────────────────────────────
   2. STRATEGIES_BY_TYPE — 카테고리별 비용 절감 전략
   ──────────────────────────────────────────────────────────────── */

const _startup = formatManwon(RETURN_FARM_LOAN.startupMaxManwon.value);
const _housing = formatManwon(RETURN_FARM_LOAN.housingMaxManwon.value);
const _youthMonthly = YOUTH_SETTLEMENT.monthlyManwonByYear.value;
const _youthTotal = _youthMonthly.reduce((sum, m) => sum + m * 12, 0);
const _youthDesc = `만 ${YOUTH_SETTLEMENT.ageRange.value[0]}~${YOUTH_SETTLEMENT.ageRange.value[1]}세 청년 창업농에게 월 ${_youthMonthly.join("·")}만 원을 3년간 지급해요. (매년 감액)`;
const _youthSaving = `최대 ${formatManwon(_youthTotal)}`;

export const STRATEGIES_BY_TYPE: Record<CostTypeId, CostStrategy[]> = {
  /* ── 정착 일반 ── */
  farming: [
    {
      title: "농업창업자금 융자",
      desc: `농지·시설·장비 구입에 최대 ${_startup}을 ${RETURN_FARM_LOAN.interestRate.value} 금리로 융자받을 수 있어요(${RETURN_FARM_LOAN.repayment.value}).`,
      saving: `최대 ${_startup}`,
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "청년창업농 영농정착",
      desc: _youthDesc,
      saving: _youthSaving,
      href: "/programs/SP-002",
      type: "보조금",
      programId: "SP-002",
      kind: "system",
    },
    /* 10/10: '투자금 50%↓'는 근거가 없어 지웠다 — 비율 대신 비교할 수 있는 곳으로 보낸다 */
    {
      title: "소규모로 시작하기",
      desc: "임대 농지와 노지 재배로 시작하면 처음 사야 할 것이 줄어요. 작물마다 소득과 노동일이 달라 먼저 비교해 보세요.",
      saving: "작물별 소득 비교",
      href: "/crops",
      kind: "system",
    },
    {
      title: "체류형 귀농 프로그램",
      // 2026-10-06: '무상'은 원문(함평 SP-005)에 없다 — 원문은 21세대·3~11월 9개월 체류·공동 실습 농지·시설하우스
      desc: "21세대 체류형 주거와 공동 실습 농지·시설하우스를 쓰며 9개월간(3~11월) 귀농을 준비할 수 있어요. (예: 함평군)",
      saving: "9개월 체류 교육",
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
      desc: _youthDesc,
      saving: _youthSaving,
      href: "/programs/SP-002",
      type: "보조금",
      programId: "SP-002",
      kind: "system",
    },
    {
      title: "농업창업·주택구입 융자",
      desc: `농업창업 최대 ${_startup}, 주택구입 최대 ${_housing}을 ${RETURN_FARM_LOAN.interestRate.value} 금리로 융자해요. 영농교육 ${RETURN_FARM_LOAN.minEducationHours.value}시간 이상 이수가 자격이고, ${RETURN_FARM_LOAN.lowestGradeBelowHours.value}시간 미만이면 심사 최저 등급이라 사실상 ${RETURN_FARM_LOAN.lowestGradeBelowHours.value}시간이 기준이에요.`,
      saving: `최대 ${formatManwon(RETURN_FARM_LOAN.startupMaxManwon.value + RETURN_FARM_LOAN.housingMaxManwon.value)}`,
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "우수후계농업경영인 육성자금",
      desc: `후계농 선정 5년 이상 영농 종사자가 대상이에요. ${EXCELLENT_SUCCESSOR.interestRate.value}·${EXCELLENT_SUCCESSOR.repayment.value}.`,
      saving: `최대 ${formatManwon(EXCELLENT_SUCCESSOR.maxManwon.value)}`,
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
    /* 10/10: '초기비용 70%↓'·'1억 원 이상 절감'은 근거가 없어 지웠다 */
    {
      title: "임차로 시작하기",
      desc: "구입 대신 전·월세로 먼저 살아 보면 지역이 맞는지 확인한 뒤 집을 고를 수 있어요. 지역별로 비교해 보세요.",
      saving: "살아 보고 결정",
      href: "/regions",
      kind: "system",
    },
    {
      title: "주택구입 융자 (귀농할 때)",
      // 2026-10-06: 2026 시행지침상 지원 대상은 귀농인·재촌비농업인(주택자금 제외)·귀농희망자 — 귀촌만으로는 대상이 아니다.
      // 옛 문구 '귀촌인에게 … 융자'는 자격을 잘못 안내했다(군산시 공고 첨부 「2026년 귀농 농업창업 및 주택구입 지원사업 시행지침」)
      desc: `귀촌만으로는 대상이 아니에요. 농업인이 되려고 농촌으로 옮긴 귀농인(귀농 희망자 포함)이면 주택 구입·신축에 최대 ${_housing}을 ${RETURN_FARM_LOAN.interestRate.value} 금리로 융자받을 수 있어요.`,
      saving: `귀농 시 최대 ${_housing}`,
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "체류형 귀농인의 집",
      // 2026-10-06: '무상'은 원문(무안 SP-007)에 없다 — 원문은 약 10개월 체류·주거 8호·시설하우스·실습포장
      desc: "약 10개월간 체류형 주거에 머물며 영농 이론·실습 교육을 받고 정착 전 지역을 충분히 겪어 볼 수 있어요. 비용 조건은 공고문에서 확인하세요. (예: 무안군)",
      saving: "약 10개월 체류 교육",
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
      /* 10/10: 'ICT 융자'는 ICT 전용 사업이 아니라 귀농 농업창업자금(SP-001) — 이름을 그대로 쓴다 */
      title: "농업창업자금 융자",
      desc: "귀농인이면 스마트팜 설비·농지 확보에도 쓸 수 있는 귀농 농업창업자금 융자예요.",
      saving: `최대 ${_startup}`,
      href: "/programs/SP-001",
      type: "융자",
      programId: "SP-001",
      kind: "system",
    },
    {
      title: "귀농닥터 1:1 멘토링 (무료)",
      // 2026-10-06: 운영 기관 원문(그린대로 귀농닥터, 농정원) — 1~11월 신청(예산 소진 시 조기 마감)·연 최대 8회·교육비 무료
      desc: "농정원 귀농귀촌종합센터가 분야별 전문가·귀농 선배와 1:1로 연결해 현장 멘토링을 해 줘요. 신청은 매년 1~11월 그린대로에서 받고, 예산이 소진되면 일찍 마감될 수 있어요.",
      saving: "연 최대 8회 무료",
      href: "/programs/SP-011",
      type: "컨설팅",
      programId: "SP-011",
      kind: "system",
    },
    {
      title: "혁신밸리 청년 보육센터 교육",
      desc: "상주·고흥·김제·밀양 4개 혁신밸리에서 20개월 입문→실습 교육을 국비 무료로 받아요. 만 18~39세 대상.",
      saving: "교육비 무료 + 실습비 월 최대 70만 원",
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

// 10/3 정정: 근거 없는 비교 행(주거비·주거 형태·5년차 소득 도시 값·생활 만족도·미세먼지·산림소득·시설농 매출)을
// cityVsRural 에서 지웠다. 남은 "월 생활비"는 귀농 가구 값이라 귀촌·귀산촌·스마트팜은 비교 섹션 자체를 끈다
// (COST_TYPE_PROFILES.visibleSections) — 여기 빈 배열은 그 상태를 명시할 뿐이다.
export const COMPARE_LABELS_BY_TYPE: Record<CostTypeId, string[]> = {
  farming: ["월 생활비"],
  youth: ["월 생활비"],
  village: [],
  forestry: [],
  smartfarm: [],
};
