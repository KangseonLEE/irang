/* ==========================================================================
   농촌체류형 쉼터 가이드 데이터
   시행일: 2024-12-24 (농지법 시행령·시행규칙 개정, 2025년 1월 본격 시행)
   ========================================================================== */

export interface ShelterSource {
  label: string;
  url: string;
  /** 이 소스에서 확인한 항목(행번호/키) */
  covers: string[];
  /** 확인일 (YYYY-MM-DD) */
  verified: string;
}

export interface ShelterRule {
  id: string;
  title: string;
  /** 본문 설명 — 공식 원문 기반 */
  description: string;
  /** 인용 가능한 공식 문장 (짧게) */
  quote?: string;
  /** 이 규정이 연결된 소스 id 목록 */
  sourceIds: string[];
}

export interface ShelterComparison {
  field: string;
  shelter: string;
  farmShed: string; // 농막
}

export const SHELTER_SOURCES: Record<string, ShelterSource> = {
  mafra_main: {
    label: "농림축산식품부 — 농촌체류형 쉼터란?",
    url: "https://www.mafra.go.kr/home/5594/subview.do",
    covers: ["시행일", "설치장소", "존치기간", "신고"],
    verified: "2026-04-15",
  },
  mafra_procedure: {
    label: "농림축산식품부 — 설치 절차",
    url: "https://www.mafra.go.kr/home/5595/subview.do",
    covers: ["부속시설", "설치장소", "신고"],
    verified: "2026-04-15",
  },
  korea_briefing: {
    label: "대한민국 정책브리핑 — 부처 브리핑",
    url: "https://www.korea.kr/briefing/policyBriefingView.do?newsId=156657175",
    covers: ["33㎡ 근거", "부속시설", "농막 전환"],
    verified: "2026-04-15",
  },
  korea_news: {
    label: "정책브리핑 — 2024-12-24 본격 시행",
    url: "https://www.korea.kr/news/policyNewsView.do?newsId=148938994",
    covers: ["시행일", "신고", "농막 전환"],
    verified: "2026-04-15",
  },
  law: {
    label: "법제처 국가법령정보센터 — 농지법",
    url: "https://www.law.go.kr/LSW/lsInfoP.do?lsId=000479",
    covers: ["법적 근거"],
    verified: "2026-04-15",
  },
};

/** 제도 요약 — 한 줄 */
export const SHELTER_SUMMARY =
  "본인 소유 농지에 연면적 33㎡ 이하의 임시 주거용 시설을 설치하고 체류할 수 있는 제도예요.";

export const SHELTER_EFFECTIVE_DATE = "2024-12-24";

/** 핵심 규정 블록 */
export const SHELTER_RULES: ShelterRule[] = [
  {
    id: "size",
    title: "연면적 33㎡ 이하",
    description:
      "쉼터 본체는 연면적 33㎡ 이하로 설치해요. 독일·일본 등 해외 유사 시설 사례와 농지법상 타 시설물과의 형평성을 고려해 정해졌어요.",
    quote:
      "설치 규모는 농지법상 타 시설물과의 형평성, 외국 유사시설 사례를 고려해 연면적 33㎡ 이하로 하였습니다.",
    sourceIds: ["korea_briefing", "law"],
  },
  {
    id: "location",
    title: "본인 소유 농지 + 도로 접함",
    description:
      "본인 소유 농지에 설치할 수 있고, 면도·농도·이도 또는 소방차·응급차 통행이 가능한 사실상 도로에 접해야 해요. 방재지구·붕괴위험지역·자연재해위험개선지구 등은 제외예요.",
    quote: "도로(현황도로 포함)에 접할 것",
    sourceIds: ["mafra_main", "mafra_procedure"],
  },
  {
    id: "attached",
    title: "부속시설 별도 산정",
    description:
      "데크·정화조는 연면적과 별도로 설치할 수 있고, 주차장은 한 면까지 허용돼요. 건축면적에도 포함되지 않아요.",
    quote: "데크·정화조, 주차장 설치 허용(연면적·건축면적과 별도)",
    sourceIds: ["mafra_procedure", "korea_briefing"],
  },
  {
    id: "area",
    title: "쉼터 면적의 2배 이상 농지 보유",
    description:
      "쉼터와 부속시설 합산 면적의 최소 2배 이상 되는 농지를 보유해야 해요. 공지 확보 의무예요.",
    sourceIds: ["mafra_main"],
  },
  {
    id: "duration",
    title: "최장 12년 + 지자체 조례 연장",
    description:
      "존치 기간은 3년 단위로 연장해 최장 12년까지 가능하고, 지자체 건축조례로 추가 연장할 수 있어요.",
    quote: "최장 12년(3년 단위 연장) + α(지자체 조례)",
    sourceIds: ["mafra_main"],
  },
  {
    id: "registration",
    title: "신고 · 등재 의무",
    description:
      "① 시·군 허가부서에 가설건축물 축조신고서 제출, ② 농지법 제49조의2에 따른 농지이용정보 변경신청으로 농지대장에 등재, ③ 소화기·단독경보형감지기 등 주택용 소방시설 설치가 의무예요.",
    quote:
      "가설건축물 축조신고서를 작성, 위치도 등 관련서류를 첨부해 시·군 허가부서에 제출",
    sourceIds: ["korea_news", "mafra_procedure"],
  },
];

/** 농막(기존) vs 쉼터(신설) 비교 */
export const SHELTER_VS_FARMSHED: ShelterComparison[] = [
  { field: "연면적", shelter: "33㎡ 이하", farmShed: "20㎡ 이하" },
  { field: "숙박", shelter: "가능 (장기 체류 허용)", farmShed: "원칙 불가" },
  {
    field: "부속시설",
    shelter: "데크·정화조·주차장 1면 (별도 산정)",
    farmShed: "2024년 개정 후 동일 허용",
  },
  {
    field: "존치기간",
    shelter: "최장 12년 + 조례 연장",
    farmShed: "제한 없음 (본래 용도 유지 시)",
  },
  { field: "농지대장 등재", shelter: "필요", farmShed: "필요" },
];

/** 기존 농막 → 쉼터 전환 요건 */
export const SHELTER_CONVERSION = {
  window: "시행일(2024-12-24)로부터 3년 내",
  condition:
    "기존 농막이 쉼터 설치 입지와 기준에 부합하는 경우, 소유자 신고 절차를 거쳐 전환할 수 있어요.",
  sourceId: "korea_news",
};

/** 이번 조사에서 '공식 원문으로 확정되지 않은' 항목 — 안내 필수 */
export const SHELTER_UNVERIFIED: Array<{
  id: string;
  label: string;
  note: string;
}> = [
  {
    id: "agri_zone",
    label: "농업진흥지역(진흥구역·보호구역) 설치 가능 여부",
    note: "농식품부 공식 페이지에 명시가 없어요. 농지법 시행규칙 원문과 관할 시·군에 문의해 최종 확인하세요.",
  },
  {
    id: "setback",
    label: "방화·인접대지 이격거리",
    note: "쉼터 특화 조항을 공식 원문에서 확인하지 못했어요. 건축법 일반 가설건축물 규정을 시·군 허가부서에서 확인받으세요.",
  },
  {
    id: "clause",
    label: "시행규칙 조문 번호(제3조 vs 제3조의2)",
    note: "공식 해설에서 '농막 등의 범위' 조항으로 시사되나, 최신 개정 원문에서 조문 번호를 직접 확인하는 것을 권장해요.",
  },
];
