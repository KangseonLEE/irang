import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  GraduationCap,
  MapPin,
  Tractor,
  Home,
  ArrowRight,
  CheckCircle2,
  Clock,
  Lightbulb,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "귀농 프로세스 가이드 | 5단계 로드맵",
  description:
    "귀농 준비부터 정착까지, 5단계 프로세스를 체크리스트와 함께 안내합니다. 각 단계별 소요 기간, 핵심 과업, 지원사업 정보를 확인하세요.",
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
  caution?: string;
  links: { label: string; href: string }[];
}

const STEPS: GuideStep[] = [
  {
    step: 1,
    icon: Search,
    title: "정보 탐색",
    period: "1~3개월",
    summary:
      "귀농을 결심하고, 가족과 합의한 뒤 기초 정보를 수집하는 단계입니다. 막연한 동경에서 구체적 계획으로 넘어가는 첫걸음입니다.",
    details: [
      "귀농 동기와 목표를 명확히 정리합니다 (농업 경영, 전원생활, 은퇴 후 안정 등).",
      "가족 구성원 전체의 동의와 참여 의지를 확인합니다. 특히 배우자·자녀의 교육·의료 접근성 요구를 파악해야 합니다.",
      "현재 보유 자산, 부채, 월 필요 생활비를 정리하여 재정 현황을 점검합니다.",
      "관심 지역과 관심 작물의 후보 리스트를 만듭니다. 최소 3개 지역, 2~3개 작물을 비교하세요.",
      "귀농 관련 커뮤니티(귀농귀촌종합센터, 지역 카페 등)에 가입하여 선배 귀농인의 경험담을 수집합니다.",
    ],
    checklist: [
      "가족 전체 합의 완료",
      "귀농 목표 문서화 (동기·기대·우려 정리)",
      "재정 현황 점검 (자산·부채·월 지출)",
      "관심 지역 3곳 이상 후보 선정",
      "관심 작물 2~3개 후보 선정",
      "귀농귀촌종합센터 회원가입",
    ],
    tips: [
      "이랑의 지역 비교 기능을 활용하면 기후·인프라·인구를 한눈에 비교할 수 있습니다.",
      "작물 정보 페이지에서 난이도·수익성을 먼저 확인하면 후보를 좁히기 쉽습니다.",
      "처음부터 1곳에 올인하지 마세요. 비교 과정이 오히려 시간을 절약합니다.",
    ],
    links: [
      { label: "지역 비교하기", href: "/regions" },
      { label: "작물 정보 보기", href: "/crops" },
      { label: "맞춤 추천 받기", href: "/match" },
    ],
  },
  {
    step: 2,
    icon: GraduationCap,
    title: "교육 이수",
    period: "3~6개월",
    summary:
      "귀농 관련 교육을 100시간 이상 이수하는 단계입니다. 대부분의 귀농 지원사업이 교육 이수를 필수 자격 요건으로 요구합니다.",
    details: [
      "귀농귀촌종합센터, 농업기술센터, 한국농수산대학 등에서 교육을 수강합니다.",
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
      "교육 이수 없이는 대부분의 귀농 지원사업 신청이 불가합니다. 이 단계를 건너뛰지 마세요.",
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
      "후보 지역을 직접 방문하고 체류하면서, 최종 정착지를 결정하는 단계입니다. 책상 위의 정보와 현장의 차이를 직접 확인합니다.",
    details: [
      "후보 지역에 최소 1~2주간 체류하며 현지 생활을 체험합니다. '체류형 귀농' 프로그램을 활용하면 숙소와 농가 체험이 지원됩니다.",
      "농지 가격, 수도·전기 인프라, 마을 분위기, 이웃 농가와의 관계를 직접 확인합니다.",
      "지역 농업기술센터를 방문하여 해당 지역의 주요 작물, 토양 특성, 지원사업을 상담받습니다.",
      "의료기관, 학교, 마트 등 생활 인프라와의 거리를 실측합니다.",
      "계절별 차이가 크므로, 가능하면 여름과 겨울 모두 방문해 보세요.",
    ],
    checklist: [
      "체류형 귀농 프로그램 신청",
      "후보 지역 현장 답사 (최소 2곳)",
      "지역 농업기술센터 상담",
      "농지 매물·임대 시세 확인",
      "생활 인프라 접근성 확인 (의료·교육·마트)",
      "지역 귀농인 모임 참석",
    ],
    tips: [
      "이랑의 시군구 상세 정보에서 의료기관 수, 학교 수, 인구 추이를 미리 확인할 수 있습니다.",
      "선배 귀농인의 실제 후기가 가장 신뢰도 높은 정보입니다. 인터뷰 페이지를 참고하세요.",
      "너무 외진 곳은 판로 확보가 어려울 수 있습니다. RPC(미곡종합처리장)나 산지유통센터(APC) 접근성도 고려하세요.",
    ],
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
      "농지를 확보하고, 작물을 결정하며, 본격적으로 영농에 착수하는 단계입니다. 비용이 가장 집중되는 시기이므로 지원사업을 최대한 활용하세요.",
    details: [
      "농지는 매입보다 임차로 시작하는 것이 리스크를 줄이는 방법입니다. 한국농어촌공사의 농지은행을 활용하세요.",
      "작물을 최종 결정합니다. 초보자는 재배 난이도 '쉬움' 작물부터 시작하는 것을 권장합니다.",
      "영농 계획서를 작성합니다. 재배 면적, 예상 수확량, 판매 계획, 투자 비용을 구체화합니다.",
      "귀농 창업 지원금, 농기계 임대, 시설 보조 등 지원사업을 신청합니다.",
      "농기계는 구매보다 농업기술센터의 공동 임대를 우선 검토합니다. 초기 투자비를 크게 줄일 수 있습니다.",
    ],
    checklist: [
      "농지 확보 (매입 또는 임차 계약)",
      "최종 작물 결정",
      "영농 계획서 작성",
      "귀농 창업 지원금 신청",
      "농기계·시설 확보 (임대 또는 구매)",
      "종자·자재 구입",
      "농업경영체 등록",
    ],
    tips: [
      "농업경영체 등록은 각종 보조금·면세유 등의 혜택을 받기 위한 필수 절차입니다.",
      "첫 해는 소규모(3,000㎡ 이하)로 시작하여 재배 기술을 익힌 후 확대하세요.",
      "지원사업은 신청 기간이 정해져 있으니, 지원사업 페이지에서 마감일을 꼭 확인하세요.",
    ],
    caution:
      "이 단계의 투자 비용이 평균 5,260만 원으로 가장 큽니다. 지원사업을 최대한 활용하고, 무리한 초기 투자는 피하세요.",
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
      "주거를 안정시키고, 지역 커뮤니티에 합류하며, 지속 가능한 영농 기반을 다지는 단계입니다.",
    details: [
      "귀농 주택 수리비 지원(최대 2,000만 원), 빈집 수리 지원 등을 활용하여 주거를 안정시킵니다.",
      "마을 이장·부녀회·청년농업인 모임 등 지역 커뮤니티에 적극 참여합니다. 농촌은 '관계'가 곧 인프라입니다.",
      "수확물의 판로를 확보합니다. 직거래, 로컬푸드 매장, 학교 급식, 온라인 판매 등 다양한 채널을 시도하세요.",
      "첫 수확 후 결과를 분석하여 2년차 영농 계획을 수정합니다.",
      "멘토링 프로그램에 참여하여 지속적으로 기술을 향상시킵니다.",
    ],
    checklist: [
      "주거 안정 (자가·임대 확보)",
      "귀농 주택 수리비 지원 신청",
      "마을 커뮤니티 참여 (이장 인사, 마을 행사 참석)",
      "판로 확보 (1개 이상 판매 채널)",
      "1년차 영농 결과 분석",
      "멘토링 프로그램 참여",
      "2년차 영농 계획 수립",
    ],
    tips: [
      "농촌에서는 마을 행사와 공동 작업에 적극 참여하는 것이 정착의 핵심입니다.",
      "6차 산업(가공·체험·판매)으로 확장하면 부가가치를 높일 수 있습니다.",
      "힘든 시기에 귀농인 네트워크가 큰 힘이 됩니다. 동기생·선배 귀농인과의 관계를 유지하세요.",
    ],
    links: [
      { label: "지원사업 검색", href: "/programs" },
      { label: "체험·행사 일정", href: "/events" },
      { label: "귀농인 이야기", href: "/interviews" },
    ],
  },
];

// ─── 비용 요약 ───

const costSummary = [
  { phase: "1·2단계 탐색·교육", amount: "소규모", desc: "교육비, 교통·체류비" },
  { phase: "3단계 현장 답사", amount: "소규모", desc: "답사 교통비, 임시 숙박비" },
  {
    phase: "4단계 영농 준비",
    amount: "~5,260만 원",
    desc: "농지, 농기계, 시설 투자",
    highlight: true,
  },
  {
    phase: "5단계 정착",
    amount: "~960만 원",
    desc: "주택 마련, 초기 생활 안정",
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
        <p className={s.heroDesc}>
          정보 탐색부터 정착까지, 평균 18~27개월의 여정을 단계별로 안내합니다.
          <br />
          각 단계의 체크리스트를 따라가면 놓치는 것 없이 준비할 수 있습니다.
        </p>
      </section>

      {/* ═══ 타임라인 요약 ═══ */}
      <section className={s.timelineOverview}>
        <div className={s.timelineTrack}>
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <a key={step.step} href={`#step-${step.step}`} className={s.timelineDot}>
                <div className={s.timelineDotIcon}>
                  <Icon size={18} />
                </div>
                <span className={s.timelineDotLabel}>{step.title}</span>
                <span className={s.timelineDotPeriod}>{step.period}</span>
                {i < STEPS.length - 1 && <div className={s.timelineConnector} />}
              </a>
            );
          })}
        </div>
      </section>

      {/* ═══ 각 단계 상세 ═══ */}
      {STEPS.map((step) => {
        const Icon = step.icon;
        return (
          <section key={step.step} id={`step-${step.step}`} className={s.stepSection}>
            {/* 단계 헤더 */}
            <div className={s.stepHeader}>
              <div className={s.stepBadge}>
                <Icon size={20} />
                <span>STEP {step.step}</span>
              </div>
              <h2 className={s.stepTitle}>{step.title}</h2>
              <div className={s.stepMeta}>
                <span className={s.stepPeriod}>
                  <Clock size={14} />
                  {step.period}
                </span>
              </div>
              <p className={s.stepSummary}>{step.summary}</p>
            </div>

            {/* 상세 설명 */}
            <div className={s.stepBody}>
              <div className={s.stepDetails}>
                <h3 className={s.subHeading}>주요 과업</h3>
                <ol className={s.detailList}>
                  {step.details.map((d, i) => (
                    <li key={i} className={s.detailItem}>
                      {d}
                    </li>
                  ))}
                </ol>
              </div>

              {/* 체크리스트 */}
              <div className={s.checklistCard}>
                <h3 className={s.checklistTitle}>
                  <CheckCircle2 size={16} />
                  체크리스트
                </h3>
                <ul className={s.checklistItems}>
                  {step.checklist.map((item, i) => (
                    <li key={i} className={s.checklistItem}>
                      <span className={s.checkBox} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 팁 */}
              <div className={s.tipsCard}>
                <h3 className={s.tipsTitle}>
                  <Lightbulb size={16} />팁
                </h3>
                <ul className={s.tipsList}>
                  {step.tips.map((tip, i) => (
                    <li key={i} className={s.tipItem}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 주의사항 */}
              {step.caution && (
                <div className={s.cautionCard}>
                  <AlertTriangle size={16} />
                  <p className={s.cautionText}>{step.caution}</p>
                </div>
              )}

              {/* 관련 링크 */}
              <div className={s.stepLinks}>
                {step.links.map((link) => (
                  <Link key={link.href} href={link.href} className={s.stepLink}>
                    {link.label}
                    <ArrowRight size={14} />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ═══ 비용 요약 ═══ */}
      <section className={s.costSection}>
        <h2 className={s.costTitle}>단계별 예상 비용</h2>
        <p className={s.costDesc}>
          귀농 초기 투자 비용은 평균 6,220만 원이며, 4단계(영농 준비)에 집중됩니다.
          지원사업을 활용하면 실제 부담을 줄일 수 있습니다.
        </p>
        <div className={s.costGrid}>
          {costSummary.map((c) => (
            <div
              key={c.phase}
              className={`${s.costCard} ${c.highlight ? s.costHighlight : ""}`}
            >
              <span className={s.costPhase}>{c.phase}</span>
              <span className={s.costAmount}>{c.amount}</span>
              <span className={s.costNote}>{c.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className={s.ctaSection}>
        <h2 className={s.ctaTitle}>어디서 시작할지 모르겠다면?</h2>
        <p className={s.ctaDesc}>
          간단한 질문 5개에 답하면, 나의 상황에 맞는 지역과 작물을 추천해 드립니다.
        </p>
        <div className={s.ctaButtons}>
          <Link href="/match" className={s.ctaPrimary}>
            맞춤 추천 받기
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
