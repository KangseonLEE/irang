import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import type { AnswerCard as AnswerCardData } from "@/lib/data/search-index";
import s from "./answer-card.module.css";

interface AnswerCardProps {
  data: AnswerCardData;
  onNavigate?: () => void;
}

export function AnswerCard({ data, onNavigate }: AnswerCardProps) {
  return (
    <div className={s.card}>
      <div className={s.header}>
        <span className={s.headerIcon}>
          <Sparkles size={12} />
        </span>
        이랑이 찾은 답변
      </div>
      <p className={s.answer}>{data.answer}</p>
      <div className={s.actions}>
        {data.actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={s.action}
            onClick={onNavigate}
          >
            {action.label}
            <ArrowRight size={12} />
          </Link>
        ))}
      </div>
    </div>
  );
}
