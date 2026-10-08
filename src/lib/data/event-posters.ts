/**
 * 행사 대표 이미지(포스터·홍보 이미지) — 주최 측이 공개한 원본을 참조한다 (2026-10-08 회장 결재 A안, 동결 예외).
 *
 * 큐레이션 때 행사마다 확인해서 넣는다:
 *  ① 주최 누리집·공지의 포스터나 공유 이미지(og:image)를 찾는다
 *  ② 이미지에 적힌 행사 이름·날짜·장소가 events 데이터와 같은지 눈으로 확인한다 — 같은 주최의 다른 회차 이미지가 흔하다
 *  ③ 로고만 있는 이미지, 사람 얼굴이 드러난 현장 사진, 뉴스 사진은 쓰지 않는다(저작권·초상권)
 *  ④ 호스트·경로를 next.config.ts images.remotePatterns 에 넣는다 — event-posters 테스트가 빠진 것을 잡는다
 * 원본은 내려받아 두지 않는다(출처 표기 + 원본 참조 — 9/30 그린대로 마을 사진과 같은 방식).
 * 화면: /events 카드·상세 히어로에서 잘리지 않게(contain) 넣고 뒤에 같은 이미지를 흐리게 깐다. 아주 넓은 배너는
 * contain 이면 16:10 카드에서 글자가 8px 안팎으로 작아지므로, 16:10 가운데 자르기에 행사 이름·날짜·장소가 다 남는지
 * 눈으로 확인한 것만 `crop16x10` 으로 자른다(카드·모바일 히어로). 랜딩 '직접 가 보는 농촌' 카드는 글자를 사진 위에
 * 얹는 배치라 포스터를 쓰지 않는다(getEventImage allowPoster). 공유 카드(og:image)·구조화 데이터 image 도 포스터를 쓴다.
 */
export interface EventPoster {
  /** 원본 이미지 주소(https) */
  url: string;
  /** 원본 픽셀 크기 — 공유 카드(og:image:width·height)에 그대로 싣는다 */
  width: number;
  height: number;
  /**
   * 16:10 가운데 자르기를 해도 이미지 속 행사 이름·날짜·장소가 다 남는다(눈으로 확인한 것만 true).
   * true 면 카드·모바일 히어로(16:10)에서 자르고(cover), 아니면 잘리지 않게(contain) 놓는다.
   */
  crop16x10?: boolean;
  /** 출처 표기 — "이미지: {credit}" */
  credit: string;
  /** 이름·날짜·장소를 대조한 날 */
  checkedAt: string;
}

/** 키 = events 의 id(slug) */
export const EVENT_POSTERS: Readonly<Record<string, EventPoster>> = {
  // 이미지 문구: "Y-FARM EXPO 2026 · 2026.4.24(금)~26(일) · 수원컨벤션센터 전시장 A홀" (공유 이미지 600×315)
  // 1.9:1 이라 16:10 카드에서 contain 해도 위아래 띠만 조금 남는다 — 자르지 않는다
  "evt-001": {
    url: "https://cdn2.micehub.com/home/2016/micehub/Files/20260225_151211_1844335168.png",
    width: 600,
    height: 315,
    credit: "Y-FARM EXPO 누리집",
    checkedAt: "2026-10-08",
  },
  // 이미지 문구: "제14회 수원 케이팜 · 2026.10.29 목-31 토 · 수원메쎄" (누리집 대표 배너 2560×824)
  // 3.1:1 배너 — 글자·로고 묶음이 가로 25.9~74.1% 안에 있어 16:10 가운데 자르기(24.3~75.7%)에 다 남는다
  "evt-004": {
    url: "https://d3hjmc9lw655td.cloudfront.net/wp-content/uploads/2026/09/29021142/KFARM-HOMEPAGE-PNG2%EB%B0%B0%EC%A0%80%EC%9E%A5-1-1-scaled.png",
    width: 2560,
    height: 824,
    crop16x10: true,
    credit: "케이팜 누리집",
    checkedAt: "2026-10-08",
  },
};
