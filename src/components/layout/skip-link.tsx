import s from "./skip-link.module.css";

/** 본문 영역 id — 루트 레이아웃 `<main>` 과 이 링크가 같은 값을 쓴다 */
export const MAIN_CONTENT_ID = "main-content";

/**
 * 본문 바로가기 (10/8, KWCAG 2.1 반복 영역 건너뛰기) — 키보드 첫 Tab 에만 화면 왼쪽 위에 나타나
 * 헤더·전체 메뉴를 건너뛰고 `<main>` 으로 간다. JS 없이 동작하는 기본 앵커(하이드레이션 전에도 된다).
 * 숨김은 화면 밖으로 옮겨 두는 방식이라 스크린리더는 처음부터 읽는다.
 */
export function SkipLink() {
  return (
    <a href={`#${MAIN_CONTENT_ID}`} className={s.skipLink}>
      본문 바로가기
    </a>
  );
}
