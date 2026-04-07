import { useRef, useEffect, type RefObject } from "react";

/**
 * 마우스 드래그로 가로 스크롤 가능하게 만드는 훅.
 * 터치 디바이스는 네이티브 스크롤을 사용하므로 마우스만 처리한다.
 *
 * - pointerCapture 대신 window 이벤트 위임 → 자식 <Link> 클릭 보존
 * - 드래그 후 클릭만 차단 (hasMoved 3px 임계값)
 *
 * @param scrollRef - overflow-x: auto인 스크롤 컨테이너 ref
 */
export function useDragScroll(scrollRef: RefObject<HTMLElement | null>) {
  const state = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    scrollStart: 0,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const s = state.current;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      // 버튼(화살표 등) 클릭은 무시
      if ((e.target as HTMLElement).closest("button")) return;

      s.isDragging = true;
      s.hasMoved = false;
      s.startX = e.clientX;
      s.scrollStart = el.scrollLeft;

      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
      el.style.scrollSnapType = "none";
      el.style.scrollBehavior = "auto";

      // window에 move/up 등록 (컨테이너 밖으로 커서가 나가도 동작)
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.isDragging) return;
      const dx = e.clientX - s.startX;
      if (Math.abs(dx) > 3) s.hasMoved = true;
      el.scrollLeft = s.scrollStart - dx;
    };

    const onPointerUp = () => {
      if (!s.isDragging) return;
      s.isDragging = false;

      el.style.cursor = "";
      el.style.userSelect = "";
      el.style.scrollSnapType = "x mandatory";
      el.style.scrollBehavior = "";

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    // 드래그 후 클릭 방지 (링크 오작동 방지), 단순 클릭은 통과
    const onClick = (e: MouseEvent) => {
      if (s.hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        s.hasMoved = false;
      }
    };

    // 링크/이미지의 브라우저 기본 드래그(ghost image) 차단
    const onDragStart = (e: Event) => {
      if (s.isDragging) e.preventDefault();
    };

    el.style.cursor = "grab";
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("click", onClick, true);
    el.addEventListener("dragstart", onDragStart);

    return () => {
      el.style.cursor = "";
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("dragstart", onDragStart);
      // safety cleanup
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [scrollRef]);
}
