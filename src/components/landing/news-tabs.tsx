/* ── 통합 뉴스 아이템 타입 (v2에서 import하여 사용) ── */

export interface UnifiedNewsItem {
  title: string;
  /** 기사 본문 요약 */
  description?: string;
  source: string;
  date: string;
  url: string;
  /** 네이버 뉴스 URL — OG 추출용 (서버 전용, 클라이언트에선 미사용) */
  naverUrl?: string;
  /** OG 이미지 썸네일 URL (선택) */
  thumbnail?: string;
  /** 탭 분류: news(전체 뉴스), education, event, program, policy */
  category: "news" | "education" | "event" | "program" | "policy";
  /** 정렬용 타임스탬프 (ms) */
  _ts?: number;
}
