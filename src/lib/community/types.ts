export const NOTE_TARGET_TYPES = ["region", "crop", "program"] as const;
export type NoteTargetType = (typeof NOTE_TARGET_TYPES)[number];

export const NOTE_STATUSES = ["pending", "approved", "rejected", "hidden"] as const;
export type NoteStatus = (typeof NOTE_STATUSES)[number];

/** 공개 API가 돌려주는 노출용 형태 — ip_hash·UA·필터 내부값은 절대 포함하지 않는다 */
export interface PublicNote {
  id: number;
  body: string;
  nickname: string | null;
  likeCount: number;
  createdAt: string;
}

/** 관리자 큐용 형태 */
export interface AdminNote extends PublicNote {
  targetType: NoteTargetType;
  targetId: string;
  status: NoteStatus;
  rejectReason: string | null;
  filterFlags: string[];
  llmVerdict: { label: string; confidence: number; reason: string; model: string } | null;
  reportCount: number;
}

export function isNoteTargetType(v: unknown): v is NoteTargetType {
  return typeof v === "string" && (NOTE_TARGET_TYPES as readonly string[]).includes(v);
}

export function isNoteStatus(v: unknown): v is NoteStatus {
  return typeof v === "string" && (NOTE_STATUSES as readonly string[]).includes(v);
}

/** target_id 허용 문자: 소문자 슬러그·숫자·하이픈·슬래시(시도/시군구)·SP- 접두 */
const TARGET_ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9\-_/]{0,79}$/;
export function isValidTargetId(v: unknown): v is string {
  return typeof v === "string" && TARGET_ID_RE.test(v);
}
