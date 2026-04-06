import type { ReactNode } from "react";
import Link from "next/link";
import s from "./empty-state.module.css";

interface EmptyStateProps {
  icon: ReactNode;
  message: ReactNode;
  linkHref?: string;
  linkText?: string;
}

export function EmptyState({ icon, message, linkHref, linkText }: EmptyStateProps) {
  return (
    <div className={s.emptyState}>
      <div className={s.icon}>{icon}</div>
      <p className={s.text}>{message}</p>
      {linkHref && linkText && (
        <Link href={linkHref} className={s.link}>
          {linkText}
        </Link>
      )}
    </div>
  );
}
