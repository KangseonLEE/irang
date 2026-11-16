/**
 * /about 제목 서체(IrangAboutDisplay — 원본 네이버 마루부리 Bold) 서브셋 글자 목록 — 서브셋 스크립트(scripts/subset-about-display-font.ts)와
 * 계약 테스트(src/__tests__/about-display-font-subset.test.ts)가 함께 읽는 단일 출처.
 *
 * 문구(src/lib/data/about-display-copy.ts · 여정 카드 이름 = START_LANES label)에서 자동으로 뽑지 않고 손으로 적는다 —
 * 자동으로 뽑으면 테스트가 늘 통과해 "새 글자를 넣고 woff2 를 안 다시 만든" 사고를 못 잡는다.
 * 글자를 더했으면 스크립트로 woff2 를 다시 만든다(같은 커밋).
 *
 * 원본: 네이버 마루부리 Bold (hangeul.naver.com, SIL OFL 1.1). MaruBuri 는 예약 글꼴 이름(RFN)이라 수정본인 이 서브셋은
 * IrangAboutDisplay 로 이름을 바꾼다(OFL 조건 3) — 라이선스 public/fonts/OFL-NOTICE.txt
 */
export const ABOUT_DISPLAY_SUBSET =
  " ," +
  "가겠곳교귀년농다도디로르마면명모분비산서숫스시어에요으을자작정지착처청촌출트팜한할해";

/** 서브셋 결과 파일 (리포 루트 기준) */
export const ABOUT_DISPLAY_FONT_FILE = "public/fonts/irang-about-display-700.woff2";

/** woff2 name 테이블의 글꼴 이름 — 원본 예약 이름(MaruBuri·Nanum)을 쓰지 않는다 */
export const ABOUT_DISPLAY_FAMILY = "IrangAboutDisplay";
