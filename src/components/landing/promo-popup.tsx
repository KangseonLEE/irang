"use client";

/**
 * 랜딩 홍보 팝업 (2026-09-29 회장 지시 — 경기도 귀농귀촌지원센터 홍보 요청).
 *
 * - 공용 `Modal` 위에 얹는다(포털·Esc·포커스 트랩·스크롤 잠금 공유). 페이지별 모달 재구현 금지 규칙.
 * - 서버·첫 렌더는 닫힘. 마운트 뒤 저장소를 보고 잠깐(700ms) 뒤에 연다 — 히어로가 먼저 그려지고
 *   레이아웃 이동 0, SSR HTML 에 모달 마크업이 섞이지 않는다.
 * - 헤더 "오늘 하루 보지 않기" = localStorage 에 KST 날짜 저장(같은 날이면 숨김). X/Esc 는 기억하지 않는다 —
 *   새로고침하면 다시 뜬다(회장 9/29). 바깥 클릭으로는 닫히지 않는다(closeOnOverlayClick=false).
 * - 자동화(webdriver)·e2e UA 에서는 열지 않는다 — E2E 가 히어로를 클릭하는데 팝업이 덮으면 깨진다.
 *   실측이 필요하면 `localStorage["irang:promo:force"]="1"`.
 * - `until` 이 지나면 데이터 단에서 비활성(`getActivePromos`) → 컴포넌트가 null.
 * - 여러 건이 활성이면 나열하지 않고 팝업 안에서 한 건씩 넘긴다(‹ n/N ›). 저장소 키는 건별.
 * - "홍보 요청하기" — 당분간 무료 채널. 공용 RequestModal(정보 요청 폼)로 넘긴다.
 */

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, AlertTriangle, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { trackEvent } from "@/lib/analytics";
import { getActivePromos } from "@/lib/data/promo-popup";
import { RequestModal } from "@/components/feedback/request-modal";
import s from "./promo-popup.module.css";

const OPEN_DELAY_MS = 700;

function kstToday(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function storageKey(id: string) {
  return `irang:promo:${id}`;
}

function isAutomation(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.webdriver === true || navigator.userAgent.includes("irang-e2e");
}

export function PromoPopup() {
  const items = useMemo(() => getActivePromos(), []);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [requestOpen, setRequestOpen] = useState(false);
  const item = items[idx] ?? null;

  useEffect(() => {
    if (!items.length) return;
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
      setIdx(firstVisible);
      setOpen(true);
      trackEvent({ action: "promo_popup_view", category: "landing", label: items[firstVisible].id });
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [items]);

  if (!item) return null;

  const close = (reason: "close" | "today") => {
    try {
      if (reason === "today") window.localStorage.setItem(storageKey(item.id), kstToday());
    } catch {
      // 저장 실패해도 이번 렌더에서는 닫힌다
    }
    setOpen(false);
    trackEvent({ action: "promo_popup_dismiss", category: "landing", label: `${item.id}:${reason}` });
  };

  const onLink = (kind: "detail" | "tel") => {
    trackEvent({ action: "promo_popup_click", category: "landing", label: `${item.id}:${kind}` });
  };

  const step = (d: 1 | -1) => {
    const next = (idx + d + items.length) % items.length;
    setIdx(next);
    trackEvent({ action: "promo_popup_view", category: "landing", label: items[next].id });
  };

  const openRequest = () => {
    setOpen(false);
    setRequestOpen(true);
    trackEvent({ action: "promo_popup_click", category: "landing", label: `${item.id}:request` });
  };

  return (
    <>
    <Modal
      open={open}
      onClose={() => close("close")}
      title="이랑 소식"
      titleIcon={<Megaphone size={20} />}
      align="topRight"
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
            {item.facts.map((f) => (
              <div key={f.label} className={s.fact}>
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
      onClose={() => setRequestOpen(false)}
      keyword="홍보 요청"
      category="홍보"
      pageName="landing_promo_popup"
    />
    </>
  );
}
