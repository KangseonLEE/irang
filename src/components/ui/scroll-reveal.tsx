"use client";

import { useRef, useEffect, type ReactNode } from "react";
import s from "./scroll-reveal.module.css";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "section" | "div";
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.classList.add(s.visible);
      el.dataset.visible = "";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(s.visible);
          el.dataset.visible = "";
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`${s.reveal} ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
