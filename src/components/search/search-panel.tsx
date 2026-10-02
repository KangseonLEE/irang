"use client";

import { useEffect, useRef, type RefObject } from "react";
import SearchBar from "./search-bar";
import { isComposingEvent } from "@/lib/ime";
import s from "./search-panel.module.css";

/**
 * 헤더 검색 패널 (2026-10-02 회장 결재 — 우리금융 기후금융포털식).
 *
 * 헤더 바로 아래에서 흰 패널이 위→아래로 0.3s 내려온다. 본문은 그대로 보이므로(딤 없음)
 * **비모달 다이얼로그**(`role="dialog"` + `aria-modal="false"`)로 둔다 — 포커스를 가두지 않고,
 * 패널 바깥으로 포커스·클릭이 나가면 닫힌다.
 *
 * - 768+: 콘텐츠 높이(뷰포트 넘으면 패널 안 스크롤). 페이지 스크롤은 잠그지 않는다(레퍼런스와 동일 —
 *   패널은 sticky 헤더에 붙어 있어 본문이 움직여도 같은 자리).
 * - <768: 헤더 아래 화면 전체. 본문이 안 보이므로 html 스크롤을 잠그고, 가상 키보드가 뜨면
 *   visualViewport 높이로 패널을 줄여 아래 목록도 키보드 위로 스크롤해 볼 수 있게 한다.
 *
 * 열림 상태·트리거·계측은 헤더가 갖는다. 이 컴포넌트는 표시·닫힘 경로(Esc·바깥 클릭·포커스 이탈)만.
 */
export function SearchPanel({
  id,
  open,
  sessionKey,
  boundaryRef,
  onClose,
}: {
  id: string;
  open: boolean;
  /** 열 때마다 1씩 오른다 — SearchBar 를 새로 마운트해 검색어를 비우고 입력에 포커스 (0 = 아직 안 열림) */
  sessionKey: number;
  /** 이 요소 안의 클릭·포커스는 "바깥"이 아니다 (헤더 — ✕ 버튼·GNB 포함) */
  boundaryRef: RefObject<HTMLElement | null>;
  /** restoreFocus: 사용자가 닫았을 때(Esc·✕)만 true — 페이지 이동으로 닫힐 땐 포커스를 끌어오지 않는다 */
  onClose: (restoreFocus: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc — 패널 안 어디에 포커스가 있어도 닫고 트리거로 포커스를 돌려준다
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || isComposingEvent(e)) return;
      // 확인 다이얼로그(최근 검색어 삭제)는 자기 Esc 로만 닫힌다
      if ((e.target as Element | null)?.closest?.("[data-irang-dialog]")) return;
      if (document.querySelector("[data-irang-dialog]")) return;
      onClose(true);
    };
    /* 캡처 단계 — 입력창의 Esc 는 SearchBar(React 버블 핸들러)가 onClose(false) 로 먼저 닫으면
       리렌더로 이 리스너가 같은 디스패치 중에 해제돼 포커스 복귀가 빠진다(실측). 먼저 받아 복귀까지 건다 */
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  // 바깥 클릭 — 헤더(패널 포함) 밖이면 닫는다. 확인 다이얼로그(포털)는 바깥이 아니다
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.("[data-irang-dialog]")) return;
      const boundary = boundaryRef.current;
      if (boundary && target instanceof Node && boundary.contains(target)) return;
      onClose(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, onClose, boundaryRef]);

  // 포커스 이탈 — Tab 으로 헤더 밖(본문)으로 나가면 닫는다. 비모달이라 가두지 않는 대신 정리한다
  useEffect(() => {
    if (!open) return;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null;
      if (!target || target === document.body) return;
      if (target.closest?.("[data-irang-dialog]")) return;
      const boundary = boundaryRef.current;
      if (boundary && boundary.contains(target)) return;
      onClose(false);
    };
    document.addEventListener("focusin", onFocusIn);
    return () => document.removeEventListener("focusin", onFocusIn);
  }, [open, onClose, boundaryRef]);

  // 모바일(<768) — 화면 전체 패널: html 스크롤 잠금 + 가상 키보드 높이 추종
  useEffect(() => {
    if (!open) return;
    const mql = window.matchMedia("(max-width: 767px)");
    if (!mql.matches) return;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const vv = window.visualViewport;
    const panel = panelRef.current;
    const sync = () => {
      if (!panel || !vv) return;
      panel.style.setProperty("--search-panel-vvh", `${Math.round(vv.height)}px`);
    };
    sync();
    vv?.addEventListener("resize", sync);
    return () => {
      html.style.overflow = prevOverflow;
      vv?.removeEventListener("resize", sync);
      panel?.style.removeProperty("--search-panel-vvh");
    };
  }, [open]);

  return (
    <div className={s.clip}>
      <div
        ref={panelRef}
        id={id}
        className={`${s.panel}${open ? ` ${s.panelOpen}` : ""}`}
        role="dialog"
        aria-modal="false"
        aria-label="통합검색"
        /* 닫힌 동안(슬라이드업 포함) 포커스·클릭·보조기기에서 빠진다 */
        inert={!open}
      >
        <div className={s.inner}>
          {sessionKey > 0 && (
            <SearchBar
              key={sessionKey}
              size="large"
              placeholder="궁금한 농촌 정착 정보를 검색해보세요"
              mobilePlaceholder="지역, 작물, 교육, 비용 검색"
              panelLayout
              autoFocus
              onClose={() => onClose(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
