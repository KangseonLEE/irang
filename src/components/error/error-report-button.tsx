"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import { useDialog } from "@/components/ui/confirm-dialog";
import { INTERNAL_TRAFFIC_FLAG } from "@/lib/analytics-gate";
import { INTERNAL_TRAFFIC_COOKIE } from "@/lib/internal-traffic";
import s from "./error-report-button.module.css";

/**
 * 오류 화면의 "관리자에게 알리기" (2026-09-30 회장: "사용자가 관리자에게 내용을 보낼 수 있도록
 * 자동으로 그 화면을 캡처해서 같이 받을 수 있게").
 *
 * Sentry SDK 의 User Feedback 위젯을 **새 의존성 0** 으로 띄운다. 전송된 항목은 Sentry
 * Issues → User Feedback 에 쌓이고, `associated_event_id` 로 같은 오류 이벤트에 묶여
 * 스크린샷·설명·스택이 한 이슈에서 함께 보인다(기존 Sentry → GitHub Issue → iPhone 푸시 체인 재사용).
 *
 * ## 스크린샷의 실제 동작 (SDK 10.73 실측)
 * Sentry 의 스크린샷은 `navigator.mediaDevices.getDisplayMedia()` 로 **화면 공유 권한**을 받아
 * 뷰포트를 캡처한다. 그래서:
 *   - 데스크탑(Chrome·Edge·Firefox): 폼이 열리면 캡처를 자동으로 시도하고, 사용자는 미리보기에서
 *     가릴 곳을 칠하거나 "캡처 빼기" 로 제외할 수 있다.
 *   - 모바일·iPad: SDK 자체가 `isScreenshotSupported()` 로 걸러 캡처 버튼을 **숨긴다**
 *     (iOS Safari 에 `getDisplayMedia` 가 없다). 이 경우 화면 정황은 Session Replay 와
 *     묶인 오류 이벤트(스택·브레드크럼)가 대신한다.
 *   - `getDisplayMedia` 는 사용자 제스처를 요구하므로 자동 클릭이 만료되면 폼 안의
 *     "화면 캡처 첨부하기" 버튼이 그대로 남아 한 번 더 누르면 된다.
 *
 * ## 집계·개인정보
 *   - 자동화(`navigator.webdriver`)·e2e UA·운영자 표식(`irang-internal`)이면 **전송하지 않고**
 *     성공 UI 만 보여 준다 (9/19 실측 격리 규칙 · 체크리스트 J).
 *   - 스크린샷은 사용자가 보낼 때만 올라간다. 페이지의 입력값은 Replay 쪽
 *     `maskAllText`·`maskAllInputs` 로 가려진다(`src/instrumentation-client.ts`).
 */

/** 폼 섀도우 호스트 id — 캡처 버튼을 자동으로 누르려면 이 id 로 shadowRoot 를 찾는다 */
const WIDGET_ID = "irang-error-feedback";

const ADD_SCREENSHOT_LABEL = "화면 캡처 첨부하기";

/**
 * 우리 실측·운영자 브라우저인가. 맞으면 Sentry 로 보내지 않는다.
 *
 * `irangGaGate`(GA)·`internalSkipReason`(DB) 과 같은 표식을 본다. 저장소별로 따로 try 하는 이유는
 * 프라이빗 모드에서 localStorage 접근이 throw 하면 쿠키 검사까지 건너뛰게 되기 때문.
 */
function isInternalOrAutomated(): boolean {
  const nav = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { webdriver?: boolean });
  if (!nav) return false;
  if (nav.webdriver === true) return true;
  if ((nav.userAgent || "").includes("irang-e2e")) return true;
  try {
    if (window.localStorage.getItem(INTERNAL_TRAFFIC_FLAG) === "1") return true;
  } catch {
    // 스토리지 차단 — 쿠키로만 판정
  }
  try {
    if (document.cookie.includes(`${INTERNAL_TRAFFIC_COOKIE}=1`)) return true;
  } catch {
    // 쿠키 차단 — webdriver·UA 로만 판정
  }
  return false;
}

/** 브랜드 팔레트로 맞춘 위젯 테마 (다크모드 미지원이라 light 고정) */
const FEEDBACK_THEME = {
  accentBackground: "#1B6B5A",
  accentForeground: "#ffffff",
  background: "#ffffff",
  foreground: "#0D2E27",
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 32px rgba(13, 46, 39, 0.16)",
  inputBorderFocus: "#1B6B5A",
  submitBackground: "#1B6B5A",
  submitBackgroundHover: "#155447",
  submitBorder: "#1B6B5A",
  submitForeground: "#ffffff",
} as const;

interface ErrorReportButtonProps {
  error: Error & { digest?: string };
  /** 오류를 Sentry 에 올렸을 때 받은 이벤트 id — 피드백을 같은 이슈에 묶는 데 쓴다 */
  eventId?: string;
  /** 어느 화면의 경계인지 (`SearchError` 등) */
  tag: string;
}

type Phase = "idle" | "opening" | "sent" | "failed";

export function ErrorReportButton({ error, eventId, tag }: ErrorReportButtonProps) {
  const { alert } = useDialog();
  const [phase, setPhase] = useState<Phase>("idle");

  /** @sentry/nextjs 를 미리 받아 둔다 — 클릭 시점에 await 가 길어지면 화면 공유 제스처가 만료된다 */
  const sentryRef = useRef<Promise<typeof import("@sentry/nextjs")> | null>(null);
  const preload = useCallback(() => {
    sentryRef.current ??= import("@sentry/nextjs");
  }, []);

  /** beforeSendFeedback 구독 해제 — 폼이 닫힌 뒤에도 남아 다른 피드백에 스탬프를 찍지 않게 */
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /** 한 번 만든 폼은 재사용한다 — 닫았다 다시 열 때 createForm 을 또 부르면 다이얼로그가 두 벌 쌓인다 */
  const formRef = useRef<Awaited<ReturnType<NonNullable<ReturnType<typeof import("@sentry/nextjs").getFeedback>>["createForm"]>> | null>(null);

  /* 오류 경계가 사라지면(재시도 성공 등) 훅 구독도 걷는다 */
  useEffect(
    () => () => {
      unsubscribeRef.current?.();
      unsubscribeRef.current = null;
    },
    [],
  );

  const openForm = useCallback(async () => {
    if (phase === "opening") return;

    // 우리 실측·운영자 브라우저 → 전송 0. 성공처럼 보이게 해 디버깅에 빠지지 않도록(9/16 패턴)
    if (isInternalOrAutomated()) {
      setPhase("sent");
      await alert({
        title: "보냈어요, 고마워요",
        description: "내부 확인용 브라우저라 실제 전송은 건너뛰었어요.",
      });
      return;
    }

    setPhase("opening");
    try {
      if (formRef.current) {
        formRef.current.open();
        autoAttachScreenshot();
        setPhase("idle");
        return;
      }

      const Sentry = await (sentryRef.current ??= import("@sentry/nextjs"));

      // 오류 정황을 피드백 이벤트에 붙인다. tags 는 200자 제한이 있어 UA·메시지는 contexts 로.
      // 구독은 마운트 동안 1회만 — 폼을 닫았다 다시 열어도 유지돼야 associated_event_id 가 안 빠진다.
      unsubscribeRef.current ??=
        Sentry.getClient()?.on("beforeSendFeedback", (event) => {
          if (eventId) event.contexts.feedback.associated_event_id = eventId;
          event.contexts.irang_error = {
            digest: error.digest ?? null,
            message: error.message,
            boundary: tag,
            url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            device_pixel_ratio: window.devicePixelRatio,
          };
        }) ?? null;

      Sentry.addIntegration(
        Sentry.feedbackIntegration({
          id: WIDGET_ID,
          autoInject: false,
          colorScheme: "light",
          themeLight: FEEDBACK_THEME,
          showBranding: false,
          showName: false,
          showEmail: true,
          isEmailRequired: false,
          isNameRequired: false,
          // 데스크탑에서만 실제로 켜진다 — SDK 가 isScreenshotSupported() 로 모바일을 걸러낸다
          enableScreenshot: true,
          tags: {
            error_boundary: tag,
            error_digest: error.digest ?? "none",
            route: window.location.pathname,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
          },
          formTitle: "관리자에게 알리기",
          messageLabel: "무엇을 하다가 이 화면을 만났나요?",
          messagePlaceholder: "예: 검색창에 ‘가평’을 넣고 엔터를 눌렀어요",
          emailLabel: "이메일 (선택)",
          emailPlaceholder: "답변을 받고 싶으면 적어 주세요",
          submitButtonLabel: "보내기",
          cancelButtonLabel: "닫기",
          confirmButtonLabel: "확인",
          addScreenshotButtonLabel: ADD_SCREENSHOT_LABEL,
          removeScreenshotButtonLabel: "캡처 빼기",
          highlightToolText: "강조",
          hideToolText: "가리기",
          removeHighlightText: "지우기",
          isRequiredLabel: "(필수)",
          successMessageText: "보냈어요, 고마워요",
          errorEmptyMessageText: "어떤 상황이었는지 한 줄만 적어 주세요",
          errorNoClientText: "지금은 보낼 수 없어요. 잠시 후 다시 시도해 주세요",
          errorTimeoutText: "전송이 오래 걸려요. 잠시 후 다시 시도해 주세요",
          errorForbiddenText: "전송이 거부됐어요. 잠시 후 다시 시도해 주세요",
          errorGenericText: "보내지 못했어요. 잠시 후 다시 시도해 주세요",
          onFormClose: () => setPhase((prev) => (prev === "sent" ? prev : "idle")),
          onSubmitSuccess: () => setPhase("sent"),
          onFormSubmitted: () => {
            void alert({
              title: "보냈어요, 고마워요",
              description: "어떤 화면에서 멈췄는지 확인하고 고칠게요.",
            });
          },
        }),
      );

      const feedback = Sentry.getFeedback();
      if (!feedback) throw new Error("feedback integration unavailable");

      const form = await feedback.createForm();
      formRef.current = form;
      form.appendToDom();
      form.open();
      autoAttachScreenshot();
      setPhase("idle");
    } catch {
      // Sentry 가 막혀도(광고 차단기·CSP) 사용자에게 오류를 또 보여 주지 않는다
      setPhase("failed");
      await alert({
        title: "지금은 알림을 보낼 수 없어요",
        description: "잠시 후 다시 시도해 주세요. 계속 안 되면 홈으로 돌아가 주세요.",
      });
    }
  }, [alert, error.digest, error.message, eventId, phase, tag]);

  if (phase === "sent") {
    return (
      <span className={s.sent} role="status">
        <Icon icon={MessageSquareWarning} size="md" />
        보냈어요
      </span>
    );
  }

  return (
    <button
      type="button"
      className={s.button}
      onClick={openForm}
      onPointerEnter={preload}
      onFocus={preload}
      disabled={phase === "opening"}
    >
      <Icon icon={MessageSquareWarning} size="md" />
      {phase === "opening" ? "여는 중" : "관리자에게 알리기"}
    </button>
  );
}

/**
 * 폼이 뜨면 캡처를 자동으로 시도한다.
 *
 * SDK 에 "캡처를 켠 채로 열기" 옵션이 없어(내부 `showScreenshotInput` 초기값 false) 섀도우 DOM 의
 * 캡처 버튼을 대신 누른다. 라벨은 우리가 정한 문구라 정확 일치로 찾는다. 모바일에서는 그 버튼이
 * 아예 없으므로 조용히 아무것도 하지 않는다.
 */
function autoAttachScreenshot(): void {
  // 캡처 API 가 아예 없는 브라우저에서는 누르지 않는다 — 폼에 영문 오류 문구만 남는다
  if (typeof navigator.mediaDevices?.getDisplayMedia !== "function") return;

  let frames = 0;
  const tick = () => {
    const root = document.getElementById(WIDGET_ID)?.shadowRoot;
    const target = root
      ? Array.from(root.querySelectorAll("button")).find(
          (b) => b.textContent?.trim() === ADD_SCREENSHOT_LABEL,
        )
      : undefined;
    if (target) {
      target.click();
      return;
    }
    if (++frames < 20) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
