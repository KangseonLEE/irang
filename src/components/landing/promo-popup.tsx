"use client";

/**
 * 랜딩 홍보 팝업 (2026-09-29 회장 지시 — 경기도 귀농귀촌지원센터 홍보 요청).
 *
 * - 공용 `Modal` 위에 얹는다(포털·Esc·포커스 트랩·스크롤 잠금 공유). 페이지별 모달 재구현 금지 규칙.
 * - 서버·첫 렌더는 닫힘. 마운트 뒤 저장소를 보고 잠깐(700ms) 뒤에 연다 — 히어로가 먼저 그려지고
 *   레이아웃 이동 0, SSR HTML 에 모달 마크업이 섞이지 않는다.
 * - "오늘 하루 보지 않기" = localStorage 에 KST 날짜 저장(같은 날이면 숨김). X/Esc = 이번 방문(sessionStorage)만.
 * - 자동화(webdriver)·e2e UA 에서는 열지 않는다 — E2E 가 히어로를 클릭하는데 팝업이 덮으면 깨진다.
 *   실측이 필요하면 `localStorage["irang:promo:force"]="1"`.
 * - `until` 이 지나면 데이터 단에서 비활성(`isPromoActive`) → 컴포넌트가 null.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { ExternalLink, Phone } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { trackEvent } from "@/lib/analytics";
import { PROMO_POPUP, isPromoActive } from "@/lib/data/promo-popup";
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
  const item = PROMO_POPUP;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isPromoActive(item)) return;
    let force = false;
    let hiddenToday = false;
    let closedThisVisit = false;
    try {
      force = window.localStorage.getItem("irang:promo:force") === "1";
      hiddenToday = window.localStorage.getItem(storageKey(item.id)) === kstToday();
      closedThisVisit = window.sessionStorage.getItem(storageKey(item.id)) === "closed";
    } catch {
      // 저장소 차단 — 못 본 것으로 간주
    }
    // force 는 자동화 게이트만 우회한다 — 사용자의 "오늘 하루 보지 않기"·닫기는 항상 존중
    if (isAutomation() && !force) return;
    if (hiddenToday || closedThisVisit) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      trackEvent({ action: "promo_popup_view", category: "landing", label: item.id });
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [item]);

  if (!isPromoActive(item)) return null;

  const close = (reason: "close" | "today") => {
    try {
      if (reason === "today") window.localStorage.setItem(storageKey(item.id), kstToday());
      window.sessionStorage.setItem(storageKey(item.id), "closed");
    } catch {
      // 저장 실패해도 이번 렌더에서는 닫힌다
    }
    setOpen(false);
    trackEvent({ action: "promo_popup_dismiss", category: "landing", label: `${item.id}:${reason}` });
  };

  const onLink = (kind: "site" | "tel") => {
    trackEvent({ action: "promo_popup_click", category: "landing", label: `${item.id}:${kind}` });
  };

  return (
    <Modal open={open} onClose={() => close("close")} title={`${item.org} 소식`}>
      <div className={s.layout} data-promo-popup={item.id}>
        <div className={s.poster}>
          <Image
            src={item.image}
            alt={item.alt}
            width={item.imageWidth}
            height={item.imageHeight}
            sizes="(min-width: 640px) 260px, 80vw"
            className={s.posterImage}
            priority={false}
          />
        </div>
        <div className={s.body}>
          <div className={s.badges}>
            <span className={s.badgeOrg}>홍보 요청</span>
            {item.recruitClosed && <span className={s.badgeClosed}>모집 마감</span>}
          </div>
          <h3 className={s.title}>{item.title}</h3>
          <p className={s.tagline}>{item.tagline}</p>
          <dl className={s.facts}>
            {item.facts.map((f) => (
              <div key={f.label} className={s.fact}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <p className={s.note}>{item.note}</p>
          <div className={s.actions}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={s.primary}
              onClick={() => onLink("site")}
              data-track={`promo:${item.id}:site`}
            >
              센터 안내 보기
              <ExternalLink size={16} aria-hidden="true" />
            </a>
            <a href={item.phone.tel} className={s.secondary} onClick={() => onLink("tel")}>
              <Phone size={16} aria-hidden="true" />
              {item.phone.display}
            </a>
          </div>
          <div className={s.footer}>
            <button type="button" className={s.textBtn} onClick={() => close("today")}>
              오늘 하루 보지 않기
            </button>
            <button type="button" className={s.textBtn} onClick={() => close("close")}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
