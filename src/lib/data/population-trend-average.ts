/**
 * 인구 추이 차트의 '시·도 평균' — 그 시·도의 우리 시·군·구 단위(SIGUNGUS)만 평균낸다.
 *
 * POPULATION_TREND_SIGUNGU(생성 파일)에는 구가 있는 시의 구 행(수원 31011…·부천 31051…·화성 31241…)과
 * 시 합산 행(31010…)이 함께 들어 있다. 시·도 코드로 시작하는 행을 전부 평균내면 같은 땅이 두 번 들어가 평균이
 * 작아졌다(10/7 독립 QA: 경기 2022 380,820 vs 시·군 31곳 평균 442,511, 충북·충남·전북·경북·경남도 같은 결함).
 * 상세 화면 두 곳(시·군·구·시 아래 구)이 이 함수 하나를 쓴다.
 */
import { POPULATION_TREND_SIGUNGU } from "./population-trend";
import { SIGUNGUS } from "./sigungus";

/** 연도 → 그 시·도 시·군·구 평균 인구(반올림) */
export function sidoSigunguAverageByYear(sidoId: string): Map<number, number> {
  const codes = new Set(SIGUNGUS.filter((s) => s.sidoId === sidoId).map((s) => s.sgisCode));
  const acc = new Map<number, { sum: number; count: number }>();
  for (const p of POPULATION_TREND_SIGUNGU) {
    if (!codes.has(p.sgisCode)) continue;
    const t = acc.get(p.year) ?? { sum: 0, count: 0 };
    t.sum += p.population;
    t.count += 1;
    acc.set(p.year, t);
  }
  const out = new Map<number, number>();
  for (const [year, { sum, count }] of acc) if (count > 0) out.set(year, Math.round(sum / count));
  return out;
}
