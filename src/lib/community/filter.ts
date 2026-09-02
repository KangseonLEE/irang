/**
 * 커뮤니티 한 줄 의견 — 룰 기반 스팸·광고 필터 (2층, 2026-09-02)
 *
 * 순수 함수. 걸린 항목을 flags 로 돌려주고, `reject` 가 true 면 저장은 하되
 * status='rejected' 로 적재해 노출을 막는다(관리자가 큐에서 복구 가능).
 * 이 필터를 통과한 글은 관리자 승인 큐(pending)로 간다 — 승인 전엔 노출되지 않는다.
 */

export const NOTE_MIN_LENGTH = 5;
export const NOTE_MAX_LENGTH = 300;
export const NICKNAME_MAX_LENGTH = 20;
/** 작성 시작 → 제출까지 이보다 빠르면 봇으로 간주 */
export const MIN_COMPOSE_MS = 2_000;

export type FilterFlag =
  | "too_short"
  | "too_long"
  | "url_count"
  | "phone_number"
  | "messenger_id"
  | "banned_keyword"
  | "repeated_chars"
  | "low_korean_ratio"
  | "honeypot"
  | "too_fast";

export interface FilterResult {
  flags: FilterFlag[];
  /** 저장은 하되 노출 불가(rejected) */
  reject: boolean;
}

/**
 * 광고·홍보성 금지어 (부분 일치, 공백 제거 후 비교).
 * 농업 맥락에서 정상 사용되는 단어(부업·홍보·성인·출장·무료체험)는 오탐이 커서 제외 —
 * 그런 교묘한 홍보글은 사전 승인 단계에서 관리자가 거른다.
 */
const BANNED_KEYWORDS = [
  "대출",
  "분양",
  "카지노",
  "바카라",
  "토토",
  "슬롯",
  "텔레그램",
  "수익보장",
  "수익률보장",
  "원금보장",
  "상담문의",
  "광고문의",
  "비아그라",
  "코인추천",
  "리딩방",
  "재택알바",
  "고수익",
  "당일승인",
  "무담보",
];

const URL_RE = /(https?:\/\/|www\.)[^\s]+|[a-z0-9-]+\.(com|net|kr|co|io|me|shop|xyz|top|site|link|info|biz)(\/|\b)/gi;
const PHONE_RE = /(01[016789][-.\s]?\d{3,4}[-.\s]?\d{4})|(0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4})|(\d{2,4}[-.\s]\d{3,4}[-.\s]\d{4})/;
const MESSENGER_RE = /(카톡|카카오톡|kakao|라인|line|텔레그램|telegram|위챗|wechat|오픈채팅)\s*(아이디|id|:|＠|@)/i;
const REPEAT_RE = /(.)\1{6,}/;

/** 입력이 한글 문장으로 보이는지 — 한글·숫자·공백·문장부호 외 문자 비율 */
function koreanRatio(text: string): number {
  const compact = text.replace(/\s/g, "");
  if (compact.length === 0) return 1;
  const korean = compact.match(/[가-힣ㄱ-ㅎㅏ-ㅣ0-9.,!?~·…()%]/g)?.length ?? 0;
  return korean / compact.length;
}

export function runRuleFilter(input: {
  body: string;
  honeypot?: string | null;
  composeMs?: number | null;
}): FilterResult {
  const flags: FilterFlag[] = [];
  const body = input.body.trim();

  if (input.honeypot && input.honeypot.trim().length > 0) flags.push("honeypot");
  if (typeof input.composeMs === "number" && input.composeMs >= 0 && input.composeMs < MIN_COMPOSE_MS) {
    flags.push("too_fast");
  }

  if (body.length < NOTE_MIN_LENGTH) flags.push("too_short");
  if (body.length > NOTE_MAX_LENGTH) flags.push("too_long");

  const urls = body.match(URL_RE)?.length ?? 0;
  if (urls >= 1) flags.push("url_count");
  if (PHONE_RE.test(body)) flags.push("phone_number");
  if (MESSENGER_RE.test(body)) flags.push("messenger_id");

  const compact = body.replace(/\s/g, "").toLowerCase();
  if (BANNED_KEYWORDS.some((kw) => compact.includes(kw))) flags.push("banned_keyword");
  if (REPEAT_RE.test(body)) flags.push("repeated_chars");
  if (body.length >= 20 && koreanRatio(body) < 0.5) flags.push("low_korean_ratio");

  return { flags, reject: flags.length > 0 };
}
