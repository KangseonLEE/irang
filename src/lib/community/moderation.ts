/**
 * 커뮤니티 한 줄 의견 — LLM 분류 (3층, 2026-09-02)
 *
 * 룰 필터를 통과한 글만 대상. 자연어로 쓴 분양·리딩방 홍보처럼 룰이 못 잡는 글을 판정한다.
 * - ANTHROPIC_API_KEY 미설정이면 skip (verdict: null) — 사전 승인제라 관리자 검토가 마지막 방어선
 * - 실패(네트워크·rate limit·refusal)도 skip — 분류 장애가 제출 자체를 막지 않는다
 * - 모델: COMMUNITY_MODERATION_MODEL env, 기본 claude-opus-5 (300자 분류라 effort low)
 */

import Anthropic from "@anthropic-ai/sdk";

export type ModerationLabel = "ok" | "ad" | "abuse" | "off_topic" | "unsure";

export interface ModerationVerdict {
  label: ModerationLabel;
  confidence: number;
  reason: string;
  model: string;
}

const DEFAULT_MODEL = "claude-opus-5";
const TIMEOUT_MS = 8_000;

const SYSTEM_PROMPT = `당신은 귀농·농촌 정착 정보 서비스 "이랑"의 커뮤니티 의견 심사 도우미다.
사용자가 지역·작물·지원사업 페이지에 남긴 한 줄 의견을 아래 네 가지 중 하나로 분류한다.

- ad: 광고·홍보·영업 목적(분양·투자·대출·유료 상담 유도·특정 업체/상품 판매·연락 유도·리딩방 등). 자연어로 위장한 홍보도 포함.
- abuse: 욕설·비하·혐오·개인정보 노출·타인 비방.
- off_topic: 귀농·농촌·해당 지역/작물/지원사업과 전혀 무관한 내용, 의미 없는 문자열.
- ok: 귀농·농촌 정착과 관련된 경험·질문·의견·정보. 비판적이거나 부정적인 의견도 ok.

판단이 어려우면 unsure. 반드시 아래 JSON 한 줄만 출력한다(다른 텍스트 금지):
{"label":"ok|ad|abuse|off_topic|unsure","confidence":0.0~1.0,"reason":"20자 이내 한국어"}`;

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ timeout: TIMEOUT_MS, maxRetries: 1 });
  return client;
}

export function isModerationConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function classifyNote(input: {
  body: string;
  targetLabel: string;
}): Promise<ModerationVerdict | null> {
  const anthropic = getClient();
  if (!anthropic) return null;
  const model = process.env.COMMUNITY_MODERATION_MODEL ?? DEFAULT_MODEL;

  try {
    const response = await anthropic.messages.create({
      model,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: `대상: ${input.targetLabel}\n의견: ${input.body}`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return { label: "unsure", confidence: 0, reason: "refusal", model };
    }

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    const json = text.match(/\{[\s\S]*\}/)?.[0];
    if (!json) return { label: "unsure", confidence: 0, reason: "no-json", model };

    const parsed = JSON.parse(json) as Partial<ModerationVerdict>;
    const label: ModerationLabel = (
      ["ok", "ad", "abuse", "off_topic", "unsure"] as const
    ).includes(parsed.label as ModerationLabel)
      ? (parsed.label as ModerationLabel)
      : "unsure";
    const confidence =
      typeof parsed.confidence === "number" && Number.isFinite(parsed.confidence)
        ? Math.min(1, Math.max(0, parsed.confidence))
        : 0;
    return {
      label,
      confidence,
      reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 60) : "",
      model,
    };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      console.warn("[community/moderation] rate limited — skip");
    } else if (err instanceof Anthropic.APIError) {
      console.warn(`[community/moderation] API error ${err.status}:`, err.message);
    } else {
      console.warn("[community/moderation] failed:", err instanceof Error ? err.message : err);
    }
    return null;
  }
}

/** LLM 판정 → 자동 반려 여부. 높은 확신의 광고·욕설만 자동 반려, 나머지는 승인 큐 */
export function shouldAutoReject(verdict: ModerationVerdict | null): boolean {
  if (!verdict) return false;
  return (verdict.label === "ad" || verdict.label === "abuse") && verdict.confidence >= 0.8;
}
