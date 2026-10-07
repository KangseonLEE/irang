/**
 * 스크롤 계산 순수 함수 — DOM·React 없이 숫자만 다룬다(테스트·서버 어디서든 import 해도 안전).
 *
 * "use client" 모듈(use-focus-reveal 훅)에 함께 두면 서버 컴포넌트가 import 했을 때 클라이언트 참조 프록시가 와서
 * 함수가 조용히 깨진다(체크리스트 H, 9/17 박제) — 그래서 계산은 여기, DOM 을 만지는 훅은 lib/hooks 에 둔다(10/6 R2-Q1).
 */

/** 이보다 작은 차이는 반올림 오차 — 움직이지 않는다 */
const EPS = 1;

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

/**
 * 가로 스크롤 상자 안에서 한 항목을 가운데 두는 scrollLeft — 상자 범위로 자른다.
 * `el.scrollIntoView({ inline: "center" })` 대신 쓴다: scrollIntoView 는 block 축으로 문서까지 움직이고(붙은 sticky 탭바면
 * 그 원래 자리로 1,200px 넘게 튄다), 크롬의 순차 포커스 시작점도 그 요소로 옮겨 다음 Tab 이 헤더·내비를 건너뛴다(10/6 R2-Q3 F1·N3).
 *
 * @param itemLeft   항목의 상자 기준 왼쪽 위치(= 항목 rect.left − 상자 rect.left + 상자 scrollLeft)
 * @param itemWidth  항목 폭
 * @param viewWidth  상자 clientWidth
 * @param scrollWidth 상자 scrollWidth
 */
export function centeredScrollLeft(itemLeft: number, itemWidth: number, viewWidth: number, scrollWidth: number): number {
  const max = Math.max(0, scrollWidth - viewWidth);
  const left = itemLeft - (viewWidth - itemWidth) / 2;
  return Math.min(max, Math.max(0, Math.round(left)));
}

/**
 * sticky 상자의 상태 — 붙는 기준값(CSS top 또는 bottom)과 지금 위치의 차이로 가른다(±1.5px 안이면 붙어 있음).
 * - flow: 아직 흐름 안 — 문서와 같이 움직이고 아무것도 덮지 않는다
 * - stuck: 붙어 있음 — 문서를 굴려도 그 자리에 남는다(안쪽 요소를 보이려고 문서를 밀면 안 된다)
 * - pushed: 담는 상자 끝에 밀려나는 중 — 아직 내용을 덮고 있고, 문서를 반대로 굴리면 붙는 자리까지 같이 따라온다
 */
export type StickyState = "flow" | "stuck" | "pushed";

export function stickyStateOf(
  edge: "top" | "bottom",
  rect: { top: number; bottom: number },
  offset: number,
  viewportHeight: number,
): StickyState {
  // top 기준: 붙는 자리보다 아래면 흐름 안, 위면 밀려 올라가는 중
  // bottom 기준: 붙는 자리(화면 아래 − offset)보다 위면 흐름 안, 아래면 밀려 내려가는 중
  const d = edge === "top" ? rect.top - offset : viewportHeight - offset - rect.bottom;
  return d > 1.5 ? "flow" : d < -1.5 ? "pushed" : "stuck";
}

/**
 * 떠 있는 sticky 띠가 덮는 세로 구간. 흐름 안이면 띠가 아니다(null).
 * 밀려나는 중이면 지금 자리와 붙는 자리를 합친 구간 — 포커스 보정으로 문서를 굴리면 띠가 붙는 자리까지 같이 오기 때문이다
 * (10/6 R2-Q3 R2: 작물 상세 끝 '지역 비교'가 상자 끝에 밀려 올라간 고정 머리에 1/3 가렸다 — 지금 자리만 보고 덜 밀었다).
 */
export function stickyCoverBand(
  edge: "top" | "bottom",
  rect: { top: number; bottom: number },
  offset: number,
  viewportHeight: number,
): { top: number; bottom: number } | null {
  const state = stickyStateOf(edge, rect, offset, viewportHeight);
  if (state === "flow") return null;
  if (state === "stuck") return { top: rect.top, bottom: rect.bottom };
  const height = rect.bottom - rect.top;
  if (edge === "top") return { top: rect.top, bottom: Math.max(rect.bottom, offset + height) };
  return { top: Math.min(rect.top, viewportHeight - offset - height), bottom: rect.bottom };
}
