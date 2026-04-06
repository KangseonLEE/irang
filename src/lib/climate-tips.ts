/**
 * 기후 데이터 → 귀농 관점 해석 (농업 팁)
 *
 * 시/도 상세, 시군구 상세 등 기후 정보를 표시하는 모든 페이지에서 공용.
 * 수치 구간별로 작물 선택·영농 판단에 도움이 되는 한 줄 팁을 반환합니다.
 */

/** 연평균 기온 → 재배 적합 작물군 안내 */
export function getTemperatureTip(avgTemp: number): string {
  if (avgTemp < 10) return "서늘한 기후로 감자·배추·고랭지 채소에 적합";
  if (avgTemp <= 13) return "온대 기후로 사과·포도·벼 등 다양한 작물 재배 가능";
  return "온난한 기후로 감귤·단감 등 과수류까지 재배 가능";
}

/** 연 누적 강수량 → 관개·배수 판단 */
export function getPrecipitationTip(totalPrecipitation: number): string {
  if (totalPrecipitation < 1000) return "강수량이 적어 관개시설 확보를 권장";
  if (totalPrecipitation <= 1500) return "대부분 노지 작물 재배에 충분한 강수량";
  return "강수량이 많아 배수관리와 병해 예방이 중요";
}

/** 연 일조시간 → 광합성·시설재배 판단 */
export function getSunshineTip(totalSunshine: number): string {
  if (totalSunshine < 1800) return "일조가 부족할 수 있어 시설재배를 고려";
  if (totalSunshine <= 2200) return "광합성 조건이 양호하여 대부분 작물에 적합";
  return "일조량이 풍부하여 과수·곡물 품질 향상에 유리";
}
