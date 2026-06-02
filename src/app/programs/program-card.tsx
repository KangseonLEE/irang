import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { SupportProgram } from "@/lib/data/programs";
import { formatApplicationPeriod } from "@/lib/format";
import { daysUntilDeadline, ALWAYS_OPEN, isNewProgram, isUnannounced, UNANNOUNCED_LABEL } from "@/lib/program-status";
import { StatusBadge } from "@/components/ui/status-badge";
import { SupportTypeBadge } from "@/components/ui/support-type-badge";
import { DeadlineBadge } from "@/components/ui/deadline-badge";
import s from "./program-card.module.css";

/** supportType -> 사용자 친화적 라벨 */
const SUPPORT_TYPE_LABELS: Record<string, string> = {
  보조금: "보조금 지원",
  융자: "융자 지원",
  교육: "교육 프로그램",
  현물: "현물 지원",
  컨설팅: "컨설팅 지원",
};

/**
 * 카드 hierarchy — Sprint Q (2026-05-20)
 * 상단: 유형 + 상태/신규/마감D-N → 제목 → 지원금액(강조) → 기관·지역 → 신청기간 → 요약
 * 데이터의 핵심 숫자(지원금)를 위로 끌어올려 토스 스타일 정보 위계 적용.
 */
export function ProgramCard({ program }: { program: SupportProgram }) {
  const isClosed = program.status === "마감";
  const isNew = isNewProgram(program.createdAt, program.status);
  // 9999 페어(공고 미발표)는 deriveStatus가 "모집예정"으로 산출하지만 표기는 "공고 발표 예정"(format.ts SSOT)
  const statusLabel = isUnannounced(program.applicationStart, program.applicationEnd)
    ? UNANNOUNCED_LABEL
    : program.status;
  const typeLabel =
    SUPPORT_TYPE_LABELS[program.supportType] ?? program.supportType;

  // 마감 임박 여부 — 카드 border-color 미세 강조용 (D-7 이내, 4면 동일)
  const days =
    program.applicationEnd && program.applicationEnd !== ALWAYS_OPEN
      ? daysUntilDeadline(program.applicationEnd)
      : Infinity;
  const isUrgent = !isClosed && days >= 0 && days <= 7;
  const cardClass = [
    s.card,
    isClosed ? s.closed : "",
    isUrgent ? s.urgent : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={`/programs/${program.id}`} className={s.link}>
      <div className={cardClass}>
        {/* 상단: 유형(overline) + 상태/신규/마감D-N */}
        <div className={s.topRow}>
          <SupportTypeBadge type={program.supportType} label={typeLabel} />
          <div className={s.badges}>
            {isNew && <span className={s.newBadge}>신규</span>}
            <DeadlineBadge
              applicationEnd={program.applicationEnd}
              status={program.status}
            />
            <StatusBadge status={statusLabel} />
          </div>
        </div>

        {/* 제목 */}
        <h3 className={s.title}>{program.title}</h3>

        {/* 지원금액 — 데이터 핵심 강조 (토스 레퍼런스) */}
        <p className={s.amountLead}>{program.supportAmount}</p>

        {/* 기관 + 지역 */}
        <div className={s.subtitle}>
          <MapPin size={13} />
          <span className={s.region}>{program.region}</span>
          <span className={s.dot} />
          <span className={s.org}>{program.organization}</span>
        </div>

        {/* 구분선 */}
        <hr className={s.divider} />

        {/* 신청기간 */}
        <div className={s.metaGrid}>
          <div className={s.metaItem}>
            <Calendar size={13} />
            <span className={s.metaValue}>
              {formatApplicationPeriod(program.applicationStart, program.applicationEnd)}
            </span>
          </div>
        </div>

        {/* 요약 */}
        <p className={s.summary}>{program.summary}</p>

        {/* 하단: 상세보기 CTA */}
        <div className={s.footer}>
          <span className={s.detailLink} aria-hidden="true">
            상세보기
          </span>
        </div>
      </div>
    </Link>
  );
}
