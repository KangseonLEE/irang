"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./page.module.css";

/* ==========================================================================
   ChecklistInteractive
   localStorage 기반 인터랙티브 체크리스트
   — 체크 상태가 브라우저에 저장되어 재방문 시에도 유지됩니다.
   ========================================================================== */

interface ChecklistInteractiveProps {
  stepId: number;
  items: string[];
}

export function ChecklistInteractive({ stepId, items }: ChecklistInteractiveProps) {
  const storageKey = `guide-checklist-step-${stepId}`;
  const [checked, setChecked] = useState<boolean[]>(new Array(items.length).fill(false));
  const [mounted, setMounted] = useState(false);

  /* 마운트 시 localStorage에서 상태 복원 */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === items.length) {
          setChecked(parsed);
        }
      }
    } catch {
      /* localStorage 사용 불가 환경 무시 */
    }
  }, [storageKey, items.length]);

  /* 체크 토글 + 저장 */
  const toggle = useCallback(
    (index: number) => {
      setChecked((prev) => {
        const next = [...prev];
        next[index] = !next[index];
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          /* localStorage 사용 불가 환경 무시 */
        }
        // 타임라인 진행률 업데이트 트리거
        window.dispatchEvent(new Event("checklist-updated"));
        return next;
      });
    },
    [storageKey],
  );

  const completedCount = checked.filter(Boolean).length;

  return (
    <div className={s.checklistCard}>
      <h3 className={s.checklistTitle}>
        <Icon icon={CheckCircle2} size="md" />
        완료 체크리스트
        {mounted && completedCount > 0 && (
          <span className={s.checklistProgress}>
            {completedCount}/{items.length}
          </span>
        )}
      </h3>
      <ul className={s.checklistItems}>
        {items.map((item, i) => (
          <li key={i} className={s.checklistItem}>
            <button
              type="button"
              className={`${s.checkButton} ${mounted && checked[i] ? s.checkButtonChecked : ""}`}
              onClick={() => toggle(i)}
              aria-label={checked[i] ? `${item} 완료 해제` : `${item} 완료 표시`}
            >
              {mounted && checked[i] ? (
                <Icon icon={CheckCircle2} size="md" />
              ) : (
                <Icon icon={Circle} size="md" />
              )}
            </button>
            <span className={mounted && checked[i] ? s.checklistItemChecked : ""}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
