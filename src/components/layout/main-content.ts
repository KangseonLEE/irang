/**
 * 본문 영역 id — 루트 레이아웃 `<main>` 과 본문 바로가기가 같은 값을 쓴다.
 * 클라이언트 모듈(skip-link.tsx)에서 상수를 export 하면 서버(layout)가 받을 때 참조 프록시가 되므로(9/17 사고) 따로 둔다.
 */
export const MAIN_CONTENT_ID = "main-content";
