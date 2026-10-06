/**
 * /match 서비스 선택 화면 — 서버 컴포넌트 (2026-10-06 QA Q2-W4).
 *
 * 제목·안내·진단 카드는 서버가 그려 HTML 에 그대로 들어간다. 예전엔 게이트웨이 전체가 클라이언트 컴포넌트였고
 * 정적 프리렌더 + useSearchParams 라 BAILOUT 으로 CSR 에 넘어가, HTML 에는 로딩 스켈레톤만 있었다.
 * 카드 누름(모드 진입)만 ModeCardLink 가 받는다. 카드는 버튼이 아니라 링크라 제목(h2)을 담을 수 있다.
 */
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ClipboardCheck,
  Clock,
  Info,
  ListChecks,
  MapPin,
  Zap,
} from "lucide-react";
import { ModeCardLink } from "./mode-card-link";
import s from "./service-gateway.module.css";

/** 제목 + 안내 배너 */
export function GatewayIntro() {
  return (
    <>
      <div className={s.hero}>
        <span className={s.eyebrow}>나에게 맞는 농촌 정착</span>
        <h1 className={s.title}>내 정착 유형을 찾아보세요</h1>
        <p className={s.desc}>목적에 맞는 서비스를 선택하세요.</p>
      </div>

      <aside className={s.infoBanner} aria-label="서비스 안내">
        <div className={s.infoBannerIcon}>
          <Info size={20} aria-hidden="true" />
        </div>
        <div className={s.infoBannerBody}>
          <ul className={s.infoBannerList}>
            <li>1분이면 끝나는 빠른 점검부터 14문항 정밀 진단까지 골라서 시작할 수 있어요.</li>
            <li>어디서부터 봐야 할지 막막하다면 빠른 점검으로 윤곽부터 잡아 보세요.</li>
          </ul>
        </div>
      </aside>
    </>
  );
}

/** 진단 카드 3종 + 비용 계산 바로가기 */
export function GatewayCards() {
  return (
    <>
      <div className={s.cards}>
        {/* 빠른 점검 (Phase 2c 2026-05-15) */}
        <ModeCardLink mode="quick" className={`${s.card} ${s.cardQuick}`}>
          <span className={s.cardHintBubble}>어디서부터 시작할지 모르겠다면 여기부터!</span>
          <div className={`${s.cardIcon} ${s.cardIconQuick}`}>
            <Zap size={28} aria-hidden="true" />
          </div>
          <div className={s.cardBody}>
            <div className={s.cardTitleRow}>
              <h2 className={s.cardTitle}>빠른 점검</h2>
              <span className={s.badgeQuick}>1분</span>
            </div>
            <p className={s.cardDesc}>
              4문항으로 정착 윤곽을 빠르게 잡고 지역·작물·지원 사업을 한번에 추천 받아 보세요.
            </p>
            <div className={s.cardMeta}>
              <span className={s.cardMetaItem}>
                <ListChecks size={14} aria-hidden="true" />
                4문항
              </span>
              <span className={s.cardMetaItem}>
                <Clock size={14} aria-hidden="true" />
                약 1분
              </span>
            </div>
          </div>
          <div className={s.cardArrow}>
            <ArrowRight size={20} aria-hidden="true" />
          </div>
        </ModeCardLink>

        {/* 농촌 정착 적합도 진단 */}
        <ModeCardLink mode="assess" className={`${s.card} ${s.cardRecommended}`}>
          <div className={`${s.cardIcon} ${s.cardIconAssess}`}>
            <ClipboardCheck size={28} aria-hidden="true" />
          </div>
          <div className={s.cardBody}>
            <div className={s.cardTitleRow}>
              <h2 className={s.cardTitle}>농촌 정착 적합도 진단</h2>
              <span className={s.badge}>정밀</span>
            </div>
            <p className={s.cardDesc}>
              5가지 차원 적합도 진단 + 국가지원 트랙 추천까지, 나의 정착 준비 상태를 객관적으로 점검해요.
            </p>
            <div className={s.cardMeta}>
              <span className={s.cardMetaItem}>
                <ListChecks size={14} aria-hidden="true" />
                14문항
              </span>
              <span className={s.cardMetaItem}>
                <Clock size={14} aria-hidden="true" />
                약 4분
              </span>
            </div>
          </div>
          <div className={s.cardArrow}>
            <ArrowRight size={20} aria-hidden="true" />
          </div>
        </ModeCardLink>

        {/* 정착 유형 진단 */}
        <ModeCardLink mode="match" className={s.card}>
          <div className={s.cardIcon}>
            <MapPin size={28} aria-hidden="true" />
          </div>
          <div className={s.cardBody}>
            <h2 className={s.cardTitle}>정착 유형 진단</h2>
            <p className={s.cardDesc}>
              기후, 소득 계획, 생활 환경 등에 답하면 나에게 맞는 정착 유형과 적합한 지역·작물을 알려드려요.
            </p>
            <div className={s.cardMeta}>
              <span className={s.cardMetaItem}>
                <ListChecks size={14} aria-hidden="true" />
                10문항
              </span>
              <span className={s.cardMetaItem}>
                <Clock size={14} aria-hidden="true" />
                약 3분
              </span>
            </div>
          </div>
          <div className={s.cardArrow}>
            <ArrowRight size={20} aria-hidden="true" />
          </div>
        </ModeCardLink>
      </div>

      {/* 비용 계산 바로가기 */}
      <section className={s.costCta}>
        <Link href="/costs#simulator" className={s.costCtaCard}>
          <div className={s.costCtaIcon}>
            <Calculator size={20} aria-hidden="true" />
          </div>
          <div className={s.costCtaBody}>
            <h3 className={s.costCtaTitle}>정착 비용, 얼마나 들까?</h3>
            <p className={s.costCtaDesc}>연령·작물·규모별 예상 비용을 바로 계산해 보세요</p>
          </div>
          <ArrowRight size={16} className={s.costCtaArrow} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
