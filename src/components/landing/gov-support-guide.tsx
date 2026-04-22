"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Sprout,
  TreePine,
  Mountain,
  UserCheck,
  Monitor,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FlipHorizontal2,
} from "lucide-react";
import Image from "next/image";
import { useDragScroll } from "@/lib/hooks/use-drag-scroll";
import s from "./gov-support-guide.module.css";

const GUIDES = [
  {
    icon: Sprout,
    title: "귀농",
    sub: "농업을 직접 하고 싶다면",
    desc: "농업창업자금, 주택구입, 영농교육 등 농사를 시작하는 데 필요한 전방위 지원을 받을 수 있어요.",
    tags: ["만 65세 이하", "교육 100시간", "최대 3억 융자"],
    back: {
      amount: "창업 3억 + 주택 7,500만원",
      type: "융자 (연 2%, 5년 거치)",
      reqs: ["귀농 교육 100시간 이수", "농촌 전입 + 경영체 등록", "영농 계획서 제출"],
      period: "매년 1~3월 (지자체별 상이)",
    },
    href: "/programs/roadmap#return-farming",
    color: "#1b6b5a",
    bg: "/images/guides/farming.jpg",
  },
  {
    icon: TreePine,
    title: "귀촌",
    sub: "농촌에서 살고 싶다면",
    desc: "꼭 농사가 아니어도 괜찮아요. 주거 지원, 생활 인프라, 일자리 연계까지 정착을 도와줘요.",
    tags: ["비농업 가능", "주거 지원", "일자리 연계"],
    back: {
      amount: "주택자금 최대 7,500만원",
      type: "융자 + 지자체 보조금",
      reqs: ["농촌 지역 전입 완료", "귀농·귀촌 교육 이수", "비농업 종사도 신청 가능"],
      period: "지자체별 수시 공고",
    },
    href: "/programs/roadmap#return-farming",
    color: "#2d8a6e",
    bg: "/images/guides/rural.jpg",
  },
  {
    icon: Mountain,
    title: "귀산촌",
    sub: "산촌에서 새 삶을 원한다면",
    desc: "임업·산촌 특화 지원사업이 있어요. 산림자원 활용 창업, 체류형 교육도 받을 수 있어요.",
    tags: ["산림 창업", "최대 5억 융자", "교육 40시간"],
    back: {
      amount: "최대 5억원 (창업 융자)",
      type: "융자 (이자 2% 이내)",
      reqs: ["산촌진흥지역 전입", "귀산촌 교육 40시간 이수", "산림 활용 창업 계획서"],
      period: "매년 2~4월",
    },
    href: "/programs/roadmap#forest-village",
    color: "#3a7c5f",
    bg: "/images/guides/mountain.jpg",
  },
  {
    icon: UserCheck,
    title: "청년농",
    sub: "만 39세 이하라면",
    desc: "월 최대 110만 원 정착금, 창업보육센터, 후계농 선발 등 청년 전용 지원이 따로 있어요.",
    tags: ["만 18~39세", "월 110만원", "연 5,000명"],
    back: {
      amount: "월 최대 110만원 (3년간)",
      type: "보조금 (매년 감액)",
      reqs: ["만 18~39세, 독립 경영 3년 이하", "영농 교육 100시간 이수", "도시근로자 소득 130% 이하"],
      period: "전년 11~12월 접수",
    },
    href: "/programs/roadmap#youth-startup",
    color: "#1a5c8a",
    bg: "/images/guides/youth.jpg",
  },
  {
    icon: Monitor,
    title: "스마트팜",
    sub: "기술 기반 농업이라면",
    desc: "ICT 온실·식물공장 창업 교육과 시설 설치비 보조. 20개월 무료 과정도 있어요.",
    tags: ["ICT 기반", "시설비 50% 보조", "청년 우대"],
    back: {
      amount: "시설비 30~50% 보조 + 융자",
      type: "혼합 (보조금 + 융자)",
      reqs: ["스마트팜 교육 이수", "ICT 설비 설치 가능 시설 확보", "청년은 20개월 무상 보육 가능"],
      period: "연 1~2회 (보육센터·종합자금)",
    },
    href: "/programs/roadmap#smart-farm",
    color: "#4a6741",
    bg: "/images/guides/smartfarm.jpg",
  },
];

export function GovSupportGuide() {
  const trackRef = useRef<HTMLDivElement>(null);
  useDragScroll(trackRef);

  const [flipped, setFlipped] = useState<number | null>(null);
  const [current, setCurrent] = useState(0);

  /* 스크롤 위치로 현재 카드 인덱스 계산 */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      const ratio = track.scrollLeft / maxScroll;
      const idx = Math.round(ratio * (GUIDES.length - 1));
      setCurrent(Math.min(idx, GUIDES.length - 1));
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    if (!card) return;
    track.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: "smooth" });
  }, []);

  const handleTap = (i: number) => {
    setFlipped((prev) => (prev === i ? null : i));
  };

  const progress = ((current + 1) / GUIDES.length) * 100;

  return (
    <section className={s.section} aria-label="귀농 길잡이">
      {/* ── 헤더 ── */}
      <div className={s.header}>
        <div className={s.heading}>
          <span className={s.eyebrow}>#귀농 길잡이</span>
          <h2 className={s.title}>
            나에게 맞는 <em>길</em>은?
          </h2>
          <p className={s.subtitle}>
            유형별 카드를 눌러 맞춤 안내를 확인해 보세요
          </p>
        </div>
        <div className={s.headerRight}>
          <Link href="/programs" className={s.viewAll}>
            전체 보기 <ArrowRight size={14} />
          </Link>
          <div className={s.controls}>
            <div className={s.arrows}>
              <button className={s.arrow} onClick={() => scrollTo(-1)} aria-label="이전">
                <ChevronLeft size={16} />
              </button>
              <button className={s.arrow} onClick={() => scrollTo(1)} aria-label="다음">
                <ChevronRight size={16} />
              </button>
            </div>
            <div className={s.progressBar}>
              <div className={s.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 카드 캐러셀 ── */}
      <div ref={trackRef} className={s.track}>
        {GUIDES.map((g, i) => (
          <Link
            key={g.title}
            href={g.href}
            className={`${s.card} ${flipped === i ? s.cardFlipped : ""}`}
            style={{ "--card-color": g.color } as React.CSSProperties}
            onClick={(e) => {
              if (!window.matchMedia("(hover: hover)").matches && flipped !== i) {
                e.preventDefault();
                handleTap(i);
              }
            }}
          >
            <div className={s.cardInner}>
              {/* 앞면: 컬러 배경 + 이미지 + 제목 + 설명 */}
              <div className={s.cardFront}>
                <Image
                  src={g.bg}
                  alt=""
                  aria-hidden="true"
                  className={s.cardBg}
                  fill
                  sizes="(max-width: 640px) 90vw, 320px"
                />
                <span className={s.flipHint} aria-hidden="true">
                  <FlipHorizontal2 size={16} strokeWidth={1.8} />
                </span>
                <div className={s.frontContent}>
                  <h3 className={s.frontTitle}>{g.title}</h3>
                  <span className={s.frontSub}>{g.sub}</span>
                  <p className={s.frontDesc}>{g.desc}</p>
                  <div className={s.frontTags}>
                    {g.tags.map((tag) => (
                      <span key={tag} className={s.frontTag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 뒷면: 흰 배경 + 구조화 요약 */}
              <div className={s.cardBack}>
                <div className={s.backAccent} aria-hidden="true" />

                <div className={s.backAmountBlock}>
                  <span className={s.backAmountLabel}>지원 금액</span>
                  <span className={s.backAmount}>{g.back.amount}</span>
                </div>

                <div className={s.backChips}>
                  <div className={s.backChip}>
                    <span className={s.backChipLabel}>유형</span>
                    <span className={s.backChipValue}>{g.back.type}</span>
                  </div>
                  <div className={s.backChip}>
                    <span className={s.backChipLabel}>신청</span>
                    <span className={s.backChipValue}>{g.back.period}</span>
                  </div>
                </div>

                <div className={s.backReqs}>
                  <span className={s.backReqLabel}>핵심 자격</span>
                  <ul className={s.backReqList}>
                    {g.back.reqs.map((r) => (
                      <li key={r} className={s.backReqItem}>{r}</li>
                    ))}
                  </ul>
                </div>

                <span className={s.backCta}>
                  절차·서류 확인하기 <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}
