"use client";

/**
 * 서비스 선택 화면 — "이전 진단 결과" 목록 (이 브라우저 localStorage).
 *
 * 2026-10-06: 정착 유형 진단만 남던 목록에 빠른 점검·적합도 진단 결과도 함께 보인다(QA Q4-W11, 재방문 = M7 지표).
 * 서버와 하이드레이션 첫 렌더는 빈 목록이라 아무것도 그리지 않는다 — 기록이 있으면 마운트 뒤 나타난다.
 */
import { ChevronRight, History, Trash2 } from "lucide-react";
import { useDialog } from "@/components/ui/confirm-dialog";
import { calculateResult } from "@/lib/data/assessment";
import { FARM_TYPES, migrateFarmTypeId } from "@/lib/data/match-questions";
import { getPersona } from "@/lib/data/personas";
import { mapToPersona } from "@/lib/data/quick-check";
import type { DiagnosisHistoryItem } from "@/lib/diagnosis/history";
import { useDiagnosisHistory } from "@/lib/diagnosis/use-diagnosis-history";
import s from "./service-gateway.module.css";

/** "4월 15일" — 저장 시각(브라우저 기준) */
function formatSavedDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

interface HistoryRow {
  emoji: string;
  label: string;
  sub: string;
}

/** 목록 한 줄 — 답을 다시 계산해 지금 기준의 결과 이름을 보여 준다 */
function describe(item: DiagnosisHistoryItem): HistoryRow {
  if (item.kind === "quick") {
    const persona = getPersona(mapToPersona(item.answers));
    return {
      emoji: "⚡",
      label: persona?.label ?? "빠른 점검",
      sub: ["빠른 점검", persona?.desc].filter(Boolean).join(" · "),
    };
  }
  if (item.kind === "assess") {
    const { tier, totalScore } = calculateResult(item.answers);
    const track = FARM_TYPES.find((t) => t.id === migrateFarmTypeId(item.farmTypeId));
    return {
      emoji: tier.emoji,
      label: tier.title,
      sub: [`적합도 진단 · 총점 ${totalScore}점`, track ? `${track.label} 트랙` : null]
        .filter(Boolean)
        .join(" · "),
    };
  }
  const ft = FARM_TYPES.find((t) => t.id === migrateFarmTypeId(item.farmTypeId));
  return {
    emoji: ft?.emoji ?? "🌾",
    label: ft?.label ?? item.farmTypeLabel,
    sub: ["유형 진단", ...item.topRegions].join(" · "),
  };
}

interface GatewayHistoryProps {
  onOpen: (item: DiagnosisHistoryItem) => void;
}

export function GatewayHistory({ onOpen }: GatewayHistoryProps) {
  const { history, hasHistory, clearHistory } = useDiagnosisHistory();
  const { confirm } = useDialog();
  if (!hasHistory) return null;

  /** 되돌릴 수 없는 삭제 — 세 진단 기록이 한꺼번에 지워지므로 한 번 묻는다 (10/6 2차 QA R2-Q4, 공용 다이얼로그) */
  const handleClear = async () => {
    const ok = await confirm({
      title: "이전 진단 결과를 모두 지울까요?",
      description: `이 브라우저에 저장된 결과 ${history.length}건이 지워져요. 지운 결과는 되돌릴 수 없어요.`,
      confirmLabel: "모두 지우기",
      tone: "danger",
      icon: Trash2,
    });
    if (ok) clearHistory();
  };

  return (
    <section className={s.historySection} aria-labelledby="gateway-history-title">
      <div className={s.historyHeader}>
        <h2 id="gateway-history-title" className={s.historyTitle}>
          <History size={16} aria-hidden="true" />
          이전 진단 결과
        </h2>
        <button type="button" onClick={handleClear} className={s.historyClear}>
          <Trash2 size={14} aria-hidden="true" />
          전체 삭제
        </button>
      </div>
      <ul className={s.historyList}>
        {history.map((item) => {
          const row = describe(item);
          return (
            <li key={item.resultId}>
              <button type="button" onClick={() => onOpen(item)} className={s.historyItem}>
                <span className={s.historyEmoji} aria-hidden="true">
                  {row.emoji}
                </span>
                <span className={s.historyBody}>
                  <span className={s.historyTopRow}>
                    <span className={s.historyLabel}>{row.label}</span>
                    <span className={s.historyDate}>{formatSavedDate(item.savedAt)}</span>
                  </span>
                  <span className={s.historyRegions}>{row.sub}</span>
                </span>
                <ChevronRight size={16} className={s.historyArrow} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      <p className={s.historyHint}>
        결과는 이 브라우저에만 저장돼요. 전체 삭제로 기록을 지울 수 있어요.
      </p>
    </section>
  );
}
