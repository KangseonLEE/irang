/**
 * 출처 URL 의 성격에 맞는 버튼 문구 (2026-09-28, 회장 "원문 보기가 애매하다").
 *
 * "원문 공고 보기"는 출처가 기관 공고일 때만 맞고, 언론 기사·상설 안내 페이지에선 어긋난다.
 * 도메인으로 세 갈래만 가른다 — 오판해도 "안내 페이지 열기"라는 중립 문구로 떨어지게.
 */
export type SourceKind = "official" | "news" | "other";

const OFFICIAL_HOSTS = new Set(["gov.kr", "fbo.or.kr", "smartfarmkorea.net", "greendaero.go.kr"]);
const NEWS_PATTERN =
  /(news|ilbo|times|today|daily|press|post24|nongmin|newsis|yonhap|yna\.|dominilbo|gnnnews|goodmorningcc|foodtoday|webeconomy|asiaa|ajunews|koreaunionnews|smartbizn|joongang|hani\.|chosun|donga|khan\.|mk\.co|hankyung|edaily|newspim)/;

export function sourceHost(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function classifySource(href: string): SourceKind {
  const host = sourceHost(href);
  if (!host) return "other";
  if (host.endsWith(".go.kr") || host === "gov.kr" || OFFICIAL_HOSTS.has(host)) return "official";
  if (NEWS_PATTERN.test(host) || host.endsWith(".co.kr")) return "news";
  return "other";
}

/** 제목 영역 버튼 문구 */
export function sourceButtonLabel(href: string): string {
  switch (classifySource(href)) {
    case "official":
      return "공고 확인하기";
    case "news":
      return "관련 기사 보기";
    default:
      return "안내 페이지 열기";
  }
}

/** 사이드 "원문 확인" 카드 문구 — 버튼과 같은 갈래, 같은 어조 */
export function sourceBlockLabel(href: string): string {
  switch (classifySource(href)) {
    case "official":
      return "공고 페이지 방문";
    case "news":
      return "기사 페이지 방문";
    default:
      return "안내 페이지 방문";
  }
}
