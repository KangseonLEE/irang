/**
 * 인구밀도 기반 지도 색상(Choropleth) 유틸리티
 * - 로그 스케일: 밀도 차이가 큰 지역 간에도 시각적 구분이 가능
 * - CSS color-mix 기반: 다크모드/테마 변경 시에도 자동 대응
 */

/**
 * 밀도 값을 기반으로 color-mix 문자열을 반환한다.
 *
 * @param density 인구밀도 (명/km²)
 * @param min 전체 중 최소 밀도
 * @param max 전체 중 최대 밀도
 * @returns CSS color-mix 문자열 (12~65% primary)
 */
export function getDensityColor(
  density: number,
  min: number,
  max: number,
): string {
  const logMin = Math.log1p(min);
  const logMax = Math.log1p(max);
  const logDensity = Math.log1p(density);

  const range = logMax - logMin;
  const ratio =
    range > 0
      ? Math.min(1, Math.max(0, (logDensity - logMin) / range))
      : 0.5;

  // 12% (가장 연함) → 65% (가장 진함)
  const intensity = Math.round(12 + ratio * 53);
  return `color-mix(in srgb, var(--primary, #1b6b5a) ${intensity}%, white)`;
}

/**
 * densityMap 에서 min/max를 계산한다.
 */
export function getDensityRange(
  densityMap: Record<string, number>,
): { min: number; max: number } {
  const values = Object.values(densityMap);
  if (values.length === 0) return { min: 0, max: 1 };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
