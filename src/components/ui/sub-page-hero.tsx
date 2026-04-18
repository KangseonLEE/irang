import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import s from "./sub-page-hero.module.css";

interface SubPageHeroProps {
  overline: string;
  icon?: LucideIcon;
  title: string;
  titleAccent?: string;
  description: string | ReactNode;
  /** @deprecated variant는 더 이상 사용하지 않음 (항상 flat) */
  variant?: "card" | "flat";
  children?: ReactNode;
}

export function SubPageHero({
  overline,
  icon: Icon,
  title,
  titleAccent,
  description,
  children,
}: SubPageHeroProps) {
  const renderedTitle = titleAccent
    ? highlightAccent(title, titleAccent)
    : title;

  return (
    <header className={s.hero}>
      <span className={s.overline}>
        {Icon && <Icon size={14} strokeWidth={2} aria-hidden="true" />}
        {overline}
      </span>
      <h1 className={s.title}>{renderedTitle}</h1>
      <div className={s.desc}>
        {typeof description === "string" ? <p>{description}</p> : description}
      </div>
      {children}
    </header>
  );
}

function highlightAccent(text: string, accent: string) {
  const idx = text.indexOf(accent);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className={s.accent}>{accent}</span>
      {text.slice(idx + accent.length)}
    </>
  );
}
