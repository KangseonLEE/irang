import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  MapPin,
  Tractor,
  Home,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { AutoGlossary } from "@/components/ui/auto-glossary";
import { TimelineLink, AccordionScrollWrapper } from "./timeline-nav";
import { ChecklistInteractive } from "./checklist-interactive";
import { GuideTimeline } from "./guide-timeline";
import { interviews } from "@/lib/data/landing";
import { GUIDE_STEP_SUMMARIES } from "@/lib/data/guide-steps";
import { MessageSquareQuote } from "lucide-react";
import s from "./page.module.css";

/**
 * 가이드 단계별 관련 인터뷰 매핑
 * 각 인터뷰의 동기·조언이 해당 단계와 연관되는 것을 기준으로 선정
 */
const STEP_INTERVIEWS: Record<number, string[]> = {
  1: ["lee-gyuho", "lee-jonghyun"],      // 동기·결심 관련
  2: ["kim-gwanghun", "yeom-sujeong"],    // 교육·공부 관련
  3: ["kang-namwook", "lee-jonghyun"],    // 지역 이주 관련
  4: ["jo-sungsu", "yeom-sujeong"],       // 영농 시작 관련
  5: ["bae-dongju", "kang-namwook"],      // 정착·커뮤니티 관련
};

const STEP_INTERVIEW_FIELDS: Record<number, "motivation" | "challenge" | "advice"> = {
  1: "motivation",
  2: "advice",
  3: "motivation",
  4: "challenge",
  5: "advice",
};

export const metadata: Metadata = {
  title: "귀농 프로세스 가이드 | 5단계 로드맵",
  description:
    "귀농 준비부터 정착까지, 5단계 프로세스를 체크리스트와 함께 안내해요. 각 단계별 소요 기간, 핵심 과업, 지원사업 정보를 확인하세요.",
};

// ─── 단계 데이터 ───

interface GuideStep {
  step: number;
  icon: LucideIcon;
  title: string;
  period: string;
  summary: string;
  details: string[];
  checklist: string[];
  tips: string[];
  caution: string;
  /** cost는 GUIDE_STEP_SUMMARIES에서 가져옴 (단일 원천) */
  links: { label: string; href: string }[];
}

const STEPS: GuideStep[] = [
  {
    step: 1,
    icon: Search,
    title: "정보 탐색",
    period: "1~3개월",
    summary:
      "귀농을 결심하고, 가족과 합의한 뒤 기초 정보를 수집하는 단계예요. 막연한 동경에서 구체적 계획으로 넘어가는 첫걸음이에요.",
    details: [
      "귀농 동기와 목표를 명확히 정리하세요 (농업 경영, 전원생활, 은퇴 후 안정 등).",
      "가족 구성원 전체의 동의와 참여 의지를 확인하세요. 자녀 전학, 배우자 취업, 부모 전문병원 접근성 등 구체적 현실 대안을 함께 논의하세요. 합의가 어려우면 본인이 먼저 정착 후 가족이 단계적으로 합류하는 방법도 고려해 보세요.",
      "주말농장이나 텃밭을 운영하여 가족 전체의 농업 적응성을 검증해 보세요. 주말농장은 가장 저비용으로 적응 가능성을 시험하는 방법이에요.",
      "친척 농가나 농가 홈스테이에서 1박 이상 체류하며 농촌의 일상을 관찰하세요. 축사 분뇨 냄새, 벌레·뱀 등 야생동물, 깜깜한 밤 등 도시와 다른 환경을 직접 체감해야 해요.",
      "현재 보유 자산, 부채, 월 필요 생활비를 정리하여 재정 현황을 점검하세요.",
      "관심 지역과 관심 작물의 후보 리스트를 만들어 보세요. 최소 3개 지역, 2~3개 작물을 비교하세요.",
      "귀농 관련 커뮤니티(귀농귀촌종합센터, 지역 카페 등)에 가입하여 선배 귀농인의 경험담을 수집하세요.",
    ],
    checklist: [
      "가족 전체 합의 완료 (자녀 교육·의료 접근 등 현실 대안 포함)",
      "귀농 목표 문서화 (동기·기대·우려 정리)",
      "재정 현황 점검 (자산·부채·월 지출)",
      "주말농장 또는 텃밭 체험으로 적응성 검증",
      "농촌 현장 체류 체험 (1박 이상)",
      "관심 지역 3곳 이상 후보 선정",
      "관심 작물 2~3개 후보 선정",
      "귀농귀촌종합센터 회원가입",
    ],
    tips: [
      "이랑의 지역 비교 기능을 활용하면 기후·인프라·인구를 한눈에 비교할 수 있어요.",
      "작물 정보 페이지에서 난이도·수익성을 먼저 확인하면 후보를 좁히기 쉬워요.",
      "처음부터 1곳에 올인하지 마세요. 비교 과정이 오히려 시간을 절약해요.",
      "주말농장은 비용 부담 없이 가족 전체의 농촌 적응 가능성을 가장 현실적으로 검증하는 방법이에요.",
    ],
    caution:
      "가족 합의 없이 진행하면 중도 포기 가능성이 높아요. 자녀 전학, 배우자 취업, 부모 의료 접근성 등 구체적 현실 대안 없이 막연한 이상만 제시하지 마세요.",
    links: [
      { label: "지역 비교하기", href: "/regions" },
      { label: "작물 정보 보기", href: "/crops" },
      { label: "나에게 맞는 추천받기", href: "/match" },
    ],
  },
  {
    step: 2,
    icon: GraduationCap,
    title: "교육 이수",
    period: "3~6개월",
    summary:
      "귀농 관련 교육을 100시간 이상 이수하는 단계예요. 대부분의 귀농 지원사업이 교육 이수를 필수 자격 요건으로 요구해요.",
    details: [
      "귀농귀촌종합센터, 농업기술센터, 한국농수산대학 등에서 교육을 수강하세요.",
      "이론교육(온라인)과 실습교육(오프라인)을 균형 있게 이수하세요.",
      "귀농 창업 교육(100시간)을 완료하면 귀농 정착지원금, 농지 임대 등 다양한 지원사업 신청 자격이 생깁니다.",
      "교육 과정에서 만나는 동기생들이 귀농 후 가장 든든한 네트워크가 됩니다.",
      "가능하면 관심 작물과 관련된 전문 교육(예: 과수 재배, 스마트팜 등)도 병행하세요.",
    ],
    checklist: [
      "귀농 기초 교육 수강 신청",
      "온라인 교육 수강 (이론)",
      "오프라인 실습 교육 참여",
      "100시간 이상 교육 이수 인증서 확보",
      "관심 작물 전문 교육 수강",
      "교육 동기생 네트워크 구축",
    ],
    tips: [
      "농림축산식품부 인증 교육만 이수 시간으로 인정됩니다. 인증 여부를 반드시 확인하세요.",
      "체류형 귀농 교육은 실습 + 숙박이 포함되어 현지 생활을 미리 체험할 수 있습니다.",
      "교육비의 일부 또는 전액을 지원하는 프로그램도 많으니 교육 페이지에서 확인하세요.",
    ],
    caution:
      "교육 이수 없이는 대부분의 귀농 지원사업 신청이 어려워요. 이 단계를 건너뛰지 마세요.",
    links: [
      { label: "교육 프로그램 보기", href: "/education" },
      { label: "지원사업 확인하기", href: "/programs" },
    ],
  },
  {
    step: 3,
    icon: MapPin,
    title: "지역 선정",
    period: "6~12개월",
    summary:
      "후보 지역을 직접 방문하고 체류하면서, 최종 정착지를 결정하는 단계예요. 책상 위의 정보와 현장의 차이를 직접 확인하세요.",
    details: [
      "후보 지역에 최소 1~2주간 체류하며 현지 생활을 체험하세요. '체류형 귀농' 프로그램을 활용하면 숙소와 농가 체험이 지원돼요.",
      "관심 작물에 따라 최적 지역 유형이 달라요. 과수·낙농·한우는 준산간 지역, 시설채소 등 집약 농업은 도시 근교, 벼농사는 평야 지역이 유리해요.",
      "농지 가격, 수도·전기 인프라, 마을 분위기, 이웃 농가와의 관계를 직접 확인하세요.",
      "지역 농업기술센터를 방문하여 해당 지역의 주요 작물, 토양 특성, 지원사업을 상담받으세요.",
      "의료기관, 학교, 마트 등 생활 인프라와의 거리를 실측하세요.",
      "계절별 차이가 크므로, 가능하면 여름과 겨울 모두 방문해 보세요.",
    ],
    checklist: [
      "체류형 귀농 프로그램 신청",
      "후보 지역 현장 답사 (최소 2곳)",
      "지역 농업기술센터 상담",
      "농지 매물·임대 시세 확인",
      "생활 인프라 접근성 확인 (의료·교육·마트)",
      "배우자 취업·활동 가능성 확인",
      "자녀 교육 환경 확인 (전학 절차 포함)",
      "지역 귀농인 모임 참석",
    ],
    tips: [
      "이랑의 시군구 상세 정보에서 의료기관 수, 학교 수, 인구 추이를 미리 확인할 수 있습니다.",
      "선배 귀농인의 실제 후기가 가장 신뢰도 높은 정보예요. 인터뷰 페이지를 참고하세요.",
      "너무 외진 곳은 판로 확보가 어려울 수 있어요. RPC(미곡종합처리장)나 산지유통센터(APC) 접근성도 고려하세요.",
    ],
    caution:
      "1~2회 단기 방문만으로 결정하지 마세요. 계절에 따라 환경이 크게 달라지며, 최소 2회 이상 방문을 권장해요.",
    links: [
      { label: "지역 상세 보기", href: "/regions" },
      { label: "귀농인 인터뷰", href: "/interviews" },
      { label: "체험·행사 일정", href: "/events" },
    ],
  },
  {
    step: 4,
    icon: Tractor,
    title: "영농 시작",
    period: "12~18개월",
    summary:
      "농지를 확보하고, 작물을 결정하며, 본격적으로 영농에 착수하는 단계예요. 비용이 가장 집중되는 시기이므로 지원사업을 최대한 활용하세요.",
    details: [
      "농지는 매입보다 임차로 시작하는 것이 리스크를 줄이는 방법이에요. 한국농어촌공사의 농지은행을 활용하세요.",
      "작물을 최종 결정하세요. 초보자는 재배 난이도 '쉬움'이면서 가격 변동이 적은 작물부터 시작하세요. 남의 성공 사례를 무작정 따르지 말고, 농업기술센터에 자신의 여건(자본·기술·체력)을 설명하여 후보 작물 추천을 받으세요.",
      "농지·주택 구입 시 시·군청 민원실에서 토지·건축물의 등기, 소유 여부, 담보 상태를 꼼꼼히 확인하세요. 농지전용·농가주택 신축 시에는 농지법 규정을 반드시 확인하세요.",
      "영농 계획서를 작성하세요. 시·군 농업기술센터의 작물 재배력을 참고하여 농작업 시기와 자재 준비를 놓치지 않도록 계획하고, 센터에서 검토와 지도를 받으세요.",
      "귀농 창업 지원금, 농기계 임대, 시설 보조 등 지원사업을 신청하세요.",
      "농기계는 구매보다 농업기술센터의 공동 임대를 우선 검토하세요. 초기 투자비를 크게 줄일 수 있어요.",
    ],
    checklist: [
      "농지 확보 (매입 또는 임차 계약)",
      "농지·주택 등기·소유·담보 상태 확인",
      "농지취득자격증명 발급",
      "최종 작물 결정 (농업기술센터 상담 포함)",
      "영농 계획서 작성 (재배력 기반)",
      "귀농 창업 지원금 신청",
      "농기계·시설 확보 (임대 또는 구매)",
      "종자·자재 구입",
      "농업경영체 등록",
      "전입신고 완료",
    ],
    tips: [
      "농업경영체 등록은 각종 보조금·면세유 등의 혜택을 받기 위한 필수 절차예요.",
      "첫 해는 소규모(3,000㎡ 이하)로 시작하여 재배 기술을 익힌 후 확대하세요.",
      "대부분의 지원사업은 연초(1~3월) 또는 하반기(7~8월)에 공고됩니다. 시기를 놓치지 마세요.",
      "작물 선택은 지역보다 먼저 고민하는 것이 좋습니다. 작물에 따라 최적 기후·토양·판로가 달라지기 때문이에요.",
    ],
    caution:
      "이 단계의 투자 비용이 평균 약 5,260만 원으로 가장 큽니다. 안정된 기반을 마련하는 데 4~5년이 걸리므로, 그 기간의 여유자금과 예비비를 반드시 별도 확보한 뒤 투자하세요.",
    links: [
      { label: "작물 난이도·수익 비교", href: "/crops" },
      { label: "지원사업 검색", href: "/programs" },
      { label: "귀농 통계 보기", href: "/stats/population" },
    ],
  },
  {
    step: 5,
    icon: Home,
    title: "정착",
    period: "18~27개월",
    summary:
      "주거를 안정시키고, 지역 커뮤니티에 합류하며, 지속 가능한 영농 기반을 다지는 단계예요.",
    details: [
      "귀농 주택 수리비 지원(최대 2,000만 원), 빈집 수리 지원 등을 활용하여 주거를 안정시키세요.",
      "마을 이장·부녀회·청년농업인 모임 등 지역 커뮤니티에 적극 참여하세요. 농촌은 '관계'가 곧 인프라예요.",
      "수확물의 판로를 확보하세요. 직거래, 로컬푸드 매장, 학교 급식, 온라인 판매 등 다양한 채널을 시도하세요.",
      "첫 수확 후 결과를 분석하여 2년차 영농 계획을 수정하세요.",
      "멘토링 프로그램에 참여하여 지속적으로 기술을 향상시키세요.",
    ],
    checklist: [
      "주거 안정 (자가·임대 확보)",
      "귀농 주택 수리비 지원 신청",
      "마을 커뮤니티 참여 (이장 인사, 마을 행사 참석)",
      "판로 확보 (1개 이상 판매 채널)",
      "1년차 영농 결과 분석",
      "멘토링 프로그램 참여",
      "가족 적응 지원 프로그램 참여",
      "2년차 영농 계획 수립",
    ],
    tips: [
      "농촌에서는 마을 행사와 공동 작업에 적극 참여하는 것이 정착의 핵심이에요.",
      "6차 산업(가공·체험·판매)으로 확장하면 부가가치를 높일 수 있어요.",
      "힘든 시기에 귀농인 네트워크가 큰 힘이 돼요. 동기생·선배 귀농인과의 관계를 유지하세요.",
    ],
    caution:
      "첫 수확까지 소득 공백이 발생해요. 채소류 3~6개월, 과수류는 3~5년이 걸리므로, 그 기간의 생활비를 미리 확보하세요.",
    links: [
      { label: "지원사업 검색", href: "/programs" },
      { label: "체험·행사 일정", href: "/events" },
      { label: "귀농인 이야기", href: "/interviews" },
    ],
  },
];

// ─── 컴포넌트 ───

export default function GuidePage() {
  return (
    <div className={s.page}>
      {/* ═══ 히어로 ═══ */}
      <section className={s.hero}>
        <span className={s.heroOverline}>PROCESS GUIDE</span>
        <h1 className={s.heroTitle}>
          귀농, <span className={s.accent}>5단계</span>로 준비하세요
        </h1>
        <div className={s.heroDescGroup}>
          <p className={s.heroDesc}>
            정보 탐색부터 정착까지,
            <br />
            평균 18~27개월의 여정을 단계별로 안내해 드려요.
          </p>
          <p className={s.heroDesc}>
            각 단계의 체크리스트에 진행 상황을 기록하며
            <br />
            놓치는 것 없이 체계적으로 준비할 수 있어요.
          </p>
        </div>
        <figure className={s.heroCostGroup}>
          <span className={s.heroCostBadge}>
            총 예상 비용 약 6,350~6,500만 원
            <br />
            지원사업 활용 시 절감 가능
          </span>
          <figcaption className={s.heroCostSource}>
            출처: 농림축산식품부 귀농인 실태조사 기준 평균
          </figcaption>
        </figure>
      </section>

      {/* ═══ 타임라인 요약 (진행률 시각화 포함) ═══ */}
      <GuideTimeline
        steps={STEPS.map((step) => ({
          step: step.step,
          title: step.title,
          period: step.period,
          checklistLength: step.checklist.length,
        }))}
      />

      {/* ═══ 각 단계 상세 (아코디언) ═══ */}
      <AccordionScrollWrapper>
      {STEPS.map((step, stepIdx) => {
        const Icon = step.icon;
        const nextStep = STEPS[stepIdx + 1];
        return (
          <details
            key={step.step}
            id={`step-${step.step}`}
            className={s.stepSection}
            open={step.step === 1}
          >
            <summary className={s.stepHeader}>
              <div className={s.stepHeaderRow}>
                <div className={s.stepIcon}>
                  <Icon size={18} />
                </div>
                <div className={s.stepHeaderText}>
                  <span className={s.stepLabel}>STEP {step.step}</span>
                  <span className={s.stepTitle} role="heading" aria-level={2}>{step.title}</span>
                </div>
                <span className={s.stepPeriodBadge}>
                  {step.period}
                </span>
                <ChevronDown size={20} className={s.stepChevron} aria-hidden="true" />
              </div>
            </summary>

            <div className={s.stepContent}>
              {/* 1. 요약 */}
              <p className={s.stepSummary}>
                <span className={s.stepSummaryPeriod}>{step.period}</span>
                <AutoGlossary text={step.summary} />
              </p>

              <div className={s.stepBody}>
              {/* 2. 주의사항 (위험 신호를 먼저 노출) */}
              <div className={s.cautionCard}>
                <AlertTriangle size={16} />
                <p className={s.cautionText}><AutoGlossary text={step.caution} /></p>
              </div>

              {/* 3. 주요 과업 */}
              <div className={s.stepDetails}>
                <h3 className={s.subHeading}>주요 과업</h3>
                <ol className={s.detailList}>
                  {step.details.map((d, i) => (
                    <li key={i} className={s.detailItem}>
                      <AutoGlossary text={d} maxHighlights={2} />
                    </li>
                  ))}
                </ol>
              </div>

              {/* 4. 체크리스트 (localStorage 인터랙티브) */}
              <ChecklistInteractive stepId={step.step} items={step.checklist} />

              {/* 5. 예상 비용 — 공용 데이터에서 참조 */}
              {(() => {
                const stepCost = GUIDE_STEP_SUMMARIES.find((s) => s.step === step.step)?.cost;
                if (!stepCost) return null;
                return (
                  <div className={`${s.stepCostCard} ${stepCost.highlight ? s.stepCostHighlight : ""}`}>
                    <div className={s.stepCostHeader}>
                      <span className={s.stepCostLabel}>예상 비용</span>
                      <span className={s.stepCostAmount}>{stepCost.amount}</span>
                    </div>
                    <span className={s.stepCostDesc}>{stepCost.desc}</span>
                  </div>
                );
              })()}

              {/* 6. 팁 */}
              <div className={s.tipsCard}>
                <h3 className={s.tipsTitle}>
                  <Lightbulb size={16} />팁
                </h3>
                <ul className={s.tipsList}>
                  {step.tips.map((tip, i) => (
                    <li key={i} className={s.tipItem}>
                      <AutoGlossary text={tip} maxHighlights={2} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* 7. 선배 귀농인의 한마디 */}
              {STEP_INTERVIEWS[step.step] && (
                <div className={s.interviewCards}>
                  <h3 className={s.interviewCardsTitle}>
                    <MessageSquareQuote size={16} />
                    선배 귀농인의 한마디
                  </h3>
                  <div className={s.interviewCardsList}>
                    {STEP_INTERVIEWS[step.step].map((id) => {
                      const person = interviews.find((iv) => iv.id === id);
                      if (!person) return null;
                      const field = STEP_INTERVIEW_FIELDS[step.step] ?? "advice";
                      return (
                        <Link
                          key={id}
                          href={`/interviews/${id}`}
                          className={s.interviewCard}
                        >
                          <p className={s.interviewQuote}>
                            &ldquo;{person[field]}&rdquo;
                          </p>
                          <span className={s.interviewPerson}>
                            {person.name} · {person.region} · {person.crop}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. 관련 링크 + 다음 단계 */}
              <div className={s.stepLinks}>
                {step.links.map((link) => (
                  <Link key={link.href} href={link.href} className={s.stepLink}>
                    {link.label}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>

              {nextStep && (
                <TimelineLink stepId={`step-${nextStep.step}`} className={s.nextStepLink}>
                  다음 단계: {nextStep.title}
                  <ChevronRight size={16} />
                </TimelineLink>
              )}
            </div>
            </div>
          </details>
        );
      })}
      </AccordionScrollWrapper>

      {/* ═══ CTA ═══ */}
      <section className={s.ctaSection}>
        <h2 className={s.ctaTitle}>나에게 맞는 귀농 전략을 찾아보세요</h2>
        <p className={s.ctaDesc}>
          간단한 질문에 답하면, 상황에 맞는 지역과 작물을 추천해 드립니다.
        </p>
        <div className={s.ctaButtons}>
          <Link href="/match" className={s.ctaPrimary}>
            맞춤 추천받기
            <ArrowRight size={16} />
          </Link>
          <Link href="/regions" className={s.ctaSecondary}>
            지역 탐색하기
          </Link>
        </div>
      </section>
    </div>
  );
}
