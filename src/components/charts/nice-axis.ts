/**
 * 값 범위에 맞춘 Y축 — 1·2·5 단위 눈금 4~6개.
 * 통계 차트의 domain 을 손으로 고정해 두면 데이터가 바뀔 때 축을 벗어난다(10/3: 귀농 축 [1.0, 1.45] 이
 * 공식 수치 0.84만을, 귀산촌 축 [1000, 3200] 이 4만 가구를 못 담았다). 데이터에서 계산한다.
 *
 * `zero: true` — 0 에서 시작하는 축(막대·면적처럼 크기를 비교하는 차트). 눈금 간격은 0~최댓값 범위로 정하고,
 * 맨 위 눈금은 최댓값을 덮는 다음 눈금이라 "17.1천" 같은 어중간한 값이 나오지 않는다(10/3 /start 추세 차트).
 */
export function niceAxis(
  values: readonly number[],
  { zero = false }: { zero?: boolean } = {},
): { domain: [number, number]; ticks: number[] } {
  const min = zero ? Math.min(0, ...values) : Math.min(...values);
  const max = Math.max(...values);
  const raw = (max - min) / 4 || Math.abs(max) || 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((st) => st >= raw) ?? 10 * mag;
  const lo = zero ? Math.floor(min / step) * step : Math.floor((min - step * 0.2) / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks };
}

/**
 * 축 눈금 라벨 — 1만 이상은 "1.5만", 1천 이상은 "5천", 그 아래는 눈금 간격(step)의 소수 자릿수로.
 * `niceAxis` 눈금과 함께 쓰면 "17.1천"·"54.7천" 같은 어중간한 값이 나오지 않는다 (10/3 /start 추세 차트).
 */
export function axisTickLabel(value: number, step: number): string {
  const short = (n: number) => Number(n.toFixed(2)).toLocaleString("ko-KR");
  if (Math.abs(value) >= 10_000) return `${short(value / 10_000)}만`;
  if (Math.abs(value) >= 1_000) return `${short(value / 1_000)}천`;
  const digits = step >= 1 ? 0 : Math.min(2, Math.ceil(-Math.log10(step)));
  return value.toFixed(digits);
}
