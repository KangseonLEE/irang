import Link from "next/link";
import type { SupportProgram } from "@/lib/data/programs";
import { StatusBadge } from "@/components/ui/status-badge";
import s from "./program-card.module.css";

/** supportType -> 사용자 친화적 라벨 */
const SUPPORT_TYPE_LABELS: Record<string, string> = {
  보조금: "보조금 지원",
  융자: "융자 지원",
  교육: "교육 프로그램",
  현물: "현물 지원",
  컨설팅: "컨설팅 지원",
};

/** createdAt 기준 14일 이내면 "신규" */
const NEW_THRESHOLD_DAYS = 14;

export function isNewProgram(createdAt?: string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs >= 0 && diffMs < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

/** 3열 그리드용 컴팩트 카드 -- 프로페셔널 톤 */
export function ProgramCard({ program }: { program: SupportProgram }) {
  const isClosed = program.status === "마감";
  const isNew = isNewProgram(program.createdAt);
  const typeLabel =
    SUPPORT_TYPE_LABELS[program.supportType] ?? program.supportType;

  return (
    <Link href={`/programs/${program.id}`} className={s.link}>
      <div className={`${s.card}${isClosed ? ` ${s.closed}` : ""}`}>
        {/* 상단: 유형(overline) + 상태 + 신규 */}
        <div className={s.topRow}>
          <span className={s.typeLabel}>{typeLabel}</span>
          <div className={s.badges}>
            {isNew && <span className={s.newBadge}>신규</span>}
            <StatusBadge status={program.status} />
          </div>
        </div>

        {/* 제목 -- L1: 가장 큰 텍스트 */}
        <h3 className={s.title}>{program.title}</h3>

        {/* 구분선 */}
        <hr className={s.divider} />

        {/* 하단 메타: 담당기관 + 금액 */}
        <div className={s.meta}>
          <span className={s.org}>{program.organization}</span>
          <span className={s.amount}>{program.supportAmount}</span>
        </div>
      </div>
    </Link>
  );
}
