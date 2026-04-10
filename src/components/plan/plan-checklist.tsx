"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { PlanStep } from "@/lib/data/plan";
import s from "./plan-checklist.module.css";

const STORAGE_KEY = "irang-plan-checklist";

interface Props {
  steps: PlanStep[];
}

/** localStorage에서 체크 상태를 읽어온다 */
function loadCheckedItems(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr: unknown = JSON.parse(raw);
    if (Array.isArray(arr)) return new Set(arr.filter((v) => typeof v === "string"));
    return new Set();
  } catch {
    return new Set();
  }
}

/** localStorage에 체크 상태를 저장한다 */
function saveCheckedItems(items: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]));
  } catch {
    // quota 초과 등 무시
  }
}

export default function PlanChecklist({ steps }: Props) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([1])); // 1단계 기본 펼침
  const [hydrated, setHydrated] = useState(false);

  // 클라이언트 hydration 후 localStorage 로드
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCheckedItems(loadCheckedItems());
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const toggleCheck = useCallback((itemId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      saveCheckedItems(next);
      return next;
    });
  }, []);

  const toggleStep = useCallback((stepNum: number) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  }, []);

  // 전체 진행률 계산
  const totalItems = steps.reduce((sum, step) => sum + step.checklist.length, 0);
  const checkedCount = steps.reduce(
    (sum, step) =>
      sum + step.checklist.filter((item) => checkedItems.has(item.id)).length,
    0
  );

  return (
    <div className={s.wrapper}>
      {/* 진행률 표시 */}
      {hydrated && (
        <div className={s.progress}>
          <div className={s.progressHeader}>
            <span className={s.progressLabel}>진행률</span>
            <span className={s.progressCount}>
              {checkedCount} / {totalItems}
            </span>
          </div>
          <div
            className={s.progressBar}
            role="progressbar"
            aria-valuenow={checkedCount}
            aria-valuemin={0}
            aria-valuemax={totalItems}
            aria-label={`체크리스트 진행률 ${totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0}%`}
          >
            <div
              className={s.progressFill}
              style={{
                width: totalItems > 0 ? `${(checkedCount / totalItems) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      )}

      {/* 아코디언 */}
      <div className={s.accordion}>
        {steps.map((step) => {
          const isOpen = openSteps.has(step.step);
          const stepChecked = step.checklist.filter((item) =>
            checkedItems.has(item.id)
          ).length;

          return (
            <div key={step.id} className={s.accordionItem}>
              <button
                type="button"
                className={s.accordionTrigger}
                onClick={() => toggleStep(step.step)}
                aria-expanded={isOpen}
                aria-controls={`plan-step-${step.step}`}
              >
                <span className={s.stepBadge} aria-hidden="true">
                  {step.step}
                </span>
                <div className={s.triggerContent}>
                  <span className={s.triggerTitle}>
                    {step.title}
                  </span>
                  <span className={s.triggerMeta}>
                    {step.timeline}
                    {hydrated && (
                      <> &middot; {stepChecked}/{step.checklist.length}</>
                    )}
                  </span>
                </div>
                <span
                  className={`${s.chevron} ${isOpen ? s.chevronOpen : ""}`}
                  aria-hidden="true"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <div
                id={`plan-step-${step.step}`}
                className={`${s.accordionPanel} ${isOpen ? s.panelOpen : ""}`}
                role="region"
                aria-labelledby={`plan-trigger-${step.step}`}
                hidden={!isOpen}
              >
                <div className={s.panelInner}>
                  <p className={s.stepGoal}>
                    <strong>목표:</strong> {step.goal}
                  </p>
                  <ul className={s.checklist} role="list">
                    {step.checklist.map((item) => {
                      const isChecked = checkedItems.has(item.id);
                      return (
                        <li key={item.id} className={s.checkItem}>
                          <label className={s.checkLabel}>
                            <input
                              type="checkbox"
                              className={s.checkbox}
                              checked={hydrated ? isChecked : false}
                              onChange={() => toggleCheck(item.id)}
                            />
                            <span
                              className={`${s.checkText} ${isChecked && hydrated ? s.checkTextDone : ""}`}
                            >
                              {item.label}
                            </span>
                          </label>
                          <p className={s.checkDesc}>{item.description}</p>
                          <div className={s.checkLinks}>
                            {item.irangLink && (
                              <Link
                                href={item.irangLink}
                                className={s.checkLink}
                              >
                                {item.irangLinkLabel ?? "바로가기"}
                              </Link>
                            )}
                            {item.externalLink && (
                              <a
                                href={item.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={s.checkLinkExternal}
                              >
                                {item.externalLinkLabel ?? "외부 링크"}
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                  aria-hidden="true"
                                >
                                  <path
                                    d="M3.5 1.5H10.5V8.5M10.5 1.5L1.5 10.5"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
