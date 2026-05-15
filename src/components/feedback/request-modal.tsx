"use client";

import { useState, useCallback, useMemo } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import s from "./request-modal.module.css";

const MAX_MESSAGE_LENGTH = 200;

/** 항목 추가 요청의 하위 카테고리 8종 */
const ITEM_CATEGORIES = [
  { value: "crop", label: "작물" },
  { value: "glossary", label: "용어" },
  { value: "program", label: "지원사업" },
  { value: "region", label: "지역" },
  { value: "education", label: "교육" },
  { value: "event", label: "체험" },
  { value: "interview", label: "인터뷰" },
  { value: "etc", label: "기타" },
] as const;

type ItemCategoryValue = (typeof ITEM_CATEGORIES)[number]["value"];
type RequestKind = "item" | "feature";

/** category prop(string) → 사전 매핑되는 item_category. 미매핑이면 undefined → 사용자 직접 선택 */
function inferItemCategory(category: string): ItemCategoryValue | undefined {
  switch (category) {
    case "작물":
      return "crop";
    case "지원사업":
      return "program";
    case "교육":
      return "education";
    case "체험":
      return "event";
    case "인터뷰":
      return "interview";
    case "용어":
      return "glossary";
    case "지역":
      return "region";
    default:
      return undefined;
  }
}

interface RequestModalProps {
  /** 모달 열림 상태 */
  open: boolean;
  /** 모달 닫기 콜백 */
  onClose: () => void;
  /** 자동 채워지는 키워드 (검색어 등) */
  keyword?: string;
  /** 요청 종류 라벨 (예: "정보", "작물", "지원사업") — 매핑 가능하면 item_category 사전 채움 */
  category?: string;
  /** 피드백 저장 시 page 필드 값 */
  pageName: string;
}

/**
 * /api/quick-feedback 으로 요청 저장 (fire-and-forget).
 * - service_role 경유 INSERT (anon RLS 차단 우회)
 * - request_kind / item_category 컬럼은 마이그레이션 적용 후 활성 (적용 전엔 서버에서 무시)
 */
async function saveRequest(data: {
  message: string;
  page: string;
  requestKind: RequestKind | null;
  itemCategory: ItemCategoryValue | null;
}): Promise<void> {
  try {
    await fetch("/api/quick-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: "neutral",
        message: data.message,
        page: data.page,
        request_kind: data.requestKind,
        item_category: data.itemCategory,
      }),
    });
  } catch {
    // fire-and-forget
  }
}

export function RequestModal({
  open,
  onClose,
  keyword = "",
  category = "정보",
  pageName,
}: RequestModalProps) {
  const inferred = useMemo(() => inferItemCategory(category), [category]);

  const [kind, setKind] = useState<RequestKind>("item");
  const [itemCategory, setItemCategory] = useState<ItemCategoryValue | "">(
    inferred ?? "",
  );
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const resetForm = useCallback(() => {
    setKind("item");
    setItemCategory(inferred ?? "");
    setMessage("");
    setSubmitting(false);
    setSent(false);
  }, [inferred]);

  const handleClose = useCallback(() => {
    onClose();
    // 닫은 후 폼 리셋 (애니메이션 후)
    window.setTimeout(resetForm, 200);
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    // 메시지 접두사 구성 — 기존 admin 키워드 분석 호환 유지
    const kindLabel = kind === "feature" ? "기능 요청" : `${category} 요청`;
    const prefix = keyword ? `[${kindLabel}: ${keyword}]` : `[${kindLabel}]`;
    const fullMessage = message.trim()
      ? `${prefix} ${message.trim()}`
      : prefix;

    await saveRequest({
      message: fullMessage,
      page: pageName,
      requestKind: kind,
      itemCategory: kind === "item" && itemCategory ? itemCategory : null,
    });

    setSubmitting(false);
    setSent(true);

    window.setTimeout(handleClose, 2000);
  }, [
    submitting,
    keyword,
    category,
    kind,
    itemCategory,
    message,
    pageName,
    handleClose,
  ]);

  const title = kind === "feature" ? "기능 추가 요청" : `${category} 추가 요청`;

  // 제출 가능 조건
  // - item: 카테고리 선택 + (keyword 있거나 message 입력)
  // - feature: message 필수
  const canSubmit =
    kind === "feature"
      ? message.trim().length > 0
      : Boolean(itemCategory) && (Boolean(keyword) || message.trim().length > 0);

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {sent ? (
        <div className={s.success}>
          <span className={s.successEmoji} aria-hidden="true">
            {"\u{1F64F}"}
          </span>
          <h3 className={s.successTitle}>요청이 전달됐어요!</h3>
          <p className={s.successDesc}>검토 후 우선적으로 추가할게요.</p>
        </div>
      ) : (
        <>
          {keyword && (
            <div className={s.keywordBadge}>
              <MessageSquarePlus size={14} aria-hidden="true" />
              <span>&lsquo;{keyword}&rsquo;</span>
            </div>
          )}

          <p className={s.intro}>어떤 종류의 요청인가요?</p>

          {/* ── 1단계: 종류 선택 (라디오) ── */}
          <div
            className={s.kindGroup}
            role="radiogroup"
            aria-label="요청 종류"
          >
            <label
              className={`${s.kindOption} ${kind === "item" ? s.kindOptionActive : ""}`}
            >
              <input
                type="radio"
                name="request-kind"
                value="item"
                checked={kind === "item"}
                onChange={() => setKind("item")}
                className={s.kindRadio}
              />
              <span className={s.kindLabel}>항목 추가</span>
              <span className={s.kindHint}>작물·용어·지원사업 등</span>
            </label>
            <label
              className={`${s.kindOption} ${kind === "feature" ? s.kindOptionActive : ""}`}
            >
              <input
                type="radio"
                name="request-kind"
                value="feature"
                checked={kind === "feature"}
                onChange={() => setKind("feature")}
                className={s.kindRadio}
              />
              <span className={s.kindLabel}>기능 추가</span>
              <span className={s.kindHint}>새 화면·필터·검색 등</span>
            </label>
          </div>

          {/* ── 2단계 (item일 때만): 카테고리 select ── */}
          {kind === "item" && (
            <div className={s.field}>
              <label htmlFor="request-item-category" className={s.fieldLabel}>
                어떤 항목이에요?
              </label>
              <select
                id="request-item-category"
                className={s.select}
                value={itemCategory}
                onChange={(e) =>
                  setItemCategory(e.target.value as ItemCategoryValue | "")
                }
              >
                <option value="">선택해 주세요</option>
                {ITEM_CATEGORIES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ── 3단계: 자유 입력 ── */}
          <textarea
            className={s.textarea}
            placeholder={
              kind === "feature"
                ? "어떤 기능이 있으면 좋을까요?"
                : keyword
                  ? "추가 설명이 있다면 적어주세요 (선택)"
                  : "원하는 항목을 설명해 주세요"
            }
            maxLength={MAX_MESSAGE_LENGTH}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <button
            type="button"
            className={s.submitBtn}
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            {submitting ? "전달 중..." : "요청 보내기"}
          </button>
        </>
      )}
    </Modal>
  );
}

/**
 * 요청 모달을 여는 트리거 버튼 (인라인 사용용)
 */
interface RequestButtonProps {
  keyword?: string;
  category?: string;
  pageName: string;
  /** 버튼 라벨 */
  label?: string;
  className?: string;
  iconSize?: number;
}

export function RequestButton({
  keyword,
  category = "정보",
  pageName,
  label,
  className,
  iconSize = 16,
}: RequestButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setOpen(true)}
      >
        <MessageSquarePlus size={iconSize} aria-hidden="true" />
        {label ?? `${category} 추가 요청하기`}
      </button>
      <RequestModal
        open={open}
        onClose={() => setOpen(false)}
        keyword={keyword}
        category={category}
        pageName={pageName}
      />
    </>
  );
}
