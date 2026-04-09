"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "@/app/page.module.css";

// ─── 이징 함수 ───

/** easeOutExpo — 빠르게 올라가다 끝에서 감속 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** 천 단위 콤마 포맷 */
function formatNum(n: number, decimals: number, sep: boolean): string {
  const fixed = n.toFixed(decimals);
  if (!sep) return fixed;
  const [intPart, decPart] = fixed.split(".");
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withComma}.${decPart}` : withComma;
}

// ─── 카운트업 아이템 ───

interface CountItem {
  end: number;
  decimals?: number;
  separator?: boolean;
  prefix?: string;
}

// ─── Props ───

interface CostSectionProps {
  /** 애니메이션 지속 시간 (기본 2400ms) */
  duration?: number;
  /** 바 차트 퍼센트 */
  barPercent: number;
  /** 카운트업 항목 정의 — 순서 고정 */
  counts: CountItem[];
}

/**
 * 비용 섹션 — 자체 완결 Client Component
 * - 단일 IntersectionObserver로 모든 CountUp + Bar 애니메이션 동기화
 * - 1회만 재생 (새로고침 전까지 유지)
 */
export function CostSection({
  duration = 2400,
  barPercent,
  counts,
}: CostSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);
  const rafId = useRef(0);

  // 초기값: 모든 카운터 0, 바 0
  const [values, setValues] = useState<string[]>(
    counts.map((c) =>
      (c.prefix ?? "") + formatNum(0, c.decimals ?? 0, c.separator ?? true),
    ),
  );
  const [barWidth, setBarWidth] = useState(0);

  const animate = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      // 모든 카운터를 같은 eased 값으로 업데이트
      setValues(
        counts.map((c) => {
          const current = eased * c.end;
          const formatted = formatNum(
            progress >= 1 ? c.end : current,
            c.decimals ?? 0,
            c.separator ?? true,
          );
          return (c.prefix ?? "") + formatted;
        }),
      );

      // 바 차트도 동일한 eased 값 사용
      setBarWidth(progress >= 1 ? barPercent : eased * barPercent);

      if (progress < 1) {
        rafId.current = requestAnimationFrame(tick);
      }
    }

    rafId.current = requestAnimationFrame(tick);
  }, [counts, barPercent, duration]);

  useEffect(() => {
    const el = sectionRef.current;
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

  const barDisplayPercent =
    barWidth >= barPercent ? `${barPercent}%` : `${Math.round(barWidth)}%`;

  return (
    <div ref={sectionRef} className={s.costSection}>
      {/* 상단: 타이틀 + 설명 */}
      <div className={s.costHeader}>
        <span className={s.costOverline}>실제 귀농인 평균 데이터</span>
        <h2 className={s.costTitle}>귀농, 돈이 얼마나 들까?</h2>
      </div>

      {/* 메인: 히어로 넘버 + 보조 수치 */}
      <div className={s.costLayout}>
        {/* 좌측: 핵심 수치 카드 */}
        <div className={s.costHero}>
          <p className={s.costHeroLabel}>평균 초기 투자금</p>
          <p className={s.costHeroValue}>
            <span className={s.costHeroNum}>{values[0]}</span>
            <span className={s.costHeroUnit}>만 원</span>
          </p>
          <p className={s.costHeroSub}>
            평균 준비 기간 <strong>27.4개월</strong> 기준,
            월평균 약 230만 원 수준
          </p>
          <div className={s.costBarWrap}>
            <span className={s.costBarCaption}>
              투자금의 <strong>84.6%</strong>가 영농 준비비
            </span>
            <div className={s.costBar}>
              <div
                className={s.costBarFill}
                style={{ width: `${barWidth}%` }}
              >
                {barWidth > 10 && (
                  <span className={s.costBarPercent}>{barDisplayPercent}</span>
                )}
              </div>
            </div>
            <div className={s.costBarLegend}>
              <span>영농 준비비</span>
              <span>기타 (주거·생활)</span>
            </div>
          </div>
        </div>

        {/* 우측: 보조 수치 그리드 */}
        <div className={s.costGrid}>
          <div className={s.costGridItem}>
            <p className={s.costGridLabel}>준비 기간</p>
            <p className={s.costGridValue}>
              <span className={s.costGridNum}>{values[1]}</span>
              <span className={s.costGridUnit}>개월</span>
            </p>
            <p className={s.costGridSub}>탐색부터 정착까지</p>
          </div>
          <div className={s.costGridItem}>
            <p className={s.costGridLabel}>농업창업자금</p>
            <p className={s.costGridValue}>
              <span className={s.costGridNum}>{values[2]}</span>
              <span className={s.costGridUnit}>억 원</span>
            </p>
            <p className={s.costGridSub}>정부 융자 지원</p>
          </div>
          <div className={s.costGridItem}>
            <p className={s.costGridLabel}>주택자금</p>
            <p className={s.costGridValue}>
              <span className={s.costGridNum}>{values[3]}</span>
              <span className={s.costGridUnit}>만 원</span>
            </p>
            <p className={s.costGridSub}>정부 융자 지원</p>
          </div>
        </div>
      </div>

      {/* 하단: CTA + 출처 */}
      <div className={s.costFooter}>
        <div className={s.costCtaGroup}>
          <Link href="/costs" className={s.costCtaPrimary}>
            비용 가이드 보기 <ArrowRight size={14} />
          </Link>
          <Link href="/programs?supportType=융자" className={s.costCtaOutline}>
            지원사업 확인 <ArrowRight size={14} />
          </Link>
        </div>
        <p className={s.costSource}>
          출처: 농림축산식품부 2025 귀농귀촌 실태조사
        </p>
      </div>
    </div>
  );
}
