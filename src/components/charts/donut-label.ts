/**
 * 도넛 차트 바깥 라벨 배치 — 클라이언트 차트 모듈 밖에 둔다("use client" 모듈은 컴포넌트만 export, 9/17 박제).
 */

/** 바깥 라벨 글자(14px 700) 반폭·반높이 근사 — 숫자 ≈8.5px, "%" ≈12px, "." ≈4px */
const LABEL_FONT_PX = 14;
function labelHalfWidth(text: string): number {
  let w = 0;
  for (const ch of text) w += ch === "%" ? 12 : ch === "." ? 4 : 8.5;
  return w / 2;
}

/**
 * 바깥 라벨 반지름 — 기본은 링 바깥 38px, 차트 상자(가로 2·cx × 세로 2·cy) 안에 글자가 다 들어오게 줄인다.
 * 768 에서 차트 칸이 300px 로 좁아지면 오른쪽 작은 조각 라벨("6.4%"·"1.4%")이 SVG 경계(overflow hidden)에
 * 8~9px 잘렸다(10/6 QA). 300px 칸에서도 줄인 반지름이 링 + 글자 반폭보다 커서(약 133 vs 126) 링과 겹치지 않는다.
 */
export function donutLabelRadius({
  cx,
  cy,
  outerRadius,
  angle,
  text,
  pad = 4,
}: {
  cx: number;
  cy: number;
  outerRadius: number;
  /** 라디안 — x = cx + r·cos, y = cy + r·sin */
  angle: number;
  text: string;
  pad?: number;
}): number {
  const halfW = labelHalfWidth(text);
  const halfH = LABEL_FONT_PX / 2;
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  let radius = outerRadius + 38;
  if (cos > 1e-6) radius = Math.min(radius, (cx - pad - halfW) / cos);
  if (sin > 1e-6) radius = Math.min(radius, (cy - pad - halfH) / sin);
  return radius;
}

/**
 * 라벨 연결선이 끝나는 반지름 — 라벨을 안쪽으로 당기면 Recharts 기본 선(링 + 20px)이 글자를 뚫고 지나간다(10/6 실측 768 "6.4%").
 * 글자 상자 가장자리 3px 앞에서 멈춘다. 링 + 20 보다 길어지지는 않는다. 남는 길이가 4px 미만이면 0(선 생략).
 */
export function donutLabelLineEnd({
  outerRadius,
  angle,
  text,
  labelRadius,
}: {
  outerRadius: number;
  angle: number;
  text: string;
  labelRadius: number;
}): number {
  const halfW = labelHalfWidth(text);
  const halfH = LABEL_FONT_PX / 2;
  const reach = halfW * Math.abs(Math.cos(angle)) + halfH * Math.abs(Math.sin(angle));
  const end = Math.min(outerRadius + 20, labelRadius - reach - 3);
  return end - outerRadius < 4 ? 0 : end;
}
