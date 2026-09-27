"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Circle, AlertTriangle, ClipboardCheck } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { formatAgeRange } from "@/lib/format";
import { analytics } from "@/lib/analytics";
import { SourceLinkButton } from "./source-link-button";
import s from "./eligibility-check.module.css";

interface EligibilityItem {
  label: string;
  detail: string;
}

interface EligibilityCheckProps {
  /** 사이드 탭 패널 안에 놓일 때 — 카드 껍데기·제목 없이 (탭 라벨이 제목) */
  bare?: boolean;
  programTitle: string;
  ageMin: number;
  ageMax: number;
  eligibilityDetail: string;
  /** 확인처 — 미충족 항목이 있을 때 문의할 기관 */
  organization: string;
  /** 원문 공고 URL — 결과 화면에서 바로 확인할 수 있게 */
  sourceUrl: string;
  linkStatus?: "active" | "broken" | "unverified";
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
 * - 접수 안내·문의처: "접수 기간", "접수 시기", "담당 부서", "문의" (9/27 추가)
 *
 * 자격 키워드("만 N세", "이상", "이하", "거주", "전입", "수료", "대상") 우선.
 *
 * 9/27: 결과 화면이 미확인 항목을 나열하게 되면서, 자격이 아닌 문장이 "충족하지 못한 조건"으로
 * 읽히는 게 드러났다(SP-001 "접수 기간은 시군별로 달라요…"). 접수 안내·문의처를 제외에 추가 —
 * 71건 전수 대조로 항목 239 → 230, 9건에서 9줄 제거, 전부 자격이 아닌 문장이었다.
 */
function parseEligibilityItems(detail: string): EligibilityItem[] {
  const parts = detail.split(/[.。]\s*/).filter(Boolean);
  const excludePattern =
    /(신청|누리집|포털|콜센터|고객센터|선발|선정|팀별|구성|약 \d+명|연간 약|교육기간|체류하|과정 운영|공고 시 확정|발표 시 확정|예정 — 정확|월 과정|개월 과정|개월 간|개월간|접수 기간|접수 시기|접수했|담당 부서|문의)/;
  return parts
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter((label) => label.length >= 5) // URL fragment("or", "kr") 등 짧은 잔여 제외
    .filter((label) => /[가-힣]/.test(label)) // 한글 없는 영문/숫자 단편 제외
    .filter((label) => !excludePattern.test(label))
    .filter((label) => !/^만 \d+세/.test(label)) // "만 N세 이상..." 연령 시작 문장 (위 자동 항목과 중복)
    .map((label) => ({ label, detail: "" }));
}

/**
 * 자격 셀프 체크 (2026-09-27 재구성 — 카드 인라인 체크리스트 → 버튼 + 결과 모달).
 *
 * 사이드바에 체크리스트를 펼쳐 두면 관련 작물·원문 링크를 아래로 밀어내고,
 * 체크해도 "결과"라는 매듭이 없어 무엇을 해야 하는지 남지 않았다. 이제 카드는
 * 버튼 하나로 줄이고, 체크 → 결과 → 다음 행동(원문 확인 / 기관 문의)까지 모달 안에서 끝낸다.
 *
 * 저장·전송 없음 — 브라우저 안에서만 계산한다. 결과만 GA4 에 남긴다(pass / miss:N).
 */
export function EligibilityCheck({
  bare = false,
  programTitle,
  ageMin,
  ageMax,
  eligibilityDetail,
  organization,
  sourceUrl,
  linkStatus,
  items: externalItems,
}: EligibilityCheckProps) {
  const items = externalItems ?? parseEligibilityItems(eligibilityDetail);

  const allItems: EligibilityItem[] = [
    { label: formatAgeRange(ageMin, ageMax), detail: "연령 조건" },
    ...items,
  ];

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"check" | "result">("check");
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
  const missing = allItems.filter((_, idx) => !checked[idx]);

  const openModal = useCallback(() => {
    setView("check");
    setOpen(true);
  }, []);

  const showResult = useCallback(() => {
    setView("result");
    analytics.programSelfCheckResult(
      checkedCount === total ? "pass" : `miss:${total - checkedCount}`,
    );
  }, [checkedCount, total]);

  return (
    <div className={bare ? s.wrapBare : s.wrap}>
      {!bare && <h3 className={s.title}>자격 셀프 체크</h3>}
      <p className={s.lead}>
        연령·거주·교육 조건을 하나씩 짚어 보고 바로 결과를 확인할 수 있어요.
      </p>
      <button type="button" className={s.openBtn} onClick={openModal}>
        <Icon icon={ClipboardCheck} size="sm" />
        자격 셀프 체크하기
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="자격 셀프 체크">
        {view === "check" ? (
          <div className={s.modalBody}>
            <p className={s.modalLead}>
              해당하는 항목을 눌러 표시해 보세요. {total}개 중 {checkedCount}개를 확인했어요.
            </p>

            <div className={s.progressBar}>
              <div className={s.progressFill} style={{ width: `${progress}%` }} />
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
                    <Icon icon={checked[idx] ? CheckCircle2 : Circle} size="sm" />
                    <span className={s.checkLabel}>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className={s.actions}>
              <button type="button" className={s.primaryBtn} onClick={showResult}>
                결과 보기
              </button>
            </div>

            <p className={s.disclaimer}>
              셀프 체크는 참고용이에요. 정확한 자격 요건은 공고문을 확인하세요.
            </p>
          </div>
        ) : (
          <div className={s.modalBody}>
            {allChecked ? (
              <>
                <div className={s.resultPass}>
                  <Icon icon={CheckCircle2} size="sm" />
                  <span>신청 조건을 모두 충족해요</span>
                </div>
                <p className={s.resultDesc}>
                  {programTitle}의 자격 요건을 모두 표시했어요. 접수 방법과 제출 서류는 원문
                  공고에서 확인하세요.
                </p>
              </>
            ) : (
              <>
                <div className={s.resultPartial}>
                  <Icon icon={AlertTriangle} size="sm" />
                  <span>아직 확인이 필요한 항목이에요</span>
                </div>
                <ul className={s.missingList}>
                  {missing.map((item) => (
                    <li key={item.label} className={s.missingItem}>
                      {item.label}
                    </li>
                  ))}
                </ul>
                <p className={s.resultDesc}>
                  표시하지 않은 항목은 예외 규정이 있을 수 있어요. {organization}에 문의하면
                  정확히 알 수 있어요.
                </p>
              </>
            )}

            <div className={s.actions}>
              <SourceLinkButton
                href={sourceUrl}
                linkStatus={linkStatus}
                title={programTitle}
              />
              <button
                type="button"
                className={s.secondaryBtn}
                onClick={() => setView("check")}
              >
                다시 체크
              </button>
            </div>

            <p className={s.disclaimer}>
              셀프 체크는 참고용이에요. 정확한 자격 요건은 공고문을 확인하세요.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
