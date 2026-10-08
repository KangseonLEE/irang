"use client";

import { MAIN_CONTENT_ID } from "./main-content";
import s from "./skip-link.module.css";

/**
 * 본문 바로가기 (10/8, KWCAG 2.1 반복 영역 건너뛰기) — 키보드 첫 Tab 에만 화면 왼쪽 위에 나타나
 * 헤더·전체 메뉴를 건너뛰고 `<main>` 으로 간다. JS 전에도 기본 앵커로 본문까지 스크롤된다.
 * 숨김은 화면 밖으로 옮겨 두는 방식이라 스크린리더는 처음부터 읽는다.
 *
 * 포커스는 누르는 순간에만 `<main>` 에 tabindex=-1 을 붙여 옮기고, 포커스가 떠나면 뗀다.
 * main 에 tabindex 를 **상시로** 두면 WebKit(사파리)이 버튼·링크 클릭 때 포커스를 가장 가까운 포커스 가능 조상인
 * main 에 줘서, "relatedTarget 이 바깥이면 닫는" 드롭다운들(지역 검색·지역/작물 비교·검색 제안)이 클릭 전에 닫히고
 * 선택이 사라졌다(10/8 2차 QA, WebKit 재현·크롬은 버튼에 포커스라 무관).
 */
export function SkipLink() {
  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className={s.skipLink}
      onClick={() => {
        const main = document.getElementById(MAIN_CONTENT_ID);
        if (!main) return;
        main.setAttribute("tabindex", "-1");
        main.addEventListener("blur", () => main.removeAttribute("tabindex"), { once: true });
        main.focus();
      }}
    >
      본문 바로가기
    </a>
  );
}
