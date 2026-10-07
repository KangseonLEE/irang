import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { SupportProgram } from "@/lib/data/programs";
import { formatApplicationPeriod } from "@/lib/format";
import { daysUntilDeadline, ALWAYS_OPEN, isNewProgram, programStatusLabel } from "@/lib/program-status";
import { displayAmount, displaySupportType, displayText } from "@/lib/programs/display";
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
 *
 * `today`(KST YYYY-MM-DD): 클라이언트 ProgramList 안에서 SSR 되므로 D-N·신규·임박 판정의 기준일을
 * 부모가 `useKstToday(asOf)` 로 넘긴다 — 렌더 중 오늘을 직접 읽으면 하이드레이션이 어긋난다 (10/3).
 */
export function ProgramCard({ program, today }: { program: SupportProgram; today: string }) {
  const isClosed = program.status === "마감";
  const isNew = isNewProgram(program.createdAt, program.status, today);
  // 9999 페어: 접수 시기가 있으면 "정기 접수", 없으면 "공고 발표 예정" (program-status SSOT, 9/27)
  const statusLabel = programStatusLabel(program);
  // 수집 행의 지원 유형은 수집기 기본값 "보조금"뿐이라 배지째 뺀다 — 교육·경진대회 공고도 "보조금 지원"으로 보였다 (10/6 QA)
  const supportType = displaySupportType(program.id, program.supportType);
  const typeLabel = supportType ? (SUPPORT_TYPE_LABELS[supportType] ?? supportType) : null;
  // 수집 행의 "…에서 수집했어요." 같은 출처 문장뿐인 요약은 줄째 숨긴다 (10/3)
  const summary = displayText(program.id, program.summary);
  // 수집 행 지원금액은 원문 칸이 비어 "상세 공고 참조"가 채워진다 — 금액처럼 크게 보이지 않게 줄째 숨긴다(랜딩과 같은 규칙, 10/3)
  const amount = displayAmount(program.id, program.supportAmount);

  // 마감 임박 여부 — 카드 border-color 미세 강조용 (D-7 이내, 4면 동일)
  const days =
    program.applicationEnd && program.applicationEnd !== ALWAYS_OPEN
      ? daysUntilDeadline(program.applicationEnd, today)
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
          {supportType && typeLabel && <SupportTypeBadge type={supportType} label={typeLabel} />}
          <div className={s.badges}>
            {isNew && <span className={s.newBadge}>신규</span>}
            <DeadlineBadge
              applicationEnd={program.applicationEnd}
              applicationStart={program.applicationStart}
              status={program.status}
              today={today}
            />
            <StatusBadge status={statusLabel} />
          </div>
        </div>

        {/* 제목 — /programs 목록은 h1(페이지 제목) 바로 아래라 h2 (10/4 axe heading-order: h1 다음 h3 건너뜀).
            .title 이 margin·글자 크기·굵기를 모두 정해 두어 h3 → h2 로 바꿔도 화면은 같다 */}
        <h2 className={s.title}>{program.title}</h2>

        {/* 지원금액 — 데이터 핵심 강조 (토스 레퍼런스) */}
        {amount && <p className={s.amountLead}>{amount}</p>}

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
              {formatApplicationPeriod(program.applicationStart, program.applicationEnd, program.applicationCycle)}
            </span>
          </div>
        </div>

        {/* 요약 — 정보가 없으면 자리를 남기지 않는다(하단 CTA 는 margin-top:auto 로 바닥에 붙는다) */}
        {summary && <p className={s.summary}>{summary}</p>}

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
