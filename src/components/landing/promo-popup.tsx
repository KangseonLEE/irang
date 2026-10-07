"use client";

/**
 * 랜딩 홍보 팝업 (2026-09-29 회장 지시 — 경기도 귀농귀촌지원센터 홍보 요청).
 *
 * - 공용 `Modal` 위에 얹는다(포털·Esc·포커스 트랩·스크롤 잠금 공유). 페이지별 모달 재구현 금지 규칙.
 * - 서버·첫 렌더는 닫힘. 마운트 뒤 저장소를 보고 잠깐(700ms) 뒤에 연다 — 히어로가 먼저 그려지고
 *   레이아웃 이동 0, SSR HTML 에 모달 마크업이 섞이지 않는다.
 * - 헤더 "오늘 하루 보지 않기" = localStorage 에 KST 날짜 저장(같은 날이면 숨김) — **닫기를 기억하는 건 이것뿐**.
 *   X·Esc 로 닫은 건 기억하지 않는다(새로고침하면 다시 뜬다). 바깥(오버레이) 클릭으로는 닫히지 않는다 —
 *   포스터를 보려다 옆을 눌러 사라지면 다시 열 방법이 없다 (2026-09-29 회장).
 * - 자동화(webdriver)·e2e UA 에서는 열지 않는다 — E2E 가 히어로를 클릭하는데 팝업이 덮으면 깨진다.
 *   실측이 필요하면 `localStorage["irang:promo:force"]="1"`.
 * - 노출 대상은 서버(`loadActivePromos`)가 정해 `items` 로 내려준다 — 기간·활성 판정은 데이터 단 몫이고
 *   컴포넌트는 받은 것만 그린다(빈 배열이면 null). 관리자 `/admin/promos` 에서 내용·기간을 고친다.
 * - `preview` — 관리자 미리보기. 자동화 게이트·저장소·계측을 전부 건너뛰고 바로 연다.
 * - 여러 건이 활성이면 나열하지 않고 팝업 안에서 한 건씩 넘긴다(‹ n/N ›). 저장소 키는 건별.
 * - "홍보 요청하기" — 당분간 무료 채널. 공용 RequestModal(정보 요청 폼)로 넘긴다.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ExternalLink, AlertTriangle, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { trackEvent } from "@/lib/analytics";
import type { PromoPopupItem } from "@/lib/data/promo-popup";
import { RequestModal } from "@/components/feedback/request-modal";
import s from "./promo-popup.module.css";

const OPEN_DELAY_MS = 700;

function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function storageKey(id: string) {
  return `irang:promo:${id}`;
}

/**
 * 업로드한 포스터는 Supabase Storage 절대 URL 로 온다. 그 호스트는 `next.config.ts`
 * `images.remotePatterns` 에 없어서 최적화 경로가 400 을 돌려주고 컴포넌트가 던진다
 * (9/29 실측: `/_next/image?url=…supabase.co…` → 400 "url parameter is not allowed").
 * 원격 포스터는 최적화를 건너뛰고 그대로 그린다 — public/ 안에 둔 포스터는 종전대로 최적화된다.
 */
function isRemoteSrc(src: string): boolean {
  return /^https?:\/\//.test(src);
}

function isAutomation(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.webdriver === true || navigator.userAgent.includes("irang-e2e");
}

interface PromoPopupProps {
  /** 서버가 고른 노출 대상. 빈 배열이면 아무것도 그리지 않는다 */
  items: PromoPopupItem[];
  /** 관리자 미리보기 — 바로 열고, 저장소·계측·자동화 게이트를 건너뛴다 */
  preview?: boolean;
  /** 미리보기에서 닫혔을 때(관리자 화면이 상태를 되돌릴 수 있게) */
  onClose?: () => void;
}

export function PromoPopup({ items, preview = false, onClose }: PromoPopupProps) {
  // 미리보기는 관리자가 버튼을 누른 순간 새로 마운트되므로 처음부터 열린 상태로 시작한다
  const [open, setOpen] = useState(preview);
  const [idx, setIdx] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);
  /** 팝업이 열리기 전 포커스 — 요청 모달을 닫은 뒤 돌아갈 자리(10/6 QA) */
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const item = items[idx] ?? null;

  useEffect(() => {
    if (!items.length || preview) return;
    let force = false;
    let firstVisible = -1;
    try {
      force = window.localStorage.getItem("irang:promo:force") === "1";
      firstVisible = items.findIndex((it) => window.localStorage.getItem(storageKey(it.id)) !== kstToday());
    } catch {
      firstVisible = 0; // 저장소 차단 — 못 본 것으로 간주
    }
    // force 는 자동화 게이트만 우회한다 — 사용자의 "오늘 하루 보지 않기"·닫기는 항상 존중
    if (isAutomation() && !force) return;
    if (firstVisible < 0) return;
    const t = window.setTimeout(() => {
      const active = document.activeElement;
      returnFocusRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
      setIdx(firstVisible);
      setOpen(true);
      trackEvent({ action: "promo_popup_view", category: "landing", label: items[firstVisible].id });
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [items, preview]);

  if (!item) return null;

  /** 미리보기에서는 계측하지 않는다 — 관리자 확인이 랜딩 지표에 섞이면 안 된다 */
  const track = (action: string, label: string) => {
    if (preview) return;
    trackEvent({ action, category: "landing", label });
  };

  const close = (reason: "close" | "today") => {
    if (preview) {
      setOpen(false);
      onClose?.();
      return;
    }
    if (reason === "today") {
      try {
        window.localStorage.setItem(storageKey(item.id), kstToday());
      } catch {
        // 저장 실패해도 이번 렌더에서는 닫힌다
      }
    }
    setOpen(false);
    track("promo_popup_dismiss", `${item.id}:${reason}`);
  };

  const onLink = (kind: "detail" | "tel") => {
    track("promo_popup_click", `${item.id}:${kind}`);
  };

  const step = (d: 1 | -1) => {
    const next = (idx + d + items.length) % items.length;
    setIdx(next);
    track("promo_popup_view", items[next].id);
  };

  const openRequest = () => {
    setOpen(false);
    setRequestOpen(true);
    track("promo_popup_click", `${item.id}:request`);
  };

  /**
   * 요청 모달을 닫으면 공용 Modal 은 열기 직전 포커스로 돌려보내는데, 그건 이미 닫혀 사라진 팝업 안 "홍보 요청하기"라
   * 포커스가 BODY 로 떨어졌다(10/6 QA — 다음 Tab 이 문서 끝 포털 자리에서 이어진다). 팝업이 열리기 전 포커스가 있었으면 그리로,
   * 없으면(팝업은 저절로 뜬다) 본문 첫 제목으로 옮긴다 — 맨 위로 버튼과 같은 방식(tabindex -1, 스크롤 없이).
   * Modal 이 닫히며 포커스를 되돌리는 정리(effect cleanup)가 끝난 다음 프레임에 옮긴다.
   */
  const closeRequest = () => {
    setRequestOpen(false);
    requestAnimationFrame(() => {
      const back = returnFocusRef.current;
      if (back && back.isConnected) {
        back.focus({ preventScroll: true });
        return;
      }
      const heading = document.querySelector<HTMLElement>("main h1");
      if (!heading) return;
      if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    });
  };

  return (
    <>
    <Modal
      open={open}
      onClose={() => close("close")}
      title="이랑 소식"
      titleIcon={<Megaphone size={20} />}
      size="medium"
      closeOnOverlayClick={false}
      headerAction={
        <button type="button" className={s.todayBtn} onClick={() => close("today")}>
          오늘 하루 보지 않기
        </button>
      }
    >
      <div className={s.layout} data-promo-popup={item.id}>
        <div className={s.poster}>
          <Image
            src={item.image}
            alt={item.alt}
            width={item.imageWidth}
            height={item.imageHeight}
            sizes="(min-width: 640px) 360px, 86vw"
            className={s.posterImage}
            priority={false}
            unoptimized={isRemoteSrc(item.image)}
          />
        </div>
        <div className={s.body}>
          <div className={s.badges}>
            <span className={s.badgeOrg}>{item.org}</span>
            {items.length > 1 && (
              <span className={s.pager}>
                <button type="button" className={s.pagerBtn} onClick={() => step(-1)} aria-label="이전 소식">
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <span className={s.pagerCount}>
                  {idx + 1} / {items.length}
                </span>
                <button type="button" className={s.pagerBtn} onClick={() => step(1)} aria-label="다음 소식">
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </span>
            )}
          </div>
          <div className={s.titleRow}>
            <h3 className={s.title}>{item.title}</h3>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={s.detailBtn}
              onClick={() => onLink("detail")}
              data-track={`promo:${item.id}:detail`}
            >
              프로그램 상세 보기
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
          <p className={s.tagline}>{item.tagline}</p>
          {item.recruitClosed && (
            <p className={s.alert} role="note">
              <AlertTriangle size={16} aria-hidden="true" />
              <span>{item.note}</span>
            </p>
          )}
          <dl className={s.facts}>
            {item.facts.map((f, i) => (
              <div key={`${f.label}-${i}`} className={s.fact}>
                <dt>{f.label}</dt>
                <dd>
                  {f.href ? (
                    <a href={f.href} className={s.factLink} onClick={() => onLink("tel")}>
                      {f.value}
                    </a>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <div className={s.requestRow}>
            <span className={s.requestHint}>알리고 싶은 프로그램이 있나요? 당분간 무료예요.</span>
            <button type="button" className={s.requestBtn} onClick={openRequest} data-track={`promo:${item.id}:request`}>
              <Megaphone size={14} aria-hidden="true" />
              홍보 요청하기
            </button>
          </div>
        </div>
      </div>
    </Modal>
    <RequestModal
      open={requestOpen}
      onClose={closeRequest}
      keyword="홍보 요청"
      category="홍보"
      pageName="landing_promo_popup"
    />
    </>
  );
}
