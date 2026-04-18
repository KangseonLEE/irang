"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./cost-highlight.module.css";

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

/**
 * 비용 핵심 지표 하이라이트
 * 좌: 텍스트 헤드라인 + CTA / 우: 히어로 카드 1장 + 보조 라인 카드 3장
 */
export function CostHighlight() {
  const ref = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);
  const rafId = useRef(0);

  const targets = [6219, 84.6, 24.5, 7500, 3];
  const [vals, setVals] = useState(["0", "0", "0", "0", "0"]);

  const animate = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const start = performance.now();
    const duration = 1000;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutQuint(progress);

      setVals([
        Math.round(eased * targets[0]).toLocaleString(),
        (eased * targets[1]).toFixed(1),
        (eased * targets[2]).toFixed(1),
        Math.round(eased * targets[3]).toLocaleString(),
        Math.round(eased * targets[4]).toString(),
      ]);

      if (progress < 1) rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [animate]);

  return (
    <div ref={ref} className={s.section}>
      {/* 좌측 텍스트 */}
      <div className={s.textSide}>
        <span className={s.overline}>#비용 가이드</span>
        <h3 className={s.headline}>
          귀농 정착까지, <em>얼마</em>가 들까?
        </h3>
        <p className={s.desc}>
          평균 6,219만원의 초기 비용 중 대부분은 영농 준비에 쓰여요.
          정부 융자를 활용하면 부담을 크게 줄일 수 있어요.
        </p>
        <Link href="/costs" className={s.cta}>
          비용 가이드 보기 <ArrowRight size={15} />
        </Link>
        <span className={s.source}>출처: 농림축산식품부 2025 귀농귀촌 실태조사</span>
      </div>

      {/* 우측 카드 그리드 */}
      <div className={s.cards}>
        {/* 히어로 카드 — 평균 초기 투자금 (2열 span, 딥그린) */}
        <div className={`${s.card} ${s.cardHero}`}>
          <div>
            <p className={s.cardLabel}>평균 초기 투자금</p>
            <p className={s.cardDesc}>
              농지·시설·장비·종자 등 영농 시작에 필요한 총비용이에요
            </p>
          </div>
          <div className={s.cardBottom}>
            <span className={s.cardNum}>{vals[0]}</span>
            <span className={s.cardUnit}>만원</span>
          </div>
        </div>

        {/* 보조 카드 4장 */}
        <div className={`${s.card} ${s.cardSub}`}>
          <p className={s.cardLabel}>영농 준비비 비중</p>
          <p className={s.cardDesc}>
            초기 비용의 대부분이 농지 구입과 시설 투자에 집중돼요
          </p>
          <div className={s.cardBottom}>
            <span className={`${s.cardNum} ${s.numPrimary}`}>{vals[1]}</span>
            <span className={s.cardUnit}>%</span>
          </div>
          <span className={s.cardSubNote}>약 5,261만원</span>
        </div>

        <div className={`${s.card} ${s.cardSub}`}>
          <p className={s.cardLabel}>평균 준비 기간</p>
          <p className={s.cardDesc}>
            탐색부터 정착까지 평균 소요 기간이에요
          </p>
          <div className={s.cardBottom}>
            <span className={`${s.cardNum} ${s.numAmber}`}>{vals[2]}</span>
            <span className={s.cardUnit}>개월</span>
          </div>
        </div>

        <div className={`${s.card} ${s.cardSub}`}>
          <p className={s.cardLabel}>정부 주택자금 융자</p>
          <p className={s.cardDesc}>
            귀농인 주거 안정을 위한 정부 지원 한도예요
            <span className={s.cardSource}>귀농귀촌 정착지원사업</span>
          </p>
          <div className={s.cardBottom}>
            <span className={`${s.cardNum} ${s.numMuted}`}>{vals[3]}</span>
            <span className={s.cardUnit}>만원</span>
          </div>
        </div>

        <div className={`${s.card} ${s.cardSub}`}>
          <p className={s.cardLabel}>농업창업자금 융자</p>
          <p className={s.cardDesc}>
            영농 정착에 필요한 농지·시설·장비 구입 지원 한도예요
            <span className={s.cardSource}>농림축산식품부 융자사업</span>
          </p>
          <div className={s.cardBottom}>
            <span className={`${s.cardNum} ${s.numPrimary}`}>{vals[4]}</span>
            <span className={s.cardUnit}>억원</span>
          </div>
        </div>
      </div>
    </div>
  );
}
