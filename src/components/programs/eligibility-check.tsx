"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, AlertTriangle, ClipboardCheck, ArrowRight } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { formatAgeRange } from "@/lib/format";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { resolveEligibilitySupport } from "@/lib/programs/eligibility-support";
/* 파서는 lib 로 옮겼다 (9/28 QA) — 클라이언트 모듈에서 비컴포넌트를 export 하면
   서버가 import 할 때 프록시가 오고(9/17 박제), 단위 테스트도 붙이기 어렵다. */
import { parseEligibilityItems, type EligibilityItem } from "@/lib/programs/parse-eligibility";
import { analytics } from "@/lib/analytics";
import { SourceLinkButton } from "./source-link-button";
import s from "./eligibility-check.module.css";

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
  /**
   * 연령 자동 항목을 빼는가 — 수집 행의 18~65 는 원문이 아니라 수집기 기본값이다 (10/6 QA Q1-F2).
   * 본문이 "만 45세 미만 청년"인 공고에 "만 18~65세"를 체크하게 하면 결과가 사실과 달라진다.
   */
  hideAge?: boolean;
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
  hideAge = false,
}: EligibilityCheckProps) {
  const items = externalItems ?? parseEligibilityItems(eligibilityDetail);

  const allItems: EligibilityItem[] = [
    ...(hideAge ? [] : [{ label: formatAgeRange(ageMin, ageMax), detail: "연령 조건" }]),
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

  /* ── 모바일(<1024) 껍데기만 분기 (2026-09-28 회장 2차) ──
     체크 흐름은 데스크탑과 **같은 모달 한 벌**을 쓴다. 인라인 체크 행은 결론이 흐려
     "무엇을 채워야 하는지"가 남지 않아 되돌렸다. 섹션은 조건 요약 + 결과 행만 든다.
     useSyncExternalStore 훅이라 서버 스냅샷은 false(데스크탑) — 링크·텍스트는 양쪽 동일. */
  const isMobile = useMediaQuery("(max-width: 1023px)");
  /** 모달에서 "결과 보기"를 한 번이라도 눌렀는지 — 섹션 결과 행 노출 조건 */
  const [hasResult, setHasResult] = useState(false);

  const openModal = useCallback(() => {
    setView("check");
    setOpen(true);
  }, []);

  const showResult = useCallback(() => {
    setView("result");
    setHasResult(true);
    analytics.programSelfCheckResult(
      checkedCount === total ? "pass" : `miss:${total - checkedCount}`,
    );
  }, [checkedCount, total]);

  const summaryLine = allItems.map((i) => i.label).join(" · ");

  /* 짚을 조건이 하나도 없으면 그리지 않는다 — 0개면 "0개 중 0개" → 결과가 "모두 충족해요"로 나온다.
     호출부(지원사업 상세)는 이 경우 탭째 빼지만, 컴포넌트도 스스로 막는다 (10/6 QA). */
  if (total === 0) return null;

  const modal = (
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
                  {/* 미충족 항목마다 "채워야 할 것" + 이랑 안에서 도울 수 있는 경로 (9/28 회장) */}
                  <ul className={s.missingList}>
                    {missing.map((item) => {
                      const support = resolveEligibilitySupport(item.label);
                      return (
                        <li key={item.label} className={s.missingItem}>
                          <span className={s.missingLabel}>{item.label}</span>
                          {support ? (
                            <span className={s.missingSupport}>
                              <span className={s.missingTodo}>{support.title}</span>
                              <Link
                                href={support.href}
                                className={s.missingLink}
                                data-track={`program_selfcheck:${support.kind}`}
                                onClick={() => setOpen(false)}
                              >
                                {support.cta}
                                <Icon icon={ArrowRight} size="sm" />
                              </Link>
                            </span>
                          ) : (
                            <span className={s.missingTodo}>
                              {organization}에 확인이 필요해요
                            </span>
                          )}
                        </li>
                      );
                    })}
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
  );

  if (isMobile) {
    return (
      <div className={s.mWrap}>
        {/* 제목·우측 메타는 SidebarTabs 스택 헤딩이 담당 (중복 방지) */}
        {/* 조건은 접지 않고 전부 평문으로 (9/28 회장: 요약 박스·옆 버튼 → 내용 + 버튼) */}
        {allItems.length > 3 ? (
          <ul className={s.mConditions}>
            {allItems.map((item, idx) => (
              <li key={idx} className={s.mCondition}>
                {item.label}
              </li>
            ))}
          </ul>
        ) : (
          <p className={s.mConditionText}>{summaryLine}</p>
        )}

        <button type="button" className={s.mOpenBtn} onClick={openModal}>
          <Icon icon={ClipboardCheck} size="sm" />
          {hasResult ? "다시 체크하기" : "자격 셀프 체크하기"}
        </button>

        {hasResult && (
          <div className={s.mResult}>
            <span className={s.mResultLabel}>확인한 조건</span>
            <span className={s.mResultRight}>
              <strong className={s.mResultNum}>
                {checkedCount} / {total}
              </strong>
              <span className={allChecked ? s.mResultOk : s.mResultMiss}>
                {allChecked
                  ? "모두 충족했어요"
                  : `${total - checkedCount}개 더 확인이 필요해요`}
              </span>
            </span>
          </div>
        )}

        {/* 원문 CTA·기관 문의 안내는 사이드 "원문 확인" 카드와 중복이라 제거 (9/28 회장).
            모달 결과 화면의 CTA 는 그 자리에서 다음 행동이 필요하므로 유지한다. */}
        {modal}
      </div>
    );
  }

  return (
    <div className={bare ? s.wrapBare : s.wrap}>
      {!bare && <h3 className={s.title}>자격 셀프 체크</h3>}
      <p className={s.lead}>
        {hideAge
          ? "공고에 적힌 조건을 하나씩 짚어 보고 바로 결과를 확인할 수 있어요."
          : "연령·거주·교육 조건을 하나씩 짚어 보고 바로 결과를 확인할 수 있어요."}
      </p>
      <button type="button" className={s.openBtn} onClick={openModal}>
        <Icon icon={ClipboardCheck} size="sm" />
        자격 셀프 체크하기
      </button>

      {modal}
    </div>
  );
}
