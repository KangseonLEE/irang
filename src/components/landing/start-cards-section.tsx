/**
 * StartCardsSection — "이랑에서 할 수 있는 것" 3카드 (2026-09-07 회장 결재, 픽케어 카드 골격 참고)
 *
 * - 카드 전체가 <Link>(버튼 없음, 회장 지시). SSR HTML 에 내부 링크 3개가 항상 남는다.
 * - 데스크탑(768+) 3열 그리드, 모바일은 스와이프 캐러셀(scroll-snap + 위치 점) — 점만 client 상태.
 * - 일러스트: public/landing/personas/*.webp (수채화·흰 배경, 9/6 codex 생성분 재사용).
 * - 지원사업 카드의 숫자는 page.tsx 가 서버에서 집계해 넘긴다(핵심 숫자 + 컨텍스트).
 * - 계측: data-track="start_card:{id}" → LandingClickTracker. 섹션 노출은 ScrollReveal trackId="start_cards".
 */

import { StartCards, type StartCard } from "./start-cards";
import s from "./start-cards-section.module.css";

interface Props {
  /** 지금 신청할 수 있는 지원사업 수(모집중, 공고 미발표 제외) */
  openProgramCount: number;
  /** 7일 내 마감 지원사업 수 */
  dueSoonProgramCount: number;
}

export function StartCardsSection({ openProgramCount, dueSoonProgramCount }: Props) {
  const programDesc =
    openProgramCount > 0
      ? dueSoonProgramCount > 0
        ? `지금 신청할 수 있는 ${openProgramCount}건, 이번 주 마감 ${dueSoonProgramCount}건이에요`
        : `지금 신청할 수 있는 지원사업 ${openProgramCount}건을 마감일과 함께 봐요`
      : "지원사업 공고와 마감일을 한눈에 봐요";

  const cards: StartCard[] = [
    {
      id: "assess",
      href: "/match",
      tag: "유형 진단",
      title: "내 귀농 유형은?",
      desc: "5분 진단으로 귀농·귀촌·청년농 중 내 방향을 찾아요",
      image: "/landing/personas/farm-youth.webp",
      alt: "온실 앞에서 모종 트레이를 든 청년 농부",
    },
    {
      id: "ranking",
      href: "/regions/ranking",
      tag: "맞춤 시군구 찾기",
      title: "어디에 정착할까?",
      desc: "자녀·통근·의료 같은 내 조건으로 229곳 순위를 봐요",
      image: "/landing/personas/commuter.webp",
      alt: "시골 간이역에서 출근 준비 중인 직장인",
    },
    {
      id: "programs",
      href: "/programs",
      tag: "지원사업",
      title: "지금 받을 수 있는 지원은?",
      desc: programDesc,
      image: "/landing/personas/family.webp",
      alt: "텃밭에서 아이와 함께 방울토마토를 따는 젊은 부부",
    },
  ];

  return (
    <section className={s.section} aria-labelledby="start-cards-title">
      <div className={s.head}>
        <span className={s.eyebrow}>#이랑에서 할 수 있는 것</span>
        <h2 id="start-cards-title" className={s.title}>
          어디서부터 시작할까요?
        </h2>
        <p className={s.desc}>세 가지만 해 봐도 내 귀농의 윤곽이 잡혀요</p>
      </div>
      <StartCards cards={cards} />
    </section>
  );
}
