/**
 * 특정 지원사업의 풍부한 가이드 콘텐츠
 * — 프로그램 상세 페이지(/programs/[id])에서 렌더링
 */

import {
  Users,
  ClipboardList,
  PhoneCall,
  GraduationCap,
  MapPin,
  CheckCircle2,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";

/* ── 타입 ── */

interface GuideStep {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface GuideFaq {
  question: string;
  answer: string;
}

export interface ProgramGuide {
  /** 프로그램 ID (SP-xxx) */
  programId: string;
  /** 가이드 소개 (summary 보다 상세한 본문) */
  intro: string;
  /** 핵심 특징 (3~5개) */
  highlights: string[];
  /** 신청 절차 */
  steps: GuideStep[];
  /** 자주 묻는 질문 */
  faq: GuideFaq[];
  /** 유용한 팁 */
  tips: string[];
}

/* ── 데이터 ── */

const GUIDES: ProgramGuide[] = [
  {
    programId: "SP-011",
    intro:
      "귀농닥터는 농촌진흥청이 운영하는 1:1 현장 멘토링 서비스입니다. 귀농을 준비 중이거나 농촌에 이주한 지 얼마 안 된 분들에게 경험 풍부한 선도농가(멘토)를 연결해, 작물 재배 기술부터 농촌 생활 정착까지 실질적인 도움을 제공합니다. 연중 상시 신청이 가능하며, 전국 농업기술센터를 통해 가까운 지역의 멘토를 배정받을 수 있습니다.",
    highlights: [
      "무료 1:1 현장 컨설팅 — 작물 재배, 병해충 관리, 농기계 활용 등",
      "전국 시군 농업기술센터를 통한 가까운 멘토 매칭",
      "연중 상시 신청 가능 (특정 모집 기간 없음)",
      "선도농가 기술 전수 프로그램과 연계 가능",
      "귀농 초기 정착 상담 (주거, 마을 적응, 판로 등) 포함",
    ],
    steps: [
      {
        icon: MapPin,
        title: "가까운 농업기술센터 찾기",
        description:
          "거주지(또는 이주 예정지)의 시군 농업기술센터를 방문하거나, 농촌진흥청 '그린대로' 사이트에서 온라인으로 검색할 수 있습니다.",
      },
      {
        icon: ClipboardList,
        title: "귀농닥터 신청서 작성",
        description:
          "농업기술센터 귀농귀촌 담당 부서에 귀농닥터 신청서를 제출합니다. 관심 작물, 현재 상황, 도움받고 싶은 분야를 적어주세요.",
      },
      {
        icon: Users,
        title: "멘토 매칭",
        description:
          "담당자가 신청자의 관심 분야와 지역을 고려하여 적합한 선도농가(멘토)를 배정합니다. 보통 1~2주 내에 매칭됩니다.",
      },
      {
        icon: PhoneCall,
        title: "초기 상담 및 계획 수립",
        description:
          "매칭된 멘토와 첫 만남을 갖고, 멘토링 목표와 일정을 함께 계획합니다. 월 1~2회 정기 방문이 일반적입니다.",
      },
      {
        icon: GraduationCap,
        title: "현장 멘토링 진행",
        description:
          "멘토의 농장을 방문하거나 본인의 농지에서 실습 중심의 기술 전수를 받습니다. 계절별 작업, 병해충 대처 등 실전 노하우를 배웁니다.",
      },
      {
        icon: CheckCircle2,
        title: "정착 후 후속 지원",
        description:
          "멘토링 종료 후에도 농업기술센터의 영농 상담, 교육 프로그램, 농산물 판로 지원 등 다양한 후속 지원을 받을 수 있습니다.",
      },
    ],
    faq: [
      {
        question: "귀농닥터는 비용이 드나요?",
        answer:
          "아닙니다. 귀농닥터 멘토링은 농촌진흥청과 지자체가 운영하는 무료 서비스입니다. 멘토에게도 별도 교수수당이 지급되므로 신청자 부담은 없습니다.",
      },
      {
        question: "아직 귀농 전인데도 신청할 수 있나요?",
        answer:
          "네, 가능합니다. 귀농을 준비 중인 예비 귀농인도 신청할 수 있습니다. 실제 이주 전에 미리 멘토를 만나 지역 정보와 작물 선택에 대한 조언을 받는 것이 효과적입니다.",
      },
      {
        question: "멘토링 기간은 얼마나 되나요?",
        answer:
          "일반적으로 6개월~1년 단위로 진행됩니다. 상황에 따라 연장도 가능하며, 멘토와 상의하여 유연하게 조정할 수 있습니다.",
      },
      {
        question: "특정 작물을 지정해서 멘토를 받을 수 있나요?",
        answer:
          "네, 신청 시 관심 작물을 명시하면 해당 작물에 경험이 풍부한 선도농가를 우선 매칭해 줍니다. 다만 지역에 따라 멘토 풀이 제한적일 수 있습니다.",
      },
      {
        question: "다른 귀농 지원사업과 중복으로 받을 수 있나요?",
        answer:
          "대부분의 경우 중복 수혜가 가능합니다. 귀농 창업자금, 청년농업인 지원 등과 함께 귀농닥터 멘토링을 병행하는 것을 권장합니다.",
      },
    ],
    tips: [
      "신청 전에 관심 작물 1~2가지를 미리 정해두면 멘토 매칭이 빨라집니다.",
      "멘토 방문 시 질문 목록을 미리 작성해 가면 더 알찬 멘토링이 됩니다.",
      "귀농닥터와 함께 '선도농가 현장실습 교육'(월 80만원 훈련비 지급)에 연계 신청하면 체계적인 기술 습득이 가능합니다.",
      "농업기술센터의 귀농귀촌 담당자와 미리 관계를 만들어 두면, 다른 지원사업 정보도 빠르게 받을 수 있습니다.",
    ],
  },
];

/* ── API ── */

/** 프로그램 ID로 가이드 콘텐츠 조회 */
export function getProgramGuide(programId: string): ProgramGuide | undefined {
  return GUIDES.find((g) => g.programId === programId);
}
