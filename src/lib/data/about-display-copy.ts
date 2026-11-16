/**
 * /about 에서 제목 서체(--font-about-display = IrangAboutDisplay, 원본 마루부리 Bold)로 그리는 문구 (2026-11-16 회장 결재 B안).
 *
 * 이 서체는 이 문구에 쓰인 글자만 담은 서브셋(public/fonts/irang-about-display-700.woff2)이라,
 * 여기 없는 글자를 화면에 쓰면 그 글자만 대체 서체로 튄다. 문구를 바꾸면
 * `src/__tests__/about-display-font-subset.test.ts` 가 빠진 글자를 알려 준다 →
 * `src/lib/fonts/about-display-subset.ts` 에 글자를 더하고 `scripts/subset-about-display-font.ts` 로 다시 만든다.
 *
 * ④ 여정 카드의 유형 이름(START_LANES label — 데이터 SSOT 라 여기 따로 두지 않는다)도 이 서체다.
 * 본문·숫자(카드 번호 포함)·버튼·설명·AutoGlossary 문단에는 이 서체를 쓰지 않는다.
 */

/** ① 타이틀 띠 인용 제목 — 줄마다 <br /> */
export const ABOUT_QUOTE_LINES = ["출처가 분명한 숫자로", "정착할 곳을 비교해요"] as const;

/** ④ 여정 카드 섹션 제목 */
export const ABOUT_JOURNEY_TITLE = "도시에서 농촌으로,";

/** 진단 CTA 제목 */
export const ABOUT_CTA_TITLE = "어디서 시작할지 모르겠다면";
