/**
 * 랜딩 홍보 팝업 데이터 (2026-09-29 회장 지시).
 *
 * 외부 기관이 특별히 홍보를 요청한 프로그램을 랜딩에서 한 번 알린다.
 * - 한 번에 하나만 활성. `until` 이 지나면 코드 변경 없이 자동으로 내려간다.
 * - 값은 포스터·원문에서 그대로 옮긴다(추정 금지). 모집이 끝난 뒤에도 홍보 요청이 있으면
 *   `recruitClosed: true` 로 두고 "마감" 을 화면에 정직하게 표기한다.
 */

export interface PromoPopupItem {
  /** 저장소 키에 쓰는 고유 id — 바꾸면 "오늘 하루 보지 않기" 가 초기화된다 */
  id: string;
  /** 모달 제목(주최 기관) */
  org: string;
  /** 프로그램 이름 */
  title: string;
  /** 한 줄 부제 */
  tagline: string;
  /** 포스터(public 경로, webp) */
  image: string;
  imageWidth: number;
  imageHeight: number;
  /** 포스터 대체 텍스트 */
  alt: string;
  /** 정보 행 — 라벨·값(전화·링크는 href 로 탭 가능) */
  facts: { label: string; value: string; href?: string }[];
  /** 모집 마감 여부 — true 면 "모집 마감" 배지 + 안내 문구 */
  recruitClosed: boolean;
  /** 안내(마감·문의 방법 등) — 줄바꿈은 \n, 화면에서 그대로 두 줄 */
  note: string;
  /** 자세히 보기 목적지(외부, https) */
  href: string;
  /** 이 날짜(KST, 포함)까지 노출. 이후엔 렌더하지 않는다 */
  until: string;
}

/**
 * 활성 팝업 목록. 당분간 무료 홍보 채널 — 여러 건이 겹치면 한 화면에 나열하지 않고
 * 팝업 안에서 한 건씩 넘겨 본다(회장 9/29). 노출 순서 = 배열 순서.
 */
export const PROMO_POPUPS: PromoPopupItem[] = [
  {
    id: "gafi-masil-2026",
    org: "경기도 귀농귀촌지원센터",
    title: "재능으로 잇는 마실짝꿍",
    tagline: "도시민의 재능 × 주민의 삶, 그리고 오래 이어지는 관계",
    image: "/promo/gafi-masil-2026.webp",
    imageWidth: 600,
    imageHeight: 851,
    alt: "경기도 귀농귀촌지원센터 관계인구 형성 프로그램 '재능으로 잇는 마실짝꿍' 포스터 — 카메라를 든 손과 새싹, 모집 안내",
    facts: [
      { label: "모집 기간", value: "9. 28.(일) 18:00 마감" },
      { label: "활동 기간", value: "2026. 10. 17.(토) ~ 11. 15.(일) · 총 5회" },
      { label: "활동 지역", value: "연천군 군남면 옥계2리" },
      { label: "모집 인원", value: "15명 내외" },
      { label: "참여 대상", value: "재능을 나누고 싶은 도시민(평가 선발)" },
      { label: "주최", value: "경기도 · 경기도농수산진흥원(경기도귀농귀촌지원센터)" },
      { label: "문의", value: "1800-8114 (내선 1)", href: "tel:18008114" },
    ],
    recruitClosed: true,
    note: "이번 모집은 9. 28.(일) 18:00에 끝났어요.\n다음 기수나 비슷한 프로그램은 센터에 문의해 보세요.",
    href: "https://www.refarmgg.or.kr/cop/bbs/selectBoardArticle.do?bbsId=BBSMSTR_000000000082&nttId=2051&menuNo=60101000",
    until: "2026-11-15",
  },
];

/** 오늘(KST) 기준 살아 있는 팝업만 */
export function getActivePromos(now: Date = new Date()): PromoPopupItem[] {
  return PROMO_POPUPS.filter((item) => isPromoActive(item, now));
}

/** KST 기준 오늘이 `until` 이하인지 — Vercel/브라우저 UTC 함정(5월 박제) 회피용 */
export function isPromoActive(item: PromoPopupItem | null, now: Date = new Date()): item is PromoPopupItem {
  if (!item) return false;
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = kst.toISOString().slice(0, 10);
  return today <= item.until;
}
