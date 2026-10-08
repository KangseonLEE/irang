"use client";

import { useEffect } from "react";
import { axisDelta, documentDelta, stickyCoverBand, stickyStateOf, type StickyState } from "@/lib/scroll-geometry";

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
 *   손대지 않고, 고정 띠의 CSS 전환(헤더 0.35s·헤더를 따라 내려오는 sticky 머리의 top)이 끝난 뒤 다시 잰다. 그때도 다 보이면 아무것도 안 한다.
 * - sticky 는 붙어 있을 때(stuck)만 "문서를 밀어도 안 움직이는 띠"다. 흐름 안 sticky 는 내용과 같고, 담는 상자 끝에 밀려 올라가는
 *   sticky 는 아직 아래를 덮는다 — 문서를 위로 굴리면 붙는 자리까지 같이 내려오므로 그 자리를 띠 끝으로 본다(10/6 R2-Q3 R2·R3).
 * - 띠끼리 떨어져 있어도(모바일 탭바 위 8px 띄운 하단 바) 24px 까지 건너 찾는다(R1).
 * - 완전히 화면 밖인 요소는 건드리지 않는다 — `focus({ preventScroll: true })` 로 일부러 스크롤을 막은 경우다.
 * - fixed 상자(모달·하단 바)·붙어 있는 sticky 안 요소는 그 상자 안 스크롤만 하고 문서는 밀지 않는다.
 * - 떠 있는 버튼(피드백·맨 위로)은 가리면 스스로 비켜나므로(useFocusDodge) 띠로 세지 않는다 — `data-focus-reveal-ignore`.
 * - 보정은 즉시(instant) — 브라우저 자체 포커스 스크롤도 즉시라, 두 프레임 뒤 이어지는 보정이 한 번의 이동처럼 보인다.
 *   부드럽게 끌면 포커스 직후 수백 ms 동안 가린 채로 남고, 모션 감소 설정도 따로 챙길 필요가 없다.
 */

const NAV_KEYS = new Set(["Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);
/** 띠와 요소 사이 여유 */
const GAP = 8;
/** 이보다 작은 차이는 반올림 오차 — 움직이지 않는다 */
const EPS = 1;
/** Web Animations 를 못 쓰는 브라우저에서 늦은 측정까지 기다리는 시간 — 헤더 전환 0.35s + 여유 */
const LATE_MS = 420;

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
  let positioned = false; // fixed 안이거나, 지금 붙어 있는(stuck) sticky 안인가 → 문서는 밀지 않는다
  let fixed = false; // fixed 안인가 → 그 위 상자도 건드리지 않는다
  for (let n = el.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    const pos = getComputedStyle(n).position;
    // sticky 는 실제로 붙어 있을 때만 — 흐름 안에 있는 sticky(지역 상세 시·군 패널 등)는 문서와 함께 움직이므로 밀어야 보인다
    // (10/6 R2-Q3 R3: /regions/jeonnam 1280 '여수시' 카드가 sticky 조상 때문에 보정을 건너뛰어 헤더에 6/9 가렸다)
    if (pos === "fixed" || (pos === "sticky" && stickyState(n) === "stuck")) positioned = true;
    if (!fixed && (isScrollable(n, "x") || isScrollable(n, "y"))) containers.push(n);
    if (pos === "fixed") fixed = true;
  }
  return { containers, positioned };
}

/** sticky 요소의 붙는 기준 — top 값이 있으면 위, 없고 bottom 값이 있으면 아래. 둘 다 auto 면 붙지 않는다 */
function stickyEdge(n: Element): { edge: "top" | "bottom"; offset: number } | null {
  const cs = getComputedStyle(n);
  const top = parseFloat(cs.top);
  if (Number.isFinite(top)) return { edge: "top", offset: top };
  const bottom = parseFloat(cs.bottom);
  if (Number.isFinite(bottom)) return { edge: "bottom", offset: bottom };
  return null;
}

/** sticky 요소의 지금 상태(flow·stuck·pushed — 판정은 scroll-geometry 의 순수 함수) */
function stickyState(n: Element): StickyState {
  const e = stickyEdge(n);
  return e ? stickyStateOf(e.edge, n.getBoundingClientRect(), e.offset, window.innerHeight) : "flow";
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
 */
function overlayAt(x: number, y: number, el: Element): { top: number; bottom: number } | null {
  const hit = document.elementFromPoint(x, y);
  if (!hit || hit === el || el.contains(hit)) return null;
  for (let n: Element | null = hit; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
    if (n.closest("[data-focus-reveal-ignore]")) return null;
    const pos = getComputedStyle(n).position;
    if (pos !== "fixed" && pos !== "sticky") continue;
    const r = n.getBoundingClientRect();
    if (pos === "sticky") {
      const e = stickyEdge(n);
      // 흐름 안 sticky 는 띠가 아니다 — 더 바깥 조상을 본다
      const band = e ? stickyCoverBand(e.edge, r, e.offset, window.innerHeight) : null;
      if (!band) continue;
      if (n.contains(el)) return null;
      if (!isVisibleBox(r)) return null;
      // 밀려나는 중이면 붙는 자리까지 합친 구간(stickyCoverBand 주석 — 10/6 R2-Q3 R2). 단 그렇게 넓혀 세는 건 **지금 자리에서
      // 이미 요소를 덮고 있을 때만** — 문서를 굴려야 띠가 따라오니까. 덮지 않는데 넓히면 다 보이는 요소를 '가렸다'고 보고
      // 문서를 수백 px 굴렸다(10/8: 지역 상세 시·군 카드 칸이 밀려 올라간 채 바로 아래 정착 점수 접기 버튼으로 Tab → 509px 위로 튐)
      const t = el.getBoundingClientRect();
      const coveredNow = t.top < r.bottom + GAP && t.bottom > r.top - GAP;
      return coveredNow ? band : { top: r.top, bottom: r.bottom };
    }
    if (n.contains(el)) return null;
    return isVisibleBox(r) ? { top: r.top, bottom: r.bottom } : null;
  }
  return null;
}

/**
 * 가장자리에서 띠를 찾다가 빈 곳을 만나면 조금 더(최대 24px) 들어가 본다 — 띠끼리 떨어져 있을 수 있다.
 * 10/6 R2-Q3 R1: 랜딩 320 트렌드·비용 하단 바는 모바일 탭바 위 8px 띄워 떠 있어, 탭바 바로 위 한 점만 보고 멈추면 바를 못 셌다
 * ('귀농 이야기 모두 보기'가 바 밑에 9/9 가림).
 */
function overlayNear(x: number, y: number, el: Element, dir: 1 | -1): { top: number; bottom: number } | null {
  for (let d = 0; d <= 24; d += 4) {
    const r = overlayAt(x, y + d * dir, el);
    if (r) return r;
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
      const r = overlayNear(x, y, el, 1);
      if (!r || r.bottom <= y) break;
      top = Math.max(top, r.bottom);
      y = r.bottom + 1;
    }
  }
  let bottom = vh;
  for (const x of xs) {
    let y = vh - 2;
    for (let i = 0; i < 4 && y > vh / 2; i++) {
      const r = overlayNear(x, y, el, -1);
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
  // 내려오는 중인 헤더는 다 내려온 자리로 — 헤더 아래 sticky 띠(작물 상세 머리 등)는 늦은 측정(띠 전환이 끝난 뒤)이 마저 잡는다
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
    /** 지금 진행 중인 보정 흐름 번호 — 새 포커스·포인터·휠이 오면 올려서 이전 흐름을 버린다 */
    let token = 0;

    const cancel = () => {
      token++;
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

    /** 이 흐름이 아직 유효하고 포커스가 그대로인가 */
    const alive = (el: Element, my: number) => my === token && document.activeElement === el;

    /**
     * 스크롤이 멈춰 있으면 보정한다. 두 프레임 사이에 움직이면(다른 컴포넌트의 smooth 스크롤) 250ms 간격으로 tries 번 다시 본다.
     */
    const settleAndReveal = async (el: Element, my: number, tries: number): Promise<void> => {
      for (let i = 0; i <= tries; i++) {
        const before = scrollPositions(el);
        await nextFrame();
        await nextFrame();
        if (!alive(el, my)) return;
        const after = scrollPositions(el);
        const moving = before.length !== after.length || before.some((v, j) => Math.abs(v - after[j]) > 0.5);
        if (!moving) {
          reveal(el);
          return;
        }
        if (i < tries) await wait(250);
        if (!alive(el, my)) return;
      }
    };

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target;
      if (!(el instanceof Element) || el === document.body || el === root) return;
      if (!keyboard || !isFocusVisible(el)) return;
      const my = ++token;
      void (async () => {
        // 브라우저 포커스 스크롤은 focusin 뒤에 일어난다 — 한 프레임 기다려 그 결과 위에서 잰다
        await nextFrame();
        if (!alive(el, my)) return;
        await settleAndReveal(el, my, 0);
        // 늦은 측정 — 헤더가 다시 내려오거나(0.35s) 헤더 아래 sticky 띠가 top 을 옮기는 전환이 끝난 뒤.
        // 고정 시각(420ms)으로는 우리 보정이 헤더를 불러낸 경우 전환이 아직 안 끝나 작물 상세 머리에 1/3 가렸다(10/6 R2-Q3 R2)
        await nextFrame();
        await nextFrame();
        await overlayTransitionsDone();
        if (!alive(el, my)) return;
        await settleAndReveal(el, my, 3);
      })();
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

function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()));
}

function wait(ms: number): Promise<void> {
  return new Promise((r) => window.setTimeout(r, ms));
}

/**
 * 고정 띠(fixed·sticky)의 CSS 전환이 끝날 때까지 — 헤더 숨김·보임(transform 0.35s), 헤더를 따라 내려오는 sticky 머리의 top 전환 등.
 * 끝없는 애니메이션은 세지 않는다(전환만). 아무리 길어도 700ms 에서 끊는다.
 */
function overlayTransitionsDone(): Promise<void> {
  if (typeof document.getAnimations !== "function" || typeof CSSTransition === "undefined") return wait(LATE_MS);
  const running = document.getAnimations().filter((a) => {
    if (!(a instanceof CSSTransition) || a.playState !== "running") return false;
    const target = (a.effect as KeyframeEffect | null)?.target;
    if (!(target instanceof Element)) return false;
    const pos = getComputedStyle(target).position;
    return pos === "sticky" || pos === "fixed";
  });
  if (!running.length) return Promise.resolve();
  return Promise.race([
    Promise.all(running.map((a) => a.finished.then(
      () => undefined,
      () => undefined,
    ))),
    wait(700),
  ]).then(() => undefined);
}
