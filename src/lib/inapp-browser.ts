/**
 * 앱 안 브라우저 판별 — user agent 에 찍히는 앱 표식 (2026-10-20 InAppBanner 에서 분리)
 *
 * 카카오톡·네이버 앱 등은 링크를 앱 안 브라우저로 열고, 유입 주소(referrer)를 비워 보내는 일이 많다.
 * 출처가 비어도 "어느 앱 안에서 열었는지"는 남는다. 배너(InAppBanner)와 어드민 유입 분류가 같은 판별을 쓴다.
 * 메일 앱(지메일·아이폰 메일)은 일반 브라우저 화면을 써서 여기서 가를 수 없다.
 */

export type InAppId = "kakaotalk" | "instagram" | "facebook" | "naver" | "line" | "band" | "daum";

const IN_APP_RULES: Array<{ id: InAppId; name: string; pattern: RegExp }> = [
  { id: "kakaotalk", name: "카카오톡", pattern: /KAKAOTALK/i },
  { id: "instagram", name: "인스타그램", pattern: /Instagram/i },
  { id: "facebook", name: "페이스북", pattern: /FBAV|FBAN/i },
  { id: "naver", name: "네이버", pattern: /NAVER/i },
  { id: "line", name: "라인", pattern: /Line\//i },
  { id: "band", name: "밴드", pattern: /BAND\//i },
  { id: "daum", name: "다음", pattern: /DaumApps/i },
];

export function detectInApp(userAgent: string | null | undefined): { id: InAppId; name: string } | null {
  if (!userAgent) return null;
  const rule = IN_APP_RULES.find((r) => r.pattern.test(userAgent));
  return rule ? { id: rule.id, name: rule.name } : null;
}
