/**
 * 값 범위에 맞춘 Y축 — 1·2·5 단위 눈금 4~6개.
 * 통계 차트의 domain 을 손으로 고정해 두면 데이터가 바뀔 때 축을 벗어난다(10/3: 귀농 축 [1.0, 1.45] 이
 * 공식 수치 0.84만을, 귀산촌 축 [1000, 3200] 이 4만 가구를 못 담았다). 데이터에서 계산한다.
 */
export function niceAxis(values: readonly number[]): { domain: [number, number]; ticks: number[] } {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const raw = (max - min) / 4 || Math.abs(max) || 1;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((st) => st >= raw) ?? 10 * mag;
  const lo = Math.floor((min - step * 0.2) / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(6)));
  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks };
}
