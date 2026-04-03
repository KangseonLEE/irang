import Link from "next/link";
import type { SupportProgram } from "@/lib/data/programs";
import s from "./program-card.module.css";

/** supportType -> 사용자 친화적 라벨 */
const SUPPORT_TYPE_LABELS: Record<string, string> = {
  보조금: "보조금 지원",
  융자: "융자 지원",
  교육: "교육 프로그램",
  현물: "현물 지원",
  컨설팅: "컨설팅 지원",
};

/** 3열 그리드용 컴팩트 카드 -- 프로페셔널 톤 */
export function ProgramCard({ program }: { program: SupportProgram }) {
  const isClosed = program.status === "마감";
  const typeLabel =
    SUPPORT_TYPE_LABELS[program.supportType] ?? program.supportType;

  return (
    <Link href={`/programs/${program.id}`} className={s.link}>
      <div className={`${s.card}${isClosed ? ` ${s.closed}` : ""}`}>
        {/* 상단: 유형(overline) + 상태(dot indicator) */}
        <div className={s.topRow}>
          <span className={s.typeLabel}>{typeLabel}</span>
          {program.status === "모집중" ? (
            <span className={s.statusActive}>
              <span className={s.dot} />
              모집중
            </span>
          ) : (
            <span className={s.statusDefault}>{program.status}</span>
          )}
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
