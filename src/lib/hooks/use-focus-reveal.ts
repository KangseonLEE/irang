"use client";

import { useEffect } from "react";

/**
 * 키보드 포커스 노출 보장 — 전역 한 곳(레이아웃)에서 건다 (2026-10-06 QA Q3-🟡5·🟡12).
 *
 * 두 가지를 고친다.
 * 1. **일부만 보이는 요소** — Chromium 은 포커스한 요소가 32px 이상 보이면 "보인다"고 보고 스크롤하지 않는다
 *    (WebKit 이래 MIN_INTERSECT_FOR_REVEAL). 가로 캐러셀의 둘째 카드(24%)·섹션 탭(32~59%)·관련 작물(10~13%)이
 *    잘린 채 포커스를 받았다. → 포커스가 앉은 뒤 그 요소를 품은 **사용자가 스크롤할 수 있는** 상자(overflow auto·scroll)를
 *    최소한만 움직여 다 보이게 한다. 스냅 상자면 스냅 정렬(start·center·end)대로 맞춰 스냅이 되돌리지 않게 한다.
 *    overflow hidden·clip 상자는 건드리지 않는다(사용자가 되돌릴 방법이 없다).
 * 2. **고정 띠에 가린 요소** — 위(헤더·섹션 탭·고정 탭바)·아래(모바일 탭바·하단 고정 바·랜딩 도크)에 떠 있는 띠를
 *    실제 화면에서 찾아(elementFromPoint) 그 사이 띠 안으로 문서를 민다. 역방향 Tab 은 위로 스크롤하는 순간 숨어 있던
 *    헤더가 다시 내려오므로, 위로 미는 보정이면 헤더 높이를 미리 더한다.
 *
 * scroll-padding-top 은 쓰지 않는다(10/6 실측). 상시로 두면 scrollIntoView(start)·#해시 착지가 전부 내려앉고 AnchorTabNav 활성
 * 판정이 밀리며, Tab 순간에만 줘도 **붙어 있는(stuck) sticky 띠 안 요소로 Tab 할 때 문서가 320~460px 튀었다**(작물 상세 섹션 탭·
 * /costs 유형 탭 — 크롬이 띠를 "여백에 가렸다"고 보고 원래 자리로 스크롤). 그래서 브라우저 포커스 스크롤은 그대로 두고 두 프레임 뒤 보정한다.
 *
 * 다른 컴포넌트와 싸우지 않는 규칙
 * - 키보드로 온 포커스(`:focus-visible` + 마지막 입력이 키보드)만. 마우스·터치 포커스, 터치 입력창(KeyboardFocusGuard 몫)은 그대로.
 * - 포커스 직후 두 프레임 사이에 스크롤이 움직이고 있으면(캐러셀 goTo·탭 전환 smooth 스크롤) 그 컴포넌트가 하는 중이다 —
 *   손대지 않고 끝난 뒤(약 420ms, 헤더 전환 0.35s 이후) 다시 잰다. 그때도 다 보이면 아무것도 안 한다.
 * - 완전히 화면 밖인 요소는 건드리지 않는다 — `focus({ preventScroll: true })` 로 일부러 스크롤을 막은 경우다.
 * - fixed 상자(모달·하단 바) 안 요소는 그 상자 안 스크롤만, sticky·fixed 안 요소는 문서를 밀지 않는다.
 * - 떠 있는 버튼(피드백·맨 위로)은 가리면 스스로 비켜나므로(useFocusDodge) 띠로 세지 않는다 — `data-focus-reveal-ignore`.
 * - 보정은 즉시(instant) — 브라우저 자체 포커스 스크롤도 즉시라, 두 프레임 뒤 이어지는 보정이 한 번의 이동처럼 보인다.
 *   부드럽게 끌면 포커스 직후 수백 ms 동안 가린 채로 남고, 모션 감소 설정도 따로 챙길 필요가 없다.
 */

const NAV_KEYS = new Set(["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);
/** 띠와 요소 사이 여유 */
const GAP = 8;
/** 이보다 작은 차이는 반올림 오차 — 움직이지 않는다 */
const EPS = 1;
/** 컴포넌트 smooth 스크롤·헤더 등장(0.35s)이 끝난 뒤 다시 잴 때 */
const LATE_MS = 420;

/**
 * 한 축에서 보이게 하는 최소 이동량(양수 = 앞으로 스크롤).
 * align 이 start·center·end 면 그 정렬(스냅 위치)로, nearest 면 가까운 가장자리로. 이미 다 보이면 0.
 * 칸보다 큰 요소는 시작 가장자리가 칸 안에 있으면 그대로(이미 첫머리부터 읽힌다), 아니면 시작을 맞춘다.
 */
export function axisDelta(
  start: number,
  end: number,
  viewStart: number,
  viewEnd: number,
  align: "start" | "center" | "end" | "nearest" = "nearest",
): number {
  if (start >= viewStart - EPS && end <= viewEnd + EPS) return 0;
  if (align === "start") return start - viewStart;
  if (align === "end") return end - viewEnd;
  if (align === "center") return (start + end) / 2 - (viewStart + viewEnd) / 2;
  if (end - start > viewEnd - viewStart) {
    return start >= viewStart - EPS && start < viewEnd ? 0 : start - viewStart;
  }
  return start < viewStart ? start - viewStart : end - viewEnd;
}

/**
 * 문서를 위아래로 미는 양 — 띠(위 bandTop · 아래 bandBottom) 사이에 요소가 다 들어오게.
 * 위로 미는데(음수) 헤더가 숨어 있으면 위로 스크롤하는 순간 헤더(+모바일 섹션 탭)가 내려오므로 `revealExtra` 만큼 더 민다.
 */
export function documentDelta(
  rect: { top: number; bottom: number },
  bandTop: number,
  bandBottom: number,
  revealExtra = 0,
): number {
  const delta = axisDelta(rect.top, rect.bottom, bandTop, bandBottom);
  // 헤더는 위로 10px 넘게 스크롤하면 돌아온다(header.tsx THRESHOLD)
  if (delta < -10 && revealExtra > 0) return axisDelta(rect.top, rect.bottom, bandTop + revealExtra, bandBottom);
  return delta;
}

function isFocusVisible(el: Element): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

function isScrollable(el: Element, axis: "x" | "y"): boolean {
  const cs = getComputedStyle(el);
  const ov = axis === "x" ? cs.overflowX : cs.overflowY;
  if (ov !== "auto" && ov !== "scroll") return false;
  return axis === "x" ? el.scrollWidth > el.clientWidth + 1 : el.scrollHeight > el.clientHeight + 1;
}

/** 요소에서 문서까지의 조상 — fixed/sticky 를 만나면 표시 */
function ancestry(el: Element) {
  const containers: HTMLElement[] = [];
  let positioned = false; // fixed·sticky 안인가 → 문서는 밀지 않는다
  let fixed = false; // fixed 안인가 → 그 위 상자도 건드리지 않는다
  for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    const pos = getComputedStyle(n).position;
    if (pos === "fixed" || pos === "sticky") positioned = true;
    if (!fixed && (isScrollable(n, "x") || isScrollable(n, "y"))) containers.push(n);
    if (pos === "fixed") fixed = true;
  }
  return { containers, positioned };
}

/** 컨테이너 안에서 정렬 기준이 될 상자 — 스냅 영역(scroll-snap-align)이 있으면 그 상자, 없으면 요소 자신 */
function snapTarget(el: Element, container: Element): { node: Element; inline: string; block: string } {
  for (let n: Element | null = el; n && n !== container; n = n.parentElement) {
    const align = getComputedStyle(n).scrollSnapAlign;
    if (align && align !== "none") {
      const [block, inline = block] = align.split(/\s+/);
      return { node: n, inline, block };
    }
  }
  return { node: el, inline: "none", block: "none" };
}

function toAlign(v: string): "start" | "center" | "end" | "nearest" {
  return v === "start" || v === "center" || v === "end" ? v : "nearest";
}

function scrollPositions(el: Element): number[] {
  const out = [window.scrollX, window.scrollY];
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    out.push(n.scrollLeft, n.scrollTop);
  }
  return out;
}

function isVisibleBox(r: DOMRect): boolean {
  return r.width >= 2 && r.height >= 2;
}

/**
 * (x, y) 에 맨 위로 그려진 고정 띠(fixed·sticky 조상)의 상자. 띠가 아니거나, el 을 품은 띠·스스로 비켜나는 버튼이면 null.
 * el 이 null 이면(키를 누르는 순간의 예측) 품고 있는지 따지지 않는다.
 */
function overlayAt(x: number, y: number, el: Element | null): DOMRect | null {
  const hit = document.elementFromPoint(x, y);
  if (!hit || (el && (hit === el || el.contains(hit)))) return null;
  for (let n: Element | null = hit; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    if (n.closest("[data-focus-reveal-ignore]")) return null;
    const pos = getComputedStyle(n).position;
    if (pos === "fixed" || pos === "sticky") {
      if (el && n.contains(el)) return null;
      const r = n.getBoundingClientRect();
      return isVisibleBox(r) ? r : null;
    }
  }
  return null;
}

/** 화면 위·아래 가장자리에 붙어 떠 있는 띠(fixed·sticky)의 안쪽 경계 — el 의 가로 구간에서 잰다 */
function overlayBand(el: Element, rect: DOMRect): { top: number; bottom: number } {
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const xs = [rect.left + 4, (rect.left + rect.right) / 2, rect.right - 4]
    .map((x) => Math.min(Math.max(x, 1), vw - 2))
    .filter((x, i, arr) => arr.indexOf(x) === i);

  let top = 0;
  for (const x of xs) {
    let y = 1;
    for (let i = 0; i < 4 && y < vh / 2; i++) {
      const r = overlayAt(x, y, el);
      if (!r || r.bottom <= y) break;
      top = Math.max(top, r.bottom);
      y = r.bottom + 1;
    }
  }
  let bottom = vh;
  for (const x of xs) {
    let y = vh - 2;
    for (let i = 0; i < 4 && y > vh / 2; i++) {
      const r = overlayAt(x, y, el);
      if (!r || r.top >= y) break;
      bottom = Math.min(bottom, r.top);
      y = r.top - 1;
    }
  }
  return { top, bottom };
}

/**
 * 헤더가 자리를 잡았을 때의 아래 경계 — 역방향 Tab 의 브라우저 스크롤(위로)이 헤더를 다시 부르면 헤더는 0.35s 동안 내려오는 중이라
 * 지금 화면에서 재면 덜 가린 것으로 나온다. 숨김 표시가 없으면 다 내려온 자리(0 ~ 높이)로 본다.
 */
function headerFinalBottom(): number {
  const header = document.querySelector<HTMLElement>("header");
  if (!header || document.documentElement.hasAttribute("data-header-hidden")) return 0;
  return header.offsetHeight;
}

/** CSS 변수 길이("3.5rem"·"44px") → px. 사용자 정의 속성은 계산값이 아니라 적은 그대로 온다 */
function cssLengthPx(value: string, fallback: number): number {
  const v = value.trim();
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return fallback;
  if (v.endsWith("rem")) return n * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
  return n;
}

/** 위로 스크롤하면 다시 나타날 헤더(+모바일에서 함께 움직이는 섹션 탭) 높이 — 지금 숨어 있을 때만 */
function headerRevealExtra(): number {
  const root = document.documentElement;
  if (!root.hasAttribute("data-header-hidden")) return 0;
  const header = document.querySelector<HTMLElement>("header");
  const headerH = header?.offsetHeight ?? 0;
  const mobile = !window.matchMedia("(min-width: 768px)").matches;
  // 모바일 섹션 탭(SectionNav)은 헤더와 한 덩어리로 숨고 나타난다 — section-layout 이 --kbd-pad-extra 로 높이를 알린다
  const extra = mobile ? cssLengthPx(getComputedStyle(root).getPropertyValue("--kbd-pad-extra"), 0) : 0;
  return headerH + extra;
}

/** 보정 한 번 — 안쪽 스크롤 상자 → 문서 순서. 움직였으면 true */
function reveal(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (!isVisibleBox(rect)) return false;
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  // 완전히 화면 밖 — preventScroll 로 일부러 둔 포커스다(맨 위로 버튼의 제목 포커스 등)
  if (rect.bottom <= 0 || rect.top >= vh || rect.right <= 0 || rect.left >= vw) return false;

  const { containers, positioned } = ancestry(el);
  let moved = false;
  // 안쪽 상자를 움직인 만큼 바깥 계산에서 요소 위치를 옮겨 본다(rect 를 다시 재지 않아도 되게)
  let shiftX = 0;
  let shiftY = 0;

  for (const box of containers) {
    const { node, inline, block } = snapTarget(el, box);
    const t = node.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const cs = getComputedStyle(box);
    const padL = parseFloat(cs.scrollPaddingLeft) || 0;
    const padR = parseFloat(cs.scrollPaddingRight) || 0;
    const padT = parseFloat(cs.scrollPaddingTop) || 0;
    const padB = parseFloat(cs.scrollPaddingBottom) || 0;
    const viewL = b.left + box.clientLeft + padL;
    const viewR = b.left + box.clientLeft + box.clientWidth - padR;
    const viewT = b.top + box.clientTop + padT;
    const viewB = b.top + box.clientTop + box.clientHeight - padB;
    const left = t.left - shiftX;
    const right = t.right - shiftX;
    const top = t.top - shiftY;
    const bottom = t.bottom - shiftY;
    // 상자 안에서 아예 안 보이면(0%) 건드리지 않는다 — 브라우저·컴포넌트가 일부러 그렇게 둔 것
    if (right <= viewL || left >= viewR || bottom <= viewT || top >= viewB) continue;
    const dx = isScrollable(box, "x") ? axisDelta(left, right, viewL, viewR, toAlign(inline)) : 0;
    const dy = isScrollable(box, "y") ? axisDelta(top, bottom, viewT, viewB, toAlign(block)) : 0;
    if (Math.abs(dx) >= EPS || Math.abs(dy) >= EPS) {
      box.scrollBy({ left: dx, top: dy, behavior: "instant" });
      shiftX += dx;
      shiftY += dy;
      moved = true;
    }
  }

  if (positioned) return moved;

  const band = overlayBand(el, rect);
  // 내려오는 중인 헤더는 다 내려온 자리로 — 헤더 아래 sticky 띠(작물 상세 머리 등)는 늦은 측정(420ms)이 마저 잡는다
  const bandTop = Math.max(band.top, headerFinalBottom());
  const top = rect.top - shiftY;
  const bottom = rect.bottom - shiftY;
  const delta = documentDelta({ top, bottom }, bandTop + GAP, band.bottom - GAP, headerRevealExtra());
  if (Math.abs(delta) >= 2) {
    window.scrollBy({ top: delta, behavior: "instant" });
    moved = true;
  }
  return moved;
}

/** 전역 키보드 포커스 노출 — 레이아웃의 FocusRevealGuard 가 한 번 부른다 */
export function useFocusReveal(): void {
  useEffect(() => {
    const root = document.documentElement;
    let keyboard = false;
    let lateTimer = 0;
    let raf1 = 0;
    let raf2 = 0;

    const cancel = () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.clearTimeout(lateTimer);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!NAV_KEYS.has(e.key)) {
        // 다른 키(스페이스·PageDown 등 직접 스크롤)는 진행 중인 보정을 거둔다
        cancel();
        return;
      }
      keyboard = true;
    };

    const onPointer = () => {
      keyboard = false;
      cancel();
    };

    /** 두 프레임 사이에 스크롤이 움직였는가 — 다른 컴포넌트가 smooth 스크롤 중 */
    const settleThen = (el: Element, tries: number) => {
      const before = scrollPositions(el);
      raf2 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (document.activeElement !== el) return;
          const after = scrollPositions(el);
          const moving = before.length !== after.length || before.some((v, i) => Math.abs(v - after[i]) > 0.5);
          if (moving) {
            if (tries > 0) lateTimer = window.setTimeout(() => settleThen(el, tries - 1), 250);
            return;
          }
          reveal(el);
        });
      });
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof Element) || el === document.body || el === root) return;
      if (!keyboard || !isFocusVisible(el)) return;
      cancel();
      // 브라우저 포커스 스크롤은 focusin 뒤에 일어난다 — 한 프레임 기다려 그 결과 위에서 잰다
      raf1 = requestAnimationFrame(() => {
        if (document.activeElement !== el) return;
        settleThen(el, 0);
        // 헤더 등장·컴포넌트 smooth 스크롤이 끝난 뒤 한 번 더 — 그때 다 보이면 아무것도 안 한다
        lateTimer = window.setTimeout(() => {
          if (document.activeElement === el) settleThen(el, 3);
        }, LATE_MS);
      });
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointer, true);
    window.addEventListener("wheel", cancel, { passive: true });
    window.addEventListener("touchstart", cancel, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointer, true);
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      document.removeEventListener("focusin", onFocusIn);
      cancel();
    };
  }, []);
}
