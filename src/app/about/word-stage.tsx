"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import s from "./word-stage.module.css";

export interface WordStageItem {
  id: string;
  label: string;
  image: string;
  alt: string;
}

/**
 * /about ⑥ — 화면 가운데 고정된 큰 문장 위로 일러스트가 아래에서 올라와 덮고 지나간다.
 * 일러스트가 화면 가운데를 지날 때 괄호 안 단어가 그 일러스트의 여정으로 바뀐다
 * (일러스트가 문장을 덮고 있는 순간이라 교체가 눈에 튀지 않는다).
 *
 * - 네이티브 스크롤 그대로: sticky + passive scroll 읽기(IntersectionObserver 로 무대 안에서만). 휠 가로채기 없음.
 * - prefers-reduced-motion: CSS 가 sticky·겹침을 풀어 정적 배치, 단어는 전체 목록.
 * - 서버 렌더는 첫 단어 + 모든 일러스트 — JS 없이도 문장과 이미지가 남는다.
 */
export function WordStage({ items }: { items: WordStageItem[] }) {
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLElement>(null);
  const photoRefs = useRef<(HTMLElement | null)[]>([]);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (reduced) return;
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    // 화면 세로 가운데를 이미 지난 일러스트 중 마지막 것이 지금 단어다. 빠르게 튕겨 넘겨
    // 어떤 일러스트도 가운데에 머물지 않아도 위치로 판정하므로 단어가 어긋나지 않는다.
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let idx = 0;
      photoRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top + r.height / 2 < mid) idx = i;
      });
      setActive(idx);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    // 무대가 화면에 있을 때만 스크롤을 듣는다 (passive — 스크롤 자체는 건드리지 않음)
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener("scroll", onScroll);
      }
    });
    io.observe(stage);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const word = reduced
    ? items.map((it) => it.label).join(" · ")
    : (items[active]?.label ?? "");

  return (
    <section
      ref={stageRef}
      className={s.stage}
      aria-labelledby="about-stage-title"
      data-about-stage
    >
      <div className={s.sticky} data-about-sticky>
        <h2 id="about-stage-title" className={s.line}>
          도시에서 농촌으로,
          <br />
          <span className={s.paren}>
            <span aria-hidden="true">( </span>
            <span key={word} className={s.word} data-about-word>
              {word}
            </span>
            <span aria-hidden="true"> )</span>
          </span>
        </h2>
        <p className={s.sub}>
          {items.map((it) => it.label).join("·")}, 어떤 시작이든 같은 숫자로
          비교해 보세요.
        </p>
      </div>

      <div className={s.photos}>
        {items.map((it, i) => (
          <figure
            key={it.id}
            ref={(el) => {
              photoRefs.current[i] = el;
            }}
            data-index={i}
            className={`${s.photo} ${i % 2 === 0 ? s.left : s.right}`}
          >
            <Image
              src={it.image}
              alt={it.alt}
              fill
              sizes="(min-width: 1024px) 340px, (min-width: 768px) 34vw, 50vw"
              className={s.photoImg}
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
