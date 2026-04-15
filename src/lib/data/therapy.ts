/* ==========================================================================
   치유농업 · 사회적 농업 정적 데이터 (B-4)
   공공데이터가 없어 정적으로 큐레이션. 연 1회 출처 교차검증 후 갱신.
   ========================================================================== */

export interface TherapyTrack {
  id: "healing" | "social";
  title: string;
  subtitle: string;
  definition: string;
  legalBasis: string;
  entryPath: string[];
  stats: { label: string; value: string; year: string; source: string }[];
  officialUrl: string;
  officialUrlName: string;
  /** YYYY-MM-DD. 출처 URL·수치 교차검증 마지막 일자 */
  verifiedAt: string;
}

export const THERAPY_TRACKS: TherapyTrack[] = [
  {
    id: "healing",
    title: "치유농업",
    subtitle: "농업·농촌 자원으로 국민 건강을 회복시키는 산업",
    definition:
      "치유농업은 국민의 건강 회복·유지·증진을 목적으로 농업·농촌 자원을 활용하는 산업이에요. 2급 치유농업사 자격을 취득한 뒤 치유농장을 운영하거나 기존 농장에서 프로그램을 진행하는 구조예요.",
    legalBasis:
      "「치유농업 연구개발 및 육성에 관한 법률」이 2020년 3월 공포되고 2021년 3월 25일 시행됐어요. 제2조(정의), 제8조(연구개발·보급), 제10조(지자체 역할)가 핵심 조항이에요.",
    entryPath: [
      "치유농업사 2급 양성 교육 이수 (142시간)",
      "농촌진흥청 주관 자격시험 응시",
      "1차 선택형 + 2차 주관식 합격",
      "치유농장 개설 또는 기존 농장 취업",
      "(선택) 농진청 우수 치유농업시설 인증 신청",
    ],
    stats: [
      {
        label: "2025년 치유농업사 2급 합격자",
        value: "301명",
        year: "2025",
        source: "농촌진흥청 2025-12-03 공고",
      },
    ],
    // 검증 2026-04-16: HTTP 200, 농촌진흥청 치유농업ON 포털
    officialUrl: "https://www.agrohealing.go.kr/sf/main/main.do",
    officialUrlName: "농촌진흥청 치유농업ON",
    verifiedAt: "2026-04-16",
  },
  {
    id: "social",
    title: "사회적 농업",
    subtitle: "농업으로 돌봄·교육·고용을 제공하는 농업 모델",
    definition:
      "사회적 농업은 농업 활동을 통해 장애인·고령농·다문화여성 등 사회적 약자에게 돌봄·교육·고용 서비스를 제공하는 농업 모델이에요. 농림축산식품부가 매년 '농촌 돌봄서비스 활성화 지원사업 시행지침'으로 운영해요.",
    legalBasis:
      "독립 법률 없이 농식품부 연례 고시로 시행돼요. 사회적 농장·농촌돌봄농장·농촌주민생활돌봄공동체 3개 트랙으로 구성돼요.",
    entryPath: [
      "사회적농업 기초교육 1·2차 이수 (3일)",
      "사업계획서·복지기관 연계 MOU 준비",
      "시군 추천 → 농식품부 분기별 공고 응모",
      "심사 후 사회적 농장 또는 농촌돌봄농장 지정",
      "연 단위 지원사업 수혜 (인건비·운영비)",
    ],
    stats: [
      {
        label: "사회적 농장 (2025 기준)",
        value: "133개",
        year: "2025",
        source: "농림축산식품부 2025-12-30 활성화 계획",
      },
      {
        label: "돌봄농장 최대 지원액",
        value: "연 5,500만원",
        year: "2025",
        source: "농식품부 돌봄서비스 활성화 지원사업",
      },
      {
        label: "2028 목표 사회적 농장",
        value: "180개",
        year: "2028 목표",
        source: "농식품부 활성화 계획",
      },
    ],
    // 검증 2026-04-16: HTTP 200, 사회적농업 온라인포털
    officialUrl: "https://www.socialfarm.kr/web/index.do",
    officialUrlName: "사회적농업 온라인포털",
    verifiedAt: "2026-04-16",
  },
];

export const therapyTrackMap = new Map(THERAPY_TRACKS.map((t) => [t.id, t]));
