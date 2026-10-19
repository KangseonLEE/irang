/**
 * 랜딩 클릭 자리 (2026-10-19) — `[data-track]` 링크가 자기 섹션 안에서 몇 번째 자리인지.
 *
 * 섹션 = 라벨의 첫 마디(`quick_link:regions` → `quick_link`, `discover:programs:card` → `discover`) + 감싼 `<section>`.
 * 그 섹션의 **화면에 그려진** `[data-track]` 요소를 문서 순서로 세어 1부터 매긴다 — 숨긴 탭 패널(`hidden`)과
 * `display:none` 인 모바일/데스크탑 이중 렌더는 빼야 사용자가 본 순서와 맞는다.
 * 라벨(`landing_cta_click`)은 손대지 않는다(M2 라벨 유지) — 자리는 별도 이벤트로 보낸다.
 */
interface LandingSlot {
  section: string;
  slot: number;
  size: number;
}

const landingSection = (track: string) => track.split(":")[0];

const isRendered = (el: Element) => el.getClientRects().length > 0;

export function landingSlot(
  el: HTMLElement,
  root: ParentNode = document,
  rendered: (el: Element) => boolean = isRendered,
): LandingSlot | null {
  const track = el.dataset.track;
  if (!track) return null;
  const section = landingSection(track);
  // 같은 접두어를 두 섹션이 나눠 쓰는 경우(`discover:` = 지금 열린 기회 + 체험)가 있어 감싼 <section> 도 같아야 한 묶음이다
  const box = el.closest("section");
  const group = Array.from(root.querySelectorAll<HTMLElement>("[data-track]")).filter(
    (n) =>
      n.dataset.track &&
      landingSection(n.dataset.track) === section &&
      n.closest("section") === box &&
      (n === el || rendered(n)),
  );
  const index = group.indexOf(el);
  if (index < 0) return null;
  return { section, slot: index + 1, size: group.length };
}
