"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { getPageName } from "@/lib/page-names";
import { useFocusDodge } from "@/lib/hooks/use-focus-dodge";
import s from "./feedback-widget.module.css";
import { internalRequestHeaders } from "@/lib/internal-traffic";

type Rating = "good" | "neutral" | "bad";

interface RatingOption {
  value: Rating;
  emoji: string;
  label: string;
}

const RATING_OPTIONS: RatingOption[] = [
  { value: "good", emoji: "\u{1F60A}", label: "좋아요" },
  { value: "neutral", emoji: "\u{1F610}", label: "보통" },
  { value: "bad", emoji: "\u{1F622}", label: "아쉬워요" },
];

const MAX_MESSAGE_LENGTH = 300;

/**
 * /api/quick-feedback 으로 피드백 저장 (fire-and-forget).
 * - service_role 경유 INSERT (search-log와 동일 패턴)
 * - anon Supabase client는 RLS로 차단됨 (5/4 hardening)
 */
async function saveFeedback(data: {
  rating: Rating;
  message: string;
  page: string;
}): Promise<void> {
  try {
    await fetch("/api/quick-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...internalRequestHeaders() },
      body: JSON.stringify({
        rating: data.rating,
        message: data.message,
        page: data.page,
      }),
    });
  } catch {
    // fire-and-forget — 네트워크 실패는 조용히 무시
  }
}

/**
 * 랜딩 히어로가 버튼 자리 밑에 깔려 있는 동안 버튼에 `data-over-hero` 를 단다 — 10/6 QA ⚪.
 * 첫 화면에서 버튼이 히어로의 마감 카드·"전체 보기"(1280)·유형 카드 수치(768)를 덮었다. 히어로가 버튼 위로 지나가면 다시 보인다.
 * React 상태 대신 속성을 직접 토글한다 — 첫 측정을 그리기 전(layout effect)에 끝내 버튼이 한 번 떴다 사라지지 않게,
 * 스크롤마다 다시 렌더하지 않게(hero-search-dock 의 html[data-hero-passed] 와 같은 방식).
 */
function useOverLandingHero(
  ref: React.RefObject<HTMLElement | null>,
  pathname: string | null,
  /** 버튼이 그려진 뒤에만 잰다(마운트 전엔 ref 가 비어 있다) */
  enabled: boolean,
): void {
  useLayoutEffect(() => {
    const fab = ref.current;
    if (!enabled || !fab) return;
    // 히어로는 랜딩에만 있다 — 다른 경로는 듣지도 않는다
    if (pathname !== "/") {
      fab.removeAttribute("data-over-hero");
      return;
    }
    let raf = 0;
    const measure = () => {
      raf = 0;
      // 매번 찾는다 — 첫 로드는 레이아웃(이 버튼)이 하이드레이션될 때 랜딩 본문이 아직 스트리밍 중일 수 있다(dev 실측: 히어로 없음 → 영영 안 잼)
      const hero = document.querySelector<HTMLElement>("[data-landing-hero]");
      const f = fab.getBoundingClientRect();
      if (!hero || f.width === 0) {
        fab.removeAttribute("data-over-hero");
        return;
      }
      const h = hero.getBoundingClientRect();
      fab.toggleAttribute("data-over-hero", h.top < f.bottom && h.bottom > f.top - 8);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    // 본문 스트리밍·스타일시트·웹폰트가 늦게 붙어도 맞게 — 다음 프레임과 잠시 뒤 두 번 더 잰다
    schedule();
    const lates = [700, 2000].map((ms) => window.setTimeout(schedule, ms));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("load", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("load", schedule);
      lates.forEach((t) => window.clearTimeout(t));
      if (raf) cancelAnimationFrame(raf);
      fab.removeAttribute("data-over-hero");
    };
  }, [ref, pathname, enabled]);
}

export function FeedbackWidget() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<Rating | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  /* 키보드 포커스(푸터 '이용약관' 등)를 가리면 비켜난다 — 10/3 QA 1440 41% 가림 */
  const dodge = useFocusDodge(fabRef);
  useOverLandingHero(fabRef, pathname, mounted);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR hydration 우회 표준 패턴
  useEffect(() => { setMounted(true); }, []);

  const resetForm = useCallback(() => {
    setRating(null);
    setMessage("");
    setSubmitting(false);
    setSent(false);
  }, []);

  const handleOpen = useCallback(() => {
    resetForm();
    setOpen(true);
  }, [resetForm]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!rating || submitting) return;
    setSubmitting(true);

    await saveFeedback({
      rating,
      message: message.trim(),
      page: getPageName(pathname ?? "/"),
    });

    setSubmitting(false);
    setSent(true);

    // 2초 후 자동 닫기
    window.setTimeout(() => {
      setOpen(false);
    }, 2000);
  }, [rating, message, submitting, pathname]);

  if (!mounted) return null;

  return (
    <>
      <button
        ref={fabRef}
        type="button"
        className={s.fab}
        data-dodge={dodge ? "true" : undefined}
        /* 키보드 포커스를 가리면 스스로 비켜난다 — 전역 포커스 노출(use-focus-reveal)이 문서를 밀 띠로 세지 않게 */
        data-focus-reveal-ignore=""
        onClick={handleOpen}
        aria-label="피드백 보내기"
      >
        <MessageCircle size={20} aria-hidden="true" />
      </button>

      <Modal open={open} onClose={handleClose} title="의견 보내기">
        {sent ? (
          <div className={s.success}>
            <span className={s.successEmoji} aria-hidden="true">
              {"\u{1F64F}"}
            </span>
            <h3 className={s.successTitle}>소중한 의견 감사해요!</h3>
            <p className={s.successDesc}>
              더 나은 서비스를 만드는 데 큰 힘이 돼요.
            </p>
          </div>
        ) : (
          <>
            <p className={s.intro}>
              이랑을 사용하면서 느낀 점을 알려주세요.
            </p>

            {/* 이모지 선택 */}
            <div
              className={s.emojiRow}
              role="radiogroup"
              aria-label="만족도"
            >
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={s.emojiBtn}
                  data-active={rating === opt.value || undefined}
                  role="radio"
                  aria-checked={rating === opt.value}
                  aria-label={opt.label}
                  onClick={() => setRating(opt.value)}
                >
                  <span className={s.emoji} aria-hidden="true">
                    {opt.emoji}
                  </span>
                  <span className={s.emojiLabel}>{opt.label}</span>
                </button>
              ))}
            </div>

            {/* 텍스트 입력 */}
            <textarea
              className={s.textarea}
              placeholder="더 나은 서비스를 위해 의견을 남겨주세요"
              maxLength={MAX_MESSAGE_LENGTH}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <span className={s.pagePath}>
              현재 페이지: {getPageName(pathname ?? "/")}
            </span>

            {/* 제출 */}
            <button
              type="button"
              className={s.submitBtn}
              onClick={handleSubmit}
              disabled={!rating || submitting}
            >
              {submitting ? "보내는 중..." : "보내기"}
            </button>
          </>
        )}
      </Modal>
    </>
  );
}
