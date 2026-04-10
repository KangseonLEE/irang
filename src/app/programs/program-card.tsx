import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { SupportProgram } from "@/lib/data/programs";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/ui/status-badge";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import s from "./program-card.module.css";

/** supportType -> 사용자 친화적 라벨 */
const SUPPORT_TYPE_LABELS: Record<string, string> = {
  보조금: "보조금 지원",
  융자: "융자 지원",
  교육: "교육 프로그램",
  현물: "현물 지원",
  컨설팅: "컨설팅 지원",
};

/** createdAt 기준 14일 이내 + 마감되지 않은 프로그램만 "신규" */
const NEW_THRESHOLD_DAYS = 14;

export function isNewProgram(createdAt?: string, status?: string): boolean {
  if (!createdAt) return false;
  if (status === "마감") return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs >= 0 && diffMs < NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

/** 3열 그리드용 컴팩트 카드 -- 프로페셔널 톤 */
export function ProgramCard({ program }: { program: SupportProgram }) {
  const isClosed = program.status === "마감";
  const isNew = isNewProgram(program.createdAt, program.status);
  const typeLabel =
    SUPPORT_TYPE_LABELS[program.supportType] ?? program.supportType;

  return (
    <Link href={`/programs/${program.id}`} className={s.link}>
      <div className={`${s.card}${isClosed ? ` ${s.closed}` : ""}`}>
        {/* 상단: 유형(overline) + 상태 + 신규 */}
        <div className={s.topRow}>
          <SupportTypeBadge type={program.supportType} label={typeLabel} />
          <div className={s.badges}>
            {isNew && <span className={s.newBadge}>신규</span>}
            <StatusBadge status={program.status} />
          </div>
        </div>

        {/* 제목 */}
        <h3 className={s.title}>{program.title}</h3>

        {/* 기관 + 지역 */}
        <div className={s.subtitle}>
          <MapPin size={13} />
          <span className={s.region}>{program.region}</span>
          <span className={s.dot} />
          <span className={s.org}>{program.organization}</span>
        </div>

        {/* 구분선 */}
        <hr className={s.divider} />

        {/* 메타 정보 */}
        <div className={s.metaGrid}>
          <div className={s.metaItem}>
            <Calendar size={13} />
            <span className={s.metaValue}>
              {formatDate(program.applicationStart)} ~{" "}
              {formatDate(program.applicationEnd)}
            </span>
          </div>
        </div>

        {/* 요약 */}
        <p className={s.summary}>{program.summary}</p>

        {/* 하단: 지원금액 + CTA */}
        <div className={s.footer}>
          <span className={s.amount}>{program.supportAmount}</span>
          <span className={s.detailLink} aria-hidden="true">
            상세보기
          </span>
        </div>
      </div>
    </Link>
  );
}
