"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DataSource } from "@/components/ui/data-source";
import { TermTooltip } from "@/components/ui/term-tooltip";
import s from "@/app/page.module.css";

function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function formatNum(n: number, decimals: number, sep: boolean): string {
  const fixed = n.toFixed(decimals);
  if (!sep) return fixed;
  const [intPart, decPart] = fixed.split(".");
  const withComma = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withComma}.${decPart}` : withComma;
}

interface CountItem {
  end: number;
  decimals?: number;
  separator?: boolean;
  prefix?: string;
}

interface CostSectionProps {
  duration?: number;
  counts: CountItem[];
}

export function CostSection({ duration = 900, counts }: CostSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasPlayed = useRef(false);
  const rafId = useRef(0);
  const [animated, setAnimated] = useState(false);

  const [vals, setVals] = useState<string[]>(
    counts.map((c) =>
      (c.prefix ?? "") + formatNum(0, c.decimals ?? 0, c.separator ?? true),
    ),
  );
  const [pct, setPct] = useState("0");

  const animate = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuint(progress);

      setVals(
        counts.map((c) => {
          const current = eased * c.end;
          return (c.prefix ?? "") + formatNum(
            progress >= 1 ? c.end : current,
            c.decimals ?? 0,
            c.separator ?? true,
          );
        }),
      );
      setPct((eased * 84.6).toFixed(1));

      if (progress < 1) rafId.current = requestAnimationFrame(tick);
    }

    rafId.current = requestAnimationFrame(tick);
  }, [counts, duration]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed.current) {
          hasPlayed.current = true;
          setAnimated(true);
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafId.current) cancelAnimationFrame(rafId.current);
      hasPlayed.current = false;
    };
  }, [animate]);

  return (
    <div ref={ref} className={s.costStack}>
      {/* 히어로 넘버 */}
      <div className={s.costStackHero}>
        <span className={s.costStackLabel}>평균 초기 투자금</span>
        <div className={s.costStackValue}>
          <span className={s.costStackNum}>{vals[0]}</span>
          <span className={s.costStackUnit}>만원</span>
        </div>
        <span className={s.costStackSub}>
          이 중 {pct}%가{" "}
          <TermTooltip
            term="영농 준비비"
            description="농지 구입·임대, 시설·장비, 종자·비료 등 영농을 시작하기 위해 필요한 초기 비용을 통칭합니다."
          />로 사용돼요
        </span>
        <span className={s.costStackChip}>서울 전세 평균의 약 1/5 수준</span>
      </div>

      {/* 스택 바 — 영농 준비비 84.6% + 기타 15.4% */}
      <div className={s.costBarWrap} aria-hidden="true">
        <div className={s.costBarPointer} style={{ left: "84.6%" }} />
        <div className={`${s.costBar} ${animated ? s.costBarAnimated : ""}`}>
          <div className={s.costBarSeg} style={{ flex: 84.6 }} />
          <div className={s.costBarSeg} style={{ flex: 15.4 }} data-variant="light" />
        </div>
      </div>
      <div className={s.costBarLegend}>
        <span className={s.costBarLegendItem}>
          영농 준비비 약 5,261만원
        </span>
        <span className={s.costBarLegendItem} data-variant="light">
          기타 약 958만원
        </span>
      </div>

      {/* 하단 3스탯 */}
      <div className={s.costTriple}>
        <div className={s.costTripleItem}>
          <span className={s.costTripleLabel}>준비 기간</span>
          <div className={s.costTripleValue}>
            <span className={s.costTripleNum}>{vals[1]}</span>
            <span className={s.costTripleUnit}>개월</span>
          </div>
          <span className={s.costTripleSub}>탐색부터 정착까지</span>
        </div>
        <div className={s.costTripleItem}>
          <span className={s.costTripleLabel}>농업창업자금</span>
          <div className={s.costTripleValue}>
            <span className={s.costTripleNum}>{vals[2]}</span>
            <span className={s.costTripleUnit}>억원</span>
          </div>
          <span className={s.costTripleSub}>정부 융자 지원</span>
        </div>
        <div className={s.costTripleItem}>
          <span className={s.costTripleLabel}>주택자금</span>
          <div className={s.costTripleValue}>
            <span className={s.costTripleNum}>{vals[3]}</span>
            <span className={s.costTripleUnit}>만원</span>
          </div>
          <span className={s.costTripleSub}>정부 융자 지원</span>
        </div>
      </div>

      {/* CTA + 출처 */}
      <div className={s.costStackFooter}>
        <div className={s.costStackCtas}>
          <Link href="/costs" className={s.costCtaPrimary}>
            비용 가이드 보기 <ArrowRight size={14} />
          </Link>
          <Link href="/programs" className={s.costCtaSecondary}>
            지원사업 보기 <ArrowRight size={14} />
          </Link>
        </div>
        <DataSource source="농림축산식품부 2025 귀농귀촌 실태조사" />
      </div>
    </div>
  );
}
