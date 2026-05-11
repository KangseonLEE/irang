"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import s from "./eligibility-check.module.css";

interface EligibilityItem {
  label: string;
  detail: string;
}

interface EligibilityCheckProps {
  programTitle: string;
  ageMin: number;
  ageMax: number;
  eligibilityDetail: string;
  items?: EligibilityItem[];
}

/**
 * eligibilityDetail을 자격 체크 항목으로 파싱.
 *
 * 마침표로 split 후 다음 키워드 포함 문장은 제외 (자격이 아닌 정보):
 * - 신청 방법: "신청", "누리집", "포털", "콜센터", "고객센터"
 * - 선발·구성: "선발", "선정", "구성", "팀별", "약 N명", "연간 약"
 * - 교육·체류 안내: "교육기간", "체류", "과정 운영", "월 ~월"
 * - 마감·일자 미정: "공고 시 확정", "예정 — 정확", "발표 시 확정"
 *
 * 자격 키워드("만 N세", "이상", "이하", "거주", "전입", "수료", "대상") 우선.
 */
function parseEligibilityItems(detail: string): EligibilityItem[] {
  const parts = detail.split(/[.。]\s*/).filter(Boolean);
  const excludePattern =
    /(신청|누리집|포털|콜센터|고객센터|선발|선정|팀별|구성|약 \d+명|연간 약|교육기간|체류하|과정 운영|공고 시 확정|발표 시 확정|예정 — 정확|월 과정|개월 과정|개월 간|개월간)/;
  return parts
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter((label) => label.length >= 5) // URL fragment("or", "kr") 등 짧은 잔여 제외
    .filter((label) => /[가-힣]/.test(label)) // 한글 없는 영문/숫자 단편 제외
    .filter((label) => !excludePattern.test(label))
    .map((label) => ({ label, detail: "" }));
}

export function EligibilityCheck({
  programTitle,
  ageMin,
  ageMax,
  eligibilityDetail,
  items: externalItems,
}: EligibilityCheckProps) {
  const items = externalItems ?? parseEligibilityItems(eligibilityDetail);

  const allItems: EligibilityItem[] = [
    { label: `만 ${ageMin}세 ~ ${ageMax}세`, detail: "연령 조건" },
    ...items,
  ];

  const [checked, setChecked] = useState<boolean[]>(
    () => new Array(allItems.length).fill(false),
  );

  const toggle = useCallback((idx: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  }, []);

  const checkedCount = checked.filter(Boolean).length;
  const total = allItems.length;
  const allChecked = checkedCount === total;
  const progress = total > 0 ? (checkedCount / total) * 100 : 0;

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <h3 className={s.title}>자격 셀프 체크</h3>
        <span className={s.counter}>
          {checkedCount}/{total}
        </span>
      </div>

      <div className={s.progressBar}>
        <div
          className={s.progressFill}
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className={s.list}>
        {allItems.map((item, idx) => (
          <li key={idx} className={s.item}>
            <button
              type="button"
              className={`${s.checkBtn} ${checked[idx] ? s.checkBtnChecked : ""}`}
              onClick={() => toggle(idx)}
              aria-pressed={checked[idx]}
              aria-label={`${item.label} ${checked[idx] ? "확인됨" : "미확인"}`}
            >
              <Icon
                icon={checked[idx] ? CheckCircle2 : Circle}
                size="sm"
              />
              <span className={s.checkLabel}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {checkedCount > 0 && (
        <div className={allChecked ? s.resultPass : s.resultPartial}>
          {allChecked ? (
            <>
              <Icon icon={CheckCircle2} size="sm" />
              <span>{programTitle} 자격 요건을 모두 충족하는 것 같아요!</span>
            </>
          ) : (
            <>
              <Icon icon={AlertTriangle} size="sm" />
              <span>
                아직 {total - checkedCount}개 항목이 남아있어요. 공고문에서 세부 조건을 확인해보세요.
              </span>
            </>
          )}
        </div>
      )}

      <p className={s.disclaimer}>
        셀프 체크는 참고용이에요. 정확한 자격 요건은 공고문을 확인하세요.
      </p>
    </div>
  );
}
